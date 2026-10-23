<?php

namespace App\Concerns;

use App\Models\Billing;
use App\Models\Coupon;
use App\Models\Method;
use App\Models\User;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Validation\Rule;

trait BillingValidationRules
{
    /**
     * Get the validation rules used to record a bill payment.
     *
     * @return array<string, array<int, ValidationRule| array<mixed>|string>>
     */
    protected function paymentRules(?User $user = null): array
    {
        $teamId = $user?->currentTeam?->getKey();

        return [
            'billing_id' => [
                'required',
                'integer',
                Rule::exists(Billing::class, 'id')->where(
                    fn ($query) => $query->where('team_id', $teamId)->where('status', 'billed')
                ),
            ],
            'payments' => ['required', 'array', 'min:1'],
            'payments.*.method_id' => [
                'required',
                'integer',
                Rule::exists(Method::class, 'id')->where(
                    fn ($query) => $query->where('team_id', $teamId)
                ),
            ],
            'payments.*.amount' => ['nullable', 'numeric', 'min:0'],
            'payments.*.discount_percentage' => ['nullable', 'integer', 'min:0', 'max:100'],
            'payments.*.discount_amount' => ['nullable', 'numeric', 'min:0'],
            'payments.*.coupon_id' => [
                'nullable',
                'integer',
                Rule::exists(Coupon::class, 'id')->where(
                    fn ($query) => $query->where('team_id', $teamId)
                ),
            ],
            'payments.*.coupon_discount_amount' => ['nullable', 'numeric', 'min:0'],
            'payments.*.wallet_debit' => ['nullable', 'numeric', 'min:0'],
        ];
    }
}
