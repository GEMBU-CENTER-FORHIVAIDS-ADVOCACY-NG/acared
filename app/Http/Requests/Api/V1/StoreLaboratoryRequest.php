<?php

namespace App\Http\Requests\Api\V1;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreLaboratoryRequest extends FormRequest
{
    /**
     * @return array<string, array<int, ValidationRule|array<mixed>|string>>
     */
    public function rules(): array
    {
        $teamId = $this->attributes->get('currentTeam')?->id;

        return [
            'patient_id' => ['required', 'string', Rule::exists('patients', 'slug')->where('team_id', $teamId)],
            'lines' => ['required', 'array', 'min:1'],
            'lines.*.price_list_id' => ['required', Rule::exists('price_lists', 'id')->where('team_id', $teamId)],
            'lines.*.unitPrice' => ['nullable', 'numeric'],
            'lines.*.unitCost' => ['nullable', 'numeric'],
            'lines.*.quantity' => ['nullable', 'numeric', 'min:1'],
            'total' => ['nullable', 'numeric'],
        ];
    }
}
