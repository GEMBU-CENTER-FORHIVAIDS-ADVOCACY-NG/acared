<?php

namespace Database\Factories;

use App\Models\Inventory;
use App\Models\Stock;
use App\Models\Team;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Stock>
 */
class StockFactory extends Factory
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
            'user_id' => User::factory(),
            'inventory_id' => Inventory::factory(),
            'quantity' => fake()->numberBetween(1, 50),
            'stockable_type' => Inventory::class,
            'stockable_id' => fn (array $attributes) => $attributes['inventory_id'],
            'receivable_type' => User::class,
            'receivable_id' => User::factory(),
            'status' => 'Adjusted',
        ];
    }
}
