<?php

namespace App\Http\Resources\Api\V1;

use App\Models\Billing;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin Billing */
class BillingResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'patient_id' => $this->patient_id,
            'patient' => $this->whenLoaded('patient', fn () => $this->patient ? [
                'slug' => $this->patient->slug,
                'first_name' => $this->patient->firstName,
                'last_name' => $this->patient->lastName,
                'full_name' => $this->patient->fullName ?? trim(($this->patient->firstName ?? '').' '.($this->patient->lastName ?? '')),
            ] : null),
            'user' => $this->whenLoaded('user', fn () => $this->user ? [
                'id' => $this->user->id,
                'name' => $this->user->name,
            ] : null),
            'billable_type' => $this->billable_type ? class_basename($this->billable_type) : null,
            'billable_id' => $this->billable_id,
            'total' => (float) $this->total,
            'status' => $this->status,
            'created_at' => $this->created_at?->toISOString(),
            'payments' => $this->whenLoaded('payments', fn () => $this->payments->map(fn ($payment) => [
                'id' => $payment->id,
                'method' => $payment->method?->name,
                'amount' => (float) ($payment->amount ?? 0),
                'discount_amount' => (float) ($payment->discount_amount ?? 0),
                'wallet' => (float) ($payment->wallet ?? 0),
                'mercy_fund' => (float) ($payment->mercy_fund ?? 0),
                'infant_formula' => (float) ($payment->infant_formula ?? 0),
                'user' => $payment->relationLoaded('user') && $payment->user ? ['id' => $payment->user->id, 'name' => $payment->user->name] : null,
            ])->values()),
            'lines' => $this->whenLoaded('lines', fn () => $this->lines->map(fn ($line) => [
                'id' => $line->id,
                'name' => $line->priceList?->name,
                'quantity' => $line->quantity,
                'unit_price' => (float) ($line->unitPrice ?? 0),
                'total_price' => (float) (($line->quantity ?? 1) * ($line->unitPrice ?? 0)),
            ])->values()),
        ];
    }
}
