<?php

use App\Models\User;

test('v1 envelopes include success and message on error', function () {
    $this->getJson('/api/v1/auth/me')
        ->assertUnauthorized()
        ->assertJsonPath('success', false)
        ->assertJsonPath('message', 'Unauthenticated.');
});

test('v1 team context error is enveloped', function () {
    $user = User::factory()->create();
    $this->actingAs($user, 'sanctum');

    $this->getJson('/api/v1/patients')
        ->assertStatus(400)
        ->assertJsonPath('success', false)
        ->assertJsonPath('message', 'Team context is required. Provide X-Team-Slug or X-Team-ID header.');
});
