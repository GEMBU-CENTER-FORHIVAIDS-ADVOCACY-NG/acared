<?php

namespace App\Http\Requests;

use App\Models\Appointment;
use App\Models\User;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class TransferAppointmentRequest extends FormRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $teamId = $this->user()?->currentTeam?->getKey();

        $doctorIds = User::query()
            ->whereHas('teams', fn ($query) => $query->whereKey($teamId))
            ->pluck('id')
            ->all();

        return [
            'patient_id' => [
                'required',
                'string',
                Rule::exists(Appointment::class, 'patient_id')->where(fn ($query) => $query->where('team_id', $teamId)->whereIn('status', ['scheduled', 'started'])),
            ],
            'doctor_id' => [
                'required',
                'integer',
                Rule::in($doctorIds),
            ],
        ];
    }
}
