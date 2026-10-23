<?php

use App\Models\Category;
use App\Models\LabInventory;
use App\Models\Laboratory;
use App\Models\Line;
use App\Models\Patient;
use App\Models\PriceList;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

function laboratoryTeamUrl(User $user, string $path = ''): string
{
    return '/'.$user->currentTeam->slug.'/laboratories'.$path;
}

function laboratoryPatient(User $user): Patient
{
    return Patient::factory()->create([
        'team_id' => $user->currentTeam->getKey(),
        'category_id' => Category::factory()->create([
            'team_id' => $user->currentTeam->getKey(),
        ])->getKey(),
    ]);
}

function laboratoryCatalog(User $user): array
{
    $teamId = $user->currentTeam->getKey();

    $category = PriceList::factory()->create([
        'team_id' => $teamId,
        'name' => 'Laboratory',
        'is_category' => true,
        'category_id' => null,
        'subcategory_id' => null,
    ]);

    $subcategory = PriceList::factory()->create([
        'team_id' => $teamId,
        'name' => 'Haematology',
        'is_category' => false,
        'category_id' => $category->getKey(),
        'subcategory_id' => null,
    ]);

    $test = PriceList::factory()->create([
        'team_id' => $teamId,
        'name' => 'Malaria RDT',
        'price' => 1500,
        'is_category' => false,
        'is_inventory' => false,
        'category_id' => $category->getKey(),
        'subcategory_id' => $subcategory->getKey(),
        'result_type' => 'radio',
    ]);

    return compact('category', 'subcategory', 'test');
}

test('guests are redirected to the login page', function () {
    $user = User::factory()->create();

    $this->get(laboratoryTeamUrl($user))->assertRedirect(route('login'));
});

test('the laboratory workspace shows stats and paid options', function () {
    $user = User::factory()->create();
    $patient = laboratoryPatient($user);

    Laboratory::factory()->create([
        'team_id' => $user->currentTeam->getKey(),
        'patient_id' => $patient->slug,
        'doctor_id' => $user->getKey(),
        'status' => 'paid',
        'total' => 1500,
    ]);

    $this->actingAs($user)
        ->get(laboratoryTeamUrl($user))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('laboratories/index')
            ->has('stats')
            ->has('topTests')
            ->has('paidOptions', 1)
            ->has('createOptions')
        );
});

test('the laboratory workspace ranks requested tests for its selected period', function () {
    $user = User::factory()->create();
    $patient = laboratoryPatient($user);
    ['test' => $test] = laboratoryCatalog($user);
    $laboratory = Laboratory::factory()->create([
        'team_id' => $user->currentTeam->getKey(),
        'patient_id' => $patient->slug,
        'doctor_id' => $user->getKey(),
        'status' => 'paid',
        'created_at' => now(),
    ]);

    Line::factory()->create([
        'team_id' => $user->currentTeam->getKey(),
        'patient_id' => $patient->slug,
        'user_id' => $user->getKey(),
        'lineable_type' => Laboratory::class,
        'lineable_id' => $laboratory->getKey(),
        'price_list_id' => $test->getKey(),
        'quantity' => 1,
        'unitPrice' => 1500,
    ]);

    $this->actingAs($user)
        ->get(laboratoryTeamUrl($user))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('topTests.0.name', 'Malaria RDT')
            ->where('topTests.0.requests', 1)
            ->where('topTests.0.value', 1500)
        );
});

test('a laboratory request can be created with lines and billing', function () {
    $user = User::factory()->create();
    $patient = laboratoryPatient($user);
    ['test' => $test] = laboratoryCatalog($user);
    LabInventory::factory()->create([
        'team_id' => $user->currentTeam->getKey(),
        'price_list_id' => $test->getKey(),
        'cost' => 500,
    ]);

    $this->actingAs($user)
        ->post(laboratoryTeamUrl($user), [
            'patient_id' => $patient->slug,
            'lines' => [
                [
                    'price_list_id' => $test->getKey(),
                    'unitPrice' => 1500,
                    'quantity' => 1,
                ],
            ],
            'total' => 1500,
        ])
        ->assertRedirect(laboratoryTeamUrl($user));

    $laboratory = Laboratory::query()->where('patient_id', $patient->slug)->first();

    expect($laboratory)->not->toBeNull()
        ->and($laboratory->status)->toBe('pending')
        ->and((float) $laboratory->total)->toBe(1500.0)
        ->and($laboratory->lines()->count())->toBe(1)
        ->and((float) $laboratory->lines()->first()->unitCost)->toBe(500.0)
        ->and($laboratory->billings()->count())->toBe(1);
});

test('results can be submitted for a paid laboratory request', function () {
    $user = User::factory()->create();
    $patient = laboratoryPatient($user);
    ['test' => $test] = laboratoryCatalog($user);

    $laboratory = Laboratory::factory()->create([
        'team_id' => $user->currentTeam->getKey(),
        'patient_id' => $patient->slug,
        'doctor_id' => $user->getKey(),
        'status' => 'paid',
        'total' => 1500,
    ]);

    Line::factory()->create([
        'team_id' => $user->currentTeam->getKey(),
        'patient_id' => $patient->slug,
        'user_id' => $user->getKey(),
        'lineable_type' => Laboratory::class,
        'lineable_id' => $laboratory->getKey(),
        'price_list_id' => $test->getKey(),
        'quantity' => 1,
        'unitPrice' => 1500,
        'results' => null,
    ]);

    $this->actingAs($user)
        ->post(laboratoryTeamUrl($user, '/'.$laboratory->getKey().'/results'), [
            'lines' => [
                (string) $test->getKey() => 'Positive',
            ],
            'testResults' => [],
        ])
        ->assertRedirect(laboratoryTeamUrl($user, '/'.$laboratory->getKey()));

    expect($laboratory->fresh()->status)->toBe('submitted')
        ->and($laboratory->lines()->first()->results)->toBe('Positive');
});

test('the laboratory history lists team requests', function () {
    $user = User::factory()->create();
    $patient = laboratoryPatient($user);

    Laboratory::factory()->create([
        'team_id' => $user->currentTeam->getKey(),
        'patient_id' => $patient->slug,
        'doctor_id' => $user->getKey(),
        'status' => 'pending',
        'total' => 2000,
    ]);

    Laboratory::factory()->create([
        'status' => 'pending',
        'total' => 999,
    ]);

    $this->actingAs($user)
        ->get(laboratoryTeamUrl($user, '/history'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('laboratories/history')
            ->has('laboratories.data', 1)
            ->where('laboratories.data.0.patientId', $patient->slug)
        );
});

test('a laboratory request can be viewed', function () {
    $user = User::factory()->create();
    $patient = laboratoryPatient($user);
    ['test' => $test] = laboratoryCatalog($user);

    $laboratory = Laboratory::factory()->create([
        'team_id' => $user->currentTeam->getKey(),
        'patient_id' => $patient->slug,
        'doctor_id' => $user->getKey(),
        'status' => 'submitted',
        'total' => 1500,
    ]);

    Line::factory()->create([
        'team_id' => $user->currentTeam->getKey(),
        'patient_id' => $patient->slug,
        'user_id' => $user->getKey(),
        'lineable_type' => Laboratory::class,
        'lineable_id' => $laboratory->getKey(),
        'price_list_id' => $test->getKey(),
        'quantity' => 1,
        'unitPrice' => 1500,
        'results' => 'Positive',
    ]);

    $this->actingAs($user)
        ->get(laboratoryTeamUrl($user, '/'.$laboratory->getKey()))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('laboratories/show')
            ->where('laboratory.id', $laboratory->getKey())
            ->has('resultForm.steps')
        );
});

test('the laboratory investigation report lists submitted requests', function () {
    $user = User::factory()->create();
    $patient = laboratoryPatient($user);

    Laboratory::factory()->create([
        'team_id' => $user->currentTeam->getKey(),
        'patient_id' => $patient->slug,
        'doctor_id' => $user->getKey(),
        'status' => 'submitted',
        'total' => 1500,
        'created_at' => now(),
    ]);

    Laboratory::factory()->create([
        'team_id' => $user->currentTeam->getKey(),
        'patient_id' => $patient->slug,
        'doctor_id' => $user->getKey(),
        'status' => 'pending',
        'total' => 500,
        'created_at' => now(),
    ]);

    $this->actingAs($user)
        ->get('/'.$user->currentTeam->slug.'/reports/laboratory')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('reports/laboratory')
            ->has('laboratories.data', 1)
            ->where('laboratories.data.0.status', 'submitted')
        );
});
