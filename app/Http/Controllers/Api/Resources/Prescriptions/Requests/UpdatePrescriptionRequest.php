<?php

namespace App\Http\Controllers\Api\Resources\Prescriptions\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class UpdatePrescriptionRequest extends FormRequest
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
            'appointment_id' => ['nullable', 'integer', 'exists:appointments,id'],
            'doctor_id' => ['nullable', 'integer', 'exists:users,id'],
            'status' => ['required', 'string', 'max:50'],
            'total' => ['required', 'numeric', 'min:0'],
        ];
    }
}
