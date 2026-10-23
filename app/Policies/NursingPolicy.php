<?php

namespace App\Policies;

use App\Models\Nursing;
use App\Models\User;

class NursingPolicy
{
    use DelegatesToSpatie;

    public function viewAny(User $user): bool
    {
        return $this->hasPermission($user, 'viewAny nursing');
    }

    public function view(User $user, Nursing $nursing): bool
    {
        return $this->hasPermission($user, 'view nursing');
    }

    public function create(User $user): bool
    {
        return $this->hasPermission($user, 'create nursing');
    }

    public function update(User $user, Nursing $nursing): bool
    {
        return $this->hasPermission($user, 'update nursing');
    }

    public function delete(User $user, Nursing $nursing): bool
    {
        return $this->hasPermission($user, 'delete nursing');
    }

    public function deleteAny(User $user): bool
    {
        return $this->hasPermission($user, 'deleteAny nursing');
    }

    public function restore(User $user, Nursing $nursing): bool
    {
        return $this->hasPermission($user, 'restore nursing');
    }

    public function restoreAny(User $user): bool
    {
        return $this->hasPermission($user, 'restoreAny nursing');
    }

    public function forceDelete(User $user, Nursing $nursing): bool
    {
        return $this->hasPermission($user, 'forceDelete nursing');
    }

    public function forceDeleteAny(User $user): bool
    {
        return $this->hasPermission($user, 'forceDeleteAny nursing');
    }
}
