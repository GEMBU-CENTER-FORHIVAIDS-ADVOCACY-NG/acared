<?php

namespace Database\Factories;

use App\Models\DrugForm;
use App\Models\Inventory;
use App\Models\PriceList;
use App\Models\Team;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Inventory>
 */
class InventoryFactory extends Factory
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
            'sku' => 'INV-'.Str::upper(Str::random(6)),
            'price_list_id' => PriceList::factory(),
            'drug_form_id' => DrugForm::factory(),
            'min_qty' => 5,
            'quantity' => fake()->numberBetween(0, 100),
            'price' => fake()->randomFloat(2, 100, 5000),
            'cost' => fake()->randomFloat(2, 50, 2500),
            'status' => 'available',
            'expires_at' => now()->addYear(),
        ];
    }
}
