<?php

namespace App\Policies;

use App\Models\Stock;
use App\Models\User;

class StockPolicy
{
    use DelegatesToSpatie;

    public function viewAny(User $user): bool
    {
        return $this->hasPermission($user, 'viewAny stock');
    }

    public function view(User $user, Stock $stock): bool
    {
        return $this->hasPermission($user, 'view stock');
    }

    public function create(User $user): bool
    {
        return $this->hasPermission($user, 'create stock');
    }

    public function update(User $user, Stock $stock): bool
    {
        return $this->hasPermission($user, 'update stock');
    }

    public function delete(User $user, Stock $stock): bool
    {
        return $this->hasPermission($user, 'delete stock');
    }

    public function deleteAny(User $user): bool
    {
        return $this->hasPermission($user, 'deleteAny stock');
    }

    public function restore(User $user, Stock $stock): bool
    {
        return $this->hasPermission($user, 'restore stock');
    }

    public function restoreAny(User $user): bool
    {
        return $this->hasPermission($user, 'restoreAny stock');
    }

    public function forceDelete(User $user, Stock $stock): bool
    {
        return $this->hasPermission($user, 'forceDelete stock');
    }

    public function forceDeleteAny(User $user): bool
    {
        return $this->hasPermission($user, 'forceDeleteAny stock');
    }
}
