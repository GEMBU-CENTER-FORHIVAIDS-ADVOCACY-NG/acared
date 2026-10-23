<?php

namespace App\Http\Controllers\Api\Resources\PriceLists\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class CreatePriceListRequest extends FormRequest
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
            'category_id' => ['nullable', 'integer', 'exists:price_lists,id'],
            'subcategory_id' => ['nullable', 'integer', 'exists:price_lists,id'],
            'parameter_id' => ['nullable', 'integer', 'exists:price_lists,id'],
            'result_type' => ['nullable', 'string', 'in:radio,number,text,select'],
            'options' => ['nullable', 'array'],
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'ranges' => ['nullable', 'string'],
            'uom' => ['nullable', 'string', 'max:1000'],
            'is_category' => ['nullable', 'boolean'],
            'is_inventory' => ['nullable', 'boolean'],
            'price' => ['nullable', 'numeric', 'min:0'],
        ];
    }
}
