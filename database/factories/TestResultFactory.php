<?php

namespace Database\Factories;

use App\Models\Line;
use App\Models\Patient;
use App\Models\PriceList;
use App\Models\Team;
use App\Models\TestResult;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<TestResult>
 */
class TestResultFactory extends Factory
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
            'line_id' => Line::factory(),
            'price_list_id' => PriceList::factory(),
            'result' => fake()->word(),
        ];
    }
}
