<?php

namespace Database\Factories;

use App\Models\Admission;
use App\Models\Patient;
use App\Models\Team;
use App\Models\User;
use App\Models\Ward;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Admission>
 */
class AdmissionFactory extends Factory
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
            'doctor_id' => User::factory(),
            'ward_id' => Ward::factory()->ward(),
            'bed_id' => null,
            'appointment_id' => null,
            'notes' => fake()->sentence(),
            'duration' => fake()->numberBetween(1, 14),
            'status' => 'pending',
        ];
    }
}
