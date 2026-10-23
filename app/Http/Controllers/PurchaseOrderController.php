<?php

namespace App\Http\Controllers;

use App\Models\Inventory;
use App\Models\Markup;
use App\Models\OrderItem;
use App\Models\PurchaseOrder;
use App\Models\Stock;
use App\Models\User;
use App\Models\Vendor;
use App\Service\DashboardCurrency;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class PurchaseOrderController extends Controller
{
    public function index(Request $request): Response
    {
        $filters = [
            'q' => trim((string) $request->query('q', '')),
            'status' => in_array($request->query('status'), ['pending', 'approved', 'posted'], true) ? $request->query('status') : 'all',
            'perPage' => in_array((int) $request->query('perPage', 25), [10, 25, 50, 100], true) ? (int) $request->query('perPage', 25) : 25,
        ];

        $orders = PurchaseOrder::query()
            ->with(['vendor', 'user', 'items.inventory.priceList', 'items.inventory.drugForm', 'items.markup'])
            ->withCount('items')
            ->when($filters['q'] !== '', function (Builder $query) use ($filters): void {
                $like = '%'.$filters['q'].'%';
                $query->where(function (Builder $query) use ($like): void {
                    $query->where('slug', 'like', $like)
                        ->orWhereHas('vendor', fn (Builder $query) => $query->where('name', 'like', $like))
                        ->orWhereHas('user', fn (Builder $query) => $query->where('name', 'like', $like));
                });
            })
            ->when($filters['status'] !== 'all', fn (Builder $query) => $query->where('status', $filters['status']))
            ->latest()
            ->paginate($filters['perPage'])
            ->withQueryString()
            ->through(fn (PurchaseOrder $order) => $this->present($order, true));

        return Inertia::render('inventory/purchase-orders/index', [
            'currencySymbol' => DashboardCurrency::symbol(),
            'orders' => $orders,
            'filters' => $filters,
            'summary' => [
                'pending' => PurchaseOrder::query()->where('status', 'pending')->count(),
                'approved' => PurchaseOrder::query()->where('status', 'approved')->count(),
                'posted' => PurchaseOrder::query()->where('status', 'posted')->count(),
            ],
            'formOptions' => [
                'vendors' => Vendor::query()->orderBy('name')->get(['id', 'name']),
                'inventories' => Inventory::query()->with(['priceList', 'drugForm'])->orderBy('price_list_id')->get()
                    ->map(fn (Inventory $inventory) => ['id' => $inventory->id, 'name' => ($inventory->priceList->name ?? 'Item').' '.($inventory->drugForm->name ?? '')]),
                'markups' => Markup::query()->orderBy('name')->get(['id', 'name', 'value']),
                'users' => $request->user()->currentTeam->members()->orderBy('name')->get(['users.id', 'users.name']),
            ],
        ]);
    }

    public function show(string $current_team, PurchaseOrder $purchase_order): Response
    {
        $purchase_order->load(['vendor', 'user', 'items.inventory.priceList', 'items.inventory.drugForm', 'items.markup']);

        return Inertia::render('inventory/purchase-orders/show', [
            'currencySymbol' => DashboardCurrency::symbol(),
            'order' => $this->present($purchase_order, true),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $this->validated($request);
        $teamId = $request->user()->currentTeam->getKey();

        DB::transaction(function () use ($data, $request, $teamId): void {
            $lastId = PurchaseOrder::withoutGlobalScopes()->lockForUpdate()->max('id') ?? 0;
            $order = PurchaseOrder::create([
                'team_id' => $teamId,
                'slug' => 'PUR-'.str_pad((string) ($lastId + 1), 5, '0', STR_PAD_LEFT),
                'vendor_id' => $data['vendor_id'],
                'user_id' => $request->user()->getKey(),
                'subPrice' => $data['subPrice'],
                'subCost' => $data['subCost'],
                'discount' => $data['discount'],
                'total' => $data['total'],
                'status' => 'pending',
            ]);

            foreach ($data['items'] as $item) {
                $this->createItem($order, $item, $teamId);
            }
        });

        return to_route('purchase-orders.index', $request->user()->currentTeam->slug);
    }

    public function update(Request $request, string $current_team, PurchaseOrder $purchase_order): RedirectResponse
    {
        abort_if($purchase_order->status === 'posted', 409, 'Posted purchase orders cannot be edited.');
        $data = $this->validated($request);
        $teamId = $request->user()->currentTeam->getKey();

        DB::transaction(function () use ($data, $purchase_order, $teamId): void {
            $purchase_order->update([
                'vendor_id' => $data['vendor_id'],
                'subPrice' => $data['subPrice'],
                'subCost' => $data['subCost'],
                'discount' => $data['discount'],
                'total' => $data['total'],
            ]);
            $purchase_order->items()->delete();
            foreach ($data['items'] as $item) {
                $this->createItem($purchase_order, $item, $teamId);
            }
        });

        return to_route('purchase-orders.index', $request->user()->currentTeam->slug);
    }

    public function approve(Request $request, string $current_team, PurchaseOrder $purchase_order): RedirectResponse
    {
        abort_unless($purchase_order->status === 'pending', 409, 'Only pending purchase orders can be approved.');
        $purchase_order->update(['status' => 'approved']);

        return to_route('purchase-orders.index', $request->user()->currentTeam->slug);
    }

    public function post(Request $request, string $current_team, PurchaseOrder $purchase_order): RedirectResponse
    {
        abort_unless($purchase_order->status === 'approved', 409, 'Only approved purchase orders can be posted.');
        $validated = $request->validate([
            'received_by' => ['required', 'integer', Rule::exists('team_members', 'user_id')->where('team_id', $request->user()->currentTeam->getKey())],
        ]);
        $teamId = $request->user()->currentTeam->getKey();

        DB::transaction(function () use ($request, $purchase_order, $validated, $teamId): void {
            $order = PurchaseOrder::query()->lockForUpdate()->findOrFail($purchase_order->getKey());
            abort_unless($order->status === 'approved', 409, 'This purchase order is no longer approved.');
            $order->load('items.inventory.priceList');

            foreach ($order->items as $item) {
                $inventory = Inventory::query()->lockForUpdate()->whereKey($item->inventory_id)->firstOrFail();
                $inventory->increment('quantity', $item->quantity);
                $inventory->update([
                    'price' => $item->unitPrice,
                    'cost' => $item->unitCost,
                    'status' => $inventory->quantity <= $inventory->min_qty ? 'low' : 'available',
                    'expires_at' => $item->expires_at,
                ]);
                $inventory->priceList?->update(['price' => $item->unitPrice]);

                $attributes = [
                    'team_id' => $teamId,
                    'user_id' => $request->user()->getKey(),
                    'inventory_id' => $inventory->getKey(),
                    'receivable_id' => $validated['received_by'],
                    'receivable_type' => User::class,
                    'quantity' => $item->quantity,
                    'status' => 'Purchased',
                ];
                Stock::create([...$attributes, 'stockable_id' => $order->getKey(), 'stockable_type' => PurchaseOrder::class, 'quantity' => -$item->quantity]);
                Stock::create([...$attributes, 'stockable_id' => $inventory->getKey(), 'stockable_type' => Inventory::class]);
            }

            $order->update(['status' => 'posted']);
        });

        return to_route('purchase-orders.index', $request->user()->currentTeam->slug);
    }

    public function destroy(Request $request, string $current_team, PurchaseOrder $purchase_order): RedirectResponse
    {
        abort_if($purchase_order->status === 'posted', 409, 'Posted purchase orders cannot be deleted.');
        $purchase_order->delete();

        return to_route('purchase-orders.index', $request->user()->currentTeam->slug);
    }

    public function bulkDestroy(Request $request): RedirectResponse
    {
        $teamId = $request->user()->currentTeam->getKey();
        $data = $request->validate([
            'ids' => ['required', 'array', 'min:1'],
            'ids.*' => ['integer', Rule::exists('purchase_orders', 'id')->where('team_id', $teamId)],
        ]);
        PurchaseOrder::query()->whereIn('id', $data['ids'])->where('status', '!=', 'posted')->delete();

        return to_route('purchase-orders.index', $request->user()->currentTeam->slug);
    }

    /** @return array<string, mixed> */
    private function validated(Request $request): array
    {
        $teamId = $request->user()->currentTeam->getKey();
        $data = $request->validate([
            'vendor_id' => ['required', 'integer', Rule::exists('vendors', 'id')->where('team_id', $teamId)],
            'discount' => ['required', 'numeric', 'min:0'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.inventory_id' => ['required', 'integer', Rule::exists('inventories', 'id')->where('team_id', $teamId)],
            'items.*.markup_id' => ['required', 'integer', Rule::exists('mark_ups', 'id')->where('team_id', $teamId)],
            'items.*.quantity' => ['required', 'integer', 'min:1'],
            'items.*.unitCost' => ['required', 'numeric', 'min:0'],
            'items.*.expires_at' => ['required', 'date', 'after_or_equal:today'],
        ]);
        $items = [];
        $subCost = 0.0;
        $subPrice = 0.0;

        foreach ($data['items'] as $item) {
            $markup = Markup::query()->whereKey($item['markup_id'])->firstOrFail();
            $unitCost = (float) $item['unitCost'];
            $unitPrice = round($unitCost + ($unitCost * (float) $markup->value / 100), 2);
            $quantity = (int) $item['quantity'];
            $totalCost = $quantity * $unitCost;
            $totalPrice = $quantity * $unitPrice;
            $items[] = [...$item, 'unitPrice' => $unitPrice, 'totalCost' => $totalCost, 'totalPrice' => $totalPrice];
            $subCost += $totalCost;
            $subPrice += $totalPrice;
        }

        return [
            'vendor_id' => $data['vendor_id'],
            'items' => $items,
            'subPrice' => $subPrice,
            'subCost' => $subCost,
            'discount' => (float) $data['discount'],
            'total' => $subCost - (float) $data['discount'],
        ];
    }

    /** @param array<string, mixed> $item */
    private function createItem(PurchaseOrder $order, array $item, int $teamId): OrderItem
    {
        return $order->items()->create([
            ...$item,
            'team_id' => $teamId,
        ]);
    }

    /** @return array<string, mixed> */
    private function present(PurchaseOrder $order, bool $withItems = false): array
    {
        $result = [
            'id' => $order->getKey(),
            'slug' => $order->slug,
            'vendorId' => $order->vendor_id,
            'vendorName' => $order->vendor?->name,
            'userName' => $order->user?->name,
            'subPrice' => (float) $order->subPrice,
            'subCost' => (float) $order->subCost,
            'discount' => (float) $order->discount,
            'total' => (float) $order->total,
            'status' => $order->status,
            'itemsCount' => (int) ($order->items_count ?? $order->items->count()),
            'createdAt' => $order->created_at?->toIso8601String(),
        ];

        if ($withItems) {
            $result['items'] = $order->items->map(fn (OrderItem $item) => [
                'id' => $item->getKey(),
                'inventoryId' => $item->inventory_id,
                'itemName' => ($item->inventory?->priceList->name ?? 'Inventory item').' '.($item->inventory?->drugForm->name ?? ''),
                'markupId' => $item->markup_id,
                'markupName' => $item->markup?->name,
                'quantity' => (int) $item->quantity,
                'unitCost' => (float) $item->unitCost,
                'unitPrice' => (float) $item->unitPrice,
                'totalCost' => (float) $item->totalCost,
                'totalPrice' => (float) $item->totalPrice,
                'expiresAt' => Carbon::parse($item->expires_at)->toDateString(),
            ])->values()->all();
        }

        return $result;
    }
}
