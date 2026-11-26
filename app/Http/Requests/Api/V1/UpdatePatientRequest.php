<?php

namespace App\Http\Requests\Api\V1;

use App\Concerns\PatientValidationRules;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class UpdatePatientRequest extends FormRequest
{
    use PatientValidationRules;

    /**
     * @return array<string, array<int, ValidationRule|array<mixed>|string>>
     */
    public function rules(): array
    {
        $patient = $this->route('patient');

        return $this->patientRules($this->user(), $patient);
    }
}
