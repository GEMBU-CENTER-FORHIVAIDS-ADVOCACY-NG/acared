<?php

use App\Models\Patient;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

test('the wallet report filters by updated date and excludes zero balances', function () {
    $user = User::factory()->create();
    $team = $user->currentTeam;

    $recent = Patient::factory()->create([
        'team_id' => $team->getKey(),
        'firstName' => 'Recent',
        'middleName' => null,
        'lastName' => 'Patient',
        'wallet' => 50,
        'created_at' => now()->subYear(),
        'updated_at' => now(),
    ]);

    Patient::factory()->create([
        'team_id' => $team->getKey(),
        'firstName' => 'Old',
        'middleName' => null,
        'lastName' => 'Patient',
        'wallet' => 100,
        'created_at' => now(),
        'updated_at' => now()->subYear(),
    ]);

    Patient::factory()->create([
        'team_id' => $team->getKey(),
        'firstName' => 'Empty',
        'middleName' => null,
        'lastName' => 'Patient',
        'wallet' => 0,
        'updated_at' => now(),
    ]);

    $this->actingAs($user)
        ->get('/'.$team->slug.'/reports/wallet')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('reports/wallet')
            ->has('patients.data', 1)
            ->where('patients.data.0.patientId', $recent->slug)
            ->where('summary.patients', 1)
            ->where('summary.walletBalance', 50)
            ->where('summary.walletTotal', 50)
        );
});
