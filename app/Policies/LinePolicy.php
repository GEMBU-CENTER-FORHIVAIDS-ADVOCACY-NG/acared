<?php

namespace App\Policies;

use App\Models\Line;
use App\Models\User;

class LinePolicy
{
    use DelegatesToSpatie;

    public function viewAny(User $user): bool
    {
        return $this->hasPermission($user, 'viewAny line');
    }

    public function view(User $user, Line $line): bool
    {
        return $this->hasPermission($user, 'view line');
    }

    public function create(User $user): bool
    {
        return $this->hasPermission($user, 'create line');
    }

    public function update(User $user, Line $line): bool
    {
        return $this->hasPermission($user, 'update line');
    }

    public function delete(User $user, Line $line): bool
    {
        return $this->hasPermission($user, 'delete line');
    }

    public function deleteAny(User $user): bool
    {
        return $this->hasPermission($user, 'deleteAny line');
    }

    public function restore(User $user, Line $line): bool
    {
        return $this->hasPermission($user, 'restore line');
    }

    public function restoreAny(User $user): bool
    {
        return $this->hasPermission($user, 'restoreAny line');
    }

    public function forceDelete(User $user, Line $line): bool
    {
        return $this->hasPermission($user, 'forceDelete line');
    }

    public function forceDeleteAny(User $user): bool
    {
        return $this->hasPermission($user, 'forceDeleteAny line');
    }
}
