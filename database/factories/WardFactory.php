<?php

namespace Database\Factories;

use App\Models\Team;
use App\Models\Ward;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Ward>
 */
class WardFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'team_id' => Team::factory(),
            'ward_id' => null,
            'is_ward' => true,
            'name' => fake()->unique()->word(),
            'description' => null,
            'capacity' => fake()->numberBetween(1, 20),
            'status' => 'available',
        ];
    }

    /**
     * Indicate that the row is a ward (not a bed).
     */
    public function ward(): static
    {
        return $this->state(fn (array $attributes) => ['is_ward' => true]);
    }

    /**
     * Indicate that the row is a bed belonging to the given ward.
     */
    public function bed(?Ward $ward = null): static
    {
        return $this->state(fn (array $attributes) => [
            'is_ward' => false,
            'ward_id' => $ward?->getKey() ?? Ward::factory()->ward(),
        ]);
    }
}
