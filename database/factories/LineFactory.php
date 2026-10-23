<?php

namespace Database\Factories;

use App\Models\Line;
use App\Models\Patient;
use App\Models\PriceList;
use App\Models\Team;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Line>
 */
class LineFactory extends Factory
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
            'patient_id' => fn () => Patient::factory()->create()->slug,
            'user_id' => null,
            'lineable_type' => null,
            'lineable_id' => null,
            'price_list_id' => PriceList::factory(),
            'quantity' => fake()->numberBetween(1, 5),
            'unitPrice' => fake()->randomFloat(2, 100, 5000),
        ];
    }
}
