<?php

namespace App\Policies;

use App\Models\DrugInventory;
use App\Models\User;

class DrugInventoryPolicy
{
    use DelegatesToSpatie;

    public function viewAny(User $user): bool
    {
        return $this->hasPermission($user, 'viewAny druginventory');
    }

    public function view(User $user, DrugInventory $druginventory): bool
    {
        return $this->hasPermission($user, 'view druginventory');
    }

    public function create(User $user): bool
    {
        return $this->hasPermission($user, 'create druginventory');
    }

    public function update(User $user, DrugInventory $druginventory): bool
    {
        return $this->hasPermission($user, 'update druginventory');
    }

    public function delete(User $user, DrugInventory $druginventory): bool
    {
        return $this->hasPermission($user, 'delete druginventory');
    }

    public function deleteAny(User $user): bool
    {
        return $this->hasPermission($user, 'deleteAny druginventory');
    }

    public function restore(User $user, DrugInventory $druginventory): bool
    {
        return $this->hasPermission($user, 'restore druginventory');
    }

    public function restoreAny(User $user): bool
    {
        return $this->hasPermission($user, 'restoreAny druginventory');
    }

    public function forceDelete(User $user, DrugInventory $druginventory): bool
    {
        return $this->hasPermission($user, 'forceDelete druginventory');
    }

    public function forceDeleteAny(User $user): bool
    {
        return $this->hasPermission($user, 'forceDeleteAny druginventory');
    }
}
