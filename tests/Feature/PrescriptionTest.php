<?php

use App\Models\Category;
use App\Models\Country;
use App\Models\DrugForm;
use App\Models\DrugInventory;
use App\Models\Inventory;
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

test('adding new drugs to a paid prescription creates a new billing for the new lines only', function () {
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

    $drug1 = PriceList::factory()->create([
        'team_id' => $teamId,
        'name' => 'Paracetamol 500mg',
        'price' => 100,
        'is_category' => false,
        'is_inventory' => true,
        'category_id' => $category->getKey(),
        'subcategory_id' => $subcategory->getKey(),
    ]);

    $drug2 = PriceList::factory()->create([
        'team_id' => $teamId,
        'name' => 'Ibuprofen 400mg',
        'price' => 200,
        'is_category' => false,
        'is_inventory' => true,
        'category_id' => $category->getKey(),
        'subcategory_id' => $subcategory->getKey(),
    ]);

    DrugInventory::factory()->create([
        'team_id' => $teamId,
        'price_list_id' => $drug1->getKey(),
        'drug_form_id' => DrugForm::factory()->create(['team_id' => $teamId])->getKey(),
    ]);

    DrugInventory::factory()->create([
        'team_id' => $teamId,
        'price_list_id' => $drug2->getKey(),
        'drug_form_id' => DrugForm::factory()->create(['team_id' => $teamId])->getKey(),
    ]);

    // Create a prescription with drug1
    $this->actingAs($user)
        ->post(prescriptionTeamUrl($user), [
            'patient_id' => $patient->slug,
            'lines' => [
                [
                    'price_list_id' => $drug1->getKey(),
                    'frequency' => 1,
                    'duration' => 1,
                    'dosage' => 1,
                ],
            ],
        ])
        ->assertRedirect();

    $prescription = Prescription::query()->where('patient_id', $patient->slug)->firstOrFail();
    expect($prescription->status)->toBe('billed');
    $originalBilling = $prescription->billings()->firstOrFail();
    expect((float) $originalBilling->total)->toBe(100.0);

    // Mark the billing and prescription as paid
    $originalBilling->update(['status' => 'paid']);
    $prescription->update(['status' => 'paid']);
    $prescription->lines()->update(['paid' => true]);

    // Now edit the prescription to add drug2
    $this->actingAs($user)
        ->patch(prescriptionTeamUrl($user, '/'.$prescription->getKey()), [
            'patient_id' => $patient->slug,
            'lines' => [
                [
                    'id' => $prescription->lines()->first()->getKey(),
                    'price_list_id' => $drug1->getKey(),
                    'frequency' => 1,
                    'duration' => 1,
                    'dosage' => 1,
                    'quantity' => 1,
                ],
                [
                    'id' => null,
                    'price_list_id' => $drug2->getKey(),
                    'frequency' => 1,
                    'duration' => 1,
                    'dosage' => 1,
                    'quantity' => 1,
                ],
            ],
        ])
        ->assertRedirect();

    $prescription->refresh();
    $billings = $prescription->billings()->orderBy('id')->get();

    // Original billing should remain unchanged
    expect((float) $billings[0]->total)->toBe(100.0);
    expect($billings[0]->status)->toBe('paid');

    // New billing should exist for the new drug only
    expect((float) $billings[1]->total)->toBe(200.0);

    // Prescription total should reflect both drugs
    expect((float) $prescription->total)->toBe(300.0);

    // The new line should not be marked as paid
    $newLine = $prescription->lines()->where('price_list_id', $drug2->getKey())->firstOrFail();
    expect($newLine->paid)->toBeFalse();
});

test('adding new drugs to a billed prescription updates the existing billing', function () {
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

    $drug1 = PriceList::factory()->create([
        'team_id' => $teamId,
        'name' => 'Paracetamol 500mg',
        'price' => 100,
        'is_category' => false,
        'is_inventory' => true,
        'category_id' => $category->getKey(),
        'subcategory_id' => $subcategory->getKey(),
    ]);

    $drug2 = PriceList::factory()->create([
        'team_id' => $teamId,
        'name' => 'Ibuprofen 400mg',
        'price' => 200,
        'is_category' => false,
        'is_inventory' => true,
        'category_id' => $category->getKey(),
        'subcategory_id' => $subcategory->getKey(),
    ]);

    DrugInventory::factory()->create([
        'team_id' => $teamId,
        'price_list_id' => $drug1->getKey(),
        'drug_form_id' => DrugForm::factory()->create(['team_id' => $teamId])->getKey(),
    ]);

    DrugInventory::factory()->create([
        'team_id' => $teamId,
        'price_list_id' => $drug2->getKey(),
        'drug_form_id' => DrugForm::factory()->create(['team_id' => $teamId])->getKey(),
    ]);

    // Create a prescription with drug1 — status will be 'billed'
    $this->actingAs($user)
        ->post(prescriptionTeamUrl($user), [
            'patient_id' => $patient->slug,
            'lines' => [
                [
                    'price_list_id' => $drug1->getKey(),
                    'frequency' => 1,
                    'duration' => 1,
                    'dosage' => 1,
                ],
            ],
        ])
        ->assertRedirect();

    $prescription = Prescription::query()->where('patient_id', $patient->slug)->firstOrFail();
    expect($prescription->status)->toBe('billed');
    $originalBilling = $prescription->billings()->firstOrFail();
    expect((float) $originalBilling->total)->toBe(100.0);

    // Edit the billed prescription to add drug2
    $this->actingAs($user)
        ->patch(prescriptionTeamUrl($user, '/'.$prescription->getKey()), [
            'patient_id' => $patient->slug,
            'lines' => [
                [
                    'id' => $prescription->lines()->first()->getKey(),
                    'price_list_id' => $drug1->getKey(),
                    'frequency' => 1,
                    'duration' => 1,
                    'dosage' => 1,
                    'quantity' => 1,
                ],
                [
                    'id' => null,
                    'price_list_id' => $drug2->getKey(),
                    'frequency' => 1,
                    'duration' => 1,
                    'dosage' => 1,
                    'quantity' => 1,
                ],
            ],
        ])
        ->assertRedirect();

    $prescription->refresh();
    $billings = $prescription->billings()->orderBy('id')->get();

    // Only one billing should exist, updated with the new total
    expect($billings->count())->toBe(1);
    expect((float) $billings[0]->total)->toBe(300.0);

    // Prescription total should reflect both drugs
    expect((float) $prescription->total)->toBe(300.0);
});

test('adding new drugs to a dispensed prescription creates a new billing without auto-dispensing', function () {
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

    $drug1 = PriceList::factory()->create([
        'team_id' => $teamId,
        'name' => 'Paracetamol 500mg',
        'price' => 100,
        'is_category' => false,
        'is_inventory' => true,
        'category_id' => $category->getKey(),
        'subcategory_id' => $subcategory->getKey(),
    ]);

    $drug2 = PriceList::factory()->create([
        'team_id' => $teamId,
        'name' => 'Ibuprofen 400mg',
        'price' => 200,
        'is_category' => false,
        'is_inventory' => true,
        'category_id' => $category->getKey(),
        'subcategory_id' => $subcategory->getKey(),
    ]);

    $drugForm1 = DrugForm::factory()->create(['team_id' => $teamId]);
    $drugForm2 = DrugForm::factory()->create(['team_id' => $teamId]);

    Inventory::factory()->create([
        'team_id' => $teamId,
        'price_list_id' => $drug1->getKey(),
        'drug_form_id' => $drugForm1->getKey(),
        'quantity' => 50,
        'min_qty' => 5,
    ]);

    Inventory::factory()->create([
        'team_id' => $teamId,
        'price_list_id' => $drug2->getKey(),
        'drug_form_id' => $drugForm2->getKey(),
        'quantity' => 50,
        'min_qty' => 5,
    ]);

    $drugInventory1 = DrugInventory::factory()->create([
        'team_id' => $teamId,
        'price_list_id' => $drug1->getKey(),
        'drug_form_id' => $drugForm1->getKey(),
        'quantity' => 50,
        'min_qty' => 5,
    ]);

    $drugInventory2 = DrugInventory::factory()->create([
        'team_id' => $teamId,
        'price_list_id' => $drug2->getKey(),
        'drug_form_id' => $drugForm2->getKey(),
        'quantity' => 50,
        'min_qty' => 5,
    ]);

    // Create a prescription with drug1
    $this->actingAs($user)
        ->post(prescriptionTeamUrl($user), [
            'patient_id' => $patient->slug,
            'lines' => [
                [
                    'price_list_id' => $drug1->getKey(),
                    'frequency' => 1,
                    'duration' => 1,
                    'dosage' => 1,
                ],
            ],
        ])
        ->assertRedirect();

    $prescription = Prescription::query()->where('patient_id', $patient->slug)->firstOrFail();
    expect($prescription->status)->toBe('billed');
    $originalBilling = $prescription->billings()->firstOrFail();
    expect((float) $originalBilling->total)->toBe(100.0);

    // Mark as paid and dispensed
    $originalBilling->update(['status' => 'paid']);
    $prescription->update(['status' => 'paid']);
    $prescription->lines()->update(['paid' => true]);

    // Dispense the prescription
    $this->actingAs($user)
        ->post(prescriptionTeamUrl($user, '/'.$prescription->getKey().'/dispense'))
        ->assertRedirect();

    $prescription->refresh();
    expect($prescription->status)->toBe('dispensed');

    // Record initial stock for drug2
    $initialDrug2Quantity = (int) $drugInventory2->fresh()->quantity;

    // Now edit the dispensed prescription to add drug2
    $this->actingAs($user)
        ->patch(prescriptionTeamUrl($user, '/'.$prescription->getKey()), [
            'patient_id' => $patient->slug,
            'lines' => [
                [
                    'id' => $prescription->lines()->first()->getKey(),
                    'price_list_id' => $drug1->getKey(),
                    'frequency' => 1,
                    'duration' => 1,
                    'dosage' => 1,
                    'quantity' => 1,
                ],
                [
                    'id' => null,
                    'price_list_id' => $drug2->getKey(),
                    'frequency' => 1,
                    'duration' => 1,
                    'dosage' => 1,
                    'quantity' => 1,
                ],
            ],
        ])
        ->assertRedirect();

    $prescription->refresh();
    $billings = $prescription->billings()->orderBy('id')->get();

    // Original billing should remain unchanged
    expect((float) $billings[0]->total)->toBe(100.0);
    expect($billings[0]->status)->toBe('paid');

    // New billing should exist for the new drug only
    expect((float) $billings[1]->total)->toBe(200.0);

    // Prescription total should reflect both drugs
    expect((float) $prescription->total)->toBe(300.0);

    // The new line should NOT be marked as paid (no auto-dispensing)
    $newLine = $prescription->lines()->where('price_list_id', $drug2->getKey())->firstOrFail();
    expect($newLine->paid)->toBeFalse();

    // Drug2 inventory should NOT be decremented (no auto-dispensing)
    expect((int) $drugInventory2->fresh()->quantity)->toBe($initialDrug2Quantity);
});

test('dispensing new lines of a dispensed prescription decrements inventory and marks lines as paid', function () {
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

    $drug1 = PriceList::factory()->create([
        'team_id' => $teamId,
        'name' => 'Paracetamol 500mg',
        'price' => 100,
        'is_category' => false,
        'is_inventory' => true,
        'category_id' => $category->getKey(),
        'subcategory_id' => $subcategory->getKey(),
    ]);

    $drug2 = PriceList::factory()->create([
        'team_id' => $teamId,
        'name' => 'Ibuprofen 400mg',
        'price' => 200,
        'is_category' => false,
        'is_inventory' => true,
        'category_id' => $category->getKey(),
        'subcategory_id' => $subcategory->getKey(),
    ]);

    $drugForm1 = DrugForm::factory()->create(['team_id' => $teamId]);
    $drugForm2 = DrugForm::factory()->create(['team_id' => $teamId]);

    Inventory::factory()->create([
        'team_id' => $teamId,
        'price_list_id' => $drug1->getKey(),
        'drug_form_id' => $drugForm1->getKey(),
        'quantity' => 50,
        'min_qty' => 5,
    ]);

    Inventory::factory()->create([
        'team_id' => $teamId,
        'price_list_id' => $drug2->getKey(),
        'drug_form_id' => $drugForm2->getKey(),
        'quantity' => 50,
        'min_qty' => 5,
    ]);

    $drugInventory1 = DrugInventory::factory()->create([
        'team_id' => $teamId,
        'price_list_id' => $drug1->getKey(),
        'drug_form_id' => $drugForm1->getKey(),
        'quantity' => 50,
        'min_qty' => 5,
    ]);

    $drugInventory2 = DrugInventory::factory()->create([
        'team_id' => $teamId,
        'price_list_id' => $drug2->getKey(),
        'drug_form_id' => $drugForm2->getKey(),
        'quantity' => 50,
        'min_qty' => 5,
    ]);

    // Create a prescription with drug1
    $this->actingAs($user)
        ->post(prescriptionTeamUrl($user), [
            'patient_id' => $patient->slug,
            'lines' => [
                [
                    'price_list_id' => $drug1->getKey(),
                    'frequency' => 1,
                    'duration' => 1,
                    'dosage' => 1,
                ],
            ],
        ])
        ->assertRedirect();

    $prescription = Prescription::query()->where('patient_id', $patient->slug)->firstOrFail();
    expect($prescription->status)->toBe('billed');
    $originalBilling = $prescription->billings()->firstOrFail();
    expect((float) $originalBilling->total)->toBe(100.0);

    // Mark as paid and dispensed
    $originalBilling->update(['status' => 'paid']);
    $prescription->update(['status' => 'paid']);
    $prescription->lines()->update(['paid' => true]);

    // Dispense the prescription
    $this->actingAs($user)
        ->post(prescriptionTeamUrl($user, '/'.$prescription->getKey().'/dispense'))
        ->assertRedirect();

    $prescription->refresh();
    expect($prescription->status)->toBe('dispensed');

    // Record initial stock for drug2
    $initialDrug2Quantity = (int) $drugInventory2->fresh()->quantity;

    // Add drug2 to the dispensed prescription
    $this->actingAs($user)
        ->patch(prescriptionTeamUrl($user, '/'.$prescription->getKey()), [
            'patient_id' => $patient->slug,
            'lines' => [
                [
                    'id' => $prescription->lines()->first()->getKey(),
                    'price_list_id' => $drug1->getKey(),
                    'frequency' => 1,
                    'duration' => 1,
                    'dosage' => 1,
                    'quantity' => 1,
                ],
                [
                    'id' => null,
                    'price_list_id' => $drug2->getKey(),
                    'frequency' => 1,
                    'duration' => 1,
                    'dosage' => 1,
                    'quantity' => 1,
                ],
            ],
        ])
        ->assertRedirect();

    $prescription->refresh();
    $newLine = $prescription->lines()->where('price_list_id', $drug2->getKey())->firstOrFail();
    expect($newLine->paid)->toBeFalse();

    // Mark the new billing as paid so the new lines can be dispensed
    $newBilling = $prescription->billings()->orderByDesc('id')->firstOrFail();
    $newBilling->update(['status' => 'paid']);

    // Now manually dispense the new lines
    $this->actingAs($user)
        ->post(prescriptionTeamUrl($user, '/'.$prescription->getKey().'/dispense-new-lines'))
        ->assertRedirect();

    $prescription->refresh();
    $newLine->refresh();

    // The new line should now have dispense_status set to 'dispensed'
    expect($newLine->dispense_status)->toBe('dispensed');

    // Drug2 inventory should be decremented by 1
    expect((int) $drugInventory2->fresh()->quantity)->toBe($initialDrug2Quantity - 1);
});
