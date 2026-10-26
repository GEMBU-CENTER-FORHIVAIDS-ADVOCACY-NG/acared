<?php

use App\Enums\TeamRole;
use App\Models\Team;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Inertia\Testing\AssertableInertia as Assert;

test('the teams index page can be rendered', function () {
    $user = User::factory()->create();

    $response = $this
        ->actingAs($user)
        ->get(route('teams.index'));

    $response->assertOk();
});

test('teams can be created', function () {
    $user = User::factory()->create();

    $response = $this
        ->actingAs($user)
        ->post(route('teams.store'), [
            'name' => 'Test Team',
        ]);

    $response->assertRedirect();

    $this->assertDatabaseHas('teams', [
        'name' => 'Test Team',
        'is_personal' => false,
    ]);
});

test('team slug uses next available suffix', function () {
    $user = User::factory()->create();

    Team::factory()->create(['name' => 'Acme', 'slug' => 'acme']);
    Team::factory()->create(['name' => 'Acme One', 'slug' => 'acme-1']);
    Team::factory()->create(['name' => 'Acme Ten', 'slug' => 'acme-10']);

    $this
        ->actingAs($user)
        ->post(route('teams.store'), [
            'name' => 'Acme',
        ]);

    $this->assertDatabaseHas('teams', [
        'name' => 'Acme',
        'slug' => 'acme-11',
    ]);
});

test('the team edit page can be rendered', function () {
    $user = User::factory()->create();
    $team = Team::factory()->create();

    $team->members()->attach($user, ['role' => TeamRole::Owner->value]);

    $response = $this
        ->actingAs($user)
        ->get(route('teams.edit', $team));

    $response
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('teams/edit')
            ->where('members.0.role', TeamRole::Owner->value)
            ->where('members.0.role_label', TeamRole::Owner->label()),
        );
});

test('teams can be updated by owners', function () {
    $user = User::factory()->create();
    $team = Team::factory()->create(['name' => 'Original Name']);

    $team->members()->attach($user, ['role' => TeamRole::Owner->value]);

    $response = $this
        ->actingAs($user)
        ->patch(route('teams.update', $team), [
            'name' => 'Updated Name',
        ]);

    $response->assertRedirect(route('teams.edit', $team->fresh()));

    $this->assertDatabaseHas('teams', [
        'id' => $team->id,
        'name' => 'Updated Name',
    ]);
});

test('teams cannot be updated by members', function () {
    $owner = User::factory()->create();
    $member = User::factory()->create();
    $team = Team::factory()->create();

    $team->members()->attach($owner, ['role' => TeamRole::Owner->value]);
    $team->members()->attach($member, ['role' => TeamRole::Member->value]);

    $response = $this
        ->actingAs($member)
        ->patch(route('teams.update', $team), [
            'name' => 'Updated Name',
        ]);

    $response->assertForbidden();
});

test('teams can be deleted by owners', function () {
    $user = User::factory()->create();
    $team = Team::factory()->create();

    $team->members()->attach($user, ['role' => TeamRole::Owner->value]);

    $response = $this
        ->actingAs($user)
        ->delete(route('teams.destroy', $team), [
            'name' => $team->name,
        ]);

    $response->assertRedirect();

    $this->assertSoftDeleted('teams', [
        'id' => $team->id,
    ]);
});

test('team deletion requires name confirmation', function () {
    $user = User::factory()->create();
    $team = Team::factory()->create();

    $team->members()->attach($user, ['role' => TeamRole::Owner->value]);

    $response = $this
        ->actingAs($user)
        ->delete(route('teams.destroy', $team), [
            'name' => 'Wrong Name',
        ]);

    $response->assertSessionHasErrors('name');

    $this->assertDatabaseHas('teams', [
        'id' => $team->id,
        'deleted_at' => null,
    ]);
});

test('deleting current team switches to alphabetically first remaining team', function () {
    $user = User::factory()->create(['name' => 'Mike']);

    $zuluTeam = Team::factory()->create(['name' => 'Zulu Team']);
    $zuluTeam->members()->attach($user, ['role' => TeamRole::Owner->value]);

    $alphaTeam = Team::factory()->create(['name' => 'Alpha Team']);
    $alphaTeam->members()->attach($user, ['role' => TeamRole::Owner->value]);

    $betaTeam = Team::factory()->create(['name' => 'Beta Team']);
    $betaTeam->members()->attach($user, ['role' => TeamRole::Owner->value]);

    $user->update(['current_team_id' => $zuluTeam->id]);

    $response = $this
        ->actingAs($user)
        ->delete(route('teams.destroy', $zuluTeam), [
            'name' => $zuluTeam->name,
        ]);

    $response->assertRedirect();

    $this->assertSoftDeleted('teams', [
        'id' => $zuluTeam->id,
    ]);

    expect($user->fresh()->current_team_id)->toEqual($alphaTeam->id);
});

test('deleting current team falls back to personal team when alphabetically first', function () {
    $user = User::factory()->create();
    $personalTeam = $user->personalTeam();
    $team = Team::factory()->create(['name' => 'Zulu Team']);
    $team->members()->attach($user, ['role' => TeamRole::Owner->value]);

    $user->update(['current_team_id' => $team->id]);

    $response = $this
        ->actingAs($user)
        ->delete(route('teams.destroy', $team), [
            'name' => $team->name,
        ]);

    $response->assertRedirect();

    $this->assertSoftDeleted('teams', [
        'id' => $team->id,
    ]);

    expect($user->fresh()->current_team_id)->toEqual($personalTeam->id);
});

test('deleting non current team leaves current team unchanged', function () {
    $user = User::factory()->create();
    $personalTeam = $user->personalTeam();
    $team = Team::factory()->create();
    $team->members()->attach($user, ['role' => TeamRole::Owner->value]);

    $user->update(['current_team_id' => $personalTeam->id]);

    $response = $this
        ->actingAs($user)
        ->delete(route('teams.destroy', $team), [
            'name' => $team->name,
        ]);

    $response->assertRedirect();

    $this->assertSoftDeleted('teams', [
        'id' => $team->id,
    ]);

    expect($user->fresh()->current_team_id)->toEqual($personalTeam->id);
});

test('members can leave non personal teams', function () {
    $owner = User::factory()->create();
    $member = User::factory()->create();
    $team = Team::factory()->create();

    $team->members()->attach($owner, ['role' => TeamRole::Owner->value]);
    $team->members()->attach($member, ['role' => TeamRole::Member->value]);

    $response = $this
        ->actingAs($member)
        ->delete(route('teams.leave', $team));

    $response->assertRedirect(route('teams.index'));
    $response->assertInertiaFlash('toast', ['type' => 'success', 'message' => "You left the team \"{$team->name}\""]);

    expect($member->fresh()->belongsToTeam($team))->toBeFalse();
});

test('leaving current team switches to alphabetically first remaining team', function () {
    $owner = User::factory()->create();
    $member = User::factory()->create(['name' => 'Mike']);

    $zuluTeam = Team::factory()->create(['name' => 'Zulu Team']);
    $zuluTeam->members()->attach($owner, ['role' => TeamRole::Owner->value]);
    $zuluTeam->members()->attach($member, ['role' => TeamRole::Member->value]);

    $alphaTeam = Team::factory()->create(['name' => 'Alpha Team']);
    $alphaTeam->members()->attach($member, ['role' => TeamRole::Member->value]);

    $betaTeam = Team::factory()->create(['name' => 'Beta Team']);
    $betaTeam->members()->attach($member, ['role' => TeamRole::Member->value]);

    $member->update(['current_team_id' => $zuluTeam->id]);

    $response = $this
        ->actingAs($member)
        ->delete(route('teams.leave', $zuluTeam));

    $response->assertRedirect(route('teams.index'));

    expect($member->fresh()->belongsToTeam($zuluTeam))->toBeFalse();
    expect($member->fresh()->current_team_id)->toEqual($alphaTeam->id);
});

test('personal teams cannot be left', function () {
    $user = User::factory()->create();
    $personalTeam = $user->personalTeam();

    $response = $this
        ->actingAs($user)
        ->delete(route('teams.leave', $personalTeam));

    $response->assertForbidden();

    expect($user->fresh()->belongsToTeam($personalTeam))->toBeTrue();
});

test('team owners cannot leave their team', function () {
    $owner = User::factory()->create();
    $team = Team::factory()->create();

    $team->members()->attach($owner, ['role' => TeamRole::Owner->value]);

    $response = $this
        ->actingAs($owner)
        ->delete(route('teams.leave', $team));

    $response->assertForbidden();

    expect($owner->fresh()->belongsToTeam($team))->toBeTrue();
});

test('users cannot leave teams they dont belong to', function () {
    $user = User::factory()->create();
    $team = Team::factory()->create();

    $response = $this
        ->actingAs($user)
        ->delete(route('teams.leave', $team));

    $response->assertRedirect(route('forbidden'));
});

test('deleting team switches other affected users to their personal team', function () {
    $owner = User::factory()->create();
    $member = User::factory()->create();

    $team = Team::factory()->create();
    $team->members()->attach($owner, ['role' => TeamRole::Owner->value]);
    $team->members()->attach($member, ['role' => TeamRole::Member->value]);

    $owner->update(['current_team_id' => $team->id]);
    $member->update(['current_team_id' => $team->id]);

    $response = $this
        ->actingAs($owner)
        ->delete(route('teams.destroy', $team), [
            'name' => $team->name,
        ]);

    $response->assertRedirect();

    expect($member->fresh()->current_team_id)->toEqual($member->personalTeam()->id);
});

test('personal teams cannot be deleted', function () {
    $user = User::factory()->create();

    $personalTeam = $user->personalTeam();

    $response = $this
        ->actingAs($user)
        ->delete(route('teams.destroy', $personalTeam), [
            'name' => $personalTeam->name,
        ]);

    $response->assertForbidden();

    $this->assertDatabaseHas('teams', [
        'id' => $personalTeam->id,
        'deleted_at' => null,
    ]);
});

test('teams cannot be deleted by non owners', function () {
    $owner = User::factory()->create();
    $member = User::factory()->create();
    $team = Team::factory()->create();

    $team->members()->attach($owner, ['role' => TeamRole::Owner->value]);
    $team->members()->attach($member, ['role' => TeamRole::Member->value]);

    $response = $this
        ->actingAs($member)
        ->delete(route('teams.destroy', $team), [
            'name' => $team->name,
        ]);

    $response->assertForbidden();
});

test('users can switch teams', function () {
    $user = User::factory()->create();
    $team = Team::factory()->create();

    $team->members()->attach($user, ['role' => TeamRole::Member->value]);

    $response = $this
        ->actingAs($user)
        ->post(route('teams.switch', $team));

    $response->assertRedirect();

    expect($user->fresh()->current_team_id)->toEqual($team->id);
});

test('users cannot switch to team they dont belong to', function () {
    $user = User::factory()->create();
    $team = Team::factory()->create();

    $response = $this
        ->actingAs($user)
        ->post(route('teams.switch', $team));

    $response->assertRedirect(route('forbidden'));
});

test('guests cannot access teams', function () {
    $response = $this->get(route('teams.index'));

    $response->assertRedirect(route('login'));
});

test('teams can be created with profile attributes and logo', function () {
    Storage::fake('public');
    $user = User::factory()->create();

    $response = $this
        ->actingAs($user)
        ->post(route('teams.store'), [
            'name' => 'Metro Hospital',
            'phone' => '1234567890',
            'mobile' => '0987654321',
            'email' => 'metro@hospital.test',
            'address' => '123 Health Ave',
            'logo' => UploadedFile::fake()->image('logo.png'),
        ]);

    $response->assertRedirect();

    $team = Team::where('email', 'metro@hospital.test')->first();
    expect($team)->not->toBeNull()
        ->and($team->name)->toBe('Metro Hospital')
        ->and($team->phone)->toBe('1234567890')
        ->and($team->mobile)->toBe('0987654321')
        ->and($team->address)->toBe('123 Health Ave')
        ->and($team->logo)->not->toBeNull();

    Storage::disk('public')->assertExists($team->logo);
});

test('teams can be updated with profile attributes and replaces existing logo', function () {
    Storage::fake('public');
    $user = User::factory()->create();
    $team = Team::factory()->create([
        'name' => 'Old Hospital',
        'logo' => 'teams/old-logo.png',
    ]);
    Storage::disk('public')->put('teams/old-logo.png', 'fake-image');
    $team->members()->attach($user, ['role' => TeamRole::Owner->value]);

    $response = $this
        ->actingAs($user)
        ->patch(route('teams.update', $team), [
            'name' => 'New Hospital',
            'phone' => '1112223333',
            'mobile' => '4445556666',
            'email' => 'new@hospital.test',
            'address' => '456 New St',
            'logo' => UploadedFile::fake()->image('new-logo.png'),
        ]);

    $response->assertRedirect();
    Storage::disk('public')->assertMissing('teams/old-logo.png');

    $team->refresh();
    expect($team->name)->toBe('New Hospital')
        ->and($team->phone)->toBe('1112223333')
        ->and($team->email)->toBe('new@hospital.test')
        ->and($team->address)->toBe('456 New St');
    Storage::disk('public')->assertExists($team->logo);
});

test('teams can be bulk deleted by owner', function () {
    $user = User::factory()->create();
    $team1 = Team::factory()->create(['is_personal' => false]);
    $team2 = Team::factory()->create(['is_personal' => false]);
    $team1->members()->attach($user, ['role' => TeamRole::Owner->value]);
    $team2->members()->attach($user, ['role' => TeamRole::Owner->value]);

    $response = $this
        ->actingAs($user)
        ->delete(route('teams.bulk.destroy'), [
            'ids' => [$team1->id, $team2->id],
        ]);

    $response->assertRedirect();

    $this->assertSoftDeleted('teams', ['id' => $team1->id]);
    $this->assertSoftDeleted('teams', ['id' => $team2->id]);
});

test('teams index can be filtered by query', function () {
    $user = User::factory()->create();
    $alpha = Team::factory()->create(['name' => 'Alpha Clinic']);
    $beta = Team::factory()->create(['name' => 'Beta Health']);
    $alpha->members()->attach($user, ['role' => TeamRole::Member->value]);
    $beta->members()->attach($user, ['role' => TeamRole::Member->value]);

    $response = $this
        ->actingAs($user)
        ->get(route('teams.index', ['q' => 'Alpha']));

    $response->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('teams/index')
            ->has('teamList.data', 1)
            ->where('teamList.data.0.name', 'Alpha Clinic')
        );
});
