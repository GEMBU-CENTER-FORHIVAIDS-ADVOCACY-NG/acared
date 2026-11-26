<?php

namespace App\Http\Resources\Api\V1;

use App\Models\Nursing;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin Nursing */
class NursingResource extends JsonResource
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
            'nurse' => $this->whenLoaded('nurse', fn () => $this->nurse ? [
                'id' => $this->nurse->id,
                'name' => $this->nurse->name,
            ] : null),
            'status' => $this->status,
            'starts_at' => $this->starts_at?->toISOString(),
            'ends_at' => $this->ends_at?->toISOString(),
            'vitals' => $this->whenLoaded('vitals', fn () => $this->vitals->map(fn ($vital) => [
                'id' => $vital->id,
                'created_at' => $vital->created_at?->toISOString(),
            ])->values()),
        ];
    }
}
