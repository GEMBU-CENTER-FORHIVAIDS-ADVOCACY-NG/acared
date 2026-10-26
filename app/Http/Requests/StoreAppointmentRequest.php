<?php

namespace App\Http\Requests;

use App\Models\Billing;
use App\Models\Patient;
use App\Models\PriceList;
use App\Models\User;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreAppointmentRequest extends FormRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $teamId = $this->user()?->currentTeam?->getKey();

        $allUserIds = User::query()
            ->whereHas('teams', fn ($query) => $query->whereKey($teamId))
            ->pluck('id')
            ->all();

        return [
            'billing_id' => [
                'required',
                'integer',
                Rule::exists(Billing::class, 'id')->where(
                    fn ($query) => $query->where('team_id', $teamId)
                        ->whereIn('billable_type', [
                            Patient::class,
                            'Patient',
                            'App\\Models\\Patient',
                            Billing::class,
                            'Billing',
                            'App\\Models\\Billing',
                        ])
                        ->whereNotIn('status', ['started', 'completed', 'scheduled'])
                ),
            ],
            'doctor_id' => [
                'nullable',
                'integer',
                Rule::in($allUserIds),
            ],
            'nurse_id' => [
                'nullable',
                'integer',
                Rule::in($allUserIds),
            ],
            'starts_at' => ['required', 'date', 'after:now'],
            'purpose' => ['nullable', 'string'],
            'vital_signs' => ['nullable', 'array'],
            'vital_signs.*.price_list_id' => [
                'required',
                'integer',
                'distinct',
                Rule::exists(PriceList::class, 'id')->where('team_id', $teamId),
            ],
            'vital_signs.*.results' => ['required', 'string', 'max:1000'],
        ];
    }
}
