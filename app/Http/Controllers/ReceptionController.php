<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreAppointmentRequest;
use App\Http\Requests\TransferAppointmentRequest;
use App\Models\Appointment;
use App\Models\Billing;
use App\Models\Nursing;
use App\Models\PriceList;
use App\Models\Team;
use App\Models\User;
use App\Service\ScheduleAppointment;
use Carbon\CarbonImmutable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Number;
use Inertia\Inertia;
use Inertia\Response;

class ReceptionController extends Controller
{
    /**
     * The available date range filters and their labels.
     *
     * @var array<string, string>
     */
    private const DATE_FILTERS = [
        'today' => 'Today',
        'yesterday' => 'Yesterday',
        'this_week' => 'This Week',
        'last_week' => 'Last Week',
        'this_month' => 'This Month',
        'last_month' => 'Last Month',
        'this_year' => 'This Year',
        'last_year' => 'Last Year',
    ];

    /**
     * Show the reception (triage) dashboard.
     */
    public function index(Request $request): Response
    {
        $dateFilter = $this->dateFilter($request);
        [$start, $end] = $this->dateRange($dateFilter);

        return Inertia::render('reception/index', [
            'stats' => $this->stats($start, $end),
            'appointments' => $this->appointments($start, $end),
            'filters' => [
                'dateFilter' => $dateFilter,
                'dateFilterLabel' => self::DATE_FILTERS[$dateFilter],
            ],
            'dateFilterOptions' => collect(self::DATE_FILTERS)
                ->map(fn (string $label, string $value) => ['value' => $value, 'label' => $label])
                ->values()
                ->all(),
            'billingOptions' => $this->billingOptions(),
            'doctorOptions' => $this->doctorOptions($request->user()->currentTeam),
            'nurseOptions' => $this->nurseOptions($request->user()->currentTeam),
            'vitalSigns' => PriceList::query()
                ->whereHas('category', fn (Builder $query) => $query->whereRaw('LOWER(name) = ?', ['vital sign']))
                ->orderBy('name')
                ->get(['id', 'name', 'uom'])
                ->map(fn (PriceList $priceList): array => [
                    'id' => $priceList->getKey(),
                    'name' => $priceList->name,
                    'uom' => trim(strip_tags((string) $priceList->uom)),
                ])
                ->all(),
        ]);
    }

    /**
     * Schedule a new consultation appointment.
     */
    public function storeAppointment(StoreAppointmentRequest $request, ScheduleAppointment $scheduleAppointment): RedirectResponse
    {
        $record = $scheduleAppointment->handle($request->validated());

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Appointment scheduled.']);

        return to_route('reception.patient.card', [
            'current_team' => $request->user()->currentTeam->slug,
            'appointment' => $record->getKey(),
            'type' => $record instanceof Appointment ? 'doctor' : 'nurse',
        ]);
    }

    /**
     * Show the patient card for printing after scheduling an appointment.
     */
    public function patientCard(string $current_team, string $appointment, string $type): Response
    {
        $team = auth()->user()->currentTeam;

        if ($type === 'doctor') {
            $record = Appointment::withoutGlobalScope('team')->with(['patient', 'patient.team'])->findOrFail($appointment);
        } else {
            $record = Nursing::withoutGlobalScope('team')->with(['patient', 'patient.team'])->findOrFail($appointment);
        }

        return Inertia::render('reception/patient-card', [
            'team' => [
                'name' => $team->name,
                'address' => $team->address,
                'email' => $team->email,
                'phone' => $team->phone,
            ],
            'patient' => [
                'hospitalNo' => $record->patient->slug,
                'fullName' => $record->patient->fullName,
                'gender' => $record->patient->gender,
            ],
        ]);
    }

    /**
     * Transfer the latest active appointment to another doctor.
     */
    public function transfer(TransferAppointmentRequest $request): RedirectResponse
    {
        $data = $request->validated();

        $appointment = Appointment::query()
            ->where('patient_id', $data['patient_id'])
            ->whereIn('status', ['scheduled', 'started'])
            ->latest('starts_at')
            ->first();

        if ($appointment instanceof Appointment) {
            $appointment->update(['doctor_id' => $data['doctor_id']]);

            Inertia::flash('toast', ['type' => 'success', 'message' => 'Patient appointment transferred.']);
        } else {
            Inertia::flash('toast', ['type' => 'error', 'message' => 'No active appointment found for this patient.']);
        }

        return to_route('reception.index', $request->user()->currentTeam->slug);
    }

    /**
     * Get the reception overview statistics for the given range.
     *
     * @return array{awaitingBooking: string, completedAppointments: string, awaitingDoctor: string, totalAppointments: string}
     */
    private function stats(CarbonImmutable $start, CarbonImmutable $end): array
    {
        $booked = Billing::query()
            ->availableForScheduling()
            ->whereBetween('created_at', [$start, $end])
            ->count();

        $appointments = Appointment::query()
            ->selectRaw("
                COUNT(*) as total,
                SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
                SUM(CASE WHEN status IN ('started', 'scheduled') THEN 1 ELSE 0 END) as remaining
            ")
            ->whereBetween('starts_at', [$start, $end])
            ->first();

        return [
            'awaitingBooking' => Number::format($booked),
            'completedAppointments' => Number::format((int) ($appointments->completed ?? 0)),
            'awaitingDoctor' => Number::format((int) ($appointments->remaining ?? 0)),
            'totalAppointments' => Number::format((int) ($appointments->total ?? 0)),
        ];
    }

    /**
     * Get the appointments scheduled in the given range.
     *
     * @return array<int, array<string, mixed>>
     */
    private function appointments(CarbonImmutable $start, CarbonImmutable $end): array
    {
        return Appointment::query()
            ->whereBetween('starts_at', [$start, $end])
            ->with(['patient', 'doctor', 'nurse'])
            ->orderBy('starts_at')
            ->get()
            ->map(fn (Appointment $appointment) => $this->appointmentItem($appointment))
            ->all();
    }

    /**
     * Get the billings that are available to be scheduled.
     *
     * @return array<int, array{id: int, label: string}>
     */
    private function billingOptions(): array
    {
        return Billing::query()
            ->availableForScheduling()
            ->with('patient')
            ->latest('created_at')
            ->get()
            ->map(fn (Billing $billing) => [
                'id' => $billing->getKey(),
                'label' => $billing->patient_id.' - '.($billing->patient->fullName ?? 'Unknown patient'),
            ])
            ->all();
    }

    /**
     * Get the consultants assigned to the current team.
     *
     * @return array<int, array{id: int, name: string}>
     */
    private function doctorOptions(Team $team): array
    {
        return User::query()
            ->whereHas('teams', fn (Builder $query) => $query->whereKey($team->getKey()))
            ->whereHas('roles', fn (Builder $query) => $query->where('name', 'Consultant'))
            ->whereKeyNot(auth()->id())
            ->orderBy('name')
            ->get()
            ->map(fn (User $user) => ['id' => $user->getKey(), 'name' => $user->name])
            ->all();
    }

    /**
     * Get the nurses assigned to the current team.
     *
     * @return array<int, array{id: int, name: string}>
     */
    private function nurseOptions(Team $team): array
    {
        return User::query()
            ->whereHas('teams', fn (Builder $query) => $query->whereKey($team->getKey()))
            ->whereHas('roles', fn (Builder $query) => $query->where('name', 'Nurse'))
            ->whereKeyNot(auth()->id())
            ->orderBy('name')
            ->get()
            ->map(fn (User $user) => ['id' => $user->getKey(), 'name' => $user->name])
            ->all();
    }

    /**
     * Serialize an appointment for the dashboard.
     *
     * @return array<string, mixed>
     */
    private function appointmentItem(Appointment $appointment): array
    {
        return [
            'id' => $appointment->getKey(),
            'patientId' => $appointment->patient_id,
            'patientName' => $appointment->patient?->fullName,
            'gender' => $appointment->patient?->gender,
            'age' => $appointment->patient?->age,
            'doctorId' => $appointment->doctor_id,
            'doctorName' => $appointment->doctor?->name,
            'nurseId' => $appointment->nurse_id,
            'nurseName' => $appointment->nurse?->name,
            'purpose' => $appointment->purpose,
            'status' => $appointment->status,
            'startsAt' => $appointment->starts_at?->toIso8601String(),
            'endsAt' => $appointment->ends_at?->toIso8601String(),
            'color' => $appointment->calendarColor(),
            'state' => $appointment->calendarState(),
        ];
    }

    /**
     * Get the validated date range filter.
     */
    private function dateFilter(Request $request): string
    {
        $filter = (string) $request->query('dateFilter', 'today');

        return array_key_exists($filter, self::DATE_FILTERS) ? $filter : 'today';
    }

    /**
     * Resolve the start and end of the given date filter.
     *
     * @return array{0: CarbonImmutable, 1: CarbonImmutable}
     */
    private function dateRange(string $filter): array
    {
        $now = CarbonImmutable::now();

        return match ($filter) {
            'yesterday' => [$now->yesterday()->startOfDay(), $now->yesterday()->endOfDay()],
            'this_week' => [$now->startOfWeek(), $now->endOfWeek()],
            'last_week' => [$now->subWeek()->startOfWeek(), $now->subWeek()->endOfWeek()],
            'this_month' => [$now->startOfMonth(), $now->endOfMonth()],
            'last_month' => [$now->subMonth()->startOfMonth(), $now->subMonth()->endOfMonth()],
            'this_year' => [$now->startOfYear(), $now->endOfYear()],
            'last_year' => [$now->subYear()->startOfYear(), $now->subYear()->endOfYear()],
            default => [$now->startOfDay(), $now->endOfDay()],
        };
    }
}
