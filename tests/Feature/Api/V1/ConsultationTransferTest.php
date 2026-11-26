<?php

use App\Models\Consultation;
use App\Models\Patient;
use App\Models\User;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

test('v1 consultation can be transferred to nurse', function () {
    $user = User::factory()->create();
    $team = $user->currentTeam;
    $nurse = User::factory()->create();
    $team->members()->attach($nurse->id, ['role' => 'member']);
    $patient = Patient::factory()->create(['team_id' => $team->id]);

    $role = Role::create(['name' => 'doctor_role_'.uniqid(), 'guard_name' => 'web']);
    foreach (['view consultations', 'update consultation'] as $permission) {
        Permission::findOrCreate($permission, 'web');
        $role->givePermissionTo($permission);
    }
    $user->assignRole($role);

    $consultation = Consultation::factory()->create([
        'team_id' => $team->id,
        'patient_id' => $patient->slug,
        'doctor_id' => $user->id,
        'status' => 'started',
    ]);

    $this->actingAs($user, 'sanctum');

    $this->withHeader('X-Team-Slug', $team->slug)
        ->postJson("/api/v1/consultations/{$consultation->id}/transfer", [
            'transferTo' => 'nurse',
            'nurse_id' => $nurse->id,
        ])
        ->assertOk()
        ->assertJsonPath('meta.transferred_to', 'nurse')
        ->assertJsonStructure(['data', 'meta' => ['nursing_id']]);
});
