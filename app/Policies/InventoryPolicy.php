<?php

namespace App\Policies;

use App\Models\Inventory;
use App\Models\User;

class InventoryPolicy
{
    use DelegatesToSpatie;

    public function viewAny(User $user): bool
    {
        return $this->hasPermission($user, 'viewAny inventory');
    }

    public function view(User $user, Inventory $inventory): bool
    {
        return $this->hasPermission($user, 'view inventory');
    }

    public function create(User $user): bool
    {
        return $this->hasPermission($user, 'create inventory');
    }

    public function update(User $user, Inventory $inventory): bool
    {
        return $this->hasPermission($user, 'update inventory');
    }

    public function delete(User $user, Inventory $inventory): bool
    {
        return $this->hasPermission($user, 'delete inventory');
    }

    public function deleteAny(User $user): bool
    {
        return $this->hasPermission($user, 'deleteAny inventory');
    }

    public function restore(User $user, Inventory $inventory): bool
    {
        return $this->hasPermission($user, 'restore inventory');
    }

    public function restoreAny(User $user): bool
    {
        return $this->hasPermission($user, 'restoreAny inventory');
    }

    public function forceDelete(User $user, Inventory $inventory): bool
    {
        return $this->hasPermission($user, 'forceDelete inventory');
    }

    public function forceDeleteAny(User $user): bool
    {
        return $this->hasPermission($user, 'forceDeleteAny inventory');
    }

    public function stockCount(User $user): bool
    {
        return $this->hasPermission($user, 'stock count inventory');
    }
}
