<?php

namespace App\Policies;

use App\Models\CouponUsage;
use App\Models\User;

class CouponUsagePolicy
{
    use DelegatesToSpatie;

    public function viewAny(User $user): bool
    {
        return $this->hasPermission($user, 'viewAny couponusage');
    }

    public function view(User $user, CouponUsage $couponusage): bool
    {
        return $this->hasPermission($user, 'view couponusage');
    }

    public function create(User $user): bool
    {
        return $this->hasPermission($user, 'create couponusage');
    }

    public function update(User $user, CouponUsage $couponusage): bool
    {
        return $this->hasPermission($user, 'update couponusage');
    }

    public function delete(User $user, CouponUsage $couponusage): bool
    {
        return $this->hasPermission($user, 'delete couponusage');
    }

    public function deleteAny(User $user): bool
    {
        return $this->hasPermission($user, 'deleteAny couponusage');
    }

    public function restore(User $user, CouponUsage $couponusage): bool
    {
        return $this->hasPermission($user, 'restore couponusage');
    }

    public function restoreAny(User $user): bool
    {
        return $this->hasPermission($user, 'restoreAny couponusage');
    }

    public function forceDelete(User $user, CouponUsage $couponusage): bool
    {
        return $this->hasPermission($user, 'forceDelete couponusage');
    }

    public function forceDeleteAny(User $user): bool
    {
        return $this->hasPermission($user, 'forceDeleteAny couponusage');
    }
}
