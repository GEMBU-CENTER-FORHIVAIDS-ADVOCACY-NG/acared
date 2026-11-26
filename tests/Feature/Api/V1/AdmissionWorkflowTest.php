<?php

use App\Models\Admission;
use App\Models\Patient;
use App\Models\User;
use App\Models\Ward;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

function v1AdmissionUser(): array
{
    $user = User::factory()->create();
    $team = $user->currentTeam;
    $role = Role::create(['name' => 'adm_'.uniqid(), 'guard_name' => 'web']);
    foreach (['view nursing', 'update nursing'] as $permission) {
        Permission::findOrCreate($permission, 'web');
        $role->givePermissionTo($permission);
    }
    $user->assignRole($role);

    return [$user, $team];
}

test('v1 admission can be admitted discharged and transferred', function () {
    [$user, $team] = v1AdmissionUser();
    $patient = Patient::factory()->create(['team_id' => $team->id]);
    $ward = Ward::factory()->create(['team_id' => $team->id, 'is_ward' => true, 'capacity' => 2]);
    $bed1 = Ward::factory()->create(['team_id' => $team->id, 'is_ward' => false, 'ward_id' => $ward->id, 'status' => 'available']);
    $bed2 = Ward::factory()->create(['team_id' => $team->id, 'is_ward' => false, 'ward_id' => $ward->id, 'status' => 'available']);

    $admission = Admission::query()->create([
        'team_id' => $team->id,
        'patient_id' => $patient->slug,
        'doctor_id' => $user->id,
        'ward_id' => $ward->id,
        'status' => 'pending',
        'duration' => 1,
    ]);

    $this->actingAs($user, 'sanctum');
    $headers = ['X-Team-Slug' => $team->slug];

    $this->withHeaders($headers)->postJson("/api/v1/wards/{$ward->id}/admit", [
        'admission_id' => $admission->id,
        'bed_id' => $bed1->id,
    ])->assertOk()->assertJsonPath('data.status', 'admitted');

    $this->withHeaders($headers)->postJson("/api/v1/admissions/{$admission->id}/transfer", [
        'ward_id' => $ward->id,
        'bed_id' => $bed2->id,
    ])->assertOk()->assertJsonPath('data.bed_id', $bed2->id);

    $this->withHeaders($headers)->postJson("/api/v1/admissions/{$admission->id}/discharge")
        ->assertOk()->assertJsonPath('data.status', 'discharged');
});

test('v1 pending admission can be cancelled', function () {
    [$user, $team] = v1AdmissionUser();
    $patient = Patient::factory()->create(['team_id' => $team->id]);
    $ward = Ward::factory()->create(['team_id' => $team->id, 'is_ward' => true]);

    $admission = Admission::query()->create([
        'team_id' => $team->id,
        'patient_id' => $patient->slug,
        'doctor_id' => $user->id,
        'ward_id' => $ward->id,
        'status' => 'pending',
        'duration' => 1,
    ]);

    $this->actingAs($user, 'sanctum');

    $this->withHeader('X-Team-Slug', $team->slug)
        ->postJson("/api/v1/admissions/{$admission->id}/cancel")
        ->assertOk()->assertJsonPath('data.status', 'cancelled');
});
