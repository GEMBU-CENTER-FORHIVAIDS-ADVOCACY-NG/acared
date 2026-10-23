<?php

namespace App\Policies;

use App\Models\Complaint;
use App\Models\User;

class ComplaintPolicy
{
    use DelegatesToSpatie;

    public function viewAny(User $user): bool
    {
        return $this->hasPermission($user, 'viewAny complaint');
    }

    public function view(User $user, Complaint $complaint): bool
    {
        return $this->hasPermission($user, 'view complaint');
    }

    public function create(User $user): bool
    {
        return $this->hasPermission($user, 'create complaint');
    }

    public function update(User $user, Complaint $complaint): bool
    {
        return $this->hasPermission($user, 'update complaint');
    }

    public function delete(User $user, Complaint $complaint): bool
    {
        return $this->hasPermission($user, 'delete complaint');
    }

    public function deleteAny(User $user): bool
    {
        return $this->hasPermission($user, 'deleteAny complaint');
    }

    public function restore(User $user, Complaint $complaint): bool
    {
        return $this->hasPermission($user, 'restore complaint');
    }

    public function restoreAny(User $user): bool
    {
        return $this->hasPermission($user, 'restoreAny complaint');
    }

    public function forceDelete(User $user, Complaint $complaint): bool
    {
        return $this->hasPermission($user, 'forceDelete complaint');
    }

    public function forceDeleteAny(User $user): bool
    {
        return $this->hasPermission($user, 'forceDeleteAny complaint');
    }
}
