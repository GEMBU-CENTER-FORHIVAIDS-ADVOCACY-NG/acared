<?php

namespace App\Http\Controllers;

use App\Models\Admission;
use App\Models\Patient;
use App\Models\PriceList;
use App\Models\User;
use App\Models\Ward;
use App\Service\ClinicalRecordData;
use App\Service\DashboardCurrency;
use Carbon\CarbonImmutable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class WardRoundController extends Controller
{
    public function __construct(private readonly ClinicalRecordData $clinicalRecords) {}

    /**
     * The admission status filters and their labels.
     *
     * @var array<string, string>
     */
    private const STATUS_FILTERS = [
        'pending' => 'Pending',
        'admitted' => 'Admitted',
        'discharged' => 'Discharged',
    ];

    /**
     * The clinical record sections available on a ward round.
     *
     * @var array<int, string>
     */
    private const SECTIONS = [
        'overview',
        'vital-signs',
        'complaints',
        'examinations',
        'diagnoses',
        'treatments',
        'laboratories',
        'prescriptions',
    ];

    /**
     * Show an admissions overview dashboard.
     */
    public function admissionsIndex(Request $request): Response
    {
        $filters = $request->validate([
            'date_filter' => ['nullable', Rule::in(['today', 'yesterday', 'this_week', 'last_week', 'this_month', 'last_month', 'this_year', 'last_year'])],
        ]);
        $period = $filters['date_filter'] ?? 'today';
        [$start, $end] = $this->admissionRange($period);
        $counts = Admission::query()
            ->selectRaw("COUNT(*) as total, SUM(CASE WHEN status = 'discharged' THEN 1 ELSE 0 END) as discharged, SUM(CASE WHEN status = 'admitted' THEN 1 ELSE 0 END) as admitted, SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending")
            ->whereBetween('created_at', [$start, $end])
            ->first();

        return Inertia::render('nursing/admissions/index', [
            'filters' => ['dateFilter' => $period],
            'counts' => [
                'total' => (int) ($counts->total ?? 0),
                'discharged' => (int) ($counts->discharged ?? 0),
                'admitted' => (int) ($counts->admitted ?? 0),
                'pending' => (int) ($counts->pending ?? 0),
            ],
        ]);
    }

    public function index(Request $request): Response
    {
        $filters = $request->validate([
            'date_filter' => ['nullable', Rule::in(['today', 'yesterday', 'this_week', 'last_week', 'this_month', 'last_month', 'this_year', 'last_year'])],
        ]);
        $period = $filters['date_filter'] ?? 'today';
        [$start, $end] = $this->admissionRange($period);
        $counts = Admission::query()
            ->selectRaw("COUNT(*) as total, SUM(CASE WHEN status = 'discharged' THEN 1 ELSE 0 END) as discharged, SUM(CASE WHEN status = 'admitted' THEN 1 ELSE 0 END) as admitted, SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending")
            ->whereBetween('created_at', [$start, $end])
            ->first();

        $wards = Ward::query()->wards()
            ->with(['beds' => fn (HasMany $beds) => $beds->with(['bedAdmissions' => fn (HasMany $admissions) => $admissions->active()->with('patient')])])
            ->withCount('beds')
            ->withCount(['beds as occupied_beds_count' => fn ($beds) => $beds
                ->where(fn ($beds) => $beds->where('status', 'occupied')->orWhereHas('bedAdmissions', fn ($admissions) => $admissions->active()))])
            ->whereHas('admissions', fn ($query) => $query->active())
            ->addSelect(['patients_count' => Admission::query()
                ->selectRaw('count(distinct patient_id)')
                ->whereColumn('admissions.ward_id', 'wards.id')
                ->active()])
            ->orderBy('name')->get()
            ->map(fn (Ward $ward) => [
                'id' => $ward->id,
                'name' => $ward->name,
                'description' => $ward->description,
                'bedsCount' => $ward->beds_count,
                'occupiedBedsCount' => $ward->occupied_beds_count,
                'patientsCount' => $ward->patients_count,
                'status' => $this->occupancyStatus((int) $ward->occupied_beds_count, (int) $ward->beds_count),
                'beds' => $ward->beds->filter(fn (Ward $bed) => $this->bedData($bed)['admissionId'] !== null)
                    ->map(fn (Ward $bed) => $this->bedData($bed))->values()->toArray(),
            ])->values()->toArray();

        // Get all pending admissions across all wards
        $pendingAdmissions = Admission::query()->where('status', 'pending')
            ->with(['patient', 'ward'])->latest()->get()->map(fn (Admission $admission) => [
                'id' => $admission->id,
                'patientId' => $admission->patient_id,
                'patientName' => $admission->patient?->fullName,
                'requestedWardId' => $admission->ward_id,
                'requestedWardName' => $admission->ward?->name,
                'notes' => $admission->notes,
            ])->values()->toArray();

        // Load all wards with their available beds for ward selection during admission
        $allWards = Ward::query()->wards()
            ->with(['beds' => fn (HasMany $beds) => $beds->with(['bedAdmissions' => fn (HasMany $admissions) => $admissions->active()])])
            ->orderBy('name')->get()
            ->map(fn (Ward $w) => [
                'id' => $w->id,
                'name' => $w->name,
                'beds' => $w->beds->filter(fn (Ward $bed) => ! $bed->is_ward && $bed->status !== 'occupied' && ! $bed->bedAdmissions->isNotEmpty())
                    ->map(fn (Ward $bed) => [
                        'id' => $bed->id,
                        'name' => $bed->name,
                    ])
                    ->values()->toArray(),
            ])->values()->toArray();

        return Inertia::render('nursing/ward-rounds/index', [
            'filters' => ['dateFilter' => $period],
            'counts' => [
                'total' => (int) ($counts->total ?? 0),
                'discharged' => (int) ($counts->discharged ?? 0),
                'admitted' => (int) ($counts->admitted ?? 0),
                'pending' => (int) ($counts->pending ?? 0),
            ],
            'wards' => $wards,
            'pendingAdmissions' => $pendingAdmissions,
            'allWards' => $allWards,
            'billingOptions' => $this->billingOptions(),
        ]);
    }

    public function show(string $current_team, Ward $ward): Response
    {
        abort_unless($ward->is_ward, 404);
        $ward->load(['beds' => fn (HasMany $beds) => $beds->with(['bedAdmissions' => fn (HasMany $admissions) => $admissions
            ->active()->latest('id')->with(['patient', 'doctor'])])]);

        // Get all pending admissions across all wards, not just this ward
        $pendingAdmissions = Admission::query()->where('status', 'pending')
            ->with(['patient', 'ward'])->latest()->get()->map(fn (Admission $admission) => [
                'id' => $admission->id,
                'patientId' => $admission->patient_id,
                'patientName' => $admission->patient?->fullName,
                'requestedWardId' => $admission->ward_id,
                'requestedWardName' => $admission->ward?->name,
                'notes' => $admission->notes,
            ]);

        // Load all wards with their available beds for ward selection during admission
        $allWards = Ward::query()->wards()
            ->with(['beds' => fn (HasMany $beds) => $beds->with(['bedAdmissions' => fn (HasMany $admissions) => $admissions->active()])])
            ->orderBy('name')->get()
            ->map(fn (Ward $w) => [
                'id' => $w->id,
                'name' => $w->name,
                'beds' => $w->beds->filter(fn (Ward $bed) => ! $bed->is_ward && $bed->status !== 'occupied' && ! $bed->bedAdmissions->isNotEmpty())
                    ->map(fn (Ward $bed) => [
                        'id' => $bed->id,
                        'name' => $bed->name,
                    ])
                    ->values(),
            ]);

        return Inertia::render('nursing/ward-rounds/show', [
            'ward' => [
                'id' => $ward->id,
                'name' => $ward->name,
                'description' => $ward->description,
                'beds' => $ward->beds->filter(fn (Ward $bed) => $this->bedData($bed)['admissionId'] !== null)
                    ->map(fn (Ward $bed) => $this->bedData($bed))->values(),
            ],
            'pendingAdmissions' => $pendingAdmissions,
            'allWards' => $allWards,
        ]);
    }

    /**
     * Show a ward round and the clinical record subpages for an admission.
     */
    public function view(Request $request, string $current_team, Admission $admission, string $section = 'overview'): Response
    {
        $admission->load(['patient.category', 'doctor', 'ward', 'bed']);

        abort_unless($admission->patient !== null, 404);

        $section = in_array($section, self::SECTIONS, true) ? $section : 'overview';
        $perPage = in_array((int) $request->query('perPage', 25), [10, 25, 50, 100], true)
            ? (int) $request->query('perPage', 25)
            : 25;
        $page = max(1, (int) $request->query('page', 1));

        $records = $section !== 'overview'
            ? [$section => $this->clinicalRecords->recordsPaginated($admission->patient_id, $section, $page, $perPage)]
            : $this->clinicalRecords->records($admission->patient_id);

        return Inertia::render('nursing/ward-rounds/view', [
            'section' => $section,
            'admission' => [
                'id' => $admission->getKey(),
                'patientId' => $admission->patient_id,
                'patientName' => $admission->patient?->fullName,
                'wardId' => $admission->ward_id,
                'wardName' => $admission->ward?->name,
                'bedName' => $admission->bed?->name,
                'doctorName' => $admission->doctor?->name,
                'status' => $admission->status,
                'admittedAt' => $admission->created_at?->toIso8601String(),
                'notes' => $admission->notes,
                'patientWallet' => (float) ($admission->patient?->wallet ?? 0),
            ],
            'detail' => [
                'birthDate' => $admission->patient?->birthDate,
                'gender' => $admission->patient?->gender,
                'age' => $admission->patient?->age,
                'category' => $admission->patient?->category?->name,
                'wardName' => $admission->ward?->name,
                'bedName' => $admission->bed?->name,
                'doctorName' => $admission->doctor?->name,
                'status' => $admission->status,
                'admittedAt' => $admission->created_at?->toIso8601String(),
                'duration' => (int) $admission->duration,
                'notes' => $admission->notes,
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

    public function admit(Request $request, string $current_team, Ward $ward): RedirectResponse
    {
        abort_unless($ward->is_ward, 404);
        $data = $request->validate([
            'admission_id' => ['required', 'integer', Rule::exists('admissions', 'id')->where('team_id', $request->user()->currentTeam->getKey())],
            'ward_id' => ['nullable', 'integer', Rule::exists('wards', 'id')->where('team_id', $request->user()->currentTeam->getKey())],
            'bed_id' => ['required', 'integer', Rule::exists('wards', 'id')->where('team_id', $request->user()->currentTeam->getKey())],
            'notes' => ['nullable', 'string', 'max:5000'],
        ]);

        // Determine the target ward: use the provided ward_id if given, otherwise fall back to the route ward
        $targetWardId = $data['ward_id'] ?? $ward->getKey();

        DB::transaction(function () use ($data, $targetWardId): void {
            $bed = Ward::query()->whereKey($data['bed_id'])->lockForUpdate()->firstOrFail();
            abort_unless(! $bed->is_ward && (int) $bed->ward_id === (int) $targetWardId, 422, 'Choose a bed in the selected ward.');
            abort_if($bed->status === 'occupied' || $bed->bedAdmissions()->active()->exists(), 422, 'This bed is already occupied.');
            $admission = Admission::query()->whereKey($data['admission_id'])->lockForUpdate()->firstOrFail();
            abort_unless($admission->status === 'pending', 422, 'This admission is no longer waiting for a bed.');
            $admission->update([
                'ward_id' => $targetWardId,
                'bed_id' => $bed->getKey(),
                'status' => 'admitted',
                'notes' => $data['notes'],
            ]);
            $bed->update(['status' => 'occupied']);
        });

        return to_route('nursing.ward-rounds.show', [$request->user()->currentTeam->slug, $targetWardId]);
    }

    public function discharge(Request $request, string $current_team, Admission $admission): RedirectResponse
    {
        abort_unless($admission->status === 'admitted' && $admission->bed_id !== null, 422, 'This admission does not occupy a bed.');

        $wallet = (float) ($admission->patient?->wallet ?? 0);
        if ($wallet < 0) {
            return back()->with('error', 'Cannot discharge: patient has an outstanding balance of '.DashboardCurrency::symbol().number_format(abs($wallet), 2));
        }

        $wardId = $admission->ward_id;
        DB::transaction(function () use ($admission): void {
            $bed = Ward::query()->whereKey($admission->bed_id)->lockForUpdate()->firstOrFail();
            $admission->update(['status' => 'discharged']);
            $bed->update(['status' => 'available']);
        });

        return to_route('nursing.ward-rounds.show', [$request->user()->currentTeam->slug, $wardId]);
    }

    /**
     * List the ward round history (all admissions including discharged) for the current team.
     */
    public function history(Request $request): Response
    {
        $status = trim((string) $request->query('status', ''));
        $doctorId = $request->integer('doctor_id');
        $wardId = $request->integer('ward_id');
        $search = trim((string) $request->query('search', ''));
        $perPage = (int) $request->query('perPage', 25);

        if (! in_array($perPage, [10, 25, 50, 100], true)) {
            $perPage = 25;
        }

        $admissions = Admission::query()
            ->with(['patient', 'doctor', 'ward', 'bed'])
            ->when($status !== '', fn (Builder $query) => $query->where('status', $status))
            ->when($doctorId > 0, fn (Builder $query) => $query->where('doctor_id', $doctorId))
            ->when($wardId > 0, fn (Builder $query) => $query->where('ward_id', $wardId))
            ->when($search !== '', function (Builder $query) use ($search): void {
                $query->whereHas('patient', function (Builder $q) use ($search): void {
                    $q->where('slug', 'like', "%{$search}%")
                        ->orWhere('firstName', 'like', "%{$search}%")
                        ->orWhere('lastName', 'like', "%{$search}%")
                        ->orWhere('fullName', 'like', "%{$search}%");
                });
            })
            ->orderByDesc('created_at')
            ->paginate($perPage)
            ->withQueryString()
            ->through(fn (Admission $admission) => $this->admissionItem($admission));

        return Inertia::render('nursing/admissions/history', [
            'admissions' => $admissions,
            'filters' => [
                'status' => $status,
                'doctor_id' => $doctorId > 0 ? $doctorId : null,
                'ward_id' => $wardId > 0 ? $wardId : null,
                'search' => $search,
            ],
            'statusOptions' => collect(self::STATUS_FILTERS)
                ->map(fn (string $label, string $value) => ['value' => $value, 'label' => $label])
                ->values()
                ->all(),
            'doctorOptions' => $this->doctorOptions($request),
            'wardOptions' => $this->wardOptions(),
        ]);
    }

    /** @return array<string, mixed> */
    private function admissionItem(Admission $admission): array
    {
        return [
            'id' => $admission->getKey(),
            'patientId' => $admission->patient_id,
            'patientName' => $admission->patient?->fullName,
            'doctorName' => $admission->doctor?->name,
            'wardName' => $admission->ward?->name,
            'bedName' => $admission->bed?->name,
            'status' => $admission->status,
            'admittedAt' => $admission->created_at?->toIso8601String(),
            'dischargedAt' => $admission->updated_at?->toIso8601String(),
            'notes' => $admission->notes,
        ];
    }

    /** @return array<string, mixed> */
    private function bedData(Ward $bed): array
    {
        $admission = $bed->bedAdmissions->sortByDesc('id')->first();

        return [
            'id' => $bed->id,
            'name' => $bed->name,
            'status' => $admission ? 'occupied' : $bed->status,
            'admissionId' => $admission?->id,
            'patientId' => $admission?->patient_id,
            'patientRecordId' => $admission?->patient?->getKey(),
            'patientName' => $admission?->patient?->fullName,
            'doctorName' => $admission?->doctor?->name,
            'admissionStatus' => $admission?->status,
            'admittedAt' => $admission?->created_at?->toIso8601String(),
            'patientWallet' => (float) ($admission?->patient?->wallet ?? 0),
        ];
    }

    /**
     * Search for an active admission by patient hospital number or name.
     */
    public function searchAdmission(Request $request): JsonResponse
    {
        $search = trim((string) $request->query('q', ''));

        if ($search === '') {
            return response()->json(null);
        }

        $admission = Admission::query()
            ->active()
            ->whereHas('patient', function (Builder $q) use ($search): void {
                $q->where('slug', 'like', "%{$search}%")
                    ->orWhere('fullName', 'like', "%{$search}%")
                    ->orWhere('firstName', 'like', "%{$search}%")
                    ->orWhere('lastName', 'like', "%{$search}%");
            })
            ->with(['patient', 'ward'])
            ->latest()
            ->first();

        if ($admission === null) {
            return response()->json(null);
        }

        return response()->json([
            'id' => $admission->id,
            'patientId' => $admission->patient_id,
            'patientName' => $admission->patient?->fullName,
            'wardName' => $admission->ward?->name,
        ]);
    }

    /**
     * Search all patients by name or slug, across every team.
     */
    public function searchPatients(Request $request): JsonResponse
    {
        $search = trim((string) $request->query('q', ''));

        $patients = Patient::query()
            ->withoutGlobalScope('team')
            ->when($search !== '', function (Builder $q) use ($search): void {
                $q->where(function (Builder $inner) use ($search): void {
                    $inner->where('slug', 'like', "%{$search}%")
                        ->orWhere('firstName', 'like', "%{$search}%")
                        ->orWhere('lastName', 'like', "%{$search}%")
                        ->orWhere('fullName', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%")
                        ->orWhere('phone', 'like', "%{$search}%")
                        ->orWhere('mobile', 'like', "%{$search}%");
                });
            })
            ->orderBy('slug')
            ->limit(50)
            ->get([
                'slug',
                'fullName',
                'firstName',
                'middleName',
                'lastName',
                'gender',
                'birthDate',
                'email',
                'phone',
                'mobile',
                'category_id',
                'country_id',
                'state_id',
                'lga_id',
                'address',
                'kinFullName',
                'kinPhone',
                'kinEmail',
                'relation',
                'art',
                'slugOther',
                'marital_status',
            ])
            ->map(fn (Patient $patient) => [
                'slug' => $patient->slug,
                'label' => "{$patient->slug} - {$patient->fullName}",
                'firstName' => $patient->firstName,
                'middleName' => $patient->middleName,
                'lastName' => $patient->lastName,
                'gender' => $patient->gender,
                'birthDate' => $patient->birthDate?->format('Y-m-d'),
                'email' => $patient->email,
                'phone' => $patient->phone,
                'mobile' => $patient->mobile,
                'category_id' => $patient->category_id ? (string) $patient->category_id : '',
                'country_id' => $patient->country_id ? (string) $patient->country_id : '',
                'state_id' => $patient->state_id ? (string) $patient->state_id : '',
                'lga_id' => $patient->lga_id ? (string) $patient->lga_id : '',
                'address' => $patient->address,
                'kinFullName' => $patient->kinFullName,
                'kinPhone' => $patient->kinPhone,
                'kinEmail' => $patient->kinEmail,
                'relation' => $patient->relation,
                'art' => $patient->art,
                'slugOther' => $patient->slugOther,
                'maritalStatus' => $patient->marital_status,
            ])->values();

        return response()->json($patients);
    }

    /**
     * Get the billing service options for the ward round page.
     *
     * @return array{services: array<int, array{id: int, name: string, price: float}>}
     */
    private function billingOptions(): array
    {
        return [
            'services' => PriceList::query()
                ->where(function (Builder $query): void {
                    $query->whereHas('subCategory', fn (Builder $q) => $q->whereIn('name', [
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
                        ->orWhereHas('category', fn (Builder $q) => $q->whereRaw('LOWER(name) = ?', ['surgery']));
                })
                ->orderBy('name')
                ->get(['id', 'name', 'price'])
                ->map(fn (PriceList $priceList) => [
                    'id' => $priceList->getKey(),
                    'name' => $priceList->name,
                    'price' => (float) ($priceList->price ?? 0),
                ])
                ->all(),
        ];
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
     * Get the wards available to the current team.
     *
     * @return array<int, array{id: int, name: string}>
     */
    private function wardOptions(): array
    {
        return Ward::query()
            ->wards()
            ->where('is_ward', true)
            ->orderBy('name')
            ->get(['id', 'name'])
            ->map(fn (Ward $ward) => ['id' => $ward->getKey(), 'name' => $ward->name])
            ->all();
    }

    private function occupancyStatus(int $occupied, int $total): string
    {
        if ($occupied <= 0) {
            return 'Available';
        }

        return $occupied >= $total ? 'Occupied' : 'Partially occupied';
    }

    /** @return array{CarbonImmutable, CarbonImmutable} */
    private function admissionRange(string $period): array
    {
        $today = CarbonImmutable::today();

        return match ($period) {
            'yesterday' => [$today->subDay()->startOfDay(), $today->subDay()->endOfDay()],
            'this_week' => [$today->startOfWeek(), $today->endOfWeek()],
            'last_week' => [$today->subWeek()->startOfWeek(), $today->subWeek()->endOfWeek()],
            'this_month' => [$today->startOfMonth(), $today->endOfMonth()],
            'last_month' => [$today->subMonth()->startOfMonth(), $today->subMonth()->endOfMonth()],
            'this_year' => [$today->startOfYear(), $today->endOfYear()],
            'last_year' => [$today->subYear()->startOfYear(), $today->subYear()->endOfYear()],
            default => [$today->startOfDay(), $today->endOfDay()],
        };
    }
}
