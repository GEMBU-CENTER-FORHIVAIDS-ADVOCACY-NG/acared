<?php

use App\Models\Category;
use App\Models\User;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

test('v1 denies users with role missing permission', function () {
    $user = User::factory()->create();
    $team = $user->currentTeam;
    $role = Role::create(['name' => 'limited_'.uniqid(), 'guard_name' => 'web']);
    Permission::findOrCreate('view patients', 'web');
    $role->givePermissionTo('view patients');
    $user->assignRole($role);

    $this->actingAs($user, 'sanctum');
    $this->withHeader('X-Team-Slug', $team->slug)
        ->postJson('/api/v1/patients', [
            'slug' => 'P-1',
            'firstName' => 'A',
            'lastName' => 'B',
            'gender' => 'male',
            'category_id' => Category::factory()->create(['team_id' => $team->id])->id,
        ])->assertForbidden()->assertJsonPath('success', false);
});

test('v1 roleless user is denied by default (policy tightened)', function () {
    config(['api_v1.allow_roleless_permission_pass' => false]);
    $user = User::factory()->create();
    $team = $user->currentTeam;
    expect($user->roles)->toBeEmpty();

    $this->actingAs($user, 'sanctum');
    $this->withHeader('X-Team-Slug', $team->slug)
        ->getJson('/api/v1/patients')
        ->assertForbidden()
        ->assertJsonPath('success', false);
});

test('v1 roleless user can be allowed only with explicit legacy config', function () {
    config(['api_v1.allow_roleless_permission_pass' => true]);
    $user = User::factory()->create();
    $team = $user->currentTeam;

    $this->actingAs($user, 'sanctum');
    $this->withHeader('X-Team-Slug', $team->slug)
        ->getJson('/api/v1/patients')
        ->assertOk();
});

test('v1 billing pay requires create billing permission for role users', function () {
    $user = User::factory()->create();
    $team = $user->currentTeam;
    $role = Role::create(['name' => 'viewer_'.uniqid(), 'guard_name' => 'web']);
    Permission::findOrCreate('view billing', 'web');
    $role->givePermissionTo('view billing');
    $user->assignRole($role);

    $this->actingAs($user, 'sanctum');
    $this->withHeader('X-Team-Slug', $team->slug)
        ->postJson('/api/v1/billings/pay', ['billing_id' => 1, 'payments' => []])
        ->assertForbidden();
});

test('v1 denies sensitive ward write without permission', function () {
    $user = User::factory()->create();
    $team = $user->currentTeam;
    $role = Role::create(['name' => 'nurse_view_'.uniqid(), 'guard_name' => 'web']);
    Permission::findOrCreate('view nursing', 'web');
    $role->givePermissionTo('view nursing');
    $user->assignRole($role);

    $this->actingAs($user, 'sanctum');
    $this->withHeader('X-Team-Slug', $team->slug)
        ->postJson('/api/v1/wards', ['name' => 'X', 'capacity' => 1])
        ->assertForbidden()
        ->assertJsonPath('success', false);
});

test('v1 denies sensitive billing create without permission', function () {
    $user = User::factory()->create();
    $team = $user->currentTeam;
    $role = Role::create(['name' => 'billing_view_'.uniqid(), 'guard_name' => 'web']);
    Permission::findOrCreate('view billing', 'web');
    $role->givePermissionTo('view billing');
    $user->assignRole($role);

    $this->actingAs($user, 'sanctum');
    $this->withHeader('X-Team-Slug', $team->slug)
        ->postJson('/api/v1/billings', ['patient_id' => 'P1', 'billings' => []])
        ->assertForbidden();
});
