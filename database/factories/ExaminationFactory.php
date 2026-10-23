<?php

namespace Database\Factories;

use App\Models\Examination;
use App\Models\Patient;
use App\Models\Team;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Examination>
 */
class ExaminationFactory extends Factory
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
            'appointment_id' => null,
            'notes' => [
                'Hair' => 'Normal',
                'Ear' => 'Normal',
                'Eye' => 'Normal',
            ],
        ];
    }
}
