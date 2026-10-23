<?php

namespace App\Http\Controllers;

use App\Models\Billing;
use App\Models\Nursing;
use App\Models\Patient;
use App\Service\ClinicalRecordData;
use App\Service\DashboardCurrency;
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

        return Inertia::render('nursing/records/view', [
            'section' => in_array($section, self::SECTIONS, true) ? $section : 'overview',
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
            'records' => $this->clinicalRecords->records($nursing->patient_id),
            'options' => $this->clinicalRecords->options(),
            'currencySymbol' => DashboardCurrency::symbol(),
        ]);
    }

    public function index(Request $request): Response
    {
        $team = $request->user()->currentTeam;
        $query = trim((string) $request->query('q', ''));
        $perPage = in_array((int) $request->query('perPage', 25), [10, 25, 50, 100], true) ? (int) $request->query('perPage', 25) : 25;
        $records = Nursing::query()->with(['patient', 'nurse', 'user', 'billing'])
            ->when($query !== '', fn (Builder $builder) => $builder->whereHas('patient', fn (Builder $patient) => $patient
                ->where('slug', 'like', "%{$query}%")->orWhere('fullName', 'like', "%{$query}%")))
            ->latest()->paginate($perPage)->withQueryString()
            ->through(fn (Nursing $record) => [
                'id' => $record->id,
                'patientId' => $record->patient_id,
                'patientName' => $record->patient?->fullName,
                'nurseId' => $record->nurse_id,
                'nurseName' => $record->nurse?->name,
                'billingId' => $record->billing_id,
                'billingStatus' => $record->billing?->status,
                'createdBy' => $record->user?->name,
                'purpose' => $record->purpose,
                'status' => $record->status,
                'createdAt' => $record->created_at?->toIso8601String(),
            ]);

        return Inertia::render('nursing/records/index', [
            'records' => $records,
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
            'filters' => ['q' => $query, 'perPage' => $perPage],
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
