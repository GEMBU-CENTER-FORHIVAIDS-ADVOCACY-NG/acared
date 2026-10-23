<?php

namespace App\Policies;

use App\Models\Facility;
use App\Models\User;

class FacilityPolicy
{
    use DelegatesToSpatie;

    public function viewAny(User $user): bool
    {
        return $this->hasPermission($user, 'viewAny facility');
    }

    public function view(User $user, Facility $facility): bool
    {
        return $this->hasPermission($user, 'view facility');
    }

    public function create(User $user): bool
    {
        return $this->hasPermission($user, 'create facility');
    }

    public function update(User $user, Facility $facility): bool
    {
        return $this->hasPermission($user, 'update facility');
    }

    public function delete(User $user, Facility $facility): bool
    {
        return $this->hasPermission($user, 'delete facility');
    }

    public function deleteAny(User $user): bool
    {
        return $this->hasPermission($user, 'deleteAny facility');
    }

    public function restore(User $user, Facility $facility): bool
    {
        return $this->hasPermission($user, 'restore facility');
    }

    public function restoreAny(User $user): bool
    {
        return $this->hasPermission($user, 'restoreAny facility');
    }

    public function forceDelete(User $user, Facility $facility): bool
    {
        return $this->hasPermission($user, 'forceDelete facility');
    }

    public function forceDeleteAny(User $user): bool
    {
        return $this->hasPermission($user, 'forceDeleteAny facility');
    }
}
