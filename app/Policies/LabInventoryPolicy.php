<?php

namespace App\Policies;

use App\Models\LabInventory;
use App\Models\User;

class LabInventoryPolicy
{
    use DelegatesToSpatie;

    public function viewAny(User $user): bool
    {
        return $this->hasPermission($user, 'viewAny labinventory');
    }

    public function view(User $user, LabInventory $labinventory): bool
    {
        return $this->hasPermission($user, 'view labinventory');
    }

    public function create(User $user): bool
    {
        return $this->hasPermission($user, 'create labinventory');
    }

    public function update(User $user, LabInventory $labinventory): bool
    {
        return $this->hasPermission($user, 'update labinventory');
    }

    public function delete(User $user, LabInventory $labinventory): bool
    {
        return $this->hasPermission($user, 'delete labinventory');
    }

    public function deleteAny(User $user): bool
    {
        return $this->hasPermission($user, 'deleteAny labinventory');
    }

    public function restore(User $user, LabInventory $labinventory): bool
    {
        return $this->hasPermission($user, 'restore labinventory');
    }

    public function restoreAny(User $user): bool
    {
        return $this->hasPermission($user, 'restoreAny labinventory');
    }

    public function forceDelete(User $user, LabInventory $labinventory): bool
    {
        return $this->hasPermission($user, 'forceDelete labinventory');
    }

    public function forceDeleteAny(User $user): bool
    {
        return $this->hasPermission($user, 'forceDeleteAny labinventory');
    }
}
