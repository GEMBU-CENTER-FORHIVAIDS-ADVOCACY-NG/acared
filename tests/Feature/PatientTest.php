<?php

use App\Models\Billing;
use App\Models\Category;
use App\Models\Country;
use App\Models\Lga;
use App\Models\Line;
use App\Models\Patient;
use App\Models\PriceList;
use App\Models\State;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

function patientPayload(?User $user = null, array $overrides = []): array
{
    $teamId = $user?->currentTeam?->getKey();

    $country = Country::factory()->create();
    $state = State::factory()->create();
    $lga = Lga::factory()->create();

    return array_merge([
        'category_id' => Category::factory()->create($teamId ? ['team_id' => $teamId] : [])->getKey(),
        'firstName' => 'Ada',
        'lastName' => 'Obi',
        'gender' => 'Female',
        'birthDate' => '1990-05-01',
        'email' => 'ada@example.com',
        'phone' => '08012345678',
        'country_id' => $country->getKey(),
        'state_id' => $state->getKey(),
        'lga_id' => $lga->getKey(),
        'address' => '12 Lagos Street',
    ], $overrides);
}

function patientTeamUrl(User $user, string $path = ''): string
{
    return '/'.$user->currentTeam->slug.'/patients'.$path;
}

function teamPatient(User $user, array $attributes = [], bool $trashed = false): Patient
{
    $factory = Patient::factory();

    if ($trashed) {
        $factory = $factory->trashed();
    }

    $attributes = array_merge(['team_id' => $user->currentTeam->getKey()], $attributes);

    if (! array_key_exists('category_id', $attributes)) {
        $attributes['category_id'] = Category::factory()->create(['team_id' => $user->currentTeam->getKey()])->getKey();
    }

    return $factory->create($attributes);
}

test('guests are redirected to the login page', function () {
    $user = User::factory()->create();

    $this->get(patientTeamUrl($user))->assertRedirect(route('login'));
});

test('the patients index renders with tabs and stats', function () {
    $user = User::factory()->create();
    $category = Category::factory()->create(['team_id' => $user->currentTeam->getKey()]);
    teamPatient($user, ['category_id' => $category->getKey()]);
    teamPatient($user, ['category_id' => $category->getKey()]);

    $this->actingAs($user)
        ->get(patientTeamUrl($user))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('patients/index')
            ->has('patients.data', 2)
            ->has('tabs', 3)
            ->where('tabs.0.key', 'all')
            ->where('tabs.0.count', 2)
            ->where('tabs.1.key', 'children')
            ->has('stats')
            ->where('filters.tab', 'all')
            ->where('filters.perPage', 25),
        );
});

test('the patients index does not include other teams patients', function () {
    $user = User::factory()->create();
    teamPatient($user);
    Patient::factory()->create();

    $this->actingAs($user)
        ->get(patientTeamUrl($user))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('patients/index')
            ->has('patients.data', 1),
        );
});

test('the patients index filters by search query', function () {
    $user = User::factory()->create();
    $teamId = $user->currentTeam->getKey();

    Patient::factory()->create(['team_id' => $teamId, 'category_id' => Category::factory()->create(['team_id' => $teamId])->getKey(), 'firstName' => 'Zainab', 'lastName' => 'Yusuf', 'middleName' => null]);
    Patient::factory()->create(['team_id' => $teamId, 'category_id' => Category::factory()->create(['team_id' => $teamId])->getKey(), 'firstName' => 'Tunde', 'lastName' => 'Bakare']);

    $this->actingAs($user)
        ->get(patientTeamUrl($user).'?q=Zainab')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('patients/index')
            ->has('patients.data', 1)
            ->where('patients.data.0.fullName', 'Zainab Yusuf'),
        );
});

test('the patients index filters children by the children tab', function () {
    $user = User::factory()->create();
    $teamId = $user->currentTeam->getKey();

    Patient::factory()->child()->create(['team_id' => $teamId, 'category_id' => Category::factory()->create(['team_id' => $teamId])->getKey()]);
    Patient::factory()->create(['team_id' => $teamId, 'category_id' => Category::factory()->create(['team_id' => $teamId])->getKey(), 'birthDate' => now()->subYears(30)->toDateString()]);

    $this->actingAs($user)
        ->get(patientTeamUrl($user).'?tab=children')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('patients/index')
            ->has('patients.data', 1)
            ->where('filters.tab', 'children'),
        );
});

test('the patients index only lists trashed patients when trashed only is selected', function () {
    $user = User::factory()->create();
    $teamId = $user->currentTeam->getKey();

    Patient::factory()->create(['team_id' => $teamId, 'category_id' => Category::factory()->create(['team_id' => $teamId])->getKey()]);
    Patient::factory()->trashed()->create(['team_id' => $teamId, 'category_id' => Category::factory()->create(['team_id' => $teamId])->getKey()]);

    $this->actingAs($user)
        ->get(patientTeamUrl($user).'?trashed=only')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('patients/index')
            ->has('patients.data', 1)
            ->has('patients.data.0.deletedAt'),
        );
});

test('a patient can be registered', function () {
    $user = User::factory()->create();

    $response = $this
        ->actingAs($user)
        ->post(patientTeamUrl($user), patientPayload($user));

    $patient = Patient::withoutGlobalScope('team')->latest('id')->first();

    $response->assertRedirect(patientTeamUrl($user, '/'.$patient->getKey()));
    expect($patient->slug)->toBe('PAT-00001')
        ->and($patient->team_id)->toBe($user->currentTeam->getKey())
        ->and($patient->firstName)->toBe('Ada');
});

test('a patient can be registered with billing lines', function () {
    $user = User::factory()->create();
    $priceList = PriceList::factory()->create([
        'team_id' => $user->currentTeam->getKey(),
    ]);

    $this->actingAs($user)
        ->post(patientTeamUrl($user), patientPayload($user, [
            'billings' => [
                [
                    'total' => 1500,
                    'lines' => [
                        [
                            'price_list_id' => $priceList->getKey(),
                            'unitPrice' => 1500,
                        ],
                    ],
                ],
            ],
        ]))
        ->assertRedirect();

    $patient = Patient::withoutGlobalScope('team')->latest('id')->firstOrFail();
    $billing = Billing::query()->where('patient_id', $patient->slug)->firstOrFail();

    expect((float) $billing->total)->toBe(1500.0)
        ->and($billing->billable_type)->toBe(Patient::class)
        ->and($billing->billable_id)->toBe($patient->getKey());

    $line = Line::query()->where('patient_id', $patient->slug)->firstOrFail();

    expect($line->price_list_id)->toBe($priceList->getKey())
        ->and((float) $line->unitPrice)->toBe(1500.0);
});

test('patient registration requires the required fields', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->post(patientTeamUrl($user), [])
        ->assertSessionHasErrors([
            'category_id',
            'firstName',
            'lastName',
            'gender',
            'birthDate',
            'phone',
            'country_id',
            'state_id',
            'lga_id',
            'address',
        ]);
});

test('patient registration rejects a category from another team', function () {
    $user = User::factory()->create();
    $foreignCategory = Category::factory()->create();

    $this->actingAs($user)
        ->post(patientTeamUrl($user), patientPayload($user, ['category_id' => $foreignCategory->getKey()]))
        ->assertSessionHasErrors('category_id');
});

test('a patient can be updated and the readonly hospital number is preserved', function () {
    $user = User::factory()->create();
    $patient = teamPatient($user);

    $response = $this
        ->actingAs($user)
        ->patch(patientTeamUrl($user, '/'.$patient->getKey()), patientPayload($user, [
            'category_id' => $patient->category_id,
            'firstName' => 'Updated',
            'slug' => 'PAT-99999',
        ]));

    $response->assertRedirect(patientTeamUrl($user, '/'.$patient->getKey()));
    expect($patient->fresh()->firstName)->toBe('Updated')
        ->and($patient->fresh()->slug)->not->toBe('PAT-99999');
});

test('a patient from another team cannot be updated', function () {
    $user = User::factory()->create();
    $patient = Patient::factory()->create();

    $this->actingAs($user)
        ->patch(patientTeamUrl($user, '/'.$patient->getKey()), patientPayload($user))
        ->assertNotFound();
});

test('a patient can be soft deleted', function () {
    $user = User::factory()->create();
    $patient = teamPatient($user);

    $this->actingAs($user)
        ->delete(patientTeamUrl($user, '/'.$patient->getKey()))
        ->assertRedirect(patientTeamUrl($user));

    expect($patient->fresh()->deleted_at)->not->toBeNull();
});

test('a soft deleted patient can be restored', function () {
    $user = User::factory()->create();
    $patient = teamPatient($user, trashed: true);

    $this->actingAs($user)
        ->patch(patientTeamUrl($user, '/'.$patient->getKey().'/restore'))
        ->assertRedirect(patientTeamUrl($user));

    expect($patient->fresh()->deleted_at)->toBeNull();
});

test('a soft deleted patient can be permanently deleted', function () {
    $user = User::factory()->create();
    $patient = teamPatient($user, trashed: true);

    $this->actingAs($user)
        ->delete(patientTeamUrl($user, '/'.$patient->getKey().'/force'))
        ->assertRedirect(patientTeamUrl($user));

    $this->assertDatabaseMissing('patients', ['id' => $patient->getKey()]);
});

test('a soft deleted patient can still be viewed', function () {
    $user = User::factory()->create();
    $patient = teamPatient($user, trashed: true);

    $this->actingAs($user)
        ->get(patientTeamUrl($user, '/'.$patient->getKey()))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('patients/show')
            ->where('patient.id', $patient->getKey()),
        );
});

test('selected patients can be bulk soft deleted', function () {
    $user = User::factory()->create();
    $teamId = $user->currentTeam->getKey();
    $patients = collect([teamPatient($user), teamPatient($user), teamPatient($user)]);

    $this->actingAs($user)
        ->delete(patientTeamUrl($user, '/bulk'), ['ids' => $patients->pluck('id')->all()])
        ->assertRedirect(patientTeamUrl($user));

    expect(Patient::query()->where('team_id', $teamId)->count())->toBe(0);
});

test('selected patients can be bulk permanently deleted', function () {
    $user = User::factory()->create();
    $patients = collect([teamPatient($user, trashed: true), teamPatient($user, trashed: true)]);

    $this->actingAs($user)
        ->delete(patientTeamUrl($user, '/bulk-force'), ['ids' => $patients->pluck('id')->all()])
        ->assertRedirect(patientTeamUrl($user));

    $this->assertDatabaseMissing('patients', ['id' => $patients->first()->getKey()]);
});

test('bulk delete requires at least one id', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->delete(patientTeamUrl($user, '/bulk'), ['ids' => []])
        ->assertSessionHasErrors('ids');
});
