<?php

namespace App\Http\Controllers;

use App\Models\Inventory;
use App\Models\Laboratory;
use App\Models\Line;
use App\Models\Patient;
use App\Models\Payment;
use App\Models\Prescription;
use App\Models\Stock;
use App\Models\TeamInvitation;
use App\Service\DashboardCurrency;
use App\Service\DashboardDateRange;
use App\Service\DashboardMetrics;
use App\Service\DashboardTenant;
use App\Service\DashboardTimeSeries;
use Carbon\CarbonImmutable;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(Request $request): Response
    {
        $today = CarbonImmutable::today();
        $validatedFilters = $request->validate([
            'from' => ['nullable', 'date'],
            'to' => ['nullable', 'date'],
        ]);
        $from = $validatedFilters['from'] ?? $today->startOfMonth()->toDateString();
        $to = $validatedFilters['to'] ?? $today->endOfMonth()->toDateString();

        if (CarbonImmutable::parse($to)->lessThan(CarbonImmutable::parse($from))) {
            throw ValidationException::withMessages([
                'to' => 'The end date must be on or after the start date.',
            ]);
        }

        $pageFilters = [
            DashboardDateRange::FILTER_FIELD => 'month',
            DashboardDateRange::DATE_RANGE_FIELD => CarbonImmutable::parse($from)->format(DashboardDateRange::DATE_RANGE_FORMAT)
                .DashboardDateRange::DATE_RANGE_SEPARATOR
                .CarbonImmutable::parse($to)->format(DashboardDateRange::DATE_RANGE_FORMAT),
        ];
        [$start, $end] = DashboardDateRange::rangeFromPageFilters($pageFilters);
        $buckets = DashboardDateRange::bucketsFromPageFilters($pageFilters);
        $dashboardMetrics = DashboardMetrics::snapshotForRange($start, $end);
        $dashboardSeries = DashboardMetrics::chartSeriesForRange($buckets);
        $appointmentMetrics = DashboardMetrics::appointmentsForRange($start, $end);
        $appointmentSeries = DashboardMetrics::appointmentChartSeriesForRange($buckets);
        $paymentSeries = DashboardTimeSeries::aggregateMany(
            query: DashboardTenant::apply(Payment::query()),
            columns: ['amount', 'discount_amount', 'wallet', 'mercy_fund', 'infant_formula'],
            buckets: $buckets,
            onlyPositiveColumns: ['discount_amount', 'wallet', 'mercy_fund', 'infant_formula'],
        );
        $genderCounts = DashboardTenant::apply(Patient::query())
            ->whereBetween('created_at', [$start, $end])
            ->select('gender')
            ->selectRaw('COUNT(*) AS total')
            ->groupBy('gender')
            ->get();
        $genderTotals = [
            'Male' => (int) $genderCounts->filter(fn (Patient $patient): bool => strtolower(trim((string) $patient->gender)) === 'male')->sum('total'),
            'Female' => (int) $genderCounts->filter(fn (Patient $patient): bool => strtolower(trim((string) $patient->gender)) === 'female')->sum('total'),
        ];
        $notRecordedGenderCount = max(0, (int) $genderCounts->sum('total') - array_sum($genderTotals));

        if ($notRecordedGenderCount > 0) {
            $genderTotals['Other / not recorded'] = $notRecordedGenderCount;
        }

        $adultCutoff = $end->subYears(18)->toDateString();
        $ageCounts = DashboardTenant::apply(Patient::query())
            ->whereBetween('created_at', [$start, $end])
            ->selectRaw(
                'SUM(CASE WHEN birthDate <= ? THEN 1 ELSE 0 END) AS adults, SUM(CASE WHEN birthDate > ? THEN 1 ELSE 0 END) AS children, SUM(CASE WHEN birthDate IS NULL THEN 1 ELSE 0 END) AS unknown',
                [$adultCutoff, $adultCutoff],
            )
            ->first();
        $topDrugs = $this->topLines(Prescription::class, $start, $end);
        $topLaboratoryTests = $this->topLines(Laboratory::class, $start, $end);
        $lowStockItems = DashboardTenant::apply(Inventory::query())
            ->with(['priceList:id,name', 'drugForm:id,name'])
            ->whereColumn('quantity', '<=', 'min_qty')
            ->orderBy('quantity')
            ->orderBy('id')
            ->limit(10)
            ->get()
            ->map(fn (Inventory $inventory): array => [
                'id' => $inventory->getKey(),
                'sku' => $inventory->sku,
                'product' => trim(($inventory->priceList->name ?? 'Unknown product').' '.($inventory->drugForm->name ?? '')),
                'minQty' => (float) $inventory->min_qty,
                'quantity' => (float) $inventory->quantity,
                'cost' => (float) $inventory->cost,
            ]);

        $email = strtolower($request->user()->email);

        $pendingInvitations = TeamInvitation::query()
            ->with(['inviter', 'team'])
            ->whereRaw('LOWER(email) = ?', [$email])
            ->whereNull('accepted_at')
            ->where(fn ($query) => $query
                ->whereNull('expires_at')
                ->orWhere('expires_at', '>=', now()))
            ->latest()
            ->get()
            ->map(fn (TeamInvitation $invitation) => [
                'code' => $invitation->code,
                'inviterName' => $invitation->inviter->name,
                'team' => [
                    'name' => $invitation->team->name,
                    'slug' => $invitation->team->slug,
                ],
            ]);

        return Inertia::render('dashboard', [
            'pendingInvitations' => $pendingInvitations,
            'currencySymbol' => DashboardCurrency::symbol(),
            'filters' => ['from' => $from, 'to' => $to],
            'rangeLabel' => DashboardDateRange::labelFromPageFilters($pageFilters),
            'kpis' => [
                'patientsRegistered' => $dashboardMetrics['patients_in_range'],
                'totalPatients' => $dashboardMetrics['total_patients'],
                'paymentsCollected' => $dashboardMetrics['payments_in_range'],
                'outstandingBills' => $dashboardMetrics['outstanding_bills'],
                'openBills' => $dashboardMetrics['open_bills'],
                'activeAdmissions' => $dashboardMetrics['active_admissions'],
            ],
            'kpiSeries' => [
                'patientsRegistered' => $dashboardSeries['patients_registered'],
                'totalPatients' => $dashboardSeries['total_patients'],
                'paymentsCollected' => $dashboardSeries['payments_collected'],
                'outstandingAmount' => $dashboardSeries['outstanding_amount'],
                'openBills' => $dashboardSeries['open_bills'],
                'activeAdmissions' => $dashboardSeries['active_admissions'],
            ],
            'appointments' => [
                'total' => $appointmentMetrics['appointments_total'],
                'open' => $appointmentMetrics['appointments_open'],
                'completed' => $appointmentMetrics['appointments_completed'],
                'series' => $appointmentSeries,
            ],
            'patientsByGender' => $genderTotals,
            'patientsByAge' => [
                ['label' => 'Adults (18+)', 'value' => (int) ($ageCounts->adults ?? 0)],
                ['label' => 'Children (under 18)', 'value' => (int) ($ageCounts->children ?? 0)],
                ['label' => 'Unknown age', 'value' => (int) ($ageCounts->unknown ?? 0)],
            ],
            'revenue' => [
                'labels' => array_column($buckets, 'label'),
                'datasets' => [
                    ['key' => 'amount', 'label' => 'Amount', 'color' => '#6366f1', 'data' => $paymentSeries['amount']],
                    ['key' => 'discount', 'label' => 'Discount', 'color' => '#10b981', 'data' => $paymentSeries['discount_amount']],
                    ['key' => 'wallet', 'label' => 'Wallet', 'color' => '#f59e0b', 'data' => $paymentSeries['wallet']],
                    ['key' => 'mercy-fund', 'label' => 'Mercy fund', 'color' => '#ef4444', 'data' => $paymentSeries['mercy_fund']],
                    ['key' => 'infant-formula', 'label' => 'Infant formula', 'color' => '#3b82f6', 'data' => $paymentSeries['infant_formula']],
                ],
            ],
            'stockMovements' => [
                'labels' => array_column($buckets, 'label'),
                'data' => DashboardTimeSeries::aggregate(DashboardTenant::apply(Stock::query()), 'quantity', $buckets),
            ],
            'topDrugs' => $topDrugs,
            'topLaboratoryTests' => $topLaboratoryTests,
            'lowStockItems' => $lowStockItems,
        ]);
    }

    /**
     * @return list<array{id: int, name: string, count: int, value: float}>
     */
    private function topLines(string $lineableType, CarbonImmutable $start, CarbonImmutable $end): array
    {
        return DashboardTenant::apply(Line::query())
            ->with('priceList:id,name')
            ->where('lineable_type', $lineableType)
            ->whereBetween('created_at', [$start, $end])
            ->selectRaw('MIN(id) AS id, price_list_id, COUNT(DISTINCT lineable_id) AS item_count, SUM(totalPrice) AS total_value')
            ->groupBy('price_list_id')
            ->orderByDesc('item_count')
            ->orderBy('price_list_id')
            ->limit(10)
            ->get()
            ->map(fn (Line $line): array => [
                'id' => (int) $line->price_list_id,
                'name' => $line->priceList->name ?? 'Unknown item',
                'count' => (int) $line->item_count,
                'value' => (float) $line->total_value,
            ])
            ->all();
    }
}
