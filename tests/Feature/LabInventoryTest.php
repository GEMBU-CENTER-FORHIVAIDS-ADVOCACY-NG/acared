<?php

use App\Models\DrugForm;
use App\Models\LabInventory;
use App\Models\PriceList;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

function labInventoryTeamUrl(User $user, string $path = ''): string
{
    return '/'.$user->currentTeam->slug.'/lab-inventories'.$path;
}

function teamLabInventory(User $user, array $attributes = []): LabInventory
{
    $teamId = $user->currentTeam->getKey();

    $priceList = PriceList::factory()->create([
        'team_id' => $teamId,
        'is_category' => false,
        'is_inventory' => true,
    ]);

    $drugForm = DrugForm::factory()->create([
        'team_id' => $teamId,
    ]);

    return LabInventory::factory()->create(array_merge([
        'team_id' => $teamId,
        'price_list_id' => $priceList->getKey(),
        'drug_form_id' => $drugForm->getKey(),
        'quantity' => 20,
        'min_qty' => 5,
        'status' => 'available',
    ], $attributes));
}

test('guests are redirected to the login page', function () {
    $user = User::factory()->create();

    $this->get(labInventoryTeamUrl($user))->assertRedirect(route('login'));
});

test('the lab inventory index lists team inventory', function () {
    $user = User::factory()->create();
    $inventory = teamLabInventory($user);
    LabInventory::factory()->create();

    $this->actingAs($user)
        ->get(labInventoryTeamUrl($user))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('laboratories/inventories/index')
            ->has('inventories.data', 1)
            ->where('inventories.data.0.id', $inventory->getKey())
        );
});

test('a lab inventory row can be created', function () {
    $user = User::factory()->create();
    $teamId = $user->currentTeam->getKey();

    $priceList = PriceList::factory()->create([
        'team_id' => $teamId,
        'is_category' => false,
        'is_inventory' => true,
    ]);
    $drugForm = DrugForm::factory()->create(['team_id' => $teamId]);

    $this->actingAs($user)
        ->post(labInventoryTeamUrl($user), [
            'price_list_id' => $priceList->getKey(),
            'drug_form_id' => $drugForm->getKey(),
            'sku' => 'SLG-TEST01',
            'min_qty' => 5,
            'quantity' => 10,
            'price' => 1000,
            'cost' => 400,
            'expires_at' => now()->addYear()->toDateTimeString(),
        ])
        ->assertRedirect(labInventoryTeamUrl($user));

    expect(LabInventory::query()->where('sku', 'SLG-TEST01')->exists())->toBeTrue();
});

test('a lab inventory row can be updated and deleted', function () {
    $user = User::factory()->create();
    $inventory = teamLabInventory($user);

    $this->actingAs($user)
        ->patch(labInventoryTeamUrl($user, '/'.$inventory->getKey()), [
            'price_list_id' => $inventory->price_list_id,
            'drug_form_id' => $inventory->drug_form_id,
            'sku' => $inventory->sku,
            'min_qty' => 2,
            'quantity' => 50,
            'price' => 1200,
            'cost' => 500,
            'expires_at' => now()->addMonths(6)->toDateTimeString(),
        ])
        ->assertRedirect(labInventoryTeamUrl($user));

    expect((float) $inventory->fresh()->quantity)->toBe(50.0);

    $this->actingAs($user)
        ->delete(labInventoryTeamUrl($user, '/'.$inventory->getKey()))
        ->assertRedirect(labInventoryTeamUrl($user));

    expect(LabInventory::query()->whereKey($inventory->getKey())->exists())->toBeFalse();
});
