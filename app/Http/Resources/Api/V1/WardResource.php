<?php

namespace App\Http\Resources\Api\V1;

use App\Models\Ward;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin Ward */
class WardResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'description' => $this->description,
            'capacity' => $this->capacity,
            'status' => $this->status,
            'is_ward' => (bool) $this->is_ward,
            'ward_id' => $this->ward_id,
            'beds_count' => $this->whenCounted('beds'),
            'active_admissions_count' => $this->whenCounted('active_admissions_count'),
            'beds' => $this->whenLoaded('beds', fn () => $this->beds->map(fn (Ward $bed) => [
                'id' => $bed->id,
                'name' => $bed->name,
                'status' => $bed->status,
                'ward_id' => $bed->ward_id,
            ])->values()),
        ];
    }
}
