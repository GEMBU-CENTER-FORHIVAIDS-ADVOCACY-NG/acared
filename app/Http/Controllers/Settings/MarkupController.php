<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Models\Markup;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class MarkupController extends Controller
{
    public function index(Request $request): Response
    {
        $query = trim((string) $request->query('q', ''));
        $perPage = in_array((int) $request->query('perPage', 25), [10, 25, 50, 100], true) ? (int) $request->query('perPage', 25) : 25;
        $markups = Markup::query()
            ->when($query !== '', fn ($builder) => $builder->where('name', 'like', "%{$query}%"))
            ->orderBy('value')
            ->paginate($perPage)
            ->withQueryString()
            ->through(fn (Markup $markup) => [
                'id' => $markup->id,
                'name' => $markup->name,
                'value' => (int) $markup->value,
                'createdAt' => $markup->created_at?->toIso8601String(),
                'updatedAt' => $markup->updated_at?->toIso8601String(),
            ]);

        return Inertia::render('markups/index', [
            'markups' => $markups,
            'filters' => ['q' => $query, 'perPage' => $perPage],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $this->validated($request);
        Markup::create([
            'team_id' => $request->user()->currentTeam->getKey(),
            'value' => $data['value'],
            'name' => $data['value'].'% Increase',
        ]);

        return to_route('markups.index', $request->user()->currentTeam->slug);
    }

    public function update(Request $request, string $current_team, Markup $markup): RedirectResponse
    {
        $data = $this->validated($request);
        $markup->update(['value' => $data['value'], 'name' => $data['value'].'% Increase']);

        return to_route('markups.index', $request->user()->currentTeam->slug);
    }

    public function destroy(Request $request, string $current_team, Markup $markup): RedirectResponse
    {
        $markup->delete();

        return to_route('markups.index', $request->user()->currentTeam->slug);
    }

    public function bulkDestroy(Request $request): RedirectResponse
    {
        $teamId = $request->user()->currentTeam->getKey();
        $data = $request->validate([
            'ids' => ['required', 'array', 'min:1'],
            'ids.*' => ['integer', Rule::exists('mark_ups', 'id')->where('team_id', $teamId)],
        ]);
        Markup::query()->whereIn('id', $data['ids'])->delete();

        return to_route('markups.index', $request->user()->currentTeam->slug);
    }

    /** @return array{value: int} */
    private function validated(Request $request): array
    {
        return $request->validate([
            'value' => ['required', 'integer', 'between:0,100', 'multiple_of:5'],
        ]);
    }
}
