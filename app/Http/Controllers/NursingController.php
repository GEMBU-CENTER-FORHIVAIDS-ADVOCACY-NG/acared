<?php

namespace App\Http\Controllers;

use App\Models\Billing;
use App\Models\Nursing;
use App\Models\Patient;
use App\Models\User;
use App\Service\ClinicalRecordData;
use App\Service\ConsultationSlotGrid;
use App\Service\DashboardCurrency;
use Carbon\Carbon;
use Carbon\CarbonImmutable;
use Carbon\CarbonInterface;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class NursingController extends Controller
{
    /**
     * The clinical record sections available on a nursing (maternity) visit.
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

    public function __construct(private readonly ClinicalRecordData $clinicalRecords) {}

    /**
     * Show a nursing (maternity) visit and its clinical record subpages.
     */
    public function view(Request $request, string $current_team, Nursing $nursing, string $section = 'overview'): Response
    {
        $nursing->load(['patient', 'nurse', 'billing']);

        $section = in_array($section, self::SECTIONS, true) ? $section : 'overview';
        $perPage = in_array((int) $request->query('perPage', 25), [10, 25, 50, 100], true)
            ? (int) $request->query('perPage', 25)
            : 25;
        $page = max(1, (int) $request->query('page', 1));

        $records = $section !== 'overview'
            ? [$section => $this->clinicalRecords->recordsPaginated($nursing->patient_id, $section, $page, $perPage)]
            : $this->clinicalRecords->records($nursing->patient_id);

        return Inertia::render('nursing/records/view', [
            'section' => $section,
            'nursing' => [
                'id' => $nursing->getKey(),
                'patientId' => $nursing->patient_id,
                'patientName' => $nursing->patient?->fullName,
                'nurseName' => $nursing->nurse?->name,
                'billingId' => $nursing->billing_id,
                'billingStatus' => $nursing->billing?->status,
                'purpose' => $nursing->purpose,
                'status' => $nursing->status,
                'createdAt' => $nursing->created_at?->toIso8601String(),
            ],
            'detail' => [
                'birthDate' => $nursing->patient?->birthDate,
                'gender' => $nursing->patient?->gender,
                'age' => $nursing->patient?->age,
                'nurseName' => $nursing->nurse?->name,
                'billingStatus' => $nursing->billing?->status,
                'purpose' => $nursing->purpose,
                'status' => $nursing->status,
                'createdAt' => $nursing->created_at?->toIso8601String(),
            ],
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
     * Mark the nursing (ANC) appointment as started.
     */
    public function start(Request $request, string $current_team, Nursing $nursing): RedirectResponse
    {
        if ($nursing->status !== 'in_progress') {
            $nursing->update(['status' => 'in_progress']);
            $nursing->billing?->update(['status' => 'started']);
        }

        Inertia::flash('toast', ['type' => 'success', 'message' => 'ANC appointment started.']);

        return to_route('nursing.records.view', [
            'current_team' => $request->user()->currentTeam->slug,
            'nursing' => $nursing->getKey(),
        ]);
    }

    /**
     * Complete the nursing (ANC) appointment.
     */
    public function end(Request $request, string $current_team, Nursing $nursing): RedirectResponse
    {
        $nursing->update(['status' => 'completed']);
        $nursing->billing?->update(['status' => 'completed']);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'ANC appointment completed.']);

        return to_route('nursing.records.index', $request->user()->currentTeam->slug);
    }

    /**
     * The nursing status filters and their labels.
     *
     * @var array<string, string>
     */
    private const STATUS_FILTERS = [
        'scheduled' => 'Scheduled',
        'in_progress' => 'In progress',
        'completed' => 'Completed',
        'cancelled' => 'Cancelled',
    ];

    /**
     * List the ANC (nursing) history for the current team.
     */
    public function history(Request $request): Response
    {
        $team = $request->user()->currentTeam;
        $status = trim((string) $request->query('status', ''));
        $nurseId = $request->integer('nurse_id');
        $perPage = in_array((int) $request->query('perPage', 25), [10, 25, 50, 100], true) ? (int) $request->query('perPage', 25) : 25;

        $records = Nursing::query()->with(['patient', 'nurse'])
            ->when($status !== '', fn (Builder $query) => $query->where('status', $status))
            ->when($nurseId > 0, fn (Builder $query) => $query->where('nurse_id', $nurseId))
            ->orderByDesc('created_at')
            ->paginate($perPage)
            ->withQueryString()
            ->through(fn (Nursing $record) => [
                'id' => $record->id,
                'patientId' => $record->patient_id,
                'patientName' => $record->patient?->fullName,
                'nurseId' => $record->nurse_id,
                'nurseName' => $record->nurse?->name,
                'billingId' => $record->billing_id,
                'billingStatus' => $record->billing?->status,
                'purpose' => $record->purpose,
                'status' => $record->status,
                'statusColor' => $record->statusColor(),
                'createdAt' => $record->created_at?->toIso8601String(),
            ]);

        return Inertia::render('nursing/anc-history/index', [
            'records' => $records,
            'filters' => [
                'status' => $status,
                'nurse_id' => $nurseId > 0 ? $nurseId : null,
            ],
            'statusOptions' => collect(self::STATUS_FILTERS)
                ->map(fn (string $label, string $value) => ['value' => $value, 'label' => $label])
                ->values()
                ->all(),
            'nurseOptions' => $this->nurseOptions($request),
        ]);
    }

    public function index(Request $request): Response
    {
        $team = $request->user()->currentTeam;
        $date = trim((string) $request->query('date', ''));

        return Inertia::render('nursing/records/index', [
            'patients' => Patient::query()
                ->where('team_id', $team->getKey())
                ->orderBy('fullName')
                ->limit(200)
                ->get(['slug', 'fullName']),
            'nurses' => $team->members()->orderBy('name')->limit(200)->get(['users.id', 'name']),
            'billings' => Billing::query()
                ->with('patient')
                ->latest()
                ->limit(200)
                ->get(['id', 'patient_id', 'status'])
                ->map(fn (Billing $billing) => [
                    'id' => $billing->id,
                    'patientId' => $billing->patient_id,
                    'patientName' => $billing->patient?->fullName,
                    'status' => $billing->status,
                ]),
            'dailyTimeline' => $this->dailyTimelineEvents($date),
            'sidebar' => $this->sidebar($date),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $this->validated($request);
        Nursing::create([...$data, 'team_id' => $request->user()->currentTeam->getKey(), 'user_id' => $request->user()->getKey()]);

        return to_route('nursing.records.index', $request->user()->currentTeam->slug);
    }

    public function update(Request $request, string $current_team, Nursing $nursing): RedirectResponse
    {
        $nursing->update($this->validated($request));

        return to_route('nursing.records.index', $request->user()->currentTeam->slug);
    }

    public function destroy(Request $request, string $current_team, Nursing $nursing): RedirectResponse
    {
        $nursing->delete();

        return to_route('nursing.records.index', $request->user()->currentTeam->slug);
    }

    public function bulkDestroy(Request $request): RedirectResponse
    {
        $teamId = $request->user()->currentTeam->getKey();
        $data = $request->validate(['ids' => ['required', 'array', 'min:1'], 'ids.*' => ['integer', Rule::exists('nursings', 'id')->where('team_id', $teamId)]]);
        Nursing::query()->whereIn('id', $data['ids'])->delete();

        return to_route('nursing.records.index', $request->user()->currentTeam->slug);
    }

    /**
     * Build the daily timeline events for the compact day view.
     *
     * @return array<int, array<string, mixed>>
     */
    private function dailyTimelineEvents(string $date = ''): array
    {
        $now = CarbonImmutable::now();
        $filterDate = $date !== '' ? $date : $now->toDateString();

        return Nursing::query()
            ->whereIn('status', ['scheduled', 'in_progress', 'completed'])
            ->whereDate('starts_at', $filterDate)
            ->with('patient')
            ->orderBy('starts_at')
            ->get()
            ->map(fn (Nursing $nursing) => [
                'id' => $nursing->getKey(),
                'title' => $nursing->patient_id.' - '.($nursing->patient->fullName ?? 'Unknown patient'),
                'startsAt' => $nursing->starts_at?->format('g:i A'),
                'endsAt' => $nursing->ends_at?->format('g:i A') ?? null,
                'status' => $nursing->status,
                'color' => $nursing->calendarColor(),
                'url' => route('nursing.records.view', [
                    'current_team' => request()->user()->currentTeam->slug,
                    'nursing' => $nursing->getKey(),
                ]),
            ])
            ->values()
            ->all();
    }

    /**
     * Build the sidebar calendar data.
     *
     * @return array<string, mixed>
     */
    private function sidebar(string $selectedDate = ''): array
    {
        $now = CarbonImmutable::now();
        $monthStart = $now->startOfMonth();
        $monthEnd = $now->endOfMonth();

        $monthNursings = Nursing::query()
            ->when($selectedDate !== '', fn ($query) => $query->whereDate('starts_at', $selectedDate))
            ->when($selectedDate === '', fn ($query) => $query->whereBetween('starts_at', [$monthStart, $monthEnd]))
            ->get(['id', 'starts_at', 'status']);

        $byDay = $monthNursings->groupBy(fn (Nursing $nursing) => $nursing->starts_at?->format('Y-m-d') ?: 'unknown');

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
            'calendarLabel' => $selectedDate !== '' ? (new Carbon($selectedDate))->format('l, F j, Y') : $now->format('l, F j, Y'),
            'weekdays' => ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'],
            'days' => $days,
            'selectedDate' => $selectedDate,
            'timeSlots' => array_map(fn (array $slot) => [
                'label' => $slot['label'],
                'status' => $slot['status'],
            ], $slotGrid),
            'availableCount' => collect($slotGrid)->where('status', 'available')->count(),
            'monthStats' => [
                'scheduled' => $monthNursings->where('status', 'scheduled')->count(),
                'started' => $monthNursings->where('status', 'in_progress')->count(),
                'completed' => $monthNursings->where('status', 'completed')->count(),
            ],
            'upcoming' => Nursing::query()
                ->whereIn('status', ['scheduled', 'in_progress'])
                ->with(['patient', 'nurse'])
                ->where('starts_at', '>=', $now->startOfDay())
                ->orderBy('starts_at')
                ->limit(5)
                ->get()
                ->map(fn (Nursing $nursing) => [
                    'id' => $nursing->getKey(),
                    'name' => $nursing->patient_id.' - '.($nursing->patient->fullName ?? 'Unknown patient'),
                    'meta' => ($nursing->starts_at?->format('D M j, g:i A') ?? '').' — '.($nursing->nurse->name ?? 'Unassigned'),
                    'status' => $nursing->status,
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
        return Nursing::query()
            ->whereDate('starts_at', $date->toDateString())
            ->get(['starts_at', 'ends_at'])
            ->map(fn (Nursing $nursing) => [
                'start' => $nursing->starts_at,
                'end' => $nursing->ends_at,
            ])
            ->all();
    }

    /**
     * Get the nurses available to the current team.
     *
     * @return array<int, array{id: int, name: string}>
     */
    private function nurseOptions(Request $request): array
    {
        $teamId = $request->user()->currentTeam->getKey();

        return User::query()
            ->whereHas('teams', fn (Builder $query) => $query->whereKey($teamId))
            ->whereHas('roles', fn (Builder $query) => $query->where('name', 'Nurse'))
            ->orderBy('name')
            ->get()
            ->map(fn (User $user) => ['id' => $user->getKey(), 'name' => $user->name])
            ->all();
    }

    /** @return array<string, mixed> */
    private function validated(Request $request): array
    {
        $teamId = $request->user()->currentTeam->getKey();
        $data = $request->validate([
            'patient_id' => ['required', 'string', Rule::exists('patients', 'slug')->where('team_id', $teamId)],
            'nurse_id' => ['nullable', 'integer', Rule::exists('team_members', 'user_id')->where('team_id', $teamId)],
            'billing_id' => ['required', 'integer', Rule::exists('billings', 'id')->where('team_id', $teamId)],
            'purpose' => ['nullable', 'string'],
            'status' => ['required', Rule::in(['scheduled', 'in_progress', 'completed', 'cancelled'])],
        ]);
        $billing = Billing::query()->whereKey($data['billing_id'])->firstOrFail();
        abort_unless($billing->patient_id === $data['patient_id'], 422, 'Select a billing record for the chosen patient.');

        return $data;
    }
}
