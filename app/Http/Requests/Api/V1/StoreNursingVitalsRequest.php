<?php

namespace App\Http\Requests\Api\V1;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreNursingVitalsRequest extends FormRequest
{
    /**
     * @return array<string, array<int, ValidationRule|array<mixed>|string>>
     */
    public function rules(): array
    {
        return [
            'vital_signs' => ['required', 'array', 'min:1'],
            'vital_signs.*.price_list_id' => ['required', 'integer', 'exists:price_lists,id'],
            'vital_signs.*.results' => ['required', 'string', 'max:255'],
        ];
    }
}
