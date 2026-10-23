<?php

namespace App\Concerns;

use App\Models\User;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Validation\Rule;

trait CategoryValidationRules
{
    /**
     * Get the validation rules used to validate patient categories.
     *
     * @return array<string, array<int, ValidationRule|array<mixed>|string>>
     */
    protected function categoryRules(?User $user = null, ?int $ignoreId = null): array
    {
        $teamId = $user?->currentTeam?->getKey();

        $uniqueName = Rule::unique('categories', 'name')
            ->where(fn ($query) => $query->where('team_id', $teamId));

        if ($ignoreId !== null) {
            $uniqueName = $uniqueName->ignore($ignoreId);
        }

        return [
            'name' => ['required', 'string', 'max:255', $uniqueName],
            'discount_percentage' => ['required', 'integer', 'min:0', 'max:100'],
            'description' => ['nullable', 'string'],
        ];
    }
}
