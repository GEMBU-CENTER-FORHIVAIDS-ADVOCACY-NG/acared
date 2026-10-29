<?php

namespace App\Support;

use App\Models\Membership;
use App\Models\Team;
use App\Models\TeamInvitation;
use App\Models\User;
use Illuminate\Support\Collection;
use Illuminate\Support\Str;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

/**
 * Discovers Eloquent models and synchronizes their policy-based permissions
 * with Spatie's permission database, mirroring filament-shield's approach.
 */
class PermissionRegistrar
{
    /**
     * The standard policy abilities generated for each model.
     *
     * @var array<int, string>
     */
    protected array $policyAbilities = [
        'viewAny',
        'view',
        'create',
        'update',
        'delete',
        'deleteAny',
        'restore',
        'restoreAny',
        'forceDelete',
        'forceDeleteAny',
    ];

    /**
     * Models to exclude from permission generation.
     *
     * @var array<int, class-string>
     */
    protected array $excludedModels = [
        User::class,
        Team::class,
        Membership::class,
        TeamInvitation::class,
        Role::class,
        Permission::class,
    ];

    /**
     * Page-level permissions that are independent of model permissions.
     *
     * These allow fine-grained control when multiple sidebar groups share
     * the same underlying model (e.g., Reception and Consultations both use
     * the Appointment model, but should be visible to different roles).
     *
     * @var array<int, string>
     */
    protected array $pagePermissions = [
        'view reception',
        'view consultations',
        'view laboratories',
        'view lab-intake',
        'view price-lists',
        'view pharmacy',
        'view inventory',
        'view nursing',
        'view reports',
        'view finance',
        'view roles',
        'view permissions',
        'view users',
        'view markups',
        'view methods',
        'view coupons',

        // Stock count permissions for inventory adjustments
        'stock count inventory',
        'stock count druginventory',
        'stock count labinventory',
    ];

    /**
     * Get the list of policy abilities.
     *
     * @return array<int, string>
     */
    public function getPolicyAbilities(): array
    {
        return $this->policyAbilities;
    }

    /**
     * Discover all Eloquent models in the Models directory.
     *
     * @return array<int, class-string>
     */
    public function discoverModels(): array
    {
        $models = [];

        $path = app_path('Models');

        if (! is_dir($path)) {
            return $models;
        }

        $files = glob($path.'/*.php');

        foreach ($files as $file) {
            $className = 'App\\Models\\'.pathinfo($file, PATHINFO_FILENAME);

            if (class_exists($className) && in_array($className, $this->excludedModels, true)) {
                continue;
            }

            if (class_exists($className)) {
                $models[] = $className;
            }
        }

        sort($models);

        return $models;
    }

    /**
     * Get the permission name for a given model and ability.
     *
     * Uses the format: `{ability} {model}` (e.g., "viewAny patients").
     */
    public function getPermissionName(string $model, string $ability): string
    {
        $modelName = $this->getModelName($model);

        return "{$ability} {$modelName}";
    }

    /**
     * Get the human-readable model name from a class.
     */
    protected function getModelName(string $model): string
    {
        $class = class_basename($model);

        return strtolower($class);
    }

    /**
     * Get the resource label for grouping permissions in the UI.
     */
    public function getResourceLabel(string $model): string
    {
        $class = class_basename($model);

        return Str::headline(strtolower($class));
    }

    /**
     * Extract the resource name from a permission string.
     *
     * For example, "viewAny patients" returns "patients".
     */
    public function extractResourceFromPermission(string $permissionName): string
    {
        $nameLower = strtolower($permissionName);

        foreach ($this->policyAbilities as $ability) {
            $prefix = strtolower($ability).' ';
            if (str_starts_with($nameLower, $prefix)) {
                $resource = trim(substr($nameLower, strlen($prefix)));

                return $resource !== '' ? $resource : 'other';
            }
        }

        return 'other';
    }

    /**
     * Get a human-readable label from a resource name.
     *
     * For example, "patients" returns "Patients".
     */
    public function getResourceLabelFromResource(string $resource): string
    {
        return Str::headline(str_replace('_', ' ', $resource));
    }

    /**
     * Synchronize permissions for all discovered models and page-level permissions.
     *
     * Creates missing permissions and returns all generated permission names.
     * Does NOT delete permissions that no longer have a corresponding model.
     *
     * @return Collection<int, string>
     */
    public function syncPermissions(): Collection
    {
        $models = $this->discoverModels();

        $permissionNames = collect();

        foreach ($models as $model) {
            foreach ($this->policyAbilities as $ability) {
                $permissionName = $this->getPermissionName($model, $ability);

                Permission::firstOrCreate([
                    'name' => $permissionName,
                ]);

                $permissionNames->push($permissionName);
            }
        }

        // Create page-level permissions
        foreach ($this->pagePermissions as $pagePermission) {
            Permission::firstOrCreate([
                'name' => $pagePermission,
            ]);

            $permissionNames->push($pagePermission);
        }

        // Flush the permission cache so changes take effect
        app(\Spatie\Permission\PermissionRegistrar::class)->forgetCachedPermissions();

        return $permissionNames;
    }

    /**
     * Get all policy-generated permissions grouped by model resource.
     *
     * @return array<int, array{model: class-string, label: string, permissions: array<int, string>}>
     */
    public function getGroupedPermissions(): array
    {
        $models = $this->discoverModels();

        $groups = [];

        foreach ($models as $model) {
            $permissions = collect($this->policyAbilities)
                ->map(fn (string $ability) => $this->getPermissionName($model, $ability))
                ->values()
                ->toArray();

            $groups[] = [
                'model' => $model,
                'label' => $this->getResourceLabel($model),
                'permissions' => $permissions,
            ];
        }

        // Add page-level permissions as a separate group
        $groups[] = [
            'model' => null,
            'label' => 'Pages',
            'permissions' => $this->pagePermissions,
        ];

        // Sort by label
        usort($groups, fn (array $a, array $b) => strcasecmp($a['label'], $b['label']));

        return $groups;
    }

    /**
     * Get the page-level permissions.
     *
     * @return array<int, string>
     */
    public function getPagePermissions(): array
    {
        return $this->pagePermissions;
    }
}
