<?php

namespace App\Http\Controllers;

use App\Models\Line;
use App\Models\PriceList;
use App\Service\DashboardCurrency;
use Illuminate\Http\Request;
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
     * @param  array{from: string, to: string, perPage: int}  $filters
     * @return array<int, array{category: string, quantity: float, cost: float, price: float, amount: float}>
     */
    private function groupedSales(array $filters): array
    {
        $rows = Line::query()
            ->where('paid', true)
            ->where('unitPrice', '<>', 0)
            ->whereBetween('lines.created_at', [$filters['from'].' 00:00:00', $filters['to'].' 23:59:59'])
            ->join('price_lists as pl', 'pl.id', '=', 'lines.price_list_id')
            ->selectRaw('CASE WHEN pl.is_category = 1 THEN pl.id ELSE COALESCE(pl.category_id, 0) END as category_key, SUM(lines.quantity) as quantity, SUM(lines.totalCost) as cost, SUM(lines.unitPrice) as price, SUM(lines.totalPrice) as amount')
            ->groupBy('category_key')
            ->get();

        $names = PriceList::withoutGlobalScope('team')
            ->whereIn('id', $rows->pluck('category_key')->filter())
            ->pluck('name', 'id');

        $groups = [];

        foreach ($rows as $row) {
            $label = $row->category_key
                ? ($names[$row->category_key] ?? 'Unknown category')
                : 'Uncategorized';

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
