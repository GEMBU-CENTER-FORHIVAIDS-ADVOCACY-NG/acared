<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Models\Method;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class MethodController extends Controller
{
    public function index(Request $request): Response
    {
        $query = trim((string) $request->query('q', ''));
        $perPage = in_array((int) $request->query('perPage', 25), [10, 25, 50, 100], true) ? (int) $request->query('perPage', 25) : 25;
        $methods = Method::query()
            ->when($query !== '', fn ($builder) => $builder->where(fn ($builder) => $builder
                ->where('name', 'like', "%{$query}%")
                ->orWhere('description', 'like', "%{$query}%")))
            ->orderBy('name')
            ->paginate($perPage)
            ->withQueryString()
            ->through(fn (Method $method) => [
                'id' => $method->id,
                'name' => $method->name,
                'description' => $method->description,
                'createdAt' => $method->created_at?->toIso8601String(),
                'updatedAt' => $method->updated_at?->toIso8601String(),
            ]);

        return Inertia::render('methods/index', [
            'methods' => $methods,
            'filters' => ['q' => $query, 'perPage' => $perPage],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        Method::create([
            ...$this->validated($request),
            'team_id' => $request->user()->currentTeam->getKey(),
            'user_id' => $request->user()->getKey(),
        ]);

        return to_route('methods.index', $request->user()->currentTeam->slug);
    }

    public function update(Request $request, string $current_team, Method $method): RedirectResponse
    {
        $method->update($this->validated($request, $method));

        return to_route('methods.index', $request->user()->currentTeam->slug);
    }

    public function destroy(Request $request, string $current_team, Method $method): RedirectResponse
    {
        $method->delete();

        return to_route('methods.index', $request->user()->currentTeam->slug);
    }

    public function bulkDestroy(Request $request): RedirectResponse
    {
        $teamId = $request->user()->currentTeam->getKey();
        $data = $request->validate([
            'ids' => ['required', 'array', 'min:1'],
            'ids.*' => ['integer', Rule::exists('methods', 'id')->where('team_id', $teamId)],
        ]);
        Method::query()->whereIn('id', $data['ids'])->delete();

        return to_route('methods.index', $request->user()->currentTeam->slug);
    }

    /** @return array{name: string, description: ?string} */
    private function validated(Request $request, ?Method $method = null): array
    {
        return $request->validate([
            'name' => ['required', 'string', 'max:255', Rule::unique('methods', 'name')->ignore($method?->id)],
            'description' => ['nullable', 'string'],
        ]);
    }
}
