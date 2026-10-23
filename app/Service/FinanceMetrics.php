<?php

namespace App\Service;

use App\Models\Billing;
use App\Models\Patient;
use App\Models\Payment;
use Carbon\CarbonImmutable;

final class FinanceMetrics
{
    /**
     * @return array{
     *     payments_this_month: float,
     *     outstanding_balance: float,
     *     open_bills: int,
     *     wallet_balance: float,
     * }
     */
    public static function snapshot(?CarbonImmutable $now = null): array
    {
        $now ??= CarbonImmutable::now();
        $outstanding = self::outstandingBalance();

        return [
            'payments_this_month' => self::paymentsThisMonth($now),
            'outstanding_balance' => $outstanding['balance'],
            'open_bills' => $outstanding['count'],
            'wallet_balance' => self::walletBalance(),
        ];
    }

    public static function paymentsThisMonth(?CarbonImmutable $now = null): float
    {
        return self::paymentsForPeriod('month', $now);
    }

    /**
     * @return array{
     *     payments_in_period: float,
     *     payments_count: int,
     *     average_payment: float,
     *     discounts_in_period: float,
     *     wallet_used_in_period: float,
     *     mercy_fund_in_period: float,
     *     infant_formula_in_period: float,
     *     billed_in_period: float,
     *     bills_count: int,
     *     collection_rate: float|null,
     *     outstanding_balance: float,
     *     open_bills: int,
     *     wallet_balance: float,
     * }
     */
    public static function snapshotForPeriod(?string $period = 'month', ?CarbonImmutable $now = null): array
    {
        $now ??= CarbonImmutable::now();
        [$start, $end] = DashboardDateRange::range($period, $now);

        return self::snapshotForRange($start, $end);
    }

    /**
     * @return array{
     *     payments_in_period: float,
     *     payments_count: int,
     *     average_payment: float,
     *     discounts_in_period: float,
     *     wallet_used_in_period: float,
     *     mercy_fund_in_period: float,
     *     infant_formula_in_period: float,
     *     billed_in_period: float,
     *     bills_count: int,
     *     collection_rate: float|null,
     *     outstanding_balance: float,
     *     open_bills: int,
     *     wallet_balance: float,
     * }
     */
    public static function snapshotForRange(CarbonImmutable $start, CarbonImmutable $end): array
    {
        $payments = self::paymentAggregatesForRange($start, $end);
        $billing = self::billingAggregatesForRange($start, $end);
        $outstanding = self::outstandingBalance();
        $billed = $billing['billed_in_period'];

        return [
            'payments_in_period' => $payments['collected'],
            'payments_count' => $payments['payments_count'],
            'average_payment' => $payments['payments_count'] > 0
                ? round($payments['collected'] / $payments['payments_count'], 2)
                : 0.0,
            'discounts_in_period' => $payments['discounts'],
            'wallet_used_in_period' => $payments['wallet_used'],
            'mercy_fund_in_period' => $payments['mercy_fund_used'],
            'infant_formula_in_period' => $payments['infant_formula_used'],
            'billed_in_period' => $billed,
            'bills_count' => $billing['bills_count'],
            'collection_rate' => $billed > 0
                ? round(($payments['collected'] / $billed) * 100, 1)
                : null,
            'outstanding_balance' => $outstanding['balance'],
            'open_bills' => $outstanding['count'],
            'wallet_balance' => self::walletBalance(),
        ];
    }

    public static function paymentsForPeriod(?string $period = 'month', ?CarbonImmutable $now = null): float
    {
        $now ??= CarbonImmutable::now();
        $period = DashboardDateRange::periodFromPageFilters([
            DashboardDateRange::FILTER_FIELD => $period,
        ]);
        [$start, $end] = DashboardDateRange::range($period, $now);

        return self::paymentsForRange($start, $end);
    }

    public static function paymentsForRange(CarbonImmutable $start, CarbonImmutable $end): float
    {
        return (float) (DashboardTenant::apply(Payment::query())
            ->whereBetween('created_at', [$start, $end])
            ->sum('amount') ?? 0);
    }

    /**
     * @return array{
     *     collected: float,
     *     payments_count: int,
     *     discounts: float,
     *     wallet_used: float,
     *     mercy_fund_used: float,
     *     infant_formula_used: float,
     * }
     */
    public static function paymentAggregatesForRange(CarbonImmutable $start, CarbonImmutable $end): array
    {
        $summary = DashboardTenant::apply(Payment::query())
            ->whereBetween('created_at', [$start, $end])
            ->selectRaw(
                'COUNT(*) AS payments_count, '
                .'COALESCE(SUM(amount), 0) AS collected, '
                .'COALESCE(SUM(discount_amount), 0) AS discounts, '
                .'COALESCE(SUM(wallet), 0) AS wallet_used, '
                .'COALESCE(SUM(mercy_fund), 0) AS mercy_fund_used, '
                .'COALESCE(SUM(infant_formula), 0) AS infant_formula_used'
            )
            ->first();

        return [
            'collected' => (float) ($summary->collected ?? 0),
            'payments_count' => (int) ($summary->payments_count ?? 0),
            'discounts' => (float) ($summary->discounts ?? 0),
            'wallet_used' => (float) ($summary->wallet_used ?? 0),
            'mercy_fund_used' => (float) ($summary->mercy_fund_used ?? 0),
            'infant_formula_used' => (float) ($summary->infant_formula_used ?? 0),
        ];
    }

    /**
     * @return array{billed_in_period: float, bills_count: int}
     */
    public static function billingAggregatesForRange(CarbonImmutable $start, CarbonImmutable $end): array
    {
        $summary = DashboardTenant::apply(Billing::query())
            ->whereBetween('created_at', [$start, $end])
            ->selectRaw('COUNT(*) AS bills_count, COALESCE(SUM(total), 0) AS billed_in_period')
            ->first();

        return [
            'billed_in_period' => (float) ($summary->billed_in_period ?? 0),
            'bills_count' => (int) ($summary->bills_count ?? 0),
        ];
    }

    /**
     * @return array{balance: float, count: int}
     */
    public static function outstandingBalance(): array
    {
        $summary = DashboardTenant::apply(Billing::query())
            ->whereIn('status', ['billed', 'pending'])
            ->selectRaw(
                'SUM(CASE WHEN total > 0 THEN 1 ELSE 0 END) AS open_bills, COALESCE(SUM(total - COALESCE((SELECT SUM(payments.amount) FROM payments WHERE payments.billing_id = billings.id AND payments.team_id = billings.team_id), 0)), 0) AS outstanding_balance'
            )
            ->first();

        return [
            'balance' => (float) ($summary->outstanding_balance ?? 0),
            'count' => (int) ($summary->open_bills ?? 0),
        ];
    }

    public static function walletBalance(): float
    {
        return (float) (DashboardTenant::apply(Patient::query())->sum('wallet') ?? 0);
    }
}
