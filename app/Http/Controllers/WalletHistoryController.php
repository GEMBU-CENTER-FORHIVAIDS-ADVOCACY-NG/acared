<?php

namespace App\Http\Controllers;

use App\Models\Coupon;
use App\Models\Method;
use App\Models\Patient;
use App\Models\Payment;
use App\Models\WalletHistory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class WalletHistoryController extends Controller
{
    public function index(Request $request): Response
    {
        $filters = [
            'q' => trim((string) $request->query('q', '')),
            'from' => $request->query('from'),
            'to' => $request->query('to'),
            'perPage' => in_array((int) $request->query('perPage', 25), [10, 25, 50, 100], true) ? (int) $request->query('perPage', 25) : 25,
        ];
        $teamId = $request->user()->currentTeam->getKey();
        $rows = WalletHistory::query()
            ->with(['patient', 'user', 'method', 'team', 'lines.priceList', 'payment.billing.billable'])
            ->when($filters['q'] !== '', fn (Builder $builder) => $builder->where(fn (Builder $builder) => $builder
                ->where('patient_id', 'like', '%'.$filters['q'].'%')
                ->orWhereHas('patient', fn (Builder $patient) => $patient->where('fullName', 'like', '%'.$filters['q'].'%'))
                ->orWhereHas('user', fn (Builder $user) => $user->where('name', 'like', '%'.$filters['q'].'%'))))
            ->when($filters['from'], fn (Builder $builder, string $from) => $builder->whereDate('created_at', '>=', $from))
            ->when($filters['to'], fn (Builder $builder, string $to) => $builder->whereDate('created_at', '<=', $to))
            ->latest()
            ->paginate($filters['perPage'])
            ->withQueryString()
            ->through(fn (WalletHistory $history) => $this->serialize($history));

        return Inertia::render('finance/wallet-history/index', [
            'histories' => $rows,
            'methods' => Method::query()->orderBy('name')->limit(100)->get(['id', 'name']),
            'coupons' => Coupon::query()
                ->where('team_id', $teamId)
                ->where('is_active', true)
                ->get(['id', 'code', 'type', 'value', 'balance', 'fund_type', 'patient_id'])
                ->map(fn (Coupon $coupon) => [
                    'id' => $coupon->id,
                    'code' => $coupon->code,
                    'type' => $coupon->type,
                    'value' => (float) $coupon->value,
                    'balance' => (float) $coupon->balance,
                    'fundType' => $coupon->fund_type,
                    'patientId' => $coupon->patient_id,
                ]),
            'filters' => $filters,
        ]);
    }

    /**
     * Search patients by name or slug for the current team.
     */
    public function searchPatients(Request $request): JsonResponse
    {
        $search = trim((string) $request->query('q', ''));

        $patients = Patient::query()
            ->where('team_id', $request->user()->currentTeam->getKey())
            ->when($search !== '', function (Builder $q) use ($search): void {
                $q->where(function (Builder $inner) use ($search): void {
                    $inner->where('slug', 'like', "%{$search}%")
                        ->orWhere('firstName', 'like', "%{$search}%")
                        ->orWhere('lastName', 'like', "%{$search}%")
                        ->orWhere('fullName', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%")
                        ->orWhere('phone', 'like', "%{$search}%")
                        ->orWhere('mobile', 'like', "%{$search}%");
                });
            })
            ->orderBy('slug')
            ->limit(50)
            ->get(['slug', 'fullName', 'wallet'])
            ->map(fn (Patient $patient) => [
                'slug' => $patient->slug,
                'label' => "{$patient->slug} - {$patient->fullName}",
                'wallet' => (float) ($patient->wallet ?? 0),
            ])->values();

        return response()->json($patients);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $this->validated($request);
        $teamId = $request->user()->currentTeam->getKey();
        $userId = $request->user()->getKey();

        DB::transaction(function () use ($data, $teamId, $userId): void {
            $method = Method::query()->whereKey($data['method_id'])->firstOrFail();
            $patientId = $data['patient_id'];
            $credit = (float) ($data['credit'] ?? 0);
            $debit = (float) ($data['debit'] ?? 0);
            $payment = null;

            // For Wallet method: only debit is allowed
            if ($method->name === 'Wallet') {
                $walletPatientId = $data['wallet_patient_id'] ?? $patientId;
                Patient::query()->where('slug', $walletPatientId)->decrement('wallet', $debit);

                WalletHistory::create([
                    'team_id' => $teamId,
                    'patient_id' => $walletPatientId,
                    'user_id' => $userId,
                    'method_id' => $method->getKey(),
                    'debit' => $debit,
                ]);
            } else {
                // For non-Wallet methods: credit (deposit) to patient wallet
                $payment = Payment::create([
                    'team_id' => $teamId,
                    'patient_id' => $patientId,
                    'user_id' => $userId,
                    'method_id' => $method->getKey(),
                    'amount' => $credit,
                ]);

                if ($method->name === 'Discount') {
                    $payment->amount = (float) ($data['discount_amount'] ?? 0);
                    $payment->save();
                }

                if (($data['coupon_id'] ?? null) && ($data['coupon_discount_amount'] ?? 0) > 0
                    && in_array($method->name, ['Mercy Fund', 'Infant Formula'], true)) {
                    $payment->couponUsage()->create([
                        'coupon_id' => $data['coupon_id'],
                        'user_id' => $userId,
                        'discount_amount' => $data['coupon_discount_amount'],
                    ]);
                }

                Patient::query()->where('slug', $patientId)->increment('wallet', $credit);

                WalletHistory::create([
                    'team_id' => $teamId,
                    'patient_id' => $patientId,
                    'user_id' => $userId,
                    'method_id' => $method->getKey(),
                    'payment_id' => $payment->getKey(),
                    'credit' => $credit,
                ]);
            }
        });

        return to_route('finance.wallet-history.index', $request->user()->currentTeam->slug);
    }

    public function destroy(Request $request, string $current_team, WalletHistory $wallet_history): RedirectResponse
    {
        $wallet_history->delete();

        return to_route('finance.wallet-history.index', $request->user()->currentTeam->slug);
    }

    public function update(Request $request, string $current_team, WalletHistory $wallet_history): RedirectResponse
    {
        $data = $this->validated($request);
        $wallet_history->update([
            'patient_id' => $data['patient_id'],
            'method_id' => $data['method_id'],
            'credit' => $data['credit'],
            'debit' => $data['debit'],
        ]);

        return to_route('finance.wallet-history.index', $request->user()->currentTeam->slug);
    }

    public function bulkDestroy(Request $request): RedirectResponse
    {
        $teamId = $request->user()->currentTeam->getKey();
        $data = $request->validate([
            'ids' => ['required', 'array', 'min:1'],
            'ids.*' => ['integer', Rule::exists('wallet_histories', 'id')->where('team_id', $teamId)],
        ]);
        WalletHistory::query()->whereIn('id', $data['ids'])->delete();

        return to_route('finance.wallet-history.index', $request->user()->currentTeam->slug);
    }

    /** @return array<string, mixed> */
    private function validated(Request $request): array
    {
        $teamId = $request->user()->currentTeam->getKey();
        $data = $request->validate([
            'patient_id' => ['required', 'string', Rule::exists('patients', 'slug')->where('team_id', $teamId)],
            'method_id' => ['required', 'integer', Rule::exists('methods', 'id')->where('team_id', $teamId)],
            'credit' => ['nullable', 'numeric', 'min:0'],
            'debit' => ['nullable', 'numeric', 'min:0'],
            'discount_amount' => ['nullable', 'numeric', 'min:0'],
            'coupon_id' => [
                'nullable',
                'integer',
                Rule::exists(Coupon::class, 'id')->where(fn ($query) => $query->where('team_id', $teamId)),
            ],
            'coupon_discount_amount' => ['nullable', 'numeric', 'min:0'],
            'wallet_patient_id' => [
                'nullable',
                'string',
                Rule::exists('patients', 'slug')->where('team_id', $teamId),
            ],
        ]);
        $method = Method::query()->whereKey($data['method_id'])->firstOrFail();
        $credit = (float) ($data['credit'] ?? 0);
        $debit = (float) ($data['debit'] ?? 0);

        // Wallet method: only debit (withdrawal) allowed, must have positive debit
        if ($method->name === 'Wallet') {
            if ($debit <= 0) {
                abort(422, 'Choose a positive withdrawal amount.');
            }
        } else {
            // Non-Wallet methods: only credit (deposit) allowed, must have positive credit
            if ($credit <= 0) {
                abort(422, 'Choose a positive deposit amount.');
            }
        }

        return [...$data, 'credit' => $credit, 'debit' => $debit];
    }

    /** @return array<string, mixed> */
    private function serialize(WalletHistory $history): array
    {
        $billableType = $history->payment?->billing?->billable_type;

        return [
            'id' => $history->id,
            'patientId' => $history->patient_id,
            'patientName' => $history->patient?->fullName,
            'patientWallet' => (float) ($history->patient->wallet ?? 0),
            'userName' => $history->user?->name,
            'methodName' => $history->method?->name,
            'billableType' => $billableType ? class_basename($billableType) : 'Deposit',
            'teamName' => $history->team?->name,
            'teamAddress' => $history->team?->address,
            'lines' => $history->lines->map(fn ($line): array => [
                'name' => $line->priceList?->name,
                'quantity' => (float) ($line->quantity ?? 1),
                'unitPrice' => (float) $line->unitPrice,
                'subtotal' => (float) ($line->quantity ? $line->totalPrice : $line->unitPrice),
            ])->all(),
            'credit' => (float) $history->credit,
            'debit' => (float) $history->debit,
            'balance' => (float) $history->balance,
            'createdAt' => $history->created_at?->toIso8601String(),
        ];
    }
}
