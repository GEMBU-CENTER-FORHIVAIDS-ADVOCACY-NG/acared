<?php

namespace App\Http\Controllers;

use App\Models\Admission;
use App\Models\Ward;
use App\Service\ClinicalRecordData;
use App\Service\DashboardCurrency;
use Carbon\CarbonImmutable;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class WardRoundController extends Controller
{
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

    public function __construct(private readonly ClinicalRecordData $clinicalRecords) {}

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
                'beds' => $ward->beds->map(fn (Ward $bed) => $this->bedData($bed))->values(),
            ]);

        return Inertia::render('nursing/ward-rounds/index', [
            'filters' => ['dateFilter' => $period],
            'counts' => [
                'total' => (int) ($counts->total ?? 0),
                'discharged' => (int) ($counts->discharged ?? 0),
                'admitted' => (int) ($counts->admitted ?? 0),
                'pending' => (int) ($counts->pending ?? 0),
            ],
            'wards' => $wards,
        ]);
    }

    public function show(string $current_team, Ward $ward): Response
    {
        abort_unless($ward->is_ward, 404);
        $ward->load(['beds' => fn (HasMany $beds) => $beds->with(['bedAdmissions' => fn (HasMany $admissions) => $admissions
            ->active()->latest('id')->with(['patient', 'doctor'])])]);
        $pendingAdmissions = Admission::query()->where('ward_id', $ward->getKey())->where('status', 'pending')
            ->with('patient')->latest()->get()->map(fn (Admission $admission) => [
                'id' => $admission->id,
                'patientId' => $admission->patient_id,
                'patientName' => $admission->patient?->fullName,
                'notes' => $admission->notes,
            ]);

        return Inertia::render('nursing/ward-rounds/show', [
            'ward' => [
                'id' => $ward->id,
                'name' => $ward->name,
                'description' => $ward->description,
                'beds' => $ward->beds->map(fn (Ward $bed) => $this->bedData($bed))->values(),
            ],
            'pendingAdmissions' => $pendingAdmissions,
        ]);
    }

    /**
     * Show a ward round and the clinical record subpages for an admission.
     */
    public function view(Request $request, string $current_team, Admission $admission, string $section = 'overview'): Response
    {
        $admission->load(['patient', 'doctor', 'ward', 'bed']);

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
            ],
            'detail' => [
                'birthDate' => $admission->patient?->birthDate,
                'gender' => $admission->patient?->gender,
                'age' => $admission->patient?->age,
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
            'bed_id' => ['required', 'integer', Rule::exists('wards', 'id')->where('team_id', $request->user()->currentTeam->getKey())],
            'notes' => ['nullable', 'string', 'max:5000'],
        ]);

        DB::transaction(function () use ($data, $ward): void {
            $bed = Ward::query()->whereKey($data['bed_id'])->lockForUpdate()->firstOrFail();
            abort_unless(! $bed->is_ward && (int) $bed->ward_id === (int) $ward->getKey(), 422, 'Choose a bed in this ward.');
            abort_if($bed->status === 'occupied' || $bed->bedAdmissions()->active()->exists(), 422, 'This bed is already occupied.');
            $admission = Admission::query()->whereKey($data['admission_id'])->lockForUpdate()->firstOrFail();
            abort_unless((int) $admission->ward_id === (int) $ward->getKey() && $admission->status === 'pending', 422, 'This admission is no longer waiting for a bed in this ward.');
            $admission->update(['bed_id' => $bed->getKey(), 'status' => 'admitted', 'notes' => $data['notes'] ?? $admission->notes]);
            $bed->update(['status' => 'occupied']);
        });

        return to_route('nursing.ward-rounds.show', [$request->user()->currentTeam->slug, $ward->getKey()]);
    }

    public function discharge(Request $request, string $current_team, Admission $admission): RedirectResponse
    {
        abort_unless($admission->status === 'admitted' && $admission->bed_id !== null, 422, 'This admission does not occupy a bed.');
        $wardId = $admission->ward_id;
        DB::transaction(function () use ($admission): void {
            $bed = Ward::query()->whereKey($admission->bed_id)->lockForUpdate()->firstOrFail();
            $admission->update(['status' => 'discharged']);
            $bed->update(['status' => 'available']);
        });

        return to_route('nursing.ward-rounds.show', [$request->user()->currentTeam->slug, $wardId]);
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
        ];
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
