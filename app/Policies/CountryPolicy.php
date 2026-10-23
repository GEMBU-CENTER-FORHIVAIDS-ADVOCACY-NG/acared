<?php

namespace App\Policies;

use App\Models\Country;
use App\Models\User;

class CountryPolicy
{
    use DelegatesToSpatie;

    public function viewAny(User $user): bool
    {
        return $this->hasPermission($user, 'viewAny country');
    }

    public function view(User $user, Country $country): bool
    {
        return $this->hasPermission($user, 'view country');
    }

    public function create(User $user): bool
    {
        return $this->hasPermission($user, 'create country');
    }

    public function update(User $user, Country $country): bool
    {
        return $this->hasPermission($user, 'update country');
    }

    public function delete(User $user, Country $country): bool
    {
        return $this->hasPermission($user, 'delete country');
    }

    public function deleteAny(User $user): bool
    {
        return $this->hasPermission($user, 'deleteAny country');
    }

    public function restore(User $user, Country $country): bool
    {
        return $this->hasPermission($user, 'restore country');
    }

    public function restoreAny(User $user): bool
    {
        return $this->hasPermission($user, 'restoreAny country');
    }

    public function forceDelete(User $user, Country $country): bool
    {
        return $this->hasPermission($user, 'forceDelete country');
    }

    public function forceDeleteAny(User $user): bool
    {
        return $this->hasPermission($user, 'forceDeleteAny country');
    }
}
