<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreLaboratoryResultsRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'lines' => ['nullable', 'array'],
            'lines.*' => ['nullable'],
            'testResults' => ['nullable', 'array'],
            'testResults.*' => ['nullable', 'array'],
            'testResults.*.*.price_list_id' => ['required_with:testResults', 'integer'],
            'testResults.*.*.result' => ['nullable', 'string'],
        ];
    }
}
