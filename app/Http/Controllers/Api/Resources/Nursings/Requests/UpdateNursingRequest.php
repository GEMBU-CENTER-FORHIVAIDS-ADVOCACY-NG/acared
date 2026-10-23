<?php

namespace App\Http\Controllers\Api\Resources\Nursings\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class UpdateNursingRequest extends FormRequest
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
            'patient_id' => ['required', 'string', 'exists:patients,slug'],
            'nurse_id' => ['nullable', 'integer', 'exists:users,id'],
            'billing_id' => ['required', 'integer', 'exists:billings,id'],
            'user_id' => ['nullable', 'integer', 'exists:users,id'],
            'purpose' => ['nullable', 'string'],
            'status' => ['required', 'string', 'max:50'],
        ];
    }
}
