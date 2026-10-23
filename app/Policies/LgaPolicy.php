<?php

namespace App\Policies;

use App\Models\Lga;
use App\Models\User;

class LgaPolicy
{
    use DelegatesToSpatie;

    public function viewAny(User $user): bool
    {
        return $this->hasPermission($user, 'viewAny lga');
    }

    public function view(User $user, Lga $lga): bool
    {
        return $this->hasPermission($user, 'view lga');
    }

    public function create(User $user): bool
    {
        return $this->hasPermission($user, 'create lga');
    }

    public function update(User $user, Lga $lga): bool
    {
        return $this->hasPermission($user, 'update lga');
    }

    public function delete(User $user, Lga $lga): bool
    {
        return $this->hasPermission($user, 'delete lga');
    }

    public function deleteAny(User $user): bool
    {
        return $this->hasPermission($user, 'deleteAny lga');
    }

    public function restore(User $user, Lga $lga): bool
    {
        return $this->hasPermission($user, 'restore lga');
    }

    public function restoreAny(User $user): bool
    {
        return $this->hasPermission($user, 'restoreAny lga');
    }

    public function forceDelete(User $user, Lga $lga): bool
    {
        return $this->hasPermission($user, 'forceDelete lga');
    }

    public function forceDeleteAny(User $user): bool
    {
        return $this->hasPermission($user, 'forceDeleteAny lga');
    }
}
