<?php

namespace App\Http\Requests\Api\V1;

use App\Models\Patient;
use App\Models\User;
use App\Models\Ward;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreAdmissionRequest extends FormRequest
{
    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $teamId = $this->attributes->get('currentTeam')?->id;
        $userIds = User::query()->whereHas('teams', fn ($q) => $q->whereKey($teamId))->pluck('id')->all();

        return [
            'patient_id' => ['required', 'string', Rule::exists(Patient::class, 'slug')->where('team_id', $teamId)],
            'doctor_id' => ['nullable', 'integer', Rule::in($userIds)],
            'ward_id' => ['required', 'integer', Rule::exists(Ward::class, 'id')->where('team_id', $teamId)->where('is_ward', true)],
            'bed_id' => ['nullable', 'integer', Rule::exists(Ward::class, 'id')->where('team_id', $teamId)->where('is_ward', false)],
            'duration' => ['nullable', 'numeric', 'min:0.5'],
            'notes' => ['nullable', 'string'],
        ];
    }
}
