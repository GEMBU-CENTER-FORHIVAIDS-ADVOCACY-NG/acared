<?php

namespace App\Http\Controllers;

use App\Models\Billing;
use App\Models\Line;
use App\Models\Method;
use App\Models\Patient;
use App\Models\Payment;
use App\Models\PriceList;
use App\Models\WalletHistory;
use App\Service\DashboardCurrency;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Query\Builder as QueryBuilder;
use Illuminate\Database\Query\JoinClause;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class SalesReportController extends Controller
{
    /** @var array<string, string> */
    private const DIMENSIONS = [
        'item' => 'Sales by item',
        'department' => 'Sales by department',
        'patient' => 'Sales by patient',
        'method' => 'Sales by payment method',
    ];

    public function index(Request $request, string $current_team, string $dimension = 'item'): Response
    {
        abort_unless(array_key_exists($dimension, self::DIMENSIONS), 404);

        $filters = $this->filters($request);

        if ($dimension === 'item') {
            $items = $this->aggregatedItemQuery($filters);
            $rows = new LengthAwarePaginator(
                collect($items)->forPage($request->input('page', 1), $filters['perPage']),
                count($items),
                $filters['perPage'],
                $request->input('page', 1),
                ['path' => $request->url(), 'queryStrings' => $request->query()]
            )->through(fn (object $record) => $this->aggregatedItemRow($record));
        } elseif ($dimension === 'patient') {
            $rows = $this->aggregatedPatientQuery($filters)
                ->paginate($filters['perPage'])
                ->withQueryString()
                ->through(fn (object $record) => $this->aggregatedPatientRow($record));
        } elseif ($dimension === 'method') {
            $rows = $this->aggregatedPaymentMethodQuery($filters)
                ->paginate($filters['perPage'])
                ->withQueryString()
                ->through(fn (object $record) => $this->aggregatedPaymentMethodRow($record));
        } else {
            $rows = $this->orderedQuery($dimension, $filters)
                ->paginate($filters['perPage'])
                ->withQueryString()
                ->through(fn (Line|Payment $record) => $dimension === 'item'
                    ? $this->itemRow($record, $dimension)
                    : $this->paymentRow($record, $dimension));
        }

        return Inertia::render('reports/sales/index', [
            'report' => ['key' => $dimension, 'title' => self::DIMENSIONS[$dimension]],
            'rows' => $rows,
            'summary' => $this->summary($dimension, $filters),
            'groupTotals' => $this->groupTotals($dimension, $filters),
            'filters' => $filters,
            'dimensions' => self::DIMENSIONS,
            'currencySymbol' => DashboardCurrency::symbol(),
        ]);
    }

    public function export(Request $request, string $current_team, string $dimension): StreamedResponse
    {
        abort_unless(array_key_exists($dimension, self::DIMENSIONS), 404);

        $filters = $this->filters($request);

        if ($dimension === 'item') {
            $items = $this->aggregatedItemQuery($filters);

            return response()->streamDownload(function () use ($items): void {
                $output = fopen('php://output', 'w');
                fputcsv($output, ['Item', 'Quantity', 'Cost', 'Price', 'Subtotal'], ',', '"', '\\');

                foreach ($items as $item) {
                    fputcsv($output, [
                        $item['item_name'] ?? 'Unknown item',
                        $item['quantity'],
                        $item['cost'],
                        $item['price'],
                        $item['amount'],
                    ], ',', '"', '\\');
                }

                fclose($output);
            }, 'sales-item-report.csv', ['Content-Type' => 'text/csv']);
        }

        $rows = $this->orderedQuery($dimension, $filters)->lazy(500);

        return response()->streamDownload(function () use ($rows, $dimension): void {
            $output = fopen('php://output', 'w');

            $includeDepartment = $dimension === 'department';

            if ($includeDepartment) {
                fputcsv($output, ['Hospital No.', 'Patient Name', 'Received By', 'Department', 'Payment Method', 'Amount', 'Discount', 'Wallet', 'Mercy Fund', 'Infant Formula', 'Date'], ',', '"', '\\');
            } else {
                fputcsv($output, ['Hospital No.', 'Patient Name', 'Received By', 'Payment Method', 'Amount', 'Discount', 'Wallet', 'Mercy Fund', 'Infant Formula', 'Date'], ',', '"', '\\');
            }

            foreach ($rows as $payment) {
                if ($includeDepartment) {
                    fputcsv($output, [
                        $payment->patient_id,
                        $payment->patient?->fullName,
                        $payment->user?->name,
                        $this->department($payment),
                        $payment->method?->name,
                        $payment->amount,
                        $payment->discount_amount,
                        $payment->wallet,
                        $payment->mercy_fund,
                        $payment->infant_formula,
                        $payment->created_at?->toDateTimeString(),
                    ], ',', '"', '\\');
                } else {
                    fputcsv($output, [
                        $payment->patient_id,
                        $payment->patient?->fullName,
                        $payment->user?->name,
                        $payment->method?->name,
                        $payment->amount,
                        $payment->discount_amount,
                        $payment->wallet,
                        $payment->mercy_fund,
                        $payment->infant_formula,
                        $payment->created_at?->toDateTimeString(),
                    ], ',', '"', '\\');
                }
            }

            fclose($output);
        }, 'sales-'.$dimension.'-report.csv', ['Content-Type' => 'text/csv']);
    }

    /**
     * @param  array{from: string, to: string, q: string, perPage: int}  $filters
     * @return array<string, float|int>
     */
    private function summary(string $dimension, array $filters): array
    {
        $query = $this->query($dimension, $filters);

        if ($dimension === 'item') {
            $items = $this->aggregatedItemQuery($filters);

            return [
                'transactions' => count($items),
                'items' => count($items),
                'quantity' => array_sum(array_column($items, 'quantity')),
                'cost' => array_sum(array_column($items, 'cost')),
                'price' => array_sum(array_column($items, 'price')),
                'amount' => array_sum(array_column($items, 'amount')),
            ];
        }

        if ($dimension === 'patient') {
            return [
                'transactions' => (clone $query)->distinct()->count('patient_id'),
                'amount' => (float) (clone $query)->sum('amount'),
                'discount' => (float) (clone $query)->sum('discount_amount'),
                'wallet' => (float) (clone $query)->sum('wallet'),
                'mercyFund' => (float) (clone $query)->sum('mercy_fund'),
                'infantFormula' => (float) (clone $query)->sum('infant_formula'),
            ];
        }

        if ($dimension === 'method') {
            return [
                'transactions' => (clone $query)->distinct()->count('method_id'),
                'amount' => (float) (clone $query)->sum('amount'),
                'discount' => (float) (clone $query)->sum('discount_amount'),
                'wallet' => (float) (clone $query)->sum('wallet'),
                'mercyFund' => (float) (clone $query)->sum('mercy_fund'),
                'infantFormula' => (float) (clone $query)->sum('infant_formula'),
            ];
        }

        return [
            'transactions' => (clone $query)->count(),
            'amount' => (float) (clone $query)->sum('amount'),
            'discount' => (float) (clone $query)->sum('discount_amount'),
            'wallet' => (float) (clone $query)->sum('wallet'),
            'mercyFund' => (float) (clone $query)->sum('mercy_fund'),
            'infantFormula' => (float) (clone $query)->sum('infant_formula'),
        ];
    }

    /**
     * @param  array{from: string, to: string, q: string, perPage: int}  $filters
     * @return Builder<Model>
     */
    private function query(string $dimension, array $filters): Builder
    {
        if ($dimension === 'item') {
            return Line::query()
                ->where('paid', true)
                ->where('unitPrice', '<>', 0)
                ->whereExists(function (QueryBuilder $query) use ($filters): void {
                    $query->from('billings')
                        ->whereColumn('billings.billable_id', 'lines.lineable_id')
                        ->whereColumn('billings.billable_type', 'lines.lineable_type')
                        ->where('billings.status', 'paid')
                        ->whereExists(function (QueryBuilder $q) use ($filters): void {
                            $q->from('payments')
                                ->whereColumn('payments.billing_id', 'billings.id')
                                ->whereBetween('payments.created_at', [$filters['from'].' 00:00:00', $filters['to'].' 23:59:59']);
                        });
                })
                ->when($filters['q'] !== '', function (Builder $query) use ($filters): void {
                    $search = '%'.$filters['q'].'%';

                    $query->where(function (Builder $query) use ($search): void {
                        $query->where('patient_id', 'like', $search)
                            ->orWhereHas('patient', fn (Builder $relation): Builder => $relation->where('fullName', 'like', $search))
                            ->orWhereHas('priceList', fn (Builder $relation): Builder => $relation->where('name', 'like', $search));
                    });
                });
        }

        return Payment::query()
            ->where(function (Builder $query) use ($filters): void {
                $query->whereBetween('created_at', [$filters['from'].' 00:00:00', $filters['to'].' 23:59:59']);
            })
            ->when($filters['q'] !== '', function (Builder $query) use ($filters): void {
                $search = '%'.$filters['q'].'%';

                $query->where(function (Builder $query) use ($search): void {
                    $query->where('patient_id', 'like', $search)
                        ->orWhereHas('patient', fn (Builder $relation): Builder => $relation->where('fullName', 'like', $search))
                        ->orWhereHas('method', fn (Builder $relation): Builder => $relation->where('name', 'like', $search))
                        ->orWhereHas('user', fn (Builder $relation): Builder => $relation->where('name', 'like', $search))
                        ->orWhereHas('billing.lines.priceList.category', fn (Builder $relation): Builder => $relation->where('name', 'like', $search));
                });
            });
    }

    /**
     * @param  array{from: string, to: string, q: string, perPage: int}  $filters
     * @return array<int, array<string, mixed>>
     */
    private function aggregatedItemQuery(array $filters): array
    {
        // Get payments linked to billings, allocated proportionally to line items.
        // We rely on lines.paid to determine what was actually paid, not the billing status.
        $billingRows = DB::table('payments')
            ->whereBetween('payments.created_at', [$filters['from'].' 00:00:00', $filters['to'].' 23:59:59'])
            ->join('billings', 'billings.id', '=', 'payments.billing_id')
            ->where('billings.billable_type', '<>', WalletHistory::class)
            ->join('lines', function (JoinClause $join): void {
                $join->on('lines.lineable_id', '=', 'billings.billable_id')
                    ->on('lines.lineable_type', '=', DB::raw('billings.billable_type'));
            })
            ->where('lines.paid', true)
            ->where('lines.unitPrice', '<>', 0)
            ->join('price_lists as pl', 'pl.id', '=', 'lines.price_list_id')
            ->when($filters['q'] !== '', function (QueryBuilder $query) use ($filters): void {
                $search = '%'.$filters['q'].'%';
                $query->where('pl.name', 'like', $search);
            })
            ->selectRaw('
                pl.id as price_list_id,
                pl.name as item_name,
                SUM(lines.quantity) as quantity,
                SUM(lines.totalCost) as cost,
                SUM(lines.unitPrice) as price,
                SUM(
                    (payments.amount + payments.wallet + payments.mercy_fund + payments.infant_formula)
                    * lines.totalPrice
                    / NULLIF(
                        (
                            SELECT SUM(l2.totalPrice)
                            FROM `lines` as l2
                            WHERE l2.lineable_id = billings.billable_id
                            AND l2.lineable_type = billings.billable_type
                            AND l2.paid = 1
                            AND l2.unitPrice <> 0
                        ), 0
                    )
                ) as amount
            ')
            ->groupBy('pl.id', 'pl.name')
            ->get();

        // Get deposit payments (no billing_id) that have WalletHistory lines.
        // All deposit lines use lineable_type = WalletHistory::class.
        $depositRows = DB::table('payments')
            ->whereNull('billing_id')
            ->whereBetween('payments.created_at', [$filters['from'].' 00:00:00', $filters['to'].' 23:59:59'])
            ->join('wallet_histories', 'wallet_histories.payment_id', '=', 'payments.id')
            ->join('lines', 'lines.lineable_id', '=', 'wallet_histories.id')
            ->where('lines.lineable_type', WalletHistory::class)
            ->where('lines.paid', true)
            ->where('lines.unitPrice', '<>', 0)
            ->join('price_lists as pl', 'pl.id', '=', 'lines.price_list_id')
            ->when($filters['q'] !== '', function (QueryBuilder $query) use ($filters): void {
                $search = '%'.$filters['q'].'%';
                $query->where('pl.name', 'like', $search);
            })
            ->selectRaw('
                pl.id as price_list_id,
                pl.name as item_name,
                SUM(lines.quantity) as quantity,
                SUM(lines.totalCost) as cost,
                SUM(lines.unitPrice) as price,
                SUM(lines.totalPrice) as amount
            ')
            ->groupBy('pl.id', 'pl.name')
            ->get();

        // Merge all rows and aggregate by price_list_id.
        $allRows = collect();
        foreach ($billingRows as $row) {
            $allRows->push((array) $row);
        }
        foreach ($depositRows as $row) {
            $allRows->push((array) $row);
        }

        $merged = $allRows->groupBy('price_list_id')->map(function ($items, $priceListId) {
            $firstItem = $items->first();

            return (object) [
                'price_list_id' => $priceListId,
                'item_name' => $firstItem['item_name'] ?? 'Unknown item',
                'quantity' => $items->sum('quantity'),
                'cost' => $items->sum('cost'),
                'price' => $items->sum('price'),
                'amount' => $items->sum('amount'),
            ];
        })->values()->sortBy('item_name')->values();

        return $merged->toArray();
    }

    /** @return array<string, mixed> */
    private function aggregatedItemRow(object $record): array
    {
        return [
            'id' => $record->price_list_id,
            'group' => $record->item_name ?? 'Unknown item',
            'item' => $record->item_name ?? 'Unknown item',
            'quantity' => (float) $record->quantity,
            'unitCost' => (float) $record->cost,
            'unitPrice' => (float) $record->price,
            'totalPrice' => (float) $record->amount,
        ];
    }

    /**
     * @param  array{from: string, to: string, q: string, perPage: int}  $filters
     */
    private function aggregatedPatientQuery(array $filters): QueryBuilder
    {
        $query = DB::table('payments')
            ->whereBetween('payments.created_at', [$filters['from'].' 00:00:00', $filters['to'].' 23:59:59'])
            ->when($filters['q'] !== '', function (QueryBuilder $query) use ($filters): void {
                $search = '%'.$filters['q'].'%';
                $query->where(function (QueryBuilder $query) use ($search): void {
                    $query->where('payments.patient_id', 'like', $search)
                        ->orWhereExists(fn (QueryBuilder $q) => $q
                            ->from('patients')
                            ->whereColumn('patients.slug', 'payments.patient_id')
                            ->where('patients.fullName', 'like', $search));
                });
            })
            ->selectRaw('payments.patient_id, SUM(payments.amount) as amount, SUM(payments.discount_amount) as discount, SUM(payments.wallet) as wallet, SUM(payments.mercy_fund) as mercy_fund, SUM(payments.infant_formula) as infant_formula, COUNT(*) as transactions')
            ->groupBy('payments.patient_id')
            ->orderBy('payments.patient_id');

        return $query;
    }

    /** @return array<string, mixed> */
    private function aggregatedPatientRow(object $record): array
    {
        $name = DB::table('patients')->where('slug', $record->patient_id)->value('fullName');

        return [
            'id' => $record->patient_id,
            'group' => trim($record->patient_id.' '.($name ?? '')),
            'patientId' => $record->patient_id,
            'patientName' => $name,
            'amount' => (float) $record->amount,
            'discountAmount' => (float) $record->discount,
            'wallet' => (float) $record->wallet,
            'mercyFund' => (float) $record->mercy_fund,
            'infantFormula' => (float) $record->infant_formula,
            'transactions' => (int) $record->transactions,
        ];
    }

    /**
     * @param  array{from: string, to: string, q: string, perPage: int}  $filters
     */
    private function aggregatedPaymentMethodQuery(array $filters): QueryBuilder
    {
        $query = DB::table('payments')
            ->whereBetween('payments.created_at', [$filters['from'].' 00:00:00', $filters['to'].' 23:59:59'])
            ->when($filters['q'] !== '', function (QueryBuilder $query) use ($filters): void {
                $search = '%'.$filters['q'].'%';
                $query->where(function (QueryBuilder $query) use ($search): void {
                    $query->where('payments.patient_id', 'like', $search)
                        ->orWhereExists(fn (QueryBuilder $q) => $q
                            ->from('patients')
                            ->whereColumn('patients.slug', 'payments.patient_id')
                            ->where('patients.fullName', 'like', $search))
                        ->orWhereExists(fn (QueryBuilder $q) => $q
                            ->from('methods')
                            ->whereColumn('methods.id', 'payments.method_id')
                            ->where('methods.name', 'like', $search));
                });
            })
            ->selectRaw('payments.method_id, SUM(payments.amount) as amount, SUM(payments.discount_amount) as discount, SUM(payments.wallet) as wallet, SUM(payments.mercy_fund) as mercy_fund, SUM(payments.infant_formula) as infant_formula, COUNT(*) as transactions')
            ->groupBy('payments.method_id')
            ->orderBy('payments.method_id');

        return $query;
    }

    /** @return array<string, mixed> */
    private function aggregatedPaymentMethodRow(object $record): array
    {
        $methodName = DB::table('methods')->where('id', $record->method_id)->value('name');

        return [
            'id' => (string) $record->method_id,
            'group' => $methodName ?? 'Unknown method',
            'methodName' => $methodName,
            'amount' => (float) $record->amount,
            'discountAmount' => (float) $record->discount,
            'wallet' => (float) $record->wallet,
            'mercyFund' => (float) $record->mercy_fund,
            'infantFormula' => (float) $record->infant_formula,
            'transactions' => (int) $record->transactions,
        ];
    }

    /**
     * @param  array{from: string, to: string, q: string, perPage: int}  $filters
     * @return Builder<Model>
     */
    private function orderedQuery(string $dimension, array $filters): Builder
    {
        $query = $this->query($dimension, $filters)->with(
            $dimension === 'item'
                ? ['priceList' => fn ($relation) => $relation->withoutGlobalScope('team'), 'priceList.category' => fn ($relation) => $relation->withoutGlobalScope('team'), 'patient']
                : ['patient', 'method', 'user', 'billing.lines.priceList' => fn ($relation) => $relation->withoutGlobalScope('team'), 'billing.lines.priceList.category' => fn ($relation) => $relation->withoutGlobalScope('team')]
        );

        return match ($dimension) {
            'item' => $query
                ->orderBy(PriceList::withoutGlobalScope('team')->select('name')->whereColumn('price_lists.id', 'lines.price_list_id'))
                ->orderByDesc('lines.created_at'),
            'patient' => $query
                ->orderBy(Patient::query()->select('slug')->whereColumn('patients.slug', 'payments.patient_id'))
                ->orderByDesc('payments.created_at'),
            'method' => $query
                ->orderBy(Method::query()->select('name')->whereColumn('methods.id', 'payments.method_id'))
                ->orderByDesc('payments.created_at'),
            default => $query
                ->orderByDesc('payments.created_at'),
        };
    }

    /** @return array<string, mixed> */
    private function itemRow(Line $line): array
    {
        return [
            'id' => $line->getKey(),
            'group' => $line->priceList?->name ?? 'Unknown item',
            'patientId' => $line->patient_id,
            'patientName' => $line->patient?->fullName,
            'item' => $line->priceList?->name ?? 'Unknown item',
            'quantity' => (float) $line->quantity,
            'unitCost' => (float) $line->unitCost,
            'unitPrice' => (float) $line->unitPrice,
            'totalPrice' => (float) $line->totalPrice,
            'createdAt' => $line->created_at?->toIso8601String(),
        ];
    }

    /** @return array<string, mixed> */
    private function paymentRow(Payment $payment, string $dimension): array
    {
        $row = [
            'id' => $payment->getKey(),
            'group' => $this->group($payment, $dimension),
            'patientId' => $payment->patient_id,
            'patientName' => $payment->patient?->fullName,
            'receivedBy' => $payment->user?->name,
            'method' => $payment->method?->name,
            'amount' => (float) $payment->amount,
            'discountAmount' => (float) $payment->discount_amount,
            'wallet' => (float) $payment->wallet,
            'mercyFund' => (float) $payment->mercy_fund,
            'infantFormula' => (float) $payment->infant_formula,
            'createdAt' => $payment->created_at?->toIso8601String(),
        ];

        if ($dimension === 'department') {
            $row['department'] = $this->department($payment);
        }

        return $row;
    }

    private function group(Payment $payment, string $dimension): string
    {
        return match ($dimension) {
            'patient' => trim($payment->patient_id.' '.($payment->patient?->fullName ?? '')),
            'method' => $payment->method?->name ?? 'Unknown method',
            default => $this->department($payment),
        };
    }

    private function department(Payment $payment): string
    {
        if (! $payment->billing) {
            $category = $this->getCategoryFromPayment($payment);

            return $category ?? 'Wallet Deposit';
        }

        $category = $this->getCategoryFromBilling($payment->billing);

        return $category ?? 'Unknown';
    }

    private function getCategoryFromPayment(Payment $payment): ?string
    {
        return $this->getCategoryFromPayments([$payment->id]);
    }

    /**
     * Resolve the category name from a set of payment IDs (for older deposits without billing).
     *
     * @param  array<int>  $paymentIds
     */
    private function getCategoryFromPayments(array $paymentIds): ?string
    {
        if ($paymentIds === []) {
            return null;
        }

        return Line::query()
            ->where('lineable_type', WalletHistory::class)
            ->whereExists(function (QueryBuilder $q) use ($paymentIds): void {
                $q->from('wallet_histories')
                    ->whereColumn('wallet_histories.id', 'lines.lineable_id')
                    ->whereIn('wallet_histories.payment_id', $paymentIds);
            })
            ->join('price_lists', 'price_lists.id', '=', 'lines.price_list_id')
            ->whereNotNull('price_lists.category_id')
            ->join('price_lists as categories', 'categories.id', '=', 'price_lists.category_id')
            ->select('categories.name')
            ->first()?->name;
    }

    private function getCategoryFromBilling(Billing $billing): ?string
    {
        $lineableType = $billing->billable_type;
        $lineableId = $billing->billable_id;

        return Line::query()
            ->where('lineable_id', $lineableId)
            ->where('lineable_type', $lineableType)
            ->join('price_lists', 'price_lists.id', '=', 'lines.price_list_id')
            ->whereNotNull('price_lists.category_id')
            ->join('price_lists as categories', 'categories.id', '=', 'price_lists.category_id')
            ->select('categories.name')
            ->first()?->name;
    }

    /**
     * @param  array{from: string, to: string, q: string, perPage: int}  $filters
     * @return array<string, array<string, float>>
     */
    private function groupTotals(string $dimension, array $filters): array
    {
        if ($dimension === 'item') {
            $items = $this->aggregatedItemQuery($filters);

            $totals = [];

            foreach ($items as $item) {
                $totals[$item->item_name ?? 'Unknown item'] = [
                    'quantity' => (float) $item->quantity,
                    'cost' => (float) $item->cost,
                    'price' => (float) $item->price,
                    'amount' => (float) $item->amount,
                ];
            }

            return $totals;
        }

        $query = $this->query($dimension, $filters);

        if ($dimension === 'department') {
            $rows = (clone $query)
                ->selectRaw('billing_id, SUM(amount) as amount, SUM(discount_amount) as discount, SUM(wallet) as wallet, SUM(mercy_fund) as mercy_fund, SUM(infant_formula) as infant_formula')
                ->groupBy('billing_id')
                ->get();

            $billings = Billing::query()
                ->whereIn('id', $rows->pluck('billing_id')->filter())
                ->get()
                ->keyBy('id');

            // For payments without a billing (older deposits), resolve category from wallet_histories → lines.
            $nullBillingPayments = (clone $query)
                ->whereNull('billing_id')
                ->select('id')
                ->get();

            $nullBillingCategory = $nullBillingPayments->isNotEmpty()
                ? $this->getCategoryFromPayments($nullBillingPayments->pluck('id')->toArray())
                : null;

            $totals = [];

            foreach ($rows as $row) {
                $billing = $row->billing_id ? $billings->get($row->billing_id) : null;

                $label = ! $billing
                    ? ($nullBillingCategory ?? 'Wallet Deposit')
                    : ($this->getCategoryFromBilling($billing) ?? 'Unknown');

                $this->addPaymentTotals($totals, $label, $row);
            }

            return $totals;
        }

        $key = $dimension === 'patient' ? 'patient_id' : 'method_id';

        $rows = (clone $query)
            ->selectRaw($key.' as group_key, SUM(amount) as amount, SUM(discount_amount) as discount, SUM(wallet) as wallet, SUM(mercy_fund) as mercy_fund, SUM(infant_formula) as infant_formula')
            ->groupBy($key)
            ->get();

        $labels = $dimension === 'patient'
            ? Patient::query()->whereIn('slug', $rows->pluck('group_key'))->pluck('fullName', 'slug')
            : Method::query()->whereIn('id', $rows->pluck('group_key'))->pluck('name', 'id');

        $totals = [];

        foreach ($rows as $row) {
            $label = $dimension === 'patient'
                ? trim($row->group_key.' '.($labels[$row->group_key] ?? ''))
                : ($labels[$row->group_key] ?? 'Unknown method');

            $this->addPaymentTotals($totals, $label, $row);
        }

        return $totals;
    }

    /**
     * @param  array<string, array<string, float>>  $totals
     */
    private function addPaymentTotals(array &$totals, string $label, object $row): void
    {
        $totals[$label] ??= [
            'amount' => 0.0,
            'discount' => 0.0,
            'wallet' => 0.0,
            'mercyFund' => 0.0,
            'infantFormula' => 0.0,
        ];

        $totals[$label]['amount'] += (float) $row->amount;
        $totals[$label]['discount'] += (float) $row->discount;
        $totals[$label]['wallet'] += (float) $row->wallet;
        $totals[$label]['mercyFund'] += (float) $row->mercy_fund;
        $totals[$label]['infantFormula'] += (float) $row->infant_formula;
    }

    /** @return array{from: string, to: string, q: string, perPage: int} */
    private function filters(Request $request): array
    {
        $validated = $request->validate([
            'q' => ['nullable', 'string', 'max:255'],
            'from' => ['nullable', 'date'],
            'to' => ['nullable', 'date', 'after_or_equal:from'],
            'perPage' => ['nullable', 'integer', Rule::in([10, 25, 50, 100])],
        ]);

        return [
            'from' => $validated['from'] ?? today()->toDateString(),
            'to' => $validated['to'] ?? today()->toDateString(),
            'q' => trim((string) ($validated['q'] ?? '')),
            'perPage' => (int) ($validated['perPage'] ?? 25),
        ];
    }
}
