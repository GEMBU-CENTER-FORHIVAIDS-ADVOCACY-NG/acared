<?php

namespace App\Policies;

use App\Models\User;
use Spatie\Permission\Models\Role;

class RolePolicy
{
    use DelegatesToSpatie;

    public function viewAny(User $user): bool
    {
        return $this->hasPermission($user, 'view roles');
    }

    public function view(User $user, Role $role): bool
    {
        return $this->hasPermission($user, 'view role');
    }

    public function create(User $user): bool
    {
        return $this->hasPermission($user, 'create role');
    }

    public function update(User $user, Role $role): bool
    {
        return $this->hasPermission($user, 'update role');
    }

    public function delete(User $user, Role $role): bool
    {
        return $this->hasPermission($user, 'delete role');
    }

    public function deleteAny(User $user): bool
    {
        return $this->hasPermission($user, 'deleteAny role');
    }

    public function restore(User $user, Role $role): bool
    {
        return $this->hasPermission($user, 'restore role');
    }

    public function restoreAny(User $user): bool
    {
        return $this->hasPermission($user, 'restoreAny role');
    }

    public function forceDelete(User $user, Role $role): bool
    {
        return $this->hasPermission($user, 'forceDelete role');
    }

    public function forceDeleteAny(User $user): bool
    {
        return $this->hasPermission($user, 'forceDeleteAny role');
    }
}
