<?php

use App\Models\User;
use App\Models\Ward;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

test('v1 can create update and delete ward', function () {
    $user = User::factory()->create();
    $team = $user->currentTeam;
    $role = Role::create(['name' => 'ward_'.uniqid(), 'guard_name' => 'web']);
    foreach (['view nursing', 'create ward', 'update ward', 'delete ward'] as $perm) {
        Permission::findOrCreate($perm, 'web');
        $role->givePermissionTo($perm);
    }
    $user->assignRole($role);

    $this->actingAs($user, 'sanctum');
    $h = ['X-Team-Slug' => $team->slug];

    $res = $this->withHeaders($h)->postJson('/api/v1/wards', [
        'name' => 'Ward A',
        'capacity' => 2,
        'beds' => [['name' => 'Bed 1']],
    ])->assertCreated()->assertJsonPath('message', 'Ward created.');

    $wardId = $res->json('data.id');

    $this->withHeaders($h)->putJson("/api/v1/wards/{$wardId}", [
        'name' => 'Ward A1',
        'capacity' => 2,
        'beds' => [['id' => Ward::where('is_ward', false)->first()->id, 'name' => 'Bed 1A']],
    ])->assertOk()->assertJsonPath('message', 'Ward updated.');

    $this->withHeaders($h)->deleteJson("/api/v1/wards/{$wardId}")
        ->assertOk()->assertJsonPath('message', 'Ward deleted.');
});

test('v1 can bulk delete restore and force delete wards', function () {
    $user = User::factory()->create();
    $team = $user->currentTeam;
    $role = Role::create(['name' => 'ward_admin_'.uniqid(), 'guard_name' => 'web']);
    foreach (['view nursing', 'create ward', 'update ward', 'delete ward', 'update nursing'] as $perm) {
        Permission::findOrCreate($perm, 'web');
        $role->givePermissionTo($perm);
    }
    $user->assignRole($role);

    $ward = Ward::create(['team_id' => $team->id, 'is_ward' => true, 'name' => 'Bulk Ward', 'capacity' => 1, 'status' => 'available']);
    $ward->beds()->create(['team_id' => $team->id, 'is_ward' => false, 'name' => 'B1', 'status' => 'available']);

    $this->actingAs($user, 'sanctum');
    $this->withHeader('X-Team-Slug', $team->slug)
        ->postJson('/api/v1/wards/bulk-delete', ['ids' => [$ward->id]])
        ->assertOk()
        ->assertJsonPath('success', true);

    $this->withHeader('X-Team-Slug', $team->slug)
        ->postJson("/api/v1/wards/{$ward->id}/restore")
        ->assertOk()
        ->assertJsonPath('data.id', $ward->id);

    $this->withHeader('X-Team-Slug', $team->slug)
        ->deleteJson("/api/v1/wards/{$ward->id}")
        ->assertOk();

    $this->withHeader('X-Team-Slug', $team->slug)
        ->deleteJson("/api/v1/wards/{$ward->id}/force")
        ->assertOk()
        ->assertJsonPath('message', 'Ward permanently deleted.');
});
