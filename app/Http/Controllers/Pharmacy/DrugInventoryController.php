<?php

namespace App\Http\Controllers\Pharmacy;

use App\Http\Controllers\Controller;
use App\Models\DrugForm;
use App\Models\DrugInventory;
use App\Models\Inventory;
use App\Models\PriceList;
use App\Models\Stock;
use App\Models\User;
use App\Service\DashboardCurrency;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class DrugInventoryController extends Controller
{
    /**
     * Export the medication stock records of the current team.
     */
    public function export(Request $request): StreamedResponse
    {
        $items = DrugInventory::query()
            ->with(['priceList', 'drugForm'])
            ->orderBy('price_list_id')
            ->get();

        $teamName = $request->user()->currentTeam->name;

        return response()->streamDownload(function () use ($items, $teamName): void {
            $stream = fopen('php://output', 'w');
            fputcsv($stream, ['Team', 'SKU', 'Product', 'Product form', 'Minimum quantity', 'Quantity', 'Price', 'Cost', 'Value', 'Profit', 'Status', 'Expires at', 'Created at', 'Updated at']);

            foreach ($items as $item) {
                fputcsv($stream, [
                    $teamName,
                    $item->sku,
                    $item->priceList?->name,
                    $item->drugForm?->name,
                    $item->min_qty,
                    $item->quantity,
                    $item->price,
                    $item->cost,
                    $item->value,
                    $item->profit,
                    $item->status,
                    $item->expires_at,
                    $item->created_at,
                    $item->updated_at,
                ]);
            }

            fclose($stream);
        }, 'pharmacy-inventory-export.csv', ['Content-Type' => 'text/csv']);
    }

    /**
     * Show pharmacy stock, movement history, and medication options.
     */
    public function index(Request $request): Response
    {
        $filters = [
            'q' => trim((string) $request->query('q', '')),
            'status' => in_array($request->query('status'), ['low', 'stocked', 'available', 'expired', 'expiring'], true)
                ? $request->query('status')
                : 'all',
            'perPage' => in_array((int) $request->query('perPage', 25), [10, 25, 50, 100, 0], true)
                ? (int) $request->query('perPage', 25)
                : 25,
        ];

        $inventories = DrugInventory::query()
            ->with(['priceList', 'drugForm'])
            ->when($filters['q'] !== '', function (Builder $query) use ($filters): void {
                $like = '%'.$filters['q'].'%';
                $query->where(function (Builder $query) use ($like): void {
                    $query->where('sku', 'like', $like)
                        ->orWhereHas('priceList', fn (Builder $query) => $query->where('name', 'like', $like))
                        ->orWhereHas('drugForm', fn (Builder $query) => $query->where('name', 'like', $like));
                });
            })
            ->when(in_array($filters['status'], ['low', 'stocked', 'available'], true), fn (Builder $query) => $query->where('status', $filters['status']))
            ->when($filters['status'] === 'expired', fn (Builder $query) => $query->whereNotNull('expires_at')->whereDate('expires_at', '<', today()))
            ->when($filters['status'] === 'expiring', fn (Builder $query) => $query->whereBetween('expires_at', [today(), today()->addDays(30)]))
            ->orderBy('price_list_id')
            ->paginate($filters['perPage'] > 0 ? $filters['perPage'] : 100)
            ->withQueryString()
            ->through(fn (DrugInventory $inventory) => $this->present($inventory));

        return Inertia::render('pharmacy/inventories/index', [
            'currencySymbol' => DashboardCurrency::symbol(),
            'inventories' => $inventories,
            'stockMovements' => $this->stockMovements(),
            'filters' => $filters,
            'formOptions' => [
                'priceLists' => PriceList::query()
                    ->where('is_inventory', true)
                    ->whereHas('subCategory.category', fn (Builder $query) => $query->where('name', 'Pharmacy'))
                    ->orderBy('name')
                    ->get(['id', 'name']),
                'drugForms' => DrugForm::query()->orderBy('name')->get(['id', 'name']),
            ],
            'summary' => [
                'products' => DrugInventory::query()->count(),
                'lowStock' => DrugInventory::query()->whereColumn('quantity', '<=', 'min_qty')->count(),
                'expired' => DrugInventory::query()->whereNotNull('expires_at')->whereDate('expires_at', '<', today())->count(),
                'expiring' => DrugInventory::query()->whereBetween('expires_at', [today(), today()->addDays(30)])->count(),
            ],
        ]);
    }

    /**
     * Show a single medication stock record with its movement history.
     */
    public function show(Request $request, string $current_team, DrugInventory $drug_inventory): Response
    {
        $drug_inventory->load(['priceList', 'drugForm']);

        $movements = Stock::query()
            ->where('stockable_type', DrugInventory::class)
            ->where('stockable_id', $drug_inventory->getKey())
            ->with('user')
            ->latest()
            ->limit(50)
            ->get()
            ->map(fn (Stock $stock) => [
                'id' => $stock->getKey(),
                'quantity' => (float) $stock->quantity,
                'status' => $stock->status,
                'user' => $stock->user?->name,
                'createdAt' => $stock->created_at?->toIso8601String(),
            ]);

        return Inertia::render('pharmacy/inventories/show', [
            'currencySymbol' => DashboardCurrency::symbol(),
            'inventory' => $this->present($drug_inventory),
            'movements' => $movements,
        ]);
    }

    /**
     * Show the medication stock edit form.
     */
    public function edit(Request $request, string $current_team, DrugInventory $drug_inventory): Response
    {
        $drug_inventory->load(['priceList', 'drugForm']);

        return Inertia::render('pharmacy/inventories/edit', [
            'inventory' => $this->present($drug_inventory),
            'formOptions' => [
                'priceLists' => PriceList::query()
                    ->where('is_inventory', true)
                    ->whereHas('subCategory.category', fn (Builder $query) => $query->where('name', 'Pharmacy'))
                    ->orderBy('name')
                    ->get(['id', 'name']),
                'drugForms' => DrugForm::query()->orderBy('name')->get(['id', 'name']),
            ],
        ]);
    }

    /**
     * Add a medication stock record.
     */
    public function store(Request $request): RedirectResponse
    {
        $data = $this->validated($request);
        $teamId = $request->user()->currentTeam->getKey();

        DrugInventory::create([
            ...$data,
            'team_id' => $teamId,
            'sku' => $data['sku'] ?: 'DRG-'.str()->upper(str()->random(6)),
            'status' => (float) $data['quantity'] <= (float) $data['min_qty'] ? 'low' : 'available',
        ]);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Medication stock added.']);

        return to_route('pharmacy.inventories.index', $request->user()->currentTeam->slug);
    }

    /**
     * Update a medication stock record.
     */
    public function update(Request $request, string $current_team, DrugInventory $drug_inventory): RedirectResponse
    {
        $data = $this->validated($request);
        $quantity = (float) ($data['quantity'] ?? $drug_inventory->quantity);
        $minQty = (float) ($data['min_qty'] ?? $drug_inventory->min_qty);

        $drug_inventory->update([
            ...$data,
            'status' => $quantity <= $minQty ? 'low' : 'available',
        ]);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Medication stock updated.']);

        return to_route('pharmacy.inventories.index', $request->user()->currentTeam->slug);
    }

    /**
     * Delete a medication stock record that has no stock movement history.
     */
    public function destroy(Request $request, string $current_team, DrugInventory $drug_inventory): RedirectResponse
    {
        abort_if(Stock::query()
            ->where('stockable_type', DrugInventory::class)
            ->where('stockable_id', $drug_inventory->getKey())
            ->exists(), 409, 'This medication has stock history and cannot be deleted.');
        $drug_inventory->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Medication stock deleted.']);

        return to_route('pharmacy.inventories.index', $request->user()->currentTeam->slug);
    }

    /**
     * Delete multiple medication stock records.
     */
    public function bulkDestroy(Request $request): RedirectResponse
    {
        $teamId = $request->user()->currentTeam->getKey();
        $data = $request->validate([
            'ids' => ['required', 'array', 'min:1'],
            'ids.*' => ['integer', Rule::exists('drug_inventories', 'id')->where('team_id', $teamId)],
        ]);

        $blocked = Stock::query()
            ->where('stockable_type', DrugInventory::class)
            ->whereIn('stockable_id', $data['ids'])
            ->pluck('stockable_id')
            ->all();

        $deletable = array_values(array_diff($data['ids'], $blocked));

        DrugInventory::query()->whereIn('id', $deletable)->delete();

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => count($blocked) > 0
                ? count($deletable).' medication records deleted; '.count($blocked).' skipped due to stock history.'
                : count($deletable).' medication records deleted.',
        ]);

        return to_route('pharmacy.inventories.index', $request->user()->currentTeam->slug);
    }

    /**
     * Adjust stock for selected medications and record each movement.
     */
    public function adjust(Request $request): RedirectResponse
    {
        $teamId = $request->user()->currentTeam->getKey();
        $data = $request->validate([
            'type' => ['required', Rule::in(['add', 'remove', 'set'])],
            'reason' => ['required', Rule::in(['received', 'dispensed', 'damaged', 'correction', 'returned', 'donated', 'other'])],
            'items' => ['required', 'array', 'min:1'],
            'items.*.id' => ['required', 'integer', Rule::exists('drug_inventories', 'id')->where('team_id', $teamId)],
            'items.*.quantity' => ['required', 'numeric', 'min:0.01'],
        ]);

        DB::transaction(function () use ($request, $data, $teamId): void {
            foreach ($data['items'] as $item) {
                $inventory = DrugInventory::query()->lockForUpdate()->whereKey($item['id'])->firstOrFail();
                $change = (float) $item['quantity'];
                $previousQuantity = (float) $inventory->quantity;
                $nextQuantity = match ($data['type']) {
                    'add' => $previousQuantity + $change,
                    'remove' => $previousQuantity - $change,
                    'set' => $change,
                };

                abort_if($nextQuantity < 0, 422, 'Stock quantity cannot be negative.');

                $inventory->update([
                    'quantity' => $nextQuantity,
                    'status' => $nextQuantity <= (float) $inventory->min_qty ? 'low' : 'available',
                ]);

                $parentInventory = Inventory::query()->where('price_list_id', $inventory->price_list_id)->first();
                abort_unless($parentInventory, 422, 'The medication does not have a linked inventory record.');

                $delta = $nextQuantity - $previousQuantity;
                Stock::create([
                    'team_id' => $teamId,
                    'user_id' => $request->user()->getKey(),
                    'inventory_id' => $parentInventory->getKey(),
                    'stockable_id' => $inventory->getKey(),
                    'stockable_type' => DrugInventory::class,
                    'receivable_id' => $request->user()->getKey(),
                    'receivable_type' => User::class,
                    'quantity' => $delta,
                    'status' => $data['reason'],
                ]);
            }
        });

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Pharmacy stock adjusted.']);

        return to_route('pharmacy.inventories.index', $request->user()->currentTeam->slug);
    }

    /**
     * Validate medication inventory attributes against the active team.
     *
     * @return array<string, mixed>
     */
    private function validated(Request $request): array
    {
        $teamId = $request->user()->currentTeam->getKey();

        return $request->validate([
            'sku' => ['nullable', 'string', 'max:255'],
            'price_list_id' => [
                'required',
                Rule::exists('price_lists', 'id')->where('team_id', $teamId)->where('is_inventory', true),
                function (string $attribute, mixed $value, \Closure $fail): void {
                    $isPharmacyMedication = PriceList::query()
                        ->whereKey($value)
                        ->where('is_inventory', true)
                        ->whereHas('subCategory.category', fn (Builder $query) => $query->where('name', 'Pharmacy'))
                        ->exists();

                    if (! $isPharmacyMedication) {
                        $fail('Select a medication from the Pharmacy catalog.');
                    }
                },
            ],
            'drug_form_id' => ['required', Rule::exists('drug_forms', 'id')->where('team_id', $teamId)],
            'min_qty' => ['required', 'integer', 'min:0'],
            'quantity' => ['required', 'numeric', 'min:0'],
            'price' => ['required', 'numeric', 'min:0'],
            'cost' => ['required', 'numeric', 'min:0'],
            'expires_at' => ['nullable', 'date'],
        ]);
    }

    /**
     * Present a medication stock record for the frontend.
     *
     * @return array<string, mixed>
     */
    private function present(DrugInventory $inventory): array
    {
        return [
            'id' => $inventory->getKey(),
            'sku' => $inventory->sku,
            'name' => $inventory->priceList->name ?? 'Medication',
            'drugFormId' => $inventory->drug_form_id,
            'drugForm' => $inventory->drugForm?->name,
            'priceListId' => $inventory->price_list_id,
            'quantity' => (float) $inventory->quantity,
            'minQty' => (int) $inventory->min_qty,
            'price' => (float) $inventory->price,
            'cost' => (float) $inventory->cost,
            'value' => (float) $inventory->value,
            'profit' => (float) $inventory->profit,
            'status' => $inventory->status,
            'expiresAt' => $inventory->expires_at?->toDateString(),
        ];
    }

    /**
     * Latest medication stock movements for the workspace.
     *
     * @return Collection<int, array<string, mixed>>
     */
    private function stockMovements(): Collection
    {
        return Stock::query()
            ->where('stockable_type', DrugInventory::class)
            ->with(['inventory.priceList', 'user'])
            ->latest()
            ->limit(20)
            ->get()
            ->map(fn (Stock $stock) => [
                'id' => $stock->getKey(),
                'medication' => $stock->inventory?->priceList->name ?? 'Medication',
                'quantity' => (float) $stock->quantity,
                'status' => $stock->status,
                'user' => $stock->user?->name,
                'createdAt' => $stock->created_at?->toIso8601String(),
            ]);
    }
}
