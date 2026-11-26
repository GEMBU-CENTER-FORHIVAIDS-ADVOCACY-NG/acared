<?php

beforeEach(function (): void {
    config(['api_v1.allow_roleless_permission_pass' => true]);
});

use App\Models\Category;
use App\Models\Team;
use App\Models\User;

test('v1 team-scoped endpoint requires team header', function () {
    $user = User::factory()->create();
    $this->actingAs($user, 'sanctum');

    $this->getJson('/api/v1/patients')
        ->assertStatus(400)
        ->assertJsonPath('message', 'Team context is required. Provide X-Team-Slug or X-Team-ID header.');
});

test('v1 team-scoped endpoint rejects non-member team', function () {
    $user = User::factory()->create();
    $otherTeam = Team::factory()->create();
    $this->actingAs($user, 'sanctum');

    $this->withHeader('X-Team-Slug', $otherTeam->slug)
        ->getJson('/api/v1/patients')
        ->assertForbidden();
});

test('v1 lists teams for authenticated user', function () {
    $user = User::factory()->create();
    $otherTeam = Team::factory()->create();
    $otherTeam->members()->attach($user, ['role' => 'member']);

    $this->actingAs($user, 'sanctum');

    $this->getJson('/api/v1/teams')
        ->assertOk()
        ->assertJsonCount(2, 'data');
});

test('v1 team context scopes category queries', function () {
    $user = User::factory()->create();
    $team = $user->currentTeam;
    $otherTeam = Team::factory()->create();

    Category::factory()->create(['team_id' => $team->id, 'name' => 'Mine']);
    Category::factory()->create(['team_id' => $otherTeam->id, 'name' => 'Theirs']);

    $this->actingAs($user, 'sanctum');

    $this->withHeader('X-Team-Slug', $team->slug)
        ->getJson('/api/v1/categories')
        ->assertOk()
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.name', 'Mine');
});
