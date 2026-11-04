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

test('a pending patient can be admitted to the requested ward', function () {
    $user = User::factory()->create();
    $team = $user->currentTeam;
    $ward = Ward::factory()->ward()->create(['team_id' => $team->getKey()]);
    $bed = Ward::factory()->bed($ward)->create(['team_id' => $team->getKey(), 'status' => 'available']);

    $patient = Patient::factory()->create([
        'team_id' => $team->getKey(),
        'category_id' => Category::factory()->create(['team_id' => $team->getKey()])->getKey(),
    ]);

    $admission = Admission::factory()->create([
        'team_id' => $team->getKey(),
        'patient_id' => $patient->slug,
        'ward_id' => $ward->getKey(),
        'status' => 'pending',
    ]);

    $this->actingAs($user)
        ->post(wardRoundUrl($user, '/'.$ward->getKey().'/admit'), [
            'admission_id' => $admission->getKey(),
            'ward_id' => $ward->getKey(),
            'bed_id' => $bed->getKey(),
            'notes' => 'Admitted to ward',
        ])
        ->assertRedirect(wardRoundUrl($user, '/'.$ward->getKey()));

    $admission->refresh();
    expect($admission->status)->toBe('admitted')
        ->and((int) $admission->ward_id)->toBe($ward->getKey())
        ->and((int) $admission->bed_id)->toBe($bed->getKey());

    $bed->refresh();
    expect($bed->status)->toBe('occupied');
});

test('a pending patient can be admitted to a different ward than requested', function () {
    $user = User::factory()->create();
    $team = $user->currentTeam;

    // Create two wards with beds
    $requestedWard = Ward::factory()->ward()->create(['team_id' => $team->getKey(), 'name' => 'General Ward']);
    Ward::factory()->bed($requestedWard)->create(['team_id' => $team->getKey(), 'status' => 'available']);

    $targetWard = Ward::factory()->ward()->create(['team_id' => $team->getKey(), 'name' => 'ICU']);
    $targetBed = Ward::factory()->bed($targetWard)->create(['team_id' => $team->getKey(), 'status' => 'available']);

    $patient = Patient::factory()->create([
        'team_id' => $team->getKey(),
        'category_id' => Category::factory()->create(['team_id' => $team->getKey()])->getKey(),
    ]);

    // Patient requested General Ward, but will be admitted to ICU
    $admission = Admission::factory()->create([
        'team_id' => $team->getKey(),
        'patient_id' => $patient->slug,
        'ward_id' => $requestedWard->getKey(),
        'status' => 'pending',
    ]);

    $this->actingAs($user)
        ->post(wardRoundUrl($user, '/'.$requestedWard->getKey().'/admit'), [
            'admission_id' => $admission->getKey(),
            'ward_id' => $targetWard->getKey(),
            'bed_id' => $targetBed->getKey(),
            'notes' => 'Transferred to ICU',
        ])
        ->assertRedirect(wardRoundUrl($user, '/'.$targetWard->getKey()));

    $admission->refresh();
    expect($admission->status)->toBe('admitted')
        ->and((int) $admission->ward_id)->toBe($targetWard->getKey())
        ->and((int) $admission->bed_id)->toBe($targetBed->getKey())
        ->and($admission->notes)->toBe('Transferred to ICU');

    $targetBed->refresh();
    expect($targetBed->status)->toBe('occupied');
});

test('admitting to an occupied bed is rejected', function () {
    $user = User::factory()->create();
    $team = $user->currentTeam;
    $ward = Ward::factory()->ward()->create(['team_id' => $team->getKey()]);
    $bed = Ward::factory()->bed($ward)->create(['team_id' => $team->getKey(), 'status' => 'occupied']);

    $patient = Patient::factory()->create([
        'team_id' => $team->getKey(),
        'category_id' => Category::factory()->create(['team_id' => $team->getKey()])->getKey(),
    ]);

    $admission = Admission::factory()->create([
        'team_id' => $team->getKey(),
        'patient_id' => $patient->slug,
        'ward_id' => $ward->getKey(),
        'status' => 'pending',
    ]);

    $this->actingAs($user)
        ->post(wardRoundUrl($user, '/'.$ward->getKey().'/admit'), [
            'admission_id' => $admission->getKey(),
            'ward_id' => $ward->getKey(),
            'bed_id' => $bed->getKey(),
            'notes' => '',
        ])
        ->assertStatus(422);
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
