<?php

namespace App\Http\Controllers;

use App\Models\Laboratory;
use App\Models\Method;
use App\Models\Payment;
use App\Service\DashboardCurrency;
use App\Service\DashboardDateRange;
use App\Service\DashboardTenant;
use App\Service\DashboardTimeSeries;
use App\Service\FinanceMetrics;
use Carbon\CarbonImmutable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class FinanceController extends Controller
{
    /**
     * The payment components tracked in the revenue overview.
     *
     * @var array<string, array{label: string, color: string}>
     */
    private const REVENUE_CATEGORIES = [
        'amount' => ['label' => 'Amount', 'color' => '#6366f1'],
        'discount_amount' => ['label' => 'Discount', 'color' => '#10b981'],
        'wallet' => ['label' => 'Wallet', 'color' => '#f59e0b'],
        'mercy_fund' => ['label' => 'Mercy fund', 'color' => '#ef4444'],
        'infant_formula' => ['label' => 'Infant formula', 'color' => '#3b82f6'],
    ];

    /**
     * The chart palette for payment methods.
     *
     * @var list<string>
     */
    private const METHOD_PALETTE = [
        '#6366f1', '#10b981', '#f59e0b', '#ef4444',
        '#3b82f6', '#a855f7', '#14b8a6', '#f97316',
    ];

    /**
     * Show the finance summary report.
     */
    public function index(Request $request): Response
    {
        $filters = [
            'period' => DashboardDateRange::periodFromPageFilters([
                DashboardDateRange::FILTER_FIELD => $request->query('period'),
            ]),
            'from' => $this->date($request->query('from')),
            'to' => $this->date($request->query('to')),
        ];

        [$start, $end] = $this->range($filters);
        $pageFilters = [
            DashboardDateRange::FILTER_FIELD => $filters['period'],
            DashboardDateRange::DATE_RANGE_FIELD => $filters['from'] !== null && $filters['to'] !== null
                ? CarbonImmutable::parse($filters['from'])->format(DashboardDateRange::DATE_RANGE_FORMAT).DashboardDateRange::DATE_RANGE_SEPARATOR.CarbonImmutable::parse($filters['to'])->format(DashboardDateRange::DATE_RANGE_FORMAT)
                : null,
        ];

        return Inertia::render('reports/finance', [
            'currencySymbol' => DashboardCurrency::symbol(),
            'filters' => $filters,
            'rangeLabel' => DashboardDateRange::labelFromPageFilters($pageFilters),
            'stats' => FinanceMetrics::snapshotForRange($start, $end),
            'revenue' => $this->revenueOverview($pageFilters),
            'paymentByMethod' => $this->paymentByMethod($start, $end),
            'periodOptions' => collect(DashboardDateRange::FILTERS)
                ->map(fn (string $label, string $value) => ['value' => $value, 'label' => $label])
                ->values(),
        ]);
    }

    /**
     * Show the submitted laboratory investigation report.
     */
    public function laboratory(Request $request): Response
    {
        $filters = [
            'q' => trim((string) $request->query('q', '')),
            'from' => $this->date($request->query('from')),
            'to' => $this->date($request->query('to')),
            'perPage' => in_array((int) $request->query('perPage', 25), [10, 25, 50, 100], true)
                ? (int) $request->query('perPage', 25)
                : 25,
        ];

        if ($filters['from'] === null && $filters['to'] === null) {
            $filters['from'] = CarbonImmutable::today()->toDateString();
            $filters['to'] = CarbonImmutable::today()->toDateString();
        }

        $query = Laboratory::query()
            ->where('status', 'submitted')
            ->with(['patient', 'doctor'])
            ->when($filters['q'] !== '', function (Builder $query) use ($filters): void {
                $like = '%'.$filters['q'].'%';

                $query->where(function (Builder $query) use ($like): void {
                    $query
                        ->where('patient_id', 'like', $like)
                        ->orWhereHas('patient', fn (Builder $query) => $query->where('fullName', 'like', $like))
                        ->orWhereHas('doctor', fn (Builder $query) => $query->where('name', 'like', $like));
                });
            })
            ->when($filters['from'] !== null, fn (Builder $query) => $query->whereDate('created_at', '>=', $filters['from']))
            ->when($filters['to'] !== null, fn (Builder $query) => $query->whereDate('created_at', '<=', $filters['to']));

        $laboratories = (clone $query)
            ->orderByDesc('created_at')
            ->paginate($filters['perPage'])
            ->withQueryString()
            ->through(fn (Laboratory $laboratory) => [
                'id' => $laboratory->getKey(),
                'patientId' => $laboratory->patient_id,
                'patientName' => $laboratory->patient?->fullName,
                'doctorName' => $laboratory->doctor?->name,
                'status' => $laboratory->status,
                'total' => (float) $laboratory->total,
                'createdAt' => $laboratory->created_at?->toIso8601String(),
            ]);

        return Inertia::render('reports/laboratory', [
            'currencySymbol' => DashboardCurrency::symbol(),
            'teamName' => $request->user()->currentTeam->name,
            'laboratories' => $laboratories,
            'filters' => $filters,
            'summary' => [
                'total' => (float) (clone $query)->sum('total'),
                'count' => (clone $query)->count(),
            ],
        ]);
    }

    /**
     * Export the submitted laboratory investigation report.
     */
    public function exportLaboratory(Request $request): StreamedResponse
    {
        $filters = [
            'q' => trim((string) $request->query('q', '')),
            'from' => $this->date($request->query('from')),
            'to' => $this->date($request->query('to')),
        ];

        if ($filters['from'] === null && $filters['to'] === null) {
            $filters['from'] = CarbonImmutable::today()->toDateString();
            $filters['to'] = CarbonImmutable::today()->toDateString();
        }

        $laboratories = Laboratory::query()
            ->where('status', 'submitted')
            ->with(['patient', 'doctor'])
            ->when($filters['q'] !== '', function (Builder $query) use ($filters): void {
                $like = '%'.$filters['q'].'%';
                $query->where(function (Builder $query) use ($like): void {
                    $query
                        ->where('patient_id', 'like', $like)
                        ->orWhereHas('patient', fn (Builder $query) => $query->where('fullName', 'like', $like))
                        ->orWhereHas('doctor', fn (Builder $query) => $query->where('name', 'like', $like));
                });
            })
            ->when($filters['from'] !== null, fn (Builder $query) => $query->whereDate('created_at', '>=', $filters['from']))
            ->when($filters['to'] !== null, fn (Builder $query) => $query->whereDate('created_at', '<=', $filters['to']))
            ->orderByDesc('created_at')
            ->cursor();

        return response()->streamDownload(function () use ($laboratories): void {
            $output = fopen('php://output', 'w');
            fputcsv($output, ['Patient ID', 'Patient Name', 'Doctor', 'Status', 'Total', 'Date'], ',', '"', '\\');
            foreach ($laboratories as $laboratory) {
                fputcsv($output, [
                    $laboratory->patient_id,
                    $laboratory->patient?->fullName,
                    $laboratory->doctor?->name,
                    $laboratory->status,
                    $laboratory->total,
                    $laboratory->created_at,
                ], ',', '"', '\\');
            }
            fclose($output);
        }, 'laboratory-report.csv', ['Content-Type' => 'text/csv']);
    }

    /**
     * Build the revenue overview series.
     *
     * @param  array<string, mixed>  $pageFilters
     * @return array{labels: list<string>, datasets: list<array{key: string, label: string, color: string, data: list<float>}>}
     */
    private function revenueOverview(array $pageFilters): array
    {
        $buckets = DashboardDateRange::bucketsFromPageFilters($pageFilters);

        $series = DashboardTimeSeries::aggregateMany(
            query: DashboardTenant::apply(Payment::query()),
            columns: array_keys(self::REVENUE_CATEGORIES),
            buckets: $buckets,
            onlyPositiveColumns: ['discount_amount', 'wallet', 'mercy_fund', 'infant_formula'],
        );

        $datasets = [];

        foreach (self::REVENUE_CATEGORIES as $key => $category) {
            $datasets[] = [
                'key' => $key,
                'label' => $category['label'],
                'color' => $category['color'],
                'data' => $series[$key] ?? [],
            ];
        }

        return [
            'labels' => array_column($buckets, 'label'),
            'datasets' => $datasets,
        ];
    }

    /**
     * Build the payment-by-method totals.
     *
     * @return array{labels: list<string>, data: list<float>, colors: list<string>}
     */
    private function paymentByMethod(CarbonImmutable $start, CarbonImmutable $end): array
    {
        $methods = DashboardTenant::apply(Method::query())->orderBy('name')->get(['id', 'name']);

        if ($methods->isEmpty()) {
            return ['labels' => [], 'data' => [], 'colors' => []];
        }

        $grammar = Payment::query()->getQuery()->getGrammar();
        $expressions = [];
        $bindings = [];

        foreach ($methods as $method) {
            $column = $grammar->wrap($this->columnForMethod($method->name));
            $expressions[] = "SUM(CASE WHEN method_id = ? THEN COALESCE({$column}, 0) ELSE 0 END) AS method_{$method->getKey()}";
            $bindings[] = $method->getKey();
        }

        $totals = DashboardTenant::apply(Payment::query())
            ->whereBetween('created_at', [$start, $end])
            ->selectRaw(implode(', ', $expressions), $bindings)
            ->toBase()
            ->first();

        $labels = [];
        $data = [];
        $colors = [];

        foreach ($methods->values() as $index => $method) {
            $labels[] = $method->name;
            $data[] = (float) ($totals?->{'method_'.$method->getKey()} ?? 0);
            $colors[] = self::METHOD_PALETTE[$index % count(self::METHOD_PALETTE)];
        }

        return ['labels' => $labels, 'data' => $data, 'colors' => $colors];
    }

    /**
     * Map a method name to the payment column holding its amount.
     */
    private function columnForMethod(string $methodName): string
    {
        return match (Str::lower(trim($methodName))) {
            'discount' => 'discount_amount',
            'wallet' => 'wallet',
            'mercy fund' => 'mercy_fund',
            'infant formula' => 'infant_formula',
            default => 'amount',
        };
    }

    /**
     * Resolve the date range from the applied filters.
     *
     * @param  array{period: string, from: string|null, to: string|null}  $filters
     * @return array{0: CarbonImmutable, 1: CarbonImmutable}
     */
    private function range(array $filters): array
    {
        if ($filters['from'] !== null && $filters['to'] !== null) {
            return [
                CarbonImmutable::parse($filters['from'])->startOfDay(),
                CarbonImmutable::parse($filters['to'])->endOfDay(),
            ];
        }

        return DashboardDateRange::range($filters['period']);
    }

    /**
     * Parse an optional ISO date query parameter.
     */
    private function date(mixed $value): ?string
    {
        if (! is_string($value) || trim($value) === '') {
            return null;
        }

        try {
            return CarbonImmutable::parse($value)->toDateString();
        } catch (\Throwable) {
            return null;
        }
    }
}
