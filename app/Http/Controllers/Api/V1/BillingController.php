<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\StoreApiBillingRequest;
use App\Http\Requests\StorePaymentRequest;
use App\Http\Resources\Api\V1\BillingResource;
use App\Models\Billing;
use App\Models\Coupon;
use App\Models\Line;
use App\Models\Method;
use App\Models\Patient;
use App\Models\Payment;
use App\Models\User;
use App\Service\DashboardCurrency;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class BillingController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Billing::query()->with(['patient:id,slug,firstName,lastName,fullName', 'user:id,name']);

        if ($request->filled('status')) {
            $query->where('status', $request->string('status'));
        }
        if ($request->filled('patient')) {
            $query->where('patient_id', $request->string('patient'));
        }
        if ($request->filled('q')) {
            $like = '%'.$request->string('q').'%';
            $query->where(fn (Builder $q) => $q
                ->where('patient_id', 'like', $like)
                ->orWhere('billable_type', 'like', $like)
                ->orWhereHas('patient', fn (Builder $p) => $p->where('fullName', 'like', $like)));
        }

        $billings = $query->latest()->paginate($request->integer('per_page', 15));

        return BillingResource::collection($billings)->response();
    }

    public function show(Billing $billing): BillingResource
    {
        $billing->load(['patient:id,slug,firstName,lastName,fullName', 'user:id,name', 'payments.method:id,name', 'payments.user:id,name', 'lines.priceList:id,name']);

        return new BillingResource($billing);
    }

    public function history(Request $request): JsonResponse
    {
        $query = Billing::query()->with(['patient:id,slug,firstName,lastName,fullName', 'user:id,name']);
        if ($request->filled('status')) {
            $query->where('status', $request->string('status'));
        }
        if ($request->filled('patient')) {
            $query->where('patient_id', $request->string('patient'));
        }
        if ($request->filled('q')) {
            $like = '%'.$request->string('q').'%';
            $query->where(fn (Builder $q) => $q
                ->where('patient_id', 'like', $like)
                ->orWhere('billable_type', 'like', $like)
                ->orWhereHas('patient', fn (Builder $p) => $p->where('fullName', 'like', $like)));
        }

        $billings = $query->latest()->paginate($request->integer('per_page', 15));

        return BillingResource::collection($billings)->response();
    }

    public function paymentOptions(Request $request): JsonResponse
    {
        $billings = Billing::query()
            ->with(['patient.category:id,name,discount_percentage', 'user:id,name', 'billable', 'lines.priceList:id,name'])
            ->whereIn('status', ['billed', 'scheduled'])
            ->latest()
            ->get()
            ->map(fn (Billing $billing) => $this->billingOption($billing));

        $methods = Method::query()->where('team_id', $request->user()->currentTeam->getKey())->get(['id', 'name']);

        return response()->json([
            'data' => [
                'billings' => $billings->values(),
                'methods' => $methods,
                'coupons' => $this->allCouponsForBillings($billings),
                'currencySymbol' => DashboardCurrency::symbol(),
            ],
        ]);
    }

    public function store(StoreApiBillingRequest $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();
        $teamId = $request->attributes->get('currentTeam')->id;
        $data = $request->validated();

        $created = [];
        DB::transaction(function () use ($data, $teamId, $user, &$created): void {
            foreach ($data['billings'] as $billable) {
                $total = 0.0;
                foreach ($billable['lines'] as $line) {
                    $total += (float) ($line['quantity'] ?? 1) * (float) $line['unitPrice'];
                }

                $billing = Billing::query()->create([
                    'team_id' => $teamId,
                    'patient_id' => $data['patient_id'],
                    'user_id' => $user->getKey(),
                    'total' => $total,
                    'status' => 'billed',
                ]);

                foreach ($billable['lines'] as $line) {
                    $billing->lines()->create([
                        'team_id' => $teamId,
                        'patient_id' => $data['patient_id'],
                        'user_id' => $user->getKey(),
                        'price_list_id' => $line['price_list_id'],
                        'quantity' => $line['quantity'] ?? 1,
                        'unitPrice' => $line['unitPrice'],
                    ]);
                }

                $created[] = $billing->load(['patient:id,slug,firstName,lastName,fullName', 'user:id,name', 'lines.priceList:id,name']);
            }
        });

        return BillingResource::collection(collect($created))
            ->additional(['message' => 'Billing created.'])
            ->response()
            ->setStatusCode(201);
    }

    public function pay(StorePaymentRequest $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();
        $teamId = $user->currentTeam->getKey();
        $data = $request->validated();

        $billing = Billing::query()
            ->whereIn('status', ['billed', 'scheduled'])
            ->whereKey($data['billing_id'])
            ->firstOrFail();

        $totalPaymentAmount = 0;

        DB::transaction(function () use ($billing, $data, $user, $teamId, &$totalPaymentAmount): void {
            foreach ($data['payments'] as $paymentData) {
                $method = Method::query()->whereKey($paymentData['method_id'])->firstOrFail();

                $payment = Payment::create([
                    'team_id' => $teamId,
                    'patient_id' => $billing->patient_id,
                    'user_id' => $user->getKey(),
                    'billing_id' => $billing->getKey(),
                    'method_id' => $method->getKey(),
                    ...$this->paymentColumns($method->name, $paymentData),
                ]);

                $totalPaymentAmount += (float) ($payment->amount ?? 0);
                $totalPaymentAmount += (float) ($payment->wallet ?? 0);
                $totalPaymentAmount += (float) ($payment->mercy_fund ?? 0);
                $totalPaymentAmount += (float) ($payment->infant_formula ?? 0);

                if (($paymentData['coupon_id'] ?? null) && ($paymentData['coupon_discount_amount'] ?? 0) > 0) {
                    $payment->couponUsage()->create([
                        'coupon_id' => $paymentData['coupon_id'],
                        'user_id' => $user->getKey(),
                        'discount_amount' => $paymentData['coupon_discount_amount'],
                    ]);
                }

                if ($method->name === 'Wallet' && ! empty($paymentData['wallet_debit'])) {
                    $walletDebit = (float) $paymentData['wallet_debit'];
                    $walletPatientId = $paymentData['wallet_patient_id'] ?? $billing->patient_id;

                    $payment->update(['wallet' => $walletDebit]);

                    $payment->walletHistories()->create([
                        'team_id' => $teamId,
                        'patient_id' => $walletPatientId,
                        'user_id' => $user->getKey(),
                        'method_id' => $method->getKey(),
                        $walletDebit < 0 ? 'credit' : 'debit' => abs($walletDebit),
                    ]);

                    $patient = Patient::query()->where('team_id', $teamId)->where('slug', $walletPatientId)->first();
                    if ($patient) {
                        if ($walletDebit < 0) {
                            $patient->increment('wallet', abs($walletDebit));
                        } else {
                            $patient->decrement('wallet', $walletDebit);
                        }
                    }
                }
            }

            $billing->update(['status' => 'paid', 'created_at' => Carbon::now()]);

            if ($totalPaymentAmount < 0) {
                $lines = Line::query()
                    ->where('lineable_id', $billing->billable_id)
                    ->where('lineable_type', $billing->billable_type)
                    ->get(['id', 'unitPrice']);
                foreach ($lines as $line) {
                    $line->update(['paid' => true, 'unitPrice' => -abs((float) $line->unitPrice)]);
                }
            } else {
                Line::query()
                    ->where('lineable_id', $billing->billable_id)
                    ->where('lineable_type', $billing->billable_type)
                    ->update(['paid' => true]);
            }

            $billable = $billing->billable;
            if ($billable?->status && $billing->total > 0 && ! in_array($billable->status, ['dispensed', 'refunded'], true)) {
                $billable->update(['status' => 'paid']);
            }
        });

        $billing->load(['patient:id,slug,firstName,lastName,fullName', 'user:id,name', 'payments.method:id,name', 'payments.user:id,name', 'lines.priceList:id,name']);

        return (new BillingResource($billing))
            ->additional(['message' => 'Payment recorded.'])
            ->response();
    }

    /**
     * @return array<string, mixed>
     */
    private function billingOption(Billing $billing): array
    {
        $billableLines = $billing->billable instanceof Billing
            ? $billing->lines
            : $billing->billable?->lines ?? collect();

        return [
            'id' => $billing->getKey(),
            'patientId' => $billing->patient_id,
            'patientName' => $billing->patient?->fullName,
            'requestedBy' => $billing->user?->name,
            'billableType' => $billing->billable_type ? class_basename($billing->billable_type) : null,
            'categoryName' => $billing->patient?->category?->name,
            'discountPercentage' => (int) ($billing->patient?->category->discount_percentage ?? 0),
            'total' => (float) $billing->total,
            'status' => $billing->status,
            'isAdmitted' => $billing->patient?->isAdmitted() ?? false,
            'lines' => $billableLines->map(fn ($line) => [
                'id' => $line->getKey(),
                'name' => $line->priceList?->name,
                'quantity' => $line->quantity,
                'unitPrice' => (float) $line->unitPrice,
                'totalPrice' => (float) ($line->quantity ? $line->quantity * (float) $line->unitPrice : (float) $line->unitPrice),
            ])->values(),
        ];
    }

    /**
     * @param  Collection<int, array<string, mixed>>  $billings
     * @return array<int, array<string, mixed>>
     */
    private function allCouponsForBillings($billings): array
    {
        $patientIds = $billings->pluck('patientId')->unique()->values();
        if ($patientIds->isEmpty()) {
            return [];
        }

        return Coupon::query()
            ->whereIn('patient_id', $patientIds)
            ->where('status', 'approved')
            ->where(fn (Builder $q) => $q->whereNull('expires_at')->orWhere('expires_at', '>', now()))
            ->where(fn (Builder $q) => $q->whereNull('max_uses')->orWhereColumn('used_count', '<', 'max_uses'))
            ->with('usages')
            ->orderBy('code')
            ->get(['id', 'code', 'patient_id', 'type', 'value', 'used_count', 'max_uses', 'fund_type'])
            ->map(fn (Coupon $coupon) => [
                'id' => $coupon->getKey(),
                'code' => $coupon->code,
                'patientId' => $coupon->patient_id,
                'type' => $coupon->type,
                'value' => (float) $coupon->value,
                'usedCount' => (float) $coupon->used_count,
                'balance' => (float) max(0, $coupon->value - $coupon->usages->sum('discount_amount')),
                'fundType' => $coupon->fund_type,
            ])->values()->toArray();
    }

    /**
     * @param  array<string, mixed>  $paymentData
     * @return array<string, mixed>
     */
    private function paymentColumns(?string $methodName, array $paymentData): array
    {
        $amount = (float) ($paymentData['amount'] ?? 0);

        return match ($methodName) {
            'Discount' => [
                'discount_percentage' => (int) ($paymentData['discount_percentage'] ?? 0),
                'discount_amount' => (float) ($paymentData['discount_amount'] ?? $amount),
            ],
            'Wallet' => ['wallet' => (float) ($paymentData['wallet_debit'] ?? $amount)],
            'Mercy Fund' => ['mercy_fund' => (float) ($paymentData['coupon_discount_amount'] ?? $amount)],
            'Infant Formula' => ['infant_formula' => (float) ($paymentData['coupon_discount_amount'] ?? $amount)],
            default => ['amount' => $amount],
        };
    }
}
