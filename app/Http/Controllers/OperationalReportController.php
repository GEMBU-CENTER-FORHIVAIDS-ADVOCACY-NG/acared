<?php

namespace App\Http\Controllers;

use App\Models\Patient;
use App\Models\PriceList;
use App\Service\DashboardCurrency;
use App\Service\EmployeeDeductionImporter;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;
use InvalidArgumentException;
use Symfony\Component\HttpFoundation\StreamedResponse;

class OperationalReportController extends Controller
{
    public function employeeDeduction(Request $request, string $current_team): Response
    {
        $filters = $this->filters($request, false);
        $query = Patient::query()
            ->where('wallet', '<', 0)
            ->whereHas('category', fn (Builder $q) => $q->whereRaw('LOWER(name) = ?', ['employee']))
            ->when($filters['q'] !== '', fn (Builder $patients) => $patients->where(fn (Builder $patients) => $patients
                ->where('slug', 'like', '%'.$filters['q'].'%')
                ->orWhere('fullName', 'like', '%'.$filters['q'].'%')));
        $totals = (clone $query)
            ->selectRaw('COALESCE(SUM(wallet), 0) as net, COALESCE(SUM(ABS(wallet)), 0) as absolute')
            ->first();
        $summary = [
            'patients' => (clone $query)->count(),
            'walletBalance' => (float) ($totals->net ?? 0),
            'walletTotal' => (float) ($totals->absolute ?? 0),
        ];
        $patients = $query->with(['category'])->orderBy('fullName')->paginate($filters['perPage'])->withQueryString()
            ->through(fn (Patient $patient) => [
                'id' => $patient->getKey(),
                'patientId' => $patient->slug,
                'name' => $patient->fullName,
                'category' => $patient->category?->name,
                'wallet' => (float) $patient->wallet,
                'createdAt' => $patient->created_at?->toIso8601String(),
                'updatedAt' => $patient->updated_at?->toIso8601String(),
            ]);

        return Inertia::render('reports/employee-deduction', [
            'patients' => $patients,
            'summary' => $summary,
            'filters' => $filters,
            'currencySymbol' => DashboardCurrency::symbol(),
        ]);
    }

    public function exportEmployeeDeduction(Request $request, string $current_team): StreamedResponse
    {
        $filters = $this->filters($request, false);
        $patients = Patient::query()
            ->where('wallet', '<', 0)
            ->whereHas('category', fn (Builder $q) => $q->whereRaw('LOWER(name) = ?', ['employee']))
            ->when($filters['q'] !== '', fn (Builder $query) => $query->where(fn (Builder $query) => $query
                ->where('slug', 'like', '%'.$filters['q'].'%')
                ->orWhere('fullName', 'like', '%'.$filters['q'].'%')))
            ->with(['category'])
            ->orderBy('fullName')->cursor();

        return response()->streamDownload(function () use ($patients): void {
            $output = fopen('php://output', 'w');
            fputcsv($output, ['Hospital No.', 'Patient', 'Category', 'Wallet Balance', 'Created At', 'Updated At'], ',', '"', '\\');
            foreach ($patients as $patient) {
                fputcsv($output, [$patient->slug, $patient->fullName, $patient->category?->name, $patient->wallet, $patient->created_at, $patient->updated_at], ',', '"', '\\');
            }
            fclose($output);
        }, 'employee-deduction-report.csv', ['Content-Type' => 'text/csv']);
    }

    public function importEmployeeDeduction(
        Request $request,
        EmployeeDeductionImporter $importer,
        string $current_team,
    ): RedirectResponse {
        $validated = $request->validate([
            'file' => [
                'required',
                'file',
                'mimes:csv,txt,xlsx,xls',
                'extensions:csv,txt,xlsx,xls',
                'max:10240',
            ],
        ]);

        $file = $validated['file'];
        assert($file instanceof UploadedFile);

        try {
            $result = $importer->handle(
                $file,
                $request->user()->currentTeam,
                $request->user(),
            );
        } catch (InvalidArgumentException $exception) {
            return back()->withErrors(['file' => $exception->getMessage()]);
        }

        if ($result['errors'] !== []) {
            Inertia::flash('toast', [
                'type' => 'warning',
                'message' => "{$result['imported']} deduction(s) imported; {$result['skipped']} row(s) skipped.",
            ]);

            return back()->withErrors(['file' => implode(' ', array_slice($result['errors'], 0, 5))]);
        }

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => "{$result['imported']} employee deduction(s) imported.",
        ]);

        return back();
    }

    public function wallet(Request $request, string $current_team): Response
    {
        $filters = $this->filters($request, true);
        $query = Patient::query()->where('wallet', '<>', 0)
            ->when($filters['balanceType'] === '', fn (Builder $patients) => $patients->whereBetween('updated_at', [$filters['from'].' 00:00:00', $filters['to'].' 23:59:59']))
            ->when($filters['balanceType'] === 'positive', fn (Builder $patients) => $patients->where('wallet', '>', 0))
            ->when($filters['balanceType'] === 'negative', fn (Builder $patients) => $patients->where('wallet', '<', 0))
            ->when($filters['q'] !== '', fn (Builder $patients) => $patients->where(fn (Builder $patients) => $patients
                ->where('slug', 'like', '%'.$filters['q'].'%')
                ->orWhere('fullName', 'like', '%'.$filters['q'].'%')));
        // Overall totals
        $totals = (clone $query)
            ->selectRaw('COALESCE(SUM(wallet), 0) as net, COALESCE(SUM(ABS(wallet)), 0) as absolute')
            ->first();
        // Positive balance totals
        $positiveTotals = (clone $query)->where('wallet', '>', 0)
            ->selectRaw('COALESCE(SUM(wallet), 0) as net, COALESCE(SUM(ABS(wallet)), 0) as absolute')
            ->first();
        // Negative balance totals
        $negativeTotals = (clone $query)->where('wallet', '<', 0)
            ->selectRaw('COALESCE(SUM(wallet), 0) as net, COALESCE(SUM(ABS(wallet)), 0) as absolute')
            ->first();
        $summary = [
            'patients' => (clone $query)->count(),
            'walletBalance' => (float) ($totals->net ?? 0),
            'walletTotal' => (float) ($totals->absolute ?? 0),
            'positivePatients' => (clone $query)->where('wallet', '>', 0)->count(),
            'positiveBalance' => (float) ($positiveTotals->net ?? 0),
            'positiveTotal' => (float) ($positiveTotals->absolute ?? 0),
            'negativePatients' => (clone $query)->where('wallet', '<', 0)->count(),
            'negativeBalance' => (float) ($negativeTotals->net ?? 0),
            'negativeTotal' => (float) ($negativeTotals->absolute ?? 0),
        ];
        $patients = $query->orderBy('fullName')->paginate($filters['perPage'])->withQueryString()
            ->through(fn (Patient $patient) => [
                'id' => $patient->getKey(),
                'patientId' => $patient->slug,
                'name' => $patient->fullName,
                'wallet' => (float) $patient->wallet,
                'createdAt' => $patient->created_at?->toIso8601String(),
                'updatedAt' => $patient->updated_at?->toIso8601String(),
            ]);

        return Inertia::render('reports/wallet', [
            'patients' => $patients,
            'summary' => $summary,
            'filters' => $filters,
            'currencySymbol' => DashboardCurrency::symbol(),
        ]);
    }

    public function priceList(Request $request, string $current_team): Response
    {
        $filters = $this->filters($request);
        $items = PriceList::query()
            ->select('price_lists.*', 'categories.name as category_name')
            ->where('price_lists.is_category', false)
            ->whereNotNull('price_lists.category_id')
            ->where('price_lists.price', '>', 0)
            ->when($filters['q'] !== '', fn (Builder $query) => $query->where('price_lists.name', 'like', '%'.$filters['q'].'%'))
            ->leftJoin('price_lists as categories', 'price_lists.category_id', '=', 'categories.id')
            ->orderBy('categories.name')
            ->orderBy('price_lists.name')
            ->paginate($filters['perPage'])
            ->withQueryString()
            ->through(fn (PriceList $item) => array_merge($this->priceListRow($item), ['category' => $item->category_name ?? null]));

        return Inertia::render('reports/price-list', [
            'items' => $items,
            'filters' => $filters,
            'currencySymbol' => DashboardCurrency::symbol(),
        ]);
    }

    public function exportWallet(Request $request, string $current_team): StreamedResponse
    {
        $filters = $this->filters($request, true);
        $patients = Patient::query()->where('wallet', '<>', 0)
            ->when($filters['balanceType'] === '', fn (Builder $patients) => $patients->whereBetween('updated_at', [$filters['from'].' 00:00:00', $filters['to'].' 23:59:59']))
            ->when($filters['balanceType'] === 'positive', fn (Builder $patients) => $patients->where('wallet', '>', 0))
            ->when($filters['balanceType'] === 'negative', fn (Builder $patients) => $patients->where('wallet', '<', 0))
            ->when($filters['q'] !== '', fn (Builder $query) => $query->where(fn (Builder $query) => $query
                ->where('slug', 'like', '%'.$filters['q'].'%')
                ->orWhere('fullName', 'like', '%'.$filters['q'].'%')))
            ->orderBy('fullName')->cursor();

        return response()->streamDownload(function () use ($patients): void {
            $output = fopen('php://output', 'w');
            fputcsv($output, ['Hospital No.', 'Patient', 'Wallet Balance', 'Created At', 'Updated At'], ',', '"', '\\');
            foreach ($patients as $patient) {
                fputcsv($output, [$patient->slug, $patient->fullName, $patient->wallet, $patient->created_at, $patient->updated_at], ',', '"', '\\');
            }
            fclose($output);
        }, 'wallet-report.csv', ['Content-Type' => 'text/csv']);
    }

    public function exportPriceList(Request $request, string $current_team): StreamedResponse
    {
        $filters = $this->filters($request);
        $items = PriceList::query()->where('price_lists.is_category', false)
            ->whereNotNull('price_lists.category_id')
            ->where('price_lists.price', '>', 0)
            ->when($filters['q'] !== '', fn (Builder $query) => $query->where('price_lists.name', 'like', '%'.$filters['q'].'%'))
            ->leftJoin('price_lists as categories', 'price_lists.category_id', '=', 'categories.id')
            ->orderBy('categories.name')
            ->orderBy('price_lists.name')->lazy(500);

        return response()->streamDownload(function () use ($items): void {
            $output = fopen('php://output', 'w');
            fputcsv($output, ['ID', 'Name', 'Category', 'Subcategory', 'Parameter', 'Result type', 'Options', 'Description', 'Ranges', 'Price', 'Unit', 'Category row', 'Inventory', 'Created at', 'Updated at'], ',', '"', '\\');
            foreach ($items as $item) {
                fputcsv($output, [
                    $item->getKey(),
                    $item->name,
                    $item->category?->name,
                    $item->subCategory?->name,
                    $item->parameter?->name,
                    $item->result_type,
                    is_array($item->options) ? json_encode($item->options) : $item->options,
                    $item->description,
                    $item->ranges,
                    $item->price,
                    $item->uom,
                    $item->is_category ? 'Yes' : 'No',
                    $item->is_inventory ? 'Yes' : 'No',
                    $item->created_at,
                    $item->updated_at,
                ], ',', '"', '\\');
            }
            fclose($output);
        }, 'price-list-report.csv', ['Content-Type' => 'text/csv']);
    }

    /** @return array{q: string, from: ?string, to: ?string, balanceType: string, perPage: int} */
    private function filters(Request $request, bool $withDates = false): array
    {
        $rules = [
            'q' => ['nullable', 'string', 'max:255'],
            'perPage' => ['nullable', 'integer', Rule::in([10, 25, 50, 100])],
            'balanceType' => ['nullable', 'string', Rule::in(['', 'positive', 'negative'])],
        ];

        if ($withDates) {
            $rules['from'] = ['nullable', 'date'];
            $rules['to'] = ['nullable', 'date', 'after_or_equal:from'];
        }

        $validated = $request->validate($rules);

        return [
            'q' => trim((string) ($validated['q'] ?? '')),
            'from' => $withDates ? ($validated['from'] ?? today()->toDateString()) : null,
            'to' => $withDates ? ($validated['to'] ?? today()->toDateString()) : null,
            'balanceType' => trim((string) ($validated['balanceType'] ?? '')),
            'perPage' => (int) ($validated['perPage'] ?? 25),
        ];
    }

    /** @return array<string, mixed> */
    private function priceListRow(PriceList $item): array
    {
        return [
            'id' => $item->getKey(),
            'name' => $item->name,
            'category' => $item->category?->name,
            'subcategory' => $item->subCategory?->name,
            'parameter' => $item->parameter?->name,
            'price' => (float) ($item->price ?? 0),
            'uom' => $item->uom,
            'isCategory' => (bool) $item->is_category,
            'isInventory' => (bool) $item->is_inventory,
        ];
    }
}
