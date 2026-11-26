<?php

use App\Models\User;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

test('v1 team endpoint forbids user without required permission', function () {
    $user = User::factory()->create();
    $team = $user->currentTeam;

    $role = Role::create(['name' => 'limited', 'guard_name' => 'web']);
    $user->assignRole($role);

    $this->actingAs($user, 'sanctum');

    $this->withHeader('X-Team-Slug', $team->slug)
        ->getJson('/api/v1/patients')
        ->assertForbidden();
});

test('v1 team endpoint allows user with required permission', function () {
    Permission::findOrCreate('view patients', 'web');
    $user = User::factory()->create();
    $team = $user->currentTeam;

    $role = Role::create(['name' => 'viewer', 'guard_name' => 'web']);
    $role->givePermissionTo('view patients');
    $user->assignRole($role);

    $this->actingAs($user, 'sanctum');

    $this->withHeader('X-Team-Slug', $team->slug)
        ->getJson('/api/v1/patients')
        ->assertOk();
});
