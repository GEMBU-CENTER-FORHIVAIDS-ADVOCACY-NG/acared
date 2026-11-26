<?php

beforeEach(function (): void {
    config(['api_v1.allow_roleless_permission_pass' => true]);
});

use App\Models\Category;
use App\Models\Country;
use App\Models\Lga;
use App\Models\Patient;
use App\Models\State;
use App\Models\User;

function v1PatientPayload(array $attributes = []): array
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

test('v1 creates patient in team context', function () {
    $user = User::factory()->create();
    $team = $user->currentTeam;
    $category = Category::factory()->create(['team_id' => $team->id]);
    $country = Country::factory()->create();
    $state = State::factory()->create();
    $lga = Lga::factory()->create();

    $this->actingAs($user, 'sanctum');

    $response = $this->withHeader('X-Team-Slug', $team->slug)
        ->postJson('/api/v1/patients', v1PatientPayload([
            'category_id' => $category->id,
            'country_id' => $country->id,
            'state_id' => $state->id,
            'lga_id' => $lga->id,
        ]));

    $response->assertCreated()
        ->assertJsonPath('data.first_name', 'Ada')
        ->assertJsonPath('data.category.id', $category->id);

    expect(Patient::query()->withoutGlobalScopes()->where('team_id', $team->id)->count())->toBe(1);
});

test('v1 lists only team patients', function () {
    $user = User::factory()->create();
    $team = $user->currentTeam;
    $category = Category::factory()->create(['team_id' => $team->id]);
    Patient::factory()->create(['team_id' => $team->id, 'category_id' => $category->id, 'firstName' => 'Mine']);
    Patient::factory()->create(['firstName' => 'Other']);

    $this->actingAs($user, 'sanctum');

    $this->withHeader('X-Team-Slug', $team->slug)
        ->getJson('/api/v1/patients')
        ->assertOk()
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.first_name', 'Mine');
});

test('v1 patient form options return categories and locations', function () {
    $user = User::factory()->create();
    $team = $user->currentTeam;
    Category::factory()->create(['team_id' => $team->id, 'name' => 'Antenatal']);

    $this->actingAs($user, 'sanctum');

    $this->withHeader('X-Team-Slug', $team->slug)
        ->getJson('/api/v1/patients/form-options')
        ->assertOk()
        ->assertJsonStructure(['data' => ['categories', 'countries', 'states', 'lgas']]);
});
