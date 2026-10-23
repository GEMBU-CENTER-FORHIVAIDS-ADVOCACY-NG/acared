<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Vital;

class VitalPolicy
{
    use DelegatesToSpatie;

    public function viewAny(User $user): bool
    {
        return $this->hasPermission($user, 'viewAny vital');
    }

    public function view(User $user, Vital $vital): bool
    {
        return $this->hasPermission($user, 'view vital');
    }

    public function create(User $user): bool
    {
        return $this->hasPermission($user, 'create vital');
    }

    public function update(User $user, Vital $vital): bool
    {
        return $this->hasPermission($user, 'update vital');
    }

    public function delete(User $user, Vital $vital): bool
    {
        return $this->hasPermission($user, 'delete vital');
    }

    public function deleteAny(User $user): bool
    {
        return $this->hasPermission($user, 'deleteAny vital');
    }

    public function restore(User $user, Vital $vital): bool
    {
        return $this->hasPermission($user, 'restore vital');
    }

    public function restoreAny(User $user): bool
    {
        return $this->hasPermission($user, 'restoreAny vital');
    }

    public function forceDelete(User $user, Vital $vital): bool
    {
        return $this->hasPermission($user, 'forceDelete vital');
    }

    public function forceDeleteAny(User $user): bool
    {
        return $this->hasPermission($user, 'forceDeleteAny vital');
    }
}
