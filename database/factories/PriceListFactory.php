<?php

namespace Database\Factories;

use App\Models\PriceList;
use App\Models\Team;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<PriceList>
 */
class PriceListFactory extends Factory
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
            'name' => fake()->unique()->bothify('Item-####-????'),
            'description' => null,
            'price' => fake()->randomFloat(2, 100, 5000),
            'is_category' => false,
            'is_inventory' => false,
        ];
    }
}
