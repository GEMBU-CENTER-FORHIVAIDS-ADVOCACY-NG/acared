<?php

beforeEach(function (): void {
    config(['api_v1.allow_roleless_permission_pass' => true]);
});

use App\Models\Appointment;
use App\Models\Billing;
use App\Models\Consultation;
use App\Models\Nursing;
use App\Models\Patient;
use App\Models\PriceList;
use App\Models\User;

function setupV1TeamUser(): array
{
    $user = User::factory()->create();
    $team = $user->currentTeam;
    $patient = Patient::factory()->create(['team_id' => $team->id]);

    return [$user, $team, $patient];
}

test('v1 can list and show appointments', function () {
    [$user, $team, $patient] = setupV1TeamUser();
    $billing = Billing::factory()->create(['team_id' => $team->id, 'patient_id' => $patient->slug, 'user_id' => $user->id]);
    $appointment = Appointment::factory()->create([
        'team_id' => $team->id,
        'patient_id' => $patient->slug,
        'billing_id' => $billing->id,
        'user_id' => $user->id,
        'status' => 'scheduled',
    ]);

    $this->actingAs($user, 'sanctum');

    $this->withHeader('X-Team-Slug', $team->slug)
        ->getJson('/api/v1/appointments')
        ->assertOk()
        ->assertJsonPath('data.0.id', $appointment->id);

    $this->withHeader('X-Team-Slug', $team->slug)
        ->getJson('/api/v1/appointments/'.$appointment->id)
        ->assertOk()
        ->assertJsonPath('data.id', $appointment->id);
});

test('v1 can start and end consultation', function () {
    [$user, $team, $patient] = setupV1TeamUser();
    $consultation = Consultation::factory()->create([
        'team_id' => $team->id,
        'patient_id' => $patient->slug,
        'status' => 'scheduled',
        'doctor_id' => $user->id,
    ]);

    $this->actingAs($user, 'sanctum');

    $this->withHeader('X-Team-Slug', $team->slug)
        ->postJson('/api/v1/consultations/'.$consultation->id.'/start')
        ->assertOk()
        ->assertJsonPath('data.status', 'started');

    $this->withHeader('X-Team-Slug', $team->slug)
        ->postJson('/api/v1/consultations/'.$consultation->id.'/end')
        ->assertOk()
        ->assertJsonPath('data.status', 'completed');
});

test('v1 can store nursing vitals and complete nursing', function () {
    [$user, $team, $patient] = setupV1TeamUser();
    $billing = Billing::factory()->create(['team_id' => $team->id, 'patient_id' => $patient->slug, 'user_id' => $user->id]);
    $priceList = PriceList::factory()->create(['team_id' => $team->id]);
    $nursing = Nursing::query()->create([
        'team_id' => $team->id,
        'patient_id' => $patient->slug,
        'billing_id' => $billing->id,
        'status' => 'scheduled',
        'nurse_id' => $user->id,
        'user_id' => $user->id,
    ]);

    $this->actingAs($user, 'sanctum');

    $this->withHeader('X-Team-Slug', $team->slug)
        ->postJson('/api/v1/nursing/'.$nursing->id.'/vitals', [
            'vital_signs' => [
                ['price_list_id' => $priceList->id, 'results' => '120/80'],
            ],
        ])->assertCreated();

    $this->withHeader('X-Team-Slug', $team->slug)
        ->postJson('/api/v1/nursing/'.$nursing->id.'/complete')
        ->assertOk()
        ->assertJsonPath('data.status', 'completed');
});
