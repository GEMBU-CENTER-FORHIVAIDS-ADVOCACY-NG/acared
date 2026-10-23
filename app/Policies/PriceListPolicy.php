<?php

namespace App\Policies;

use App\Models\PriceList;
use App\Models\User;

class PriceListPolicy
{
    use DelegatesToSpatie;

    public function viewAny(User $user): bool
    {
        return $this->hasPermission($user, 'viewAny pricelist');
    }

    public function view(User $user, PriceList $pricelist): bool
    {
        return $this->hasPermission($user, 'view pricelist');
    }

    public function create(User $user): bool
    {
        return $this->hasPermission($user, 'create pricelist');
    }

    public function update(User $user, PriceList $pricelist): bool
    {
        return $this->hasPermission($user, 'update pricelist');
    }

    public function delete(User $user, PriceList $pricelist): bool
    {
        return $this->hasPermission($user, 'delete pricelist');
    }

    public function deleteAny(User $user): bool
    {
        return $this->hasPermission($user, 'deleteAny pricelist');
    }

    public function restore(User $user, PriceList $pricelist): bool
    {
        return $this->hasPermission($user, 'restore pricelist');
    }

    public function restoreAny(User $user): bool
    {
        return $this->hasPermission($user, 'restoreAny pricelist');
    }

    public function forceDelete(User $user, PriceList $pricelist): bool
    {
        return $this->hasPermission($user, 'forceDelete pricelist');
    }

    public function forceDeleteAny(User $user): bool
    {
        return $this->hasPermission($user, 'forceDeleteAny pricelist');
    }
}
