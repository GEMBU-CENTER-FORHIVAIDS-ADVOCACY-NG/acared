<?php

use App\Models\Category;
use App\Models\Patient;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

function categoryTeamUrl(User $user, string $path = ''): string
{
    return '/'.$user->currentTeam->slug.'/categories'.$path;
}

function teamCategory(User $user, array $attributes = []): Category
{
    return Category::factory()->create(array_merge([
        'team_id' => $user->currentTeam->getKey(),
    ], $attributes));
}

test('guests are redirected to the login page', function () {
    $user = User::factory()->create();

    $this->get(categoryTeamUrl($user))->assertRedirect(route('login'));
});

test('the categories index lists the current team categories with patient counts', function () {
    $user = User::factory()->create();
    $category = teamCategory($user, ['name' => 'Antenatal']);
    Category::factory()->create(['name' => 'Foreign']);

    Patient::factory()->create([
        'team_id' => $user->currentTeam->getKey(),
        'category_id' => $category->getKey(),
    ]);

    $this->actingAs($user)
        ->get(categoryTeamUrl($user))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('categories/index')
            ->has('categories.data', 1)
            ->where('categories.data.0.name', 'Antenatal')
            ->where('categories.data.0.patientsCount', 1),
        );
});

test('the categories index filters by search query', function () {
    $user = User::factory()->create();
    teamCategory($user, ['name' => 'Antenatal']);
    teamCategory($user, ['name' => 'Pediatric']);

    $this->actingAs($user)
        ->get(categoryTeamUrl($user).'?q=Pediatric')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->has('categories.data', 1)
            ->where('categories.data.0.name', 'Pediatric'),
        );
});

test('a category can be created', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->post(categoryTeamUrl($user), [
            'name' => 'Surgical',
            'discount_percentage' => 10,
            'description' => 'Surgical patients',
        ])
        ->assertRedirect(categoryTeamUrl($user));

    $category = Category::withoutGlobalScope('team')->where('name', 'Surgical')->first();

    expect($category)->not->toBeNull()
        ->and($category->team_id)->toBe($user->currentTeam->getKey())
        ->and((int) $category->discount_percentage)->toBe(10);
});

test('category creation requires valid attributes', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->post(categoryTeamUrl($user), [])
        ->assertSessionHasErrors(['name', 'discount_percentage']);
});

test('category creation rejects a duplicate name within the same team', function () {
    $user = User::factory()->create();
    teamCategory($user, ['name' => 'Antenatal']);

    $this->actingAs($user)
        ->post(categoryTeamUrl($user), [
            'name' => 'Antenatal',
            'discount_percentage' => 0,
        ])
        ->assertSessionHasErrors('name');
});

test('category creation allows the same name across teams', function () {
    $user = User::factory()->create();
    Category::factory()->create(['name' => 'Antenatal']);

    $this->actingAs($user)
        ->post(categoryTeamUrl($user), [
            'name' => 'Antenatal',
            'discount_percentage' => 0,
        ])
        ->assertRedirect(categoryTeamUrl($user));
});

test('the discount percentage must be between 0 and 100', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->post(categoryTeamUrl($user), [
            'name' => 'Surgical',
            'discount_percentage' => 101,
        ])
        ->assertSessionHasErrors('discount_percentage');
});

test('a category can be updated', function () {
    $user = User::factory()->create();
    $category = teamCategory($user, ['name' => 'Antenatal']);

    $this->actingAs($user)
        ->patch(categoryTeamUrl($user, '/'.$category->getKey()), [
            'name' => 'Antenatal Care',
            'discount_percentage' => 5,
            'description' => 'Updated',
        ])
        ->assertRedirect(categoryTeamUrl($user));

    expect($category->fresh()->name)->toBe('Antenatal Care')
        ->and((int) $category->fresh()->discount_percentage)->toBe(5);
});

test('a category from another team cannot be updated', function () {
    $user = User::factory()->create();
    $category = Category::factory()->create();

    $this->actingAs($user)
        ->patch(categoryTeamUrl($user, '/'.$category->getKey()), [
            'name' => 'Hijack',
            'discount_percentage' => 0,
        ])
        ->assertNotFound();
});

test('a category can be deleted', function () {
    $user = User::factory()->create();
    $category = teamCategory($user);

    $this->actingAs($user)
        ->delete(categoryTeamUrl($user, '/'.$category->getKey()))
        ->assertRedirect(categoryTeamUrl($user));

    $this->assertDatabaseMissing('categories', ['id' => $category->getKey()]);
});

test('a category from another team cannot be deleted', function () {
    $user = User::factory()->create();
    $category = Category::factory()->create();

    $this->actingAs($user)
        ->delete(categoryTeamUrl($user, '/'.$category->getKey()))
        ->assertNotFound();

    $this->assertDatabaseHas('categories', ['id' => $category->getKey()]);
});
