<?php

namespace App\Policies;

use App\Models\Coupon;
use App\Models\User;

class CouponPolicy
{
    use DelegatesToSpatie;

    public function viewAny(User $user): bool
    {
        return $this->hasPermission($user, 'viewAny coupon');
    }

    public function view(User $user, Coupon $coupon): bool
    {
        return $this->hasPermission($user, 'view coupon');
    }

    public function create(User $user): bool
    {
        return $this->hasPermission($user, 'create coupon');
    }

    public function update(User $user, Coupon $coupon): bool
    {
        return $this->hasPermission($user, 'update coupon');
    }

    public function delete(User $user, Coupon $coupon): bool
    {
        return $this->hasPermission($user, 'delete coupon');
    }

    public function deleteAny(User $user): bool
    {
        return $this->hasPermission($user, 'deleteAny coupon');
    }

    public function restore(User $user, Coupon $coupon): bool
    {
        return $this->hasPermission($user, 'restore coupon');
    }

    public function restoreAny(User $user): bool
    {
        return $this->hasPermission($user, 'restoreAny coupon');
    }

    public function forceDelete(User $user, Coupon $coupon): bool
    {
        return $this->hasPermission($user, 'forceDelete coupon');
    }

    public function forceDeleteAny(User $user): bool
    {
        return $this->hasPermission($user, 'forceDeleteAny coupon');
    }
}
