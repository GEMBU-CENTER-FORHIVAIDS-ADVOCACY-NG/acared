<?php

namespace Database\Factories;

use App\Models\Appointment;
use App\Models\Billing;
use App\Models\Patient;
use App\Models\Team;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Appointment>
 */
class AppointmentFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $startsAt = now()->addHour();

        return [
            'team_id' => Team::factory(),
            'patient_id' => fn () => Patient::factory()->create()->slug,
            'user_id' => User::factory(),
            'doctor_id' => User::factory(),
            'billing_id' => Billing::factory()->selfBillable(),
            'purpose' => fake()->sentence(),
            'status' => 'scheduled',
            'starts_at' => $startsAt,
            'ends_at' => $startsAt->copy()->addMinutes(30),
        ];
    }

    /**
     * Indicate that the appointment has been completed.
     */
    public function completed(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'completed',
        ]);
    }

    /**
     * Indicate that the appointment has started.
     */
    public function started(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'started',
        ]);
    }
}
