<?php

use App\Models\Admission;
use App\Models\Billing;
use App\Models\Laboratory;
use App\Models\Method;
use App\Models\Patient;
use App\Models\Prescription;
use App\Models\PriceList;
use App\Models\User;
use App\Models\Ward;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

function v1PermUser(array $permissions): array
{
    $user = User::factory()->create();
    $team = $user->currentTeam;
    $role = Role::create(['name' => 'r_'.uniqid(), 'guard_name' => 'web']);
    foreach ($permissions as $permission) {
        Permission::findOrCreate($permission, 'web');
        $role->givePermissionTo($permission);
    }
    $user->assignRole($role);

    return [$user, $team];
}

test('v1 can create laboratory request', function () {
    [$user, $team] = v1PermUser(['view laboratory', 'create laboratory']);
    $patient = Patient::factory()->create(['team_id' => $team->id]);
    $priceList = PriceList::factory()->create(['team_id' => $team->id]);

    $this->actingAs($user, 'sanctum');
    $this->withHeader('X-Team-Slug', $team->slug)
        ->postJson('/api/v1/laboratories', [
            'patient_id' => $patient->slug,
            'lines' => [['price_list_id' => $priceList->id, 'quantity' => 1, 'unitPrice' => 100]],
        ])->assertCreated()->assertJsonPath('message', 'Laboratory request created.');

    expect(Laboratory::query()->where('patient_id', $patient->slug)->exists())->toBeTrue();
});

test('v1 can create prescription', function () {
    [$user, $team] = v1PermUser(['view pharmacy', 'create prescription']);
    $patient = Patient::factory()->create(['team_id' => $team->id]);

    $pharmacy = PriceList::factory()->create(['team_id' => $team->id, 'name' => 'Pharmacy', 'is_category' => true, 'category_id' => null, 'subcategory_id' => null]);
    $sub = PriceList::factory()->create(['team_id' => $team->id, 'name' => 'Drugs', 'is_category' => true, 'category_id' => $pharmacy->id, 'subcategory_id' => null]);
    $priceList = PriceList::factory()->create(['team_id' => $team->id, 'category_id' => $pharmacy->id, 'subcategory_id' => $sub->id, 'is_category' => false, 'is_inventory' => true, 'price' => 50]);

    $this->actingAs($user, 'sanctum');
    $this->withHeader('X-Team-Slug', $team->slug)
        ->postJson('/api/v1/prescriptions', [
            'patient_id' => $patient->slug,
            'lines' => [['price_list_id' => $priceList->id, 'quantity' => 2, 'frequency' => 1, 'duration' => 1, 'dosage' => 1]],
        ])->assertCreated()->assertJsonPath('message', 'Prescription created.');

    expect(Prescription::query()->where('patient_id', $patient->slug)->exists())->toBeTrue();
});

test('v1 can list billings and pay', function () {
    [$user, $team] = v1PermUser(['view billing', 'create billing']);
    $patient = Patient::factory()->create(['team_id' => $team->id]);
    $method = Method::query()->create(['team_id' => $team->id, 'name' => 'Cash-'.uniqid()]);

    $billing = Billing::query()->create([
        'team_id' => $team->id,
        'patient_id' => $patient->slug,
        'user_id' => $user->id,
        'total' => 100,
        'status' => 'billed',
    ]);

    $this->actingAs($user, 'sanctum');
    $headers = ['X-Team-Slug' => $team->slug];

    $this->withHeaders($headers)->getJson('/api/v1/billings')->assertOk();
    $this->withHeaders($headers)->getJson('/api/v1/billings/options')->assertOk();

    $this->withHeaders($headers)->postJson('/api/v1/billings/pay', [
        'billing_id' => $billing->id,
        'payments' => [[
            'method_id' => $method->id,
            'amount' => 100,
        ]],
    ])->assertOk()->assertJsonPath('message', 'Payment recorded.');

    expect($billing->fresh()->status)->toBe('paid');
});

test('v1 admission search history and counts work', function () {
    [$user, $team] = v1PermUser(['view nursing']);
    $patient = Patient::factory()->create(['team_id' => $team->id, 'firstName' => 'Jane', 'lastName' => 'Doe']);
    $ward = Ward::factory()->create(['team_id' => $team->id, 'is_ward' => true]);
    Admission::query()->create([
        'team_id' => $team->id, 'patient_id' => $patient->slug, 'doctor_id' => $user->id, 'ward_id' => $ward->id, 'status' => 'pending', 'duration' => 1,
    ]);

    $this->actingAs($user, 'sanctum');
    $h = ['X-Team-Slug' => $team->slug];
    $this->withHeaders($h)->getJson('/api/v1/admissions/search?q=Jane')->assertOk()->assertJsonPath('data.patient_id', $patient->slug);
    $this->withHeaders($h)->getJson('/api/v1/admissions/history')->assertOk();
    $this->withHeaders($h)->getJson('/api/v1/admissions/dashboard-counts')->assertOk()->assertJsonPath('data.pending', 1);
});
