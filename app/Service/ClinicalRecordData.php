<?php

namespace App\Service;

use App\Models\Admission;
use App\Models\Complaint;
use App\Models\Diagnose;
use App\Models\Examination;
use App\Models\Laboratory;
use App\Models\Prescription;
use App\Models\PriceList;
use App\Models\Treatment;
use App\Models\User;
use App\Models\Vital;
use App\Models\Ward;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Collection;

class ClinicalRecordData
{
    /**
     * Build the clinical record set for a patient.
     *
     * @return array<string, array<int, array<string, mixed>>>
     */
    public function records(string $patientId): array
    {
        return [
            'vital-signs' => $this->mapRecords(
                Vital::query()->where('patient_id', $patientId)->with(['user', 'lines.priceList'])->latest()->get(),
            ),
            'complaints' => $this->mapRecords(
                Complaint::query()->where('patient_id', $patientId)->with('doctor')->latest()->get(),
            ),
            'examinations' => $this->mapRecords(
                Examination::query()->where('patient_id', $patientId)->with('doctor')->latest()->get(),
            ),
            'diagnoses' => $this->mapRecords(
                Diagnose::query()->where('patient_id', $patientId)->with('doctor')->latest()->get(),
            ),
            'admissions' => $this->mapRecords(
                Admission::query()->where('patient_id', $patientId)->with(['doctor', 'ward', 'bed'])->latest()->get(),
            ),
            'treatments' => $this->mapRecords(
                Treatment::query()->where('patient_id', $patientId)->with(['user', 'lines.priceList'])->latest()->get(),
            ),
            'laboratories' => $this->mapRecords(
                Laboratory::query()->where('patient_id', $patientId)->with(['doctor', 'lines.priceList'])->latest()->get(),
            ),
            'prescriptions' => $this->mapRecords(
                Prescription::query()->where('patient_id', $patientId)->with(['doctor', 'lines.priceList'])->latest()->get(),
            ),
        ];
    }

    /**
     * Build a single paginated clinical record type for a patient.
     *
     * @return array{data: array<int, array<string, mixed>>, currentPage: int, lastPage: int, perPage: int, total: int}
     */
    public function recordsPaginated(string $patientId, string $type, int $page, int $perPage): array
    {
        $query = match ($type) {
            'vital-signs' => Vital::query()
                ->where('patient_id', $patientId)
                ->with(['user', 'lines.priceList']),
            'complaints' => Complaint::query()
                ->where('patient_id', $patientId)
                ->with('doctor'),
            'examinations' => Examination::query()
                ->where('patient_id', $patientId)
                ->with('doctor'),
            'diagnoses' => Diagnose::query()
                ->where('patient_id', $patientId)
                ->with('doctor'),
            'admissions' => Admission::query()
                ->where('patient_id', $patientId)
                ->with(['doctor', 'ward', 'bed']),
            'treatments' => Treatment::query()
                ->where('patient_id', $patientId)
                ->with(['user', 'lines.priceList']),
            'laboratories' => Laboratory::query()
                ->where('patient_id', $patientId)
                ->with(['doctor', 'lines.priceList']),
            'prescriptions' => Prescription::query()
                ->where('patient_id', $patientId)
                ->with(['doctor', 'lines.priceList']),
            default => null,
        };

        if ($query === null) {
            return [
                'data' => [],
                'currentPage' => 1,
                'lastPage' => 1,
                'perPage' => $perPage,
                'total' => 0,
            ];
        }

        $total = $query->count();
        $collection = $query->latest()->forPage($page, $perPage)->get()->values();
        $lastPage = (int) ceil($total / $perPage);

        return [
            'data' => $this->mapRecords($collection),
            'currentPage' => $page,
            'lastPage' => $lastPage,
            'perPage' => $perPage,
            'total' => $total,
        ];
    }

    /**
     * Serialize a record collection.
     *
     * @template TModel of Admission|Complaint|Diagnose|Examination|Laboratory|Prescription|Treatment|Vital
     *
     * @param  Collection<int, TModel>  $records
     * @return array<int, array<string, mixed>>
     */
    private function mapRecords($records): array
    {
        return $records
            ->map(fn ($record) => [
                ...$record->toArray(),
                'recordedAt' => $record->created_at?->toIso8601String(),
                'recordedByName' => data_get($record, 'doctor.name') ?? data_get($record, 'user.name'),
            ])
            ->values()
            ->all();
    }

    /**
     * Build the create-form options for every clinical record type.
     *
     * @return array<string, mixed>
     */
    public function options(): array
    {
        return [
            'wards' => Ward::query()
                ->where('is_ward', true)
                ->orderBy('name')
                ->get(['id', 'name'])
                ->all(),
            'beds' => Ward::query()
                ->where('is_ward', false)
                ->orderBy('name')
                ->get(['id', 'name', 'ward_id'])
                ->all(),
            'vitalPriceLists' => $this->priceListsInSubcategory('Vital sign'),
            'laboratoryTests' => PriceList::query()
                ->whereNull('parameter_id')
                ->where('is_inventory', false)
                ->whereHas('subCategory.category', fn (Builder $query) => $query->where('name', 'Laboratory'))
                ->orderBy('name')
                ->get(['id', 'name', 'price'])
                ->all(),
            'drugs' => PriceList::query()
                ->whereHas('subCategory.category', fn (Builder $query) => $query->where('name', 'Pharmacy'))
                ->whereHas('drugInventories', fn (Builder $q) => $q->where('quantity', '>', 1))
                ->orderBy('name')
                ->get(['id', 'name', 'price'])
                ->all(),
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
                    ]))
                        ->orWhereHas('category', fn (Builder $q) => $q->whereRaw('LOWER(name) = ?', ['surgery']));
                })
                ->orderBy('name')
                ->get(['id', 'name', 'price'])
                ->all(),
            'users' => User::query()
                ->orderBy('name')
                ->get(['id', 'name'])
                ->all(),
        ];
    }

    /**
     * Get requestable price lists within a named subcategory.
     *
     * @return array<int, PriceList>
     */
    private function priceListsInSubcategory(string $subcategory): array
    {
        return PriceList::query()
            ->whereHas('subCategory', fn (Builder $query) => $query->where('name', $subcategory))
            ->orderBy('name')
            ->get(['id', 'name', 'price', 'uom'])
            ->all();
    }
}
