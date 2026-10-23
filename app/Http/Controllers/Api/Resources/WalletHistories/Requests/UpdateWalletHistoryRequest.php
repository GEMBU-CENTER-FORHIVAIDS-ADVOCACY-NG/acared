<?php

namespace App\Http\Controllers\Api\Resources\WalletHistories\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class UpdateWalletHistoryRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'patient_id' => ['required', 'string', 'exists:patients,slug'],
            'user_id' => ['nullable', 'integer', 'exists:users,id'],
            'payment_id' => ['nullable', 'integer', 'exists:payments,id'],
            'method_id' => ['required', 'integer', 'exists:methods,id'],
            'credit' => ['required', 'numeric', 'min:0'],
            'debit' => ['required', 'numeric', 'min:0'],
        ];
    }
}
