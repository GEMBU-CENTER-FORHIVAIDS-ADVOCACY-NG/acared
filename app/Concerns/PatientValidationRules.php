<?php

namespace App\Concerns;

use App\Models\Category;
use App\Models\User;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Validation\Rule;

trait PatientValidationRules
{
    /**
     * Get the validation rules used to validate patient records.
     *
     * The hospital number (`slug`) is readonly, so it is only validated when
     * creating a new patient. When `$ignoreId` is given, the unique rules
     * ignore that patient (used when updating).
     *
     * @return array<string, array<int, ValidationRule|array<mixed>|string>>
     */
    protected function patientRules(?User $user = null, ?int $ignoreId = null, bool $includeSlug = true): array
    {
        $teamId = $user?->currentTeam?->getKey();

        $rules = [
            'art' => $this->patientUniqueRule('art', $ignoreId),
            'slugOther' => $this->patientUniqueRule('slugOther', $ignoreId),
            'category_id' => [
                'required',
                'integer',
                Rule::exists(Category::class, 'id')->where(fn ($query) => $query->where('team_id', $teamId)),
            ],
            'firstName' => ['required', 'string', 'max:255'],
            'middleName' => ['nullable', 'string', 'max:255'],
            'lastName' => ['required', 'string', 'max:255'],
            'gender' => ['required', Rule::in(['Male', 'Female'])],
            'birthDate' => ['required', 'date'],
            'maritalStatus' => ['nullable', 'string', 'max:255'],
            'email' => ['nullable', 'string', 'max:255', 'email', ...$this->patientUniqueIgnore('email', $ignoreId)],
            'phone' => ['required', 'string', 'max:255'],
            'mobile' => $this->patientUniqueRule('mobile', $ignoreId),
            'country_id' => ['required', 'integer', 'exists:countries,id'],
            'state_id' => ['required', 'integer', 'exists:states,id'],
            'lga_id' => ['required', 'integer', 'exists:lgas,id'],
            'address' => ['required', 'string'],
            'kinFullName' => ['nullable', 'string', 'max:255'],
            'kinPhone' => ['nullable', 'string', 'max:255'],
            'kinEmail' => ['nullable', 'string', 'max:255', 'email'],
            'relation' => ['nullable', 'string', 'max:255'],
        ];

        if ($includeSlug) {
            $rules['slug'] = $this->patientUniqueRule('slug', $ignoreId);
        }

        return $rules;
    }

    /**
     * Get a nullable, unique validation rule for a patients table column.
     *
     * @return array<int, ValidationRule|array<mixed>|string>
     */
    protected function patientUniqueRule(string $column, ?int $ignoreId = null): array
    {
        return ['nullable', 'string', 'max:255', ...$this->patientUniqueIgnore($column, $ignoreId)];
    }

    /**
     * Get the unique-ignore portion of a patients validation rule.
     *
     * @return array<int, ValidationRule|array<mixed>|string>
     */
    protected function patientUniqueIgnore(string $column, ?int $ignoreId = null): array
    {
        $rule = Rule::unique('patients', $column);

        if ($ignoreId !== null) {
            $rule = $rule->ignore($ignoreId);
        }

        return [$rule];
    }
}
