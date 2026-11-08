<?php

namespace App\Http\Controllers;

use App\Models\Method;
use App\Models\Payment;
use App\Service\DashboardCurrency;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class PaymentMethodSalesReportController extends Controller
{
    public function index(Request $request, string $current_team): Response
    {
        $filters = $this->filters($request);
        $groups = $this->groupedSales($filters);
        $summary = $this->summary($groups);

        return Inertia::render('reports/payment-method-sales-summary', [
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
            fputcsv($output, ['Payment Method', 'Transactions', 'Amount', 'Discount', 'Wallet', 'Mercy Fund', 'Infant Formula'], ',', '"', '\\');

            foreach ($groups as $group) {
                fputcsv($output, [
                    $group['method'],
                    $group['transactions'],
                    $group['amount'],
                    $group['discount'],
                    $group['wallet'],
                    $group['mercyFund'],
                    $group['infantFormula'],
                ], ',', '"', '\\');
            }

            fclose($output);
        }, 'payment-method-sales-summary.csv', ['Content-Type' => 'text/csv']);
    }

    /**
     * @param  array{from: string, to: string, perPage: int}  $filters
     * @return array<int, array{method: string, transactions: int, amount: float, discount: float, wallet: float, mercyFund: float, infantFormula: float}>
     */
    private function groupedSales(array $filters): array
    {
        $rows = Payment::query()
            ->whereBetween('created_at', [$filters['from'].' 00:00:00', $filters['to'].' 23:59:59'])
            ->selectRaw('method_id, COUNT(*) as transactions, SUM(amount) as amount, SUM(discount_amount) as discount, SUM(wallet) as wallet, SUM(mercy_fund) as mercy_fund, SUM(infant_formula) as infant_formula')
            ->groupBy('method_id')
            ->get();

        $names = Method::query()
            ->whereIn('id', $rows->pluck('method_id'))
            ->pluck('name', 'id');

        $groups = [];

        foreach ($rows as $row) {
            $label = $names[$row->method_id] ?? 'Unknown method';

            $groups[] = [
                'method' => $label,
                'transactions' => (int) $row->transactions,
                'amount' => (float) $row->amount,
                'discount' => (float) $row->discount,
                'wallet' => (float) $row->wallet,
                'mercyFund' => (float) $row->mercy_fund,
                'infantFormula' => (float) $row->infant_formula,
            ];
        }

        usort($groups, fn (array $a, array $b) => strcmp($a['method'], $b['method']));

        return $groups;
    }

    /**
     * @param  array<int, array{method: string, transactions: int, amount: float, discount: float, wallet: float, mercyFund: float, infantFormula: float}>  $groups
     * @return array{totalTransactions: int, totalAmount: float, totalDiscount: float, totalWallet: float, totalMercyFund: float, totalInfantFormula: float, totalGrandTotal: float, methods: int}
     */
    private function summary(array $groups): array
    {
        $totalAmount = array_sum(array_column($groups, 'amount'));
        $totalDiscount = array_sum(array_column($groups, 'discount'));
        $totalWallet = array_sum(array_column($groups, 'wallet'));
        $totalMercyFund = array_sum(array_column($groups, 'mercyFund'));
        $totalInfantFormula = array_sum(array_column($groups, 'infantFormula'));

        return [
            'methods' => count($groups),
            'totalTransactions' => array_sum(array_column($groups, 'transactions')),
            'totalAmount' => $totalAmount,
            'totalDiscount' => $totalDiscount,
            'totalWallet' => $totalWallet,
            'totalMercyFund' => $totalMercyFund,
            'totalInfantFormula' => $totalInfantFormula,
            'totalGrandTotal' => $totalAmount + $totalDiscount + $totalWallet + $totalMercyFund + $totalInfantFormula,
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
