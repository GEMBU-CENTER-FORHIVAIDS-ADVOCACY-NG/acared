<?php

namespace App\Policies;

use App\Models\TestResult;
use App\Models\User;

class TestResultPolicy
{
    use DelegatesToSpatie;

    public function viewAny(User $user): bool
    {
        return $this->hasPermission($user, 'viewAny testresult');
    }

    public function view(User $user, TestResult $testresult): bool
    {
        return $this->hasPermission($user, 'view testresult');
    }

    public function create(User $user): bool
    {
        return $this->hasPermission($user, 'create testresult');
    }

    public function update(User $user, TestResult $testresult): bool
    {
        return $this->hasPermission($user, 'update testresult');
    }

    public function delete(User $user, TestResult $testresult): bool
    {
        return $this->hasPermission($user, 'delete testresult');
    }

    public function deleteAny(User $user): bool
    {
        return $this->hasPermission($user, 'deleteAny testresult');
    }

    public function restore(User $user, TestResult $testresult): bool
    {
        return $this->hasPermission($user, 'restore testresult');
    }

    public function restoreAny(User $user): bool
    {
        return $this->hasPermission($user, 'restoreAny testresult');
    }

    public function forceDelete(User $user, TestResult $testresult): bool
    {
        return $this->hasPermission($user, 'forceDelete testresult');
    }

    public function forceDeleteAny(User $user): bool
    {
        return $this->hasPermission($user, 'forceDeleteAny testresult');
    }
}
