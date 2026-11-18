<?php

namespace App\Http\Controllers;

use App\Models\PriceList;
use App\Models\WalletHistory;
use App\Service\DashboardCurrency;
use Illuminate\Database\Query\JoinClause;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class CategorySalesReportController extends Controller
{
    public function index(Request $request, string $current_team): Response
    {
        $filters = $this->filters($request);
        $groups = $this->groupedSales($filters);
        $summary = $this->summary($groups);

        return Inertia::render('reports/category-sales-summary', [
            'groups' => $groups,
            'summary' => $summary,
            'filters' => $filters,
            'currencySymbol' => DashboardCurrency::symbol(),
        ]);
    }

    public function export(Request $request, string $current_team): StreamedResponse
    {
        $filters = $this->filters($request);
        $groups = $this->groupedSales($filters);

        return response()->streamDownload(function () use ($groups): void {
            $output = fopen('php://output', 'w');
            fputcsv($output, ['Category', 'Quantity', 'Cost', 'Price', 'Subtotal'], ',', '"', '\\');

            foreach ($groups as $group) {
                fputcsv($output, [
                    $group['category'],
                    $group['quantity'],
                    $group['cost'],
                    $group['price'],
                    $group['amount'],
                ], ',', '"', '\\');
            }

            fclose($output);
        }, 'category-sales-summary.csv', ['Content-Type' => 'text/csv']);
    }

    /**
     * Group sales by category, summing actual payment amounts collected.
     *
     * This method starts from payments (not lines) to ensure the category sales
     * subtotal equals the payment method subtotal. It allocates each payment's
     * amount proportionally to the categories represented in the billing's lines.
     *
     * Deposit payments (wallet credits without a billing) are also included,
     * using their associated WalletHistory lines to determine the Deposit category.
     *
     * @param  array{from: string, to: string, perPage: int}  $filters
     * @return array<int, array{category: string, quantity: float, cost: float, price: float, amount: float}>
     */
    private function groupedSales(array $filters): array
    {
        // Get payments linked to billings, allocated proportionally to line categories.
        // We rely on lines.paid to determine what was actually paid, not the billing status,
        // because some billable types (e.g., Patient for consultations/registrations) never
        // reach "paid" status but still have paid lines.
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
            ->selectRaw('
                CASE WHEN pl.is_category = 1 THEN pl.id ELSE COALESCE(pl.category_id, 0) END as category_key,
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
            ->groupBy('category_key')
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
            ->selectRaw('
                CASE WHEN pl.is_category = 1 THEN pl.id ELSE COALESCE(pl.category_id, 0) END as category_key,
                SUM(lines.quantity) as quantity,
                SUM(lines.totalCost) as cost,
                SUM(lines.unitPrice) as price,
                SUM(lines.totalPrice) as amount
            ')
            ->groupBy('category_key')
            ->get();

        // Merge billing rows and deposit rows into a unified result set.
        $allRows = collect();
        foreach ($billingRows as $row) {
            $allRows->push((array) $row);
        }
        foreach ($depositRows as $row) {
            $allRows->push((array) $row);
        }

        // Aggregate rows that share the same category_key (e.g., if both billing
        // lines and deposit lines fall under the same category).
        $merged = $allRows->groupBy('category_key')->map(function ($items, $categoryKey) {
            return (object) [
                'category_key' => $categoryKey,
                'quantity' => $items->sum('quantity'),
                'cost' => $items->sum('cost'),
                'price' => $items->sum('price'),
                'amount' => $items->sum('amount'),
            ];
        })->values();

        $names = PriceList::withoutGlobalScope('team')
            ->whereIn('id', $merged->pluck('category_key')->filter())
            ->pluck('name', 'id');

        // Display name mappings for categories in the report.
        $displayNames = [
            'Billing' => 'Reg/Cons',
        ];

        $groups = [];

        foreach ($merged as $row) {
            $label = $row->category_key
                ? ($names[$row->category_key] ?? 'Unknown category')
                : 'Uncategorized';

            // Apply display name mapping if one exists.
            $label = $displayNames[$label] ?? $label;

            $groups[] = [
                'category' => $label,
                'quantity' => (float) $row->quantity,
                'cost' => (float) $row->cost,
                'price' => (float) $row->price,
                'amount' => (float) $row->amount,
            ];
        }

        usort($groups, fn (array $a, array $b) => strcmp($a['category'], $b['category']));

        return $groups;
    }

    /**
     * @param  array<int, array{category: string, quantity: float, cost: float, price: float, amount: float}>  $groups
     * @return array{totalQuantity: float, totalCost: float, totalPrice: float, totalAmount: float, categories: int}
     */
    private function summary(array $groups): array
    {
        return [
            'categories' => count($groups),
            'totalQuantity' => array_sum(array_column($groups, 'quantity')),
            'totalCost' => array_sum(array_column($groups, 'cost')),
            'totalPrice' => array_sum(array_column($groups, 'price')),
            'totalAmount' => array_sum(array_column($groups, 'amount')),
        ];
    }

    /** @return array{from: string, to: string, perPage: int} */
    private function filters(Request $request): array
    {
        $validated = $request->validate([
            'from' => ['nullable', 'date'],
            'to' => ['nullable', 'date', 'after_or_equal:from'],
            'perPage' => ['nullable', 'integer', Rule::in([10, 25, 50, 100])],
        ]);

        return [
            'from' => $validated['from'] ?? today()->toDateString(),
            'to' => $validated['to'] ?? today()->toDateString(),
            'perPage' => (int) ($validated['perPage'] ?? 25),
        ];
    }
}
