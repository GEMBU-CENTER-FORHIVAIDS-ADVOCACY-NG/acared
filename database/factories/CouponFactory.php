<?php

namespace Database\Factories;

use App\Models\Coupon;
use App\Models\Patient;
use App\Models\Team;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Coupon>
 */
class CouponFactory extends Factory
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
            'code' => fake()->unique()->bothify('CPN-####??'),
            'type' => 'fixed',
            'value' => fake()->randomFloat(2, 1000, 10000),
            'max_uses' => null,
            'used_count' => 0,
            'min_billing_amount' => 0,
            'max_discount_amount' => null,
            'expires_at' => null,
            'is_active' => true,
        ];
    }
}
