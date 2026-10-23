<?php

namespace Database\Factories;

use App\Models\Patient;
use App\Models\Team;
use App\Models\Treatment;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Treatment>
 */
class TreatmentFactory extends Factory
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
            'appointment_id' => null,
            'user_id' => User::factory(),
            'status' => 'pending',
            'total' => fake()->randomFloat(2, 100, 5000),
        ];
    }
}
