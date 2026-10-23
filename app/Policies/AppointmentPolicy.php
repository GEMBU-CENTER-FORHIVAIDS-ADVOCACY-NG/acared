<?php

namespace App\Policies;

use App\Models\Appointment;
use App\Models\User;

class AppointmentPolicy
{
    use DelegatesToSpatie;

    public function viewAny(User $user): bool
    {
        return $this->hasPermission($user, 'viewAny appointment');
    }

    public function view(User $user, Appointment $appointment): bool
    {
        return $this->hasPermission($user, 'view appointment');
    }

    public function create(User $user): bool
    {
        return $this->hasPermission($user, 'create appointment');
    }

    public function update(User $user, Appointment $appointment): bool
    {
        return $this->hasPermission($user, 'update appointment');
    }

    public function delete(User $user, Appointment $appointment): bool
    {
        return $this->hasPermission($user, 'delete appointment');
    }

    public function deleteAny(User $user): bool
    {
        return $this->hasPermission($user, 'deleteAny appointment');
    }

    public function restore(User $user, Appointment $appointment): bool
    {
        return $this->hasPermission($user, 'restore appointment');
    }

    public function restoreAny(User $user): bool
    {
        return $this->hasPermission($user, 'restoreAny appointment');
    }

    public function forceDelete(User $user, Appointment $appointment): bool
    {
        return $this->hasPermission($user, 'forceDelete appointment');
    }

    public function forceDeleteAny(User $user): bool
    {
        return $this->hasPermission($user, 'forceDeleteAny appointment');
    }
}
