<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Vendor;

class VendorPolicy
{
    use DelegatesToSpatie;

    public function viewAny(User $user): bool
    {
        return $this->hasPermission($user, 'viewAny vendor');
    }

    public function view(User $user, Vendor $vendor): bool
    {
        return $this->hasPermission($user, 'view vendor');
    }

    public function create(User $user): bool
    {
        return $this->hasPermission($user, 'create vendor');
    }

    public function update(User $user, Vendor $vendor): bool
    {
        return $this->hasPermission($user, 'update vendor');
    }

    public function delete(User $user, Vendor $vendor): bool
    {
        return $this->hasPermission($user, 'delete vendor');
    }

    public function deleteAny(User $user): bool
    {
        return $this->hasPermission($user, 'deleteAny vendor');
    }

    public function restore(User $user, Vendor $vendor): bool
    {
        return $this->hasPermission($user, 'restore vendor');
    }

    public function restoreAny(User $user): bool
    {
        return $this->hasPermission($user, 'restoreAny vendor');
    }

    public function forceDelete(User $user, Vendor $vendor): bool
    {
        return $this->hasPermission($user, 'forceDelete vendor');
    }

    public function forceDeleteAny(User $user): bool
    {
        return $this->hasPermission($user, 'forceDeleteAny vendor');
    }
}
