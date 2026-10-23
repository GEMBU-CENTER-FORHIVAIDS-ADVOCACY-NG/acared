<?php

namespace Database\Factories;

use App\Models\Inventory;
use App\Models\Markup;
use App\Models\OrderItem;
use App\Models\PurchaseOrder;
use App\Models\Team;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<OrderItem>
 */
class OrderItemFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $quantity = fake()->numberBetween(1, 20);
        $unitCost = fake()->randomFloat(2, 50, 1000);
        $unitPrice = $unitCost * 1.25;

        return [
            'team_id' => Team::factory(),
            'purchase_order_id' => PurchaseOrder::factory(),
            'inventory_id' => Inventory::factory(),
            'markup_id' => Markup::factory(),
            'quantity' => $quantity,
            'unitPrice' => $unitPrice,
            'unitCost' => $unitCost,
            'totalPrice' => $quantity * $unitPrice,
            'totalCost' => $quantity * $unitCost,
            'expires_at' => now()->addYear(),
        ];
    }
}
