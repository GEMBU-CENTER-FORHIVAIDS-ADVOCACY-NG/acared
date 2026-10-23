<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreCategoryRequest;
use App\Http\Requests\UpdateCategoryRequest;
use App\Models\Category;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CategoryController extends Controller
{
    /**
     * The pagination sizes that users may pick.
     */
    private const PER_PAGE_OPTIONS = [10, 25, 50, 100];

    /**
     * The category columns that may be used to sort the list.
     */
    private const SORTABLE_COLUMNS = ['name', 'discount_percentage', 'created_at', 'updated_at'];

    /**
     * List the patient categories for the current team.
     */
    public function index(Request $request): Response
    {
        $filters = [
            'q' => trim((string) $request->query('q', '')),
            'sort' => $this->sortBy($request),
            'direction' => $request->query('direction') === 'asc' ? 'asc' : 'desc',
            'perPage' => $this->perPage($request),
        ];

        $categories = $this->filteredQuery($filters)
            ->withCount('patients')
            ->orderBy($filters['sort'], $filters['direction'])
            ->paginate($filters['perPage'])
            ->withQueryString()
            ->through(fn (Category $category) => $this->listItem($category));

        return Inertia::render('categories/index', [
            'categories' => $categories,
            'filters' => $filters,
        ]);
    }

    /**
     * Store a newly created category.
     */
    public function store(StoreCategoryRequest $request): RedirectResponse
    {
        Category::create([
            ...$request->validated(),
            'team_id' => $request->user()->currentTeam->getKey(),
        ]);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Category created.']);

        return to_route('categories.index', $request->user()->currentTeam->slug);
    }

    /**
     * Update the given category.
     */
    public function update(UpdateCategoryRequest $request, string $current_team, Category $category): RedirectResponse
    {
        $category->update($request->validated());

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Category updated.']);

        return to_route('categories.index', $request->user()->currentTeam->slug);
    }

    /**
     * Delete the given category.
     */
    public function destroy(Request $request, string $current_team, Category $category): RedirectResponse
    {
        $category->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Category deleted.']);

        return to_route('categories.index', $request->user()->currentTeam->slug);
    }

    /**
     * Build the filtered categories query.
     *
     * @param  array{q: string, sort: string, direction: string, perPage: int}  $filters
     * @return Builder<Category>
     */
    private function filteredQuery(array $filters): Builder
    {
        $query = Category::query();

        if ($filters['q'] !== '') {
            $like = '%'.$filters['q'].'%';

            $query->where(fn (Builder $query) => $query
                ->where('name', 'like', $like)
                ->orWhere('description', 'like', $like));
        }

        return $query;
    }

    /**
     * Serialize a category for the list table.
     *
     * @return array<string, mixed>
     */
    private function listItem(Category $category): array
    {
        return [
            'id' => $category->getKey(),
            'name' => $category->name,
            'discountPercentage' => (int) $category->discount_percentage,
            'description' => $category->description,
            'patientsCount' => (int) ($category->patients_count ?? 0),
            'createdAt' => $category->created_at?->toIso8601String(),
            'updatedAt' => $category->updated_at?->toIso8601String(),
        ];
    }

    /**
     * Get the validated sort column.
     */
    private function sortBy(Request $request): string
    {
        $sort = (string) $request->query('sort', 'name');

        return in_array($sort, self::SORTABLE_COLUMNS, true) ? $sort : 'name';
    }

    /**
     * Get the validated page size.
     */
    private function perPage(Request $request): int
    {
        $perPage = (int) $request->query('perPage', 25);

        return in_array($perPage, self::PER_PAGE_OPTIONS, true) ? $perPage : 25;
    }
}
