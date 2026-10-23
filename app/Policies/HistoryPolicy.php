<?php

namespace App\Policies;

use App\Models\History;
use App\Models\User;

class HistoryPolicy
{
    use DelegatesToSpatie;

    public function viewAny(User $user): bool
    {
        return $this->hasPermission($user, 'viewAny history');
    }

    public function view(User $user, History $history): bool
    {
        return $this->hasPermission($user, 'view history');
    }

    public function create(User $user): bool
    {
        return $this->hasPermission($user, 'create history');
    }

    public function update(User $user, History $history): bool
    {
        return $this->hasPermission($user, 'update history');
    }

    public function delete(User $user, History $history): bool
    {
        return $this->hasPermission($user, 'delete history');
    }

    public function deleteAny(User $user): bool
    {
        return $this->hasPermission($user, 'deleteAny history');
    }

    public function restore(User $user, History $history): bool
    {
        return $this->hasPermission($user, 'restore history');
    }

    public function restoreAny(User $user): bool
    {
        return $this->hasPermission($user, 'restoreAny history');
    }

    public function forceDelete(User $user, History $history): bool
    {
        return $this->hasPermission($user, 'forceDelete history');
    }

    public function forceDeleteAny(User $user): bool
    {
        return $this->hasPermission($user, 'forceDeleteAny history');
    }
}
