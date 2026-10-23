<?php

namespace App\Policies;

use App\Models\Billing;
use App\Models\User;

class BillingPolicy
{
    use DelegatesToSpatie;

    public function viewAny(User $user): bool
    {
        return $this->hasPermission($user, 'viewAny billing');
    }

    public function view(User $user, Billing $billing): bool
    {
        return $this->hasPermission($user, 'view billing');
    }

    public function create(User $user): bool
    {
        return $this->hasPermission($user, 'create billing');
    }

    public function update(User $user, Billing $billing): bool
    {
        return $this->hasPermission($user, 'update billing');
    }

    public function delete(User $user, Billing $billing): bool
    {
        return $this->hasPermission($user, 'delete billing');
    }

    public function deleteAny(User $user): bool
    {
        return $this->hasPermission($user, 'deleteAny billing');
    }

    public function restore(User $user, Billing $billing): bool
    {
        return $this->hasPermission($user, 'restore billing');
    }

    public function restoreAny(User $user): bool
    {
        return $this->hasPermission($user, 'restoreAny billing');
    }

    public function forceDelete(User $user, Billing $billing): bool
    {
        return $this->hasPermission($user, 'forceDelete billing');
    }

    public function forceDeleteAny(User $user): bool
    {
        return $this->hasPermission($user, 'forceDeleteAny billing');
    }
}
