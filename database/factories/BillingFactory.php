<?php

namespace Database\Factories;

use App\Models\Billing;
use App\Models\Patient;
use App\Models\Team;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Billing>
 */
class BillingFactory extends Factory
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
            'billable_type' => null,
            'billable_id' => null,
            'total' => fake()->randomFloat(2, 1000, 50000),
            'status' => 'paid',
        ];
    }

    /**
     * Indicate that the billing is a top-level (self) billable record.
     */
    public function selfBillable(): static
    {
        return $this->state(fn (array $attributes) => [
            'billable_type' => Billing::class,
        ]);
    }
}
