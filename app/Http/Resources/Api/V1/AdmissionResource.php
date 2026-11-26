<?php

namespace App\Http\Resources\Api\V1;

use App\Models\Admission;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin Admission */
class AdmissionResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'patient' => $this->whenLoaded('patient', fn () => $this->patient ? [
                'slug' => $this->patient->slug,
                'first_name' => $this->patient->firstName,
                'last_name' => $this->patient->lastName,
                'full_name' => $this->patient->fullName ?? trim(($this->patient->firstName ?? '').' '.($this->patient->lastName ?? '')),
            ] : null),
            'doctor' => $this->whenLoaded('doctor', fn () => $this->doctor ? [
                'id' => $this->doctor->id,
                'name' => $this->doctor->name,
            ] : null),
            'ward' => $this->whenLoaded('ward', fn () => $this->ward ? [
                'id' => $this->ward->id,
                'name' => $this->ward->name,
            ] : null),
            'bed' => $this->whenLoaded('bed', fn () => $this->bed ? [
                'id' => $this->bed->id,
                'name' => $this->bed->name,
            ] : null),
            'ward_id' => $this->ward_id,
            'bed_id' => $this->bed_id,
            'notes' => $this->notes,
            'duration' => $this->duration,
            'status' => $this->status,
            'created_at' => $this->created_at?->toISOString(),
        ];
    }
}
