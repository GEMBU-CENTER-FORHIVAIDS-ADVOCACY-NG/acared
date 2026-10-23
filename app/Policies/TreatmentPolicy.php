<?php

namespace App\Policies;

use App\Models\Treatment;
use App\Models\User;

class TreatmentPolicy
{
    use DelegatesToSpatie;

    public function viewAny(User $user): bool
    {
        return $this->hasPermission($user, 'viewAny treatment');
    }

    public function view(User $user, Treatment $treatment): bool
    {
        return $this->hasPermission($user, 'view treatment');
    }

    public function create(User $user): bool
    {
        return $this->hasPermission($user, 'create treatment');
    }

    public function update(User $user, Treatment $treatment): bool
    {
        return $this->hasPermission($user, 'update treatment');
    }

    public function delete(User $user, Treatment $treatment): bool
    {
        return $this->hasPermission($user, 'delete treatment');
    }

    public function deleteAny(User $user): bool
    {
        return $this->hasPermission($user, 'deleteAny treatment');
    }

    public function restore(User $user, Treatment $treatment): bool
    {
        return $this->hasPermission($user, 'restore treatment');
    }

    public function restoreAny(User $user): bool
    {
        return $this->hasPermission($user, 'restoreAny treatment');
    }

    public function forceDelete(User $user, Treatment $treatment): bool
    {
        return $this->hasPermission($user, 'forceDelete treatment');
    }

    public function forceDeleteAny(User $user): bool
    {
        return $this->hasPermission($user, 'forceDeleteAny treatment');
    }
}
