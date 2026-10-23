<?php

namespace App\Policies;

use App\Models\Examination;
use App\Models\User;

class ExaminationPolicy
{
    use DelegatesToSpatie;

    public function viewAny(User $user): bool
    {
        return $this->hasPermission($user, 'viewAny examination');
    }

    public function view(User $user, Examination $examination): bool
    {
        return $this->hasPermission($user, 'view examination');
    }

    public function create(User $user): bool
    {
        return $this->hasPermission($user, 'create examination');
    }

    public function update(User $user, Examination $examination): bool
    {
        return $this->hasPermission($user, 'update examination');
    }

    public function delete(User $user, Examination $examination): bool
    {
        return $this->hasPermission($user, 'delete examination');
    }

    public function deleteAny(User $user): bool
    {
        return $this->hasPermission($user, 'deleteAny examination');
    }

    public function restore(User $user, Examination $examination): bool
    {
        return $this->hasPermission($user, 'restore examination');
    }

    public function restoreAny(User $user): bool
    {
        return $this->hasPermission($user, 'restoreAny examination');
    }

    public function forceDelete(User $user, Examination $examination): bool
    {
        return $this->hasPermission($user, 'forceDelete examination');
    }

    public function forceDeleteAny(User $user): bool
    {
        return $this->hasPermission($user, 'forceDeleteAny examination');
    }
}
