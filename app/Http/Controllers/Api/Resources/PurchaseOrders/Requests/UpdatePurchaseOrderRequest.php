<?php

namespace App\Http\Controllers\Api\Resources\PurchaseOrders\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class UpdatePurchaseOrderRequest extends FormRequest
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
            'slug' => ['nullable', 'string', 'max:255'],
            'vendor_id' => ['required', 'integer', 'exists:vendors,id'],
            'user_id' => ['nullable', 'integer', 'exists:users,id'],
            'subPrice' => ['required', 'numeric', 'min:0'],
            'subCost' => ['required', 'numeric', 'min:0'],
            'discount' => ['required', 'numeric', 'min:0'],
            'total' => ['required', 'numeric', 'min:0'],
            'status' => ['required', 'string', 'max:50'],
        ];
    }
}
