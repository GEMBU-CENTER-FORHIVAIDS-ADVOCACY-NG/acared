<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Permission;

class PermissionController extends Controller
{
    public function index(Request $request): Response
    {
        $query = trim((string) $request->query('q', ''));
        $perPage = in_array((int) $request->query('perPage', 25), [10, 25, 50, 100], true) ? (int) $request->query('perPage', 25) : 25;

        $permissions = Permission::query()
            ->when($query !== '', fn ($builder) => $builder->where('name', 'like', "%{$query}%"))
            ->orderBy('name')
            ->paginate($perPage)
            ->withQueryString()
            ->through(fn (Permission $permission) => [
                'id' => $permission->id,
                'name' => $permission->name,
                'guardName' => $permission->guard_name,
                'createdAt' => $permission->created_at?->toIso8601String(),
                'updatedAt' => $permission->updated_at?->toIso8601String(),
            ]);

        return Inertia::render('settings/permissions/index', [
            'permissions' => $permissions,
            'filters' => ['q' => $query, 'perPage' => $perPage],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $this->validated($request);

        Permission::create(['name' => $data['name'], 'guard_name' => 'web']);

        return to_route('permissions.index');
    }

    public function update(Request $request, Permission $permission): RedirectResponse
    {
        $data = $this->validated($request, $permission->id);

        $permission->update(['name' => $data['name']]);

        return to_route('permissions.index');
    }

    public function destroy(Request $request, Permission $permission): RedirectResponse
    {
        $permission->delete();

        return to_route('permissions.index');
    }

    public function bulkDestroy(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'ids' => ['required', 'array', 'min:1'],
            'ids.*' => ['integer', 'exists:permissions,id'],
        ]);

        Permission::query()->whereIn('id', $data['ids'])->delete();

        return to_route('permissions.index');
    }

    /** @return array{name: string} */
    private function validated(Request $request, ?int $excludeId = null): array
    {
        return $request->validate([
            'name' => [
                'required',
                'string',
                'max:255',
                Rule::unique('permissions', 'name')->ignore($excludeId),
            ],
        ]);
    }
}
