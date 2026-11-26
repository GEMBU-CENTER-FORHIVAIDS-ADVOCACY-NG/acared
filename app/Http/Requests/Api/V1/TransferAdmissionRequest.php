<?php

namespace App\Http\Requests\Api\V1;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class TransferAdmissionRequest extends FormRequest
{
    /**
     * @return array<string, array<int, ValidationRule|array<mixed>|string>>
     */
    public function rules(): array
    {
        $teamId = $this->attributes->get('currentTeam')?->id;

        return [
            'ward_id' => ['required', 'integer', Rule::exists('wards', 'id')->where('team_id', $teamId)],
            'bed_id' => ['required', 'integer', Rule::exists('wards', 'id')->where('team_id', $teamId)],
            'notes' => ['nullable', 'string', 'max:5000'],
        ];
    }
}
