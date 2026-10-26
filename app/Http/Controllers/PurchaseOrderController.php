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
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class PurchaseOrderController extends Controller
{
    public function index(Request $request): Response
    {
        $search = trim((string) $request->query('q', ''));
        $perPage = in_array((int) $request->query('perPage', 25), [10, 25, 50, 100], true)
            ? (int) $request->query('perPage', 25)
            : 25;

        $purchaseOrders = PurchaseOrder::query()
            ->with(['vendor', 'user', 'items.inventory.priceList', 'items.inventory.drugForm'])
            ->when($search !== '', fn ($query) => $query->where(function ($query) use ($search) {
                $query->where('slug', 'like', "%{$search}%")
                    ->orWhere('status', 'like', "%{$search}%");
            }))
            ->orderByDesc('created_at')
            ->paginate($perPage)
            ->withQueryString()
            ->through(fn (PurchaseOrder $po) => [
                'id' => $po->id,
                'slug' => $po->slug,
                'vendor' => $po->vendor ? [
                    'id' => $po->vendor->id,
                    'name' => $po->vendor->name,
                ] : null,
                'user' => $po->user ? [
                    'id' => $po->user->id,
                    'name' => $po->user->name,
                ] : null,
                'subPrice' => $po->subPrice,
                'subCost' => $po->subCost,
                'discount' => $po->discount,
                'total' => $po->total,
                'items_count' => $po->items->count(),
                'status' => $po->status,
                'items' => $po->items->map(fn ($item) => [
                    'id' => $item->id,
                    'inventory_id' => $item->inventory_id,
                    'inventory_name' => trim(($item->inventory?->priceList?->name ?? '').' '.($item->inventory?->drugForm?->name ?? '')) ?: 'Unknown',
                    'quantity' => $item->quantity,
                    'unitPrice' => $item->unitPrice,
                    'unitCost' => $item->unitCost,
                    'expires_at' => $item->expires_at instanceof \DateTimeInterface ? $item->expires_at->format('Y-m-d') : ($item->expires_at ?? null),
                ]),
                'createdAt' => $po->created_at?->toIso8601String(),
                'updatedAt' => $po->updated_at?->toIso8601String(),
            ]);

        $vendors = Vendor::query()->orderBy('name')->get();
        $users = User::query()->orderBy('name')->get();
        $markups = Markup::query()->orderBy('name')->get();
        $inventories = Inventory::query()
            ->with(['priceList', 'drugForm'])
            ->orderBy('id')
            ->get()
            ->map(fn (Inventory $inv) => [
                'id' => $inv->id,
                'label' => ($inv->priceList?->name ?? '').' '.($inv->drugForm?->name ?? ''),
                'priceListName' => $inv->priceList?->name ?? '',
                'drugFormName' => $inv->drugForm?->name ?? '',
            ]);

        $nextSlug = self::generateNextSlug();

        return Inertia::render('inventory/purchase-orders/index', [
            'currencySymbol' => DashboardCurrency::symbol(),
            'nextSlug' => $nextSlug,
            'purchaseOrders' => $purchaseOrders,
            'vendors' => $vendors,
            'users' => $users,
            'markups' => $markups,
            'inventories' => $inventories,
            'filters' => ['q' => $search, 'perPage' => $perPage],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $this->validated($request);
        $teamId = $request->user()->currentTeam->getKey();

        $items = $validated['items'] ?? [];
        unset($validated['items']);

        DB::transaction(function () use ($validated, $teamId, $items) {
            $purchaseOrder = PurchaseOrder::create([
                ...$validated,
                'team_id' => $teamId,
            ]);

            foreach ($items as $itemData) {
                OrderItem::create([
                    'team_id' => $teamId,
                    'purchase_order_id' => $purchaseOrder->id,
                    'inventory_id' => $itemData['inventory_id'],
                    'markup_id' => $itemData['markup_id'] ?? null,
                    'quantity' => $itemData['quantity'],
                    'unitPrice' => $itemData['unitPrice'],
                    'unitCost' => $itemData['unitCost'],
                    'totalPrice' => $itemData['totalPrice'] ?? $itemData['quantity'] * $itemData['unitPrice'],
                    'totalCost' => $itemData['totalCost'] ?? $itemData['quantity'] * $itemData['unitCost'],
                ]);
            }
        });

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Purchase order created.']);

        return to_route('purchase-orders.index', $request->user()->currentTeam->slug);
    }

    public function update(Request $request, string $current_team, PurchaseOrder $purchaseOrder): RedirectResponse
    {
        $validated = $this->validated($request, $purchaseOrder);
        $teamId = $purchaseOrder->team_id;

        $items = $validated['items'] ?? [];
        unset($validated['items']);

        DB::transaction(function () use ($validated, $teamId, $purchaseOrder, $items) {
            $purchaseOrder->update($validated);

            $purchaseOrder->items()->delete();

            foreach ($items as $itemData) {
                OrderItem::create([
                    'team_id' => $teamId,
                    'purchase_order_id' => $purchaseOrder->id,
                    'inventory_id' => $itemData['inventory_id'],
                    'markup_id' => $itemData['markup_id'] ?? null,
                    'quantity' => $itemData['quantity'],
                    'unitPrice' => $itemData['unitPrice'],
                    'unitCost' => $itemData['unitCost'],
                    'totalPrice' => $itemData['totalPrice'] ?? $itemData['quantity'] * $itemData['unitPrice'],
                    'totalCost' => $itemData['totalCost'] ?? $itemData['quantity'] * $itemData['unitCost'],
                ]);
            }
        });

        return to_route('purchase-orders.index', $request->user()->currentTeam->slug);
    }

    public function destroy(Request $request, string $current_team, PurchaseOrder $purchaseOrder): RedirectResponse
    {
        $purchaseOrder->delete();

        return to_route('purchase-orders.index', $request->user()->currentTeam->slug);
    }

    public function bulkDestroy(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'ids' => ['required', 'array', 'min:1'],
            'ids.*' => ['integer', 'distinct'],
        ]);

        PurchaseOrder::query()->whereKey($validated['ids'])->delete();

        return to_route('purchase-orders.index', $request->user()->currentTeam->slug);
    }

    public function approve(Request $request, string $current_team, PurchaseOrder $purchaseOrder): RedirectResponse
    {
        $purchaseOrder->update(['status' => 'approved']);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Purchase order approved.']);

        return to_route('purchase-orders.index', $request->user()->currentTeam->slug);
    }

    public function postInventory(Request $request, string $current_team, PurchaseOrder $purchaseOrder): RedirectResponse
    {
        $validated = $request->validate([
            'received_by' => ['required', 'integer', 'exists:users,id'],
            'expiry_dates' => ['nullable', 'array'],
            'expiry_dates.*' => ['nullable', 'date'],
        ]);

        $expiryDates = array_change_key_case($validated['expiry_dates'] ?? []);

        DB::transaction(function () use ($validated, $expiryDates, $purchaseOrder) {
            $receiver = User::findOrFail($validated['received_by']);
            $team = $purchaseOrder->team;

            foreach ($purchaseOrder->items as $item) {
                // Get expiry date from form input, or use existing order item expiry
                $expiresAt = $expiryDates[(string) $item->id] ?? null;

                // Update the order item's expiry date
                $item->update(['expires_at' => $expiresAt]);

                Stock::create([
                    'team_id' => $team->id,
                    'user_id' => auth()->id(),
                    'inventory_id' => $item->inventory_id,
                    'stockable_id' => $item->purchase_order_id,
                    'stockable_type' => PurchaseOrder::class,
                    'receivable_id' => $receiver->id,
                    'receivable_type' => User::class,
                    'quantity' => -$item->quantity,
                    'status' => 'Purchased',
                ]);

                Stock::create([
                    'team_id' => $team->id,
                    'user_id' => auth()->id(),
                    'inventory_id' => $item->inventory_id,
                    'stockable_id' => $item->purchase_order_id,
                    'stockable_type' => Inventory::class,
                    'receivable_id' => $receiver->id,
                    'receivable_type' => User::class,
                    'quantity' => $item->quantity,
                    'status' => 'Purchased',
                ]);

                // Add ordered quantity to inventory and update price, cost, and expiry date
                $item->inventory->increment('quantity', $item->quantity, [
                    'price' => $item->unitPrice,
                    'cost' => $item->unitCost,
                    'status' => 'stocked',
                    'expires_at' => $expiresAt,
                ]);

                // Update PriceList price and cost
                if ($item->inventory->priceList) {
                    $item->inventory->priceList->update([
                        'price' => $item->unitPrice,
                    ]);
                }
            }

            $purchaseOrder->update(['status' => 'posted']);
        });

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Stock posted to inventory.']);

        return to_route('purchase-orders.index', $request->user()->currentTeam->slug);
    }

    /**
     * Generate the next purchase order slug.
     */
    private static function generateNextSlug(): string
    {
        $last = PurchaseOrder::latest('id')->first();
        $nextNumber = $last ? $last->id + 1 : 1;

        return 'PUR-'.str_pad($nextNumber, 5, '0', STR_PAD_LEFT);
    }

    /**
     * @return array<string, mixed>
     */
    private function validated(Request $request, ?PurchaseOrder $purchaseOrder = null): array
    {
        return $request->validate([
            'slug' => ['required', 'string', 'max:255', Rule::unique('purchase_orders', 'slug')->ignore($purchaseOrder?->id)],
            'vendor_id' => ['required', 'integer', 'exists:vendors,id'],
            'user_id' => ['required', 'integer', 'exists:users,id'],
            'subPrice' => ['required', 'numeric', 'min:0'],
            'subCost' => ['required', 'numeric', 'min:0'],
            'discount' => ['required', 'numeric', 'min:0'],
            'total' => ['required', 'numeric', 'min:0'],
            'status' => ['required', 'string', 'max:50'],
            'items' => ['nullable', 'array'],
            'items.*.inventory_id' => ['required_with:items', 'integer', 'exists:inventories,id'],
            'items.*.markup_id' => ['nullable', 'integer', 'exists:mark_ups,id'],
            'items.*.quantity' => ['required_with:items', 'numeric', 'min:1'],
            'items.*.unitPrice' => ['required_with:items', 'numeric', 'min:0'],
            'items.*.unitCost' => ['required_with:items', 'numeric', 'min:0'],
            'items.*.totalPrice' => ['nullable', 'numeric', 'min:0'],
            'items.*.totalCost' => ['nullable', 'numeric', 'min:0'],
        ]);
    }
}
