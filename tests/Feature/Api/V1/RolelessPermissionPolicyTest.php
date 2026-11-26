<?php

use App\Models\User;

test('v1 roleless pass-through can be disabled by config', function () {
    config(['api_v1.allow_roleless_permission_pass' => false]);

    $user = User::factory()->create();
    $team = $user->currentTeam;

    $this->actingAs($user, 'sanctum');
    $this->withHeader('X-Team-Slug', $team->slug)
        ->getJson('/api/v1/patients')
        ->assertForbidden();
});

test('v1 roleless pass-through still allows when enabled', function () {
    config(['api_v1.allow_roleless_permission_pass' => true]);

    $user = User::factory()->create();
    $team = $user->currentTeam;

    $this->actingAs($user, 'sanctum');
    $this->withHeader('X-Team-Slug', $team->slug)
        ->getJson('/api/v1/patients')
        ->assertOk();
});
