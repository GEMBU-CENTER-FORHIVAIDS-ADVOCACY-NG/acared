<?php

use App\Models\Consultation;
use App\Models\Laboratory;
use App\Models\Line;
use App\Models\Patient;
use App\Models\Prescription;
use App\Models\PriceList;
use App\Models\User;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

function v1UserWithPermissions(array $permissions): array
{
    $user = User::factory()->create();
    $team = $user->currentTeam;
    $role = Role::create(['name' => 'role_'.uniqid(), 'guard_name' => 'web']);

    foreach ($permissions as $permission) {
        Permission::findOrCreate($permission, 'web');
        $role->givePermissionTo($permission);
    }

    $user->assignRole($role);

    return [$user, $team];
}

test('v1 consultation start and end enforce status and permission', function () {
    [$user, $team] = v1UserWithPermissions(['view consultations', 'update consultation']);
    $patient = Patient::factory()->create(['team_id' => $team->id]);
    $consultation = Consultation::factory()->create([
        'team_id' => $team->id,
        'patient_id' => $patient->slug,
        'status' => 'scheduled',
        'doctor_id' => $user->id,
    ]);

    $this->actingAs($user, 'sanctum');
    $headers = ['X-Team-Slug' => $team->slug];

    $this->withHeaders($headers)->postJson("/api/v1/consultations/{$consultation->id}/end")->assertUnprocessable();
    $this->withHeaders($headers)->postJson("/api/v1/consultations/{$consultation->id}/start")->assertOk()->assertJsonPath('data.status', 'started');
    $this->withHeaders($headers)->postJson("/api/v1/consultations/{$consultation->id}/end")->assertOk()->assertJsonPath('data.status', 'completed');
});

test('v1 laboratory can store results and cancel with permission', function () {
    [$user, $team] = v1UserWithPermissions(['view laboratory', 'update laboratory']);
    $patient = Patient::factory()->create(['team_id' => $team->id]);
    $priceList = PriceList::factory()->create(['team_id' => $team->id]);
    $lab = Laboratory::query()->create([
        'team_id' => $team->id,
        'patient_id' => $patient->slug,
        'doctor_id' => $user->id,
        'status' => 'pending',
        'total' => 100,
    ]);
    $line = Line::query()->create([
        'team_id' => $team->id,
        'patient_id' => $patient->slug,
        'user_id' => $user->id,
        'lineable_type' => Laboratory::class,
        'lineable_id' => $lab->id,
        'price_list_id' => $priceList->id,
        'quantity' => 1,
        'unitPrice' => 100,
    ]);

    $this->actingAs($user, 'sanctum');
    $headers = ['X-Team-Slug' => $team->slug];

    $this->withHeaders($headers)->postJson("/api/v1/laboratories/{$lab->id}/results", [
        'results' => [['line_id' => $line->id, 'result' => 'Positive', 'comment' => 'Note']],
    ])->assertOk()->assertJsonPath('data.status', 'completed');

    $this->withHeaders($headers)->postJson("/api/v1/laboratories/{$lab->id}/cancel")->assertUnprocessable();
});

test('v1 prescription dispense requires paid and refund requires dispensed', function () {
    [$user, $team] = v1UserWithPermissions(['view pharmacy', 'update prescription']);
    $patient = Patient::factory()->create(['team_id' => $team->id]);
    $prescription = Prescription::query()->create([
        'team_id' => $team->id,
        'patient_id' => $patient->slug,
        'doctor_id' => $user->id,
        'status' => 'pending',
        'total' => 0,
    ]);

    $this->actingAs($user, 'sanctum');
    $headers = ['X-Team-Slug' => $team->slug];

    $this->withHeaders($headers)->postJson("/api/v1/prescriptions/{$prescription->id}/dispense")->assertUnprocessable();
    $this->withHeaders($headers)->postJson("/api/v1/prescriptions/{$prescription->id}/refund")->assertUnprocessable();

    $prescription->update(['status' => 'dispensed']);
    $this->withHeaders($headers)->postJson("/api/v1/prescriptions/{$prescription->id}/refund")->assertOk()->assertJsonPath('data.status', 'refunded');
});
