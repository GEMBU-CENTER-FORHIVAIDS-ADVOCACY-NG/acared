<?php

use App\Models\Admission;
use App\Models\Category;
use App\Models\Patient;
use App\Models\User;
use App\Models\Ward;

function nursingRecordsTeamUrl(User $user, string $path = ''): string
{
    return '/'.$user->currentTeam->slug.'/nursing/records'.$path;
}

function nursingRecordsPatient(User $user): Patient
{
    return Patient::factory()->create([
        'team_id' => $user->currentTeam->getKey(),
        'category_id' => Category::factory()->create([
            'team_id' => $user->currentTeam->getKey(),
        ])->getKey(),
    ]);
}

test('the maternity sidebar lists admitted patients for ward rounds', function () {
    $user = User::factory()->create();
    $team = $user->currentTeam;
    $patient = nursingRecordsPatient($user);
    $ward = Ward::factory()->ward()->create(['team_id' => $team->getKey()]);
    $bed = Ward::factory()->bed($ward)->create(['team_id' => $team->getKey()]);

    $admission = Admission::factory()->create([
        'team_id' => $team->getKey(),
        'patient_id' => $patient->slug,
        'doctor_id' => $user->getKey(),
        'ward_id' => $ward->getKey(),
        'bed_id' => $bed->getKey(),
        'status' => 'admitted',
    ]);

    Admission::factory()->create([
        'team_id' => $team->getKey(),
        'patient_id' => nursingRecordsPatient($user)->slug,
        'ward_id' => $ward->getKey(),
        'status' => 'discharged',
    ]);

    $otherUser = User::factory()->create();
    Admission::factory()->create([
        'team_id' => $otherUser->currentTeam->getKey(),
        'patient_id' => nursingRecordsPatient($otherUser)->slug,
        'ward_id' => Ward::factory()->ward()->create(['team_id' => $otherUser->currentTeam->getKey()])->getKey(),
        'status' => 'admitted',
    ]);

    $this->actingAs($user)
        ->get(nursingRecordsTeamUrl($user))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('nursing/records/index')
            ->has('sidebar.admittedPatients', 1)
            ->where('sidebar.admittedPatients.0.id', $admission->getKey())
            ->where('sidebar.admittedPatients.0.name', $patient->fullName)
            ->where('sidebar.admittedPatients.0.wardBed', $ward->name.' · '.$bed->name)
        );
});
