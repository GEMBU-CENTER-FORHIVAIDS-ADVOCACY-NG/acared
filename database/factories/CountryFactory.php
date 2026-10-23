<?php

namespace Database\Factories;

use App\Models\Country;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Country>
 */
class CountryFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $name = fake()->unique()->country();

        return [
            'alpha2' => fake()->unique()->countryCode('alpha-2'),
            'alpha3' => fake()->unique()->countryCode('alpha-3'),
            'name' => $name,
        ];
    }
}
