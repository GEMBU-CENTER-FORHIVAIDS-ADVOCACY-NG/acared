<?php

namespace App\Http\Requests;

use App\Concerns\PatientValidationRules;
use App\Models\PriceList;
use App\Models\User;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StorePatientRequest extends FormRequest
{
    use PatientValidationRules;

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        /** @var User|null $user */
        $user = $this->user();
        $teamId = $user?->currentTeam?->getKey();

        $rules = $this->patientRules($user);

        $rules['billings'] = ['nullable', 'array'];
        $rules['billings.*.lines'] = ['required_if:billings,null', 'array', 'min:1'];
        $rules['billings.*.lines.*.price_list_id'] = [
            'required',
            'integer',
            Rule::exists(PriceList::class, 'id')->where(fn ($query) => $query->where('team_id', $teamId)),
        ];
        $rules['billings.*.lines.*.unitPrice'] = ['required', 'numeric', 'min:0'];

        return $rules;
    }
}
