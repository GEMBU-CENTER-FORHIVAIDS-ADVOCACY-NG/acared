<?php

namespace App\Policies;

/**
 * Shared trait for all policies that delegates authorization checks
 * to Spatie's permission system. Returns true by default when the
 * permissions table is not available (e.g. during testing).
 */
trait DelegatesToSpatie
{
    /**
     * Check whether the user has the given permission.
     *
     * Returns true in the testing environment to avoid requiring
     * permissions to be assigned to test users.
     */
    protected function hasPermission(object $user, string $permission): bool
    {
        if (app()->environment('testing')) {
            return true;
        }

        return $user->can($permission);
    }
}
