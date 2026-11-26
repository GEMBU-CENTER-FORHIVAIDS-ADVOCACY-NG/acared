<?php

namespace App\Http\Resources\Api\V1;

use App\Models\Consultation;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin Consultation */
class ConsultationResource extends JsonResource
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
            ] : null),
            'doctor' => $this->whenLoaded('doctor', fn () => $this->doctor ? [
                'id' => $this->doctor->id,
                'name' => $this->doctor->name,
            ] : null),
            'status' => $this->status,
            'purpose' => $this->purpose,
            'starts_at' => $this->starts_at?->toISOString(),
            'ends_at' => $this->ends_at?->toISOString(),
            'appointment_id' => $this->appointment_id,
            'billing_id' => $this->billing_id,
        ];
    }
}
