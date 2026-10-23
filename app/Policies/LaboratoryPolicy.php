<?php

namespace App\Policies;

use App\Models\Laboratory;
use App\Models\User;

class LaboratoryPolicy
{
    use DelegatesToSpatie;

    public function viewAny(User $user): bool
    {
        return $this->hasPermission($user, 'viewAny laboratory');
    }

    public function view(User $user, Laboratory $laboratory): bool
    {
        return $this->hasPermission($user, 'view laboratory');
    }

    public function create(User $user): bool
    {
        return $this->hasPermission($user, 'create laboratory');
    }

    public function update(User $user, Laboratory $laboratory): bool
    {
        return $this->hasPermission($user, 'update laboratory');
    }

    public function delete(User $user, Laboratory $laboratory): bool
    {
        return $this->hasPermission($user, 'delete laboratory');
    }

    public function deleteAny(User $user): bool
    {
        return $this->hasPermission($user, 'deleteAny laboratory');
    }

    public function restore(User $user, Laboratory $laboratory): bool
    {
        return $this->hasPermission($user, 'restore laboratory');
    }

    public function restoreAny(User $user): bool
    {
        return $this->hasPermission($user, 'restoreAny laboratory');
    }

    public function forceDelete(User $user, Laboratory $laboratory): bool
    {
        return $this->hasPermission($user, 'forceDelete laboratory');
    }

    public function forceDeleteAny(User $user): bool
    {
        return $this->hasPermission($user, 'forceDeleteAny laboratory');
    }
}
