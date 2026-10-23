<?php

namespace App\Policies;

use App\Models\Method;
use App\Models\User;

class MethodPolicy
{
    use DelegatesToSpatie;

    public function viewAny(User $user): bool
    {
        return $this->hasPermission($user, 'viewAny method');
    }

    public function view(User $user, Method $method): bool
    {
        return $this->hasPermission($user, 'view method');
    }

    public function create(User $user): bool
    {
        return $this->hasPermission($user, 'create method');
    }

    public function update(User $user, Method $method): bool
    {
        return $this->hasPermission($user, 'update method');
    }

    public function delete(User $user, Method $method): bool
    {
        return $this->hasPermission($user, 'delete method');
    }

    public function deleteAny(User $user): bool
    {
        return $this->hasPermission($user, 'deleteAny method');
    }

    public function restore(User $user, Method $method): bool
    {
        return $this->hasPermission($user, 'restore method');
    }

    public function restoreAny(User $user): bool
    {
        return $this->hasPermission($user, 'restoreAny method');
    }

    public function forceDelete(User $user, Method $method): bool
    {
        return $this->hasPermission($user, 'forceDelete method');
    }

    public function forceDeleteAny(User $user): bool
    {
        return $this->hasPermission($user, 'forceDeleteAny method');
    }
}
