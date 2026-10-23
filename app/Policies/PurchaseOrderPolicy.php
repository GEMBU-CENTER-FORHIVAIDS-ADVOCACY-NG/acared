<?php

namespace App\Policies;

use App\Models\PurchaseOrder;
use App\Models\User;

class PurchaseOrderPolicy
{
    use DelegatesToSpatie;

    public function viewAny(User $user): bool
    {
        return $this->hasPermission($user, 'viewAny purchaseorder');
    }

    public function view(User $user, PurchaseOrder $purchaseorder): bool
    {
        return $this->hasPermission($user, 'view purchaseorder');
    }

    public function create(User $user): bool
    {
        return $this->hasPermission($user, 'create purchaseorder');
    }

    public function update(User $user, PurchaseOrder $purchaseorder): bool
    {
        return $this->hasPermission($user, 'update purchaseorder');
    }

    public function delete(User $user, PurchaseOrder $purchaseorder): bool
    {
        return $this->hasPermission($user, 'delete purchaseorder');
    }

    public function deleteAny(User $user): bool
    {
        return $this->hasPermission($user, 'deleteAny purchaseorder');
    }

    public function restore(User $user, PurchaseOrder $purchaseorder): bool
    {
        return $this->hasPermission($user, 'restore purchaseorder');
    }

    public function restoreAny(User $user): bool
    {
        return $this->hasPermission($user, 'restoreAny purchaseorder');
    }

    public function forceDelete(User $user, PurchaseOrder $purchaseorder): bool
    {
        return $this->hasPermission($user, 'forceDelete purchaseorder');
    }

    public function forceDeleteAny(User $user): bool
    {
        return $this->hasPermission($user, 'forceDeleteAny purchaseorder');
    }
}
