<?php

namespace App\Http\Requests\Api\V1;

use App\Models\User;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class TransferNursingRequest extends FormRequest
{
    /**
     * @return array<string, array<int, ValidationRule|array<mixed>|string>>
     */
    public function rules(): array
    {
        $team = $this->attributes->get('currentTeam');
        $staffIds = User::query()
            ->whereHas('teams', fn ($query) => $query->whereKey($team?->id))
            ->pluck('id')
            ->all();

        $transferTo = $this->input('transferTo');

        return [
            'transferTo' => ['required', Rule::in(['doctor', 'nurse'])],
            'doctor_id' => $transferTo === 'doctor' ? ['required', 'integer', Rule::in($staffIds)] : ['nullable', 'integer'],
            'nurse_id' => $transferTo === 'nurse' ? ['required', 'integer', Rule::in($staffIds)] : ['nullable', 'integer'],
        ];
    }
}
