<?php

namespace App\Http\Controllers;

use App\Models\Appointment;
use App\Models\User;
use App\Service\ClinicalRecordData;
use App\Service\ConsultationSlotGrid;
use App\Service\DashboardCurrency;
use Carbon\CarbonImmutable;
use Carbon\CarbonInterface;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ConsultationController extends Controller
{
    public function __construct(private readonly ClinicalRecordData $clinicalRecords) {}

    /**
     * The consultation status filters and their labels.
     *
     * @var array<string, string>
     */
    private const STATUS_FILTERS = [
        'scheduled' => 'Scheduled',
        'started' => 'Started',
        'completed' => 'Completed',
        'cancelled' => 'Cancelled',
    ];

    /**
     * The clinical record sections available on a consultation.
     *
     * @var array<int, string>
     */
    private const SECTIONS = [
        'overview',
        'vital-signs',
        'complaints',
        'examinations',
        'diagnoses',
        'admissions',
        'treatments',
        'laboratories',
        'prescriptions',
    ];

    /**
     * List the consultations for the current team.
     */
    public function index(Request $request): Response
    {
        $status = $this->statusFilter($request);
        $doctorId = $request->integer('doctor_id');

        $consultations = Appointment::query()
            ->with(['patient', 'doctor'])
            ->when($status !== '', fn (Builder $query) => $query->where('status', $status))
            ->when($doctorId > 0, fn (Builder $query) => $query->where('doctor_id', $doctorId))
            ->orderByDesc('starts_at')
            ->get()
            ->map(fn (Appointment $appointment) => $this->consultationItem($appointment))
            ->values();

        return Inertia::render('consultations/index', [
            'consultations' => $consultations,
            'filters' => [
                'status' => $status,
                'doctor_id' => $doctorId > 0 ? $doctorId : null,
            ],
            'statusOptions' => collect(self::STATUS_FILTERS)
                ->map(fn (string $label, string $value) => ['value' => $value, 'label' => $label])
                ->values()
                ->all(),
            'doctorOptions' => $this->doctorOptions($request),
            'events' => $this->events(),
            'sidebar' => $this->sidebar(),
        ]);
    }

    /**
     * Show a consultation and its clinical record set.
     */
    public function view(Request $request, string $current_team, Appointment $appointment, string $section = 'overview'): Response
    {
        $appointment->load(['patient', 'doctor']);

        return Inertia::render('consultations/view', [
            'section' => $this->normaliseSection($section),
            'consultation' => $this->consultationItem($appointment),
            'detail' => $this->consultationDetail($appointment),
            'records' => $this->clinicalRecords->records($appointment->patient_id),
            'options' => $this->clinicalRecords->options(),
            'currencySymbol' => DashboardCurrency::symbol(),
        ]);
    }

    /**
     * Mark the consultation as started.
     */
    public function start(Request $request, string $current_team, Appointment $appointment): RedirectResponse
    {
        if ($appointment->status !== 'started') {
            $appointment->update(['status' => 'started']);
            $appointment->billing?->update(['status' => 'started']);
        }

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Consultation started.']);

        return to_route('consultations.view', [
            'current_team' => $request->user()->currentTeam->slug,
            'appointment' => $appointment->getKey(),
        ]);
    }

    /**
     * Complete the consultation.
     */
    public function end(Request $request, string $current_team, Appointment $appointment): RedirectResponse
    {
        $appointment->update(['status' => 'completed']);
        $appointment->billing?->update(['status' => 'completed']);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Consultation completed.']);

        return to_route('consultations.index', $request->user()->currentTeam->slug);
    }

    /**
     * Resolve the valid sub-navigation section.
     */
    private function normaliseSection(string $section): string
    {
        return in_array($section, self::SECTIONS, true) ? $section : 'overview';
    }

    /**
     * Build the calendar events (scheduled and started consultations).
     *
     * @return array<int, array<string, mixed>>
     */
    private function events(): array
    {
        return Appointment::query()
            ->whereIn('status', ['scheduled', 'started'])
            ->with('patient')
            ->orderBy('starts_at')
            ->get()
            ->map(fn (Appointment $appointment) => [
                'id' => $appointment->getKey(),
                'title' => $appointment->patient_id.' - '.($appointment->patient->fullName ?? 'Unknown patient'),
                'start' => $appointment->starts_at?->toIso8601String(),
                'end' => $appointment->ends_at?->toIso8601String(),
                'color' => $appointment->calendarColor(),
                'url' => route('consultations.view', [
                    'current_team' => request()->user()->currentTeam->slug,
                    'appointment' => $appointment->getKey(),
                ]),
                'meta' => trim(implode(' | ', array_filter([
                    $appointment->patient?->gender,
                    $appointment->patient?->age,
                ]))),
            ])
            ->values()
            ->all();
    }

    /**
     * Build the sidebar calendar data.
     *
     * @return array<string, mixed>
     */
    private function sidebar(): array
    {
        $now = CarbonImmutable::now();
        $monthStart = $now->startOfMonth();
        $monthEnd = $now->endOfMonth();

        $monthAppointments = Appointment::query()
            ->whereBetween('starts_at', [$monthStart, $monthEnd])
            ->get(['id', 'starts_at', 'status']);

        $byDay = $monthAppointments->groupBy(fn (Appointment $appointment) => $appointment->starts_at?->format('Y-m-d') ?: 'unknown');

        $days = [];
        for ($date = $monthStart; $date->lessThanOrEqualTo($monthEnd); $date = $date->addDay()) {
            $key = $date->format('Y-m-d');
            $days[] = [
                'date' => $key,
                'day' => (int) $date->format('j'),
                'inMonth' => true,
                'isToday' => $date->isToday(),
                'hasAppointments' => $byDay->has($key),
            ];
        }

        $slotGrid = ConsultationSlotGrid::slots($now, $this->busyPeriods($now), $now);

        return [
            'monthLabel' => $monthStart->format('F Y'),
            'weekdays' => ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'],
            'days' => $days,
            'timeSlots' => array_map(fn (array $slot) => [
                'label' => $slot['label'],
                'status' => $slot['status'],
            ], $slotGrid),
            'availableCount' => collect($slotGrid)->where('status', 'available')->count(),
            'monthStats' => [
                'scheduled' => $monthAppointments->where('status', 'scheduled')->count(),
                'started' => $monthAppointments->where('status', 'started')->count(),
                'completed' => $monthAppointments->where('status', 'completed')->count(),
            ],
            'upcoming' => Appointment::query()
                ->whereIn('status', ['scheduled', 'started'])
                ->with(['patient', 'doctor'])
                ->where('starts_at', '>=', $now->startOfDay())
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
     * Get the busy periods for the slot grid on the given day.
     *
     * @return array<int, array{start: CarbonInterface, end: CarbonInterface|null}>
     */
    private function busyPeriods(CarbonImmutable $date): array
    {
        return Appointment::query()
            ->whereDate('starts_at', $date->toDateString())
            ->get(['starts_at', 'ends_at'])
            ->map(fn (Appointment $appointment) => [
                'start' => $appointment->starts_at,
                'end' => $appointment->ends_at,
            ])
            ->all();
    }

    /**
     * Get the doctors available to the current team.
     *
     * @return array<int, array{id: int, name: string}>
     */
    private function doctorOptions(Request $request): array
    {
        $teamId = $request->user()->currentTeam->getKey();

        return User::query()
            ->whereHas('teams', fn (Builder $query) => $query->whereKey($teamId))
            ->orderBy('name')
            ->get()
            ->map(fn (User $user) => ['id' => $user->getKey(), 'name' => $user->name])
            ->all();
    }

    /**
     * Serialize a consultation for the table.
     *
     * @return array<string, mixed>
     */
    private function consultationItem(Appointment $appointment): array
    {
        return [
            'id' => $appointment->getKey(),
            'patientId' => $appointment->patient_id,
            'patientName' => $appointment->patient?->fullName,
            'doctorId' => $appointment->doctor_id,
            'doctorName' => $appointment->doctor?->name,
            'purpose' => $appointment->purpose,
            'status' => $appointment->status,
            'startsAt' => $appointment->starts_at?->toIso8601String(),
            'endsAt' => $appointment->ends_at?->toIso8601String(),
            'statusColor' => $appointment->statusColor(),
        ];
    }

    /**
     * Serialize the consultation detail (infolist).
     *
     * @return array<string, mixed>
     */
    private function consultationDetail(Appointment $appointment): array
    {
        return [
            'birthDate' => $appointment->patient?->birthDate,
            'gender' => $appointment->patient?->gender,
            'age' => $appointment->patient?->age,
            'startsAt' => $appointment->starts_at?->toIso8601String(),
            'endsAt' => $appointment->ends_at?->toIso8601String(),
            'doctorName' => $appointment->doctor?->name,
            'purpose' => $appointment->purpose,
            'status' => $appointment->status,
        ];
    }

    /**
     * Get the validated status filter.
     */
    private function statusFilter(Request $request): string
    {
        $status = (string) $request->query('status', '');

        return array_key_exists($status, self::STATUS_FILTERS) ? $status : '';
    }
}
