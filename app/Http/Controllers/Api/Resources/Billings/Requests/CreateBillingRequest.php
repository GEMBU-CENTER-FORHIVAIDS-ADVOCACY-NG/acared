<?php

namespace App\Http\Controllers\Api\Resources\Billings\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class CreateBillingRequest extends FormRequest
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
            'user_id' => ['nullable', 'integer', 'exists:users,id'],
            'billable_type' => ['nullable', 'string', 'max:255'],
            'billable_id' => ['nullable', 'integer'],
            'total' => ['required', 'numeric', 'min:0'],
            'status' => ['required', 'string', 'max:50'],
        ];
    }
}
