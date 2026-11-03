<?php

namespace App\Http\Controllers;

use App\Models\Laboratory;
use App\Models\Line;
use App\Service\DashboardCurrency;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class LaboratoryTestsReportController extends Controller
{
    public function index(Request $request, string $current_team): Response
    {
        $filters = $this->filters($request);

        $laboratoryIds = Laboratory::query()
            ->where('status', 'submitted')
            ->pluck('id');

        $rows = Line::query()
            ->where('lineable_type', Laboratory::class)
            ->whereIn('lineable_id', $laboratoryIds)
            ->join('price_lists', 'price_list_id', '=', 'price_lists.id')
            ->leftJoin('price_lists as subcategories', 'price_lists.subcategory_id', '=', 'subcategories.id')
            ->when($filters['q'] !== '', function (Builder $query) use ($filters): void {
                $like = '%'.$filters['q'].'%';
                $query->where(function (Builder $q) use ($like): void {
                    $q->where('price_lists.name', 'like', $like)
                        ->orWhere('subcategories.name', 'like', $like);
                });
            })
            ->when($filters['from'] !== null, fn (Builder $q) => $q->where('lines.created_at', '>=', "$filters[from] 00:00:00"))
            ->when($filters['to'] !== null, fn (Builder $q) => $q->where('lines.created_at', '<=', "$filters[to] 23:59:59"))
            ->selectRaw('price_lists.id as price_list_id')
            ->selectRaw('price_lists.name as item_name')
            ->selectRaw('subcategories.id as subcategory_id')
            ->selectRaw('subcategories.name as subcategory_name')
            ->selectRaw('COUNT(*) as count')
            ->selectRaw('SUM(lines.quantity * lines.unitPrice) as revenue')
            ->selectRaw('SUM(lines.quantity * lines.unitCost) as cost')
            ->groupBy('price_lists.id', 'price_lists.name', 'subcategories.id', 'subcategories.name')
            ->orderBy('subcategories.name')
            ->orderBy('price_lists.name')
            ->paginate($filters['perPage'])
            ->withQueryString()
            ->through(fn ($row) => [
                'id' => (int) $row->price_list_id,
                'category' => $row->subcategory_name ?? '—',
                'name' => $row->item_name,
                'count' => (int) $row->count,
                'revenue' => (float) ($row->revenue ?? 0),
                'cost' => (float) ($row->cost ?? 0),
            ]);

        $summary = $this->summary($laboratoryIds, $filters);

        return Inertia::render('reports/laboratory-tests', [
            'tests' => $rows,
            'summary' => $summary,
            'filters' => $filters,
            'currencySymbol' => DashboardCurrency::symbol(),
        ]);
    }

    public function export(Request $request, string $current_team): StreamedResponse
    {
        $filters = $this->filters($request);

        $laboratoryIds = Laboratory::query()
            ->where('status', 'submitted')
            ->pluck('id');

        $rows = Line::query()
            ->where('lineable_type', Laboratory::class)
            ->whereIn('lineable_id', $laboratoryIds)
            ->join('price_lists', 'price_list_id', '=', 'price_lists.id')
            ->leftJoin('price_lists as subcategories', 'price_lists.subcategory_id', '=', 'subcategories.id')
            ->when($filters['q'] !== '', function (Builder $query) use ($filters): void {
                $like = '%'.$filters['q'].'%';
                $query->where(function (Builder $q) use ($like): void {
                    $q->where('price_lists.name', 'like', $like)
                        ->orWhere('subcategories.name', 'like', $like);
                });
            })
            ->when($filters['from'] !== null, fn (Builder $q) => $q->where('lines.created_at', '>=', "$filters[from] 00:00:00"))
            ->when($filters['to'] !== null, fn (Builder $q) => $q->where('lines.created_at', '<=', "$filters[to] 23:59:59"))
            ->selectRaw('price_lists.id as price_list_id')
            ->selectRaw('price_lists.name as item_name')
            ->selectRaw('subcategories.id as subcategory_id')
            ->selectRaw('subcategories.name as subcategory_name')
            ->selectRaw('COUNT(*) as count')
            ->selectRaw('SUM(lines.quantity * lines.unitPrice) as revenue')
            ->selectRaw('SUM(lines.quantity * lines.unitCost) as cost')
            ->groupBy('price_lists.id', 'price_lists.name', 'subcategories.id', 'subcategories.name')
            ->orderBy('subcategories.name')
            ->orderBy('price_lists.name')
            ->get();

        return response()->streamDownload(function () use ($rows): void {
            $output = fopen('php://output', 'w');
            fputcsv($output, ['Category', 'Item', 'Times Performed', 'Revenue', 'Cost'], ',', '"', '\\');

            $total = ['count' => 0, 'revenue' => 0.0, 'cost' => 0.0];

            foreach ($rows as $row) {
                $category = $row->subcategory_name ?? '—';
                $name = $row->item_name;
                $count = (int) $row->count;
                $revenue = (float) ($row->revenue ?? 0);
                $cost = (float) ($row->cost ?? 0);

                $total['count'] += $count;
                $total['revenue'] += $revenue;
                $total['cost'] += $cost;

                fputcsv($output, [$category, $name, $count, $revenue, $cost], ',', '"', '\\');
            }

            fputcsv($output, ['', 'TOTAL', $total['count'], $total['revenue'], $total['cost']], ',', '"', '\\');
            fclose($output);
        }, 'laboratory-tests-report.csv', ['Content-Type' => 'text/csv']);
    }

    /**
     * @return array{testTypes: int, totalTests: int, totalRevenue: float, totalCost: float}
     */
    private function summary($laboratoryIds, array $filters): array
    {
        $result = Line::query()
            ->where('lineable_type', Laboratory::class)
            ->whereIn('lineable_id', $laboratoryIds)
            ->join('price_lists', 'price_list_id', '=', 'price_lists.id')
            ->when($filters['from'] !== null, fn (Builder $q) => $q->where('lines.created_at', '>=', "$filters[from] 00:00:00"))
            ->when($filters['to'] !== null, fn (Builder $q) => $q->where('lines.created_at', '<=', "$filters[to] 23:59:59"))
            ->selectRaw('COUNT(DISTINCT price_lists.id) as testTypes')
            ->selectRaw('COUNT(*) as totalTests')
            ->selectRaw('SUM(lines.quantity * lines.unitPrice) as totalRevenue')
            ->selectRaw('SUM(lines.quantity * lines.unitCost) as totalCost')
            ->first();

        return [
            'testTypes' => (int) ($result->testTypes ?? 0),
            'totalTests' => (int) ($result->totalTests ?? 0),
            'totalRevenue' => (float) ($result->totalRevenue ?? 0),
            'totalCost' => (float) ($result->totalCost ?? 0),
        ];
    }

    /** @return array{q: string, from: string, to: string, perPage: int} */
    private function filters(Request $request): array
    {
        $validated = $request->validate([
            'q' => ['nullable', 'string', 'max:255'],
            'from' => ['nullable', 'date'],
            'to' => ['nullable', 'date', 'after_or_equal:from'],
            'perPage' => ['nullable', 'integer', Rule::in([10, 25, 50, 100])],
        ]);

        return [
            'q' => trim((string) ($validated['q'] ?? '')),
            'from' => $validated['from'] ?? now()->startOfMonth()->toDateString(),
            'to' => $validated['to'] ?? now()->endOfMonth()->toDateString(),
            'perPage' => (int) ($validated['perPage'] ?? 25),
        ];
    }
}
