<?php

namespace App\Policies;

use App\Models\State;
use App\Models\User;

class StatePolicy
{
    use DelegatesToSpatie;

    public function viewAny(User $user): bool
    {
        return $this->hasPermission($user, 'viewAny state');
    }

    public function view(User $user, State $state): bool
    {
        return $this->hasPermission($user, 'view state');
    }

    public function create(User $user): bool
    {
        return $this->hasPermission($user, 'create state');
    }

    public function update(User $user, State $state): bool
    {
        return $this->hasPermission($user, 'update state');
    }

    public function delete(User $user, State $state): bool
    {
        return $this->hasPermission($user, 'delete state');
    }

    public function deleteAny(User $user): bool
    {
        return $this->hasPermission($user, 'deleteAny state');
    }

    public function restore(User $user, State $state): bool
    {
        return $this->hasPermission($user, 'restore state');
    }

    public function restoreAny(User $user): bool
    {
        return $this->hasPermission($user, 'restoreAny state');
    }

    public function forceDelete(User $user, State $state): bool
    {
        return $this->hasPermission($user, 'forceDelete state');
    }

    public function forceDeleteAny(User $user): bool
    {
        return $this->hasPermission($user, 'forceDeleteAny state');
    }
}
