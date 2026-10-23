<?php

namespace App\Http\Controllers;

use App\Models\Coupon;
use App\Models\Patient;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class CouponController extends Controller
{
    public function index(Request $request): Response
    {
        $query = trim((string) $request->query('q', ''));
        $status = in_array($request->query('status'), ['pending', 'approved', 'rejected'], true) ? $request->query('status') : 'all';
        $perPage = in_array((int) $request->query('perPage', 25), [10, 25, 50, 100], true) ? (int) $request->query('perPage', 25) : 25;
        $teamId = $request->user()->currentTeam->getKey();
        $coupons = Coupon::query()
            ->with(['patient', 'usages'])
            ->when($query !== '', fn (Builder $builder) => $builder->where(fn (Builder $builder) => $builder
                ->where('code', 'like', "%{$query}%")
                ->orWhereHas('patient', fn (Builder $patient) => $patient->where('fullName', 'like', "%{$query}%")
                    ->orWhere('slug', 'like', "%{$query}%"))))
            ->when($status !== 'all', fn (Builder $builder) => $builder->where('status', $status))
            ->orderByDesc('created_at')
            ->paginate($perPage)
            ->withQueryString()
            ->through(fn (Coupon $coupon) => $this->serialize($coupon));

        return Inertia::render('coupons/index', [
            'coupons' => $coupons,
            'patients' => Patient::query()
                ->where('team_id', $teamId)
                ->orderBy('fullName')
                ->limit(200)
                ->get(['slug', 'fullName']),
            'filters' => ['q' => $query, 'status' => $status, 'perPage' => $perPage],
            'summary' => [
                'pending' => Coupon::query()->where('status', 'pending')->count(),
                'approved' => Coupon::query()->where('status', 'approved')->count(),
                'rejected' => Coupon::query()->where('status', 'rejected')->count(),
                'totalUsed' => Coupon::query()->sum('used_count'),
                'totalDiscounts' => Coupon::query()->with('usages')->get()->sum(fn (Coupon $c) => $c->usages->sum('discount_amount')),
            ],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        Coupon::create([
            ...$this->validated($request),
            'team_id' => $request->user()->currentTeam->getKey(),
            'status' => 'pending',
        ]);

        return to_route('coupons.index', $request->user()->currentTeam->slug);
    }

    public function approve(Request $request, string $current_team, Coupon $coupon): RedirectResponse
    {
        abort_unless($coupon->isPending(), 409, 'Only pending coupons can be approved.');
        $coupon->approve($request->user());

        return to_route('coupons.index', $request->user()->currentTeam->slug);
    }

    public function reject(Request $request, string $current_team, Coupon $coupon): RedirectResponse
    {
        abort_unless($coupon->isPending(), 409, 'Only pending coupons can be rejected.');
        $coupon->reject($request->user());

        return to_route('coupons.index', $request->user()->currentTeam->slug);
    }

    public function update(Request $request, string $current_team, Coupon $coupon): RedirectResponse
    {
        $coupon->update($this->validated($request, $coupon));

        return to_route('coupons.index', $request->user()->currentTeam->slug);
    }

    public function destroy(Request $request, string $current_team, Coupon $coupon): RedirectResponse
    {
        $coupon->delete();

        return to_route('coupons.index', $request->user()->currentTeam->slug);
    }

    public function bulkDestroy(Request $request): RedirectResponse
    {
        $teamId = $request->user()->currentTeam->getKey();
        $data = $request->validate([
            'ids' => ['required', 'array', 'min:1'],
            'ids.*' => ['integer', Rule::exists('coupons', 'id')->where('team_id', $teamId)],
        ]);
        Coupon::query()->whereIn('id', $data['ids'])->delete();

        return to_route('coupons.index', $request->user()->currentTeam->slug);
    }

    /** @return array<string, mixed> */
    private function validated(Request $request, ?Coupon $coupon = null): array
    {
        $teamId = $request->user()->currentTeam->getKey();

        return $request->validate([
            'patient_id' => ['required', 'string', Rule::exists('patients', 'slug')->where('team_id', $teamId)],
            'code' => ['required', 'string', 'max:255', Rule::unique('coupons', 'code')->ignore($coupon?->id)],
            'type' => ['required', Rule::in(['fixed', 'percentage'])],
            'value' => ['required', 'numeric', 'min:0.01', 'max:100000000'],
            'max_uses' => ['nullable', 'integer', 'min:1'],
            'used_count' => ['required', 'integer', 'min:0'],
            'min_billing_amount' => ['required', 'numeric', 'min:0'],
            'max_discount_amount' => ['nullable', 'numeric', 'min:0'],
            'expires_at' => ['nullable', 'date'],
            'is_active' => ['required', 'boolean'],
            'fund_type' => ['nullable', Rule::in(['mercy_fund', 'infant_formula'])],
            'status' => ['nullable', Rule::in(['pending', 'approved', 'rejected'])],
        ]);
    }

    /** @return array<string, mixed> */
    private function serialize(Coupon $coupon): array
    {
        return [
            'id' => $coupon->id,
            'patientId' => $coupon->patient_id,
            'patientName' => $coupon->patient?->fullName,
            'code' => $coupon->code,
            'type' => $coupon->type,
            'value' => (float) $coupon->value,
            'maxUses' => $coupon->max_uses,
            'usedCount' => (int) $coupon->used_count,
            'minBillingAmount' => (float) $coupon->min_billing_amount,
            'maxDiscountAmount' => $coupon->max_discount_amount === null ? null : (float) $coupon->max_discount_amount,
            'expiresAt' => $coupon->expires_at?->toIso8601String(),
            'isActive' => $coupon->is_active,
            'fundType' => $coupon->fund_type,
            'status' => $coupon->status,
            'approvedBy' => $coupon->approvedBy?->name,
            'approvedAt' => $coupon->approved_at?->toIso8601String(),
            'usedAmount' => (float) $coupon->usages->sum('discount_amount'),
            'balance' => (float) max(0, $coupon->value - $coupon->usages->sum('discount_amount')),
        ];
    }
}
