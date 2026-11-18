<?php

namespace App\Policies;

use App\Models\Patient;
use App\Models\User;

class PatientPolicy
{
    use DelegatesToSpatie;

    public function viewAny(User $user): bool
    {
        return $this->hasPermission($user, 'view finance');
    }

    public function view(User $user, Patient $patient): bool
    {
        return $this->hasPermission($user, 'view finance');
    }

    public function create(User $user): bool
    {
        return $this->hasPermission($user, 'view finance');
    }

    public function update(User $user, Patient $patient): bool
    {
        return $this->hasPermission($user, 'view finance');
    }

    public function delete(User $user, Patient $patient): bool
    {
        return $this->hasPermission($user, 'view finance');
    }

    public function deleteAny(User $user): bool
    {
        return $this->hasPermission($user, 'view finance');
    }

    public function restore(User $user, Patient $patient): bool
    {
        return $this->hasPermission($user, 'view finance');
    }

    public function restoreAny(User $user): bool
    {
        return $this->hasPermission($user, 'view finance');
    }

    public function forceDelete(User $user, Patient $patient): bool
    {
        return $this->hasPermission($user, 'view finance');
    }

    public function forceDeleteAny(User $user): bool
    {
        return $this->hasPermission($user, 'view finance');
    }
}
