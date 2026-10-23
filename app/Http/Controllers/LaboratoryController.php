<?php

namespace App\Http\Controllers;

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

        $paidOptions = Laboratory::query()
            ->where('status', 'paid')
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
            ? Laboratory::query()->whereKey($selectedId)->where('status', 'paid')->with('patient')->first()
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
            'topTests' => [],
            'paidOptions' => $paidOptions,
            'selected' => $selected ? [
                'id' => $selected->getKey(),
                'patientId' => $selected->patient_id,
                'patientName' => $selected->patient?->fullName,
                'gender' => $selected->patient?->gender,
                'age' => $selected->patient?->age,
            ] : null,
            'resultForm' => $selected ? $this->resultForm($selected, pendingOnly: true) : null,
            'createOptions' => [
                'patients' => Patient::query()
                    ->when($selectedPatientId !== '', fn (Builder $query) => $query->where('slug', $selectedPatientId))
                    ->orderBy('slug')->limit(100)->get()
                    ->map(fn (Patient $patient) => [
                        'slug' => $patient->slug,
                        'label' => "{$patient->slug} - {$patient->fullName}",
                    ])->values(),
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
                'doctorName' => $laboratory->doctor?->name,
                'status' => $laboratory->status,
                'total' => (float) $laboratory->total,
                'createdAt' => $laboratory->created_at?->toIso8601String(),
                'facilityName' => $laboratory->team?->name,
                'facilityAddress' => $laboratory->team?->address,
            ],
            'resultForm' => $this->resultForm($laboratory, pendingOnly: false),
            'canEdit' => in_array($laboratory->status, ['paid', 'submitted'], true),
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
            ->with(['labInventory', 'drugInventory', 'inventory'])
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
    public function storeResults(Request $request, string $current_team, Laboratory $laboratory): RedirectResponse
    {
        abort_unless($laboratory->status === 'paid', 422, 'Only paid laboratory requests can receive new results.');

        $this->persistResults($request, $laboratory, deductInventory: true);

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

        $this->persistResults($request, $laboratory, deductInventory: false);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Results updated successfully.']);

        return to_route('laboratories.show', [
            'current_team' => $current_team,
            'laboratory' => $laboratory->getKey(),
        ]);
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
    private function persistResults(Request $request, Laboratory $laboratory, bool $deductInventory): void
    {
        $data = $request->validate([
            'lines' => ['nullable', 'array'],
            'lines.*' => ['nullable'],
            'testResults' => ['nullable', 'array'],
            'testResults.*' => ['nullable', 'array'],
            'testResults.*.*.price_list_id' => ['required_with:testResults', 'integer'],
            'testResults.*.*.result' => ['nullable', 'string'],
        ]);

        $patient = Patient::query()->where('slug', $laboratory->patient_id)->first();
        $userId = $request->user()->getKey();
        $teamId = $request->user()->currentTeam->getKey();

        DB::transaction(function () use ($data, $laboratory, $patient, $userId, $teamId, $deductInventory): void {
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

                if ($deductInventory && $patient) {
                    $this->deductLineInventory($line, $patient);
                }
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

                if ($deductInventory && $patient) {
                    $labInventory = LabInventory::query()->where('price_list_id', $line->price_list_id)->first();

                    if ($labInventory) {
                        app(InventoryUsageService::class)->use(
                            $labInventory,
                            patientId: $patient->id,
                        );
                    }
                }
            }
        });

        $allResultsFilled = $laboratory->lines()
            ->where(fn (Builder $query) => $query
                ->whereNull('results')
                ->orWhere('results', ''))
            ->doesntExist();

        if ($allResultsFilled) {
            $laboratory->update(['status' => 'submitted']);
        }
    }

    /**
     * Deduct inventory for every lab stock row linked to a simple test line.
     */
    private function deductLineInventory(Line $line, Patient $patient): void
    {
        LabInventory::query()
            ->where('price_list_id', $line->price_list_id)
            ->get()
            ->each(function (LabInventory $lab) use ($patient): void {
                app(InventoryUsageService::class)->use(
                    $lab,
                    patientId: $patient->id,
                );
            });
    }

    /**
     * Build the result entry / view structure for a laboratory request.
     *
     * @return array{steps: list<array{name: string, tests: list<array<string, mixed>>}>, hasPending: bool}
     */
    private function resultForm(Laboratory $laboratory, bool $pendingOnly): array
    {
        $lineableId = $laboratory->getKey();

        $tests = PriceList::query()
            ->whereHas('lines', function (Builder $query) use ($lineableId, $pendingOnly): void {
                $query->where('lineable_type', Laboratory::class)
                    ->where('lineable_id', $lineableId);

                if ($pendingOnly) {
                    $query->whereNull('results');
                }
            })
            ->with(['parameters', 'subCategory'])
            ->get();

        $steps = [];

        foreach ($this->groupBySubcategory($tests) as $subcategoryName => $subcategoryTests) {
            $stepTests = [];

            foreach ($subcategoryTests as $test) {
                $line = Line::query()
                    ->where('lineable_type', Laboratory::class)
                    ->where('lineable_id', $lineableId)
                    ->where('price_list_id', $test->id)
                    ->with('testResults.priceList')
                    ->first();

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
                        if (! $line || $line->testResults->isEmpty()) {
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
                            $rows = $line->testResults->map(fn (TestResult $testResult) => [
                                'price_list_id' => $testResult->price_list_id,
                                'name' => $testResult->priceList->name ?? '—',
                                'range' => $testResult->priceList->ranges ?? null,
                                'uom' => Str::of((string) ($testResult->priceList->uom ?? ''))->stripTags()->squish()->toString() ?: null,
                                'result_type' => $testResult->priceList->result_type ?? 'text',
                                'options' => $this->resultOptions($testResult->priceList),
                                'result' => $testResult->result,
                            ])->values()->all();
                        }
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
            ->with(['labInventory', 'drugInventory', 'inventory'])
            ->whereNull('parameter_id')
            ->where('is_category', false)
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

        if ($filters['from'] !== null) {
            $query->whereDate('created_at', '>=', $filters['from']);
        }

        if ($filters['to'] !== null) {
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

        return in_array($status, ['pending', 'paid', 'submitted'], true) ? $status : '';
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
}
