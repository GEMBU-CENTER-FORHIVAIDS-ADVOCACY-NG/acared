<?php

use App\Models\Complaint;
use App\Models\Diagnose;
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
            ->has('groups.0.reports', 11)
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
            ->component('reports/finance')
            ->has('stats')
            ->has('revenue.datasets', 5));
});

test('the clinical reports catalog renders all clinical reports', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->get('/'.$user->currentTeam->slug.'/reports/clinical')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('reports/clinical/index')
            ->has('dashboard')
            ->where('reports.complaints', 'Complaints report'));
});

test('the clinical dashboard recent records have the correct structure', function () {
    $user = User::factory()->create();

    Complaint::factory()->create([
        'team_id' => $user->currentTeam->id,
        'doctor_id' => $user->id,
    ]);
    Diagnose::factory()->create([
        'team_id' => $user->currentTeam->id,
        'doctor_id' => $user->id,
    ]);

    $this->actingAs($user)
        ->get('/'.$user->currentTeam->slug.'/reports/clinical')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('reports/clinical/index')
            ->has('dashboard.recentRecords', 2)
            ->has('dashboard.recentRecords.0.id')
            ->has('dashboard.recentRecords.0.patientId')
            ->has('dashboard.recentRecords.0.patientName')
            ->has('dashboard.recentRecords.0.doctor')
            ->has('dashboard.recentRecords.0.notes')
            ->has('dashboard.recentRecords.0.createdAt')
            ->has('dashboard.recentRecords.0.type')
            ->where('dashboard.recentRecords.0.type', fn ($type) => in_array($type, ['Complaint', 'Diagnosis'])));
});
