<?php

namespace App\Http\Requests\Api\V1;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreApiBillingRequest extends FormRequest
{
    /**
     * @return array<string, array<int, ValidationRule|array<mixed>|string>>
     */
    public function rules(): array
    {
        $teamId = $this->attributes->get('currentTeam')?->id;

        return [
            'patient_id' => ['required', 'string', Rule::exists('patients', 'slug')->where('team_id', $teamId)],
            'billings' => ['required', 'array', 'min:1'],
            'billings.*.lines' => ['required', 'array', 'min:1'],
            'billings.*.lines.*.price_list_id' => ['required', 'integer', Rule::exists('price_lists', 'id')->where('team_id', $teamId)],
            'billings.*.lines.*.unitPrice' => ['required', 'numeric', 'min:0'],
            'billings.*.lines.*.quantity' => ['nullable', 'numeric', 'min:0.001'],
        ];
    }
}
