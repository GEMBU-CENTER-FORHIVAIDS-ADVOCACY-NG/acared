<?php

use App\Models\Inventory;
use App\Models\Markup;
use App\Models\PurchaseOrder;
use App\Models\User;
use App\Models\Vendor;

function purchaseOrderTeamUrl(User $user): string
{
    return '/'.$user->currentTeam->slug.'/purchase-orders';
}

function purchaseOrderPayload(User $user, array $overrides = []): array
{
    $teamId = $user->currentTeam->getKey();
    $inventory = Inventory::factory()->create(['team_id' => $teamId]);
    $markup = Markup::factory()->create(['team_id' => $teamId]);

    return array_merge([
        'slug' => 'PUR-TEST-00001',
        'vendor_id' => Vendor::factory()->create(['team_id' => $teamId])->getKey(),
        'discount' => 50,
        'status' => 'pending',
        'user_id' => User::factory()->create()->getKey(),
        'subPrice' => 999999,
        'subCost' => 999999,
        'total' => 999999,
        'items' => [
            [
                'inventory_id' => $inventory->getKey(),
                'markup_id' => $markup->getKey(),
                'quantity' => 2,
                'unitPrice' => 1000,
                'unitCost' => 400,
                'totalPrice' => 999999,
                'totalCost' => 999999,
            ],
        ],
    ], $overrides);
}

test('storing a purchase order recomputes totals and uses the authenticated user', function () {
    $user = User::factory()->create();
    $payload = purchaseOrderPayload($user);
    $expectedMarkupId = $payload['items'][0]['markup_id'];

    $this->actingAs($user)
        ->post(purchaseOrderTeamUrl($user), $payload)
        ->assertRedirect();

    $order = PurchaseOrder::query()->where('slug', 'PUR-TEST-00001')->firstOrFail();

    expect($order->user_id)->toBe($user->getKey())
        ->and((float) $order->subPrice)->toBe(2000.0)
        ->and((float) $order->subCost)->toBe(800.0)
        ->and((float) $order->total)->toBe(750.0);

    $item = $order->items()->firstOrFail();

    expect($item->markup_id)->toBe($expectedMarkupId)
        ->and((float) $item->totalPrice)->toBe(2000.0)
        ->and((float) $item->totalCost)->toBe(800.0);
});

test('updating a purchase order recomputes totals and uses the authenticated user', function () {
    $user = User::factory()->create();
    $order = PurchaseOrder::create([
        'team_id' => $user->currentTeam->getKey(),
        'slug' => 'PUR-EXISTING-00001',
        'vendor_id' => Vendor::factory()->create(['team_id' => $user->currentTeam->getKey()])->getKey(),
        'user_id' => User::factory()->create()->getKey(),
        'subPrice' => 1,
        'subCost' => 1,
        'discount' => 0,
        'total' => 1,
        'status' => 'pending',
    ]);
    $payload = purchaseOrderPayload($user, [
        'slug' => $order->slug,
        'vendor_id' => $order->vendor_id,
    ]);

    $this->actingAs($user)
        ->patch(purchaseOrderTeamUrl($user).'/'.$order->getKey(), $payload)
        ->assertRedirect();

    $order->refresh();

    expect($order->user_id)->toBe($user->getKey())
        ->and((float) $order->subPrice)->toBe(2000.0)
        ->and((float) $order->subCost)->toBe(800.0)
        ->and((float) $order->total)->toBe(750.0);

    $item = $order->items()->firstOrFail();

    expect((float) $item->totalPrice)->toBe(2000.0)
        ->and((float) $item->totalCost)->toBe(800.0);
});
