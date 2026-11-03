<?php

namespace App\Http\Requests;

use App\Models\Appointment;
use App\Models\Nursing;
use App\Models\User;
use Closure;
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

        $nurseIds = User::query()
            ->whereHas('teams', fn ($query) => $query->whereKey($teamId))
            ->pluck('id')
            ->all();

        $transferTo = $this->input('transferTo', 'doctor');

        return [
            'patient_id' => [
                'required',
                'string',
                function (string $attribute, mixed $value, Closure $fail) use ($teamId) {
                    $existsInAppointments = Appointment::query()
                        ->where('team_id', $teamId)
                        ->where('patient_id', $value)
                        ->whereIn('status', ['scheduled', 'started', 'completed'])
                        ->exists();

                    $existsInNursing = Nursing::query()
                        ->where('team_id', $teamId)
                        ->where('patient_id', $value)
                        ->whereIn('status', ['scheduled', 'started', 'completed'])
                        ->exists();

                    if (! $existsInAppointments && ! $existsInNursing) {
                        $fail('The selected patient does not have an active appointment or nursing record.');
                    }
                },
            ],
            'transferTo' => ['required', Rule::in(['doctor', 'nurse'])],
            'doctor_id' => $transferTo === 'doctor'
                ? ['required', 'integer', Rule::in($doctorIds)]
                : ['nullable', 'integer'],
            'nurse_id' => $transferTo === 'nurse'
                ? ['required', 'integer', Rule::in($nurseIds)]
                : ['nullable', 'integer'],
        ];
    }
}
