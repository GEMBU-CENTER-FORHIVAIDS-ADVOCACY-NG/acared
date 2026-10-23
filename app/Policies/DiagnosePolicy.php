<?php

namespace App\Policies;

use App\Models\Diagnose;
use App\Models\User;

class DiagnosePolicy
{
    use DelegatesToSpatie;

    public function viewAny(User $user): bool
    {
        return $this->hasPermission($user, 'viewAny diagnose');
    }

    public function view(User $user, Diagnose $diagnose): bool
    {
        return $this->hasPermission($user, 'view diagnose');
    }

    public function create(User $user): bool
    {
        return $this->hasPermission($user, 'create diagnose');
    }

    public function update(User $user, Diagnose $diagnose): bool
    {
        return $this->hasPermission($user, 'update diagnose');
    }

    public function delete(User $user, Diagnose $diagnose): bool
    {
        return $this->hasPermission($user, 'delete diagnose');
    }

    public function deleteAny(User $user): bool
    {
        return $this->hasPermission($user, 'deleteAny diagnose');
    }

    public function restore(User $user, Diagnose $diagnose): bool
    {
        return $this->hasPermission($user, 'restore diagnose');
    }

    public function restoreAny(User $user): bool
    {
        return $this->hasPermission($user, 'restoreAny diagnose');
    }

    public function forceDelete(User $user, Diagnose $diagnose): bool
    {
        return $this->hasPermission($user, 'forceDelete diagnose');
    }

    public function forceDeleteAny(User $user): bool
    {
        return $this->hasPermission($user, 'forceDeleteAny diagnose');
    }
}
