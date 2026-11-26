<?php

use App\Models\Admission;
use App\Models\Appointment;
use App\Models\Category;
use App\Models\Complaint;
use App\Models\Consultation;
use App\Models\Diagnose;
use App\Models\DrugInventory;
use App\Models\Examination;
use App\Models\Inventory;
use App\Models\LabInventory;
use App\Models\Laboratory;
use App\Models\Patient;
use App\Models\Prescription;
use App\Models\PriceList;
use App\Models\Treatment;
use App\Models\User;
use App\Models\Vital;
use App\Models\Ward;

function consultationTeamUrl(User $user, string $path = ''): string
{
    return '/'.$user->currentTeam->slug.'/consultations'.$path;
}

function consultationPatient(User $user): Patient
{
    return Patient::factory()->create([
        'team_id' => $user->currentTeam->getKey(),
        'category_id' => Category::factory()->create([
            'team_id' => $user->currentTeam->getKey(),
        ])->getKey(),
    ]);
}

function consultationRecord(User $user, array $overrides = []): Consultation
{
    $appointment = Appointment::factory()->create([
        'team_id' => $user->currentTeam->getKey(),
        'patient_id' => consultationPatient($user)->slug,
        'user_id' => $user->getKey(),
        'doctor_id' => $user->getKey(),
    ]);

    return Consultation::factory()->create(array_merge([
        'team_id' => $user->currentTeam->getKey(),
        'patient_id' => $appointment->patient_id,
        'user_id' => $user->getKey(),
        'doctor_id' => $user->getKey(),
        'appointment_id' => $appointment->getKey(),
        'billing_id' => $appointment->billing_id,
    ], $overrides));
}

function consultationPriceList(User $user, array $overrides = []): PriceList
{
    return PriceList::factory()->create(array_merge([
        'team_id' => $user->currentTeam->getKey(),
    ], $overrides));
}

test('guests are redirected to the login page', function () {
    $user = User::factory()->create();

    $this->get(consultationTeamUrl($user))->assertRedirect(route('login'));
});

test('the consultations index lists team consultations', function () {
    $user = User::factory()->create();
    $appointment = consultationRecord($user);

    $this->actingAs($user)
        ->get(consultationTeamUrl($user))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('consultations/index')
            ->has('consultations', 1)
            ->where('consultations.0.id', $appointment->getKey())
            ->has('sidebar')
            ->has('events')
        );
});

test('calendar events link to the consultation view', function () {
    $user = User::factory()->create();
    $appointment = consultationRecord($user);

    $this->actingAs($user)
        ->get(consultationTeamUrl($user))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('consultations/index')
            ->where('events.0.url', url(consultationTeamUrl($user, '/'.$appointment->getKey())))
        );
});

test('the consultations sidebar lists admitted patients for ward rounds', function () {
    $user = User::factory()->create();
    $team = $user->currentTeam;
    $patient = consultationPatient($user);
    // The SQLite test database has no generated column, so seed the value MySQL would generate.
    $patient->forceFill(['fullName' => 'Ada Obi'])->save();
    $ward = Ward::factory()->ward()->create(['team_id' => $team->getKey()]);
    $bed = Ward::factory()->bed($ward)->create(['team_id' => $team->getKey()]);

    $admission = Admission::factory()->create([
        'team_id' => $team->getKey(),
        'patient_id' => $patient->slug,
        'doctor_id' => $user->getKey(),
        'ward_id' => $ward->getKey(),
        'bed_id' => $bed->getKey(),
        'status' => 'admitted',
    ]);

    Admission::factory()->create([
        'team_id' => $team->getKey(),
        'patient_id' => consultationPatient($user)->slug,
        'ward_id' => $ward->getKey(),
        'status' => 'pending',
    ]);

    $otherUser = User::factory()->create();
    Admission::factory()->create([
        'team_id' => $otherUser->currentTeam->getKey(),
        'patient_id' => consultationPatient($otherUser)->slug,
        'ward_id' => Ward::factory()->ward()->create(['team_id' => $otherUser->currentTeam->getKey()])->getKey(),
        'status' => 'admitted',
    ]);

    $this->actingAs($user)
        ->get(consultationTeamUrl($user))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('consultations/index')
            ->has('sidebar.admittedPatients', 1)
            ->where('sidebar.admittedPatients.0.id', $admission->getKey())
            ->where('sidebar.admittedPatients.0.name', $patient->fullName)
            ->where('sidebar.admittedPatients.0.wardBed', $ward->name.' · '.$bed->name)
        );
});

test('the consultation view shows the patient clinical records', function () {
    $user = User::factory()->create();
    $appointment = consultationRecord($user);

    Vital::factory()->create([
        'team_id' => $user->currentTeam->getKey(),
        'patient_id' => $appointment->patient_id,
        'user_id' => $user->getKey(),
    ]);

    $this->actingAs($user)
        ->get(consultationTeamUrl($user, '/'.$appointment->getKey()))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('consultations/view')
            ->where('consultation.id', $appointment->getKey())
            ->has('records.vital-signs', 1)
            ->has('options')
        );
});

test('a consultation can be started', function () {
    $user = User::factory()->create();
    $appointment = consultationRecord($user, ['status' => 'scheduled']);

    $this->actingAs($user)
        ->patch(consultationTeamUrl($user, '/'.$appointment->getKey().'/start'))
        ->assertRedirect(consultationTeamUrl($user, '/'.$appointment->getKey()));

    expect($appointment->fresh()->status)->toBe('started');
});

test('a consultation can be ended', function () {
    $user = User::factory()->create();
    $appointment = consultationRecord($user, ['status' => 'started']);

    $this->actingAs($user)
        ->patch(consultationTeamUrl($user, '/'.$appointment->getKey().'/end'))
        ->assertRedirect(consultationTeamUrl($user));

    expect($appointment->fresh()->status)->toBe('completed');
});

test('a complaint can be recorded for the consultation patient', function () {
    $user = User::factory()->create();
    $appointment = consultationRecord($user);

    $this->actingAs($user)
        ->post(consultationTeamUrl($user, '/'.$appointment->getKey().'/records/complaints'), [
            'notes_en' => 'Headache',
            'notes_ha' => null,
            'notes_ff' => null,
        ])
        ->assertRedirect();

    $complaint = Complaint::query()->where('patient_id', $appointment->patient_id)->first();

    expect($complaint)->not->toBeNull()
        ->and($complaint->notes_en)->toBe('Headache')
        ->and((int) $complaint->appointment_id)->toBe($appointment->getKey())
        ->and((int) $complaint->doctor_id)->toBe($user->getKey());
});

test('an examination and diagnosis can be recorded', function () {
    $user = User::factory()->create();
    $appointment = consultationRecord($user);

    $this->actingAs($user)->post(
        consultationTeamUrl($user, '/'.$appointment->getKey().'/records/examinations'),
        ['notes' => 'Chest clear'],
    )->assertRedirect();

    $this->actingAs($user)->post(
        consultationTeamUrl($user, '/'.$appointment->getKey().'/records/diagnoses'),
        ['notes' => 'Malaria'],
    )->assertRedirect();

    expect(Examination::query()->where('patient_id', $appointment->patient_id)->count())->toBe(1)
        ->and(Diagnose::query()->where('patient_id', $appointment->patient_id)->count())->toBe(1);
});

test('an admission request can be recorded', function () {
    $user = User::factory()->create();
    $appointment = consultationRecord($user);
    $ward = Ward::factory()->ward()->create(['team_id' => $user->currentTeam->getKey()]);

    $this->actingAs($user)
        ->post(consultationTeamUrl($user, '/'.$appointment->getKey().'/records/admissions'), [
            'ward_id' => $ward->getKey(),
            'duration' => 3,
            'notes' => 'Observe overnight',
        ])
        ->assertRedirect();

    $admission = Admission::query()->where('patient_id', $appointment->patient_id)->first();

    expect($admission)->not->toBeNull()
        ->and((int) $admission->ward_id)->toBe($ward->getKey())
        ->and((int) $admission->duration)->toBe(3);
});

test('a treatment records lines, total and a linked billing', function () {
    $user = User::factory()->create();
    $appointment = consultationRecord($user);
    $priceList = consultationPriceList($user, ['name' => 'Dressing']);

    $this->actingAs($user)
        ->post(consultationTeamUrl($user, '/'.$appointment->getKey().'/records/treatments'), [
            'lines' => [
                ['price_list_id' => $priceList->getKey(), 'unitPrice' => 2000, 'quantity' => 2],
            ],
            'total' => 4000,
            'status' => 'pending',
        ])
        ->assertRedirect();

    $treatment = Treatment::query()->where('patient_id', $appointment->patient_id)->first();

    expect($treatment)->not->toBeNull()
        ->and((float) $treatment->total)->toBe(4000.0)
        ->and($treatment->lines()->count())->toBe(1)
        ->and($treatment->billings()->count())->toBe(1);
});

test('a prescription computes lines and total', function () {
    $user = User::factory()->create();
    $appointment = consultationRecord($user);
    $drug = consultationPriceList($user, ['name' => 'Paracetamol']);

    $this->actingAs($user)
        ->post(consultationTeamUrl($user, '/'.$appointment->getKey().'/records/prescriptions'), [
            'lines' => [
                [
                    'price_list_id' => $drug->getKey(),
                    'unitPrice' => 500,
                    'quantity' => 10,
                    'frequency' => 2,
                    'duration' => 5,
                    'dosage' => 1,
                ],
            ],
            'total' => 5000,
            'status' => 'pending',
        ])
        ->assertRedirect();

    $prescription = Prescription::query()->where('patient_id', $appointment->patient_id)->first();

    expect($prescription)->not->toBeNull()
        ->and((float) $prescription->total)->toBe(5000.0)
        ->and($prescription->lines()->count())->toBe(1);
});

test('a laboratory request computes lines and total', function () {
    $user = User::factory()->create();
    $appointment = consultationRecord($user);
    $test = consultationPriceList($user, ['name' => 'Malaria RDT']);

    $this->actingAs($user)
        ->post(consultationTeamUrl($user, '/'.$appointment->getKey().'/records/laboratories'), [
            'lines' => [
                ['price_list_id' => $test->getKey(), 'unitPrice' => 1500, 'quantity' => 1],
            ],
            'total' => 1500,
            'status' => 'pending',
        ])
        ->assertRedirect();

    $laboratory = Laboratory::query()->where('patient_id', $appointment->patient_id)->first();

    expect($laboratory)->not->toBeNull()
        ->and((float) $laboratory->total)->toBe(1500.0)
        ->and($laboratory->lines()->count())->toBe(1);
});

test('a laboratory request bills the consultant who ordered it', function () {
    $consultant = User::factory()->create(['name' => 'Dr. James Nandom']);
    $receptionist = User::factory()->create(['name' => 'Miracle Kemndep']);
    $consultation = consultationRecord($consultant, ['user_id' => $receptionist->getKey()]);
    $test = consultationPriceList($consultant, ['name' => 'Malaria RDT']);

    $this->actingAs($consultant)
        ->post(consultationTeamUrl($consultant, '/'.$consultation->getKey().'/records/laboratories'), [
            'lines' => [
                ['price_list_id' => $test->getKey(), 'unitPrice' => 1500, 'quantity' => 1],
            ],
            'total' => 1500,
            'status' => 'pending',
        ])
        ->assertRedirect();

    $laboratory = Laboratory::query()->where('patient_id', $consultation->patient_id)->first();
    $billing = $laboratory->billings()->first();

    expect($laboratory->doctor_id)->toBe($consultant->getKey())
        ->and($billing->user_id)->toBe($consultant->getKey())
        ->and($billing->user->name)->toBe('Dr. James Nandom');
});

test('treatment, laboratory and prescription lines capture the price list price and inventory cost', function () {
    $user = User::factory()->create();
    $appointment = consultationRecord($user);
    $teamId = $user->currentTeam->getKey();

    $service = consultationPriceList($user, ['name' => 'Dressing', 'price' => 2000]);
    Inventory::factory()->create([
        'team_id' => $teamId,
        'price_list_id' => $service->getKey(),
        'cost' => 800,
    ]);

    $test = consultationPriceList($user, ['name' => 'Malaria RDT', 'price' => 1500]);
    LabInventory::factory()->create([
        'team_id' => $teamId,
        'price_list_id' => $test->getKey(),
        'cost' => 500,
    ]);

    $drug = consultationPriceList($user, ['name' => 'Paracetamol', 'price' => 500]);
    DrugInventory::factory()->create([
        'team_id' => $teamId,
        'price_list_id' => $drug->getKey(),
        'cost' => 200,
    ]);

    $this->actingAs($user)->post(
        consultationTeamUrl($user, '/'.$appointment->getKey().'/records/treatments'),
        [
            'lines' => [['price_list_id' => $service->getKey(), 'quantity' => 2]],
            'status' => 'pending',
        ],
    )->assertRedirect();

    $this->actingAs($user)->post(
        consultationTeamUrl($user, '/'.$appointment->getKey().'/records/laboratories'),
        [
            'lines' => [['price_list_id' => $test->getKey(), 'quantity' => 1]],
            'status' => 'pending',
        ],
    )->assertRedirect();

    $this->actingAs($user)->post(
        consultationTeamUrl($user, '/'.$appointment->getKey().'/records/prescriptions'),
        [
            'lines' => [['price_list_id' => $drug->getKey(), 'quantity' => 10]],
            'status' => 'pending',
        ],
    )->assertRedirect();

    $treatmentLine = Treatment::query()->where('patient_id', $appointment->patient_id)->firstOrFail()->lines()->firstOrFail();
    $laboratoryLine = Laboratory::query()->where('patient_id', $appointment->patient_id)->firstOrFail()->lines()->firstOrFail();
    $prescriptionLine = Prescription::query()->where('patient_id', $appointment->patient_id)->firstOrFail()->lines()->firstOrFail();

    expect((float) $treatmentLine->unitPrice)->toBe(2000.0)
        ->and((float) $treatmentLine->unitCost)->toBe(800.0)
        ->and((float) $laboratoryLine->unitPrice)->toBe(1500.0)
        ->and((float) $laboratoryLine->unitCost)->toBe(500.0)
        ->and((float) $prescriptionLine->unitPrice)->toBe(500.0)
        ->and((float) $prescriptionLine->unitCost)->toBe(200.0);
});

test('a record can be updated and deleted', function () {
    $user = User::factory()->create();
    $appointment = consultationRecord($user);
    $priceList = consultationPriceList($user, ['name' => 'Test']);

    $this->actingAs($user)->post(
        consultationTeamUrl($user, '/'.$appointment->getKey().'/records/treatments'),
        [
            'lines' => [['price_list_id' => $priceList->getKey(), 'unitPrice' => 1000, 'quantity' => 1]],
            'total' => 1000,
            'status' => 'pending',
        ],
    )->assertRedirect();

    $treatment = Treatment::query()->where('patient_id', $appointment->patient_id)->first();

    $this->actingAs($user)
        ->patch(consultationTeamUrl($user, '/'.$appointment->getKey().'/records/treatments/'.$treatment->getKey()), [
            'lines' => [['price_list_id' => $priceList->getKey(), 'unitPrice' => 1500, 'quantity' => 1]],
            'total' => 1500,
            'status' => 'pending',
        ])
        ->assertRedirect();

    expect((float) $treatment->fresh()->total)->toBe(1500.0);

    $this->actingAs($user)
        ->delete(consultationTeamUrl($user, '/'.$appointment->getKey().'/records/treatments/'.$treatment->getKey()))
        ->assertRedirect();

    expect(Treatment::query()->whereKey($treatment->getKey())->exists())->toBeFalse();
});

test('consultations from another team are not visible', function () {
    $user = User::factory()->create();
    $otherUser = User::factory()->create();

    $appointment = consultationRecord($otherUser);

    $this->actingAs($user)
        ->get(consultationTeamUrl($user, '/'.$appointment->getKey()))
        ->assertNotFound();
});
