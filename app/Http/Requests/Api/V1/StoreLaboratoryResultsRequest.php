<?php

namespace App\Http\Requests\Api\V1;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreLaboratoryResultsRequest extends FormRequest
{
    /**
     * @return array<string, array<int, ValidationRule|array<mixed>|string>>
     */
    public function rules(): array
    {
        return [
            'results' => ['required', 'array', 'min:1'],
            'results.*.line_id' => ['required', 'integer', 'exists:lines,id'],
            'results.*.result' => ['nullable', 'string'],
            'results.*.comment' => ['nullable', 'string'],
        ];
    }
}
