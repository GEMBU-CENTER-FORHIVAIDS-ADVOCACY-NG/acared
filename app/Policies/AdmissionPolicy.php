<?php

namespace App\Policies;

use App\Models\Admission;
use App\Models\User;

class AdmissionPolicy
{
    use DelegatesToSpatie;

    public function viewAny(User $user): bool
    {
        return $this->hasPermission($user, 'viewAny admission');
    }

    public function view(User $user, Admission $admission): bool
    {
        return $this->hasPermission($user, 'view admission');
    }

    public function create(User $user): bool
    {
        return $this->hasPermission($user, 'create admission');
    }

    public function update(User $user, Admission $admission): bool
    {
        return $this->hasPermission($user, 'update admission');
    }

    public function delete(User $user, Admission $admission): bool
    {
        return $this->hasPermission($user, 'delete admission');
    }

    public function deleteAny(User $user): bool
    {
        return $this->hasPermission($user, 'deleteAny admission');
    }

    public function restore(User $user, Admission $admission): bool
    {
        return $this->hasPermission($user, 'restore admission');
    }

    public function restoreAny(User $user): bool
    {
        return $this->hasPermission($user, 'restoreAny admission');
    }

    public function forceDelete(User $user, Admission $admission): bool
    {
        return $this->hasPermission($user, 'forceDelete admission');
    }

    public function forceDeleteAny(User $user): bool
    {
        return $this->hasPermission($user, 'forceDeleteAny admission');
    }
}
