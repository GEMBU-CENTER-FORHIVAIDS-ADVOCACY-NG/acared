<?php

namespace App\Http\Controllers\Api\Resources\DrugInventories\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class CreateDrugInventoryRequest extends FormRequest
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
            'sku' => ['required', 'string', 'max:255'],
            'price_list_id' => ['required', 'integer', 'exists:price_lists,id'],
            'drug_form_id' => ['required', 'integer', 'exists:drug_forms,id'],
            'min_qty' => ['required', 'integer', 'min:0'],
            'quantity' => ['required', 'numeric', 'min:0'],
            'price' => ['required', 'numeric', 'min:0'],
            'cost' => ['required', 'numeric', 'min:0'],
            'status' => ['required', 'string', 'max:50'],
            'expires_at' => ['nullable', 'date'],
        ];
    }
}
