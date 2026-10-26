<?php

namespace App\Policies;

use App\Models\User;
use Spatie\Permission\Models\Permission;

class PermissionPolicy
{
    use DelegatesToSpatie;

    public function viewAny(User $user): bool
    {
        return $this->hasPermission($user, 'view permissions');
    }

    public function view(User $user, Permission $permission): bool
    {
        return $this->hasPermission($user, 'view permission');
    }

    public function create(User $user): bool
    {
        return $this->hasPermission($user, 'create permission');
    }

    public function update(User $user, Permission $permission): bool
    {
        return $this->hasPermission($user, 'update permission');
    }

    public function delete(User $user, Permission $permission): bool
    {
        return $this->hasPermission($user, 'delete permission');
    }

    public function deleteAny(User $user): bool
    {
        return $this->hasPermission($user, 'deleteAny permission');
    }

    public function restore(User $user, Permission $permission): bool
    {
        return $this->hasPermission($user, 'restore permission');
    }

    public function restoreAny(User $user): bool
    {
        return $this->hasPermission($user, 'restoreAny permission');
    }

    public function forceDelete(User $user, Permission $permission): bool
    {
        return $this->hasPermission($user, 'forceDelete permission');
    }

    public function forceDeleteAny(User $user): bool
    {
        return $this->hasPermission($user, 'forceDeleteAny permission');
    }
}
