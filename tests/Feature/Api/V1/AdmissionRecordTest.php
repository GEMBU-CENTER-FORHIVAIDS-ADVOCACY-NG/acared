<?php

use App\Models\Admission;
use App\Models\Patient;
use App\Models\User;
use App\Models\Ward;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

test('v1 admission clinical records can be listed and created', function () {
    $user = User::factory()->create();
    $team = $user->currentTeam;
    $patient = Patient::factory()->create(['team_id' => $team->id]);
    $ward = Ward::factory()->create(['team_id' => $team->id, 'is_ward' => true]);

    $role = Role::create(['name' => 'nurse_adm_'.uniqid(), 'guard_name' => 'web']);
    foreach (['view nursing', 'update nursing'] as $permission) {
        Permission::findOrCreate($permission, 'web');
        $role->givePermissionTo($permission);
    }
    $user->assignRole($role);

    $admission = Admission::query()->create([
        'team_id' => $team->id,
        'patient_id' => $patient->slug,
        'doctor_id' => $user->id,
        'ward_id' => $ward->id,
        'duration' => 1,
        'status' => 'admitted',
    ]);

    $this->actingAs($user, 'sanctum');
    $headers = ['X-Team-Slug' => $team->slug];

    $this->withHeaders($headers)->getJson("/api/v1/admissions/{$admission->id}/records/options")->assertOk();
    $this->withHeaders($headers)->postJson("/api/v1/admissions/{$admission->id}/records/complaints", [
        'notes_en' => 'Pain',
    ])->assertCreated()->assertJsonPath('message', 'Complaint recorded.');

    $this->withHeaders($headers)->getJson("/api/v1/admissions/{$admission->id}/records?type=complaints")
        ->assertOk()->assertJsonCount(1, 'data');
});
