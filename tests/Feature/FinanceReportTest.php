<?php

use App\Models\Method;
use App\Models\Patient;
use App\Models\Payment;
use App\Models\User;

function financeTeamUrl(User $user, array $query = []): string
{
    $url = '/'.$user->currentTeam->slug.'/reports/finance';

    if ($query !== []) {
        $url .= '?'.http_build_query($query);
    }

    return $url;
}

function financeMethod(User $user, string $name): Method
{
    return Method::factory()->create([
        'team_id' => $user->currentTeam->getKey(),
        'name' => $name,
    ]);
}

function financePayment(User $user, Method $method, array $overrides = []): Payment
{
    $patientSlug = Patient::factory()->create([
        'team_id' => $user->currentTeam->getKey(),
    ])->slug;

    return Payment::factory()->create(array_merge([
        'team_id' => $user->currentTeam->getKey(),
        'patient_id' => $patientSlug,
        'user_id' => $user->getKey(),
        'method_id' => $method->getKey(),
        'amount' => 1000,
    ], $overrides));
}

test('guests are redirected to the login page', function () {
    $user = User::factory()->create();

    $this->get(financeTeamUrl($user))->assertRedirect(route('login'));
});

test('the finance summary renders with stats', function () {
    $user = User::factory()->create();
    $cash = financeMethod($user, 'Cash');
    financePayment($user, $cash, ['amount' => 2500]);

    $this->actingAs($user)
        ->get(financeTeamUrl($user))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('reports/finance')
            ->has('stats')
            ->has('revenue.datasets', 5)
            ->has('paymentByMethod.labels', 1)
            ->where('paymentByMethod.labels.0', 'Cash')
            ->where('paymentByMethod.data.0', 2500));
});

test('the finance summary only counts payments within the selected period', function () {
    $user = User::factory()->create();
    $cash = financeMethod($user, 'Cash');
    financePayment($user, $cash, ['amount' => 1000, 'created_at' => now()]);
    financePayment($user, $cash, ['amount' => 9000, 'created_at' => now()->subYear()]);

    $this->actingAs($user)
        ->get(financeTeamUrl($user, ['period' => 'month']))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('stats.payments_in_period', 1000)
            ->where('paymentByMethod.data.0', 1000));
});

test('an invalid period falls back to the current month', function () {
    $user = User::factory()->create();
    $cash = financeMethod($user, 'Cash');
    financePayment($user, $cash, ['amount' => 1500]);

    $this->actingAs($user)
        ->get(financeTeamUrl($user, ['period' => 'nonsense']))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('filters.period', 'month')
            ->where('stats.payments_in_period', 1500));
});
