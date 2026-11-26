<?php

use App\Models\User;

use function Pest\Laravel\getJson;
use function Pest\Laravel\postJson;

test('v1 login returns token and user payload', function () {
    $user = User::factory()->create([
        'email' => 'doctor@acared.test',
        'password' => 'password',
    ]);

    postJson('/api/v1/auth/login', [
        'email' => 'doctor@acared.test',
        'password' => 'password',
        'device_name' => 'android',
    ])->assertOk()
        ->assertJsonStructure(['token', 'token_type', 'user' => ['id', 'name', 'email', 'teams']]);
});

test('v1 me returns authenticated user', function () {
    $user = User::factory()->create();

    $this->actingAs($user, 'sanctum');

    getJson('/api/v1/auth/me')
        ->assertOk()
        ->assertJsonPath('data.id', $user->id)
        ->assertJsonStructure(['data' => ['teams']]);
});

test('v1 logout revokes current token', function () {
    $user = User::factory()->create();
    $token = $user->createToken('android')->plainTextToken;

    $this->withToken($token)
        ->postJson('/api/v1/auth/logout')
        ->assertOk();

    expect($user->tokens()->count())->toBe(0);
});
