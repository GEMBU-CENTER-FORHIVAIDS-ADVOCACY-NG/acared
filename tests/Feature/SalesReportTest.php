<?php

use App\Models\Admission;
use App\Models\Billing;
use App\Models\Line;
use App\Models\Method;
use App\Models\Patient;
use App\Models\Payment;
use App\Models\PriceList;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

function salesReportUrl(User $user, string $dimension, array $query = []): string
{
    $url = '/'.$user->currentTeam->slug.'/reports/sales/'.$dimension;

    if ($query !== []) {
        $url .= '?'.http_build_query($query);
    }

    return $url;
}

test('the sales by item report shows distinct aggregated items', function () {
    $user = User::factory()->create();
    $team = $user->currentTeam;
    $patient = Patient::factory()->create([
        'team_id' => $team->getKey(),
        'firstName' => 'Jane',
        'middleName' => null,
        'lastName' => 'Doe',
    ]);
    $item = PriceList::factory()->create([
        'team_id' => $team->getKey(),
        'name' => 'Consultation',
    ]);

    Line::factory()->create([
        'team_id' => $team->getKey(),
        'patient_id' => $patient->slug,
        'price_list_id' => $item->getKey(),
        'quantity' => 2,
        'unitCost' => 200,
        'unitPrice' => 500,
        'paid' => true,
        'created_at' => now(),
    ]);

    Line::factory()->create([
        'team_id' => $team->getKey(),
        'patient_id' => $patient->slug,
        'price_list_id' => $item->getKey(),
        'quantity' => 3,
        'unitCost' => 200,
        'unitPrice' => 500,
        'paid' => true,
        'created_at' => now(),
    ]);

    $this->actingAs($user)
        ->get(salesReportUrl($user, 'item'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('reports/sales/index')
            ->where('report.key', 'item')
            ->has('rows.data', 1)
            ->where('rows.data.0.item', 'Consultation')
            ->where('rows.data.0.quantity', 5)
            ->where('rows.data.0.unitCost', 1000)
            ->where('rows.data.0.unitPrice', 1000)
            ->where('rows.data.0.totalPrice', 2500)
            ->where('summary.transactions', 2)
            ->where('summary.items', 1)
            ->where('summary.quantity', 5)
            ->where('summary.cost', 1000)
            ->where('summary.price', 1000)
            ->where('summary.amount', 2500)
            ->where('groupTotals.Consultation.quantity', 5)
            ->where('groupTotals.Consultation.cost', 1000)
            ->where('groupTotals.Consultation.price', 1000)
            ->where('groupTotals.Consultation.amount', 2500)
        );
});

test('the sales by method report lists every payment detail and honours the date filter', function () {
    $user = User::factory()->create();
    $team = $user->currentTeam;
    $patient = Patient::factory()->create([
        'team_id' => $team->getKey(),
        'firstName' => 'John',
        'middleName' => null,
        'lastName' => 'Doe',
    ]);
    $method = Method::factory()->create([
        'team_id' => $team->getKey(),
        'name' => 'Cash',
    ]);
    $billing = Billing::factory()->create([
        'team_id' => $team->getKey(),
        'patient_id' => $patient->slug,
        'user_id' => $user->getKey(),
        'billable_type' => Admission::class,
    ]);

    Payment::factory()->create([
        'team_id' => $team->getKey(),
        'patient_id' => $patient->slug,
        'user_id' => $user->getKey(),
        'method_id' => $method->getKey(),
        'billing_id' => $billing->getKey(),
        'amount' => 1500,
        'discount_amount' => 100,
        'wallet' => 50,
        'mercy_fund' => 25,
        'infant_formula' => 10,
        'created_at' => now(),
    ]);

    Payment::factory()->create([
        'team_id' => $team->getKey(),
        'patient_id' => $patient->slug,
        'user_id' => $user->getKey(),
        'method_id' => $method->getKey(),
        'amount' => 9999,
        'created_at' => now()->subYear(),
    ]);

    $this->actingAs($user)
        ->get(salesReportUrl($user, 'method'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('reports/sales/index')
            ->where('report.key', 'method')
            ->has('rows.data', 1)
            ->where('rows.data.0.methodName', 'Cash')
            ->where('rows.data.0.amount', 1500)
            ->where('rows.data.0.discountAmount', 100)
            ->where('rows.data.0.wallet', 50)
            ->where('rows.data.0.mercyFund', 25)
            ->where('rows.data.0.infantFormula', 10)
            ->where('rows.data.0.transactions', 1)
            ->where('summary.transactions', 1)
            ->where('summary.amount', 1500)
            ->where('summary.discount', 100)
            ->where('summary.wallet', 50)
            ->where('summary.mercyFund', 25)
            ->where('summary.infantFormula', 10)
            ->where('groupTotals.Cash.amount', 1500)
            ->where('groupTotals.Cash.discount', 100)
            ->where('groupTotals.Cash.wallet', 50)
            ->where('groupTotals.Cash.mercyFund', 25)
            ->where('groupTotals.Cash.infantFormula', 10)
        );
});

test('the sales by department report merges subtotals per department', function () {
    $user = User::factory()->create();
    $team = $user->currentTeam;
    $patient = Patient::factory()->create([
        'team_id' => $team->getKey(),
        'firstName' => 'Dept',
        'middleName' => null,
        'lastName' => 'Patient',
    ]);
    $method = Method::factory()->create([
        'team_id' => $team->getKey(),
        'name' => 'Cash',
    ]);

    $category = PriceList::factory()->create([
        'team_id' => $team->getKey(),
        'name' => 'Laboratory',
        'is_category' => true,
    ]);

    $priceList = PriceList::factory()->create([
        'team_id' => $team->getKey(),
        'name' => 'Blood Test',
        'category_id' => $category->getKey(),
    ]);

    $billing = Billing::factory()->create([
        'team_id' => $team->getKey(),
        'patient_id' => $patient->slug,
        'user_id' => $user->getKey(),
        'billable_type' => Admission::class,
    ]);
    $otherBilling = Billing::factory()->create([
        'team_id' => $team->getKey(),
        'patient_id' => $patient->slug,
        'user_id' => $user->getKey(),
        'billable_type' => Admission::class,
    ]);

    Line::factory()->create([
        'team_id' => $team->getKey(),
        'patient_id' => $patient->slug,
        'lineable_type' => Admission::class,
        'lineable_id' => $billing->billable_id,
        'price_list_id' => $priceList->getKey(),
        'quantity' => 1,
        'unitPrice' => 100,
    ]);

    Line::factory()->create([
        'team_id' => $team->getKey(),
        'patient_id' => $patient->slug,
        'lineable_type' => Admission::class,
        'lineable_id' => $otherBilling->billable_id,
        'price_list_id' => $priceList->getKey(),
        'quantity' => 1,
        'unitPrice' => 100,
    ]);

    foreach ([
        [$billing->getKey(), 300],
        [$otherBilling->getKey(), 200],
        [null, 100],
    ] as [$billingId, $amount]) {
        Payment::factory()->create([
            'team_id' => $team->getKey(),
            'patient_id' => $patient->slug,
            'user_id' => $user->getKey(),
            'method_id' => $method->getKey(),
            'billing_id' => $billingId,
            'amount' => $amount,
            'created_at' => now(),
        ]);
    }

    $this->actingAs($user)
        ->get(salesReportUrl($user, 'department'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('reports/sales/index')
            ->has('rows.data', 3)
            ->where('groupTotals.Laboratory.amount', 500)
            ->where('groupTotals.Wallet Deposit.amount', 100)
        );
});

test('the sales by patient report shows distinct aggregated patients', function () {
    $user = User::factory()->create();
    $team = $user->currentTeam;
    $patient = Patient::factory()->create([
        'team_id' => $team->getKey(),
        'firstName' => 'Alice',
        'middleName' => null,
        'lastName' => 'Smith',
    ]);
    $method = Method::factory()->create([
        'team_id' => $team->getKey(),
        'name' => 'Cash',
    ]);

    Payment::factory()->create([
        'team_id' => $team->getKey(),
        'patient_id' => $patient->slug,
        'user_id' => $user->getKey(),
        'method_id' => $method->getKey(),
        'amount' => 1000,
        'discount_amount' => 50,
        'wallet' => 20,
        'mercy_fund' => 10,
        'infant_formula' => 5,
        'created_at' => now(),
    ]);

    Payment::factory()->create([
        'team_id' => $team->getKey(),
        'patient_id' => $patient->slug,
        'user_id' => $user->getKey(),
        'method_id' => $method->getKey(),
        'amount' => 500,
        'discount_amount' => 25,
        'wallet' => 10,
        'mercy_fund' => 5,
        'infant_formula' => 2,
        'created_at' => now(),
    ]);

    $this->actingAs($user)
        ->get(salesReportUrl($user, 'patient'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('reports/sales/index')
            ->where('report.key', 'patient')
            ->has('rows.data', 1)
            ->where('rows.data.0.patientId', $patient->slug)
            ->where('rows.data.0.patientName', 'Alice Smith')
            ->where('rows.data.0.amount', 1500)
            ->where('rows.data.0.discountAmount', 75)
            ->where('rows.data.0.wallet', 30)
            ->where('rows.data.0.mercyFund', 15)
            ->where('rows.data.0.infantFormula', 7)
            ->where('rows.data.0.transactions', 2)
            ->where('summary.transactions', 1)
            ->where('summary.amount', 1500)
            ->where('summary.discount', 75)
            ->where('summary.wallet', 30)
            ->where('summary.mercyFund', 15)
            ->where('summary.infantFormula', 7)
        );
});

test('the sales by payment method report shows distinct aggregated methods', function () {
    $user = User::factory()->create();
    $team = $user->currentTeam;
    $patient = Patient::factory()->create([
        'team_id' => $team->getKey(),
        'firstName' => 'Alice',
        'middleName' => null,
        'lastName' => 'Smith',
    ]);
    $cashMethod = Method::factory()->create([
        'team_id' => $team->getKey(),
        'name' => 'Cash',
    ]);

    Payment::factory()->create([
        'team_id' => $team->getKey(),
        'patient_id' => $patient->slug,
        'user_id' => $user->getKey(),
        'method_id' => $cashMethod->getKey(),
        'amount' => 1000,
        'discount_amount' => 50,
        'wallet' => 20,
        'mercy_fund' => 10,
        'infant_formula' => 5,
        'created_at' => now(),
    ]);

    Payment::factory()->create([
        'team_id' => $team->getKey(),
        'patient_id' => $patient->slug,
        'user_id' => $user->getKey(),
        'method_id' => $cashMethod->getKey(),
        'amount' => 500,
        'discount_amount' => 25,
        'wallet' => 10,
        'mercy_fund' => 5,
        'infant_formula' => 2,
        'created_at' => now(),
    ]);

    $this->actingAs($user)
        ->get(salesReportUrl($user, 'method'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('reports/sales/index')
            ->where('report.key', 'method')
            ->has('rows.data', 1)
            ->where('rows.data.0.methodName', 'Cash')
            ->where('rows.data.0.amount', 1500)
            ->where('rows.data.0.discountAmount', 75)
            ->where('rows.data.0.wallet', 30)
            ->where('rows.data.0.mercyFund', 15)
            ->where('rows.data.0.infantFormula', 7)
            ->where('rows.data.0.transactions', 2)
            ->where('summary.transactions', 1)
            ->where('summary.amount', 1500)
            ->where('summary.discount', 75)
            ->where('summary.wallet', 30)
            ->where('summary.mercyFund', 15)
            ->where('summary.infantFormula', 7)
        );
});

test('the sales report exports every detail column', function () {
    $user = User::factory()->create();
    $team = $user->currentTeam;
    $patient = Patient::factory()->create([
        'team_id' => $team->getKey(),
        'firstName' => 'Export',
        'middleName' => null,
        'lastName' => 'Patient',
    ]);
    $method = Method::factory()->create([
        'team_id' => $team->getKey(),
        'name' => 'Transfer',
    ]);

    Payment::factory()->create([
        'team_id' => $team->getKey(),
        'patient_id' => $patient->slug,
        'user_id' => $user->getKey(),
        'method_id' => $method->getKey(),
        'amount' => 250,
        'discount_amount' => 15,
        'wallet' => 5,
        'mercy_fund' => 3,
        'infant_formula' => 2,
        'created_at' => now(),
    ]);

    $content = $this->actingAs($user)
        ->get(salesReportUrl($user, 'department').'/export')
        ->assertOk()
        ->streamedContent();

    expect($content)
        ->toContain('"Hospital No.","Patient Name","Received By",Department,"Payment Method",Amount,Discount,Wallet,"Mercy Fund","Infant Formula",Date')
        ->toContain('"Export Patient"')
        ->toContain('Transfer')
        ->toContain('Wallet Deposit');
});
