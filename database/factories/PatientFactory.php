<?php

namespace Database\Factories;

use App\Models\Category;
use App\Models\Country;
use App\Models\Lga;
use App\Models\Patient;
use App\Models\State;
use App\Models\Team;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Patient>
 */
class PatientFactory extends Factory
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
            'category_id' => Category::factory(),
            'slug' => 'PAT-'.fake()->unique()->numerify('#####'),
            'firstName' => fake()->firstName(),
            'middleName' => fake()->optional()->firstName(),
            'lastName' => fake()->lastName(),
            'gender' => fake()->randomElement(['Male', 'Female']),
            'birthDate' => fake()->dateTimeBetween('-70 years', '-1 years')->format('Y-m-d'),
            'email' => fake()->unique()->safeEmail(),
            'phone' => fake()->numerify('0##########'),
            'mobile' => fake()->optional()->numerify('0##########'),
            'country_id' => Country::factory(),
            'state_id' => State::factory(),
            'lga_id' => Lga::factory(),
            'address' => fake()->address(),
        ];
    }

    /**
     * Indicate that the patient is a child (under 18).
     */
    public function child(): static
    {
        return $this->state(fn (array $attributes) => [
            'birthDate' => fake()->dateTimeBetween('-17 years', '-1 years')->format('Y-m-d'),
        ]);
    }

    /**
     * Indicate that the patient has been soft deleted.
     */
    public function trashed(): static
    {
        return $this->state(fn (array $attributes) => [
            'deleted_at' => now(),
        ]);
    }
}
