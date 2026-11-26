<?php

namespace App\Http\Requests\Api\V1;

use App\Models\PriceList;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StorePrescriptionRequest extends FormRequest
{
    /**
     * @return array<string, array<int, ValidationRule|array<mixed>|\Closure|string>>
     */
    public function rules(): array
    {
        $teamId = $this->attributes->get('currentTeam')?->id;

        return [
            'patient_id' => ['required', 'string', Rule::exists('patients', 'slug')->where('team_id', $teamId)],
            'lines' => ['required', 'array', 'min:1'],
            'lines.*.price_list_id' => [
                'required',
                Rule::exists('price_lists', 'id')->where('team_id', $teamId),
                function (string $attribute, mixed $value, \Closure $fail): void {
                    $isPharmacyMedication = PriceList::query()
                        ->whereKey($value)
                        ->where('is_inventory', true)
                        ->whereHas('subCategory.category', fn (Builder $query) => $query->where('name', 'Pharmacy'))
                        ->exists();

                    if (! $isPharmacyMedication) {
                        $fail('Select a medication from the Pharmacy catalog.');
                    }
                },
            ],
            'lines.*.frequency' => ['nullable', 'numeric'],
            'lines.*.duration' => ['nullable', 'numeric'],
            'lines.*.dosage' => ['nullable', 'numeric'],
            'lines.*.comment' => ['nullable', 'string'],
            'lines.*.quantity' => ['required', 'numeric', 'min:0.001'],
        ];
    }
}
