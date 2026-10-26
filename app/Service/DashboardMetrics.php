<?php

namespace App\Service;

use App\Models\Admission;
use App\Models\Billing;
use App\Models\Consultation;
use App\Models\Inventory;
use App\Models\Patient;
use App\Models\Payment;
use Carbon\CarbonImmutable;
use Illuminate\Database\Eloquent\Builder;

final class DashboardMetrics
{
    /**
     * @return array{
     *     appointments_today: int,
     *     appointments_open: int,
     *     appointments_completed: int,
     * }
     */
    public static function appointments(?CarbonImmutable $now = null): array
    {
        $now ??= CarbonImmutable::now();
        [$start, $end] = DashboardDateRange::range('today', $now);
        $metrics = self::appointmentsForRange($start, $end);

        return [
            'appointments_today' => $metrics['appointments_total'],
            'appointments_open' => $metrics['appointments_open'],
            'appointments_completed' => $metrics['appointments_completed'],
        ];
    }

    /**
     * @return array{appointments_total: int, appointments_open: int, appointments_completed: int}
     */
    public static function appointmentsForRange(CarbonImmutable $start, CarbonImmutable $end): array
    {
        $appointmentSummary = DashboardTenant::apply(Consultation::query())
            ->selectRaw('COUNT(*) AS total')
            ->selectRaw("COUNT(CASE WHEN status IN ('scheduled', 'started') THEN 1 END) AS open_appointments")
            ->selectRaw("COUNT(CASE WHEN status = 'completed' THEN 1 END) AS completed_appointments")
            ->whereBetween('starts_at', [$start, $end])
            ->first();

        return [
            'appointments_total' => (int) ($appointmentSummary->total ?? 0),
            'appointments_open' => (int) ($appointmentSummary->open_appointments ?? 0),
            'appointments_completed' => (int) ($appointmentSummary->completed_appointments ?? 0),
        ];
    }

    /**
     * @return array{
     *     total_patients: int,
     *     new_patients: int,
     *     appointments_today: int,
     *     appointments_open: int,
     *     appointments_completed: int,
     *     revenue_this_month: float,
     *     outstanding_bills: float,
     *     low_stock_items: int,
     * }
     */
    public static function snapshot(?CarbonImmutable $now = null): array
    {
        $now ??= CarbonImmutable::now();

        $appointmentMetrics = self::appointments($now);
        $newPatientsSince = $now->subDays(29)->startOfDay();

        $patientSummary = DashboardTenant::apply(Patient::query())
            ->selectRaw('COUNT(*) AS total_patients')
            ->selectRaw(
                'COUNT(CASE WHEN created_at >= ? AND created_at <= ? THEN 1 END) AS new_patients',
                [$newPatientsSince, $now],
            )
            ->first();

        $revenueThisMonth = FinanceMetrics::paymentsThisMonth($now);
        $outstandingBills = FinanceMetrics::outstandingBalance()['balance'];

        $lowStockItems = DashboardTenant::apply(Inventory::query())
            ->whereColumn('quantity', '<=', 'min_qty')
            ->count();

        return [
            'total_patients' => (int) ($patientSummary->total_patients ?? 0),
            'new_patients' => (int) ($patientSummary->new_patients ?? 0),
            'appointments_today' => $appointmentMetrics['appointments_today'],
            'appointments_open' => $appointmentMetrics['appointments_open'],
            'appointments_completed' => $appointmentMetrics['appointments_completed'],
            'revenue_this_month' => (float) ($revenueThisMonth ?? 0),
            'outstanding_bills' => (float) ($outstandingBills ?? 0),
            'low_stock_items' => $lowStockItems,
        ];
    }

    /**
     * @return array{
     *     patients_in_range: int,
     *     total_patients: int,
     *     payments_in_range: float,
     *     outstanding_bills: float,
     *     open_bills: int,
     *     active_admissions: int,
     *     low_stock_items: int,
     * }
     */
    public static function snapshotForRange(CarbonImmutable $start, CarbonImmutable $end): array
    {
        $patients = DashboardTenant::apply(Patient::query())
            ->selectRaw('COUNT(*) AS total_patients')
            ->selectRaw(
                'COUNT(CASE WHEN created_at >= ? AND created_at <= ? THEN 1 END) AS patients_in_range',
                [$start, $end],
            )
            ->first();
        $paymentsInRange = FinanceMetrics::paymentsForRange($start, $end);
        $outstanding = FinanceMetrics::outstandingBalance();
        $lowStockItems = DashboardTenant::apply(Inventory::query())
            ->whereColumn('quantity', '<=', 'min_qty')
            ->count();

        return [
            'patients_in_range' => (int) ($patients->patients_in_range ?? 0),
            'total_patients' => (int) ($patients->total_patients ?? 0),
            'payments_in_range' => $paymentsInRange,
            'outstanding_bills' => $outstanding['balance'],
            'open_bills' => $outstanding['count'],
            'active_admissions' => self::activeAdmissions(),
            'low_stock_items' => $lowStockItems,
        ];
    }

    public static function activeAdmissions(): int
    {
        return DashboardTenant::apply(Admission::query())
            ->active()
            ->count();
    }

    /**
     * Per-bucket series backing the sparklines on the appointment activity stats.
     *
     * @param  list<array{start: CarbonImmutable, end: CarbonImmutable, label: string}>  $buckets
     * @return array{
     *     appointments: list<int>,
     *     open: list<int>,
     *     completed: list<int>,
     * }
     */
    public static function appointmentChartSeriesForRange(array $buckets): array
    {
        if ($buckets === []) {
            return [
                'appointments' => [],
                'open' => [],
                'completed' => [],
            ];
        }

        $series = self::bucketAggregate(
            DashboardTenant::apply(Consultation::query()),
            $buckets,
            [
                'appointments' => '1',
                'open' => "CASE WHEN status IN ('scheduled', 'started') THEN 1 ELSE 0 END",
                'completed' => "CASE WHEN status = 'completed' THEN 1 ELSE 0 END",
            ],
            'starts_at',
        );

        return [
            'appointments' => array_map('intval', $series['appointments']),
            'open' => array_map('intval', $series['open']),
            'completed' => array_map('intval', $series['completed']),
        ];
    }

    /**
     * Per-bucket series backing the sparklines on the operational overview stats.
     *
     * @param  list<array{start: CarbonImmutable, end: CarbonImmutable, label: string}>  $buckets
     * @return array{
     *     patients_registered: list<int>,
     *     total_patients: list<int>,
     *     payments_collected: list<float>,
     *     outstanding_amount: list<float>,
     *     open_bills: list<int>,
     *     active_admissions: list<int>,
     * }
     */
    public static function chartSeriesForRange(array $buckets): array
    {
        if ($buckets === []) {
            return [
                'patients_registered' => [],
                'total_patients' => [],
                'payments_collected' => [],
                'outstanding_amount' => [],
                'open_bills' => [],
                'active_admissions' => [],
            ];
        }

        $start = $buckets[array_key_first($buckets)]['start'];
        $inactiveStatuses = "'".implode("', '", Admission::INACTIVE_STATUSES)."'";

        $patientSeries = self::bucketAggregate(
            DashboardTenant::apply(Patient::query()),
            $buckets,
            ['registered' => '1'],
        );
        $paymentSeries = self::bucketAggregate(
            DashboardTenant::apply(Payment::query()),
            $buckets,
            ['collected' => 'amount'],
        );
        $billingSeries = self::bucketAggregate(
            DashboardTenant::apply(Billing::query()),
            $buckets,
            [
                'outstanding' => "CASE WHEN status IN ('billed', 'pending') THEN total ELSE 0 END",
                'open' => "CASE WHEN status IN ('billed', 'pending') THEN 1 ELSE 0 END",
            ],
        );
        $admissionSeries = self::bucketAggregate(
            DashboardTenant::apply(Admission::query()),
            $buckets,
            ['active' => "CASE WHEN status NOT IN ({$inactiveStatuses}) THEN 1 ELSE 0 END"],
        );

        $baseline = DashboardTenant::apply(Patient::query())
            ->where('created_at', '<', $start)
            ->count();

        $totalPatients = [];
        $running = $baseline;

        foreach ($patientSeries['registered'] as $count) {
            $running += (int) $count;
            $totalPatients[] = $running;
        }

        return [
            'patients_registered' => array_map('intval', $patientSeries['registered']),
            'total_patients' => $totalPatients,
            'payments_collected' => $paymentSeries['collected'],
            'outstanding_amount' => $billingSeries['outstanding'],
            'open_bills' => array_map('intval', $billingSeries['open']),
            'active_admissions' => array_map('intval', $admissionSeries['active']),
        ];
    }

    /**
     * @param  list<array{start: CarbonImmutable, end: CarbonImmutable, label: string}>  $buckets
     * @param  array<string, string>  $expressions
     * @return array<string, list<float>>
     */
    private static function bucketAggregate(
        Builder $query,
        array $buckets,
        array $expressions,
        string $dateColumn = 'created_at',
    ): array {
        $query = clone $query;
        $grammar = $query->getQuery()->getGrammar();
        $wrappedDateColumn = $grammar->wrap($dateColumn);

        $selects = [];
        $bindings = [];

        foreach ($expressions as $alias => $expression) {
            foreach (array_values($buckets) as $index => $bucket) {
                $selects[] = "COALESCE(SUM(CASE WHEN {$wrappedDateColumn} >= ? AND {$wrappedDateColumn} < ? THEN {$expression} ELSE 0 END), 0) AS {$alias}_{$index}";
                $bindings[] = $bucket['start'];
                $bindings[] = $bucket['end'];
            }
        }

        $first = $buckets[array_key_first($buckets)];
        $last = $buckets[array_key_last($buckets)];

        $result = $query
            ->where($dateColumn, '>=', $first['start'])
            ->where($dateColumn, '<', $last['end'])
            ->selectRaw(implode(', ', $selects), $bindings)
            ->toBase()
            ->first();

        $series = [];

        foreach (array_keys($expressions) as $alias) {
            $series[$alias] = array_map(
                static fn (int $index): float => (float) ($result?->{$alias.'_'.$index} ?? 0),
                array_keys(array_values($buckets)),
            );
        }

        return $series;
    }
}
