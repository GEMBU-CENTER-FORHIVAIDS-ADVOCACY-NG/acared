<?php

namespace App\Http\Controllers;

use App\Models\Appointment;
use App\Models\Billing;
use App\Models\Consultation;
use App\Models\History;
use App\Models\Nursing;
use App\Models\Patient;
use App\Models\PresentPregnancy;
use App\Models\PreviousPregnancy;
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
        'history',
        'present-pregnancy',
        'previous-pregnancy',
    ];

    public function __construct(private readonly ClinicalRecordData $clinicalRecords) {}

    /**
     * Show a nursing (maternity) visit and its clinical record subpages.
     */
    public function view(Request $request, string $current_team, Nursing $nursing, string $section = 'overview'): Response
    {
        $this->authorizeNurseAccess($request, $nursing);

        $nursing->load(['patient.category', 'nurse', 'billing']);

        $section = in_array($section, self::SECTIONS, true) ? $section : 'overview';
        $perPage = in_array((int) $request->query('perPage', 25), [10, 25, 50, 100], true)
            ? (int) $request->query('perPage', 25)
            : 25;
        $page = max(1, (int) $request->query('page', 1));

        if ($section === 'history') {
            $histories = History::query()
                ->where('patient_id', $nursing->patient_id)
                ->with('nurse')
                ->latest()
                ->paginate(10)
                ->withQueryString()
                ->through(fn (History $history): array => [
                    'id' => $history->getKey(),
                    'familyHistory' => $history->family_history ?? [],
                    'socialHistory' => $history->social_history,
                    'surgicalHistory' => $history->surgical_history ?? [],
                    'nurseName' => $history->nurse?->name,
                    'canEdit' => (int) $history->nurse_id === (int) $request->user()->getKey(),
                    'createdAt' => $history->created_at?->toIso8601String(),
                ]);

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
                    'category' => $nursing->patient?->category?->name,
                    'nurseName' => $nursing->nurse?->name,
                    'billingStatus' => $nursing->billing?->status,
                    'purpose' => $nursing->purpose,
                    'status' => $nursing->status,
                    'createdAt' => $nursing->created_at?->toIso8601String(),
                ],
                'records' => [],
                'histories' => $histories,
                'presentPregnancies' => [],
                'previousPregnancies' => [],
                'options' => [],
                'currencySymbol' => DashboardCurrency::symbol(),
                'pagination' => null,
                'doctorOptions' => $this->doctorOptions($request),
                'nurseOptions' => $this->nurseOptions($request),
            ]);
        }

        if ($section === 'present-pregnancy') {
            $presentPregnancies = PresentPregnancy::query()
                ->where('patient_id', $nursing->patient_id)
                ->with('nurse')
                ->latest('date')
                ->paginate(10)
                ->withQueryString()
                ->through(fn (PresentPregnancy $record): array => [
                    'id' => $record->getKey(),
                    'date' => $record->date?->toIso8601String(),
                    'bp' => $record->bp,
                    'gA' => $record->g_a,
                    'weight' => $record->weight,
                    'lmp' => $record->lmp?->toIso8601String(),
                    'edd' => $record->edd?->toIso8601String(),
                    'sfh' => $record->sfh,
                    'lie' => $record->lie,
                    'position' => $record->position,
                    'fhr' => $record->fhr,
                    'hb' => $record->hb,
                    'oedema' => $record->oedema,
                    'nurseName' => $record->nurse?->name,
                    'canEdit' => (int) $record->nurse_id === (int) $request->user()->getKey(),
                    'createdAt' => $record->created_at?->toIso8601String(),
                ]);

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
                    'category' => $nursing->patient?->category?->name,
                    'nurseName' => $nursing->nurse?->name,
                    'billingStatus' => $nursing->billing?->status,
                    'purpose' => $nursing->purpose,
                    'status' => $nursing->status,
                    'createdAt' => $nursing->created_at?->toIso8601String(),
                ],
                'records' => [],
                'histories' => [],
                'presentPregnancies' => $presentPregnancies,
                'previousPregnancies' => [],
                'options' => [],
                'currencySymbol' => DashboardCurrency::symbol(),
                'pagination' => null,
                'doctorOptions' => $this->doctorOptions($request),
                'nurseOptions' => $this->nurseOptions($request),
            ]);
        }

        if ($section === 'previous-pregnancy') {
            $previousPregnancies = PreviousPregnancy::query()
                ->where('patient_id', $nursing->patient_id)
                ->with('nurse')
                ->latest('year')
                ->paginate(10)
                ->withQueryString()
                ->through(fn (PreviousPregnancy $record): array => [
                    'id' => $record->getKey(),
                    'year' => $record->year,
                    'ga' => $record->ga,
                    'durationOfPregnancy' => $record->duration_of_pregnancy,
                    'durationOfLabour' => $record->duration_of_labour,
                    'abortion' => $record->abortion,
                    'iufd' => $record->iufd,
                    'aph' => $record->aph,
                    'pph' => $record->pph,
                    'sex' => $record->sex,
                    'weight' => $record->weight,
                    'modeOfDelivery' => $record->mode_of_delivery,
                    'ageLife' => $record->age_life,
                    'ageDeath' => $record->age_death,
                    'nurseName' => $record->nurse?->name,
                    'canEdit' => (int) $record->nurse_id === (int) $request->user()->getKey(),
                    'createdAt' => $record->created_at?->toIso8601String(),
                ]);

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
                    'category' => $nursing->patient?->category?->name,
                    'nurseName' => $nursing->nurse?->name,
                    'billingStatus' => $nursing->billing?->status,
                    'purpose' => $nursing->purpose,
                    'status' => $nursing->status,
                    'createdAt' => $nursing->created_at?->toIso8601String(),
                ],
                'records' => [],
                'histories' => [],
                'presentPregnancies' => [],
                'previousPregnancies' => $previousPregnancies,
                'options' => [],
                'currencySymbol' => DashboardCurrency::symbol(),
                'pagination' => null,
                'doctorOptions' => $this->doctorOptions($request),
                'nurseOptions' => $this->nurseOptions($request),
            ]);
        }

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
            'histories' => [],
            'presentPregnancies' => [],
            'previousPregnancies' => [],
            'options' => $this->clinicalRecords->options(),
            'currencySymbol' => DashboardCurrency::symbol(),
            'pagination' => $section !== 'overview'
                ? [
                    'currentPage' => $page,
                    'perPage' => $perPage,
                ]
                : null,
            'doctorOptions' => $this->doctorOptions($request),
            'nurseOptions' => $this->nurseOptions($request),
        ]);
    }

    /**
     * Mark the nursing (ANC) appointment as started.
     */
    public function start(Request $request, string $current_team, Nursing $nursing): RedirectResponse
    {
        $this->authorizeNurseAccess($request, $nursing);

        if ($nursing->status !== 'in_progress') {
            $nursing->update(['status' => 'in_progress']);
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
        $this->authorizeNurseAccess($request, $nursing);

        $nursing->update(['status' => 'completed']);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'ANC appointment completed.']);

        return to_route('nursing.records.index', $request->user()->currentTeam->slug);
    }

    /**
     * Transfer the nursing record to another nurse or doctor.
     */
    public function transfer(Request $request, string $current_team, Nursing $nursing): RedirectResponse
    {
        $this->authorizeNurseAccess($request, $nursing);

        $transferTo = $request->input('transferTo');
        $staffIds = User::query()
            ->whereHas('teams', fn ($query) => $query->whereKey($request->user()->currentTeam->getKey()))
            ->pluck('id')
            ->all();

        $rules = [
            'transferTo' => ['required', Rule::in(['doctor', 'nurse'])],
            'doctor_id' => $transferTo === 'doctor' ? ['required', 'integer', Rule::in($staffIds)] : ['nullable', 'integer'],
            'nurse_id' => $transferTo === 'nurse' ? ['required', 'integer', Rule::in($staffIds)] : ['nullable', 'integer'],
        ];

        $validated = $request->validate($rules);

        if ($transferTo === 'nurse') {
            $nursing->update([
                'nurse_id' => $validated['nurse_id'],
            ]);

            Inertia::flash('toast', ['type' => 'success', 'message' => 'Patient transferred to nurse.']);
        } else {
            // Transfer from nursing to doctor creates a new appointment and consultation
            $now = now();

            $appointment = Appointment::create([
                'team_id' => $nursing->team_id,
                'billing_id' => $nursing->billing_id,
                'patient_id' => $nursing->patient_id,
                'doctor_id' => $validated['doctor_id'],
                'starts_at' => $now,
                'ends_at' => $now->copy()->addHour(),
                'status' => 'scheduled',
            ]);

            Consultation::create([
                'team_id' => $nursing->team_id,
                'billing_id' => $nursing->billing_id,
                'patient_id' => $nursing->patient_id,
                'doctor_id' => $validated['doctor_id'],
                'appointment_id' => $appointment->getKey(),
                'starts_at' => $now,
                'ends_at' => $now->copy()->addHour(),
                'status' => 'scheduled',
            ]);

            Inertia::flash('toast', ['type' => 'success', 'message' => 'Patient transferred to doctor.']);
        }

        return to_route('nursing.records.view', [
            'current_team' => $request->user()->currentTeam->slug,
            'nursing' => $nursing->getKey(),
        ]);
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
            ->when($this->currentUserIsNurse($request), fn (Builder $query) => $query->where('nurse_id', $request->user()->getKey()))
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
        $search = trim((string) $request->query('q', ''));
        $user = $request->user();

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
            'dailyTimeline' => $this->dailyTimelineEvents($date, $search),
            'sidebar' => $this->sidebar($date, $search),
            'currentUserIsNurse' => $user->hasRole('Nurse'),
            'filters' => ['q' => $search],
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
    private function dailyTimelineEvents(string $date = '', string $search = ''): array
    {
        $now = CarbonImmutable::now();
        $filterDate = $date !== '' ? $date : $now->toDateString();
        $user = request()->user();
        $isSearching = $search !== '';

        $nursings = Nursing::query()
            ->when($user->hasRole('Nurse'), fn (Builder $query) => $query->where('nurse_id', $user->getKey()))
            ->whereIn('status', ['scheduled', 'in_progress', 'completed'])
            ->when(! $isSearching, fn (Builder $query) => $query->whereDate('starts_at', $filterDate))
            ->when($isSearching, function (Builder $query) use ($search): void {
                $query->whereHas('patient', function (Builder $q) use ($search): void {
                    $q->where('slug', 'like', "%{$search}%")
                        ->orWhere('firstName', 'like', "%{$search}%")
                        ->orWhere('lastName', 'like', "%{$search}%")
                        ->orWhere('fullName', 'like', "%{$search}%");
                })->orWhere('purpose', 'like', "%{$search}%");
            })
            ->with(['patient.category'])
            ->orderBy('starts_at')
            ->get();

        // Get count of prior nursings per patient to determine new vs revisit
        $patientNursingCounts = Nursing::query()
            ->select('patient_id', \DB::raw('count(*) as cnt'))
            ->groupBy('patient_id')
            ->pluck('cnt', 'patient_id');

        return $nursings
            ->map(fn (Nursing $nursing) => [
                'id' => $nursing->getKey(),
                'title' => $nursing->patient_id.' - '.($nursing->patient->fullName ?? 'Unknown patient'),
                'patientId' => $nursing->patient_id,
                'startsAt' => $nursing->starts_at?->format('g:i A'),
                'endsAt' => $nursing->ends_at?->format('g:i A') ?? null,
                'status' => $nursing->status,
                'visitType' => ($patientNursingCounts->get($nursing->patient_id) ?? 0) <= 1 ? 'new' : 'revisit',
                'type' => 'anc',
                'color' => $nursing->calendarColor(),
                'url' => route('nursing.records.view', [
                    'current_team' => request()->user()->currentTeam->slug,
                    'nursing' => $nursing->getKey(),
                ]),
                'birthDate' => $nursing->patient?->birthDate?->format('Y-m-d'),
                'age' => $nursing->patient?->age,
                'categoryName' => $nursing->patient?->category?->name,
            ])
            ->values()
            ->all();
    }

    /**
     * Build the sidebar calendar data.
     *
     * @return array<string, mixed>
     */
    private function sidebar(string $selectedDate = '', string $search = ''): array
    {
        $now = CarbonImmutable::now();
        $monthStart = $now->startOfMonth();
        $monthEnd = $now->endOfMonth();
        $user = request()->user();
        $isSearching = $search !== '';

        $monthNursings = Nursing::query()
            ->when($user->hasRole('Nurse'), fn (Builder $query) => $query->where('nurse_id', $user->getKey()))
            ->when(! $isSearching, function (Builder $query) use ($selectedDate, $monthStart, $monthEnd): void {
                $query->when($selectedDate !== '', fn (Builder $q) => $q->whereDate('starts_at', $selectedDate))
                    ->when($selectedDate === '', fn (Builder $q) => $q->whereBetween('starts_at', [$monthStart, $monthEnd]));
            })
            ->when($isSearching, function (Builder $query) use ($search): void {
                $query->whereHas('patient', function (Builder $q) use ($search): void {
                    $q->where('slug', 'like', "%{$search}%")
                        ->orWhere('firstName', 'like', "%{$search}%")
                        ->orWhere('lastName', 'like', "%{$search}%")
                        ->orWhere('fullName', 'like', "%{$search}%");
                })->orWhere('purpose', 'like', "%{$search}%");
            })
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
                ->when($user->hasRole('Nurse'), fn (Builder $query) => $query->where('nurse_id', $user->getKey()))
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
        $user = request()->user();

        return Nursing::query()
            ->when($user->hasRole('Nurse'), fn (Builder $query) => $query->where('nurse_id', $user->getKey()))
            ->whereDate('starts_at', $date->toDateString())
            ->get(['starts_at', 'ends_at'])
            ->map(fn (Nursing $nursing) => [
                'start' => $nursing->starts_at,
                'end' => $nursing->ends_at,
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

    /**
     * Determine if the current user is a nurse who should see only their own appointments.
     */
    private function currentUserIsNurse(Request $request): bool
    {
        return $request->user()->hasRole('Nurse');
    }

    /**
     * Authorize that a nurse can only access their own nursing records.
     */
    private function authorizeNurseAccess(Request $request, Nursing $nursing): void
    {
        if ($this->currentUserIsNurse($request) && $nursing->nurse_id !== $request->user()->getKey()) {
            abort(403, 'You do not have permission to access this nursing record.');
        }
    }
}
