<?php

namespace App\Http\Controllers;

use App\Models\Billing;
use App\Models\Line;
use App\Models\Method;
use App\Models\Patient;
use App\Models\Payment;
use App\Models\PriceList;
use App\Service\DashboardCurrency;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Query\Builder as QueryBuilder;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class SalesReportController extends Controller
{
    /** @var array<string, string> */
    private const DIMENSIONS = [
        'item' => 'Sales by item',
        'category' => 'Sales by category',
        'department' => 'Sales by department',
        'patient' => 'Sales by patient',
        'method' => 'Sales by payment method',
    ];

    public function index(Request $request, string $current_team, string $dimension = 'item'): Response
    {
        abort_unless(array_key_exists($dimension, self::DIMENSIONS), 404);

        $filters = $this->filters($request);
        $rows = $this->orderedQuery($dimension, $filters)
            ->paginate($filters['perPage'])
            ->withQueryString()
            ->through(fn (Line|Payment $record) => in_array($dimension, ['item', 'category'], true)
                ? $this->itemRow($record, $dimension)
                : $this->paymentRow($record, $dimension));

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
        $rows = $this->orderedQuery($dimension, $filters)->lazy(500);

        return response()->streamDownload(function () use ($rows, $dimension): void {
            $output = fopen('php://output', 'w');

            if (in_array($dimension, ['item', 'category'], true)) {
                $includeItem = $dimension === 'item';

                if ($includeItem) {
                    fputcsv($output, ['Hospital No.', 'Patient', 'Item', 'Quantity', 'Cost', 'Price', 'Subtotal', 'Date'], ',', '"', '\\');
                } else {
                    fputcsv($output, ['Hospital No.', 'Patient', 'Quantity', 'Cost', 'Price', 'Subtotal', 'Date'], ',', '"', '\\');
                }

                foreach ($rows as $line) {
                    if ($includeItem) {
                        fputcsv($output, [
                            $line->patient_id,
                            $line->patient?->fullName,
                            $line->priceList?->name,
                            $line->quantity,
                            $line->unitCost,
                            $line->unitPrice,
                            $line->totalPrice,
                            $line->created_at?->toDateTimeString(),
                        ], ',', '"', '\\');
                    } else {
                        fputcsv($output, [
                            $line->patient_id,
                            $line->patient?->fullName,
                            $line->quantity,
                            $line->unitCost,
                            $line->unitPrice,
                            $line->totalPrice,
                            $line->created_at?->toDateTimeString(),
                        ], ',', '"', '\\');
                    }
                }
            } else {
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

        if (in_array($dimension, ['item', 'category'], true)) {
            return [
                'transactions' => (clone $query)->count(),
                'items' => (clone $query)->distinct()->count('price_list_id'),
                'quantity' => (float) (clone $query)->sum('quantity'),
                'cost' => (float) (clone $query)->sum('totalCost'),
                'price' => (float) (clone $query)->sum('unitPrice'),
                'amount' => (float) (clone $query)->sum('totalPrice'),
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
        if (in_array($dimension, ['item', 'category'], true)) {
            return Line::query()
                ->where('paid', true)
                ->where('unitPrice', '<>', 0)
                ->whereBetween('lines.created_at', [$filters['from'].' 00:00:00', $filters['to'].' 23:59:59'])
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
            ->whereBetween('created_at', [$filters['from'].' 00:00:00', $filters['to'].' 23:59:59'])
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
     * @return Builder<Model>
     */
    private function orderedQuery(string $dimension, array $filters): Builder
    {
        $query = $this->query($dimension, $filters)->with(
            in_array($dimension, ['item', 'category'], true)
                ? ['priceList.category', 'patient']
                : ['patient', 'method', 'user', 'billing.lines.priceList.category']
        );

        return match ($dimension) {
            'item' => $query
                ->orderBy(PriceList::query()->select('name')->whereColumn('price_lists.id', 'lines.price_list_id'))
                ->orderByDesc('created_at'),
            'category' => $query
                ->orderBy(fn (QueryBuilder $q) => $q
                    ->select('cat.name')
                    ->from('price_lists as cat')
                    ->join('price_lists as pl', 'cat.id', '=', 'pl.category_id')
                    ->whereColumn('pl.id', 'lines.price_list_id')
                    ->limit(1)
                )
                ->orderByDesc('created_at'),
            'patient' => $query
                ->orderBy(Patient::query()->select('slug')->whereColumn('patients.slug', 'payments.patient_id'))
                ->orderByDesc('created_at'),
            'method' => $query
                ->orderBy(Method::query()->select('name')->whereColumn('methods.id', 'payments.method_id'))
                ->orderByDesc('created_at'),
            default => $query
                ->orderByDesc('created_at'),
        };
    }

    /** @return array<string, mixed> */
    private function itemRow(Line $line, string $dimension = 'item'): array
    {
        $group = $dimension === 'category'
            ? ($line->priceList?->category?->name ?? 'Uncategorized')
            : ($line->priceList?->name ?? 'Unknown item');

        $row = [
            'id' => $line->getKey(),
            'group' => $group,
            'patientId' => $line->patient_id,
            'patientName' => $line->patient?->fullName,
            'quantity' => (float) $line->quantity,
            'unitCost' => (float) $line->unitCost,
            'unitPrice' => (float) $line->unitPrice,
            'totalPrice' => (float) $line->totalPrice,
            'createdAt' => $line->created_at?->toIso8601String(),
        ];

        if ($dimension === 'item') {
            $row['item'] = $line->priceList?->name ?? 'Unknown item';
        }

        return $row;
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
            return 'Wallet Deposit';
        }

        $category = $this->getCategoryFromBilling($payment->billing);

        return $category ?? 'Unknown';
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
        $query = $this->query($dimension, $filters);

        if ($dimension === 'item') {
            $rows = (clone $query)
                ->selectRaw('price_list_id, SUM(quantity) as quantity, SUM(totalCost) as cost, SUM(unitPrice) as price, SUM(totalPrice) as amount')
                ->groupBy('price_list_id')
                ->get();

            $names = PriceList::query()
                ->whereIn('id', $rows->pluck('price_list_id'))
                ->pluck('name', 'id');

            $totals = [];

            foreach ($rows as $row) {
                $totals[$names[$row->price_list_id] ?? 'Unknown item'] = [
                    'quantity' => (float) $row->quantity,
                    'cost' => (float) $row->cost,
                    'price' => (float) $row->price,
                    'amount' => (float) $row->amount,
                ];
            }

            return $totals;
        }

        if ($dimension === 'category') {
            $rows = (clone $query)
                ->join('price_lists as pl', 'pl.id', '=', 'lines.price_list_id')
                ->selectRaw('COALESCE(pl.category_id, 0) as category_key, SUM(lines.quantity) as quantity, SUM(lines.totalCost) as cost, SUM(lines.unitPrice) as price, SUM(lines.totalPrice) as amount')
                ->groupBy('category_key')
                ->get();

            $names = PriceList::query()
                ->whereIn('id', $rows->pluck('category_key')->filter())
                ->pluck('name', 'id');

            $totals = [];

            foreach ($rows as $row) {
                $label = $row->category_key
                    ? ($names[$row->category_key] ?? 'Unknown category')
                    : 'Uncategorized';

                $totals[$label] = [
                    'quantity' => (float) $row->quantity,
                    'cost' => (float) $row->cost,
                    'price' => (float) $row->price,
                    'amount' => (float) $row->amount,
                ];
            }

            return $totals;
        }

        if ($dimension === 'department') {
            $rows = (clone $query)
                ->selectRaw('billing_id, SUM(amount) as amount, SUM(discount_amount) as discount, SUM(wallet) as wallet, SUM(mercy_fund) as mercy_fund, SUM(infant_formula) as infant_formula')
                ->groupBy('billing_id')
                ->get();

            $billings = Billing::query()
                ->whereIn('id', $rows->pluck('billing_id')->filter())
                ->get()
                ->keyBy('id');

            $totals = [];

            foreach ($rows as $row) {
                $billing = $row->billing_id ? $billings->get($row->billing_id) : null;

                $label = ! $billing
                    ? 'Wallet Deposit'
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
