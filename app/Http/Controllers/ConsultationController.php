<?php

namespace App\Http\Controllers;

use App\Models\Consultation;
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

        return Inertia::render('consultations/index', [
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
     * List the consultation history for the current team.
     */
    public function history(Request $request): Response
    {
        $status = $this->statusFilter($request);
        $doctorId = $request->integer('doctor_id');
        $perPage = (int) $request->query('perPage', 25);

        if (! in_array($perPage, [10, 25, 50, 100], true)) {
            $perPage = 25;
        }

        $consultations = Consultation::query()
            ->with(['patient', 'doctor'])
            ->when($status !== '', fn (Builder $query) => $query->where('status', $status))
            ->when($doctorId > 0, fn (Builder $query) => $query->where('doctor_id', $doctorId))
            ->orderByDesc('starts_at')
            ->paginate($perPage)
            ->withQueryString()
            ->through(fn (Consultation $consultation) => $this->consultationItem($consultation));

        return Inertia::render('consultations/appointment-history/index', [
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
        ]);
    }

    /**
     * Show a consultation and its clinical record set.
     */
    public function view(Request $request, string $current_team, Consultation $consultation, string $section = 'overview'): Response
    {
        $consultation->load(['patient', 'doctor']);

        $section = $this->normaliseSection($section);
        $perPage = in_array((int) $request->query('perPage', 25), [10, 25, 50, 100], true)
            ? (int) $request->query('perPage', 25)
            : 25;
        $page = max(1, (int) $request->query('page', 1));

        $records = $section !== 'overview'
            ? [$section => $this->clinicalRecords->recordsPaginated($consultation->patient_id, $section, $page, $perPage)]
            : $this->clinicalRecords->records($consultation->patient_id);

        return Inertia::render('consultations/view', [
            'section' => $section,
            'consultation' => $this->consultationItem($consultation),
            'detail' => $this->consultationDetail($consultation),
            'records' => $records,
            'options' => $this->clinicalRecords->options(),
            'currencySymbol' => DashboardCurrency::symbol(),
            'pagination' => $section !== 'overview'
                ? [
                    'currentPage' => $page,
                    'perPage' => $perPage,
                ]
                : null,
        ]);
    }

    /**
     * Show a consultation with all clinical records on a single page.
     */
    public function viewAll(string $current_team, Consultation $consultation): Response
    {
        $consultation->load(['patient', 'doctor']);

        return Inertia::render('consultations/view-all', [
            'consultation' => $this->consultationItem($consultation),
            'detail' => $this->consultationDetail($consultation),
            'records' => $this->clinicalRecords->records($consultation->patient_id),
            'options' => $this->clinicalRecords->options(),
            'currencySymbol' => DashboardCurrency::symbol(),
        ]);
    }

    /**
     * Mark the consultation as started.
     */
    public function start(Request $request, string $current_team, Consultation $consultation): RedirectResponse
    {
        if ($consultation->status !== 'started') {
            $consultation->update(['status' => 'started']);
            $consultation->billing?->update(['status' => 'started']);
        }

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Consultation started.']);

        return to_route('consultations.view', [
            'current_team' => $request->user()->currentTeam->slug,
            'consultation' => $consultation->getKey(),
        ]);
    }

    /**
     * Complete the consultation.
     */
    public function end(Request $request, string $current_team, Consultation $consultation): RedirectResponse
    {
        $consultation->update(['status' => 'completed']);
        $consultation->billing?->update(['status' => 'completed']);

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
        return Consultation::query()
            ->whereIn('status', ['scheduled', 'started'])
            ->with('patient')
            ->orderBy('starts_at')
            ->get()
            ->map(fn (Consultation $consultation) => [
                'id' => $consultation->getKey(),
                'title' => $consultation->patient_id.' - '.($consultation->patient->fullName ?? 'Unknown patient'),
                'start' => $consultation->starts_at?->toIso8601String(),
                'end' => $consultation->ends_at?->toIso8601String(),
                'color' => $consultation->calendarColor(),
                'url' => route('consultations.view', [
                    'current_team' => request()->user()->currentTeam->slug,
                    'consultation' => $consultation->getKey(),
                ]),
                'meta' => trim(implode(' | ', array_filter([
                    $consultation->patient?->gender,
                    $consultation->patient?->age,
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

        $monthConsultations = Consultation::query()
            ->whereBetween('starts_at', [$monthStart, $monthEnd])
            ->get(['id', 'starts_at', 'status']);

        $byDay = $monthConsultations->groupBy(fn (Consultation $consultation) => $consultation->starts_at?->format('Y-m-d') ?: 'unknown');

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
                'scheduled' => $monthConsultations->where('status', 'scheduled')->count(),
                'started' => $monthConsultations->where('status', 'started')->count(),
                'completed' => $monthConsultations->where('status', 'completed')->count(),
            ],
            'upcoming' => Consultation::query()
                ->whereIn('status', ['scheduled', 'started'])
                ->with(['patient', 'doctor'])
                ->where('starts_at', '>=', $now->startOfDay())
                ->orderBy('starts_at')
                ->limit(5)
                ->get()
                ->map(fn (Consultation $consultation) => [
                    'id' => $consultation->getKey(),
                    'name' => $consultation->patient_id.' - '.($consultation->patient->fullName ?? 'Unknown patient'),
                    'meta' => ($consultation->starts_at?->format('D M j, g:i A') ?? '').' — '.($consultation->doctor->name ?? 'Unassigned'),
                    'status' => $consultation->status,
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
        return Consultation::query()
            ->whereDate('starts_at', $date->toDateString())
            ->get(['starts_at', 'ends_at'])
            ->map(fn (Consultation $consultation) => [
                'start' => $consultation->starts_at,
                'end' => $consultation->ends_at,
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
            ->whereHas('roles', fn (Builder $query) => $query->where('name', 'Consultant'))
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
    private function consultationItem(Consultation $consultation): array
    {
        return [
            'id' => $consultation->getKey(),
            'patientId' => $consultation->patient_id,
            'patientName' => $consultation->patient?->fullName,
            'doctorId' => $consultation->doctor_id,
            'doctorName' => $consultation->doctor?->name,
            'purpose' => $consultation->purpose,
            'status' => $consultation->status,
            'startsAt' => $consultation->starts_at?->toIso8601String(),
            'endsAt' => $consultation->ends_at?->toIso8601String(),
            'statusColor' => $consultation->statusColor(),
        ];
    }

    /**
     * Serialize the consultation detail (infolist).
     *
     * @return array<string, mixed>
     */
    private function consultationDetail(Consultation $consultation): array
    {
        return [
            'birthDate' => $consultation->patient?->birthDate,
            'gender' => $consultation->patient?->gender,
            'age' => $consultation->patient?->age,
            'startsAt' => $consultation->starts_at?->toIso8601String(),
            'endsAt' => $consultation->ends_at?->toIso8601String(),
            'doctorName' => $consultation->doctor?->name,
            'purpose' => $consultation->purpose,
            'status' => $consultation->status,
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
