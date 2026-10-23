<?php

use App\Models\User;

beforeEach(function () {
    $this->user = User::factory()->create();
    $this->withToken($this->user->createToken('test')->plainTextToken);
});

test('the user index only lists the users sharing a team with the authenticated user', function () {
    $colleague = User::factory()->create();
    $this->user->currentTeam->members()->attach($colleague, ['role' => 'member']);

    User::factory()->create();

    $this->getJson('/api/users')
        ->assertOk()
        ->assertJsonCount(2, 'data');
});

test('a user can be created and is attached to the current team', function () {
    $this->postJson('/api/users', [
        'name' => 'Nurse Joy',
        'email' => 'joy@acared.test',
        'password' => 'password',
    ])
        ->assertOk()
        ->assertJsonPath('message', 'Successfully Create Resource')
        ->assertJsonPath('data.name', 'Nurse Joy')
        ->assertJsonMissingPath('data.password');

    $created = User::where('email', 'joy@acared.test')->first();

    expect($created)->not->toBeNull()
        ->and($created->current_team_id)->toBe($this->user->currentTeam->getKey())
        ->and($created->teams->pluck('id')->all())->toContain($this->user->currentTeam->getKey());
});

test('creating a user validates the payload', function () {
    $this->postJson('/api/users', [])
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['name', 'email', 'password']);
});

test('a user can be fetched', function () {
    $this->getJson('/api/users/'.$this->user->getKey())
        ->assertOk()
        ->assertJsonPath('data.id', $this->user->getKey());
});
