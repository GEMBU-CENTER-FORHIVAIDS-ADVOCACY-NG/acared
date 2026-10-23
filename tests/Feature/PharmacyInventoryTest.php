<?php

use App\Models\DrugForm;
use App\Models\DrugInventory;
use App\Models\PriceList;
use App\Models\User;

function pharmacyTeamUrl(User $user, string $path = ''): string
{
    return '/'.$user->currentTeam->slug.'/pharmacy/inventories'.$path;
}

function teamDrugInventory(User $user, array $attributes = []): DrugInventory
{
    $teamId = $user->currentTeam->getKey();

    $priceList = PriceList::factory()->create([
        'team_id' => $teamId,
        'name' => 'Paracetamol 500mg',
        'is_category' => false,
        'is_inventory' => true,
    ]);

    $drugForm = DrugForm::factory()->create([
        'team_id' => $teamId,
        'name' => 'Tablet',
    ]);

    return DrugInventory::factory()->create(array_merge([
        'team_id' => $teamId,
        'sku' => 'DRG-TEST01',
        'price_list_id' => $priceList->getKey(),
        'drug_form_id' => $drugForm->getKey(),
        'quantity' => 20,
        'min_qty' => 5,
        'status' => 'available',
    ], $attributes));
}

test('guests are redirected to the login page', function () {
    $user = User::factory()->create();

    $this->get(pharmacyTeamUrl($user, '/export'))->assertRedirect(route('login'));
});

test('the medication stock of the current team can be exported as csv', function () {
    $user = User::factory()->create();
    teamDrugInventory($user);
    DrugInventory::factory()->create();

    $response = $this->actingAs($user)->get(pharmacyTeamUrl($user, '/export'));

    $response->assertOk();
    $response->assertDownload('pharmacy-inventory-export.csv');

    $content = $response->streamedContent();

    expect($content)->toContain('Team')
        ->and($content)->toContain('SKU')
        ->and($content)->toContain('DRG-TEST01')
        ->and($content)->toContain('Paracetamol 500mg')
        ->and($content)->toContain('Tablet')
        ->and($content)->toContain($user->currentTeam->name);

    expect(substr_count(trim($content), "\n"))->toBe(1);
});
