<?php

namespace App\Http\Requests\Api\V1;

use App\Models\Billing;
use App\Models\Patient;
use App\Models\User;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreConsultationRequest extends FormRequest
{
    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $teamId = $this->attributes->get('currentTeam')?->id;
        $userIds = User::query()
            ->whereHas('teams', fn ($query) => $query->whereKey($teamId))
            ->pluck('id')
            ->all();

        return [
            'patient_id' => ['required', 'string', Rule::exists(Patient::class, 'slug')->where('team_id', $teamId)],
            'doctor_id' => ['nullable', 'integer', Rule::in($userIds)],
            'billing_id' => [
                'required',
                'integer',
                Rule::exists(Billing::class, 'id')->where(fn ($query) => $query->where('team_id', $teamId)),
            ],
            'starts_at' => ['nullable', 'date'],
            'ends_at' => ['nullable', 'date', 'after:starts_at'],
            'purpose' => ['nullable', 'string'],
            'status' => ['nullable', 'string', Rule::in(['scheduled', 'started', 'completed', 'cancelled'])],
        ];
    }
}
