<?php

namespace App\Policies;

use App\Models\Category;
use App\Models\User;

class CategoryPolicy
{
    use DelegatesToSpatie;

    public function viewAny(User $user): bool
    {
        return $this->hasPermission($user, 'viewAny category');
    }

    public function view(User $user, Category $category): bool
    {
        return $this->hasPermission($user, 'view category');
    }

    public function create(User $user): bool
    {
        return $this->hasPermission($user, 'create category');
    }

    public function update(User $user, Category $category): bool
    {
        return $this->hasPermission($user, 'update category');
    }

    public function delete(User $user, Category $category): bool
    {
        return $this->hasPermission($user, 'delete category');
    }

    public function deleteAny(User $user): bool
    {
        return $this->hasPermission($user, 'deleteAny category');
    }

    public function restore(User $user, Category $category): bool
    {
        return $this->hasPermission($user, 'restore category');
    }

    public function restoreAny(User $user): bool
    {
        return $this->hasPermission($user, 'restoreAny category');
    }

    public function forceDelete(User $user, Category $category): bool
    {
        return $this->hasPermission($user, 'forceDelete category');
    }

    public function forceDeleteAny(User $user): bool
    {
        return $this->hasPermission($user, 'forceDeleteAny category');
    }
}
