<?php

namespace App\Http\Resources\Api\V1;

use App\Models\Laboratory;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin Laboratory */
class LaboratoryResource extends JsonResource
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
            ] : null),
            'doctor' => $this->whenLoaded('doctor', fn () => $this->doctor ? [
                'id' => $this->doctor->id,
                'name' => $this->doctor->name,
            ] : null),
            'status' => $this->status,
            'total' => $this->total,
            'created_at' => $this->created_at?->toISOString(),
            'lines' => $this->whenLoaded('lines', fn () => $this->lines->map(fn ($line) => [
                'id' => $line->id,
                'price_list_id' => $line->price_list_id ?? null,
                'results' => $line->results ?? null,
            ])->values()),
        ];
    }
}
