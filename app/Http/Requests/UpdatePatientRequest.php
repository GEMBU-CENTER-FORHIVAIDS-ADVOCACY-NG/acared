<?php

namespace App\Http\Requests;

use App\Concerns\PatientValidationRules;
use App\Models\Patient;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class UpdatePatientRequest extends FormRequest
{
    use PatientValidationRules;

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        /** @var Patient $patient */
        $patient = $this->route('patient');

        return $this->patientRules(
            user: $this->user(),
            ignoreId: $patient->getKey(),
            includeSlug: false,
        );
    }
}
