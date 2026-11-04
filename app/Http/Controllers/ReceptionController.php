<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreAppointmentRequest;
use App\Http\Requests\TransferAppointmentRequest;
use App\Models\Appointment;
use App\Models\Billing;
use App\Models\Consultation;
use App\Models\Nursing;
use App\Models\PriceList;
use App\Models\Team;
use App\Models\User;
use App\Service\ConsultationSlotGrid;
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
     * Show the reception (triage) dashboard.
     */
    public function index(Request $request): Response
    {
        $selectedDate = $request->query('date');
        [$start, $end] = $this->dateRange($selectedDate);

        return Inertia::render('reception/index', [
            'stats' => $this->stats($start, $end),
            'appointments' => $this->appointments($start, $end),
            'nursingAppointments' => $this->nursingAppointments($start, $end),
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
            'dailyTimeline' => $this->dailyTimelineEvents($selectedDate),
            'sidebar' => $this->sidebar($selectedDate),
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
     * Transfer the latest active appointment to another doctor or nurse.
     */
    public function transfer(TransferAppointmentRequest $request): RedirectResponse
    {
        $data = $request->validated();

        $transferTo = $data['transferTo'];
        $patientId = $data['patient_id'];

        // Try to find an active Appointment first
        $appointment = Appointment::query()
            ->where('patient_id', $patientId)
            ->whereIn('status', ['scheduled', 'started', 'completed'])
            ->latest('starts_at')
            ->first();

        if ($appointment instanceof Appointment) {
            if ($transferTo === 'doctor') {
                $appointment->update([
                    'doctor_id' => $data['doctor_id'],
                    'nurse_id' => null,
                ]);

                // Update the linked Consultation so the doctor sees the transferred patient
                Consultation::query()
                    ->where('appointment_id', $appointment->getKey())
                    ->update(['doctor_id' => $data['doctor_id']]);
            } else {
                $appointment->update([
                    'doctor_id' => null,
                    'nurse_id' => $data['nurse_id'],
                ]);
            }

            Inertia::flash('toast', ['type' => 'success', 'message' => 'Patient appointment transferred to '.$transferTo.'.']);

            return to_route('reception.index', $request->user()->currentTeam->slug);
        }

        // Try to find an active Nursing record
        $nursing = Nursing::query()
            ->where('patient_id', $patientId)
            ->whereIn('status', ['scheduled', 'started', 'completed'])
            ->latest('starts_at')
            ->first();

        if ($nursing instanceof Nursing) {
            if ($transferTo === 'nurse') {
                $nursing->update(['nurse_id' => $data['nurse_id']]);
            } else {
                // Transfer from nursing to doctor creates a new appointment and consultation
                $nursing->update(['status' => 'transferred']);

                $appointment = Appointment::create([
                    'team_id' => $nursing->team_id,
                    'billing_id' => $nursing->billing_id,
                    'patient_id' => $nursing->patient_id,
                    'doctor_id' => $data['doctor_id'],
                    'starts_at' => $nursing->starts_at,
                    'ends_at' => $nursing->ends_at,
                    'status' => 'scheduled',
                ]);

                Consultation::create([
                    'team_id' => $nursing->team_id,
                    'billing_id' => $nursing->billing_id,
                    'patient_id' => $nursing->patient_id,
                    'doctor_id' => $data['doctor_id'],
                    'appointment_id' => $appointment->getKey(),
                    'starts_at' => $nursing->starts_at,
                    'ends_at' => $nursing->ends_at,
                    'status' => 'scheduled',
                ]);
            }

            Inertia::flash('toast', ['type' => 'success', 'message' => 'Patient nursing record transferred to '.$transferTo.'.']);

            return to_route('reception.index', $request->user()->currentTeam->slug);
        }

        Inertia::flash('toast', ['type' => 'error', 'message' => 'No active appointment or nursing record found for this patient.']);

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
     * Get the nursing appointments scheduled in the given range.
     *
     * @return array<int, array<string, mixed>>
     */
    private function nursingAppointments(CarbonImmutable $start, CarbonImmutable $end): array
    {
        return Nursing::query()
            ->whereBetween('starts_at', [$start, $end])
            ->with(['patient', 'nurse'])
            ->orderBy('starts_at')
            ->get()
            ->map(fn (Nursing $nursing) => $this->nursingItem($nursing))
            ->all();
    }

    /**
     * Get the billings that are available to be scheduled.
     *
     * @return array<int, array{id: int, label: string, category: ?string}>
     */
    private function billingOptions(): array
    {
        return Billing::query()
            ->availableForScheduling()
            ->with('patient.category')
            ->latest('created_at')
            ->get()
            ->map(fn (Billing $billing) => [
                'id' => $billing->getKey(),
                'label' => $billing->patient_id.' - '.($billing->patient->fullName ?? 'Unknown patient'),
                'category' => $billing->patient->category->name ?? null,
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
     * Serialize a nursing appointment for the dashboard.
     *
     * @return array<string, mixed>
     */
    private function nursingItem(Nursing $nursing): array
    {
        return [
            'id' => $nursing->getKey(),
            'patientId' => $nursing->patient_id,
            'patientName' => $nursing->patient?->fullName,
            'gender' => $nursing->patient?->gender,
            'age' => $nursing->patient?->age,
            'doctorId' => null,
            'doctorName' => null,
            'nurseId' => $nursing->nurse_id,
            'nurseName' => $nursing->nurse?->name,
            'purpose' => $nursing->purpose,
            'status' => $nursing->status,
            'startsAt' => $nursing->starts_at?->toIso8601String(),
            'endsAt' => $nursing->ends_at?->toIso8601String(),
            'color' => '',
            'state' => $nursing->status,
        ];
    }

    /**
     * Build the daily timeline events for the compact day view.
     *
     * @return array<int, array<string, mixed>>
     */
    private function dailyTimelineEvents(?string $selectedDate = null): array
    {
        $date = $selectedDate ? CarbonImmutable::parse($selectedDate) : CarbonImmutable::now();
        $teamSlug = request()->user()->currentTeam->slug;

        $appointmentEvents = Appointment::query()
            ->whereIn('status', ['scheduled', 'started', 'completed'])
            ->whereDate('starts_at', $date->toDateString())
            ->with(['patient.category'])
            ->orderBy('starts_at')
            ->get()
            ->map(fn (Appointment $appointment) => [
                'id' => $appointment->getKey(),
                'title' => $appointment->patient_id.' - '.($appointment->patient->fullName ?? 'Unknown patient'),
                'patientId' => $appointment->patient_id,
                'startsAt' => $appointment->starts_at?->format('g:i A'),
                'endsAt' => $appointment->ends_at?->format('g:i A') ?? null,
                'status' => $appointment->status,
                'type' => 'consultation',
                'color' => $appointment->calendarColor(),
                'url' => route('reception.index', $teamSlug),
                'birthDate' => $appointment->patient?->birthDate?->format('Y-m-d'),
                'age' => $appointment->patient?->age,
                'categoryName' => $appointment->patient?->category?->name,
            ]);

        $nursingEvents = Nursing::query()
            ->whereIn('status', ['scheduled', 'started', 'completed'])
            ->whereDate('starts_at', $date->toDateString())
            ->with(['patient.category'])
            ->orderBy('starts_at')
            ->get()
            ->map(fn (Nursing $nursing) => [
                'id' => 'n-'.$nursing->getKey(),
                'title' => $nursing->patient_id.' - '.($nursing->patient->fullName ?? 'Unknown patient'),
                'patientId' => $nursing->patient_id,
                'startsAt' => $nursing->starts_at?->format('g:i A'),
                'endsAt' => $nursing->ends_at?->format('g:i A') ?? null,
                'status' => $nursing->status,
                'type' => 'anc',
                'color' => $nursing->calendarColor(),
                'url' => route('nursing.records.view', [
                    'current_team' => $teamSlug,
                    'nursing' => $nursing->getKey(),
                ]),
                'birthDate' => $nursing->patient?->birthDate?->format('Y-m-d'),
                'age' => $nursing->patient?->age,
                'categoryName' => $nursing->patient?->category?->name,
            ]);

        return $appointmentEvents->merge($nursingEvents)->sortBy('startsAt')->values()->all();
    }

    /**
     * Build the sidebar calendar data.
     *
     * @return array<string, mixed>
     */
    private function sidebar(?string $selectedDate = null): array
    {
        $now = CarbonImmutable::now();
        $date = $selectedDate ? CarbonImmutable::parse($selectedDate) : $now;
        $monthStart = $date->startOfMonth();
        $monthEnd = $date->endOfMonth();
        $teamSlug = request()->user()->currentTeam->slug;

        $monthAppointments = Appointment::query()
            ->whereBetween('starts_at', [$monthStart, $monthEnd])
            ->get(['id', 'starts_at', 'status']);

        $monthNursing = Nursing::query()
            ->whereBetween('starts_at', [$monthStart, $monthEnd])
            ->get(['id', 'starts_at', 'status']);

        $allRecords = $monthAppointments->merge($monthNursing);
        $byDay = $allRecords->groupBy(fn ($record) => $record->starts_at?->format('Y-m-d') ?: 'unknown');

        $days = [];

        $firstDayOfWeek = $monthStart->dayOfWeek;
        $padding = $firstDayOfWeek === 0 ? 6 : $firstDayOfWeek - 1;

        for ($i = $padding; $i > 0; $i--) {
            $padDate = $monthStart->subDay($i);
            $days[] = [
                'date' => $padDate->format('Y-m-d'),
                'day' => (int) $padDate->format('j'),
                'inMonth' => false,
                'isToday' => false,
                'hasAppointments' => false,
            ];
        }

        for ($dateIter = $monthStart; $dateIter->lessThanOrEqualTo($monthEnd); $dateIter = $dateIter->addDay()) {
            $key = $dateIter->format('Y-m-d');
            $days[] = [
                'date' => $key,
                'day' => (int) $dateIter->format('j'),
                'inMonth' => true,
                'isToday' => $dateIter->isSameDay($date),
                'hasAppointments' => $byDay->has($key),
            ];
        }

        $busyPeriods = Appointment::query()
            ->whereDate('starts_at', $date->toDateString())
            ->get(['starts_at', 'ends_at'])
            ->map(fn (Appointment $appointment) => [
                'start' => $appointment->starts_at,
                'end' => $appointment->ends_at,
            ])
            ->all();

        $nursingBusy = Nursing::query()
            ->whereDate('starts_at', $date->toDateString())
            ->get(['starts_at', 'ends_at'])
            ->map(fn (Nursing $nursing) => [
                'start' => $nursing->starts_at,
                'end' => $nursing->ends_at,
            ])
            ->all();

        $allBusy = array_merge($busyPeriods, $nursingBusy);

        $slotGrid = ConsultationSlotGrid::slots($date, $allBusy, $date);

        return [
            'monthLabel' => $monthStart->format('F Y'),
            'calendarLabel' => $date->format('l, F j, Y'),
            'weekdays' => ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'],
            'days' => $days,
            'selectedDate' => $selectedDate ?? '',
            'timeSlots' => array_map(fn (array $slot) => [
                'label' => $slot['label'],
                'status' => $slot['status'],
            ], $slotGrid),
            'availableCount' => collect($slotGrid)->where('status', 'available')->count(),
            'monthStats' => [
                'scheduled' => $allRecords->where('status', 'scheduled')->count(),
                'started' => $allRecords->where('status', 'started')->count(),
                'completed' => $allRecords->where('status', 'completed')->count(),
            ],
            'upcoming' => Appointment::query()
                ->whereIn('status', ['scheduled', 'started'])
                ->with(['patient', 'doctor'])
                ->where('starts_at', '>=', $date->startOfDay())
                ->orderBy('starts_at')
                ->limit(5)
                ->get()
                ->map(fn (Appointment $appointment) => [
                    'id' => $appointment->getKey(),
                    'name' => $appointment->patient_id.' - '.($appointment->patient->fullName ?? 'Unknown patient'),
                    'meta' => ($appointment->starts_at?->format('D M j, g:i A') ?? '').' — '.($appointment->doctor->name ?? 'Unassigned'),
                    'status' => $appointment->status,
                ])
                ->values()
                ->all(),
        ];
    }

    /**
     * Resolve the start and end of the given date.
     *
     * @return array{0: CarbonImmutable, 1: CarbonImmutable}
     */
    private function dateRange(?string $selectedDate): array
    {
        if ($selectedDate) {
            $date = CarbonImmutable::parse($selectedDate);

            return [$date->startOfDay(), $date->endOfDay()];
        }

        $now = CarbonImmutable::now();

        return [$now->startOfDay(), $now->endOfDay()];
    }
}
