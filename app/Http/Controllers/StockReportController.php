<?php

namespace App\Http\Controllers;

use App\Models\Stock;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class StockReportController extends Controller
{
    /** @var array<string, string> */
    private const REPORTS = [
        'purchased' => 'Purchased stock',
        'used' => 'Used stock',
        'dispensed' => 'Dispensed stock',
        'damaged' => 'Damaged stock',
        'donated' => 'Donated stock',
        'other' => 'Other stock',
        'returned' => 'Returned stock',
        'transferred' => 'Transferred stock',
        'correction' => 'Stock count adjustments',
    ];

    public function index(Request $request, string $current_team, ?string $report = null): Response
    {
        if ($report === null) {
            return $this->dashboard($request);
        }
        abort_unless(array_key_exists($report, self::REPORTS), 404);
        $filters = $this->filters($request);
        $query = $this->query($report, $filters);
        $totalQuantity = (clone $query)->sum('quantity');
        $rows = $query->latest()->paginate($filters['perPage'])->withQueryString()
            ->through(fn (Stock $stock) => $this->serialize($stock));

        return Inertia::render('reports/stock/index', [
            'report' => ['key' => $report, 'title' => self::REPORTS[$report]],
            'rows' => $rows,
            'summary' => ['movements' => $rows->total(), 'quantity' => (float) $totalQuantity],
            'filters' => $filters,
            'reports' => self::REPORTS,
        ]);
    }

    /**
     * Render the stock dashboard with overview metrics.
     */
    private function dashboard(Request $request): Response
    {
        $filters = $this->filters($request);
        $baseQuery = Stock::query()->with(['inventory.priceList', 'inventory.drugForm']);

        $totalMovements = (clone $baseQuery)->count();
        $totalQuantity = (float) (clone $baseQuery)->sum('quantity');

        $perReportStats = collect(self::REPORTS)->mapWithKeys(function (string $title, string $key) use ($filters) {
            $q = Stock::query()
                ->whereRaw('LOWER(status) = ?', [$key])
                ->when($filters['from'], fn (Builder $builder, string $from) => $builder->whereDate('created_at', '>=', $from))
                ->when($filters['to'], fn (Builder $builder, string $to) => $builder->whereDate('created_at', '<=', $to));

            return [
                $key => [
                    'movements' => (clone $q)->count(),
                    'quantity' => (float) (clone $q)->sum('quantity'),
                ],
            ];
        });

        $recentMovements = Stock::query()
            ->with(['user', 'inventory.priceList', 'inventory.drugForm', 'receivable'])
            ->latest()
            ->limit(10)
            ->get()
            ->map(fn (Stock $stock) => $this->serialize($stock));

        return Inertia::render('reports/stock/index', [
            'report' => null,
            'dashboard' => [
                'totalMovements' => $totalMovements,
                'totalQuantity' => $totalQuantity,
                'perReport' => $perReportStats,
                'recentMovements' => $recentMovements,
            ],
            'filters' => $filters,
            'reports' => self::REPORTS,
        ]);
    }

    public function export(Request $request, string $current_team, string $report)
    {
        abort_unless(array_key_exists($report, self::REPORTS), 404);
        $filters = $this->filters($request);
        $rows = $this->query($report, $filters)->latest()->lazy(500);

        return response()->streamDownload(function () use ($rows): void {
            $output = fopen('php://output', 'w');
            fputcsv($output, ['ID', 'Item', 'User', 'Quantity', 'Stock type', 'Received by', 'Status', 'Date'], ',', '"', '\\');
            foreach ($rows as $stock) {
                fputcsv($output, [
                    $stock->id,
                    trim(($stock->inventory?->priceList->name ?? 'Unknown item').' '.($stock->inventory?->drugForm->name ?? '')),
                    $stock->user?->name,
                    $stock->quantity,
                    class_basename($stock->stockable_type ?? ''),
                    $stock->receivable->fullName ?? $stock->receivable?->name,
                    $stock->status,
                    $stock->created_at?->toDateTimeString(),
                ], ',', '"', '\\');
            }
            fclose($output);
        }, str_replace('-', '_', $report).'-stock-report.csv', ['Content-Type' => 'text/csv']);
    }

    /**
     * @param  array{q: string, from: ?string, to: ?string, perPage: int, group: string}  $filters
     * @return Builder<Stock>
     */
    private function query(string $report, array $filters): Builder
    {
        return Stock::query()->with(['user', 'inventory.priceList', 'inventory.drugForm', 'receivable'])
            ->whereRaw('LOWER(status) = ?', [$report])
            ->when($filters['q'] !== '', fn (Builder $builder) => $builder->whereHas('inventory', fn (Builder $inventory) => $inventory
                ->whereHas('priceList', fn (Builder $priceList) => $priceList->where('name', 'like', '%'.$filters['q'].'%'))
                ->orWhereHas('drugForm', fn (Builder $drugForm) => $drugForm->where('name', 'like', '%'.$filters['q'].'%'))))
            ->when($filters['from'], fn (Builder $builder, string $from) => $builder->whereDate('created_at', '>=', $from))
            ->when($filters['to'], fn (Builder $builder, string $to) => $builder->whereDate('created_at', '<=', $to))
            ->when($filters['group'] === 'positive', fn (Builder $builder) => $builder->where('quantity', '>', 0))
            ->when($filters['group'] === 'negative', fn (Builder $builder) => $builder->where('quantity', '<', 0));
    }

    /** @return array{q: string, from: ?string, to: ?string, perPage: int, group: string} */
    private function filters(Request $request): array
    {
        $validated = $request->validate([
            'q' => ['nullable', 'string', 'max:255'],
            'from' => ['nullable', 'date'],
            'to' => ['nullable', 'date', 'after_or_equal:from'],
            'perPage' => ['nullable', 'integer', Rule::in([10, 25, 50, 100])],
            'group' => ['nullable', 'string', Rule::in(['positive', 'negative', 'all'])],
        ]);
        $perPage = (int) ($validated['perPage'] ?? 25);

        return [
            'q' => trim((string) ($validated['q'] ?? '')),
            'from' => $validated['from'] ?? today()->toDateString(),
            'to' => $validated['to'] ?? today()->toDateString(),
            'perPage' => in_array($perPage, [10, 25, 50, 100], true) ? $perPage : 25,
            'group' => $validated['group'] ?? 'all',
        ];
    }

    /** @return array<string, mixed> */
    private function serialize(Stock $stock): array
    {
        return [
            'id' => $stock->id,
            'item' => trim(($stock->inventory?->priceList->name ?? 'Unknown item').' '.($stock->inventory?->drugForm->name ?? '')),
            'user' => $stock->user?->name,
            'quantity' => (float) $stock->quantity,
            'stockType' => class_basename($stock->stockable_type ?? ''),
            'receivedBy' => $stock->receivable->fullName ?? $stock->receivable?->name,
            'status' => $stock->status,
            'createdAt' => $stock->created_at?->toIso8601String(),
        ];
    }
}
