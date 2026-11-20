<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreLaboratoryResultsRequest;
use App\Models\LabInventory;
use App\Models\Laboratory;
use App\Models\Line;
use App\Models\Patient;
use App\Models\PriceList;
use App\Models\TestResult;
use App\Service\DashboardCurrency;
use App\Service\InventoryUsageService;
use Carbon\CarbonImmutable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class LaboratoryController extends Controller
{
    /**
     * The pagination sizes that users may pick.
     */
    private const PER_PAGE_OPTIONS = [10, 25, 50, 100];

    /**
     * The laboratory columns that may be used to sort the list.
     */
    private const SORTABLE_COLUMNS = ['patient_id', 'total', 'status', 'created_at'];

    /**
     * The date filters offered on the laboratory workspace.
     *
     * @var array<string, string>
     */
    private const DATE_FILTERS = [
        'today' => 'Today',
        'yesterday' => 'Yesterday',
        'this_week' => 'This Week',
        'last_week' => 'Last Week',
        'this_month' => 'This Month',
        'last_month' => 'Last Month',
        'this_year' => 'This Year',
        'last_year' => 'Last Year',
    ];

    /**
     * Show the laboratory workspace: stats, result entry, and create request.
     */
    public function index(Request $request): Response
    {
        $dateFilter = $this->dateFilter($request->query('date_filter'));
        $selectedId = $request->integer('laboratory_id');
        $selectedPatientId = trim((string) $request->query('patient_id', ''));
        if ($selectedPatientId !== '') {
            validator(['patient_id' => $selectedPatientId], [
                'patient_id' => ['required', 'string', Rule::exists('patients', 'slug')->where('team_id', $request->user()->currentTeam->getKey())],
            ])->validate();
        }

        [$dateStart, $dateEnd] = $this->dateRange($dateFilter);

        $paidOptions = Laboratory::query()
            ->where('status', 'paid')
            ->whereBetween('created_at', [$dateStart, $dateEnd])
            ->with('patient')
            ->orderByDesc('created_at')
            ->get()
            ->map(fn (Laboratory $laboratory) => [
                'id' => $laboratory->getKey(),
                'label' => trim(($laboratory->patient->slug ?? $laboratory->patient_id).' '.($laboratory->patient->fullName ?? '')),
                'patientId' => $laboratory->patient_id,
                'gender' => $laboratory->patient?->gender,
                'age' => $laboratory->patient?->age,
            ])
            ->values();

        $selected = $selectedId > 0
            ? Laboratory::query()->whereKey($selectedId)->where('status', 'paid')
                ->with(['patient' => fn ($query) => $query->with('admissions')])
                ->first()
            : null;

        return Inertia::render('laboratories/index', [
            'currencySymbol' => DashboardCurrency::symbol(),
            'filters' => [
                'date_filter' => $dateFilter,
                'date_filter_label' => self::DATE_FILTERS[$dateFilter],
                'laboratory_id' => $selected?->getKey(),
            ],
            'dateFilterOptions' => collect(self::DATE_FILTERS)
                ->map(fn (string $label, string $value) => ['value' => $value, 'label' => $label])
                ->values(),
            'stats' => $this->stats($dateFilter),
            'topTests' => $this->topTests($dateFilter),
            'paidOptions' => $paidOptions,
            'selected' => $selected ? [
                'id' => $selected->getKey(),
                'patientId' => $selected->patient_id,
                'patientName' => $selected->patient?->fullName,
                'gender' => $selected->patient?->gender,
                'age' => $selected->patient?->age,
                'birthDate' => $selected->patient?->birthDate?->format('Y-m-d'),
                'doctorName' => $selected->doctor?->name,
                'createdAt' => $selected->created_at?->toIso8601String(),
                'isAdmitted' => $selected->patient?->isAdmitted() ?? false,
                'lines' => $selected->lines()
                    ->with(['priceList', 'testResults'])
                    ->get()
                    ->map(fn (Line $line) => [
                        'id' => $line->getKey(),
                        'name' => $line->priceList->name ?? 'Unknown',
                        'unitPrice' => (float) $line->unitPrice,
                        'quantity' => (int) $line->quantity,
                        'completed' => ! is_null($line->results) || ! $line->testResults->isEmpty(),
                    ])
                    ->values(),
            ] : null,
            'resultForm' => $selected ? $this->resultForm($selected, pendingOnly: true) : null,
            'createOptions' => [
                'patients' => $this->patientOptions(
                    search: $request->query('q'),
                    selectedPatientSlug: $selectedPatientId,
                ),
                'tests' => $this->laboratoryTests()
                    ->map(fn (PriceList $test) => [
                        'id' => $test->getKey(),
                        'name' => $test->name,
                        'price' => (float) ($test->price ?? 0),
                        'cost' => $test->unitCost() ?? 0,
                    ])->values(),
                'selectedPatientId' => $selectedPatientId,
            ],
        ]);
    }

    /**
     * List laboratory requests for the current team.
     */
    public function history(Request $request): Response
    {
        $patientId = trim((string) $request->query('patient_id', ''));
        if ($patientId !== '') {
            validator(['patient_id' => $patientId], [
                'patient_id' => ['required', 'string', Rule::exists('patients', 'slug')->where('team_id', $request->user()->currentTeam->getKey())],
            ])->validate();
        }

        $filters = [
            'q' => trim((string) $request->query('q', '')),
            'patientId' => $patientId,
            'sort' => $this->sortBy($request),
            'direction' => $request->query('direction') === 'asc' ? 'asc' : 'desc',
            'perPage' => $this->perPage($request),
            'from' => $this->date($request->query('from')),
            'to' => $this->date($request->query('to')),
            'status' => $this->statusFilter($request->query('status')),
        ];

        $query = $this->filteredQuery($filters);

        $laboratories = (clone $query)
            ->with(['patient', 'doctor'])
            ->orderBy($filters['sort'], $filters['direction'])
            ->paginate($filters['perPage'])
            ->withQueryString()
            ->through(fn (Laboratory $laboratory) => $this->listItem($laboratory));

        return Inertia::render('laboratories/history', [
            'currencySymbol' => DashboardCurrency::symbol(),
            'laboratories' => $laboratories,
            'filters' => $filters,
            'summary' => [
                'total' => (float) (clone $query)->sum('total'),
                'count' => (clone $query)->count(),
            ],
            'statusOptions' => [
                ['value' => '', 'label' => 'All statuses'],
                ['value' => 'pending', 'label' => 'Pending'],
                ['value' => 'paid', 'label' => 'Paid'],
                ['value' => 'submitted', 'label' => 'Submitted'],
                ['value' => 'cancelled', 'label' => 'Cancelled'],
                ['value' => 'cancel', 'label' => 'Cancellation'],
            ],
        ]);
    }

    /**
     * Show a laboratory request and its results.
     */
    public function show(Request $request, string $current_team, Laboratory $laboratory): Response
    {
        $laboratory->load(['patient', 'doctor', 'team']);

        return Inertia::render('laboratories/show', [
            'currencySymbol' => DashboardCurrency::symbol(),
            'laboratory' => [
                'id' => $laboratory->getKey(),
                'patientId' => $laboratory->patient_id,
                'patientName' => $laboratory->patient?->fullName,
                'gender' => $laboratory->patient?->gender,
                'age' => $laboratory->patient?->age,
                'birthDate' => $laboratory->patient?->birth_date?->toIso8601String(),
                'doctorName' => $laboratory->doctor?->name,
                'status' => $laboratory->status,
                'total' => (float) $laboratory->total,
                'createdAt' => $laboratory->created_at?->toIso8601String(),
                'facilityName' => $laboratory->team?->name,
                'facilityAddress' => $laboratory->team?->address,
                'lines' => $laboratory->lines()
                    ->with(['priceList', 'testResults'])
                    ->get()
                    ->map(fn (Line $line) => [
                        'id' => $line->getKey(),
                        'name' => $line->priceList->name ?? 'Unknown',
                        'unitPrice' => (float) $line->unitPrice,
                        'quantity' => (int) $line->quantity,
                        'completed' => ! is_null($line->results) || ! $line->testResults->isEmpty(),
                    ])
                    ->values(),
            ],
            'resultForm' => $this->resultForm($laboratory, pendingOnly: false),
            'canEdit' => in_array($laboratory->status, ['paid', 'submitted'], true),
        ]);
    }

    /**
     * Show a dedicated print-friendly page for a laboratory test result.
     */
    public function print(Request $request, string $current_team, Laboratory $laboratory): Response
    {
        $laboratory->load(['patient', 'doctor', 'team']);

        return Inertia::render('laboratories/print', [
            'laboratory' => [
                'id' => $laboratory->getKey(),
                'patientId' => $laboratory->patient_id,
                'patientName' => $laboratory->patient?->fullName,
                'gender' => $laboratory->patient?->gender,
                'age' => $laboratory->patient?->age,
                'doctorName' => $laboratory->doctor?->name,
                'status' => $laboratory->status,
                'total' => (float) $laboratory->total,
                'createdAt' => $laboratory->created_at?->toIso8601String(),
                'facilityName' => $laboratory->team?->name,
                'facilityAddress' => $laboratory->team?->address,
            ],
            'resultForm' => $this->resultForm($laboratory, pendingOnly: false),
        ]);
    }

    /**
     * Create a new laboratory request with lines and billing.
     */
    public function store(Request $request): RedirectResponse
    {
        $teamId = $request->user()->currentTeam->getKey();

        $data = $request->validate([
            'patient_id' => ['required', 'string', Rule::exists('patients', 'slug')->where('team_id', $teamId)],
            'lines' => ['required', 'array', 'min:1'],
            'lines.*.price_list_id' => ['required', Rule::exists('price_lists', 'id')->where('team_id', $teamId)],
            'lines.*.unitPrice' => ['nullable', 'numeric'],
            'lines.*.unitCost' => ['nullable', 'numeric'],
            'lines.*.quantity' => ['nullable', 'numeric', 'min:1'],
            'total' => ['nullable', 'numeric'],
        ]);

        /** @var array<int, array<string, mixed>> $lines */
        $lines = $data['lines'];

        $priceLists = PriceList::query()
            ->with(['labInventories', 'drugInventories', 'inventories'])
            ->whereIn('id', array_column($lines, 'price_list_id'))
            ->get()
            ->keyBy(fn (PriceList $priceList): int => (int) $priceList->getKey());

        $lines = array_map(function (array $line) use ($priceLists): array {
            $priceList = $priceLists->get((int) $line['price_list_id']);

            return [
                ...$line,
                'unitPrice' => (float) ($line['unitPrice'] ?? $priceList->price ?? 0),
                'unitCost' => ($line['unitCost'] ?? null) ?: $priceList?->unitCost(),
            ];
        }, $lines);

        $data['lines'] = $lines;

        $total = collect($lines)->sum(
            fn (array $line) => (float) ($line['quantity'] ?? 1) * (float) ($line['unitPrice'] ?? 0),
        );

        DB::transaction(function () use ($request, $data, $teamId, $total): void {
            $laboratory = Laboratory::create([
                'team_id' => $teamId,
                'patient_id' => $data['patient_id'],
                'doctor_id' => $request->user()->getKey(),
                'status' => 'pending',
                'total' => $data['total'] ?? $total,
            ]);

            foreach ($data['lines'] as $line) {
                $laboratory->lines()->create([
                    'team_id' => $teamId,
                    'patient_id' => $data['patient_id'],
                    'user_id' => $request->user()->getKey(),
                    'price_list_id' => $line['price_list_id'],
                    'quantity' => $line['quantity'] ?? 1,
                    'unitPrice' => $line['unitPrice'] ?? 0,
                    'unitCost' => $line['unitCost'] ?? null,
                ]);
            }

            $laboratory->billings()->create([
                'team_id' => $teamId,
                'patient_id' => $data['patient_id'],
                'user_id' => $request->user()->getKey(),
                'total' => $data['total'] ?? $total,
                'status' => 'billed',
            ]);
        });

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Laboratory request created.']);

        return to_route('laboratories.index', $request->user()->currentTeam->slug);
    }

    /**
     * Submit results for a paid laboratory request.
     */
    public function storeResults(StoreLaboratoryResultsRequest $request, string $current_team, Laboratory $laboratory): RedirectResponse
    {
        abort_unless($laboratory->status === 'paid', 422, 'Only paid laboratory requests can receive new results.');

        $this->persistResults($request, $laboratory);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Results submitted successfully.']);

        return to_route('laboratories.show', [
            'current_team' => $current_team,
            'laboratory' => $laboratory->getKey(),
        ]);
    }

    /**
     * Update results for a laboratory request.
     */
    public function updateResults(Request $request, string $current_team, Laboratory $laboratory): RedirectResponse
    {
        abort_unless(in_array($laboratory->status, ['paid', 'submitted'], true), 422);

        $this->persistResults($request, $laboratory);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Results updated successfully.']);

        return back();
    }

    /**
     * Cancel selected lines of a submitted laboratory request.
     *
     * - Only allowed when the original request status is "submitted".
     * - Removes the checked lines from the original request.
     * - Creates a new laboratory request with status "cancel" containing the cancelled lines.
     * - Sends the negative of the total to cashier for refund.
     */
    public function cancel(Request $request, string $current_team, Laboratory $laboratory): RedirectResponse
    {
        abort_unless($laboratory->status === 'submitted', 422, 'Only submitted laboratory requests can be cancelled.');

        $teamId = $request->user()->currentTeam->getKey();
        $patientId = $laboratory->patient_id;
        $userId = $request->user()->getKey();

        // Accept specific line IDs to cancel
        $cancelLineIds = $request->input('refund_line_ids');
        if (is_array($cancelLineIds)) {
            $cancelLineIds = array_map('intval', array_filter($cancelLineIds));
        } else {
            $cancelLineIds = [];
        }

        if (empty($cancelLineIds)) {
            Inertia::flash('toast', ['type' => 'warning', 'message' => 'Please select at least one test to cancel.']);

            return back();
        }

        $lines = $laboratory->lines()->with(['priceList', 'testResults'])->get();

        // Filter to only lines that were checked for cancellation
        $cancelLines = $lines->filter(fn (Line $line) => in_array($line->id, $cancelLineIds, true));

        if ($cancelLines->isEmpty()) {
            Inertia::flash('toast', ['type' => 'warning', 'message' => 'Selected tests not found.']);

            return back();
        }

        DB::transaction(function () use ($laboratory, $teamId, $patientId, $userId, $cancelLines): void {
            // Calculate the negative total for refund
            $negativeTotal = $cancelLines->sum(fn (Line $line) => (float) $line->quantity * -(float) $line->unitPrice);

            // Create a new laboratory request with status "cancel"
            $cancelLaboratory = Laboratory::create([
                'team_id' => $teamId,
                'patient_id' => $patientId,
                'doctor_id' => $userId,
                'status' => 'cancel',
                'total' => $negativeTotal,
            ]);

            // Copy the cancelled lines to the new cancellation request with negative prices
            foreach ($cancelLines as $line) {
                $cancelLaboratory->lines()->create([
                    'team_id' => $teamId,
                    'patient_id' => $patientId,
                    'user_id' => $userId,
                    'price_list_id' => $line->price_list_id,
                    'quantity' => $line->quantity,
                    'unitPrice' => -(float) $line->unitPrice,
                    'unitCost' => $line->unitCost,
                ]);
            }

            // Create a billing record with negative total for refund at cashier
            $cancelLaboratory->billings()->create([
                'team_id' => $teamId,
                'patient_id' => $patientId,
                'user_id' => $userId,
                'total' => $negativeTotal,
                'status' => 'billed',
            ]);

            // Remove the cancelled lines from the original request
            foreach ($cancelLines as $line) {
                $line->testResults()->delete();
                $line->delete();
            }

            // Update the original request's total to reflect removed lines
            $remainingTotal = $laboratory->lines()->sum(
                DB::raw('quantity * unitPrice'),
            );
            $laboratory->update(['total' => $remainingTotal]);

            // If all lines have been removed, mark the original as cancelled
            if ($laboratory->lines()->count() === 0) {
                $laboratory->update(['status' => 'cancelled']);
            }
        });

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Selected tests cancelled. Negative billing created for refund.']);

        return to_route('laboratories.index', $request->user()->currentTeam->slug);
    }

    /**
     * Delete a laboratory request and its dependent records.
     */
    public function destroy(Request $request, string $current_team, Laboratory $laboratory): RedirectResponse
    {
        DB::transaction(function () use ($laboratory): void {
            $laboratory->lines()->each(function (Line $line): void {
                $line->testResults()->delete();
                $line->delete();
            });
            $laboratory->billings()->forceDelete();
            $laboratory->delete();
        });

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Laboratory request deleted.']);

        return to_route('laboratories.history', $request->user()->currentTeam->slug);
    }

    /**
     * Bulk-delete laboratory requests.
     */
    public function bulkDestroy(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'ids' => ['required', 'array', 'min:1'],
            'ids.*' => ['integer', Rule::exists('laboratories', 'id')->where('team_id', $request->user()->currentTeam->getKey())],
        ]);

        DB::transaction(function () use ($data): void {
            Laboratory::query()->whereIn('id', $data['ids'])->each(function (Laboratory $laboratory): void {
                $laboratory->lines()->each(function (Line $line): void {
                    $line->testResults()->delete();
                    $line->delete();
                });
                $laboratory->billings()->forceDelete();
                $laboratory->delete();
            });
        });

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Laboratory requests deleted.']);

        return to_route('laboratories.history', $request->user()->currentTeam->slug);
    }

    /**
     * Persist simple and parameterised test results.
     */
    private function persistResults(Request $request, Laboratory $laboratory): void
    {
        $data = $request->validate([
            'lines' => ['nullable', 'array'],
            'lines.*' => ['nullable'],
            'testResults' => ['nullable', 'array'],
            'testResults.*' => ['nullable', 'array'],
            'testResults.*.*.price_list_id' => ['required_with:testResults', 'integer'],
            'testResults.*.*.result' => ['nullable', 'string'],
            'inventoryConsumption' => ['nullable', 'array'],
            'inventoryConsumption.*' => ['array'],
            'inventoryConsumption.*.*.lab_inventory_id' => ['required_with:inventoryConsumption', 'integer', Rule::exists('lab_inventories', 'id')],
            'inventoryConsumption.*.*.quantity' => ['required_with:inventoryConsumption', 'numeric', 'min:1'],
        ]);

        $patient = Patient::query()->where('slug', $laboratory->patient_id)->first();
        $userId = $request->user()->getKey();
        $teamId = $request->user()->currentTeam->getKey();

        DB::transaction(function () use ($data, $laboratory, $patient, $userId, $teamId): void {
            foreach (($data['lines'] ?? []) as $priceListId => $result) {
                if ($result === null || $result === '') {
                    continue;
                }

                $line = Line::query()
                    ->where('lineable_type', Laboratory::class)
                    ->where('lineable_id', $laboratory->getKey())
                    ->where('price_list_id', $priceListId)
                    ->first();

                if (! $line) {
                    continue;
                }

                $line->update([
                    'user_id' => $userId,
                    'results' => is_scalar($result) ? (string) $result : json_encode($result),
                ]);
            }

            foreach (($data['testResults'] ?? []) as $parentPriceListId => $rows) {
                $line = Line::query()
                    ->where('lineable_type', Laboratory::class)
                    ->where('lineable_id', $laboratory->getKey())
                    ->where('price_list_id', $parentPriceListId)
                    ->first();

                if (! $line) {
                    continue;
                }

                foreach ($rows as $row) {
                    if (empty($row['result'])) {
                        continue;
                    }

                    TestResult::updateOrCreate(
                        [
                            'line_id' => $line->id,
                            'price_list_id' => $row['price_list_id'],
                        ],
                        [
                            'team_id' => $teamId,
                            'patient_id' => $laboratory->patient_id,
                            'user_id' => $userId,
                            'result' => $row['result'],
                        ]
                    );
                }

                $line->update([
                    'user_id' => $userId,
                    'results' => 'See parameters',
                ]);
            }

            // Process explicit inventory consumption entries, grouped by test (price_list_id)
            $inventoryConsumption = $data['inventoryConsumption'] ?? [];
            if (! empty($inventoryConsumption)) {
                // Collect all lab inventory IDs across all tests
                $labInventoryIds = collect($inventoryConsumption)
                    ->flatten(1)
                    ->pluck('lab_inventory_id')
                    ->unique()
                    ->values()
                    ->all();

                $labInventories = LabInventory::query()
                    ->with('priceList')
                    ->whereKey($labInventoryIds)
                    ->get()
                    ->keyBy('id');

                // Process each test's consumption
                foreach ($inventoryConsumption as $priceListId => $consumptionRows) {
                    if (! is_array($consumptionRows)) {
                        continue;
                    }

                    $line = Line::query()
                        ->where('lineable_type', Laboratory::class)
                        ->where('lineable_id', $laboratory->getKey())
                        ->where('price_list_id', (int) $priceListId)
                        ->first();

                    $totalInventoryCost = 0.0;

                    foreach ($consumptionRows as $consumption) {
                        $labInventory = $labInventories->get($consumption['lab_inventory_id']);

                        if (! $labInventory) {
                            continue;
                        }

                        $quantity = (int) $consumption['quantity'];

                        // Calculate cost: quantity × unit cost of the inventory item
                        $itemCost = $quantity * ($labInventory->cost ?? 0);
                        $totalInventoryCost += $itemCost;

                        app(InventoryUsageService::class)->use(
                            $labInventory,
                            quantity: $quantity,
                            stockStatus: 'Used',
                            patientId: $patient?->id,
                        );
                    }

                    // Update the line with the total inventory cost for this test
                    if ($line && $totalInventoryCost > 0) {
                        $line->update([
                            'unitCost' => $line->unitCost + $totalInventoryCost,
                        ]);
                    }
                }
            }
        });

        $allResultsFilled = $this->areAllResultsFilled($laboratory);

        if ($allResultsFilled) {
            $laboratory->update(['status' => 'submitted']);
        }
    }

    /**
     * Check whether every test in the laboratory request has a result.
     *
     * Mirrors the frontend resultForm logic which deduplicates lines by
     * price_list_id – so when multiple lines share the same test, the test
     * is considered filled if **any** of those lines has a result.
     *
     * For simple tests the line's `results` column must be filled.
     * For parameterised tests every expected parameter must have a
     * corresponding TestResult row with a non-empty result.
     */
    private function areAllResultsFilled(Laboratory $laboratory): bool
    {
        $lines = $laboratory->lines()
            ->with(['priceList.parameters', 'testResults'])
            ->get();

        // Group lines by price_list_id to match the frontend's unique('id') deduplication
        $grouped = $lines->groupBy('price_list_id');

        foreach ($grouped as $priceListId => $linesGroup) {
            $firstLine = $linesGroup->first();
            $priceList = $firstLine->priceList;

            // If the test has parameters, check that every parameter has a result
            // Aggregate testResults across all lines in the group
            if ($priceList !== null && $priceList->parameters->isNotEmpty()) {
                $expectedParamIds = $priceList->parameters->pluck('id')->map(fn ($id) => (int) $id);

                // Collect filled parameter IDs from all lines sharing this price_list_id
                $filledParamIds = collect();
                foreach ($linesGroup as $line) {
                    $filledParamIds = $filledParamIds->merge(
                        $line->testResults
                            ->filter(fn (TestResult $tr) => $tr->result !== null && $tr->result !== '')
                            ->pluck('price_list_id')
                            ->map(fn ($id) => (int) $id)
                    );
                }

                // Check that every expected parameter has a corresponding result
                if ($expectedParamIds->isNotEmpty() && ! $expectedParamIds->every(fn ($id) => $filledParamIds->contains($id))) {
                    return false;
                }

                continue;
            }

            // Simple test – check if any line in the group has a result
            $hasResult = $linesGroup->some(fn (Line $line) => $line->results !== null && $line->results !== '');
            if (! $hasResult) {
                return false;
            }
        }

        return $lines->isNotEmpty();
    }

    /**
     * Build the result entry / view structure for a laboratory request.
     *
     * @return array{steps: list<array{name: string, tests: list<array<string, mixed>>}>, hasPending: bool, inventoryItems: list<array<string, mixed>>}
     */
    private function resultForm(Laboratory $laboratory, bool $pendingOnly): array
    {
        $lines = $laboratory->lines()
            ->with(['priceList.parameters', 'priceList.subCategory', 'testResults.priceList'])
            ->when($pendingOnly, function (Builder $query): void {
                $query->whereNull('results');
            })
            ->get();

        $tests = $lines->map(fn (Line $line) => $line->priceList)->filter()->unique('id')->values();

        // Load all lab inventory items so user can select any item for any test
        $allInventoryItems = LabInventory::with('priceList')->get()->map(fn (LabInventory $inv) => [
            'id' => $inv->id,
            'sku' => $inv->sku,
            'name' => $inv->priceList->name ?? $inv->sku,
            'quantity' => (float) $inv->quantity,
        ])->values()->all();

        $steps = [];

        foreach ($this->groupBySubcategory($tests) as $subcategoryName => $subcategoryTests) {
            $stepTests = [];

            foreach ($subcategoryTests as $test) {
                $line = $lines->first(fn (Line $l) => $l->price_list_id === $test->id);

                if ($test->parameters->isNotEmpty()) {
                    if ($pendingOnly) {
                        $rows = $test->parameters->map(fn (PriceList $param) => [
                            'price_list_id' => $param->id,
                            'name' => $param->name,
                            'range' => $param->ranges ?? null,
                            'uom' => Str::of((string) ($param->uom ?? ''))->stripTags()->squish()->toString() ?: null,
                            'result_type' => $param->result_type ?? 'text',
                            'options' => $this->resultOptions($param),
                            'result' => null,
                        ])->values()->all();
                    } else {
                        // Build a map of saved results keyed by price_list_id
                        $savedResults = $line
                            ? $line->testResults->keyBy('price_list_id')
                            : collect();

                        // Always show all expected parameters, filling in saved results where available
                        $rows = $test->parameters->map(fn (PriceList $param) => [
                            'price_list_id' => $param->id,
                            'name' => $param->name,
                            'range' => $param->ranges ?? null,
                            'uom' => Str::of((string) ($param->uom ?? ''))->stripTags()->squish()->toString() ?: null,
                            'result_type' => $param->result_type ?? 'text',
                            'options' => $this->resultOptions($param),
                            'result' => $savedResults->get($param->id)?->result ?? null,
                        ])->values()->all();
                    }

                    $stepTests[] = [
                        'id' => $test->id,
                        'name' => $test->name,
                        'kind' => 'parameters',
                        'rows' => $rows,
                    ];

                    continue;
                }

                $stepTests[] = [
                    'id' => $test->id,
                    'name' => $test->name,
                    'kind' => 'simple',
                    'result_type' => $test->result_type ?? 'text',
                    'options' => $this->resultOptions($test),
                    'unit' => $test->uom ? Str::of((string) $test->uom)->stripTags()->squish()->toString() : null,
                    'result' => $line?->results,
                ];
            }

            if ($stepTests === []) {
                continue;
            }

            $steps[] = [
                'name' => $subcategoryName,
                'tests' => $stepTests,
            ];
        }

        return [
            'steps' => $steps,
            'hasPending' => $steps !== [],
            'inventoryItems' => $allInventoryItems,
        ];
    }

    /**
     * @param  Collection<int, PriceList>  $tests
     * @return Collection<string, Collection<int, PriceList>>
     */
    private function groupBySubcategory(Collection $tests): Collection
    {
        return $tests->groupBy(fn (PriceList $test): string => $test->subCategory->name ?? 'Other');
    }

    /**
     * Normalise price-list option values for result inputs.
     *
     * @return list<string>
     */
    private function resultOptions(?PriceList $source): array
    {
        if (! $source || empty($source->options)) {
            return $source?->result_type === 'radio'
                ? ['Positive', 'Negative', 'Pending']
                : [];
        }

        $options = $source->options;

        if (is_string($options)) {
            $decoded = json_decode($options, true);
            $options = json_last_error() === JSON_ERROR_NONE ? $decoded : [];
        }

        if (! is_array($options) || $options === []) {
            return $source->result_type === 'radio'
                ? ['Positive', 'Negative', 'Pending']
                : [];
        }

        if (isset($options[0]) && is_string($options[0])) {
            return array_values(array_filter($options));
        }

        return collect($options)
            ->map(fn ($option) => is_array($option) ? ($option['label'] ?? null) : (is_object($option) ? ($option->label ?? null) : null))
            ->filter()
            ->values()
            ->all();
    }

    /**
     * Laboratory test catalog items (non-parameter rows under Laboratory).
     *
     * @return Collection<int, PriceList>
     */
    private function laboratoryTests(): Collection
    {
        return PriceList::query()
            ->whereNull('parameter_id')
            ->where('is_category', false)
            ->where('is_inventory', false)
            ->where(function (Builder $query): void {
                $query
                    ->whereHas('subCategory.category', fn (Builder $query): Builder => $query->where('name', 'Laboratory'))
                    ->orWhereHas('category', fn (Builder $query): Builder => $query->where('name', 'Laboratory'))
                    ->orWhereHas('subCategory', fn (Builder $query): Builder => $query->where('name', 'Laboratory'));
            })
            ->orderBy('name')
            ->get();
    }

    /**
     * @return array{pending: int, paid: int, submitted: int, total: int}
     */
    private function stats(string $dateFilter): array
    {
        [$start, $end] = $this->dateRange($dateFilter);

        $row = Laboratory::query()
            ->selectRaw("
                COUNT(*) as total,
                SUM(CASE WHEN status = 'submitted' THEN 1 ELSE 0 END) as submitted,
                SUM(CASE WHEN status = 'paid' THEN 1 ELSE 0 END) as paid,
                SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending
            ")
            ->whereBetween('created_at', [$start, $end])
            ->first();

        return [
            'pending' => (int) ($row->pending ?? 0),
            'paid' => (int) ($row->paid ?? 0),
            'submitted' => (int) ($row->submitted ?? 0),
            'total' => (int) ($row->total ?? 0),
        ];
    }

    /**
     * @return array<int, array{name: string, requests: int, value: float}>
     */
    private function topTests(string $dateFilter): array
    {
        [$start, $end] = $this->dateRange($dateFilter);

        return Line::query()
            ->with('priceList:id,name')
            ->where('lineable_type', Laboratory::class)
            ->whereBetween('created_at', [$start, $end])
            ->selectRaw('MIN(id) AS id, price_list_id, COUNT(DISTINCT lineable_id) AS requests, SUM(totalPrice) AS value')
            ->groupBy('price_list_id')
            ->orderByDesc('requests')
            ->orderBy('price_list_id')
            ->limit(10)
            ->get()
            ->map(fn (Line $line): array => [
                'name' => $line->priceList->name ?? 'Unknown test',
                'requests' => (int) $line->requests,
                'value' => (float) ($line->value ?? 0),
            ])
            ->all();
    }

    /**
     * @param  array{q: string, patientId?: string, sort: string, direction: string, perPage: int, from: ?string, to: ?string, status: string}  $filters
     * @return Builder<Laboratory>
     */
    private function filteredQuery(array $filters): Builder
    {
        $query = Laboratory::query();

        if (($filters['patientId'] ?? '') !== '') {
            $query->where('patient_id', $filters['patientId']);
        }

        if ($filters['q'] !== '') {
            $like = '%'.$filters['q'].'%';

            $query->where(function (Builder $query) use ($like): void {
                $query
                    ->where('patient_id', 'like', $like)
                    ->orWhere('status', 'like', $like)
                    ->orWhereHas('patient', fn (Builder $query) => $query->where('fullName', 'like', $like))
                    ->orWhereHas('doctor', fn (Builder $query) => $query->where('name', 'like', $like));
            });
        }

        if ($filters['status'] !== '') {
            $query->where('status', $filters['status']);
        }

        // Search query bypasses date filtering so it searches across all dates
        if ($filters['q'] === '' && $filters['from'] !== null) {
            $query->whereDate('created_at', '>=', $filters['from']);
        }

        if ($filters['q'] === '' && $filters['to'] !== null) {
            $query->whereDate('created_at', '<=', $filters['to']);
        }

        return $query;
    }

    /**
     * @return array<string, mixed>
     */
    private function listItem(Laboratory $laboratory): array
    {
        return [
            'id' => $laboratory->getKey(),
            'patientId' => $laboratory->patient_id,
            'patientName' => $laboratory->patient?->fullName,
            'doctorName' => $laboratory->doctor?->name,
            'status' => $laboratory->status,
            'total' => (float) $laboratory->total,
            'createdAt' => $laboratory->created_at?->toIso8601String(),
        ];
    }

    /**
     * @return array{0: CarbonImmutable, 1: CarbonImmutable}
     */
    private function dateRange(string $filter): array
    {
        $now = CarbonImmutable::now();

        return match ($filter) {
            'yesterday' => [$now->subDay()->startOfDay(), $now->subDay()->endOfDay()],
            'this_week' => [$now->startOfWeek(), $now->endOfWeek()],
            'last_week' => [$now->subWeek()->startOfWeek(), $now->subWeek()->endOfWeek()],
            'this_month' => [$now->startOfMonth(), $now->endOfMonth()],
            'last_month' => [$now->subMonthNoOverflow()->startOfMonth(), $now->subMonthNoOverflow()->endOfMonth()],
            'this_year' => [$now->startOfYear(), $now->endOfYear()],
            'last_year' => [$now->subYear()->startOfYear(), $now->subYear()->endOfYear()],
            default => [$now->startOfDay(), $now->endOfDay()],
        };
    }

    private function dateFilter(mixed $value): string
    {
        $filter = is_string($value) ? $value : 'today';

        return array_key_exists($filter, self::DATE_FILTERS) ? $filter : 'today';
    }

    private function statusFilter(mixed $value): string
    {
        $status = is_string($value) ? $value : '';

        return in_array($status, ['pending', 'paid', 'submitted', 'cancelled', 'cancel'], true) ? $status : '';
    }

    private function sortBy(Request $request): string
    {
        $sort = (string) $request->query('sort', 'created_at');

        return in_array($sort, self::SORTABLE_COLUMNS, true) ? $sort : 'created_at';
    }

    private function perPage(Request $request): int
    {
        $perPage = (int) $request->query('perPage', 25);

        return in_array($perPage, self::PER_PAGE_OPTIONS, true) ? $perPage : 25;
    }

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

    /**
     * Patients available for laboratory requests, filtered by a search term.
     *
     * Only a bounded list is returned because the roster may hold tens of
     * thousands of patients. The currently selected patient is always kept so
     * the form never loses the value it was opened with.
     *
     * @return Collection<int, array<string, mixed>>
     */
    private function patientOptions(?string $search = null, ?string $selectedPatientSlug = null): Collection
    {
        $term = trim((string) $search);
        $selectedPatientSlug = trim((string) $selectedPatientSlug);

        $patients = Patient::query()
            ->when($term !== '', function (Builder $query) use ($term): void {
                $like = '%'.$term.'%';
                $query->where(function (Builder $query) use ($like): void {
                    $query->where('slug', 'like', $like)
                        ->orWhere('fullName', 'like', $like)
                        ->orWhere('firstName', 'like', $like)
                        ->orWhere('lastName', 'like', $like);
                });
            })
            ->orderBy('fullName')
            ->limit(200)
            ->get(['slug', 'firstName', 'middleName', 'lastName', 'fullName']);

        if ($selectedPatientSlug !== '' && ! $patients->contains('slug', $selectedPatientSlug)) {
            $selected = Patient::query()
                ->where('slug', $selectedPatientSlug)
                ->first(['slug', 'firstName', 'middleName', 'lastName', 'fullName']);

            if ($selected) {
                $patients->push($selected);
            }
        }

        return $patients
            ->map(fn (Patient $patient) => [
                'id' => $patient->slug,
                'name' => trim($patient->slug.' '.$patient->fullName),
            ])
            ->values();
    }

    /**
     * Return laboratory show data as JSON for modal display.
     */
    public function showJson(Request $request, string $current_team, Laboratory $laboratory): JsonResponse
    {
        $laboratory->load(['patient', 'doctor', 'team']);

        return response()->json([
            'laboratory' => [
                'id' => $laboratory->getKey(),
                'patientId' => $laboratory->patient_id,
                'patientName' => $laboratory->patient?->fullName,
                'gender' => $laboratory->patient?->gender,
                'age' => $laboratory->patient?->age,
                'doctorName' => $laboratory->doctor?->name,
                'status' => $laboratory->status,
                'total' => (float) $laboratory->total,
                'createdAt' => $laboratory->created_at?->toIso8601String(),
                'facilityName' => $laboratory->team?->name,
                'facilityAddress' => $laboratory->team?->address,
            ],
            'resultForm' => $this->resultForm($laboratory, pendingOnly: false),
        ]);
    }

    /**
     * Search all patients by name or slug.
     */
    public function searchPatients(Request $request): JsonResponse
    {
        $search = trim((string) $request->query('q', ''));

        $patients = Patient::query()
            ->when($search !== '', function (Builder $q) use ($search): void {
                $q->where(function (Builder $inner) use ($search): void {
                    $inner->where('slug', 'like', "%{$search}%")
                        ->orWhere('firstName', 'like', "%{$search}%")
                        ->orWhere('lastName', 'like', "%{$search}%")
                        ->orWhere('fullName', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%")
                        ->orWhere('phone', 'like', "%{$search}%")
                        ->orWhere('mobile', 'like', "%{$search}%");
                });
            })
            ->orderBy('slug')
            ->limit(50)
            ->get(['slug', 'fullName'])
            ->map(fn (Patient $patient) => [
                'slug' => $patient->slug,
                'label' => "{$patient->slug} - {$patient->fullName}",
            ])->values();

        return response()->json($patients);
    }
}
