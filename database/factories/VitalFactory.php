<?php

namespace Database\Factories;

use App\Models\Patient;
use App\Models\Team;
use App\Models\User;
use App\Models\Vital;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Vital>
 */
class VitalFactory extends Factory
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
            'nursing_id' => null,
            'user_id' => User::factory(),
        ];
    }
}
