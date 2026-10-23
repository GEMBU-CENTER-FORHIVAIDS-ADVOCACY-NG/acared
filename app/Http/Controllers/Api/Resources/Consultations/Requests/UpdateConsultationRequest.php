<?php

namespace App\Http\Controllers\Api\Resources\Consultations\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class UpdateConsultationRequest extends FormRequest
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
            'billing_id' => ['required', 'integer', 'exists:billings,id'],
            'doctor_id' => ['required', 'integer', 'exists:users,id'],
            'purpose' => ['nullable', 'string'],
            'starts_at' => ['required', 'date'],
            'ends_at' => ['nullable', 'date'],
            'status' => ['required', 'string', 'max:50'],
        ];
    }
}
