<?php

namespace App\Policies;

use App\Models\Currency;
use App\Models\User;

class CurrencyPolicy
{
    use DelegatesToSpatie;

    public function viewAny(User $user): bool
    {
        return $this->hasPermission($user, 'viewAny currency');
    }

    public function view(User $user, Currency $currency): bool
    {
        return $this->hasPermission($user, 'view currency');
    }

    public function create(User $user): bool
    {
        return $this->hasPermission($user, 'create currency');
    }

    public function update(User $user, Currency $currency): bool
    {
        return $this->hasPermission($user, 'update currency');
    }

    public function delete(User $user, Currency $currency): bool
    {
        return $this->hasPermission($user, 'delete currency');
    }

    public function deleteAny(User $user): bool
    {
        return $this->hasPermission($user, 'deleteAny currency');
    }

    public function restore(User $user, Currency $currency): bool
    {
        return $this->hasPermission($user, 'restore currency');
    }

    public function restoreAny(User $user): bool
    {
        return $this->hasPermission($user, 'restoreAny currency');
    }

    public function forceDelete(User $user, Currency $currency): bool
    {
        return $this->hasPermission($user, 'forceDelete currency');
    }

    public function forceDeleteAny(User $user): bool
    {
        return $this->hasPermission($user, 'forceDeleteAny currency');
    }
}
