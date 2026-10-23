<?php

namespace App\Policies;

use App\Models\Markup;
use App\Models\User;

class MarkupPolicy
{
    use DelegatesToSpatie;

    public function viewAny(User $user): bool
    {
        return $this->hasPermission($user, 'viewAny markup');
    }

    public function view(User $user, Markup $markup): bool
    {
        return $this->hasPermission($user, 'view markup');
    }

    public function create(User $user): bool
    {
        return $this->hasPermission($user, 'create markup');
    }

    public function update(User $user, Markup $markup): bool
    {
        return $this->hasPermission($user, 'update markup');
    }

    public function delete(User $user, Markup $markup): bool
    {
        return $this->hasPermission($user, 'delete markup');
    }

    public function deleteAny(User $user): bool
    {
        return $this->hasPermission($user, 'deleteAny markup');
    }

    public function restore(User $user, Markup $markup): bool
    {
        return $this->hasPermission($user, 'restore markup');
    }

    public function restoreAny(User $user): bool
    {
        return $this->hasPermission($user, 'restoreAny markup');
    }

    public function forceDelete(User $user, Markup $markup): bool
    {
        return $this->hasPermission($user, 'forceDelete markup');
    }

    public function forceDeleteAny(User $user): bool
    {
        return $this->hasPermission($user, 'forceDeleteAny markup');
    }
}
