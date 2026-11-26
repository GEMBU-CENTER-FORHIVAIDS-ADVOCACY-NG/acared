<?php

namespace App\Http\Requests\Api\V1;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreWardRequest extends FormRequest
{
    /**
     * @return array<string, array<int, ValidationRule|array<mixed>|string>>
     */
    public function rules(): array
    {
        $teamId = $this->attributes->get('currentTeam')?->id;

        return [
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'capacity' => ['required', 'integer', 'min:0', 'max:500'],
            'beds' => ['nullable', 'array', 'max:500'],
            'beds.*.id' => ['nullable', 'integer', Rule::exists('wards', 'id')->where('team_id', $teamId)],
            'beds.*.name' => ['required', 'string', 'max:255'],
        ];
    }
}
