<?php

use App\Models\Category;
use App\Models\User;

beforeEach(function () {
    $this->user = User::factory()->create();
    $this->token = $this->user->createToken('test')->plainTextToken;
    $this->withToken($this->token);
});

function apiTeamCategory(User $user, array $attributes = []): Category
{
    return Category::factory()->create(array_merge([
        'team_id' => $user->currentTeam->getKey(),
    ], $attributes));
}

test('the category index returns a pagination envelope', function () {
    apiTeamCategory($this->user, ['name' => 'Antenatal']);
    apiTeamCategory($this->user, ['name' => 'Pediatric']);

    $this->getJson('/api/categories')
        ->assertOk()
        ->assertJsonStructure([
            'data' => [['id', 'name', 'discount_percentage']],
            'links' => ['first', 'last', 'prev', 'next'],
            'meta' => ['current_page', 'from', 'last_page', 'per_page', 'to', 'total'],
        ])
        ->assertJsonCount(2, 'data');
});

test('the category index only lists the records of the current team', function () {
    apiTeamCategory($this->user, ['name' => 'Antenatal']);
    Category::factory()->create(['name' => 'Foreign']);

    $this->getJson('/api/categories')
        ->assertOk()
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.name', 'Antenatal');
});

test('the category index searches, filters and sorts the records', function () {
    apiTeamCategory($this->user, ['name' => 'Antenatal', 'discount_percentage' => 5]);
    apiTeamCategory($this->user, ['name' => 'Pediatric', 'discount_percentage' => 10]);

    $this->getJson('/api/categories?q=Pedi')
        ->assertOk()
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.name', 'Pediatric');

    $this->getJson('/api/categories?filter[discount_percentage]=10')
        ->assertOk()
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.name', 'Pediatric');

    $this->getJson('/api/categories?sort=name&direction=asc')
        ->assertOk()
        ->assertJsonPath('data.0.name', 'Antenatal');
});

test('a category can be fetched', function () {
    $category = apiTeamCategory($this->user, ['name' => 'Antenatal']);

    $this->getJson('/api/categories/'.$category->getKey())
        ->assertOk()
        ->assertJsonPath('data.id', $category->getKey())
        ->assertJsonPath('data.name', 'Antenatal');
});

test('a category of another team cannot be fetched', function () {
    $category = Category::factory()->create();

    $this->getJson('/api/categories/'.$category->getKey())->assertNotFound();
});

test('a category can be created', function () {
    $this->postJson('/api/categories', [
        'name' => 'Surgical',
        'discount_percentage' => 10,
        'description' => 'Surgical patients',
    ])
        ->assertOk()
        ->assertJsonPath('message', 'Successfully Create Resource')
        ->assertJsonPath('data.name', 'Surgical')
        ->assertJsonPath('data.team_id', $this->user->currentTeam->getKey());

    $this->assertDatabaseHas('categories', [
        'name' => 'Surgical',
        'team_id' => $this->user->currentTeam->getKey(),
    ]);
});

test('creating a category validates the payload', function () {
    $this->postJson('/api/categories', [])
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['name', 'discount_percentage']);
});

test('a category can be updated', function () {
    $category = apiTeamCategory($this->user, ['name' => 'Antenatal']);

    $this->putJson('/api/categories/'.$category->getKey(), [
        'name' => 'Antenatal Care',
        'discount_percentage' => 5,
        'description' => 'Updated',
    ])
        ->assertOk()
        ->assertJsonPath('message', 'Successfully Update Resource')
        ->assertJsonPath('data.name', 'Antenatal Care');

    expect($category->fresh()->name)->toBe('Antenatal Care');
});

test('a category of another team cannot be updated', function () {
    $category = Category::factory()->create();

    $this->putJson('/api/categories/'.$category->getKey(), [
        'name' => 'Hijack',
        'discount_percentage' => 0,
    ])->assertNotFound();

    expect($category->fresh()->name)->not->toBe('Hijack');
});

test('a category can be deleted', function () {
    $category = apiTeamCategory($this->user);

    $this->deleteJson('/api/categories/'.$category->getKey())
        ->assertOk()
        ->assertJsonPath('message', 'Successfully Delete Resource');

    $this->assertDatabaseMissing('categories', ['id' => $category->getKey()]);
});

test('a category of another team cannot be deleted', function () {
    $category = Category::factory()->create();

    $this->deleteJson('/api/categories/'.$category->getKey())->assertNotFound();

    $this->assertDatabaseHas('categories', ['id' => $category->getKey()]);
});
