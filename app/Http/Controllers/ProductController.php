<?php

namespace App\Http\Controllers;

use App\Models\DrugForm;
use App\Models\DrugInventory;
use App\Models\Inventory;
use App\Models\PriceList;
use App\Service\DashboardCurrency;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class ProductController extends Controller
{
    /**
     * The pagination sizes that users may pick.
     */
    private const PER_PAGE_OPTIONS = [10, 25, 50, 100];

    /**
     * The columns that may be used to sort the list.
     */
    private const SORTABLE_COLUMNS = ['name', 'price', 'subcategory_name', 'created_at', 'updated_at'];

    /**
     * List all pharmacy products.
     */
    public function index(Request $request): Response
    {
        return $this->renderCatalog($request);
    }

    private function renderCatalog(Request $request): Response
    {
        $filters = [
            'q' => trim((string) $request->query('q', '')),
            'categoryId' => trim((string) $request->query('category_id', '')),
            'subcategoryId' => trim((string) $request->query('subcategory_id', '')),
            'sort' => $this->sortBy($request),
            'direction' => $request->query('direction') === 'asc' ? 'asc' : 'desc',
            'perPage' => $this->perPage($request),
        ];

        $query = $this->pharmacyQuery();
        $items = $query
            ->when($filters['q'] !== '', function (Builder $query) use ($filters): void {
                $like = '%'.$filters['q'].'%';

                $query->where(function (Builder $query) use ($like): void {
                    $query
                        ->where('name', 'like', $like)
                        ->orWhereHas('category', fn (Builder $query) => $query->where('name', 'like', $like))
                        ->orWhereHas('subCategory', fn (Builder $query) => $query->where('name', 'like', $like));
                });
            })
            ->when($filters['categoryId'] !== '', fn (Builder $query) => $query->where('category_id', $filters['categoryId']))
            ->when($filters['subcategoryId'] !== '', fn (Builder $query) => $query->where('subcategory_id', $filters['subcategoryId']))
            ->with(['category', 'subCategory', 'inventories.drugForm'])
            ->when($filters['sort'] === 'subcategory_name', function (Builder $query) use ($filters): void {
                $query->orderBy(
                    DB::raw('(SELECT subcategories.name FROM price_lists AS subcategories WHERE subcategories.id = price_lists.subcategory_id)'),
                    $filters['direction']
                )
                    ->orderBy('price_lists.id');
            }, function (Builder $query) use ($filters): void {
                $query->orderBy($filters['sort'], $filters['direction']);
            })
            ->paginate($filters['perPage'])
            ->withQueryString()
            ->through(fn (PriceList $item) => $this->listItem($item));

        $summary = [
            'categories' => $this->countWhere($request, 'is_category', true),
            'subcategories' => $this->countWithSubcategory($request),
            'items' => $this->countWhere($request, 'is_category', false),
            'inventoryLinked' => $this->countWhere($request, 'is_inventory', true),
        ];

        return Inertia::render('products/index', [
            'currencySymbol' => DashboardCurrency::symbol(),
            'items' => $items,
            'filters' => $filters,
            'formOptions' => $this->formOptions($request),
            'summary' => $summary,
        ]);
    }

    /**
     * Show the form for creating a new product.
     */
    public function create(Request $request): Response
    {
        return Inertia::render('products/edit', [
            'item' => null,
            'formOptions' => $this->formOptions($request),
        ]);
    }

    /**
     * Show the form for editing a product.
     */
    public function edit(Request $request, string $current_team, PriceList $price_list): Response
    {
        abort_unless((int) $price_list->team_id === (int) $request->user()->currentTeam->getKey(), 404);
        abort_unless($this->pharmacyQuery()->whereKey($price_list->getKey())->exists(), 404);

        $price_list->load(['category', 'subCategory', 'inventories.drugForm']);

        return Inertia::render('products/edit', [
            'item' => $this->listItem($price_list),
            'formOptions' => $this->formOptions($request),
        ]);
    }

    /**
     * Create a product.
     */
    public function store(Request $request): RedirectResponse
    {
        $data = $this->validated($request);

        DB::transaction(function () use ($request, $data): void {
            $item = PriceList::create([
                'team_id' => $request->user()->currentTeam->getKey(),
                'name' => $data['name'],
                'price' => $data['is_category'] ? null : ($data['price'] ?? 0),
                'category_id' => $data['category_id'] ?? null,
                'subcategory_id' => $data['subcategory_id'] ?? null,
                'is_category' => (bool) $data['is_category'],
                'is_inventory' => $data['is_category'] ? false : (bool) ($data['is_inventory'] ?? false),
                'uom' => $data['uom'] ?? null,
                'description' => $data['description'] ?? null,
            ]);

            if (! $data['is_category'] && ($data['is_inventory'] ?? false) && ! empty($data['inventory'])) {
                $inventory = $data['inventory'];

                $sku = $inventory['sku'] ?? $this->generateUniqueSku();

                Inventory::create([
                    'team_id' => $request->user()->currentTeam->getKey(),
                    'sku' => $sku,
                    'price_list_id' => $item->getKey(),
                    'drug_form_id' => $inventory['drug_form_id'],
                    'min_qty' => $inventory['min_qty'],
                    'quantity' => $inventory['quantity'] ?? 0,
                    'price' => $inventory['price'] ?? ($data['price'] ?? 0),
                    'cost' => $inventory['cost'] ?? 0,
                    'status' => 'low',
                    'expires_at' => $inventory['expires_at'] ?? null,
                ]);

                // Also create DrugInventory record using SKU as the key
                DrugInventory::create([
                    'team_id' => $request->user()->currentTeam->getKey(),
                    'sku' => $sku,
                    'price_list_id' => $item->getKey(),
                    'drug_form_id' => $inventory['drug_form_id'],
                    'min_qty' => $inventory['min_qty'],
                    'quantity' => $inventory['quantity'] ?? 0,
                    'price' => $inventory['price'] ?? ($data['price'] ?? 0),
                    'cost' => $inventory['cost'] ?? 0,
                    'status' => 'low',
                    'expires_at' => $inventory['expires_at'] ?? null,
                ]);
            }
        });

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Product created.']);

        return to_route('products.index', $request->user()->currentTeam->slug);
    }

    /**
     * Update a product.
     */
    public function update(Request $request, string $current_team, PriceList $price_list): RedirectResponse
    {
        abort_unless((int) $price_list->team_id === (int) $request->user()->currentTeam->getKey(), 404);
        abort_unless($this->pharmacyQuery()->whereKey($price_list->getKey())->exists(), 404);

        $price_list->load('inventories');

        $data = $this->validated($request, $price_list);

        DB::transaction(function () use ($request, $price_list, $data): void {
            $price_list->update([
                'name' => $data['name'],
                'price' => $data['is_category'] ? null : ($data['price'] ?? 0),
                'category_id' => $data['category_id'] ?? null,
                'subcategory_id' => $data['subcategory_id'] ?? null,
                'is_category' => (bool) $data['is_category'],
                'is_inventory' => $data['is_category'] ? false : (bool) ($data['is_inventory'] ?? false),
                'uom' => $data['uom'] ?? null,
                'description' => $data['description'] ?? null,
            ]);

            if (! $data['is_category'] && ($data['is_inventory'] ?? false) && ! empty($data['inventory'])) {
                $inventory = $data['inventory'];
                $record = $price_list->inventories->first();
                $sku = $inventory['sku'] ?? $record?->sku ?? $this->generateUniqueSku();
                $attributes = [
                    'sku' => $sku,
                    'drug_form_id' => $inventory['drug_form_id'],
                    'min_qty' => $inventory['min_qty'],
                    'quantity' => $inventory['quantity'] ?? ($record?->quantity ?? 0),
                    'price' => $inventory['price'] ?? ($data['price'] ?? 0),
                    'cost' => $inventory['cost'] ?? ($record?->cost ?? 0),
                    'expires_at' => $inventory['expires_at'] ?? null,
                ];

                if ($record) {
                    $record->update([
                        ...$attributes,
                        'status' => $record->quantity <= $attributes['min_qty'] ? 'low' : 'available',
                    ]);
                } else {
                    Inventory::create([
                        ...$attributes,
                        'team_id' => $request->user()->currentTeam->getKey(),
                        'price_list_id' => $price_list->getKey(),
                        'status' => 'low',
                    ]);
                }

                // Also create or update DrugInventory record using SKU as the key
                $drugInventory = DrugInventory::where('team_id', $request->user()->currentTeam->getKey())
                    ->where('sku', $sku)
                    ->first();

                $drugAttributes = [
                    'sku' => $sku,
                    'price_list_id' => $price_list->getKey(),
                    'drug_form_id' => $inventory['drug_form_id'],
                    'min_qty' => $inventory['min_qty'],
                    'quantity' => $inventory['quantity'] ?? 0,
                    'price' => $inventory['price'] ?? ($data['price'] ?? 0),
                    'cost' => $inventory['cost'] ?? 0,
                    'expires_at' => $inventory['expires_at'] ?? null,
                ];

                if ($drugInventory) {
                    $drugInventory->update([
                        ...$drugAttributes,
                        'status' => ($drugAttributes['quantity'] ?? 0) <= $drugAttributes['min_qty'] ? 'low' : 'available',
                    ]);
                } else {
                    DrugInventory::create([
                        ...$drugAttributes,
                        'team_id' => $request->user()->currentTeam->getKey(),
                        'status' => 'low',
                    ]);
                }
            }
        });

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Product updated.']);

        return to_route('products.index', $request->user()->currentTeam->slug);
    }

    /**
     * Delete a product.
     */
    public function destroy(Request $request, string $current_team, PriceList $price_list): RedirectResponse
    {
        abort_unless((int) $price_list->team_id === (int) $request->user()->currentTeam->getKey(), 404);
        abort_unless($this->pharmacyQuery()->whereKey($price_list->getKey())->exists(), 404);

        $price_list->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Product deleted.']);

        return to_route('products.index', $request->user()->currentTeam->slug);
    }

    /**
     * Create a subcategory under a pharmacy category.
     */
    public function storeSubcategory(Request $request): RedirectResponse
    {
        $teamId = $request->user()->currentTeam->getKey();

        $data = $request->validate([
            'category_id' => ['required', Rule::exists('price_lists', 'id')->where('team_id', $teamId)->whereNull('category_id')],
            'name' => ['required', 'string', 'max:255', Rule::unique('price_lists', 'name')->where('team_id', $teamId)],
        ]);

        PriceList::create([
            'team_id' => $teamId,
            'category_id' => $data['category_id'],
            'name' => $data['name'],
            'is_category' => false,
            'is_inventory' => false,
        ]);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Subcategory created.']);

        return back();
    }

    /**
     * @return array<string, mixed>
     */
    private function validated(Request $request, ?PriceList $existing = null): array
    {
        $teamId = $request->user()->currentTeam->getKey();

        return $request->validate([
            'name' => [
                'required',
                'string',
                'max:255',
                Rule::unique('price_lists', 'name')
                    ->where('team_id', $teamId)
                    ->ignore($existing?->getKey()),
            ],
            'is_category' => ['required', 'boolean'],
            'is_inventory' => ['nullable', 'boolean'],
            'price' => ['nullable', 'numeric', 'min:0'],
            'category_id' => ['nullable', Rule::exists('price_lists', 'id')->where('team_id', $teamId)],
            'subcategory_id' => ['nullable', Rule::exists('price_lists', 'id')->where('team_id', $teamId)],
            'uom' => ['nullable', 'string'],
            'description' => ['nullable', 'string'],
            'inventory' => ['nullable', 'array'],
            'inventory.sku' => [
                'nullable',
                'string',
                'max:255',
                Rule::unique('inventories', 'sku')
                    ->where('team_id', $teamId)
                    ->ignore($existing?->inventories?->first()?->getKey()),
            ],
            'inventory.min_qty' => ['required_if:is_inventory,true', 'nullable', 'numeric', 'min:0'],
            'inventory.quantity' => ['required_if:is_inventory,true', 'nullable', 'numeric', 'min:0'],
            'inventory.price' => ['required_if:is_inventory,true', 'nullable', 'numeric', 'min:0'],
            'inventory.cost' => ['required_if:is_inventory,true', 'nullable', 'numeric', 'min:0'],
            'inventory.drug_form_id' => ['required_if:is_inventory,true', 'nullable', Rule::exists('drug_forms', 'id')->where('team_id', $teamId)],
            'inventory.expires_at' => ['nullable', 'date'],
        ]);
    }

    /**
     * Build the pharmacy products query.
     *
     * @return Builder<PriceList>
     */
    private function pharmacyQuery(): Builder
    {
        return PriceList::query()->where(function (Builder $query): void {
            $query
                ->whereHas('subCategory.category', fn (Builder $query): Builder => $query->where('name', 'Pharmacy'))
                ->orWhereHas('category', fn (Builder $query): Builder => $query->where('name', 'Pharmacy'))
                ->orWhereHas('subCategory', fn (Builder $query): Builder => $query->where('name', 'Pharmacy'))
                ->orWhere(fn (Builder $query): Builder => $query->where('name', 'Pharmacy')->whereNull('category_id'));
        });
    }

    /**
     * @return array<string, mixed>
     */
    private function formOptions(Request $request): array
    {
        $teamId = $request->user()->currentTeam->getKey();

        // Get the Pharmacy category
        $pharmacyCategory = PriceList::query()
            ->where('name', 'Pharmacy')
            ->whereNull('category_id')
            ->where('team_id', $teamId)
            ->first();

        $categories = PriceList::query()
            ->whereNull('category_id')
            ->where('name', 'Pharmacy')
            ->orderBy('name')
            ->get(['id', 'name']);

        // Subcategories: only those under Pharmacy
        $subcategories = PriceList::query()
            ->whereNotNull('category_id')
            ->whereNull('subcategory_id')
            ->where('team_id', $teamId)
            ->orderBy('name')
            ->get(['id', 'name', 'category_id']);

        if ($pharmacyCategory) {
            $subcategories = $subcategories->filter(fn ($sc) => $sc->category_id === $pharmacyCategory->id);
        }

        return [
            'categories' => $categories->map(fn (PriceList $item) => [
                'id' => $item->getKey(),
                'name' => $item->name,
            ])->values(),
            'subcategories' => $subcategories->map(fn (PriceList $item) => [
                'id' => $item->getKey(),
                'name' => $item->name,
                'categoryId' => $item->category_id,
            ])->values(),
            'drugForms' => DrugForm::query()->orderBy('name')->get(['id', 'name'])
                ->map(fn (DrugForm $form) => [
                    'id' => $form->getKey(),
                    'name' => $form->name,
                ])->values(),
            'teamId' => $teamId,
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function listItem(PriceList $item): array
    {
        $firstInventory = $item->inventories->first();

        return [
            'id' => $item->getKey(),
            'name' => $item->name,
            'categoryName' => $item->category?->name,
            'subcategoryName' => $item->subCategory?->name,
            'isCategory' => (bool) $item->is_category,
            'isInventory' => (bool) $item->is_inventory,
            'sku' => $firstInventory?->sku,
            'price' => (float) ($item->price ?? 0),
            'uom' => $item->uom,
            'description' => $item->description,
            'categoryId' => $item->category_id,
            'subcategoryId' => $item->subcategory_id,
            'inventory' => $item->inventories->isNotEmpty()
                ? (function ($inv) {
                    return [
                        'sku' => $inv->sku,
                        'minQty' => (float) $inv->min_qty,
                        'quantity' => (float) ($inv->quantity ?? 0),
                        'price' => (float) ($inv->price ?? 0),
                        'cost' => (float) ($inv->cost ?? 0),
                        'drugFormId' => $inv->drug_form_id,
                        'expiresAt' => $inv->expires_at?->toIso8601String(),
                    ];
                })($item->inventories->first())
                : null,
            'createdAt' => $item->created_at?->toIso8601String(),
            'updatedAt' => $item->updated_at?->toIso8601String(),
        ];
    }

    private function sortBy(Request $request): string
    {
        $sort = (string) $request->query('sort', 'name');

        return \in_array($sort, self::SORTABLE_COLUMNS, true) ? $sort : 'name';
    }

    private function perPage(Request $request): int
    {
        $perPage = (int) $request->query('perPage', 25);

        return in_array($perPage, self::PER_PAGE_OPTIONS, true) ? $perPage : 25;
    }

    /**
     * Count price list items matching a boolean column value, respecting the current filters.
     */
    private function countWhere(Request $request, string $column, bool $value): int
    {
        $query = $this->pharmacyQuery()->where($column, $value);

        $this->applyCommonFilters($query, $request);

        return (int) $query->count();
    }

    /**
     * Count price list items that have a subcategory assigned, respecting the current filters.
     */
    private function countWithSubcategory(Request $request): int
    {
        $query = $this->pharmacyQuery()->whereNotNull('subcategory_id');

        $this->applyCommonFilters($query, $request);

        return (int) $query->count();
    }

    /**
     * Generate a unique 5-digit random SKU.
     */
    private function generateUniqueSku(): string
    {
        $maxAttempts = 10;

        for ($i = 0; $i < $maxAttempts; $i++) {
            $sku = (string) random_int(10000, 99999);

            if (! Inventory::where('sku', $sku)->exists()) {
                return $sku;
            }
        }

        return (string) random_int(10000, 99999);
    }

    /**
     * Apply common search and filter conditions to a price list query.
     */
    private function applyCommonFilters(Builder $query, Request $request): void
    {
        $q = trim((string) $request->query('q', ''));

        if ($q !== '') {
            $like = '%'.$q.'%';

            $query->where(function (Builder $query) use ($like): void {
                $query
                    ->where('name', 'like', $like)
                    ->orWhereHas('category', fn (Builder $q) => $q->where('name', 'like', $like))
                    ->orWhereHas('subCategory', fn (Builder $q) => $q->where('name', 'like', $like));
            });
        }

        $categoryId = trim((string) $request->query('category_id', ''));
        if ($categoryId !== '') {
            $query->where('category_id', $categoryId);
        }

        $subcategoryId = trim((string) $request->query('subcategory_id', ''));
        if ($subcategoryId !== '') {
            $query->where('subcategory_id', $subcategoryId);
        }
    }
}
