<?php

namespace App\Policies;

use App\Models\User;

class UserPolicy
{
    use DelegatesToSpatie;

    public function viewAny(User $user): bool
    {
        return $this->hasPermission($user, 'view users');
    }

    public function view(User $user, User $targetUser): bool
    {
        return $this->hasPermission($user, 'view user');
    }

    public function create(User $user): bool
    {
        return $this->hasPermission($user, 'create user');
    }

    public function update(User $user, User $targetUser): bool
    {
        return $this->hasPermission($user, 'update user');
    }

    public function delete(User $user, User $targetUser): bool
    {
        return $this->hasPermission($user, 'delete user');
    }

    public function deleteAny(User $user): bool
    {
        return $this->hasPermission($user, 'deleteAny user');
    }

    public function restore(User $user, User $targetUser): bool
    {
        return $this->hasPermission($user, 'restore user');
    }

    public function restoreAny(User $user): bool
    {
        return $this->hasPermission($user, 'restoreAny user');
    }

    public function forceDelete(User $user, User $targetUser): bool
    {
        return $this->hasPermission($user, 'forceDelete user');
    }

    public function forceDeleteAny(User $user): bool
    {
        return $this->hasPermission($user, 'forceDeleteAny user');
    }
}
