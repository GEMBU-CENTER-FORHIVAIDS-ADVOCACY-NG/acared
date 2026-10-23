<?php

namespace App\Http\Controllers\Api\Resources\WardRounds\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class UpdateWardRoundRequest extends FormRequest
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
            'doctor_id' => ['nullable', 'integer', 'exists:users,id'],
            'ward_id' => ['required', 'integer', 'exists:wards,id'],
            'bed_id' => ['nullable', 'integer', 'exists:wards,id'],
            'appointment_id' => ['nullable', 'integer', 'exists:appointments,id'],
            'notes' => ['nullable', 'string'],
            'duration' => ['nullable', 'integer', 'min:0'],
            'status' => ['required', 'string', 'max:50'],
        ];
    }
}
