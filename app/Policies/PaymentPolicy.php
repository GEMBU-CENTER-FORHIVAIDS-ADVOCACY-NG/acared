<?php

namespace App\Policies;

use App\Models\Payment;
use App\Models\User;

class PaymentPolicy
{
    use DelegatesToSpatie;

    public function viewAny(User $user): bool
    {
        return $this->hasPermission($user, 'viewAny payment');
    }

    public function view(User $user, Payment $payment): bool
    {
        return $this->hasPermission($user, 'view payment');
    }

    public function create(User $user): bool
    {
        return $this->hasPermission($user, 'create payment');
    }

    public function update(User $user, Payment $payment): bool
    {
        return $this->hasPermission($user, 'update payment');
    }

    public function delete(User $user, Payment $payment): bool
    {
        return $this->hasPermission($user, 'delete payment');
    }

    public function deleteAny(User $user): bool
    {
        return $this->hasPermission($user, 'deleteAny payment');
    }

    public function restore(User $user, Payment $payment): bool
    {
        return $this->hasPermission($user, 'restore payment');
    }

    public function restoreAny(User $user): bool
    {
        return $this->hasPermission($user, 'restoreAny payment');
    }

    public function forceDelete(User $user, Payment $payment): bool
    {
        return $this->hasPermission($user, 'forceDelete payment');
    }

    public function forceDeleteAny(User $user): bool
    {
        return $this->hasPermission($user, 'forceDeleteAny payment');
    }
}
