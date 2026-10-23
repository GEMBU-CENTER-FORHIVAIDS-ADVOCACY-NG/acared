<?php

use App\Models\User;
use Illuminate\Support\Facades\Auth;

use function Pest\Laravel\postJson;

test('valid credentials return an api token', function () {
    $user = User::factory()->create([
        'email' => 'doctor@acared.test',
        'password' => 'password',
    ]);

    $response = postJson('/api/auth/login', [
        'email' => 'doctor@acared.test',
        'password' => 'password',
    ]);

    $response->assertCreated()
        ->assertJsonPath('success', true)
        ->assertJsonPath('message', 'Login success.')
        ->assertJsonStructure(['success', 'message', 'token']);

    expect($user->tokens()->count())->toBe(1);
});

test('invalid credentials are rejected', function () {
    User::factory()->create([
        'email' => 'doctor@acared.test',
        'password' => 'password',
    ]);

    postJson('/api/auth/login', [
        'email' => 'doctor@acared.test',
        'password' => 'wrong-password',
    ])->assertUnauthorized()
        ->assertJsonPath('success', false)
        ->assertJsonPath('message', 'The provided credentials are incorrect.');
});

test('the login payload is validated', function () {
    postJson('/api/auth/login', [])
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['email', 'password']);
});

test('the token authenticates the api requests', function () {
    $user = User::factory()->create();
    $token = $user->createToken('test')->plainTextToken;

    $this->withToken($token)
        ->getJson('/api/user')
        ->assertOk()
        ->assertJsonPath('id', $user->getKey())
        ->assertJsonPath('email', $user->email)
        ->assertJsonMissingPath('password');
});

test('the logout endpoint revokes the token', function () {
    $user = User::factory()->create();
    $token = $user->createToken('test')->plainTextToken;

    $this->withToken($token)
        ->postJson('/api/auth/logout')
        ->assertOk()
        ->assertJsonPath('success', true)
        ->assertJsonPath('message', 'Logout success.');

    expect($user->tokens()->count())->toBe(0);

    Auth::forgetGuards();

    $this->withToken($token)
        ->getJson('/api/user')
        ->assertUnauthorized();
});

test('guests cannot reach the protected endpoints', function () {
    $this->getJson('/api/user')->assertUnauthorized();
    $this->getJson('/api/categories')->assertUnauthorized();
    $this->postJson('/api/categories', ['name' => 'Antenatal'])->assertUnauthorized();
});
