<?php

use App\Models\Admission;
use App\Models\Billing;
use App\Models\Category;
use App\Models\Country;
use App\Models\Lga;
use App\Models\Line;
use App\Models\Method;
use App\Models\Patient;
use App\Models\Payment;
use App\Models\PriceList;
use App\Models\State;
use App\Models\User;
use App\Models\Ward;
use Illuminate\Support\Facades\DB;

function billingTeamUrl(User $user, string $path = '', array $query = []): string
{
    $url = '/'.$user->currentTeam->slug.'/billings'.$path;

    if ($query !== []) {
        $url .= '?'.http_build_query($query);
    }

    return $url;
}

function teamMethod(User $user, string $name): Method
{
    return Method::factory()->create([
        'team_id' => $user->currentTeam->getKey(),
        'name' => $name,
    ]);
}

function teamPatientSlug(User $user, array $overrides = []): string
{
    $attributes = array_merge(['team_id' => $user->currentTeam->getKey()], $overrides);

    if (! array_key_exists('category_id', $attributes)) {
        $attributes['category_id'] = Category::factory()->create([
            'team_id' => $user->currentTeam->getKey(),
        ])->getKey();
    }

    return Patient::factory()->create($attributes)->slug;
}

function teamBilling(User $user, array $overrides = []): Billing
{
    return Billing::factory()->create(array_merge([
        'team_id' => $user->currentTeam->getKey(),
        'patient_id' => teamPatientSlug($user),
        'user_id' => $user->getKey(),
        'billable_type' => null,
        'billable_id' => null,
        'total' => 5000,
        'status' => 'billed',
    ], $overrides));
}

test('guests are redirected to the login page', function () {
    $user = User::factory()->create();

    $this->get(billingTeamUrl($user))->assertRedirect(route('login'));
});

test('the billings history lists paid billings with a summed total', function () {
    $user = User::factory()->create();
    teamBilling($user, ['status' => 'paid', 'total' => 3000]);
    teamBilling($user, ['status' => 'paid', 'total' => 2000]);
    teamBilling($user, ['status' => 'billed', 'total' => 9999]);

    $this->actingAs($user)
        ->get(billingTeamUrl($user, '/history'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('finance/billings/history')
            ->has('billings.data', 2)
            ->where('summary.total', 5000)
            ->where('summary.count', 2));
});

test('the billings history filters by search query', function () {
    $user = User::factory()->create();
    $patient = teamPatientSlug($user);
    teamBilling($user, ['status' => 'paid', 'patient_id' => $patient]);

    $this->actingAs($user)
        ->get(billingTeamUrl($user, '/history', ['q' => $patient]))
        ->assertOk()
        ->assertInertia(fn ($page) => $page->has('billings.data', 1));
});

test('the billings history filters by date range', function () {
    $user = User::factory()->create();
    teamBilling($user, ['status' => 'paid', 'created_at' => now()->subDays(20)]);
    teamBilling($user, ['status' => 'paid', 'created_at' => now()]);

    $this->actingAs($user)
        ->get(billingTeamUrl($user, '/history', ['from' => now()->format('Y-m-d')]))
        ->assertOk()
        ->assertInertia(fn ($page) => $page->has('billings.data', 1));
});

test('the payment form lists billed invoices and stats', function () {
    $user = User::factory()->create();
    teamMethod($user, 'Cash');
    teamBilling($user, ['status' => 'billed', 'total' => 5000]);

    $this->actingAs($user)
        ->get(billingTeamUrl($user))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('finance/billings/index')
            ->has('billings', 1)
            ->has('methods', 1)
            ->has('stats')
            ->has('dateFilterOptions', 8));
});

test('the payment form indicates OPD when the patient is not admitted in a ward', function () {
    $user = User::factory()->create();
    teamMethod($user, 'Cash');
    $billing = teamBilling($user, ['status' => 'billed']);

    $this->actingAs($user)
        ->get(billingTeamUrl($user))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('finance/billings/index')
            ->where('billings.0.id', $billing->getKey())
            ->where('billings.0.isAdmitted', false));
});

test('the payment form indicates On Admission when the patient is admitted in a ward', function () {
    $user = User::factory()->create();
    teamMethod($user, 'Cash');
    $patientSlug = teamPatientSlug($user);
    $ward = Ward::factory()->ward()->create(['team_id' => $user->currentTeam->getKey()]);
    $bed = Ward::factory()->bed($ward)->create(['team_id' => $user->currentTeam->getKey()]);

    Admission::factory()->create([
        'team_id' => $user->currentTeam->getKey(),
        'patient_id' => $patientSlug,
        'ward_id' => $ward->getKey(),
        'bed_id' => $bed->getKey(),
        'status' => 'admitted',
    ]);

    $billing = teamBilling($user, ['status' => 'billed', 'patient_id' => $patientSlug]);

    $this->actingAs($user)
        ->get(billingTeamUrl($user))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('finance/billings/index')
            ->where('billings.0.id', $billing->getKey())
            ->where('billings.0.isAdmitted', true));
});

test('the payment form indicates OPD when patient was discharged from ward', function () {
    $user = User::factory()->create();
    teamMethod($user, 'Cash');
    $patientSlug = teamPatientSlug($user);
    $ward = Ward::factory()->ward()->create(['team_id' => $user->currentTeam->getKey()]);

    Admission::factory()->create([
        'team_id' => $user->currentTeam->getKey(),
        'patient_id' => $patientSlug,
        'ward_id' => $ward->getKey(),
        'status' => 'discharged',
    ]);

    $billing = teamBilling($user, ['status' => 'billed', 'patient_id' => $patientSlug]);

    $this->actingAs($user)
        ->get(billingTeamUrl($user))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('finance/billings/index')
            ->where('billings.0.id', $billing->getKey())
            ->where('billings.0.isAdmitted', false));
});

test('a cash payment is recorded and the invoice is marked paid', function () {
    $user = User::factory()->create();
    $cash = teamMethod($user, 'Cash');
    $billing = teamBilling($user, ['status' => 'billed', 'total' => 5000]);

    $this->actingAs($user)
        ->post(billingTeamUrl($user), [
            'billing_id' => $billing->getKey(),
            'payments' => [
                ['method_id' => $cash->getKey(), 'amount' => 5000],
            ],
        ])
        ->assertRedirect(billingTeamUrl($user));

    expect($billing->fresh()->status)->toBe('paid');
    expect(Payment::query()->where('billing_id', $billing->getKey())->sum('amount'))->toEqual(5000.0);
});
test('a successful payment marks line items as paid', function () {
    $user = User::factory()->create();
    $cash = teamMethod($user, 'Cash');
    $billingGroup = PriceList::factory()->create([
        'team_id' => $user->currentTeam->getKey(),
        'name' => 'Billing',
        'is_category' => true,
    ]);
    $item = PriceList::factory()->create([
        'team_id' => $user->currentTeam->getKey(),
        'subcategory_id' => $billingGroup->getKey(),
        'price' => 1500,
    ]);
    $category = Category::factory()->create(['team_id' => $user->currentTeam->getKey()]);

    $this->actingAs($user)
        ->post(billingTeamUrl($user, '/new'), [
            'firstName' => 'Jane',
            'lastName' => 'Doe',
            'gender' => 'Female',
            'birthDate' => now()->subYears(30)->format('Y-m-d'),
            'phone' => '08000000000',
            'country_id' => Country::factory()->create()->getKey(),
            'state_id' => State::factory()->create()->getKey(),
            'lga_id' => Lga::factory()->create()->getKey(),
            'address' => '1 Test Street',
            'category_id' => $category->getKey(),
            'billings' => [
                [
                    'total' => 3000,
                    'lines' => [
                        ['price_list_id' => $item->getKey(), 'unitPrice' => 1500],
                        ['price_list_id' => $item->getKey(), 'unitPrice' => 1500],
                    ],
                ],
            ],
        ])
        ->assertRedirect(billingTeamUrl($user));

    $patient = Patient::query()->where('firstName', 'Jane')->first();
    expect($patient)->not->toBeNull();

    $billing = Billing::query()->where('patient_id', $patient->slug)->first();
    expect($billing)->not->toBeNull();
    expect($billing->status)->toBe('billed');

    $lines = Line::query()
        ->where('lineable_id', $billing->getKey())
        ->where('lineable_type', Billing::class)
        ->get();

    expect($lines->count())->toBe(2);
    expect($lines->every(fn ($line) => $line->paid === false))->toBeTrue();

    $this->actingAs($user)
        ->post(billingTeamUrl($user), [
            'billing_id' => $billing->getKey(),
            'payments' => [
                ['method_id' => $cash->getKey(), 'amount' => 3000],
            ],
        ])
        ->assertRedirect(billingTeamUrl($user));

    expect($billing->fresh()->status)->toBe('paid');

    $freshLines = Line::query()
        ->where('lineable_id', $billing->getKey())
        ->where('lineable_type', Billing::class)
        ->get();

    expect($freshLines->every(fn ($line) => $line->paid === true))->toBeTrue();
});

test('a payment cannot be recorded against a non-billed invoice', function () {
    $user = User::factory()->create();
    $cash = teamMethod($user, 'Cash');
    $billing = teamBilling($user, ['status' => 'paid']);

    $this->actingAs($user)
        ->post(billingTeamUrl($user), [
            'billing_id' => $billing->getKey(),
            'payments' => [
                ['method_id' => $cash->getKey(), 'amount' => 5000],
            ],
        ])
        ->assertSessionHasErrors('billing_id');
});

test('a payment cannot use a method from another team', function () {
    $user = User::factory()->create();
    $outsider = User::factory()->create();
    $cash = teamMethod($outsider, 'Cash');
    $billing = teamBilling($user, ['status' => 'billed']);

    $this->actingAs($user)
        ->post(billingTeamUrl($user), [
            'billing_id' => $billing->getKey(),
            'payments' => [
                ['method_id' => $cash->getKey(), 'amount' => 1000],
            ],
        ])
        ->assertSessionHasErrors('payments.0.method_id');
});

test('a discount payment records the discount columns', function () {
    $user = User::factory()->create();
    $discount = teamMethod($user, 'Discount');
    $billing = teamBilling($user, ['status' => 'billed', 'total' => 5000]);

    $this->actingAs($user)
        ->post(billingTeamUrl($user), [
            'billing_id' => $billing->getKey(),
            'payments' => [
                [
                    'method_id' => $discount->getKey(),
                    'discount_percentage' => 10,
                    'discount_amount' => 500,
                ],
            ],
        ])
        ->assertRedirect(billingTeamUrl($user));

    $payment = Payment::query()->where('billing_id', $billing->getKey())->first();

    expect($payment)->not->toBeNull();
    expect((float) $payment->discount_amount)->toEqual(500.0);
    expect((int) $payment->discount_percentage)->toBe(10);
});

test('a wallet payment debits the patient wallet', function () {
    $user = User::factory()->create();
    $wallet = teamMethod($user, 'Wallet');
    $patientSlug = teamPatientSlug($user, ['wallet' => 10000]);
    $billing = teamBilling($user, ['status' => 'billed', 'patient_id' => $patientSlug, 'total' => 4000]);

    $this->actingAs($user)
        ->post(billingTeamUrl($user), [
            'billing_id' => $billing->getKey(),
            'payments' => [
                ['method_id' => $wallet->getKey(), 'wallet_debit' => 4000],
            ],
        ])
        ->assertRedirect(billingTeamUrl($user));

    expect((float) DB::table('patients')->where('slug', $patientSlug)->value('wallet'))->toEqual(6000.0);
});

test('a billing can be deleted', function () {
    $user = User::factory()->create();
    $billing = teamBilling($user, ['status' => 'paid']);

    $this->actingAs($user)
        ->delete(billingTeamUrl($user, '/'.$billing->getKey()))
        ->assertRedirect(billingTeamUrl($user, '/history'));

    expect(Billing::query()->whereKey($billing->getKey())->exists())->toBeFalse();
});

test('selected billings can be bulk deleted', function () {
    $user = User::factory()->create();
    $first = teamBilling($user, ['status' => 'paid']);
    $second = teamBilling($user, ['status' => 'paid']);

    $this->actingAs($user)
        ->delete(billingTeamUrl($user, '/bulk'), [
            'ids' => [$first->getKey(), $second->getKey()],
        ])
        ->assertRedirect(billingTeamUrl($user, '/history'));

    expect(Billing::query()->whereIn('id', [$first->getKey(), $second->getKey()])->count())->toBe(0);
});

test('a billing from another team cannot be deleted', function () {
    $user = User::factory()->create();
    $outsider = User::factory()->create();
    $billing = teamBilling($outsider, ['status' => 'paid']);

    $this->actingAs($user)
        ->delete(billingTeamUrl($user, '/'.$billing->getKey()))
        ->assertNotFound();
});

test('a paid billing can be viewed as a receipt', function () {
    $user = User::factory()->create();
    $cash = teamMethod($user, 'Cash');
    $billing = teamBilling($user, ['status' => 'billed', 'total' => 5000]);

    $this->actingAs($user)
        ->post(billingTeamUrl($user), [
            'billing_id' => $billing->getKey(),
            'payments' => [
                ['method_id' => $cash->getKey(), 'amount' => 5000],
            ],
        ]);

    $this->actingAs($user)
        ->get(billingTeamUrl($user, '/'.$billing->getKey()))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('finance/billings/show')
            ->where('billing.id', $billing->getKey())
            ->has('billing.payments', 1));
});

test('a receipt from another team cannot be viewed', function () {
    $user = User::factory()->create();
    $outsider = User::factory()->create();
    $billing = teamBilling($outsider, ['status' => 'paid']);

    $this->actingAs($user)
        ->get(billingTeamUrl($user, '/'.$billing->getKey()))
        ->assertNotFound();
});

test('a new billing creates an invoice from a new patient with lines', function () {
    $user = User::factory()->create();
    $billingGroup = PriceList::factory()->create([
        'team_id' => $user->currentTeam->getKey(),
        'name' => 'Billing',
        'is_category' => true,
    ]);
    $item = PriceList::factory()->create([
        'team_id' => $user->currentTeam->getKey(),
        'subcategory_id' => $billingGroup->getKey(),
        'price' => 1500,
    ]);
    $category = Category::factory()->create(['team_id' => $user->currentTeam->getKey()]);

    $this->actingAs($user)
        ->post(billingTeamUrl($user, '/new'), [
            'firstName' => 'Jane',
            'lastName' => 'Doe',
            'gender' => 'Female',
            'birthDate' => now()->subYears(30)->format('Y-m-d'),
            'phone' => '08000000000',
            'country_id' => Country::factory()->create()->getKey(),
            'state_id' => State::factory()->create()->getKey(),
            'lga_id' => Lga::factory()->create()->getKey(),
            'address' => '1 Test Street',
            'category_id' => $category->getKey(),
            'billings' => [
                [
                    'total' => 1500,
                    'lines' => [
                        ['price_list_id' => $item->getKey(), 'unitPrice' => 1500],
                    ],
                ],
            ],
        ])
        ->assertRedirect(billingTeamUrl($user));

    $patient = Patient::query()->where('firstName', 'Jane')->first();
    expect($patient)->not->toBeNull();

    $billing = Billing::query()->where('patient_id', $patient->slug)->first();
    expect($billing)->not->toBeNull();
    expect($billing->status)->toBe('billed');
    expect((float) $billing->total)->toEqual(1500.0);
    expect(Line::query()->where('lineable_id', $billing->getKey())->count())->toBe(1);
});

test('a new billing can reuse an existing patient', function () {
    $user = User::factory()->create();
    $billingGroup = PriceList::factory()->create([
        'team_id' => $user->currentTeam->getKey(),
        'name' => 'Billing',
        'is_category' => true,
    ]);
    $item = PriceList::factory()->create([
        'team_id' => $user->currentTeam->getKey(),
        'subcategory_id' => $billingGroup->getKey(),
        'price' => 800,
    ]);
    $patientSlug = teamPatientSlug($user);

    $this->actingAs($user)
        ->post(billingTeamUrl($user, '/new'), [
            'existing_patient_id' => $patientSlug,
            'billings' => [
                [
                    'total' => 800,
                    'lines' => [
                        ['price_list_id' => $item->getKey(), 'unitPrice' => 800],
                    ],
                ],
            ],
        ])
        ->assertRedirect(billingTeamUrl($user));

    expect(Billing::query()->where('patient_id', $patientSlug)->where('status', 'billed')->exists())->toBeTrue();
});
