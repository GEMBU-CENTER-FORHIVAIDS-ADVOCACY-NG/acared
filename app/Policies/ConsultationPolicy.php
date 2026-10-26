<?php

namespace App\Policies;

use App\Models\Consultation;
use App\Models\User;

class ConsultationPolicy
{
    use DelegatesToSpatie;

    public function viewAny(User $user): bool
    {
        return $this->hasPermission($user, 'viewAny consultation');
    }

    public function view(User $user, Consultation $consultation): bool
    {
        return $this->hasPermission($user, 'view consultation');
    }

    public function create(User $user): bool
    {
        return $this->hasPermission($user, 'create consultation');
    }

    public function update(User $user, Consultation $consultation): bool
    {
        return $this->hasPermission($user, 'update consultation');
    }

    public function delete(User $user, Consultation $consultation): bool
    {
        return $this->hasPermission($user, 'delete consultation');
    }

    public function deleteAny(User $user): bool
    {
        return $this->hasPermission($user, 'deleteAny consultation');
    }

    public function restore(User $user, Consultation $consultation): bool
    {
        return $this->hasPermission($user, 'restore consultation');
    }

    public function restoreAny(User $user): bool
    {
        return $this->hasPermission($user, 'restoreAny consultation');
    }

    public function forceDelete(User $user, Consultation $consultation): bool
    {
        return $this->hasPermission($user, 'forceDelete consultation');
    }

    public function forceDeleteAny(User $user): bool
    {
        return $this->hasPermission($user, 'forceDeleteAny consultation');
    }
}
