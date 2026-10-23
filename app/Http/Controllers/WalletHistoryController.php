<?php

namespace App\Http\Controllers;

use App\Models\Method;
use App\Models\Patient;
use App\Models\Payment;
use App\Models\WalletHistory;
use Illuminate\Database\Eloquent\Builder;
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
            'patients' => Patient::query()
                ->where('team_id', $teamId)
                ->orderBy('fullName')
                ->limit(200)
                ->get(['slug', 'fullName', 'wallet']),
            'methods' => Method::query()->orderBy('name')->limit(100)->get(['id', 'name']),
            'filters' => $filters,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $this->validated($request);
        DB::transaction(function () use ($data, $request): void {
            $method = Method::query()->whereKey($data['method_id'])->firstOrFail();
            $payment = null;

            if ($method->name !== 'Wallet') {
                $payment = Payment::create([
                    'team_id' => $request->user()->currentTeam->getKey(),
                    'patient_id' => $data['patient_id'],
                    'user_id' => $request->user()->getKey(),
                    'method_id' => $method->getKey(),
                    'amount' => $data['credit'],
                ]);
                Patient::query()->where('slug', $data['patient_id'])->increment('wallet', $data['credit']);
            }

            WalletHistory::create([
                'team_id' => $request->user()->currentTeam->getKey(),
                'patient_id' => $data['patient_id'],
                'user_id' => $request->user()->getKey(),
                'method_id' => $method->getKey(),
                'payment_id' => $payment?->getKey(),
                'credit' => $data['credit'],
                'debit' => $data['debit'],
            ]);
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
        ]);
        $method = Method::query()->whereKey($data['method_id'])->firstOrFail();
        $credit = (float) ($data['credit'] ?? 0);
        $debit = (float) ($data['debit'] ?? 0);

        if (($method->name === 'Wallet' && ($debit <= 0 || $credit > 0)) || ($method->name !== 'Wallet' && ($credit <= 0 || $debit > 0))) {
            abort(422, $method->name === 'Wallet' ? 'Choose a positive withdrawal amount.' : 'Choose a positive deposit amount.');
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
