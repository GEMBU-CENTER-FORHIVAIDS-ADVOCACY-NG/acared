<?php

namespace App\Http\Requests\Api\V1;

use App\Models\Billing;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreNursingRequest extends FormRequest
{
    /**
     * @return array<string, array<int, ValidationRule|array<mixed>|string>>
     */
    public function rules(): array
    {
        $teamId = $this->attributes->get('currentTeam')?->id;

        return [
            'patient_id' => ['required', 'string', Rule::exists('patients', 'slug')->where('team_id', $teamId)],
            'nurse_id' => ['nullable', 'integer', Rule::exists('team_members', 'user_id')->where('team_id', $teamId)],
            'billing_id' => ['required', 'integer', Rule::exists('billings', 'id')->where('team_id', $teamId)],
            'purpose' => ['nullable', 'string'],
            'status' => ['sometimes', Rule::in(['scheduled', 'in_progress', 'completed', 'cancelled'])],
        ];
    }

    public function after(): array
    {
        return [function ($validator): void {
            $billingId = $this->integer('billing_id');
            $patientId = $this->string('patient_id')->toString();
            if (! $billingId || ! $patientId) {
                return;
            }

            $billing = Billing::query()->whereKey($billingId)->first();
            if ($billing && $billing->patient_id !== $patientId) {
                $validator->errors()->add('billing_id', 'Select a billing record for the chosen patient.');
            }
        }];
    }
}
