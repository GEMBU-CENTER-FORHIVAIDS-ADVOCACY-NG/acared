<?php

use App\Models\Billing;
use App\Models\Consultation;
use App\Models\Nursing;
use App\Models\Patient;
use App\Models\PriceList;
use App\Models\User;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

function v1ClinicalUser(array $permissions): array
{
    $user = User::factory()->create();
    $team = $user->currentTeam;
    $role = Role::create(['name' => 'clinical_'.uniqid(), 'guard_name' => 'web']);
    foreach ($permissions as $permission) {
        Permission::findOrCreate($permission, 'web');
        $role->givePermissionTo($permission);
    }
    $user->assignRole($role);

    return [$user, $team];
}

test('v1 consultation clinical records can be listed created updated and deleted', function () {
    [$user, $team] = v1ClinicalUser(['view consultations', 'update consultation']);
    $patient = Patient::factory()->create(['team_id' => $team->id]);
    $consultation = Consultation::factory()->create([
        'team_id' => $team->id,
        'patient_id' => $patient->slug,
        'doctor_id' => $user->id,
        'status' => 'started',
    ]);

    $this->actingAs($user, 'sanctum');
    $headers = ['X-Team-Slug' => $team->slug];

    $this->withHeaders($headers)->getJson("/api/v1/consultations/{$consultation->id}/records/options")->assertOk()->assertJsonStructure(['data']);

    $store = $this->withHeaders($headers)->postJson("/api/v1/consultations/{$consultation->id}/records/complaints", [
        'notes_en' => 'Headache',
        'notes_ha' => null,
        'notes_ff' => null,
    ])->assertCreated()->assertJsonPath('message', 'Complaint recorded.');

    $recordId = $store->json('data.id');

    $this->withHeaders($headers)->patchJson("/api/v1/consultations/{$consultation->id}/records/complaints/{$recordId}", [
        'notes_en' => 'Severe headache',
    ])->assertOk()->assertJsonPath('message', 'Complaint updated.');

    $this->withHeaders($headers)->getJson("/api/v1/consultations/{$consultation->id}/records?type=complaints")
        ->assertOk()
        ->assertJsonPath('data.0.notes_en', 'Severe headache');

    $this->withHeaders($headers)->deleteJson("/api/v1/consultations/{$consultation->id}/records/complaints/{$recordId}")
        ->assertOk()->assertJsonPath('message', 'Complaint deleted.');
});

test('v1 nursing clinical records can create line-based records', function () {
    [$user, $team] = v1ClinicalUser(['view nursing', 'update nursing']);
    $patient = Patient::factory()->create(['team_id' => $team->id]);
    $nursing = Nursing::query()->create([
        'team_id' => $team->id,
        'patient_id' => $patient->slug,
        'nurse_id' => $user->id,
        'billing_id' => Billing::query()->create([
            'team_id' => $team->id,
            'patient_id' => $patient->slug,
            'user_id' => $user->id,
            'status' => 'pending',
            'total' => 0,
        ])->id,
        'status' => 'in_progress',
        'user_id' => $user->id,
    ]);
    $priceList = PriceList::factory()->create(['team_id' => $team->id]);

    $this->actingAs($user, 'sanctum');
    $headers = ['X-Team-Slug' => $team->slug];

    $this->withHeaders($headers)->postJson("/api/v1/nursing/{$nursing->id}/records/treatments", [
        'lines' => [[
            'price_list_id' => $priceList->id,
            'quantity' => 1,
            'unitPrice' => 100,
        ]],
        'status' => 'pending',
    ])->assertCreated()->assertJsonPath('message', 'Treatment recorded.');

    $this->withHeaders($headers)->getJson("/api/v1/nursing/{$nursing->id}/records?type=treatments")
        ->assertOk()
        ->assertJsonCount(1, 'data');
});
