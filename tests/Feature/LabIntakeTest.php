<?php

use App\Models\PriceList;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

function labIntakeTeamUrl(User $user, string $path = ''): string
{
    return '/'.$user->currentTeam->slug.'/lab-intake'.$path;
}

function laboratoryRoot(User $user): PriceList
{
    return PriceList::factory()->create([
        'team_id' => $user->currentTeam->getKey(),
        'name' => 'Laboratory',
        'is_category' => true,
        'category_id' => null,
        'subcategory_id' => null,
    ]);
}

test('guests are redirected to the login page', function () {
    $user = User::factory()->create();

    $this->get(labIntakeTeamUrl($user))->assertRedirect(route('login'));
});

test('the lab intake index lists laboratory catalog items', function () {
    $user = User::factory()->create();
    $root = laboratoryRoot($user);

    $subcategory = PriceList::factory()->create([
        'team_id' => $user->currentTeam->getKey(),
        'name' => 'Chemistry',
        'category_id' => $root->getKey(),
        'subcategory_id' => null,
        'is_category' => false,
    ]);

    PriceList::factory()->create([
        'team_id' => $user->currentTeam->getKey(),
        'name' => 'Glucose',
        'category_id' => $root->getKey(),
        'subcategory_id' => $subcategory->getKey(),
        'is_category' => false,
        'price' => 800,
    ]);

    PriceList::factory()->create([
        'name' => 'Dental Cleaning',
        'is_category' => false,
    ]);

    $this->actingAs($user)
        ->get(labIntakeTeamUrl($user))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('laboratories/intake/index')
            ->where('items.data', fn ($data) => collect($data)->contains(
                fn ($item) => $item['name'] === 'Glucose',
            ))
        );
});

test('a laboratory catalog item can be created', function () {
    $user = User::factory()->create();
    $root = laboratoryRoot($user);

    $subcategory = PriceList::factory()->create([
        'team_id' => $user->currentTeam->getKey(),
        'name' => 'Serology',
        'category_id' => $root->getKey(),
        'subcategory_id' => null,
        'is_category' => false,
    ]);

    $this->actingAs($user)
        ->post(labIntakeTeamUrl($user), [
            'name' => 'HIV Screening',
            'is_category' => false,
            'is_inventory' => false,
            'price' => 2500,
            'result_type' => 'radio',
            'category_id' => $root->getKey(),
            'subcategory_id' => $subcategory->getKey(),
            'parameters' => [],
        ])
        ->assertRedirect(labIntakeTeamUrl($user));

    expect(PriceList::query()->where('name', 'HIV Screening')->exists())->toBeTrue();
});

test('a laboratory catalog item can be updated and deleted', function () {
    $user = User::factory()->create();
    $root = laboratoryRoot($user);

    $subcategory = PriceList::factory()->create([
        'team_id' => $user->currentTeam->getKey(),
        'name' => 'Urinalysis',
        'category_id' => $root->getKey(),
        'subcategory_id' => null,
        'is_category' => false,
    ]);

    $item = PriceList::factory()->create([
        'team_id' => $user->currentTeam->getKey(),
        'name' => 'Urine R/E',
        'category_id' => $root->getKey(),
        'subcategory_id' => $subcategory->getKey(),
        'is_category' => false,
        'is_inventory' => false,
        'price' => 500,
        'result_type' => 'text',
    ]);

    $this->actingAs($user)
        ->patch(labIntakeTeamUrl($user, '/'.$item->getKey()), [
            'name' => 'Urine Routine',
            'is_category' => false,
            'is_inventory' => false,
            'price' => 700,
            'result_type' => 'text',
            'category_id' => $root->getKey(),
            'subcategory_id' => $subcategory->getKey(),
            'parameters' => [],
        ])
        ->assertRedirect(labIntakeTeamUrl($user));

    expect($item->fresh()->name)->toBe('Urine Routine')
        ->and((float) $item->fresh()->price)->toBe(700.0);

    $this->actingAs($user)
        ->delete(labIntakeTeamUrl($user, '/'.$item->getKey()))
        ->assertRedirect(labIntakeTeamUrl($user));

    expect(PriceList::query()->whereKey($item->getKey())->exists())->toBeFalse();
});
