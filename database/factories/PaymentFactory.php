<?php

namespace Database\Factories;

use App\Models\Billing;
use App\Models\Method;
use App\Models\Patient;
use App\Models\Team;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Billing>
 */
class PaymentFactory extends Factory
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
            'user_id' => User::factory(),
            'billing_id' => Billing::factory()->selfBillable(),
            'method_id' => fn () => Method::factory()->create()->getKey(),
            'amount' => fake()->randomFloat(2, 100, 5000),
            'discount_percentage' => 0,
            'discount_amount' => 0,
            'wallet' => 0,
            'mercy_fund' => 0,
            'infant_formula' => 0,
        ];
    }
}
