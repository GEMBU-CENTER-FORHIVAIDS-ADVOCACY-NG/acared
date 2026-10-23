<?php

use App\Models\User;

test('guests are redirected to the login page', function () {
    $user = User::factory()->create();

    $this->get('/'.$user->currentTeam->slug.'/reports')->assertRedirect(route('login'));
});

test('the reports catalog lists the financial and clinical reports', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->get('/'.$user->currentTeam->slug.'/reports')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('reports/catalog')
            ->has('groups', 2)
            ->has('groups.0.reports', 8)
            ->has('groups.1.reports', 3)
            ->where('groups.0.key', 'financial')
            ->where('groups.1.key', 'clinical')
            ->where('groups.0.reports.0.key', 'finance')
            ->where('groups.1.reports.0.key', 'clinical:complaints'));
});

test('the financial reports catalog renders all financial reports', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->get('/'.$user->currentTeam->slug.'/reports/financial')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('reports/financial/catalog')
            ->has('reports', 8)
            ->where('reports.0.key', 'finance'));
});

test('the clinical reports catalog renders all clinical reports', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->get('/'.$user->currentTeam->slug.'/reports/clinical')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('reports/clinical/catalog')
            ->has('reports', 3)
            ->where('reports.complaints', 'Complaints report'));
});
