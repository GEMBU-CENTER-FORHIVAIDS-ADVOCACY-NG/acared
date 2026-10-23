<?php

namespace Database\Factories;

use App\Models\PurchaseOrder;
use App\Models\Team;
use App\Models\User;
use App\Models\Vendor;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<PurchaseOrder>
 */
class PurchaseOrderFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $subCost = fake()->randomFloat(2, 1000, 50000);

        return [
            'team_id' => Team::factory(),
            'slug' => 'PUR-'.Str::upper(Str::random(6)),
            'vendor_id' => Vendor::factory(),
            'user_id' => User::factory(),
            'subPrice' => $subCost * 1.2,
            'subCost' => $subCost,
            'discount' => 0,
            'total' => $subCost,
            'status' => 'pending',
        ];
    }
}
