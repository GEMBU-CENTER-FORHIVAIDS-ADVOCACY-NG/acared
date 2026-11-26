<?php

namespace App\Service;

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
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

/**
 * @phpstan-type RecordConfig array{model: class-string<Admission|Complaint|Diagnose|Examination|Laboratory|Prescription|Treatment|Vital>, label: string, doctor: string, lines: bool, billings: bool, total: bool, status: bool}
 * @phpstan-type RecordContext array{team_id: int, patient_id: string, appointment_id: int|null, user_id: int}
 */
class ClinicalRecordService
{
    /**
     * @var array<string, RecordConfig>
     */
    public const TYPES = [
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
     * @param  RecordContext  $context
     * @return array{config: RecordConfig, record: Model}
     */
    public function createRecord(Request $request, array $context, string $type): array
    {
        $config = $this->config($type);
        $data = $this->withLinePricing($config, $this->validated($request, $type, $config));

        $record = DB::transaction(function () use ($request, $context, $config, $data): Model {
            $record = new $config['model'];
            $record->forceFill($this->recordAttributes($request, $context, $config, $data));
            $record->save();

            $this->syncLines($request, $record, $config, $data);
            $this->syncBillings($request, $context, $record, $config, $data);

            return $record;
        });

        return ['config' => $config, 'record' => $record];
    }

    /**
     * @param  RecordContext  $context
     * @return array{config: RecordConfig, record: Model}
     */
    public function updateRecord(Request $request, array $context, string $type, int $record): array
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

            if ($config['billings'] && method_exists($model, 'billings')) {
                $model->billings()->whereIn('status', ['billed', 'pending'])->delete();
            }

            $this->syncLines($request, $model, $config, $data);
            $this->syncBillings($request, $context, $model, $config, $data);
        });

        return ['config' => $config, 'record' => $model->fresh()];
    }

    /**
     * @param  RecordContext  $context
     * @return RecordConfig
     */
    public function deleteRecord(array $context, string $type, int $record): array
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
     * @return RecordContext
     */
    public function consultationContext(Consultation $consultation): array
    {
        return [
            'team_id' => (int) $consultation->team_id,
            'patient_id' => $consultation->patient_id,
            'appointment_id' => $consultation->appointment_id,
            'user_id' => (int) $consultation->user_id,
        ];
    }

    /**
     * @return RecordContext
     */
    public function admissionContext(Request $request, Admission $admission): array
    {
        return [
            'team_id' => (int) $admission->team_id,
            'patient_id' => $admission->patient_id,
            'appointment_id' => $admission->appointment_id,
            'user_id' => (int) $request->user()->getKey(),
        ];
    }

    /**
     * @return RecordContext
     */
    public function nursingContext(Request $request, Nursing $nursing): array
    {
        return [
            'team_id' => (int) $nursing->team_id,
            'patient_id' => $nursing->patient_id,
            'appointment_id' => null,
            'user_id' => (int) $request->user()->getKey(),
        ];
    }

    /**
     * @return RecordConfig
     */
    public function config(string $type): array
    {
        abort_unless(array_key_exists($type, self::TYPES), 404);

        return self::TYPES[$type];
    }

    /**
     * @param  RecordConfig  $config
     * @param  RecordContext  $context
     * @return Admission|Complaint|Diagnose|Examination|Laboratory|Prescription|Treatment|Vital
     */
    public function findRecord(array $config, array $context, int $record): Model
    {
        return $config['model']::query()
            ->whereKey($record)
            ->where('patient_id', $context['patient_id'])
            ->firstOrFail();
    }

    /**
     * @param  RecordConfig  $config
     * @return array<string, mixed>
     */
    public function validated(Request $request, string $type, array $config): array
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
     * @param  RecordContext  $context
     * @param  RecordConfig  $config
     * @param  array<string, mixed>  $data
     * @return array<string, mixed>
     */
    public function recordAttributes(Request $request, array $context, array $config, array $data): array
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
     * @param  RecordConfig  $config
     * @param  array<string, mixed>  $data
     * @return array<string, mixed>
     */
    public function withLinePricing(array $config, array $data): array
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
     * @param  RecordConfig  $config
     * @param  array<string, mixed>  $data
     * @param  Admission|Complaint|Diagnose|Examination|Laboratory|Prescription|Treatment|Vital  $record
     */
    public function syncLines(Request $request, Model $record, array $config, array $data): void
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
     * @param  RecordContext  $context
     * @param  RecordConfig  $config
     * @param  array<string, mixed>  $data
     * @param  Admission|Complaint|Diagnose|Examination|Laboratory|Prescription|Treatment|Vital  $record
     */
    public function syncBillings(Request $request, array $context, Model $record, array $config, array $data): void
    {
        if (! $config['billings'] || ! $config['total'] || ! method_exists($record, 'billings')) {
            return;
        }

        $record->billings()->create([
            'team_id' => $record->team_id,
            'patient_id' => $record->patient_id,
            'user_id' => $request->user()->getKey(),
            'total' => $this->linesTotal($config, $data),
            'status' => 'billed',
        ]);
    }

    /**
     * @param  RecordConfig  $config
     * @param  array<string, mixed>  $data
     */
    public function linesTotal(array $config, array $data): float
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
