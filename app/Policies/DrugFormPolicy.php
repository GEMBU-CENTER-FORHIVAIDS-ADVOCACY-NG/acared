<?php

namespace App\Policies;

use App\Models\DrugForm;
use App\Models\User;

class DrugFormPolicy
{
    use DelegatesToSpatie;

    public function viewAny(User $user): bool
    {
        return $this->hasPermission($user, 'viewAny drugform');
    }

    public function view(User $user, DrugForm $drugform): bool
    {
        return $this->hasPermission($user, 'view drugform');
    }

    public function create(User $user): bool
    {
        return $this->hasPermission($user, 'create drugform');
    }

    public function update(User $user, DrugForm $drugform): bool
    {
        return $this->hasPermission($user, 'update drugform');
    }

    public function delete(User $user, DrugForm $drugform): bool
    {
        return $this->hasPermission($user, 'delete drugform');
    }

    public function deleteAny(User $user): bool
    {
        return $this->hasPermission($user, 'deleteAny drugform');
    }

    public function restore(User $user, DrugForm $drugform): bool
    {
        return $this->hasPermission($user, 'restore drugform');
    }

    public function restoreAny(User $user): bool
    {
        return $this->hasPermission($user, 'restoreAny drugform');
    }

    public function forceDelete(User $user, DrugForm $drugform): bool
    {
        return $this->hasPermission($user, 'forceDelete drugform');
    }

    public function forceDeleteAny(User $user): bool
    {
        return $this->hasPermission($user, 'forceDeleteAny drugform');
    }
}
