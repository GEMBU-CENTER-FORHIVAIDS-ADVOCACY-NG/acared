<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Support\PermissionRegistrar;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class RoleController extends Controller
{
    public function __construct(
        protected PermissionRegistrar $registrar
    ) {}

    public function index(Request $request): Response
    {
        $query = trim((string) $request->query('q', ''));
        $perPage = in_array((int) $request->query('perPage', 25), [10, 25, 50, 100], true) ? (int) $request->query('perPage', 25) : 25;

        $roles = Role::query()
            ->when($query !== '', fn ($builder) => $builder->where('name', 'like', "%{$query}%"))
            ->orderBy('name')
            ->paginate($perPage)
            ->withQueryString()
            ->through(fn (Role $role) => [
                'id' => $role->id,
                'name' => $role->name,
                'guardName' => $role->guard_name,
                'permissions' => $role->permissions->map(fn (Permission $p) => [
                    'id' => $p->id,
                    'name' => $p->name,
                    'guardName' => $p->guard_name,
                ])->values(),
                'createdAt' => $role->created_at?->toIso8601String(),
                'updatedAt' => $role->updated_at?->toIso8601String(),
            ]);

        $allPermissions = Permission::orderBy('name')->get()->map(fn (Permission $p) => [
            'id' => $p->id,
            'name' => $p->name,
            'guardName' => $p->guard_name,
        ]);

        $groupedPermissions = $this->groupPermissionsByResource($allPermissions->toArray());

        return Inertia::render('settings/roles/index', [
            'roles' => $roles,
            'permissions' => $allPermissions,
            'groupedPermissions' => $groupedPermissions,
            'filters' => ['q' => $query, 'perPage' => $perPage],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $this->validated($request);

        $role = Role::create(['name' => $data['name'], 'guard_name' => 'web']);

        if (! empty($data['permissions'] ?? [])) {
            $role->syncPermissions($data['permissions']);
        }

        return to_route('roles.index');
    }

    public function update(Request $request, Role $role): RedirectResponse
    {
        $data = $this->validated($request, $role->id);

        $role->update(['name' => $data['name']]);

        if (isset($data['permissions'])) {
            $role->syncPermissions($data['permissions']);
        }

        return to_route('roles.index');
    }

    public function destroy(Request $request, Role $role): RedirectResponse
    {
        $role->delete();

        return to_route('roles.index');
    }

    public function bulkDestroy(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'ids' => ['required', 'array', 'min:1'],
            'ids.*' => ['integer', 'exists:roles,id'],
        ]);

        Role::query()->whereIn('id', $data['ids'])->delete();

        return to_route('roles.index');
    }

    /** @return array{name: string, permissions?: array<int, int>} */
    private function validated(Request $request, ?int $excludeId = null): array
    {
        return $request->validate([
            'name' => [
                'required',
                'string',
                'max:255',
                Rule::unique('roles', 'name')->ignore($excludeId),
            ],
            'permissions' => ['sometimes', 'array'],
            'permissions.*' => ['integer', 'exists:permissions,id'],
        ]);
    }

    /**
     * Group permissions by resource using the PermissionRegistrar's policy abilities.
     *
     * @param  array<int, array{id: int, name: string, guardName: string}>  $permissions
     * @return array<int, array{resource: string, label: string, permissions: array<int, array{id: int, name: string, guardName: string}>}>
     */
    private function groupPermissionsByResource(array $permissions): array
    {
        $groups = [];

        foreach ($permissions as $permission) {
            $resource = $this->registrar->extractResourceFromPermission($permission['name']);
            $label = $this->registrar->getResourceLabelFromResource($resource);

            if (! isset($groups[$resource])) {
                $groups[$resource] = [
                    'resource' => $resource,
                    'label' => $label,
                    'permissions' => [],
                ];
            }

            $groups[$resource]['permissions'][] = $permission;
        }

        // Sort groups by label
        uasort($groups, fn (array $a, array $b) => strcasecmp($a['label'], $b['label']));

        return array_values($groups);
    }
}
