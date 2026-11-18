<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Consultation;
use App\Models\Country;
use App\Models\Lga;
use App\Models\Nursing;
use App\Models\PriceList;
use App\Models\State;
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
        $date = trim((string) $request->query('date', ''));
        $search = trim((string) $request->query('q', ''));

        $consultations = Consultation::query()
            ->with(['patient', 'doctor'])
            ->when($this->currentUserIsConsultant($request), fn (Builder $query) => $query->where('doctor_id', $request->user()->getKey()))
            ->when($status !== '', fn (Builder $query) => $query->where('status', $status))
            ->when($doctorId > 0, fn (Builder $query) => $query->where('doctor_id', $doctorId))
            ->when($date !== '', fn (Builder $query) => $query->whereDate('starts_at', $date))
            ->orderByDesc('starts_at')
            ->get()
            ->map(fn (Consultation $consultation) => $this->consultationItem($consultation))
            ->all();

        return Inertia::render('consultations/index', [
            'consultations' => $consultations,
            'filters' => [
                'status' => $status,
                'doctor_id' => $doctorId > 0 ? $doctorId : null,
                'date' => $date,
                'q' => $search,
            ],
            'statusOptions' => collect(self::STATUS_FILTERS)
                ->map(fn (string $label, string $value) => ['value' => $value, 'label' => $label])
                ->values()
                ->all(),
            'doctorOptions' => $this->doctorOptions($request),
            'events' => $this->events(),
            'dailyTimeline' => $this->dailyTimelineEvents($date, $status, $doctorId, $search),
            'sidebar' => $this->sidebar($date, $status, $doctorId, $search),
            'newBillingOptions' => $this->newBillingOptions(),
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
            ->when($this->currentUserIsConsultant($request), fn (Builder $query) => $query->where('doctor_id', $request->user()->getKey()))
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
        $this->authorizeConsultantAccess($request, $consultation);

        $consultation->load(['patient.category', 'doctor']);
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
            'doctorOptions' => $this->doctorOptions($request),
            'nurseOptions' => $this->nurseOptions($request),
            'newBillingOptions' => $this->newBillingOptions(),
        ]);
    }

    /**
     * Show a consultation with all clinical records on a single page.
     */
    public function viewAll(Request $request, string $current_team, Consultation $consultation): Response
    {
        $this->authorizeConsultantAccess($request, $consultation);

        $consultation->load(['patient.category', 'doctor']);

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
        $this->authorizeConsultantAccess($request, $consultation);

        if ($consultation->status !== 'started') {
            $consultation->update(['status' => 'started']);
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
        $this->authorizeConsultantAccess($request, $consultation);

        $consultation->update(['status' => 'completed']);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Consultation completed.']);

        return to_route('consultations.index', $request->user()->currentTeam->slug);
    }

    /**
     * Transfer the consultation to another doctor or nurse.
     */
    public function transfer(Request $request, string $current_team, Consultation $consultation): RedirectResponse
    {
        $this->authorizeConsultantAccess($request, $consultation);

        $transferTo = $request->input('transferTo');
        $doctorIds = User::query()
            ->whereHas('teams', fn ($query) => $query->whereKey($request->user()->currentTeam->getKey()))
            ->pluck('id')
            ->all();
        $nurseIds = $doctorIds; // Same team members can be doctors or nurses

        $rules = [
            'transferTo' => ['required', Rule::in(['doctor', 'nurse'])],
            'doctor_id' => $transferTo === 'doctor' ? ['required', 'integer', Rule::in($doctorIds)] : ['nullable', 'integer'],
            'nurse_id' => $transferTo === 'nurse' ? ['required', 'integer', Rule::in($nurseIds)] : ['nullable', 'integer'],
        ];

        $validated = $request->validate($rules);

        if ($transferTo === 'doctor') {
            $consultation->update([
                'doctor_id' => $validated['doctor_id'],
            ]);

            Inertia::flash('toast', ['type' => 'success', 'message' => 'Patient transferred to doctor.']);
        } else {
            // Transfer from consultation to nurse creates a new nursing record
            $now = now();

            Nursing::create([
                'team_id' => $consultation->team_id,
                'billing_id' => $consultation->billing_id,
                'patient_id' => $consultation->patient_id,
                'nurse_id' => $validated['nurse_id'],
                'starts_at' => $now,
                'ends_at' => $now->copy()->addHour(),
                'status' => 'scheduled',
            ]);

            Inertia::flash('toast', ['type' => 'success', 'message' => 'Patient transferred to nurse.']);
        }

        return to_route('consultations.view', [
            'current_team' => $request->user()->currentTeam->slug,
            'consultation' => $consultation->getKey(),
        ]);
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
        $user = request()->user();

        return Consultation::query()
            ->when($user->hasRole('Consultant'), fn (Builder $query) => $query->where('doctor_id', $user->getKey()))
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
     * Build the daily timeline events for the compact day view.
     *
     * @return array<int, array<string, mixed>>
     */
    private function dailyTimelineEvents(string $date = '', string $status = '', int $doctorId = 0, string $search = ''): array
    {
        $now = CarbonImmutable::now();
        $filterDate = $date !== '' ? $date : $now->toDateString();
        $user = request()->user();
        $isSearching = $search !== '';

        $consultations = Consultation::query()
            ->when($user->hasRole('Consultant'), fn (Builder $query) => $query->where('doctor_id', $user->getKey()))
            ->when($status !== '', fn (Builder $query) => $query->where('status', $status))
            ->when($doctorId > 0, fn (Builder $query) => $query->where('doctor_id', $doctorId))
            ->when(! $isSearching, fn (Builder $query) => $query->whereDate('starts_at', $filterDate))
            ->when($isSearching, function (Builder $query) use ($search): void {
                $query->whereHas('patient', function (Builder $q) use ($search): void {
                    $q->where('slug', 'like', "%{$search}%")
                        ->orWhere('firstName', 'like', "%{$search}%")
                        ->orWhere('lastName', 'like', "%{$search}%")
                        ->orWhere('fullName', 'like', "%{$search}%");
                });
            })
            ->with(['patient.category'])
            ->orderBy('starts_at')
            ->get();

        // Get count of prior consultations per patient to determine new vs revisit
        $patientConsultationCounts = Consultation::query()
            ->select('patient_id', \DB::raw('count(*) as cnt'))
            ->groupBy('patient_id')
            ->pluck('cnt', 'patient_id');

        return $consultations
            ->map(fn (Consultation $consultation) => [
                'id' => $consultation->getKey(),
                'title' => $consultation->patient_id.' - '.($consultation->patient->fullName ?? 'Unknown patient'),
                'patientId' => $consultation->patient_id,
                'startsAt' => $consultation->starts_at?->format('g:i A'),
                'endsAt' => $consultation->ends_at?->format('g:i A') ?? null,
                'status' => $consultation->status,
                'visitType' => ($patientConsultationCounts->get($consultation->patient_id) ?? 0) <= 1 ? 'new' : 'revisit',
                'type' => 'consultation',
                'color' => $consultation->calendarColor(),
                'url' => route('consultations.view', [
                    'current_team' => request()->user()->currentTeam->slug,
                    'consultation' => $consultation->getKey(),
                ]),
                'birthDate' => $consultation->patient?->birthDate?->format('Y-m-d'),
                'age' => $consultation->patient?->age,
                'categoryName' => $consultation->patient?->category?->name,
            ])
            ->values()
            ->all();
    }

    /**
     * Build the sidebar calendar data.
     *
     * @return array<string, mixed>
     */
    private function sidebar(string $selectedDate = '', string $status = '', int $doctorId = 0, string $search = ''): array
    {
        $now = CarbonImmutable::now();
        $monthStart = $now->startOfMonth();
        $monthEnd = $now->endOfMonth();
        $user = request()->user();
        $isSearching = $search !== '';

        $monthConsultations = Consultation::query()
            ->when($user->hasRole('Consultant'), fn (Builder $query) => $query->where('doctor_id', $user->getKey()))
            ->when($status !== '', fn (Builder $query) => $query->where('status', $status))
            ->when($doctorId > 0, fn (Builder $query) => $query->where('doctor_id', $doctorId))
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
                });
            })
            ->get(['id', 'starts_at', 'status']);

        $byDay = $monthConsultations->groupBy(fn (Consultation $consultation) => $consultation->starts_at?->format('Y-m-d') ?: 'unknown');

        $days = [];

        // Calculate padding days: number of days from Monday to the 1st of the month
        // Carbon::dayOfWeek: 0=Sunday, 1=Monday, ..., 6=Saturday
        // Grid starts on Monday, so we need offset from Monday
        $firstDayOfWeek = $monthStart->dayOfWeek; // 0=Sun, 1=Mon, ..., 6=Sat
        $padding = $firstDayOfWeek === 0 ? 6 : $firstDayOfWeek - 1; // Convert to Mon=0, Tue=1, ..., Sun=6

        // Add padding days before the 1st of the month
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
                'scheduled' => $monthConsultations->where('status', 'scheduled')->count(),
                'started' => $monthConsultations->where('status', 'started')->count(),
                'completed' => $monthConsultations->where('status', 'completed')->count(),
            ],
            'upcoming' => Consultation::query()
                ->when($user->hasRole('Consultant'), fn (Builder $query) => $query->where('doctor_id', $user->getKey()))
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
        $user = request()->user();

        return Consultation::query()
            ->when($user->hasRole('Consultant'), fn (Builder $query) => $query->where('doctor_id', $user->getKey()))
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
            'category' => $consultation->patient?->category?->name,
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

    /**
     * Determine if the current user is a consultant who should see only their own appointments.
     */
    private function currentUserIsConsultant(Request $request): bool
    {
        return $request->user()->hasRole('Consultant');
    }

    /**
     * Authorize that a consultant can only access their own consultations.
     */
    private function authorizeConsultantAccess(Request $request, Consultation $consultation): void
    {
        if ($this->currentUserIsConsultant($request) && $consultation->doctor_id !== $request->user()->getKey()) {
            abort(403, 'You do not have permission to access this consultation.');
        }
    }

    /**
     * Get the options for creating a new billing from the consultation page.
     *
     * @return array{categories: array<int, array{id: int, name: string}>, countries: array<int, array{id: int, name: string}>, states: array<int, array{id: int, name: string}>, lgas: array<int, array{id: int, stateId: int, name: string}>, priceLists: array<int, array{id: int, name: string, price: float}>, services: array<int, array{id: int, name: string, price: float}>}
     */
    private function newBillingOptions(): array
    {
        return [
            'categories' => Category::query()
                ->orderBy('name')
                ->get(['id', 'name'])
                ->all(),
            'countries' => Country::query()
                ->orderBy('name')
                ->get(['id', 'name'])
                ->all(),
            'states' => State::query()
                ->orderBy('name')
                ->get(['id', 'name'])
                ->all(),
            'lgas' => Lga::query()
                ->orderBy('name')
                ->get(['id', 'state_id', 'name'])
                ->map(fn ($lga) => [
                    'id' => $lga->getKey(),
                    'stateId' => (int) $lga->state_id,
                    'name' => $lga->name,
                ])
                ->all(),
            'priceLists' => PriceList::query()
                ->where('is_category', false)
                ->whereHas('category', fn (Builder $query) => $query->whereRaw('LOWER(name) = ?', ['billing']))
                ->orderBy('name')
                ->get()
                ->map(fn (PriceList $priceList) => [
                    'id' => $priceList->getKey(),
                    'name' => $priceList->name,
                    'price' => (float) ($priceList->price ?? 0),
                ])
                ->all(),
            'services' => PriceList::query()
                ->whereHas('subCategory', fn (Builder $query) => $query->whereIn('name', [
                    'Treatment',
                    'Nursing Services',
                    'Maternity Services',
                    'Mortuary Services',
                    'Surgery',
                    'Ophthalmic Services',
                    'Dental Services',
                    'Imaging',
                    'Imaging/Radiography',
                ]))
                ->orderBy('name')
                ->get(['id', 'name', 'price'])
                ->all(),
        ];
    }
}
