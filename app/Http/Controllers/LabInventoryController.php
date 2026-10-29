<?php

namespace App\Http\Controllers;

use App\Models\DrugForm;
use App\Models\Inventory;
use App\Models\LabInventory;
use App\Models\PriceList;
use App\Models\Stock;
use App\Models\User;
use App\Service\DashboardCurrency;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class LabInventoryController extends Controller
{
    /**
     * The pagination sizes that users may pick.
     */
    private const PER_PAGE_OPTIONS = [10, 25, 50, 100];

    /**
     * The columns that may be used to sort the list.
     */
    private const SORTABLE_COLUMNS = [
        'min_qty', 'quantity', 'price', 'cost', 'value', 'profit', 'status', 'expires_at', 'created_at',
    ];

    /**
     * List lab inventory rows for the current team.
     */
    public function index(Request $request): Response
    {
        $filters = [
            'q' => trim((string) $request->query('q', '')),
            'sort' => $this->sortBy($request),
            'direction' => $request->query('direction') === 'asc' ? 'asc' : 'desc',
            'perPage' => $this->perPage($request),
        ];

        $inventories = $this->filteredQuery($filters)
            ->with(['priceList', 'drugForm'])
            ->orderBy($filters['sort'], $filters['direction'])
            ->paginate($filters['perPage'])
            ->withQueryString()
            ->through(fn (LabInventory $inventory) => $this->listItem($inventory));

        return Inertia::render('laboratories/inventories/index', [
            'currencySymbol' => DashboardCurrency::symbol(),
            'inventories' => $inventories,
            'filters' => $filters,
            'summary' => [
                'products' => LabInventory::query()->count(),
                'lowStock' => LabInventory::query()->whereColumn('quantity', '<=', 'min_qty')->count(),
                'expired' => LabInventory::query()->whereNotNull('expires_at')->whereDate('expires_at', '<', today())->count(),
                'expiring' => LabInventory::query()->whereBetween('expires_at', [today(), today()->addDays(30)])->count(),
            ],
            'formOptions' => [
                'priceLists' => PriceList::query()
                    ->where('is_category', false)
                    ->where('is_inventory', true)
                    ->orderBy('name')
                    ->get(['id', 'name'])
                    ->map(fn (PriceList $item) => [
                        'id' => $item->getKey(),
                        'name' => $item->name,
                    ])->values(),
                'drugForms' => DrugForm::query()->orderBy('name')->get(['id', 'name'])
                    ->map(fn (DrugForm $form) => [
                        'id' => $form->getKey(),
                        'name' => $form->name,
                    ])->values(),
            ],
        ]);
    }

    /**
     * Store a lab inventory row.
     */
    public function store(Request $request): RedirectResponse
    {
        $data = $this->validated($request);

        LabInventory::create([
            ...$data,
            'team_id' => $request->user()->currentTeam->getKey(),
            'sku' => $data['sku'] ?? ('SLG-'.strtoupper(str()->random(6))),
            'status' => ((float) $data['quantity']) <= ((float) $data['min_qty']) ? 'low' : 'available',
        ]);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Lab inventory created.']);

        return to_route('lab-inventories.index', $request->user()->currentTeam->slug);
    }

    /**
     * Update a lab inventory row.
     */
    public function update(Request $request, string $current_team, LabInventory $lab_inventory): RedirectResponse
    {
        $data = $this->validated($request, $lab_inventory);

        $quantity = (float) ($data['quantity'] ?? $lab_inventory->quantity);
        $minQty = (float) ($data['min_qty'] ?? $lab_inventory->min_qty);

        $lab_inventory->update([
            ...$data,
            'status' => $quantity <= $minQty ? 'low' : 'available',
        ]);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Lab inventory updated.']);

        return to_route('lab-inventories.index', $request->user()->currentTeam->slug);
    }

    /**
     * Delete a lab inventory row.
     */
    public function destroy(Request $request, string $current_team, LabInventory $lab_inventory): RedirectResponse
    {
        $lab_inventory->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Lab inventory deleted.']);

        return to_route('lab-inventories.index', $request->user()->currentTeam->slug);
    }

    /**
     * Bulk-delete lab inventory rows.
     */
    public function bulkDestroy(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'ids' => ['required', 'array', 'min:1'],
            'ids.*' => ['integer', Rule::exists('lab_inventories', 'id')->where('team_id', $request->user()->currentTeam->getKey())],
        ]);

        LabInventory::query()->whereIn('id', $data['ids'])->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Lab inventory deleted.']);

        return to_route('lab-inventories.index', $request->user()->currentTeam->slug);
    }

    /**
     * Apply a stock adjustment across one or more inventory rows.
     */
    public function adjust(Request $request): RedirectResponse
    {
        $teamId = $request->user()->currentTeam->getKey();

        $data = $request->validate([
            'type' => ['required', Rule::in(['add', 'remove', 'set'])],
            'reason' => ['required', Rule::in(['damaged', 'correction', 'returned', 'donated', 'other'])],
            'items' => ['required', 'array', 'min:1'],
            'items.*.id' => ['required', 'integer', Rule::exists('lab_inventories', 'id')->where('team_id', $teamId)],
            'items.*.quantity' => ['required', 'numeric', 'min:1'],
        ]);

        $failed = [];

        DB::transaction(function () use ($request, $data, &$failed): void {
            foreach ($data['items'] as $item) {
                $record = LabInventory::query()->whereKey($item['id'])->first();

                if (! $record) {
                    continue;
                }

                $before = (float) $record->quantity;
                $qty = (float) $item['quantity'];

                $adjusted = match ($data['type']) {
                    'add' => $before + $qty,
                    'remove' => $before - $qty,
                    'set' => $qty,
                };

                if ($adjusted < 0) {
                    $failed[] = $record->priceList->name ?? (string) $record->getKey();

                    continue;
                }

                $stockQuantity = match ($data['type']) {
                    'add' => $qty,
                    'remove' => -$qty,
                    'set' => $qty - $before,
                };

                $record->update([
                    'quantity' => $adjusted,
                    'status' => $adjusted <= $record->min_qty ? 'low' : 'available',
                ]);

                $inventory = Inventory::query()
                    ->where('price_list_id', $record->price_list_id)
                    ->first();

                if (! $inventory) {
                    $failed[] = $record->priceList->name ?? (string) $record->getKey();

                    continue;
                }

                Stock::create([
                    'team_id' => $request->user()->currentTeam->getKey(),
                    'user_id' => $request->user()->getKey(),
                    'inventory_id' => $inventory->id,
                    'stockable_id' => $record->id,
                    'stockable_type' => LabInventory::class,
                    'quantity' => $stockQuantity,
                    'receivable_id' => $request->user()->getKey(),
                    'receivable_type' => User::class,
                    'status' => $data['reason'],
                ]);
            }
        });

        if ($failed !== []) {
            Inertia::flash('toast', [
                'type' => 'warning',
                'message' => 'Some adjustments were skipped: '.implode(', ', $failed),
            ]);
        } else {
            Inertia::flash('toast', ['type' => 'success', 'message' => 'Stock adjusted successfully.']);
        }

        return to_route('lab-inventories.index', $request->user()->currentTeam->slug);
    }

    /**
     * Store a new drug form inline from the inventory form.
     */
    public function storeDrugForm(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255', Rule::unique('drug_forms', 'name')->where('team_id', $request->user()->currentTeam->getKey())],
        ]);

        DrugForm::create([
            'name' => $data['name'],
            'team_id' => $request->user()->currentTeam->getKey(),
        ]);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Product form created.']);

        return back();
    }

    /**
     * @return array<string, mixed>
     */
    private function validated(Request $request, ?LabInventory $inventory = null): array
    {
        $teamId = $request->user()->currentTeam->getKey();

        return $request->validate([
            'price_list_id' => ['required', Rule::exists('price_lists', 'id')->where('team_id', $teamId)],
            'drug_form_id' => ['required', Rule::exists('drug_forms', 'id')->where('team_id', $teamId)],
            'sku' => ['nullable', 'string', 'max:255'],
            'min_qty' => ['required', 'numeric', 'min:0'],
            'quantity' => ['required', 'numeric', 'min:0'],
            'price' => ['required', 'numeric', 'min:0'],
            'cost' => ['required', 'numeric', 'min:0'],
            'expires_at' => ['nullable', 'date'],
        ]);
    }

    /**
     * @param  array{q: string, sort: string, direction: string, perPage: int}  $filters
     * @return Builder<LabInventory>
     */
    private function filteredQuery(array $filters): Builder
    {
        $query = LabInventory::query();

        if ($filters['q'] !== '') {
            $like = '%'.$filters['q'].'%';

            $query->where(function (Builder $query) use ($like): void {
                $query
                    ->where('sku', 'like', $like)
                    ->orWhere('status', 'like', $like)
                    ->orWhereHas('priceList', fn (Builder $query) => $query->where('name', 'like', $like))
                    ->orWhereHas('drugForm', fn (Builder $query) => $query->where('name', 'like', $like));
            });
        }

        return $query;
    }

    /**
     * @return array<string, mixed>
     */
    private function listItem(LabInventory $inventory): array
    {
        return [
            'id' => $inventory->getKey(),
            'sku' => $inventory->sku,
            'priceListId' => $inventory->price_list_id,
            'priceListName' => $inventory->priceList?->name,
            'drugFormId' => $inventory->drug_form_id,
            'drugFormName' => $inventory->drugForm?->name,
            'minQty' => (float) $inventory->min_qty,
            'quantity' => (float) $inventory->quantity,
            'price' => (float) $inventory->price,
            'cost' => (float) $inventory->cost,
            'value' => (float) ($inventory->value ?? 0),
            'profit' => (float) ($inventory->profit ?? 0),
            'status' => $inventory->status,
            'expiresAt' => $inventory->expires_at?->toIso8601String(),
            'createdAt' => $inventory->created_at?->toIso8601String(),
            'updatedAt' => $inventory->updated_at?->toIso8601String(),
            'isLow' => (float) $inventory->quantity < (float) $inventory->min_qty,
        ];
    }

    private function sortBy(Request $request): string
    {
        $sort = (string) $request->query('sort', 'created_at');

        return in_array($sort, self::SORTABLE_COLUMNS, true) ? $sort : 'created_at';
    }

    private function perPage(Request $request): int
    {
        $perPage = (int) $request->query('perPage', 25);

        return in_array($perPage, self::PER_PAGE_OPTIONS, true) ? $perPage : 25;
    }
}
