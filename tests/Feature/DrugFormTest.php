<?php

use App\Models\DrugForm;
use App\Models\DrugInventory;
use App\Models\Inventory;
use App\Models\LabInventory;
use App\Models\PriceList;
use App\Models\User;
use Illuminate\Support\Collection;
use Inertia\Testing\AssertableInertia as Assert;

function drugFormTeamUrl(User $user, string $path = ''): string
{
    return '/'.$user->currentTeam->slug.'/pharmacy/drug-forms'.$path;
}

function teamDrugForm(User $user, array $attributes = []): DrugForm
{
    return DrugForm::factory()->create(array_merge([
        'team_id' => $user->currentTeam->getKey(),
        'name' => 'Tablet',
    ], $attributes));
}

function teamPriceList(User $user): PriceList
{
    return PriceList::factory()->create([
        'team_id' => $user->currentTeam->getKey(),
        'is_category' => false,
        'is_inventory' => true,
    ]);
}

test('guests are redirected to the login page', function () {
    $user = User::factory()->create();

    $this->get(drugFormTeamUrl($user))->assertRedirect(route('login'));
});

test('the drug form index lists team drug forms with their inventory counts', function () {
    $user = User::factory()->create();
    $drugForm = teamDrugForm($user);
    $priceList = teamPriceList($user);

    Inventory::factory()->create([
        'team_id' => $user->currentTeam->getKey(),
        'price_list_id' => $priceList->getKey(),
        'drug_form_id' => $drugForm->getKey(),
    ]);

    DrugInventory::factory()->create([
        'team_id' => $user->currentTeam->getKey(),
        'price_list_id' => $priceList->getKey(),
        'drug_form_id' => $drugForm->getKey(),
    ]);

    DrugForm::factory()->create([
        'team_id' => $user->currentTeam->getKey(),
        'name' => 'Capsule',
    ]);

    $this->actingAs($user)
        ->get(drugFormTeamUrl($user))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('pharmacy/drug-forms/index')
            ->has('drugForms.data', 2)
            ->where('drugForms.data', fn (Collection $rows) => $rows
                ->firstWhere('id', $drugForm->getKey())['inventoriesCount'] === 2)
        );
});

test('a drug form linked to pharmacy stock cannot be deleted', function () {
    $user = User::factory()->create();
    $drugForm = teamDrugForm($user);

    DrugInventory::factory()->create([
        'team_id' => $user->currentTeam->getKey(),
        'price_list_id' => teamPriceList($user)->getKey(),
        'drug_form_id' => $drugForm->getKey(),
    ]);

    $this->actingAs($user)
        ->delete(drugFormTeamUrl($user, '/'.$drugForm->getKey()))
        ->assertStatus(409);

    expect(DrugForm::query()->whereKey($drugForm->getKey())->exists())->toBeTrue();
});

test('a drug form linked to lab stock cannot be deleted', function () {
    $user = User::factory()->create();
    $drugForm = teamDrugForm($user);

    LabInventory::factory()->create([
        'team_id' => $user->currentTeam->getKey(),
        'price_list_id' => teamPriceList($user)->getKey(),
        'drug_form_id' => $drugForm->getKey(),
    ]);

    $this->actingAs($user)
        ->delete(drugFormTeamUrl($user, '/'.$drugForm->getKey()))
        ->assertStatus(409);

    expect(DrugForm::query()->whereKey($drugForm->getKey())->exists())->toBeTrue();
});

test('an unused drug form can be deleted', function () {
    $user = User::factory()->create();
    $drugForm = teamDrugForm($user);

    $this->actingAs($user)
        ->delete(drugFormTeamUrl($user, '/'.$drugForm->getKey()))
        ->assertRedirect(drugFormTeamUrl($user));

    expect(DrugForm::query()->whereKey($drugForm->getKey())->exists())->toBeFalse();
});
