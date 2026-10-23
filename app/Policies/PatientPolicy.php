<?php

namespace App\Policies;

use App\Models\Patient;
use App\Models\User;

class PatientPolicy
{
    use DelegatesToSpatie;

    public function viewAny(User $user): bool
    {
        return $this->hasPermission($user, 'viewAny patient');
    }

    public function view(User $user, Patient $patient): bool
    {
        return $this->hasPermission($user, 'view patient');
    }

    public function create(User $user): bool
    {
        return $this->hasPermission($user, 'create patient');
    }

    public function update(User $user, Patient $patient): bool
    {
        return $this->hasPermission($user, 'update patient');
    }

    public function delete(User $user, Patient $patient): bool
    {
        return $this->hasPermission($user, 'delete patient');
    }

    public function deleteAny(User $user): bool
    {
        return $this->hasPermission($user, 'deleteAny patient');
    }

    public function restore(User $user, Patient $patient): bool
    {
        return $this->hasPermission($user, 'restore patient');
    }

    public function restoreAny(User $user): bool
    {
        return $this->hasPermission($user, 'restoreAny patient');
    }

    public function forceDelete(User $user, Patient $patient): bool
    {
        return $this->hasPermission($user, 'forceDelete patient');
    }

    public function forceDeleteAny(User $user): bool
    {
        return $this->hasPermission($user, 'forceDeleteAny patient');
    }
}
