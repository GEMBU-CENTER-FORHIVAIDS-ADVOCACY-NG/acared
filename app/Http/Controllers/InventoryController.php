<?php

namespace App\Http\Controllers;

use App\Models\DrugForm;
use App\Models\DrugInventory;
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
use Symfony\Component\HttpFoundation\StreamedResponse;

class InventoryController extends Controller
{
    public function export(Request $request): StreamedResponse
    {
        $items = Inventory::query()
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
        }, 'inventory-export.csv', ['Content-Type' => 'text/csv']);
    }

    public function index(Request $request): Response
    {
        $filters = [
            'q' => trim((string) $request->query('q', '')),
            'status' => in_array($request->query('status'), ['low', 'stocked', 'available', 'expired', 'expiring'], true)
                ? $request->query('status')
                : 'all',
            'perPage' => in_array((int) $request->query('perPage', 25), [10, 25, 50, 100], true)
                ? (int) $request->query('perPage', 25)
                : 25,
        ];

        $inventories = Inventory::query()
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
            ->paginate($filters['perPage'])
            ->withQueryString()
            ->through(fn (Inventory $inventory) => $this->present($inventory));

        return Inertia::render('inventory/stock/index', [
            'currencySymbol' => DashboardCurrency::symbol(),
            'inventories' => $inventories,
            'filters' => $filters,
            'formOptions' => [
                'priceLists' => PriceList::query()->where('is_inventory', true)->orderBy('name')->get(['id', 'name']),
                'drugForms' => DrugForm::query()->orderBy('name')->get(['id', 'name']),
                'users' => $request->user()->currentTeam->members()->orderBy('name')->get(['users.id', 'users.name']),
            ],
            'summary' => [
                'products' => Inventory::query()->count(),
                'lowStock' => Inventory::query()->whereColumn('quantity', '<=', 'min_qty')->count(),
                'expired' => Inventory::query()->whereNotNull('expires_at')->whereDate('expires_at', '<', today())->count(),
                'expiring' => Inventory::query()->whereBetween('expires_at', [today(), today()->addDays(30)])->count(),
            ],
        ]);
    }

    public function show(string $current_team, Inventory $inventory): Response
    {
        $inventory->load(['priceList', 'drugForm']);
        $movements = Stock::query()
            ->where('stockable_type', Inventory::class)
            ->where('stockable_id', $inventory->getKey())
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

        return Inertia::render('inventory/stock/show', [
            'currencySymbol' => DashboardCurrency::symbol(),
            'inventory' => $this->present($inventory),
            'movements' => $movements,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $this->validated($request);
        $teamId = $request->user()->currentTeam->getKey();

        Inventory::create([
            ...$data,
            'team_id' => $teamId,
            'sku' => $data['sku'] ?: 'INV-'.str()->upper(str()->random(6)),
            'status' => (float) $data['quantity'] <= (float) $data['min_qty'] ? 'low' : 'available',
        ]);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Inventory item created.']);

        return to_route('inventory.stock.index', $request->user()->currentTeam->slug);
    }

    public function update(Request $request, string $current_team, Inventory $inventory): RedirectResponse
    {
        $data = $this->validated($request);
        $quantity = (float) ($data['quantity'] ?? $inventory->quantity);
        $minQty = (float) ($data['min_qty'] ?? $inventory->min_qty);

        $inventory->update([
            ...$data,
            'status' => $quantity <= $minQty ? 'low' : 'available',
        ]);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Inventory item updated.']);

        return to_route('inventory.stock.index', $request->user()->currentTeam->slug);
    }

    public function destroy(Request $request, string $current_team, Inventory $inventory): RedirectResponse
    {
        abort_if($this->hasMovements($inventory), 409, 'This inventory item has stock history and cannot be deleted.');
        $inventory->delete();

        return to_route('inventory.stock.index', $request->user()->currentTeam->slug);
    }

    public function bulkDestroy(Request $request): RedirectResponse
    {
        $teamId = $request->user()->currentTeam->getKey();
        $data = $request->validate([
            'ids' => ['required', 'array', 'min:1'],
            'ids.*' => ['integer', Rule::exists('inventories', 'id')->where('team_id', $teamId)],
        ]);
        $blocked = Stock::query()->where('stockable_type', Inventory::class)->whereIn('stockable_id', $data['ids'])->pluck('stockable_id')->all();
        $deletable = array_values(array_diff($data['ids'], $blocked));
        Inventory::query()->whereIn('id', $deletable)->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => count($blocked) > 0
            ? count($deletable).' inventory items deleted; '.count($blocked).' skipped due to stock history.'
            : count($deletable).' inventory items deleted.']);

        return to_route('inventory.stock.index', $request->user()->currentTeam->slug);
    }

    public function adjust(Request $request): RedirectResponse
    {
        $teamId = $request->user()->currentTeam->getKey();
        $data = $request->validate([
            'type' => ['required', Rule::in(['add', 'remove', 'set'])],
            'reason' => ['required', Rule::in(['damaged', 'correction', 'returned', 'donated', 'other'])],
            'items' => ['required', 'array', 'min:1'],
            'items.*.id' => ['required', 'integer', Rule::exists('inventories', 'id')->where('team_id', $teamId)],
            'items.*.quantity' => ['required', 'numeric', 'min:0.01'],
        ]);

        DB::transaction(function () use ($request, $data, $teamId): void {
            foreach ($data['items'] as $item) {
                $inventory = Inventory::query()->lockForUpdate()->whereKey($item['id'])->firstOrFail();
                $before = (float) $inventory->quantity;
                $amount = (float) $item['quantity'];
                $after = match ($data['type']) {
                    'add' => $before + $amount,
                    'remove' => $before - $amount,
                    'set' => $amount,
                };
                abort_if($after < 0, 422, 'Stock quantity cannot be negative.');

                $inventory->update([
                    'quantity' => $after,
                    'status' => $after <= (float) $inventory->min_qty ? 'low' : 'available',
                ]);

                Stock::create([
                    'team_id' => $teamId,
                    'user_id' => $request->user()->getKey(),
                    'inventory_id' => $inventory->getKey(),
                    'stockable_id' => $inventory->getKey(),
                    'stockable_type' => Inventory::class,
                    'receivable_id' => $request->user()->getKey(),
                    'receivable_type' => User::class,
                    'quantity' => $after - $before,
                    'status' => $data['reason'],
                ]);
            }
        });

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Stock adjusted.']);

        return to_route('inventory.stock.index', $request->user()->currentTeam->slug);
    }

    public function transfer(Request $request): RedirectResponse
    {
        $teamId = $request->user()->currentTeam->getKey();
        $data = $request->validate([
            'location' => ['required', Rule::in(['lab', 'pharmacy'])],
            'receiver' => ['required', 'integer', Rule::exists('team_members', 'user_id')->where('team_id', $teamId)],
            'items' => ['required', 'array', 'min:1'],
            'items.*.id' => ['required', 'integer', Rule::exists('inventories', 'id')->where('team_id', $teamId)],
            'items.*.quantity' => ['required', 'numeric', 'min:0.01'],
        ]);

        DB::transaction(function () use ($data): void {
            foreach ($data['items'] as $item) {
                $inventory = Inventory::query()->lockForUpdate()->whereKey($item['id'])->firstOrFail();
                abort_if((float) $item['quantity'] > (float) $inventory->quantity, 422, 'Transfer quantity cannot exceed available stock.');

                if ($data['location'] === 'lab') {
                    $this->transferToLab($inventory, (float) $item['quantity'], (int) $data['receiver']);
                } else {
                    $this->transferToPharmacy($inventory, (float) $item['quantity'], (int) $data['receiver']);
                }
            }
        });

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Stock transferred.']);

        return to_route('inventory.stock.index', $request->user()->currentTeam->slug);
    }

    private function transferToLab(Inventory $inventory, float $quantity, int $receiverId): void
    {
        $teamId = $inventory->team_id;
        $destination = LabInventory::query()->where('sku', $inventory->sku)->first();

        if ($destination) {
            $destination->increment('quantity', $quantity);
            $destination->refresh();
            $destination->update([
                'price' => $inventory->price,
                'cost' => $inventory->cost,
                'expires_at' => $inventory->expires_at,
                'status' => $destination->quantity <= $destination->min_qty ? 'low' : 'available',
            ]);
        } else {
            $destination = LabInventory::create([
                'team_id' => $teamId,
                'sku' => $inventory->sku,
                'price_list_id' => $inventory->price_list_id,
                'drug_form_id' => $inventory->drug_form_id,
                'min_qty' => $inventory->min_qty,
                'quantity' => $quantity,
                'price' => $inventory->price,
                'cost' => $inventory->cost,
                'status' => 'available',
                'expires_at' => $inventory->expires_at,
            ]);
        }

        $this->recordTransfer($inventory, $destination->getKey(), LabInventory::class, $quantity, $receiverId);
    }

    private function transferToPharmacy(Inventory $inventory, float $quantity, int $receiverId): void
    {
        $teamId = $inventory->team_id;
        $destination = DrugInventory::query()->where('sku', $inventory->sku)->first();

        if ($destination) {
            $destination->increment('quantity', $quantity);
            $destination->refresh();
            $destination->update([
                'price' => $inventory->price,
                'cost' => $inventory->cost,
                'expires_at' => $inventory->expires_at,
                'status' => $destination->quantity <= $destination->min_qty ? 'low' : 'available',
            ]);
        } else {
            $destination = DrugInventory::create([
                'team_id' => $teamId,
                'sku' => $inventory->sku,
                'price_list_id' => $inventory->price_list_id,
                'drug_form_id' => $inventory->drug_form_id,
                'min_qty' => $inventory->min_qty,
                'quantity' => $quantity,
                'price' => $inventory->price,
                'cost' => $inventory->cost,
                'status' => 'available',
                'expires_at' => $inventory->expires_at,
            ]);
        }

        $this->recordTransfer($inventory, $destination->getKey(), DrugInventory::class, $quantity, $receiverId);
    }

    private function recordTransfer(Inventory $inventory, int $destinationId, string $destinationType, float $quantity, int $receiverId): void
    {
        $inventory->decrement('quantity', $quantity);
        $inventory->update(['status' => $inventory->quantity <= $inventory->min_qty ? 'low' : 'available']);
        $common = [
            'team_id' => $inventory->team_id,
            'user_id' => auth()->id(),
            'inventory_id' => $inventory->getKey(),
            'receivable_id' => $receiverId,
            'receivable_type' => User::class,
            'status' => 'Transferred',
        ];
        Stock::create([...$common, 'stockable_id' => $inventory->getKey(), 'stockable_type' => Inventory::class, 'quantity' => -$quantity]);
        Stock::create([...$common, 'stockable_id' => $destinationId, 'stockable_type' => $destinationType, 'quantity' => $quantity]);
    }

    /** @return array<string, mixed> */
    private function validated(Request $request): array
    {
        $teamId = $request->user()->currentTeam->getKey();

        return $request->validate([
            'sku' => ['nullable', 'string', 'max:255'],
            'price_list_id' => ['required', Rule::exists('price_lists', 'id')->where('team_id', $teamId)->where('is_inventory', true)],
            'drug_form_id' => ['required', Rule::exists('drug_forms', 'id')->where('team_id', $teamId)],
            'min_qty' => ['required', 'integer', 'min:0'],
            'quantity' => ['required', 'numeric', 'min:0'],
            'price' => ['required', 'numeric', 'min:0'],
            'cost' => ['required', 'numeric', 'min:0'],
            'expires_at' => ['nullable', 'date'],
        ]);
    }

    private function hasMovements(Inventory $inventory): bool
    {
        return Stock::query()->where('stockable_type', Inventory::class)->where('stockable_id', $inventory->getKey())->exists();
    }

    /** @return array<string, mixed> */
    private function present(Inventory $inventory): array
    {
        return [
            'id' => $inventory->getKey(),
            'sku' => $inventory->sku,
            'name' => $inventory->priceList->name ?? 'Inventory item',
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
}
