<?php

namespace App\Policies;

use App\Models\Prescription;
use App\Models\User;

class PrescriptionPolicy
{
    use DelegatesToSpatie;

    public function viewAny(User $user): bool
    {
        return $this->hasPermission($user, 'viewAny prescription');
    }

    public function view(User $user, Prescription $prescription): bool
    {
        return $this->hasPermission($user, 'view prescription');
    }

    public function create(User $user): bool
    {
        return $this->hasPermission($user, 'create prescription');
    }

    public function update(User $user, Prescription $prescription): bool
    {
        return $this->hasPermission($user, 'update prescription');
    }

    public function delete(User $user, Prescription $prescription): bool
    {
        return $this->hasPermission($user, 'delete prescription');
    }

    public function deleteAny(User $user): bool
    {
        return $this->hasPermission($user, 'deleteAny prescription');
    }

    public function restore(User $user, Prescription $prescription): bool
    {
        return $this->hasPermission($user, 'restore prescription');
    }

    public function restoreAny(User $user): bool
    {
        return $this->hasPermission($user, 'restoreAny prescription');
    }

    public function forceDelete(User $user, Prescription $prescription): bool
    {
        return $this->hasPermission($user, 'forceDelete prescription');
    }

    public function forceDeleteAny(User $user): bool
    {
        return $this->hasPermission($user, 'forceDeleteAny prescription');
    }
}
