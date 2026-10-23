<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Ward;

class WardPolicy
{
    use DelegatesToSpatie;

    public function viewAny(User $user): bool
    {
        return $this->hasPermission($user, 'viewAny ward');
    }

    public function view(User $user, Ward $ward): bool
    {
        return $this->hasPermission($user, 'view ward');
    }

    public function create(User $user): bool
    {
        return $this->hasPermission($user, 'create ward');
    }

    public function update(User $user, Ward $ward): bool
    {
        return $this->hasPermission($user, 'update ward');
    }

    public function delete(User $user, Ward $ward): bool
    {
        return $this->hasPermission($user, 'delete ward');
    }

    public function deleteAny(User $user): bool
    {
        return $this->hasPermission($user, 'deleteAny ward');
    }

    public function restore(User $user, Ward $ward): bool
    {
        return $this->hasPermission($user, 'restore ward');
    }

    public function restoreAny(User $user): bool
    {
        return $this->hasPermission($user, 'restoreAny ward');
    }

    public function forceDelete(User $user, Ward $ward): bool
    {
        return $this->hasPermission($user, 'forceDelete ward');
    }

    public function forceDeleteAny(User $user): bool
    {
        return $this->hasPermission($user, 'forceDeleteAny ward');
    }
}
