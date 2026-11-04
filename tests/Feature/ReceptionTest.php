<?php

use App\Enums\TeamRole;
use App\Models\Appointment;
use App\Models\Billing;
use App\Models\Category;
use App\Models\Consultation;
use App\Models\Patient;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;
use Spatie\Permission\Models\Role;

function receptionTeamUrl(User $user, string $path = '', array $query = []): string
{
    $url = '/'.$user->currentTeam->slug.'/reception'.$path;

    if ($query !== []) {
        $url .= '?'.http_build_query($query);
    }

    return $url;
}

function addTeamDoctor(User $user): User
{
    $doctor = User::factory()->create();
    $user->currentTeam->members()->attach($doctor, ['role' => TeamRole::Member->value]);
    Role::firstOrCreate(['name' => 'Consultant']);
    $doctor->assignRole('Consultant');

    return $doctor;
}

function teamPatientFor(User $user): Patient
{
    $category = Category::factory()->create(['team_id' => $user->currentTeam->getKey()]);

    return Patient::factory()->create([
        'team_id' => $user->currentTeam->getKey(),
        'category_id' => $category->getKey(),
    ]);
}

test('guests are redirected to the login page', function () {
    $user = User::factory()->create();

    $this->get(receptionTeamUrl($user))->assertRedirect(route('login'));
});

test('the reception dashboard renders with stats and appointments', function () {
    $user = User::factory()->create();
    $doctor = addTeamDoctor($user);

    $patient = teamPatientFor($user);
    $billing = Billing::factory()->selfBillable()->create([
        'team_id' => $user->currentTeam->getKey(),
        'patient_id' => $patient->slug,
        'user_id' => $user->getKey(),
    ]);

    Appointment::factory()->create([
        'team_id' => $user->currentTeam->getKey(),
        'patient_id' => $patient->slug,
        'user_id' => $user->getKey(),
        'doctor_id' => $doctor->getKey(),
        'billing_id' => $billing->getKey(),
        'starts_at' => now()->addHour(),
        'ends_at' => now()->addHour()->addMinutes(30),
    ]);

    $this->actingAs($user)
        ->get(receptionTeamUrl($user))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('reception/index')
            ->has('stats')
            ->has('appointments', 1)
            ->where('appointments.0.patientId', $patient->slug)
            ->where('filters.dateFilter', 'today')
            ->has('dateFilterOptions', 8)
            ->has('doctorOptions', 1),
        );
});

test('the reception dashboard only displays Patient or Billing records in billingOptions', function () {
    $user = User::factory()->create();
    $patient = teamPatientFor($user);

    // Laboratory billing (should be excluded)
    Billing::factory()->create([
        'team_id' => $user->currentTeam->getKey(),
        'patient_id' => $patient->slug,
        'billable_type' => 'App\Models\Laboratory',
        'status' => 'paid',
    ]);

    // Patient billing (should be included)
    $patientBilling = Billing::factory()->create([
        'team_id' => $user->currentTeam->getKey(),
        'patient_id' => $patient->slug,
        'billable_type' => Patient::class,
        'status' => 'paid',
    ]);

    $this->actingAs($user)
        ->get(receptionTeamUrl($user))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->has('billingOptions', 1)
            ->where('billingOptions.0.id', $patientBilling->getKey())
        );
});

test('the reception dashboard defaults an invalid date filter to today', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->get(receptionTeamUrl($user, query: ['dateFilter' => 'bogus']))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('filters.dateFilter', 'today'),
        );
});

test('the reception dashboard excludes appointments outside the date filter', function () {
    $user = User::factory()->create();
    $doctor = addTeamDoctor($user);

    $patient = teamPatientFor($user);
    $billing = Billing::factory()->selfBillable()->create([
        'team_id' => $user->currentTeam->getKey(),
        'patient_id' => $patient->slug,
    ]);

    Appointment::factory()->create([
        'team_id' => $user->currentTeam->getKey(),
        'patient_id' => $patient->slug,
        'doctor_id' => $doctor->getKey(),
        'billing_id' => $billing->getKey(),
        'starts_at' => now()->subMonth(),
        'ends_at' => now()->subMonth()->addMinutes(30),
    ]);

    $this->actingAs($user)
        ->get(receptionTeamUrl($user, query: ['dateFilter' => 'today']))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->has('appointments', 0));
});

test('an appointment can be scheduled for a paid billing', function () {
    $user = User::factory()->create();
    $doctor = addTeamDoctor($user);

    $patient = teamPatientFor($user);
    $billing = Billing::factory()->selfBillable()->create([
        'team_id' => $user->currentTeam->getKey(),
        'patient_id' => $patient->slug,
        'status' => 'paid',
    ]);

    $response = $this->actingAs($user)
        ->post(receptionTeamUrl($user, '/appointments'), [
            'billing_id' => $billing->getKey(),
            'doctor_id' => $doctor->getKey(),
            'starts_at' => now()->addDay()->format('Y-m-d H:i:s'),
            'purpose' => 'Consultation',
        ]);

    $response->assertRedirectContains('/reception/appointments/');

    // Follow the redirect to the patient card page
    $location = $response->headers->get('Location');
    $this->actingAs($user)->get($location)->assertOk();

    $appointment = Appointment::withoutGlobalScope('team')->first();

    expect($appointment)->not->toBeNull()
        ->and($appointment->billing_id)->toBe($billing->getKey())
        ->and($appointment->doctor_id)->toBe($doctor->getKey())
        ->and($appointment->status)->toBe('scheduled');

    expect($billing->fresh()->status)->toBe('scheduled');
});

test('scheduling requires a future start time', function () {
    $user = User::factory()->create();
    $doctor = addTeamDoctor($user);

    $patient = teamPatientFor($user);
    $billing = Billing::factory()->selfBillable()->create([
        'team_id' => $user->currentTeam->getKey(),
        'patient_id' => $patient->slug,
    ]);

    $this->actingAs($user)
        ->post(receptionTeamUrl($user, '/appointments'), [
            'billing_id' => $billing->getKey(),
            'doctor_id' => $doctor->getKey(),
            'starts_at' => now()->subDay()->format('Y-m-d H:i:s'),
        ])
        ->assertSessionHasErrors('starts_at');
});

test('scheduling rejects a billing that is already scheduled, started, or completed', function () {
    $user = User::factory()->create();
    $doctor = addTeamDoctor($user);

    $patient = teamPatientFor($user);
    $billing = Billing::factory()->selfBillable()->create([
        'team_id' => $user->currentTeam->getKey(),
        'patient_id' => $patient->slug,
        'status' => 'scheduled',
    ]);

    $this->actingAs($user)
        ->post(receptionTeamUrl($user, '/appointments'), [
            'billing_id' => $billing->getKey(),
            'doctor_id' => $doctor->getKey(),
            'starts_at' => now()->addDay()->format('Y-m-d H:i:s'),
        ])
        ->assertSessionHasErrors('billing_id');
});

test('scheduling only allows billings with billable_type Patient or Billing and rejects other billable types', function () {
    $user = User::factory()->create();
    $doctor = addTeamDoctor($user);

    $patient = teamPatientFor($user);

    $labBilling = Billing::factory()->create([
        'team_id' => $user->currentTeam->getKey(),
        'patient_id' => $patient->slug,
        'billable_type' => 'App\Models\Laboratory',
        'status' => 'paid',
    ]);

    $patientBilling = Billing::factory()->create([
        'team_id' => $user->currentTeam->getKey(),
        'patient_id' => $patient->slug,
        'billable_type' => Patient::class,
        'status' => 'paid',
    ]);

    // Attempting to schedule with a non-Patient/Billing billing fails validation
    $this->actingAs($user)
        ->post(receptionTeamUrl($user, '/appointments'), [
            'billing_id' => $labBilling->getKey(),
            'doctor_id' => $doctor->getKey(),
            'starts_at' => now()->addDay()->format('Y-m-d H:i:s'),
        ])
        ->assertSessionHasErrors('billing_id');

    // Attempting to schedule with a Patient billing succeeds
    $this->actingAs($user)
        ->post(receptionTeamUrl($user, '/appointments'), [
            'billing_id' => $patientBilling->getKey(),
            'doctor_id' => $doctor->getKey(),
            'starts_at' => now()->addDay()->format('Y-m-d H:i:s'),
            'purpose' => 'Consultation',
        ])
        ->assertRedirectContains('/reception/appointments/');

    expect($patientBilling->fresh()->status)->toBe('scheduled');
});

test('scheduling rejects a doctor outside the current team', function () {
    $user = User::factory()->create();
    $outsider = User::factory()->create();

    $patient = teamPatientFor($user);
    $billing = Billing::factory()->selfBillable()->create([
        'team_id' => $user->currentTeam->getKey(),
        'patient_id' => $patient->slug,
    ]);

    $this->actingAs($user)
        ->post(receptionTeamUrl($user, '/appointments'), [
            'billing_id' => $billing->getKey(),
            'doctor_id' => $outsider->getKey(),
            'starts_at' => now()->addDay()->format('Y-m-d H:i:s'),
        ])
        ->assertSessionHasErrors('doctor_id');
});

test('a patient can be transferred to another doctor', function () {
    $user = User::factory()->create();
    $firstDoctor = addTeamDoctor($user);
    $secondDoctor = addTeamDoctor($user);

    $patient = teamPatientFor($user);
    $billing = Billing::factory()->selfBillable()->create([
        'team_id' => $user->currentTeam->getKey(),
        'patient_id' => $patient->slug,
    ]);

    $appointment = Appointment::factory()->create([
        'team_id' => $user->currentTeam->getKey(),
        'patient_id' => $patient->slug,
        'doctor_id' => $firstDoctor->getKey(),
        'billing_id' => $billing->getKey(),
        'status' => 'scheduled',
        'starts_at' => now()->addHour(),
        'ends_at' => now()->addHour()->addMinutes(30),
    ]);

    $consultation = Consultation::factory()->create([
        'team_id' => $user->currentTeam->getKey(),
        'patient_id' => $patient->slug,
        'doctor_id' => $firstDoctor->getKey(),
        'billing_id' => $billing->getKey(),
        'appointment_id' => $appointment->getKey(),
        'status' => 'scheduled',
        'starts_at' => now()->addHour(),
        'ends_at' => now()->addHour()->addMinutes(30),
    ]);

    $this->actingAs($user)
        ->patch(receptionTeamUrl($user, '/transfer'), [
            'patient_id' => $patient->slug,
            'transferTo' => 'doctor',
            'doctor_id' => $secondDoctor->getKey(),
        ])
        ->assertRedirect(receptionTeamUrl($user));

    expect($appointment->fresh()->doctor_id)->toBe($secondDoctor->getKey())
        ->and($consultation->fresh()->doctor_id)->toBe($secondDoctor->getKey());
});

test('transfer rejects a patient without an active appointment', function () {
    $user = User::factory()->create();
    $doctor = addTeamDoctor($user);

    $this->actingAs($user)
        ->patch(receptionTeamUrl($user, '/transfer'), [
            'patient_id' => 'NON-EXISTENT',
            'doctor_id' => $doctor->getKey(),
        ])
        ->assertSessionHasErrors('patient_id');
});
