<?php

namespace App\Http\Controllers;

use App\Models\DrugForm;
use App\Models\Inventory;
use App\Models\PriceList;
use App\Service\DashboardCurrency;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class LabIntakeController extends Controller
{
    /**
     * The pagination sizes that users may pick.
     */
    private const PER_PAGE_OPTIONS = [10, 25, 50, 100];

    /**
     * The columns that may be used to sort the list.
     */
    private const SORTABLE_COLUMNS = ['name', 'price', 'created_at', 'updated_at'];

    /**
     * List laboratory catalog items (intake / price list).
     */
    public function index(Request $request): Response
    {
        return $this->renderCatalog($request, true);
    }

    /** List all price list categories, services, products and parameters. */
    public function allIndex(Request $request): Response
    {
        return $this->renderCatalog($request, false);
    }

    private function renderCatalog(Request $request, bool $laboratoryOnly): Response
    {
        $filters = [
            'q' => trim((string) $request->query('q', '')),
            'categoryId' => trim((string) $request->query('category_id', '')),
            'subcategoryId' => trim((string) $request->query('subcategory_id', '')),
            'sort' => $this->sortBy($request),
            'direction' => $request->query('direction') === 'asc' ? 'asc' : 'desc',
            'perPage' => $this->perPage($request),
        ];

        $query = $laboratoryOnly ? $this->catalogQuery() : PriceList::query();
        $items = $query
            ->when($filters['q'] !== '', function (Builder $query) use ($filters): void {
                $like = '%'.$filters['q'].'%';

                $query->where(function (Builder $query) use ($like): void {
                    $query
                        ->where('name', 'like', $like)
                        ->orWhereHas('category', fn (Builder $query) => $query->where('name', 'like', $like))
                        ->orWhereHas('subCategory', fn (Builder $query) => $query->where('name', 'like', $like))
                        ->orWhereHas('parameter', fn (Builder $query) => $query->where('name', 'like', $like));
                });
            })
            ->when($filters['categoryId'] !== '', fn (Builder $query) => $query->where('category_id', $filters['categoryId']))
            ->when($filters['subcategoryId'] !== '', fn (Builder $query) => $query->where('subcategory_id', $filters['subcategoryId']))
            ->with(['category', 'subCategory', 'parameter', 'inventories.drugForm', 'parameters'])
            ->orderBy($filters['sort'], $filters['direction'])
            ->paginate($filters['perPage'])
            ->withQueryString()
            ->through(fn (PriceList $item) => $this->listItem($item));

        $summary = [
            'categories' => $this->countWhere($request, 'is_category', true),
            'subcategories' => $this->countWithSubcategory($request),
            'items' => $this->countWhere($request, 'is_category', false),
            'inventoryLinked' => $this->countWhere($request, 'is_inventory', true),
        ];

        return Inertia::render($laboratoryOnly ? 'laboratories/intake/index' : 'price-lists/index', [
            'currencySymbol' => DashboardCurrency::symbol(),
            'items' => $items,
            'filters' => $filters,
            'formOptions' => $this->formOptions($request),
            'summary' => $summary,
        ]);
    }

    /**
     * Create a laboratory catalog item (or category / subcategory).
     */
    public function store(Request $request): RedirectResponse
    {
        return $this->storeCatalogItem($request, 'lab-intake.index');
    }

    public function storeAll(Request $request): RedirectResponse
    {
        return $this->storeCatalogItem($request, 'price-lists.index');
    }

    private function storeCatalogItem(Request $request, string $redirectRoute): RedirectResponse
    {
        $data = $this->validated($request);

        DB::transaction(function () use ($request, $data): void {
            $item = PriceList::create([
                'team_id' => $request->user()->currentTeam->getKey(),
                'name' => $data['name'],
                'ranges' => $data['ranges'] ?? null,
                'price' => $data['is_category'] ? null : ($data['price'] ?? 0),
                'result_type' => $data['is_category'] ? null : ($data['result_type'] ?? 'text'),
                'options' => $this->normalizeOptions($data),
                'category_id' => $data['category_id'] ?? null,
                'subcategory_id' => $data['subcategory_id'] ?? null,
                'is_category' => (bool) $data['is_category'],
                'is_inventory' => $data['is_category'] ? false : (bool) ($data['is_inventory'] ?? false),
                'uom' => $data['uom'] ?? null,
                'description' => $data['description'] ?? null,
            ]);

            if (! $data['is_category'] && ! empty($data['parameters'])) {
                foreach ($data['parameters'] as $parameter) {
                    $item->parameters()->create([
                        'team_id' => $request->user()->currentTeam->getKey(),
                        'name' => $parameter['name'],
                        'ranges' => $parameter['ranges'] ?? null,
                        'uom' => $parameter['uom'] ?? null,
                        'result_type' => $parameter['result_type'] ?? 'text',
                        'options' => $this->normalizeParameterOptions($parameter),
                        'category_id' => $data['category_id'] ?? null,
                        'subcategory_id' => $data['subcategory_id'] ?? null,
                        'is_category' => false,
                        'is_inventory' => false,
                        'price' => 0,
                    ]);
                }
            }

            if (! $data['is_category'] && ($data['is_inventory'] ?? false) && ! empty($data['inventory'])) {
                $inventory = $data['inventory'];

                Inventory::create([
                    'team_id' => $request->user()->currentTeam->getKey(),
                    'sku' => $inventory['sku'] ?? ('SLG-'.Str::upper(Str::random(6))),
                    'price_list_id' => $item->getKey(),
                    'drug_form_id' => $inventory['drug_form_id'],
                    'min_qty' => $inventory['min_qty'],
                    'quantity' => 0,
                    'price' => $data['price'] ?? 0,
                    'cost' => 0,
                    'status' => 'low',
                    'expires_at' => $inventory['expires_at'] ?? null,
                ]);
            }
        });

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Catalog item created.']);

        return to_route($redirectRoute, $request->user()->currentTeam->slug);
    }

    /**
     * Update a laboratory catalog item.
     */
    public function update(Request $request, string $current_team, PriceList $price_list): RedirectResponse
    {
        abort_unless($this->belongsToLaboratoryCatalog($price_list), 404);

        return $this->updateCatalogItem($request, $current_team, $price_list, 'lab-intake.index');
    }

    public function updateAll(Request $request, string $current_team, PriceList $price_list): RedirectResponse
    {
        return $this->updateCatalogItem($request, $current_team, $price_list, 'price-lists.index');
    }

    private function updateCatalogItem(Request $request, string $current_team, PriceList $price_list, string $redirectRoute): RedirectResponse
    {
        abort_unless((int) $price_list->team_id === (int) $request->user()->currentTeam->getKey(), 404);

        $data = $this->validated($request, $price_list);

        DB::transaction(function () use ($request, $price_list, $data): void {
            $price_list->update([
                'name' => $data['name'],
                'ranges' => $data['ranges'] ?? null,
                'price' => $data['is_category'] ? null : ($data['price'] ?? 0),
                'result_type' => $data['is_category'] ? null : ($data['result_type'] ?? 'text'),
                'options' => $this->normalizeOptions($data),
                'category_id' => $data['category_id'] ?? null,
                'subcategory_id' => $data['subcategory_id'] ?? null,
                'is_category' => (bool) $data['is_category'],
                'is_inventory' => $data['is_category'] ? false : (bool) ($data['is_inventory'] ?? false),
                'uom' => $data['uom'] ?? null,
                'description' => $data['description'] ?? null,
            ]);

            if (! $data['is_category'] && array_key_exists('parameters', $data)) {
                $price_list->parameters()->delete();

                foreach ($data['parameters'] ?? [] as $parameter) {
                    $price_list->parameters()->create([
                        'team_id' => $request->user()->currentTeam->getKey(),
                        'name' => $parameter['name'],
                        'ranges' => $parameter['ranges'] ?? null,
                        'uom' => $parameter['uom'] ?? null,
                        'result_type' => $parameter['result_type'] ?? 'text',
                        'options' => $this->normalizeParameterOptions($parameter),
                        'category_id' => $data['category_id'] ?? null,
                        'subcategory_id' => $data['subcategory_id'] ?? null,
                        'is_category' => false,
                        'is_inventory' => false,
                        'price' => 0,
                    ]);
                }
            }

            if (! $data['is_category'] && ($data['is_inventory'] ?? false) && ! empty($data['inventory'])) {
                $inventory = $data['inventory'];
                $record = $price_list->inventory()->first();
                $attributes = [
                    'sku' => $inventory['sku'] ?: ('SLG-'.Str::upper(Str::random(6))),
                    'drug_form_id' => $inventory['drug_form_id'],
                    'min_qty' => $inventory['min_qty'],
                    'price' => $data['price'] ?? 0,
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
                        'quantity' => 0,
                        'cost' => 0,
                        'status' => 'low',
                    ]);
                }
            }
        });

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Catalog item updated.']);

        return to_route($redirectRoute, $request->user()->currentTeam->slug);
    }

    /**
     * Delete a laboratory catalog item.
     */
    public function destroy(Request $request, string $current_team, PriceList $price_list): RedirectResponse
    {
        abort_unless($this->belongsToLaboratoryCatalog($price_list), 404);

        return $this->destroyCatalogItem($request, $price_list, 'lab-intake.index');
    }

    public function destroyAll(Request $request, string $current_team, PriceList $price_list): RedirectResponse
    {
        abort_unless((int) $price_list->team_id === (int) $request->user()->currentTeam->getKey(), 404);

        return $this->destroyCatalogItem($request, $price_list, 'price-lists.index');
    }

    private function destroyCatalogItem(Request $request, PriceList $price_list, string $redirectRoute): RedirectResponse
    {

        $price_list->parameters()->delete();
        $price_list->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Catalog item deleted.']);

        return to_route($redirectRoute, $request->user()->currentTeam->slug);
    }

    /**
     * Create a subcategory under a laboratory category.
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
            'ranges' => ['nullable', 'string'],
            'price' => ['nullable', 'numeric', 'min:0'],
            'result_type' => ['nullable', Rule::in(['radio', 'number', 'text', 'select'])],
            'options' => ['nullable', 'array'],
            'options.*.label' => ['required_with:options', 'string'],
            'category_id' => ['nullable', Rule::exists('price_lists', 'id')->where('team_id', $teamId)],
            'subcategory_id' => ['nullable', Rule::exists('price_lists', 'id')->where('team_id', $teamId)],
            'uom' => ['nullable', 'string'],
            'description' => ['nullable', 'string'],
            'parameters' => ['nullable', 'array'],
            'parameters.*.name' => ['required_with:parameters', 'string'],
            'parameters.*.ranges' => ['nullable', 'string'],
            'parameters.*.uom' => ['nullable', 'string'],
            'parameters.*.result_type' => ['nullable', Rule::in(['radio', 'number', 'text', 'select'])],
            'parameters.*.options' => ['nullable', 'array'],
            'parameters.*.options.*.label' => ['required_with:parameters.*.options', 'string'],
            'inventory' => ['nullable', 'array'],
            'inventory.sku' => [
                'nullable',
                'string',
                'max:255',
                Rule::unique('inventories', 'sku')
                    ->where('team_id', $teamId)
                    ->ignore($existing?->inventory?->getKey()),
            ],
            'inventory.min_qty' => ['required_if:is_inventory,true', 'nullable', 'numeric', 'min:0'],
            'inventory.drug_form_id' => ['required_if:is_inventory,true', 'nullable', Rule::exists('drug_forms', 'id')->where('team_id', $teamId)],
            'inventory.expires_at' => ['nullable', 'date'],
        ]);
    }

    /**
     * @param  array<string, mixed>  $data
     * @return list<array{label: string}>|null
     */
    private function normalizeOptions(array $data): ?array
    {
        if (($data['result_type'] ?? null) !== 'select') {
            return null;
        }

        /** @var array<int, mixed> $options */
        $options = $data['options'] ?? [];

        return collect($options)
            ->map(fn ($option) => ['label' => is_array($option) ? (string) ($option['label'] ?? '') : (string) $option])
            ->filter(fn (array $option) => $option['label'] !== '')
            ->values()
            ->all();
    }

    /**
     * @param  array<string, mixed>  $parameter
     * @return list<array{label: string}>|null
     */
    private function normalizeParameterOptions(array $parameter): ?array
    {
        if (($parameter['result_type'] ?? null) !== 'select') {
            return null;
        }

        /** @var array<int, mixed> $options */
        $options = $parameter['options'] ?? [];

        return collect($options)
            ->map(fn ($option) => ['label' => is_array($option) ? (string) ($option['label'] ?? '') : (string) $option])
            ->filter(fn (array $option) => $option['label'] !== '')
            ->values()
            ->all();
    }

    /**
     * Build the laboratory catalog query.
     *
     * @return Builder<PriceList>
     */
    private function catalogQuery(): Builder
    {
        return PriceList::query()->where(function (Builder $query): void {
            $query
                ->whereHas('subCategory.category', fn (Builder $query): Builder => $query->where('name', 'Laboratory'))
                ->orWhereHas('category', fn (Builder $query): Builder => $query->where('name', 'Laboratory'))
                ->orWhereHas('subCategory', fn (Builder $query): Builder => $query->where('name', 'Laboratory'))
                ->orWhere(fn (Builder $query): Builder => $query->where('name', 'Laboratory')->whereNull('category_id'));
        });
    }

    private function belongsToLaboratoryCatalog(PriceList $item): bool
    {
        return $this->catalogQuery()->whereKey($item->getKey())->exists();
    }

    /**
     * @return array<string, mixed>
     */
    private function formOptions(Request $request): array
    {
        $teamId = $request->user()->currentTeam->getKey();

        $categories = PriceList::query()
            ->whereNull('category_id')
            ->orderBy('name')
            ->get(['id', 'name']);

        $subcategories = PriceList::query()
            ->whereNotNull('category_id')
            ->whereNull('subcategory_id')
            ->orderBy('name')
            ->get(['id', 'name', 'category_id']);

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
            'resultTypes' => [
                ['value' => 'radio', 'label' => 'Positive / Negative (Radio)'],
                ['value' => 'number', 'label' => 'Numeric value'],
                ['value' => 'text', 'label' => 'Free text'],
                ['value' => 'select', 'label' => 'Dropdown options'],
            ],
            'teamId' => $teamId,
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function listItem(PriceList $item): array
    {
        return [
            'id' => $item->getKey(),
            'name' => $item->name,
            'categoryName' => $item->category?->name,
            'subcategoryName' => $item->subCategory?->name,
            'parameterName' => $item->parameter?->name,
            'isCategory' => (bool) $item->is_category,
            'isInventory' => (bool) $item->is_inventory,
            'price' => (float) ($item->price ?? 0),
            'ranges' => $item->ranges,
            'uom' => $item->uom,
            'description' => $item->description,
            'resultType' => $item->result_type,
            'options' => $item->options,
            'categoryId' => $item->category_id,
            'subcategoryId' => $item->subcategory_id,
            'parameters' => $item->parameters->map(fn (PriceList $parameter) => [
                'id' => $parameter->getKey(),
                'name' => $parameter->name,
                'ranges' => $parameter->ranges,
                'uom' => $parameter->uom,
                'resultType' => $parameter->result_type,
                'options' => $parameter->options,
            ])->values(),
            'inventory' => $item->inventory ? [
                'sku' => $item->inventory->sku,
                'minQty' => (float) $item->inventory->min_qty,
                'drugFormId' => $item->inventory->drug_form_id,
                'expiresAt' => $item->inventory->expires_at?->toIso8601String(),
            ] : null,
            'createdAt' => $item->created_at?->toIso8601String(),
            'updatedAt' => $item->updated_at?->toIso8601String(),
        ];
    }

    private function sortBy(Request $request): string
    {
        $sort = (string) $request->query('sort', 'name');

        return in_array($sort, self::SORTABLE_COLUMNS, true) ? $sort : 'name';
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
        $query = $this->catalogQuery()->where($column, $value);

        $this->applyCommonFilters($query, $request);

        return (int) $query->count();
    }

    /**
     * Count price list items that have a subcategory assigned, respecting the current filters.
     */
    private function countWithSubcategory(Request $request): int
    {
        $query = $this->catalogQuery()->whereNotNull('subcategory_id');

        $this->applyCommonFilters($query, $request);

        return (int) $query->count();
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
