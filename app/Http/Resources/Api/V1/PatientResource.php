<?php

namespace App\Http\Resources\Api\V1;

use App\Models\Patient;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin Patient */
class PatientResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'slug' => $this->slug,
            'first_name' => $this->firstName,
            'middle_name' => $this->middleName,
            'last_name' => $this->lastName,
            'gender' => $this->gender,
            'birth_date' => optional($this->birthDate)->toDateString(),
            'email' => $this->email,
            'phone' => $this->phone,
            'address' => $this->address,
            'category' => $this->whenLoaded('category', fn () => [
                'id' => $this->category->id,
                'name' => $this->category->name,
            ]),
            'country_id' => $this->country_id,
            'state_id' => $this->state_id,
            'lga_id' => $this->lga_id,
            'created_at' => $this->created_at?->toISOString(),
        ];
    }
}
