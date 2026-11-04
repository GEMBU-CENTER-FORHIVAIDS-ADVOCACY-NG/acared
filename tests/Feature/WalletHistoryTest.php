<?php

use App\Models\Method;
use App\Models\Patient;
use App\Models\User;
use App\Models\WalletHistory;
use Inertia\Testing\AssertableInertia as Assert;

test('the wallet history defaults to today when no date filter is provided', function () {
    $user = User::factory()->create();
    $team = $user->currentTeam;
    $method = Method::factory()->create(['team_id' => $team->getKey()]);
    $patient = Patient::factory()->create(['team_id' => $team->getKey()]);

    WalletHistory::create([
        'team_id' => $team->getKey(),
        'patient_id' => $patient->slug,
        'user_id' => $user->id,
        'method_id' => $method->id,
        'credit' => 1000,
        'debit' => 0,
        'created_at' => now()->subDays(20),
    ]);

    WalletHistory::create([
        'team_id' => $team->getKey(),
        'patient_id' => $patient->slug,
        'user_id' => $user->id,
        'method_id' => $method->id,
        'credit' => 500,
        'debit' => 0,
        'created_at' => now(),
    ]);

    $this->actingAs($user)
        ->get('/'.$team->slug.'/finance/wallet-history')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->has('histories.data', 1)
            ->where('filters.from', now()->toDateString())
            ->where('filters.to', now()->toDateString())
        );
});

test('the wallet history filters by date range', function () {
    $user = User::factory()->create();
    $team = $user->currentTeam;
    $method = Method::factory()->create(['team_id' => $team->getKey()]);
    $patient = Patient::factory()->create(['team_id' => $team->getKey()]);

    $oldDate = now()->subDays(10)->toDateString();
    $recentDate = now()->toDateString();

    WalletHistory::create([
        'team_id' => $team->getKey(),
        'patient_id' => $patient->slug,
        'user_id' => $user->id,
        'method_id' => $method->id,
        'credit' => 1000,
        'debit' => 0,
        'created_at' => now()->subDays(10),
    ]);

    WalletHistory::create([
        'team_id' => $team->getKey(),
        'patient_id' => $patient->slug,
        'user_id' => $user->id,
        'method_id' => $method->id,
        'credit' => 500,
        'debit' => 0,
        'created_at' => now(),
    ]);

    $this->actingAs($user)
        ->get('/'.$team->slug.'/finance/wallet-history?from='.$oldDate.'&to='.$oldDate)
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->has('histories.data', 1)
            ->where('histories.data.0.credit', 1000)
        );

    $this->actingAs($user)
        ->get('/'.$team->slug.'/finance/wallet-history?from='.$recentDate.'&to='.$recentDate)
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->has('histories.data', 1)
            ->where('histories.data.0.credit', 500)
        );
});

test('the wallet history filters return date only strings', function () {
    $user = User::factory()->create();
    $team = $user->currentTeam;

    $this->actingAs($user)
        ->get('/'.$team->slug.'/finance/wallet-history')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('filters.from', now()->toDateString())
            ->where('filters.to', now()->toDateString())
        );
});
