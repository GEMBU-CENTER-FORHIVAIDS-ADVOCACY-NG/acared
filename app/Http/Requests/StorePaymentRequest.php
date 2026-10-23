<?php

namespace App\Http\Requests;

use App\Concerns\BillingValidationRules;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StorePaymentRequest extends FormRequest
{
    use BillingValidationRules;

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, array<int, ValidationRule|array<mixed>|string>>
     */
    public function rules(): array
    {
        return $this->paymentRules($this->user());
    }

    /**
     * Get custom error messages for validation rules.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'billing_id.required' => 'Please select a bill to pay.',
            'billing_id.exists' => 'The selected bill is no longer available.',
            'payments.required' => 'Please add at least one payment.',
            'payments.array' => 'Invalid payment data.',
            'payments.min' => 'Please add at least one payment.',
            'payments.*.method_id.required' => 'Please select a payment method for each payment row.',
            'payments.*.method_id.exists' => 'The selected payment method is no longer available.',
            'payments.*.amount.numeric' => 'The payment amount must be a number.',
            'payments.*.amount.min' => 'The payment amount cannot be negative.',
            'payments.*.discount_percentage.integer' => 'The discount percentage must be a whole number.',
            'payments.*.discount_percentage.min' => 'The discount percentage cannot be negative.',
            'payments.*.discount_percentage.max' => 'The discount percentage cannot exceed 100%.',
            'payments.*.discount_amount.numeric' => 'The discount amount must be a number.',
            'payments.*.discount_amount.min' => 'The discount amount cannot be negative.',
            'payments.*.coupon_discount_amount.numeric' => 'The coupon discount amount must be a number.',
            'payments.*.coupon_discount_amount.min' => 'The coupon discount amount cannot be negative.',
            'payments.*.wallet_debit.numeric' => 'The wallet debit amount must be a number.',
            'payments.*.wallet_debit.min' => 'The wallet debit amount cannot be negative.',
        ];
    }
}
