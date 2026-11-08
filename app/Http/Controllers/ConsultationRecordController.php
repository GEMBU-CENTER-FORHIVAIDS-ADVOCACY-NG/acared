<?php

namespace App\Http\Controllers;

use App\Models\Admission;
use App\Models\Complaint;
use App\Models\Consultation;
use App\Models\Diagnose;
use App\Models\Examination;
use App\Models\Laboratory;
use App\Models\Nursing;
use App\Models\Prescription;
use App\Models\PriceList;
use App\Models\Treatment;
use App\Models\Vital;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

/**
 * @phpstan-type RecordConfig array{model: class-string<Admission|Complaint|Diagnose|Examination|Laboratory|Prescription|Treatment|Vital>, label: string, doctor: string, lines: bool, billings: bool, total: bool, status: bool}
 * @phpstan-type RecordContext array{team_id: int, patient_id: string, appointment_id: int|null, user_id: int}
 */
class ConsultationRecordController extends Controller
{
    /**
     * The clinical record type registry keyed by section slug.
     *
     * @var array<string, RecordConfig>
     */
    private const TYPES = [
        'vital-signs' => [
            'model' => Vital::class,
            'label' => 'Vital signs',
            'doctor' => 'user_id',
            'lines' => true,
            'billings' => false,
            'total' => false,
            'status' => false,
        ],
        'complaints' => [
            'model' => Complaint::class,
            'label' => 'Complaint',
            'doctor' => 'doctor_id',
            'lines' => false,
            'billings' => false,
            'total' => false,
            'status' => false,
        ],
        'examinations' => [
            'model' => Examination::class,
            'label' => 'Examination',
            'doctor' => 'doctor_id',
            'lines' => false,
            'billings' => false,
            'total' => false,
            'status' => false,
        ],
        'diagnoses' => [
            'model' => Diagnose::class,
            'label' => 'Diagnosis',
            'doctor' => 'doctor_id',
            'lines' => false,
            'billings' => false,
            'total' => false,
            'status' => false,
        ],
        'admissions' => [
            'model' => Admission::class,
            'label' => 'Admission',
            'doctor' => 'doctor_id',
            'lines' => false,
            'billings' => false,
            'total' => false,
            'status' => true,
        ],
        'treatments' => [
            'model' => Treatment::class,
            'label' => 'Treatment',
            'doctor' => 'user_id',
            'lines' => true,
            'billings' => true,
            'total' => true,
            'status' => true,
        ],
        'laboratories' => [
            'model' => Laboratory::class,
            'label' => 'Laboratory',
            'doctor' => 'doctor_id',
            'lines' => true,
            'billings' => true,
            'total' => true,
            'status' => true,
        ],
        'prescriptions' => [
            'model' => Prescription::class,
            'label' => 'Prescription',
            'doctor' => 'doctor_id',
            'lines' => true,
            'billings' => false,
            'total' => true,
            'status' => true,
        ],
    ];

    /**
     * Store a new clinical record on the consultation.
     */
    public function store(Request $request, string $current_team, Consultation $consultation, string $type): RedirectResponse
    {
        $config = $this->createRecord($request, $this->consultationContext($consultation), $type);

        Inertia::flash('toast', ['type' => 'success', 'message' => $config['label'].' recorded.']);

        return to_route('consultations.view', ['current_team' => $current_team, 'consultation' => $consultation->getKey(), 'section' => $type]);
    }

    /**
     * Update an existing clinical record.
     */
    public function update(Request $request, string $current_team, Consultation $consultation, string $type, int $record): RedirectResponse
    {
        $config = $this->updateRecord($request, $this->consultationContext($consultation), $type, $record);

        Inertia::flash('toast', ['type' => 'success', 'message' => $config['label'].' updated.']);

        return to_route('consultations.view', ['current_team' => $current_team, 'consultation' => $consultation->getKey(), 'section' => $type]);
    }

    /**
     * Delete a clinical record and its dependent lines and billings.
     */
    public function destroy(Request $request, string $current_team, Consultation $consultation, string $type, int $record): RedirectResponse
    {
        $config = $this->deleteRecord($this->consultationContext($consultation), $type, $record);

        Inertia::flash('toast', ['type' => 'success', 'message' => $config['label'].' deleted.']);

        return to_route('consultations.view', ['current_team' => $current_team, 'consultation' => $consultation->getKey(), 'section' => $type]);
    }

    /**
     * Store a new clinical record during a ward round.
     */
    public function storeForAdmission(Request $request, string $current_team, Admission $admission, string $type): RedirectResponse
    {
        $config = $this->createRecord($request, $this->admissionContext($request, $admission), $type);

        Inertia::flash('toast', ['type' => 'success', 'message' => $config['label'].' recorded.']);

        return to_route('nursing.ward-rounds.view', ['current_team' => $current_team, 'admission' => $admission->getKey(), 'section' => $type]);
    }

    /**
     * Update a clinical record during a ward round.
     */
    public function updateForAdmission(Request $request, string $current_team, Admission $admission, string $type, int $record): RedirectResponse
    {
        $config = $this->updateRecord($request, $this->admissionContext($request, $admission), $type, $record);

        Inertia::flash('toast', ['type' => 'success', 'message' => $config['label'].' updated.']);

        return to_route('nursing.ward-rounds.view', ['current_team' => $current_team, 'admission' => $admission->getKey(), 'section' => $type]);
    }

    /**
     * Delete a clinical record during a ward round.
     */
    public function destroyForAdmission(Request $request, string $current_team, Admission $admission, string $type, int $record): RedirectResponse
    {
        $config = $this->deleteRecord($this->admissionContext($request, $admission), $type, $record);

        Inertia::flash('toast', ['type' => 'success', 'message' => $config['label'].' deleted.']);

        return to_route('nursing.ward-rounds.view', ['current_team' => $current_team, 'admission' => $admission->getKey(), 'section' => $type]);
    }

    /**
     * Store a new clinical record for a nursing (maternity) visit.
     */
    public function storeForNursing(Request $request, string $current_team, Nursing $nursing, string $type): RedirectResponse
    {
        $config = $this->createRecord($request, $this->nursingContext($request, $nursing), $type);

        Inertia::flash('toast', ['type' => 'success', 'message' => $config['label'].' recorded.']);

        return to_route('nursing.records.view', ['current_team' => $current_team, 'nursing' => $nursing->getKey(), 'section' => $type]);
    }

    /**
     * Update a clinical record for a nursing (maternity) visit.
     */
    public function updateForNursing(Request $request, string $current_team, Nursing $nursing, string $type, int $record): RedirectResponse
    {
        $config = $this->updateRecord($request, $this->nursingContext($request, $nursing), $type, $record);

        Inertia::flash('toast', ['type' => 'success', 'message' => $config['label'].' updated.']);

        return to_route('nursing.records.view', ['current_team' => $current_team, 'nursing' => $nursing->getKey(), 'section' => $type]);
    }

    /**
     * Delete a clinical record for a nursing (maternity) visit.
     */
    public function destroyForNursing(Request $request, string $current_team, Nursing $nursing, string $type, int $record): RedirectResponse
    {
        $config = $this->deleteRecord($this->nursingContext($request, $nursing), $type, $record);

        Inertia::flash('toast', ['type' => 'success', 'message' => $config['label'].' deleted.']);

        return to_route('nursing.records.view', ['current_team' => $current_team, 'nursing' => $nursing->getKey(), 'section' => $type]);
    }

    /**
     * Persist a new clinical record for the given context.
     *
     * @param  RecordContext  $context
     * @return RecordConfig
     */
    private function createRecord(Request $request, array $context, string $type): array
    {
        $config = $this->config($type);
        $data = $this->withLinePricing($config, $this->validated($request, $type, $config));

        DB::transaction(function () use ($request, $context, $config, $data): void {
            $record = new $config['model'];
            $record->forceFill($this->recordAttributes($request, $context, $config, $data));
            $record->save();

            $this->syncLines($request, $record, $config, $data);
            $this->syncBillings($request, $context, $record, $config, $data);
        });

        return $config;
    }

    /**
     * Persist changes to an existing clinical record.
     *
     * @param  RecordContext  $context
     * @return RecordConfig
     */
    private function updateRecord(Request $request, array $context, string $type, int $record): array
    {
        $config = $this->config($type);
        $model = $this->findRecord($config, $context, $record);
        $data = $this->withLinePricing($config, $this->validated($request, $type, $config));

        DB::transaction(function () use ($request, $context, $model, $config, $data): void {
            $model->forceFill($this->recordAttributes($request, $context, $config, $data));
            $model->save();

            if ($config['lines'] && method_exists($model, 'lines')) {
                $model->lines()->delete();
            }

            // Remove pending/billed billings so they can be re-created with updated totals.
            // Paid billings are preserved to avoid breaking payment records.
            if ($config['billings'] && method_exists($model, 'billings')) {
                $model->billings()->whereIn('status', ['billed', 'pending'])->delete();
            }

            $this->syncLines($request, $model, $config, $data);
            $this->syncBillings($request, $context, $model, $config, $data);
        });

        return $config;
    }

    /**
     * Delete a clinical record and its dependent lines and billings.
     *
     * @param  RecordContext  $context
     * @return RecordConfig
     */
    private function deleteRecord(array $context, string $type, int $record): array
    {
        $config = $this->config($type);
        $model = $this->findRecord($config, $context, $record);

        DB::transaction(function () use ($model, $config): void {
            if ($config['lines'] && method_exists($model, 'lines')) {
                $model->lines()->delete();
            }

            if ($config['billings'] && method_exists($model, 'billings')) {
                $model->billings()->forceDelete();
            }

            $model->delete();
        });

        return $config;
    }

    /**
     * Build the clinical record context for a consultation.
     *
     * @return RecordContext
     */
    private function consultationContext(Consultation $consultation): array
    {
        return [
            'team_id' => (int) $consultation->team_id,
            'patient_id' => $consultation->patient_id,
            'appointment_id' => $consultation->appointment_id,
            'user_id' => (int) $consultation->user_id,
        ];
    }

    /**
     * Build the clinical record context for a ward round admission.
     *
     * @return RecordContext
     */
    private function admissionContext(Request $request, Admission $admission): array
    {
        return [
            'team_id' => (int) $admission->team_id,
            'patient_id' => $admission->patient_id,
            'appointment_id' => $admission->appointment_id,
            'user_id' => (int) $request->user()->getKey(),
        ];
    }

    /**
     * Build the clinical record context for a nursing (maternity) visit.
     *
     * @return RecordContext
     */
    private function nursingContext(Request $request, Nursing $nursing): array
    {
        return [
            'team_id' => (int) $nursing->team_id,
            'patient_id' => $nursing->patient_id,
            'appointment_id' => null,
            'user_id' => (int) $request->user()->getKey(),
        ];
    }

    /**
     * Resolve and validate the record type configuration.
     *
     * @return RecordConfig
     */
    private function config(string $type): array
    {
        abort_unless(array_key_exists($type, self::TYPES), 404);

        return self::TYPES[$type];
    }

    /**
     * Find a child record scoped to the patient.
     *
     * @param  RecordConfig  $config
     * @param  RecordContext  $context
     * @return Admission|Complaint|Diagnose|Examination|Laboratory|Prescription|Treatment|Vital
     */
    private function findRecord(array $config, array $context, int $record): Model
    {
        return $config['model']::query()
            ->whereKey($record)
            ->where('patient_id', $context['patient_id'])
            ->firstOrFail();
    }

    /**
     * Validate the incoming payload for the given record type.
     *
     * @param  RecordConfig  $config
     * @return array<string, mixed>
     */
    private function validated(Request $request, string $type, array $config): array
    {
        return $request->validate(match ($type) {
            'vital-signs', 'treatments', 'laboratories', 'prescriptions' => [
                'lines' => ['required', 'array', 'min:1'],
                'lines.*.price_list_id' => ['required', Rule::exists('price_lists', 'id')->where('team_id', $request->user()->currentTeam->getKey())],
                'lines.*.unitPrice' => ['nullable', 'numeric'],
                'lines.*.unitCost' => ['nullable', 'numeric'],
                'lines.*.quantity' => ['nullable', 'numeric'],
                'lines.*.results' => ['nullable', 'string'],
                'lines.*.frequency' => ['nullable', 'numeric'],
                'lines.*.duration' => ['nullable', 'numeric'],
                'lines.*.dosage' => ['nullable', 'numeric'],
                'lines.*.comment' => ['nullable', 'string'],
                'total' => ['nullable', 'numeric'],
                'status' => ['nullable', 'string', Rule::in(['pending', 'paid', 'dispensed', 'completed', 'cancelled'])],
            ],
            'admissions' => [
                'ward_id' => ['required', Rule::exists('wards', 'id')->where('team_id', $request->user()->currentTeam->getKey())],
                'duration' => ['required', 'integer', 'min:0'],
                'notes' => ['nullable', 'string'],
            ],
            'complaints' => [
                'notes_en' => ['required', 'string'],
                'notes_ha' => ['nullable', 'string'],
                'notes_ff' => ['nullable', 'string'],
            ],
            'examinations' => [
                'notes' => ['required'],
            ],
            'diagnoses' => [
                'notes' => ['required', 'string'],
            ],
            default => [],
        });
    }

    /**
     * Build the parent record attributes.
     *
     * @param  RecordContext  $context
     * @param  RecordConfig  $config
     * @param  array<string, mixed>  $data
     * @return array<string, mixed>
     */
    private function recordAttributes(Request $request, array $context, array $config, array $data): array
    {
        $attributes = [
            'team_id' => $context['team_id'],
            'patient_id' => $context['patient_id'],
            $config['doctor'] => $request->user()->getKey(),
        ];

        if ($config['model'] !== Laboratory::class && $context['appointment_id'] !== null) {
            $attributes['appointment_id'] = $context['appointment_id'];
        }

        if ($config['total']) {
            $attributes['total'] = $this->linesTotal($config, $data);
        }

        if ($config['status']) {
            $attributes['status'] = $data['status'] ?? 'pending';
        }

        return match (true) {
            $config['model'] === Complaint::class => [
                ...$attributes,
                'notes' => $data['notes_en'] ?? null,
                'notes_en' => $data['notes_en'] ?? null,
                'notes_ha' => $data['notes_ha'] ?? null,
                'notes_ff' => $data['notes_ff'] ?? null,
            ],
            $config['model'] === Examination::class => [
                ...$attributes,
                'notes' => is_array($data['notes'] ?? null)
                    ? json_encode($data['notes'])
                    : ($data['notes'] ?? null),
            ],
            $config['model'] === Diagnose::class => [
                ...$attributes,
                'notes' => $data['notes'] ?? null,
            ],
            $config['model'] === Admission::class => [
                ...$attributes,
                'ward_id' => $data['ward_id'] ?? null,
                'duration' => $data['duration'] ?? 0,
                'notes' => $data['notes'] ?? null,
            ],
            default => $attributes,
        };
    }

    /**
     * Fill each line with the price list's price and inventory cost.
     *
     * @param  RecordConfig  $config
     * @param  array<string, mixed>  $data
     * @return array<string, mixed>
     */
    private function withLinePricing(array $config, array $data): array
    {
        if (! $config['lines']) {
            return $data;
        }

        /** @var array<int, array<string, mixed>> $lines */
        $lines = $data['lines'] ?? [];

        /** @var Collection<int, PriceList> $priceLists */
        $priceLists = PriceList::query()
            ->with(['labInventories', 'drugInventories', 'inventories'])
            ->whereIn('id', array_column($lines, 'price_list_id'))
            ->get()
            ->keyBy(fn (PriceList $priceList): int => (int) $priceList->getKey());

        $data['lines'] = array_map(function (array $line) use ($priceLists): array {
            $priceList = $priceLists->get((int) $line['price_list_id']);

            $unitCost = $line['unitCost'] ?? null;

            if ($unitCost === null && $priceList) {
                $inventory = $priceList->inventories->first()
                    ?? $priceList->drugInventories->first()
                    ?? $priceList->labInventories->first();

                $unitCost = $inventory?->cost ?? null;
            }

            return [
                ...$line,
                'unitPrice' => (float) ($line['unitPrice'] ?? $priceList?->price ?? 0),
                'unitCost' => $unitCost,
            ];
        }, $lines);

        return $data;
    }

    /**
     * Persist the record's line items.
     *
     * @param  RecordConfig  $config
     * @param  array<string, mixed>  $data
     * @param  Admission|Complaint|Diagnose|Examination|Laboratory|Prescription|Treatment|Vital  $record
     */
    private function syncLines(Request $request, Model $record, array $config, array $data): void
    {
        if (! $config['lines'] || ! method_exists($record, 'lines')) {
            return;
        }

        foreach (($data['lines'] ?? []) as $line) {
            $record->lines()->create([
                'team_id' => $record->team_id,
                'patient_id' => $record->patient_id,
                'user_id' => $request->user()->getKey(),
                'price_list_id' => $line['price_list_id'],
                'quantity' => $line['quantity'] ?? 1,
                'unitPrice' => $line['unitPrice'] ?? 0,
                'unitCost' => $line['unitCost'] ?? null,
                'results' => $line['results'] ?? null,
                'frequency' => $line['frequency'] ?? null,
                'duration' => $line['duration'] ?? null,
                'dosage' => $line['dosage'] ?? null,
                'comment' => $line['comment'] ?? null,
            ]);
        }
    }

    /**
     * Persist a linked billing for the record when applicable.
     *
     * @param  RecordContext  $context
     * @param  RecordConfig  $config
     * @param  array<string, mixed>  $data
     * @param  Admission|Complaint|Diagnose|Examination|Laboratory|Prescription|Treatment|Vital  $record
     */
    private function syncBillings(Request $request, array $context, Model $record, array $config, array $data): void
    {
        if (! $config['billings'] || ! $config['total'] || ! method_exists($record, 'billings')) {
            return;
        }

        $record->billings()->create([
            'team_id' => $record->team_id,
            'patient_id' => $record->patient_id,
            'user_id' => $context['user_id'] ?: $request->user()->getKey(),
            'total' => $this->linesTotal($config, $data),
            'status' => 'billed',
        ]);
    }

    /**
     * Calculate the total of the submitted lines.
     *
     * @param  RecordConfig  $config
     * @param  array<string, mixed>  $data
     */
    private function linesTotal(array $config, array $data): float
    {
        if (! $config['total']) {
            return 0.0;
        }

        /** @var array<int, array<string, mixed>> $lines */
        $lines = $data['lines'] ?? [];

        return collect($lines)->sum(
            fn (array $line) => (float) ($line['quantity'] ?? 1) * (float) ($line['unitPrice'] ?? 0),
        );
    }
}
