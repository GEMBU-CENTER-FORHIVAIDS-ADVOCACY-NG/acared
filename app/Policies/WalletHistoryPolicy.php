<?php

namespace App\Policies;

use App\Models\User;
use App\Models\WalletHistory;

class WalletHistoryPolicy
{
    use DelegatesToSpatie;

    public function viewAny(User $user): bool
    {
        return $this->hasPermission($user, 'viewAny wallethistory');
    }

    public function view(User $user, WalletHistory $wallethistory): bool
    {
        return $this->hasPermission($user, 'view wallethistory');
    }

    public function create(User $user): bool
    {
        return $this->hasPermission($user, 'create wallethistory');
    }

    public function update(User $user, WalletHistory $wallethistory): bool
    {
        return $this->hasPermission($user, 'update wallethistory');
    }

    public function delete(User $user, WalletHistory $wallethistory): bool
    {
        return $this->hasPermission($user, 'delete wallethistory');
    }

    public function deleteAny(User $user): bool
    {
        return $this->hasPermission($user, 'deleteAny wallethistory');
    }

    public function restore(User $user, WalletHistory $wallethistory): bool
    {
        return $this->hasPermission($user, 'restore wallethistory');
    }

    public function restoreAny(User $user): bool
    {
        return $this->hasPermission($user, 'restoreAny wallethistory');
    }

    public function forceDelete(User $user, WalletHistory $wallethistory): bool
    {
        return $this->hasPermission($user, 'forceDelete wallethistory');
    }

    public function forceDeleteAny(User $user): bool
    {
        return $this->hasPermission($user, 'forceDeleteAny wallethistory');
    }
}
