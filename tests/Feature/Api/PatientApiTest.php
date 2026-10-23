<?php

use App\Models\Category;
use App\Models\Country;
use App\Models\Lga;
use App\Models\Patient;
use App\Models\State;
use App\Models\User;

beforeEach(function () {
    $this->user = User::factory()->create();
    $this->withToken($this->user->createToken('test')->plainTextToken);

    $this->category = Category::factory()->create([
        'team_id' => $this->user->currentTeam->getKey(),
    ]);
});

function apiPatientPayload(array $attributes = []): array
{
    return array_merge([
        'category_id' => null,
        'firstName' => 'Ada',
        'lastName' => 'Lovelace',
        'gender' => 'Female',
        'birthDate' => '1990-05-20',
        'phone' => '08012345678',
        'country_id' => null,
        'state_id' => null,
        'lga_id' => null,
        'address' => '1 Analytical Engine Way',
    ], $attributes);
}

test('a patient is created with a generated hospital number', function () {
    $country = Country::factory()->create();
    $state = State::factory()->create();
    $lga = Lga::factory()->create();

    $this->postJson('/api/patients', apiPatientPayload([
        'category_id' => $this->category->getKey(),
        'country_id' => $country->getKey(),
        'state_id' => $state->getKey(),
        'lga_id' => $lga->getKey(),
    ]))
        ->assertOk()
        ->assertJsonPath('message', 'Successfully Create Resource')
        ->assertJsonPath('data.firstName', 'Ada')
        ->assertJsonPath('data.team_id', $this->user->currentTeam->getKey());

    $patient = Patient::withoutGlobalScope('team')->where('firstName', 'Ada')->first();

    expect($patient)->not->toBeNull()
        ->and($patient->slug)->toStartWith('PAT-');
});

test('creating a patient validates the payload', function () {
    $this->postJson('/api/patients', [])
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['category_id', 'firstName', 'lastName', 'gender', 'birthDate', 'phone', 'country_id', 'state_id', 'lga_id', 'address']);
});

test('the patient index only lists the records of the current team', function () {
    Patient::factory()->create([
        'team_id' => $this->user->currentTeam->getKey(),
        'firstName' => 'Local',
    ]);
    Patient::factory()->create(['firstName' => 'Foreign']);

    $this->getJson('/api/patients')
        ->assertOk()
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.firstName', 'Local');
});

test('a patient of another team cannot be fetched', function () {
    $patient = Patient::factory()->create();

    $this->getJson('/api/patients/'.$patient->getKey())->assertNotFound();
});
