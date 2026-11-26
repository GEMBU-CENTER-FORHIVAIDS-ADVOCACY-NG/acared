<?php

use App\Models\Billing;
use App\Models\Patient;
use App\Models\User;
use App\Models\Ward;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

function v1CreateUser(array $permissions): array
{
    $user = User::factory()->create();
    $team = $user->currentTeam;
    $role = Role::create(['name' => 'cr_'.uniqid(), 'guard_name' => 'web']);
    foreach ($permissions as $permission) {
        Permission::findOrCreate($permission, 'web');
        $role->givePermissionTo($permission);
    }
    $user->assignRole($role);

    return [$user, $team];
}

test('v1 can create consultation directly', function () {
    [$user, $team] = v1CreateUser(['view consultations', 'create consultation']);
    $patient = Patient::factory()->create(['team_id' => $team->id]);
    $billing = Billing::query()->create([
        'team_id' => $team->id,
        'patient_id' => $patient->slug,
        'user_id' => $user->id,
        'total' => 0,
        'status' => 'paid',
    ]);

    $this->actingAs($user, 'sanctum');
    $this->withHeader('X-Team-Slug', $team->slug)
        ->postJson('/api/v1/consultations', [
            'patient_id' => $patient->slug,
            'doctor_id' => $user->id,
            'billing_id' => $billing->id,
            'purpose' => 'Checkup',
        ])->assertCreated()
        ->assertJsonPath('message', 'Consultation created.')
        ->assertJsonPath('data.patient_id', $patient->slug);
});

test('v1 can create admission directly', function () {
    [$user, $team] = v1CreateUser(['view nursing', 'create admission']);
    $patient = Patient::factory()->create(['team_id' => $team->id]);
    $ward = Ward::factory()->create(['team_id' => $team->id, 'is_ward' => true]);

    $this->actingAs($user, 'sanctum');
    $this->withHeader('X-Team-Slug', $team->slug)
        ->postJson('/api/v1/admissions', [
            'patient_id' => $patient->slug,
            'ward_id' => $ward->id,
            'duration' => 2,
        ])->assertCreated()
        ->assertJsonPath('message', 'Admission created.')
        ->assertJsonPath('data.status', 'pending');
});
