<?php

namespace App\Http\Controllers;

use App\Concerns\PatientFormOptions;
use App\Concerns\PatientValidationRules;
use App\Http\Requests\StorePaymentRequest;
use App\Models\Admission;
use App\Models\Billing;
use App\Models\Coupon;
use App\Models\Laboratory;
use App\Models\Line;
use App\Models\Method;
use App\Models\Patient;
use App\Models\Payment;
use App\Models\Prescription;
use App\Models\PriceList;
use App\Models\Treatment;
use App\Models\User;
use App\Service\DashboardCurrency;
use App\Service\DashboardTenant;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Relations\MorphTo;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class BillingController extends Controller
{
    use PatientFormOptions, PatientValidationRules;

    /**
     * The pagination sizes that users may pick.
     */
    private const PER_PAGE_OPTIONS = [10, 25, 50, 100];

    /**
     * The billing columns that may be used to sort the list.
     */
    private const SORTABLE_COLUMNS = ['patient_id', 'total', 'status', 'created_at'];

    /**
     * The date filters offered on the payment form.
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
     * Show the payment form, its billing stats and the new-billing options.
     */
    public function index(Request $request): Response
    {
        $dateFilter = $this->dateFilter($request->query('date_filter'));

        $methods = Method::query()->orderBy('name')->get(['id', 'name']);

        [$start, $end] = $this->dateRange($dateFilter);

        $billings = Billing::query()
            ->where('status', 'billed')
            ->whereBetween('created_at', [$start, $end])
            ->with([
                'patient.category',
                'patient.admissions' => fn ($query) => $query->whereRaw('LOWER(status) = ?', ['admitted']),
                'lines.priceList',
                'billable' => function (MorphTo $morphTo): void {
                    $morphTo->morphWith([
                        Admission::class => ['lines.priceList'],
                        Laboratory::class => ['lines.priceList'],
                        Treatment::class => ['lines.priceList'],
                        Prescription::class => ['lines.priceList'],
                    ]);
                },
            ])
            ->orderByDesc('created_at')
            ->get()
            ->map(fn (Billing $billing) => $this->billingOption($billing));

        $selectedId = $request->integer('billing_id');
        $selected = $billings->firstWhere('id', $selectedId);

        return Inertia::render('finance/billings/index', [
            'currencySymbol' => DashboardCurrency::symbol(),
            'methods' => $methods->map(fn (Method $method) => [
                'id' => $method->getKey(),
                'name' => $method->name,
            ])->values(),
            'billings' => $billings->values(),
            'selectedBillingId' => $selectedId > 0 ? $selectedId : null,
            'suggestedMethodId' => $selected ? $this->suggestedMethodId($selected) : null,
            'coupons' => $this->allCouponsForBillings($billings),
            'filters' => [
                'date_filter' => $dateFilter,
                'date_filter_label' => self::DATE_FILTERS[$dateFilter],
            ],
            'dateFilterOptions' => collect(self::DATE_FILTERS)
                ->map(fn (string $label, string $value) => ['value' => $value, 'label' => $label])
                ->values(),
            'stats' => $this->stats($dateFilter),
            'newBillingOptions' => [
                ...$this->patientFormOptions(),
                'nextHospitalNumber' => $this->nextHospitalNumber(),
                'priceLists' => PriceList::query()
                    ->where('is_category', false)
                    ->whereHas('category', fn (Builder $query) => $query->whereRaw('LOWER(name) = ?', ['billing']))
                    ->orderBy('name')
                    ->get()
                    ->map(fn (PriceList $priceList) => [
                        'id' => $priceList->getKey(),
                        'name' => $priceList->name,
                        'price' => (float) ($priceList->price ?? 0),
                    ])->values(),
                'services' => PriceList::query()
                    ->where(function (Builder $query): void {
                        $query->whereHas('subCategory', fn (Builder $q) => $q->whereIn('name', [
                            'Treatment',
                            'Nursing Services',
                            'Maternity Services',
                            'Mortuary Services',
                            'Surgery',
                            'Ophthalmic Services',
                            'Dental Services',
                            'Imaging',
                            'Imaging/Radiography',
                        ]))
                            ->orWhereHas('category', fn (Builder $q) => $q->whereRaw('LOWER(name) = ?', ['surgery']));
                    })
                    ->orderBy('name')
                    ->get(['id', 'name', 'price'])
                    ->all(),
            ],
        ]);
    }

    /**
     * Search all patients by name or slug, across every team.
     */
    public function searchPatients(Request $request): JsonResponse
    {
        $search = trim((string) $request->query('q', ''));

        $patients = Patient::query()
            ->withoutGlobalScope('team')
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
            ->get([
                'slug',
                'fullName',
                'firstName',
                'middleName',
                'lastName',
                'gender',
                'birthDate',
                'email',
                'phone',
                'mobile',
                'category_id',
                'country_id',
                'state_id',
                'lga_id',
                'address',
                'kinFullName',
                'kinPhone',
                'kinEmail',
                'relation',
                'art',
                'slugOther',
                'marital_status',
            ])
            ->map(fn (Patient $patient) => [
                'slug' => $patient->slug,
                'label' => "{$patient->slug} - {$patient->fullName}",
                'firstName' => $patient->firstName,
                'middleName' => $patient->middleName,
                'lastName' => $patient->lastName,
                'gender' => $patient->gender,
                'birthDate' => $patient->birthDate?->format('Y-m-d'),
                'email' => $patient->email,
                'phone' => $patient->phone,
                'mobile' => $patient->mobile,
                'category_id' => $patient->category_id ? (string) $patient->category_id : '',
                'country_id' => $patient->country_id ? (string) $patient->country_id : '',
                'state_id' => $patient->state_id ? (string) $patient->state_id : '',
                'lga_id' => $patient->lga_id ? (string) $patient->lga_id : '',
                'address' => $patient->address,
                'kinFullName' => $patient->kinFullName,
                'kinPhone' => $patient->kinPhone,
                'kinEmail' => $patient->kinEmail,
                'relation' => $patient->relation,
                'art' => $patient->art,
                'slugOther' => $patient->slugOther,
                'maritalStatus' => $patient->marital_status,
            ])->values();

        return response()->json($patients);
    }

    /**
     * List all billings for the current team.
     */
    public function history(Request $request): Response
    {
        $todayStart = Carbon::today()->toDateTimeString();
        $todayEnd = Carbon::today()->endOfDay()->toDateTimeString();

        $fromDate = $this->date($request->query('from')) ?? $todayStart;
        $toDate = $this->date($request->query('to')) ?? $todayEnd;

        $filters = [
            'q' => trim((string) $request->query('q', '')),
            'sort' => $this->sortBy($request),
            'direction' => $request->query('direction') === 'asc' ? 'asc' : 'desc',
            'perPage' => $this->perPage($request),
            'from' => Carbon::parse($fromDate)->toDateString(),
            'to' => Carbon::parse($toDate)->toDateString(),
        ];

        $query = $this->filteredQuery($filters);

        $billings = (clone $query)
            ->with(['patient', 'user'])
            ->orderBy($filters['sort'], $filters['direction'])
            ->paginate($filters['perPage'])
            ->withQueryString()
            ->through(fn (Billing $billing) => $this->listItem($billing));

        return Inertia::render('finance/billings/history', [
            'currencySymbol' => DashboardCurrency::symbol(),
            'billings' => $billings,
            'filters' => $filters,
            'summary' => [
                'total' => (float) (clone $query)->sum('total'),
                'count' => (clone $query)->count(),
            ],
        ]);
    }

    /**
     * Show a paid billing as a printable receipt.
     */
    public function show(Request $request, string $current_team, Billing $billing): Response
    {
        $billing->load(['patient', 'user', 'payments.method', 'payments.user', 'lines.priceList']);

        return Inertia::render('finance/billings/show', [
            'currencySymbol' => DashboardCurrency::symbol(),
            'billing' => $this->receipt($billing),
        ]);
    }

    /**
     * Create a patient (or reuse an existing one) and raise their invoices.
     */
    public function newBilling(Request $request): RedirectResponse
    {
        /** @var User $user */
        $user = $request->user();
        $teamId = $user->currentTeam->getKey();

        $source = $request->input('source');
        $isPatientRegistration = $source === 'patient_registration';

        if ($isPatientRegistration) {
            $existing = $request->input('existing_patient_id');

            if (filled($existing)) {
                $request->validate([
                    'existing_patient_id' => [
                        'required',
                        'string',
                        Rule::exists('patients', 'slug')->where(fn ($query) => $query->where('team_id', $teamId)),
                    ],
                    'billings' => ['required', 'array', 'min:1'],
                    'billings.*.lines' => ['required', 'array', 'min:1'],
                    'billings.*.lines.*.price_list_id' => [
                        'required',
                        'integer',
                        Rule::exists(PriceList::class, 'id')->where(fn ($query) => $query->where('team_id', $teamId)),
                    ],
                    'billings.*.lines.*.unitPrice' => ['required', 'numeric', 'min:0'],
                ]);

                $patientSlug = $existing;
            } else {
                /** @var array<string, mixed> $data */
                $data = $request->validate([
                    ...$this->patientRules($user, includeSlug: false),
                    'billings' => ['required', 'array', 'min:1'],
                    'billings.*.lines' => ['required', 'array', 'min:1'],
                    'billings.*.lines.*.price_list_id' => [
                        'required',
                        'integer',
                        Rule::exists(PriceList::class, 'id')->where(fn ($query) => $query->where('team_id', $teamId)),
                    ],
                    'billings.*.lines.*.unitPrice' => ['required', 'numeric', 'min:0'],
                ]);

                $patientSlug = Patient::create([
                    ...collect($data)->only([
                        'art', 'slugOther', 'category_id', 'firstName', 'middleName', 'lastName',
                        'gender', 'birthDate', 'email', 'phone', 'mobile', 'country_id',
                        'state_id', 'lga_id', 'address', 'kinFullName', 'kinPhone', 'kinEmail', 'relation',
                    ])->all(),
                    'marital_status' => $data['maritalStatus'] ?? null,
                    'slug' => $this->nextHospitalNumber(),
                    'team_id' => $teamId,
                ])->slug;
            }
        } else {
            $request->validate([
                'existing_patient_id' => [
                    'required',
                    'string',
                    Rule::exists('patients', 'slug')->where(fn ($query) => $query->where('team_id', $teamId)),
                ],
                'billings' => ['required', 'array', 'min:1'],
                'billings.*.lines' => ['required', 'array', 'min:1'],
                'billings.*.lines.*.price_list_id' => [
                    'required',
                    'integer',
                    Rule::exists(PriceList::class, 'id')->where(fn ($query) => $query->where('team_id', $teamId)),
                ],
                'billings.*.lines.*.unitPrice' => ['required', 'numeric', 'min:0'],
            ]);

            $patientSlug = $request->input('existing_patient_id');
        }

        $this->applyBillings($patientSlug, $teamId, $user, (array) $request->input('billings', []), $isPatientRegistration);

        Inertia::flash('toast', ['type' => 'success', 'message' => "Billing applied to {$patientSlug}."]);

        return to_route('billings.index', $user->currentTeam->slug);
    }

    /**
     * Record the payments for the selected invoice and mark it as paid.
     */
    public function store(StorePaymentRequest $request): RedirectResponse
    {
        /** @var User $user */
        $user = $request->user();
        $teamId = $user->currentTeam->getKey();

        $data = $request->validated();

        $billing = Billing::query()
            ->whereIn('status', ['billed', 'scheduled'])
            ->whereKey($data['billing_id'])
            ->firstOrFail();

        $totalPaymentAmount = 0;

        DB::transaction(function () use ($billing, $data, $user, $teamId, &$totalPaymentAmount): void {
            foreach ($data['payments'] as $paymentData) {
                $method = Method::query()->whereKey($paymentData['method_id'])->firstOrFail();

                $payment = Payment::create([
                    'team_id' => $teamId,
                    'patient_id' => $billing->patient_id,
                    'user_id' => $user->getKey(),
                    'billing_id' => $billing->getKey(),
                    'method_id' => $method->getKey(),
                    ...$this->paymentColumns($method->name, $paymentData),
                ]);

                // Accumulate the total payment amount across all payment methods
                $totalPaymentAmount += (float) ($payment->amount ?? 0);
                $totalPaymentAmount += (float) ($payment->wallet ?? 0);
                $totalPaymentAmount += (float) ($payment->mercy_fund ?? 0);
                $totalPaymentAmount += (float) ($payment->infant_formula ?? 0);

                if (($paymentData['coupon_id'] ?? null) && ($paymentData['coupon_discount_amount'] ?? 0) > 0) {
                    $payment->couponUsage()->create([
                        'coupon_id' => $paymentData['coupon_id'],
                        'user_id' => $user->getKey(),
                        'discount_amount' => $paymentData['coupon_discount_amount'],
                    ]);
                }

                if ($method->name === 'Wallet' && ! empty($paymentData['wallet_debit'])) {
                    $walletDebit = (float) $paymentData['wallet_debit'];
                    $walletPatientId = $paymentData['wallet_patient_id'] ?? $billing->patient_id;

                    if ($walletDebit < 0) {
                        // Negative value: put absolute in credit column, decrement patient wallet (make less negative),
                        // store negative in payment wallet column.
                        // Set payment wallet first so the observer can detect this was handled by the controller.
                        $payment->update([
                            'wallet' => $walletDebit,
                        ]);

                        $payment->walletHistories()->create([
                            'team_id' => $teamId,
                            'patient_id' => $walletPatientId,
                            'user_id' => $user->getKey(),
                            'method_id' => $method->getKey(),
                            'credit' => abs($walletDebit),
                        ]);

                        $patient = Patient::query()->where('team_id', $teamId)->where('slug', $walletPatientId)->first();

                        if ($patient) {
                            // User's "decrement": make balance less negative (e.g., -2000 → -1000), so we add the absolute value
                            $patient->increment('wallet', abs($walletDebit));
                        }
                    } else {
                        // Positive value: put in debit column, increment patient wallet (make more negative),
                        // store positive in payment wallet column.
                        // Set payment wallet first so the observer can detect this was handled by the controller.
                        $payment->update([
                            'wallet' => $walletDebit,
                        ]);

                        $payment->walletHistories()->create([
                            'team_id' => $teamId,
                            'patient_id' => $walletPatientId,
                            'user_id' => $user->getKey(),
                            'method_id' => $method->getKey(),
                            'debit' => $walletDebit,
                        ]);

                        $patient = Patient::query()->where('team_id', $teamId)->where('slug', $walletPatientId)->first();

                        if ($patient) {
                            // User's "increment": make balance more negative (e.g., -2000 → -3000), so we subtract the value
                            $patient->decrement('wallet', $walletDebit);
                        }
                    }
                }
            }

            $billing->update([
                'status' => 'paid',
                'created_at' => Carbon::now(),
            ]);

            // If the total payment is negative, update line items' unitPrice to negative
            if ($totalPaymentAmount < 0) {
                $lines = Line::query()
                    ->where('lineable_id', $billing->billable_id)
                    ->where('lineable_type', $billing->billable_type)
                    ->get(['id', 'unitPrice']);

                foreach ($lines as $line) {
                    $line->update([
                        'paid' => true,
                        'unitPrice' => -abs((float) $line->unitPrice),
                    ]);
                }
            } else {
                Line::query()
                    ->where('lineable_id', $billing->billable_id)
                    ->where('lineable_type', $billing->billable_type)
                    ->update(['paid' => true]);
            }

            $billable = $billing->billable;

            if ($billable?->status && $billing->total > 0) {
                // Only update to 'paid' if the billable is not already in a terminal state like 'dispensed'
                if (! in_array($billable->status, ['dispensed', 'refunded'], true)) {
                    $billable->update(['status' => 'paid']);
                }
            }
        });

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Payment recorded.']);

        return to_route('billings.show', [$user->currentTeam->slug, $billing]);
    }

    /**
     * Delete the given billing.
     */
    public function destroy(Request $request, string $current_team, Billing $billing): RedirectResponse
    {
        $billing->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Billing deleted.']);

        return to_route('billings.history', $request->user()->currentTeam->slug);
    }

    /**
     * Delete the given billings.
     */
    public function bulkDestroy(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'ids' => ['required', 'array'],
            'ids.*' => ['integer'],
        ]);

        Billing::query()->whereIn('id', $data['ids'])->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Billings deleted.']);

        return to_route('billings.history', $request->user()->currentTeam->slug);
    }

    /**
     * Create the patient invoices and their lines.
     *
     * @param  array<int, array{lines: array<int, array{price_list_id: int, unitPrice: float}>, total?: float}>  $billings
     * @param  bool  $isPatientRegistration  When true (Patient Registration modal), bill directly to the Patient. When false (New Billing modal), create a Treatment as the billable.
     */
    private function applyBillings(string $patientSlug, int $teamId, User $user, array $billings, bool $isPatientRegistration = false): void
    {
        foreach ($billings as $billingData) {
            if (empty($billingData['lines'])) {
                continue;
            }

            $total = $billingData['total'] ?? collect($billingData['lines'])->sum(fn (array $line) => $line['unitPrice']);

            if ($isPatientRegistration) {
                $patient = Patient::query()->where('team_id', $teamId)->where('slug', $patientSlug)->firstOrFail();

                Billing::create([
                    'team_id' => $teamId,
                    'patient_id' => $patientSlug,
                    'billable_type' => Patient::class,
                    'billable_id' => $patient->getKey(),
                    'user_id' => $user->getKey(),
                    'total' => $total,
                    'status' => 'billed',
                ]);

                foreach ($billingData['lines'] as $lineData) {
                    Line::create([
                        'team_id' => $teamId,
                        'patient_id' => $patientSlug,
                        'price_list_id' => $lineData['price_list_id'],
                        'unitPrice' => $lineData['unitPrice'],
                        'quantity' => 1,
                        'lineable_type' => Patient::class,
                        'lineable_id' => $patient->getKey(),
                        'paid' => true,
                    ]);
                }
            } else {
                $treatment = Treatment::create([
                    'team_id' => $teamId,
                    'patient_id' => $patientSlug,
                    'user_id' => $user->getKey(),
                    'status' => 'billed',
                    'total' => $total,
                ]);

                Billing::create([
                    'team_id' => $teamId,
                    'patient_id' => $patientSlug,
                    'billable_type' => Treatment::class,
                    'billable_id' => $treatment->getKey(),
                    'user_id' => $user->getKey(),
                    'total' => $total,
                    'status' => 'billed',
                ]);

                foreach ($billingData['lines'] as $lineData) {
                    Line::create([
                        'team_id' => $teamId,
                        'patient_id' => $patientSlug,
                        'price_list_id' => $lineData['price_list_id'],
                        'unitPrice' => $lineData['unitPrice'],
                        'quantity' => 1,
                        'lineable_type' => Treatment::class,
                        'lineable_id' => $treatment->getKey(),
                    ]);
                }
            }
        }
    }

    /**
     * Build the billing statistics for the selected date filter.
     *
     * @return array{total_billed: float, total_billed_count: string, collected: float, collected_count: string, awaiting_payment: float, awaiting_payment_count: string, wallet_debts: float, wallet_debts_count: string}
     */
    private function stats(string $dateFilter): array
    {
        [$start, $end] = $this->dateRange($dateFilter);

        $billings = DashboardTenant::apply(Billing::query())
            ->whereBetween('created_at', [$start, $end])
            ->selectRaw("
                COUNT(*) as total,
                COALESCE(SUM(total), 0) as billed_amount,
                SUM(CASE WHEN status IN ('paid', 'scheduled') THEN 1 ELSE 0 END) as paid_count,
                COALESCE(SUM(CASE WHEN status IN ('paid', 'scheduled') THEN total ELSE 0 END), 0) as paid_amount,
                SUM(CASE WHEN status IN ('billed', 'pending') THEN 1 ELSE 0 END) as unpaid_count,
                COALESCE(SUM(CASE WHEN status IN ('billed', 'pending') THEN total ELSE 0 END), 0) as unpaid_amount
            ")
            ->first();

        $debtors = DashboardTenant::apply(Patient::query())
            ->where('wallet', '<', 0)
            ->selectRaw('COUNT(*) as total, COALESCE(SUM(wallet), 0) as balance')
            ->first();

        return [
            'total_billed' => (float) ($billings->billed_amount ?? 0),
            'total_billed_count' => number_format((int) ($billings->total ?? 0)),
            'collected' => (float) ($billings->paid_amount ?? 0),
            'collected_count' => number_format((int) ($billings->paid_count ?? 0)),
            'awaiting_payment' => (float) ($billings->unpaid_amount ?? 0),
            'awaiting_payment_count' => number_format((int) ($billings->unpaid_count ?? 0)),
            'wallet_debts' => abs((float) ($debtors->balance ?? 0)),
            'wallet_debts_count' => number_format((int) ($debtors->total ?? 0)),
        ];
    }

    /**
     * Resolve the date range for a billing date filter.
     *
     * @return array{0: Carbon, 1: Carbon}
     */
    private function dateRange(string $dateFilter): array
    {
        return match ($dateFilter) {
            'yesterday' => [Carbon::yesterday(), Carbon::yesterday()->endOfDay()],
            'this_week' => [Carbon::now()->startOfWeek(), Carbon::now()->endOfWeek()],
            'last_week' => [Carbon::now()->subWeek()->startOfWeek(), Carbon::now()->subWeek()->endOfWeek()],
            'this_month' => [Carbon::now()->startOfMonth(), Carbon::now()->endOfMonth()],
            'last_month' => [Carbon::now()->subMonth()->startOfMonth(), Carbon::now()->subMonth()->endOfMonth()],
            'this_year' => [Carbon::now()->startOfYear(), Carbon::now()->endOfYear()],
            'last_year' => [Carbon::now()->subYear()->startOfYear(), Carbon::now()->subYear()->endOfYear()],
            default => [Carbon::today(), Carbon::today()->endOfDay()],
        };
    }

    /**
     * Build the filtered billings query.
     *
     * @param  array{q: string, sort: string, direction: string, perPage: int, from: string|null, to: string|null}  $filters
     * @return Builder<Billing>
     */
    private function filteredQuery(array $filters): Builder
    {
        $query = Billing::query();

        if ($filters['q'] !== '') {
            $like = '%'.$filters['q'].'%';

            $query->where(fn (Builder $query) => $query
                ->where('patient_id', 'like', $like)
                ->orWhere('billable_type', 'like', $like)
                ->orWhereHas('patient', fn (Builder $query) => $query->where('fullName', 'like', $like))
                ->orWhereHas('user', fn (Builder $query) => $query->where('name', 'like', $like)));
        }

        // Search query bypasses date filtering so it searches across all dates
        if ($filters['q'] === '' && $filters['from'] !== null) {
            $query->where('created_at', '>=', Carbon::parse($filters['from'])->startOfDay()->toDateTimeString());
        }

        if ($filters['q'] === '' && $filters['to'] !== null) {
            $query->where('created_at', '<=', Carbon::parse($filters['to'])->endOfDay()->toDateTimeString());
        }

        return $query;
    }

    /**
     * Serialize a billing for the list table.
     *
     * @return array<string, mixed>
     */
    private function listItem(Billing $billing): array
    {
        return [
            'id' => $billing->getKey(),
            'patientId' => $billing->patient_id,
            'patientName' => $billing->patient?->fullName,
            'cashierName' => $billing->user?->name,
            'billableType' => $billing->billable_type ? class_basename($billing->billable_type) : null,
            'total' => (float) $billing->total,
            'status' => $billing->status,
            'createdAt' => $billing->created_at?->toIso8601String(),
        ];
    }

    /**
     * Serialize a billable invoice for the payment form.
     *
     * @return array<string, mixed>
     */
    private function billingOption(Billing $billing): array
    {
        $billableLines = $billing->billable instanceof Billing
            ? $billing->lines
            : $billing->billable?->lines ?? collect();

        return [
            'id' => $billing->getKey(),
            'patientId' => $billing->patient_id,
            'patientName' => $billing->patient?->fullName,
            'requestedBy' => $billing->user?->name,
            'billableType' => $billing->billable_type ? class_basename($billing->billable_type) : null,
            'categoryName' => $billing->patient?->category?->name,
            'discountPercentage' => (int) ($billing->patient?->category->discount_percentage ?? 0),
            'total' => (float) $billing->total,
            'status' => $billing->status,
            'isAdmitted' => $billing->patient?->isAdmitted() ?? false,
            'lines' => $billableLines->map(fn ($line) => [
                'id' => $line->getKey(),
                'name' => $line->priceList?->name,
                'quantity' => $line->quantity,
                'unitPrice' => (float) $line->unitPrice,
                'totalPrice' => (float) ($line->quantity ? $line->quantity * (float) $line->unitPrice : (float) $line->unitPrice),
            ])->values(),
        ];
    }

    /**
     * Serialize a paid billing as a printable receipt.
     *
     * @return array<string, mixed>
     */
    private function receipt(Billing $billing): array
    {
        return [
            'id' => $billing->getKey(),
            'patientId' => $billing->patient_id,
            'patientName' => $billing->patient?->fullName,
            'billableType' => $billing->billable_type ? class_basename($billing->billable_type) : null,
            'total' => (float) $billing->total,
            'status' => $billing->status,
            'createdAt' => $billing->created_at?->toIso8601String(),
            'recordedBy' => $billing->payments->first()?->user?->name ?? $billing->user?->name,
            'lines' => $billing->lines->map(fn (Line $line) => [
                'id' => $line->getKey(),
                'name' => $line->priceList?->name,
                'quantity' => $line->quantity,
                'unitPrice' => (float) $line->unitPrice,
                'totalPrice' => (float) ($line->quantity ? $line->quantity * (float) $line->unitPrice : (float) $line->unitPrice),
            ])->values(),
            'payments' => $billing->payments->map(fn (Payment $payment) => [
                'id' => $payment->getKey(),
                'method' => $payment->method?->name,
                'amount' => (float) $payment->amount,
                'discountAmount' => (float) $payment->discount_amount,
                'wallet' => (float) $payment->wallet,
                'mercyFund' => (float) $payment->mercy_fund,
                'infantFormula' => (float) $payment->infant_formula,
            ])->values(),
        ];
    }

    /**
     * Determine the suggested payment method for a billable invoice.
     *
     * @param  array<string, mixed>  $billing
     */
    private function suggestedMethodId(array $billing): ?int
    {
        $name = match (true) {
            $billing['discountPercentage'] > 0 => 'Discount',
            $this->suggestedCouponId($billing) !== null => 'Mercy Fund',
            default => 'Cash',
        };

        return Method::query()->where('name', $name)->value('id');
    }

    /**
     * Determine the suggested coupon for a billable invoice.
     *
     * @param  array<string, mixed>  $billing
     */
    private function suggestedCouponId(array $billing): ?int
    {
        return Coupon::query()
            ->where('patient_id', $billing['patientId'])
            ->where('status', 'approved')
            ->where(function (Builder $query) {
                $query->whereNull('expires_at')
                    ->orWhere('expires_at', '>', now());
            })
            ->where(function (Builder $query) {
                $query->whereNull('max_uses')
                    ->orWhereColumn('used_count', '<', 'max_uses');
            })
            ->value('id');
    }

    /**
     * Get all valid coupons for all billable invoices' patients.
     *
     * @param  Collection<int, array<string, mixed>>  $billings
     * @return array<int, array<string, mixed>>
     */
    private function allCouponsForBillings($billings): array
    {
        $patientIds = $billings->pluck('patientId')->unique()->values();

        if ($patientIds->isEmpty()) {
            return [];
        }

        return Coupon::query()
            ->whereIn('patient_id', $patientIds)
            ->where('status', 'approved')
            ->where(function (Builder $query) {
                $query->whereNull('expires_at')
                    ->orWhere('expires_at', '>', now());
            })
            ->where(function (Builder $query) {
                $query->whereNull('max_uses')
                    ->orWhereColumn('used_count', '<', 'max_uses');
            })
            ->with('usages')
            ->orderBy('code')
            ->get(['id', 'code', 'patient_id', 'type', 'value', 'used_count', 'fund_type'])
            ->map(fn (Coupon $coupon) => [
                'id' => $coupon->getKey(),
                'code' => $coupon->code,
                'patientId' => $coupon->patient_id,
                'type' => $coupon->type,
                'value' => (float) $coupon->value,
                'usedCount' => (float) $coupon->used_count,
                'balance' => (float) max(0, $coupon->value - $coupon->usages->sum('discount_amount')),
                'fundType' => $coupon->fund_type,
            ])->values()->toArray();
    }

    /**
     * Map a payment method to the columns stored on the payment row.
     *
     * @param  array<string, mixed>  $paymentData
     * @return array<string, mixed>
     */
    private function paymentColumns(?string $methodName, array $paymentData): array
    {
        $amount = (float) ($paymentData['amount'] ?? 0);

        return match ($methodName) {
            'Discount' => [
                'discount_percentage' => (int) ($paymentData['discount_percentage'] ?? 0),
                'discount_amount' => (float) ($paymentData['discount_amount'] ?? $amount),
            ],
            'Wallet' => [
                'wallet' => (float) ($paymentData['wallet_debit'] ?? $amount),
            ],
            'Mercy Fund' => [
                'mercy_fund' => (float) ($paymentData['coupon_discount_amount'] ?? $amount),
            ],
            'Infant Formula' => [
                'infant_formula' => (float) ($paymentData['coupon_discount_amount'] ?? $amount),
            ],
            default => [
                'amount' => $amount,
            ],
        };
    }

    /**
     * Generate the next hospital number for a newly registered patient.
     */
    private function nextHospitalNumber(): string
    {
        return 'PAT-'.str_pad((string) (Patient::withTrashed()->count() + 1), 5, '0', STR_PAD_LEFT);
    }

    /**
     * Get the validated date filter.
     */
    private function dateFilter(mixed $value): string
    {
        return is_string($value) && array_key_exists($value, self::DATE_FILTERS) ? $value : 'today';
    }

    /**
     * Get the validated sort column.
     */
    private function sortBy(Request $request): string
    {
        $sort = (string) $request->query('sort', 'created_at');

        return in_array($sort, self::SORTABLE_COLUMNS, true) ? $sort : 'created_at';
    }

    /**
     * Get the validated page size.
     */
    private function perPage(Request $request): int
    {
        $perPage = (int) $request->query('perPage', 25);

        return in_array($perPage, self::PER_PAGE_OPTIONS, true) ? $perPage : 25;
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
            return Carbon::parse($value)->toDateTimeString();
        } catch (\Throwable) {
            return null;
        }
    }
}
