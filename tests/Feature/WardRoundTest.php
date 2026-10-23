<?php

use App\Models\Admission;
use App\Models\Category;
use App\Models\Complaint;
use App\Models\Patient;
use App\Models\User;
use App\Models\Ward;

function wardRoundUrl(User $user, string $path = ''): string
{
    return '/'.$user->currentTeam->slug.'/nursing/ward-rounds'.$path;
}

function wardRoundAdmission(User $user): Admission
{
    $patient = Patient::factory()->create([
        'team_id' => $user->currentTeam->getKey(),
        'category_id' => Category::factory()->create([
            'team_id' => $user->currentTeam->getKey(),
        ])->getKey(),
    ]);

    return Admission::factory()->create([
        'team_id' => $user->currentTeam->getKey(),
        'patient_id' => $patient->slug,
        'doctor_id' => $user->getKey(),
        'ward_id' => Ward::factory()->ward()->create([
            'team_id' => $user->currentTeam->getKey(),
        ])->getKey(),
        'status' => 'admitted',
    ]);
}

test('a ward round view shows the admission and clinical records', function () {
    $user = User::factory()->create();
    $admission = wardRoundAdmission($user);

    $this->actingAs($user)
        ->get(wardRoundUrl($user, '/admissions/'.$admission->getKey().'/complaints'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('nursing/ward-rounds/view')
            ->where('section', 'complaints')
            ->where('admission.id', $admission->getKey())
            ->where('admission.patientId', $admission->patient_id)
            ->where('detail.wardName', $admission->ward->name)
            ->has('records.complaints')
            ->has('options')
        );
});

test('clinical records can be managed during a ward round', function () {
    $user = User::factory()->create();
    $admission = wardRoundAdmission($user);

    $this->actingAs($user)
        ->post(wardRoundUrl($user, '/admissions/'.$admission->getKey().'/records/complaints'), [
            'notes_en' => 'Abdominal pain',
            'notes_ha' => null,
            'notes_ff' => null,
        ])
        ->assertRedirect(route('nursing.ward-rounds.view', [
            'current_team' => $user->currentTeam->slug,
            'admission' => $admission->getKey(),
            'section' => 'complaints',
        ]));

    $complaint = Complaint::query()->where('patient_id', $admission->patient_id)->first();

    expect($complaint)->not->toBeNull()
        ->and($complaint->notes_en)->toBe('Abdominal pain')
        ->and((int) $complaint->doctor_id)->toBe($user->getKey());

    $this->actingAs($user)
        ->patch(wardRoundUrl($user, '/admissions/'.$admission->getKey().'/records/complaints/'.$complaint->getKey()), [
            'notes_en' => 'Abdominal pain settled',
        ])
        ->assertRedirect();

    expect($complaint->fresh()->notes_en)->toBe('Abdominal pain settled');

    $this->actingAs($user)
        ->delete(wardRoundUrl($user, '/admissions/'.$admission->getKey().'/records/complaints/'.$complaint->getKey()))
        ->assertRedirect();

    expect(Complaint::query()->whereKey($complaint->getKey())->exists())->toBeFalse();
});
