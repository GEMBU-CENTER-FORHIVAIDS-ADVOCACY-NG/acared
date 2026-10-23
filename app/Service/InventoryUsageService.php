<?php

namespace App\Service;

use App\Models\Inventory;
use App\Models\Patient;
use App\Models\Stock;
use Illuminate\Database\Eloquent\Model;

class InventoryUsageService
{
    /**
     * @param  Model  $inventoryItem  The specific inventory record (LabInventory or DrugInventory)
     * @param  int  $quantity  Amount to decrement (default 1)
     * @param  string  $stockStatus  Stock status label (default 'Used')
     */
    public function use(Model $inventoryItem, int $quantity = 1, string $stockStatus = 'Used', ?int $patientId = null): void
    {
        // Decrement quantity
        $inventoryItem->decrement('quantity', $quantity);
        $inventoryItem->refresh();

        // Update low/available status
        $inventoryItem->update([
            'status' => $inventoryItem->quantity <= $inventoryItem->min_qty ? 'low' : 'available',
        ]);

        // Resolve the parent Inventory record via price_list_id
        $inventory = Inventory::where('price_list_id', $inventoryItem->price_list_id)->first();

        if (! $inventory) {
            throw new \RuntimeException(
                "No inventory record found for price list #{$inventoryItem->price_list_id}"
            );
        }

        $sharedData = [
            'team_id' => auth()->user()?->currentTeam?->id,
            'user_id' => auth()->id(),
            'inventory_id' => $inventory->id,
            'stockable_id' => $inventoryItem->id,
            'receivable_id' => $patientId,
            'receivable_type' => $patientId ? Patient::class : null,
            'status' => $stockStatus,
        ];

        // Outgoing stock (deduction from inventory)
        Stock::create(array_merge($sharedData, [
            'stockable_type' => get_class($inventoryItem),
            'quantity' => -$quantity,
        ]));

        // Incoming stock (issued to patient)
        Stock::create(array_merge($sharedData, [
            'stockable_type' => Patient::class,
            'quantity' => $quantity,
        ]));
    }
}
