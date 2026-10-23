<?php

namespace App\Policies;

use App\Models\OrderItem;
use App\Models\User;

class OrderItemPolicy
{
    use DelegatesToSpatie;

    public function viewAny(User $user): bool
    {
        return $this->hasPermission($user, 'viewAny orderitem');
    }

    public function view(User $user, OrderItem $orderitem): bool
    {
        return $this->hasPermission($user, 'view orderitem');
    }

    public function create(User $user): bool
    {
        return $this->hasPermission($user, 'create orderitem');
    }

    public function update(User $user, OrderItem $orderitem): bool
    {
        return $this->hasPermission($user, 'update orderitem');
    }

    public function delete(User $user, OrderItem $orderitem): bool
    {
        return $this->hasPermission($user, 'delete orderitem');
    }

    public function deleteAny(User $user): bool
    {
        return $this->hasPermission($user, 'deleteAny orderitem');
    }

    public function restore(User $user, OrderItem $orderitem): bool
    {
        return $this->hasPermission($user, 'restore orderitem');
    }

    public function restoreAny(User $user): bool
    {
        return $this->hasPermission($user, 'restoreAny orderitem');
    }

    public function forceDelete(User $user, OrderItem $orderitem): bool
    {
        return $this->hasPermission($user, 'forceDelete orderitem');
    }

    public function forceDeleteAny(User $user): bool
    {
        return $this->hasPermission($user, 'forceDeleteAny orderitem');
    }
}
