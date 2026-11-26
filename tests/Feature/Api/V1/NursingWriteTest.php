<?php

use App\Models\Billing;
use App\Models\Nursing;
use App\Models\Patient;
use App\Models\PriceList;
use App\Models\User;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

function v1NursingUser(array $permissions): array
{
    $user = User::factory()->create();
    $team = $user->currentTeam;
    $role = Role::create(['name' => 'nurse_role_'.uniqid(), 'guard_name' => 'web']);
    foreach ($permissions as $permission) {
        Permission::findOrCreate($permission, 'web');
        $role->givePermissionTo($permission);
    }
    $user->assignRole($role);

    return [$user, $team];
}

test('v1 nursing can be created started vitals added completed and transferred', function () {
    [$user, $team] = v1NursingUser(['view nursing', 'create nursing', 'update nursing']);
    $patient = Patient::factory()->create(['team_id' => $team->id]);
    $billing = Billing::query()->create([
        'team_id' => $team->id,
        'patient_id' => $patient->slug,
        'user_id' => $user->id,
        'status' => 'pending',
        'total' => 0,
    ]);
    $priceList = PriceList::factory()->create(['team_id' => $team->id]);

    $this->actingAs($user, 'sanctum');
    $headers = ['X-Team-Slug' => $team->slug];

    $create = $this->withHeaders($headers)->postJson('/api/v1/nursing', [
        'patient_id' => $patient->slug,
        'nurse_id' => $user->id,
        'billing_id' => $billing->id,
        'purpose' => 'ANC',
        'status' => 'scheduled',
    ])->assertCreated()->assertJsonPath('data.status', 'scheduled');

    $id = $create->json('data.id');

    $this->withHeaders($headers)->postJson("/api/v1/nursing/{$id}/start")
        ->assertOk()->assertJsonPath('data.status', 'in_progress');

    $this->withHeaders($headers)->postJson("/api/v1/nursing/{$id}/vitals", [
        'vital_signs' => [['price_list_id' => $priceList->id, 'results' => '120/80']],
    ])->assertCreated()->assertJsonPath('data.status', 'in_progress');

    $this->withHeaders($headers)->postJson("/api/v1/nursing/{$id}/complete")
        ->assertOk()->assertJsonPath('data.status', 'completed');
});

test('v1 nursing transfer to doctor creates appointment and consultation', function () {
    [$user, $team] = v1NursingUser(['view nursing', 'update nursing']);
    $doctor = User::factory()->create();
    $team->members()->attach($doctor->id, ['role' => 'member']);
    $patient = Patient::factory()->create(['team_id' => $team->id]);
    $billing = Billing::query()->create([
        'team_id' => $team->id,
        'patient_id' => $patient->slug,
        'user_id' => $user->id,
        'status' => 'pending',
        'total' => 0,
    ]);
    $nursing = Nursing::query()->create([
        'team_id' => $team->id,
        'patient_id' => $patient->slug,
        'nurse_id' => $user->id,
        'billing_id' => $billing->id,
        'status' => 'in_progress',
        'user_id' => $user->id,
    ]);

    $this->actingAs($user, 'sanctum');

    $this->withHeader('X-Team-Slug', $team->slug)
        ->postJson("/api/v1/nursing/{$nursing->id}/transfer", [
            'transferTo' => 'doctor',
            'doctor_id' => $doctor->id,
        ])
        ->assertOk()
        ->assertJsonPath('meta.transferred_to', 'doctor')
        ->assertJsonStructure(['data', 'meta' => ['appointment_id', 'consultation_id']]);
});
