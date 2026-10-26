<?php

namespace App\Http\Requests\Teams;

use App\Enums\TeamRole;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules;

class StoreTeamUserRequest extends FormRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'min:7', Rules\Password::defaults()],
            'team_role' => ['required', 'string', Rule::in(array_column(TeamRole::assignable(), 'value'))],
            'spatie_roles' => ['sometimes', 'array'],
            'spatie_roles.*' => ['integer', 'exists:roles,id'],
        ];
    }
}
