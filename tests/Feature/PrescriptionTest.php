<?php

use App\Models\Category;
use App\Models\Country;
use App\Models\DrugForm;
use App\Models\DrugInventory;
use App\Models\Lga;
use App\Models\Patient;
use App\Models\Prescription;
use App\Models\PriceList;
use App\Models\State;
use App\Models\User;
use Illuminate\Support\Collection;
use Inertia\Testing\AssertableInertia as Assert;

function prescriptionTeamUrl(User $user, string $path = ''): string
{
    return '/'.$user->currentTeam->slug.'/pharmacy/prescriptions'.$path;
}

function prescriptionPatients(User $user, int $count, array $attributes = []): Collection
{
    $teamId = $user->currentTeam->getKey();
    $category = Category::factory()->create(['team_id' => $teamId]);
    $country = Country::factory()->create();
    $state = State::factory()->create();
    $lga = Lga::factory()->create(['state_id' => $state->getKey()]);

    return Patient::factory()->count($count)->create([
        'team_id' => $teamId,
        'category_id' => $category->getKey(),
        'country_id' => $country->getKey(),
        'state_id' => $state->getKey(),
        'lga_id' => $lga->getKey(),
        ...$attributes,
    ]);
}

function prescriptionFor(User $user, Patient $patient): Prescription
{
    return Prescription::factory()->create([
        'team_id' => $user->currentTeam->getKey(),
        'patient_id' => $patient->slug,
        'doctor_id' => $user->getKey(),
    ]);
}

test('the prescription edit form renders with its lines', function () {
    $user = User::factory()->create();
    $patient = prescriptionPatients($user, 1)->first();
    $prescription = prescriptionFor($user, $patient);

    $this->actingAs($user)
        ->get(prescriptionTeamUrl($user, '/'.$prescription->getKey().'/edit'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('pharmacy/prescriptions/edit')
            ->where('prescription.id', $prescription->getKey())
            ->where('prescription.patientSlug', $patient->slug)
            ->has('formOptions.priceLists')
        );
});

test('the prescription edit form only sends a bounded list of patients', function () {
    $user = User::factory()->create();
    prescriptionPatients($user, 60);
    $selected = prescriptionPatients($user, 1, [
        'firstName' => 'Zzzzz',
        'lastName' => 'Zzzzz',
    ])->first();
    $prescription = prescriptionFor($user, $selected);

    $this->actingAs($user)
        ->get(prescriptionTeamUrl($user, '/'.$prescription->getKey().'/edit'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->has('formOptions.patients', 51)
            ->where('formOptions.patients.50.id', $selected->slug)
        );
});

test('the prescription edit form keeps the selected patient in the options', function () {
    $user = User::factory()->create();
    prescriptionPatients($user, 60);
    $selected = prescriptionPatients($user, 1, [
        'firstName' => 'Zzzzz',
        'lastName' => 'Zzzzz',
    ])->first();
    $prescription = prescriptionFor($user, $selected);

    $this->actingAs($user)
        ->get(prescriptionTeamUrl($user, '/'.$prescription->getKey().'/edit'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('formOptions.patients', fn (Collection $patients) => $patients->contains('id', $selected->slug))
        );
});

test('the prescription forms filter the patients with the search term', function () {
    $user = User::factory()->create();
    $match = prescriptionPatients($user, 1, [
        'firstName' => 'Qqqqq',
        'lastName' => 'Qqqqq',
    ])->first();
    prescriptionPatients($user, 3);

    $this->actingAs($user)
        ->get(prescriptionTeamUrl($user, '/create?q=Qqqqq'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('pharmacy/prescriptions/create')
            ->has('formOptions.patients', 1)
            ->where('formOptions.patients.0.id', $match->slug)
        );
});

test('the prescription create form keeps the preselected patient', function () {
    $user = User::factory()->create();
    $patient = prescriptionPatients($user, 1)->first();

    $this->actingAs($user)
        ->get(prescriptionTeamUrl($user, '/create?patient_id='.$patient->slug))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('pharmacy/prescriptions/create')
            ->where('selectedPatientId', $patient->slug)
            ->has('formOptions.patients', 1)
            ->where('formOptions.patients.0.id', $patient->slug)
        );
});

test('a prescription line captures the inventory cost from the price list', function () {
    $user = User::factory()->create();
    $teamId = $user->currentTeam->getKey();
    $patient = prescriptionPatients($user, 1)->first();

    $category = PriceList::factory()->create([
        'team_id' => $teamId,
        'name' => 'Pharmacy',
        'is_category' => true,
        'category_id' => null,
        'subcategory_id' => null,
    ]);

    $subcategory = PriceList::factory()->create([
        'team_id' => $teamId,
        'name' => 'Analgesics',
        'is_category' => false,
        'category_id' => $category->getKey(),
        'subcategory_id' => null,
    ]);

    $drug = PriceList::factory()->create([
        'team_id' => $teamId,
        'name' => 'Paracetamol 500mg',
        'price' => 500,
        'is_category' => false,
        'is_inventory' => true,
        'category_id' => $category->getKey(),
        'subcategory_id' => $subcategory->getKey(),
    ]);

    DrugInventory::factory()->create([
        'team_id' => $teamId,
        'price_list_id' => $drug->getKey(),
        'drug_form_id' => DrugForm::factory()->create(['team_id' => $teamId])->getKey(),
        'cost' => 200,
    ]);

    $this->actingAs($user)
        ->post(prescriptionTeamUrl($user), [
            'patient_id' => $patient->slug,
            'lines' => [
                [
                    'price_list_id' => $drug->getKey(),
                    'frequency' => 2,
                    'duration' => 3,
                    'dosage' => 1,
                ],
            ],
        ])
        ->assertRedirect();

    $prescription = Prescription::query()->where('patient_id', $patient->slug)->firstOrFail();
    $line = $prescription->lines()->firstOrFail();

    expect((float) $prescription->total)->toBe(3000.0)
        ->and((float) $line->unitPrice)->toBe(500.0)
        ->and((float) $line->unitCost)->toBe(200.0)
        ->and((float) $line->quantity)->toBe(6.0);
});
