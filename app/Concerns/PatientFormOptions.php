<?php

namespace App\Concerns;

use App\Models\Category;
use App\Models\Country;
use App\Models\Lga;
use App\Models\State;

trait PatientFormOptions
{
    /**
     * Get the patient form options (categories and location lookups).
     *
     * @return array{categories: array<int, array{id: int, name: string}>, countries: array<int, array{id: int, name: string}>, states: array<int, array{id: int, name: string}>, lgas: array<int, array{id: int, stateId: int, name: string}>}
     */
    protected function patientFormOptions(): array
    {
        return [
            'categories' => Category::query()->orderBy('name')->get()
                ->map(fn (Category $category) => ['id' => $category->getKey(), 'name' => $category->name])
                ->all(),
            'countries' => Country::query()->orderBy('name')->get()
                ->map(fn (Country $country) => ['id' => $country->getKey(), 'name' => $country->name])
                ->all(),
            'states' => State::query()->orderBy('name')->get()
                ->map(fn (State $state) => ['id' => $state->getKey(), 'name' => $state->name])
                ->all(),
            'lgas' => Lga::query()->orderBy('name')->get()
                ->map(fn (Lga $lga) => ['id' => $lga->getKey(), 'stateId' => $lga->state_id, 'name' => $lga->name])
                ->all(),
        ];
    }
}
