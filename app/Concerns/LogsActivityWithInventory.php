<?php

namespace App\Concerns;

use App\Models\DrugInventory;
use App\Models\Inventory;
use App\Models\LabInventory;
use App\Models\PriceList;
use App\Models\PurchaseOrder;
use App\Models\Vendor;

/**
 * Appends inventory item name and SKU to activity log descriptions.
 *
 * Use this trait for inventory-related models (Stock, OrderItem, PurchaseOrder,
 * Inventory, DrugInventory, LabInventory, Vendor) where transactions do not
 * involve a patient but rather stock items.
 */
trait LogsActivityWithInventory
{
    /**
     * Get the inventory item (Inventory, DrugInventory, or LabInventory) related to this record.
     */
    protected function getActivityInventory(): Inventory|DrugInventory|LabInventory|null
    {
        // Direct inventory relationship (OrderItem, Stock)
        if (method_exists($this, 'inventory')) {
            $inventory = $this->inventory;
            if ($inventory instanceof Inventory || $inventory instanceof DrugInventory || $inventory instanceof LabInventory) {
                return $inventory;
            }
        }

        // This model IS an inventory item (Inventory, DrugInventory, LabInventory)
        if ($this instanceof Inventory || $this instanceof DrugInventory || $this instanceof LabInventory) {
            return $this;
        }

        return null;
    }

    /**
     * Get the PriceList for the inventory item.
     */
    protected function getActivityPriceList(): ?PriceList
    {
        $inventory = $this->getActivityInventory();

        if ($inventory && method_exists($inventory, 'priceList')) {
            return $inventory->priceList;
        }

        return null;
    }

    /**
     * Build a description prefix with inventory item info.
     */
    protected function inventoryDescriptionPrefix(): string
    {
        $priceList = $this->getActivityPriceList();
        $inventory = $this->getActivityInventory();

        if ($priceList) {
            $parts = [];

            if ($priceList->name) {
                $parts[] = "Item: {$priceList->name}";
            }

            if ($inventory && $inventory->sku) {
                $parts[] = "SKU: {$inventory->sku}";
            }

            if (! empty($parts)) {
                return '('.implode(', ', $parts).') ';
            }
        }

        // For models without a price list (e.g., Vendor, PurchaseOrder)
        if ($this instanceof Vendor) {
            return '';
        }

        if ($this instanceof PurchaseOrder) {
            $parts = [];
            if ($this->vendor?->name) {
                $parts[] = "Vendor: {$this->vendor->name}";
            }
            if ($this->slug) {
                $parts[] = "OrderNo: {$this->slug}";
            }
            if (! empty($parts)) {
                return '('.implode(', ', $parts).') ';
            }
        }

        return '';
    }
}
