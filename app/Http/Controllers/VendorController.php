<?php

namespace App\Http\Controllers;

use App\Models\Vendor;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class VendorController extends Controller
{
    public function index(Request $request): Response
    {
        $search = trim((string) $request->query('q', ''));
        $perPage = in_array((int) $request->query('perPage', 25), [10, 25, 50, 100], true)
            ? (int) $request->query('perPage', 25)
            : 25;

        $vendors = Vendor::query()
            ->when($search !== '', fn ($query) => $query->where(function ($query) use ($search) {
                $query->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%")
                    ->orWhere('mobile', 'like', "%{$search}%")
                    ->orWhere('company', 'like', "%{$search}%");
            }))
            ->withCount('purchaseOrder')
            ->orderBy('name')
            ->paginate($perPage)
            ->withQueryString()
            ->through(fn (Vendor $vendor) => [
                'id' => $vendor->id,
                'name' => $vendor->name,
                'email' => $vendor->email,
                'phone' => $vendor->phone,
                'mobile' => $vendor->mobile,
                'address' => $vendor->address,
                'company' => $vendor->company,
                'purchaseOrdersCount' => $vendor->purchase_order_count,
                'createdAt' => $vendor->created_at?->toIso8601String(),
                'updatedAt' => $vendor->updated_at?->toIso8601String(),
            ]);

        return Inertia::render('inventory/vendors/index', [
            'vendors' => $vendors,
            'filters' => ['q' => $search, 'perPage' => $perPage],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        Vendor::create([
            ...$this->validated($request),
            'team_id' => $request->user()->currentTeam->getKey(),
        ]);

        return to_route('vendors.index', $request->user()->currentTeam->slug);
    }

    public function update(Request $request, string $current_team, Vendor $vendor): RedirectResponse
    {
        $vendor->update($this->validated($request, $vendor));

        return to_route('vendors.index', $request->user()->currentTeam->slug);
    }

    public function destroy(Request $request, string $current_team, Vendor $vendor): RedirectResponse
    {
        $vendor->delete();

        return to_route('vendors.index', $request->user()->currentTeam->slug);
    }

    public function bulkDestroy(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'ids' => ['required', 'array', 'min:1'],
            'ids.*' => ['integer', 'distinct'],
        ]);

        Vendor::query()->whereKey($validated['ids'])->delete();

        return to_route('vendors.index', $request->user()->currentTeam->slug);
    }

    /**
     * @return array{name: string, email: ?string, phone: ?string, mobile: ?string, address: ?string, company: ?string}
     */
    private function validated(Request $request, ?Vendor $vendor = null): array
    {
        return $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['nullable', 'email', 'max:255', Rule::unique('vendors', 'email')->ignore($vendor?->id)],
            'phone' => ['nullable', 'string', 'max:255'],
            'mobile' => ['nullable', 'string', 'max:255'],
            'address' => ['nullable', 'string'],
            'company' => ['nullable', 'string', 'max:255'],
        ]);
    }
}
