<?php

namespace App\Http\Controllers\Pharmacy;

use App\Http\Controllers\Controller;
use App\Models\Billing;
use App\Models\DrugInventory;
use App\Models\Inventory;
use App\Models\Line;
use App\Models\Patient;
use App\Models\Prescription;
use App\Models\PriceList;
use App\Models\Stock;
use App\Service\DashboardCurrency;
use App\Service\DashboardDateRange;
use App\Service\InventoryUsageService;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class PrescriptionController extends Controller
{
    /**
     * The maximum number of patient options sent to the prescription forms.
     */
    private const PATIENT_OPTION_LIMIT = 50;

    /**
     * List prescriptions with stats and filters.
     */
    public function index(Request $request): Response
    {
        $filters = [
            'q' => trim((string) $request->query('q', '')),
            'period' => DashboardDateRange::periodFromPageFilters([
                DashboardDateRange::FILTER_FIELD => $request->query('period'),
            ]),
            'status' => in_array($request->query('status'), ['pending', 'billed', 'paid', 'dispensed', 'refunded'], true)
                ? $request->query('status')
                : 'all',
            'perPage' => in_array((int) $request->query('perPage', 25), [10, 25, 50, 100], true)
                ? (int) $request->query('perPage', 25)
                : 25,
        ];

        $prescriptions = Prescription::query()
            ->with(['patient', 'doctor'])
            ->withCount('lines')
            ->when($filters['q'] !== '', function (Builder $query) use ($filters): void {
                $like = '%'.$filters['q'].'%';
                $query->where(function (Builder $query) use ($like): void {
                    $query->where('patient_id', 'like', $like)
                        ->orWhereHas('patient', fn (Builder $query) => $query->where('fullName', 'like', $like))
                        ->orWhereHas('doctor', fn (Builder $query) => $query->where('name', 'like', $like));
                });
            })
            ->when($filters['status'] !== 'all', fn (Builder $query) => $query->where('status', $filters['status']))
            ->latest()
            ->paginate($filters['perPage'])
            ->withQueryString()
            ->through(fn (Prescription $prescription) => $this->present($prescription));

        return Inertia::render('pharmacy/prescriptions/index', [
            'currencySymbol' => DashboardCurrency::symbol(),
            'prescriptions' => $prescriptions,
            'filters' => $filters,
            'topDrugs' => [],
            'periodOptions' => collect(DashboardDateRange::FILTERS)
                ->map(fn (string $label, string $value) => ['value' => $value, 'label' => $label])
                ->values(),
            'summary' => [
                'total' => Prescription::query()->count(),
                'pending' => Prescription::query()->where('status', 'pending')->count(),
                'billed' => Prescription::query()->where('status', 'billed')->count(),
                'paid' => Prescription::query()->where('status', 'paid')->count(),
                'dispensed' => Prescription::query()->where('status', 'dispensed')->count(),
                'refunded' => Prescription::query()->where('status', 'refunded')->count(),
            ],
        ]);
    }

    /**
     * Show a prescription with its lines and billing.
     */
    public function show(Request $request, string $current_team, Prescription $prescription): Response
    {
        $prescription->load(['patient', 'doctor', 'lines.priceList', 'billings']);

        return Inertia::render('pharmacy/prescriptions/show', [
            'currencySymbol' => DashboardCurrency::symbol(),
            'prescription' => $this->detail($prescription),
            'hospitalName' => $request->user()->currentTeam->name,
        ]);
    }

    /**
     * Show the prescription edit form.
     */
    public function edit(Request $request, string $current_team, Prescription $prescription): Response
    {
        $prescription->load(['patient', 'doctor', 'lines.priceList', 'billings']);

        return Inertia::render('pharmacy/prescriptions/edit', [
            'currencySymbol' => DashboardCurrency::symbol(),
            'prescription' => $this->detail($prescription),
            'formOptions' => $this->formOptions(
                search: $request->query('q'),
                selectedPatientSlug: $prescription->patient_id,
            ),
        ]);
    }

    /**
     * Show the prescription creation form.
     */
    public function create(Request $request): Response
    {
        $teamId = $request->user()->currentTeam->getKey();
        $selectedPatientId = trim((string) $request->query('patient_id', ''));
        if ($selectedPatientId !== '') {
            validator(['patient_id' => $selectedPatientId], [
                'patient_id' => ['required', 'string', Rule::exists('patients', 'slug')->where('team_id', $teamId)],
            ])->validate();
        }

        return Inertia::render('pharmacy/prescriptions/create', [
            'currencySymbol' => DashboardCurrency::symbol(),
            'selectedPatientId' => $selectedPatientId,
            'formOptions' => $this->formOptions(
                search: $request->query('q'),
                selectedPatientSlug: $selectedPatientId,
            ),
        ]);
    }

    /**
     * Store a prescription and its billing entry.
     */
    public function store(Request $request): RedirectResponse
    {
        $teamId = $request->user()->currentTeam->getKey();
        $data = $request->validate([
            'patient_id' => ['required', 'string', Rule::exists('patients', 'slug')->where('team_id', $teamId)],
            'lines' => ['required', 'array', 'min:1'],
            'lines.*.price_list_id' => [
                'required',
                Rule::exists('price_lists', 'id')->where('team_id', $teamId),
                function (string $attribute, mixed $value, \Closure $fail): void {
                    $isPharmacyMedication = PriceList::query()
                        ->whereKey($value)
                        ->where('is_inventory', true)
                        ->whereHas('subCategory.category', fn (Builder $query) => $query->where('name', 'Pharmacy'))
                        ->exists();

                    if (! $isPharmacyMedication) {
                        $fail('Select a medication from the Pharmacy catalog.');
                    }
                },
            ],
            'lines.*.frequency' => ['required', 'numeric', 'min:1'],
            'lines.*.duration' => ['required', 'numeric', 'min:1'],
            'lines.*.dosage' => ['required', 'numeric', 'min:1'],
        ]);

        $prescription = DB::transaction(function () use ($request, $data, $teamId): Prescription {
            $lines = [];
            $total = 0.0;

            foreach ($data['lines'] as $line) {
                $priceList = PriceList::query()->whereKey($line['price_list_id'])->firstOrFail();
                $quantity = (float) $line['frequency'] * (float) $line['duration'] * (float) $line['dosage'];
                $unitPrice = (float) $priceList->price;
                $total += $quantity * $unitPrice;
                $lines[] = [
                    'team_id' => $teamId,
                    'user_id' => $request->user()->getKey(),
                    'patient_id' => $data['patient_id'],
                    'price_list_id' => $priceList->getKey(),
                    'unitPrice' => $unitPrice,
                    'unitCost' => $priceList->unitCost() ?? 0,
                    'frequency' => $line['frequency'],
                    'duration' => $line['duration'],
                    'dosage' => $line['dosage'],
                    'quantity' => $quantity,
                ];
            }

            $prescription = Prescription::create([
                'team_id' => $teamId,
                'patient_id' => $data['patient_id'],
                'doctor_id' => $request->user()->getKey(),
                'total' => $total,
                'status' => 'pending',
            ]);

            foreach ($lines as $line) {
                $prescription->lines()->create($line);
            }

            if ($total > 0) {
                $prescription->billings()->create([
                    'team_id' => $teamId,
                    'patient_id' => $data['patient_id'],
                    'user_id' => $request->user()->getKey(),
                    'total' => $total,
                ]);
            }

            return $prescription;
        });

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Prescription created.']);

        return to_route('pharmacy.prescriptions.show', [
            'current_team' => $request->user()->currentTeam->slug,
            'prescription' => $prescription->getKey(),
        ]);
    }

    /**
     * Update a prescription's lines (frequency, duration, dosage, quantity).
     */
    public function update(Request $request, string $current_team, Prescription $prescription): RedirectResponse
    {
        abort_if(in_array($prescription->status, ['dispensed', 'refunded'], true), 409, 'This prescription can no longer be edited.');

        $teamId = $request->user()->currentTeam->getKey();

        $data = $request->validate([
            'patient_id' => ['required', 'string', Rule::exists('patients', 'slug')->where('team_id', $teamId)],
            'lines' => ['required', 'array', 'min:1'],
            'lines.*.id' => ['nullable', 'integer', Rule::exists('lines', 'id')->where('team_id', $teamId)],
            'lines.*.price_list_id' => [
                'required',
                Rule::exists('price_lists', 'id')->where('team_id', $teamId),
                function (string $attribute, mixed $value, \Closure $fail): void {
                    $isPharmacyMedication = PriceList::query()
                        ->whereKey($value)
                        ->where('is_inventory', true)
                        ->whereHas('subCategory.category', fn (Builder $query) => $query->where('name', 'Pharmacy'))
                        ->exists();

                    if (! $isPharmacyMedication) {
                        $fail('Select a medication from the Pharmacy catalog.');
                    }
                },
            ],
            'lines.*.frequency' => ['nullable', 'numeric'],
            'lines.*.duration' => ['nullable', 'numeric'],
            'lines.*.dosage' => ['nullable', 'numeric'],
            'lines.*.quantity' => ['required', 'numeric', 'min:0'],
        ]);

        DB::transaction(function () use ($request, $prescription, $data, $teamId): void {
            $prescription->update(['patient_id' => $data['patient_id']]);

            $keptIds = [];
            $total = 0.0;

            foreach ($data['lines'] as $line) {
                $priceList = PriceList::query()->whereKey($line['price_list_id'])->firstOrFail();
                $quantity = (float) $line['quantity'];
                $unitPrice = (float) $priceList->price;
                $total += $quantity * $unitPrice;

                $attributes = [
                    'price_list_id' => $priceList->getKey(),
                    'unitPrice' => $unitPrice,
                    'unitCost' => $priceList->unitCost() ?? 0,
                    'frequency' => $line['frequency'] ?? null,
                    'duration' => $line['duration'] ?? null,
                    'dosage' => $line['dosage'] ?? null,
                    'quantity' => $quantity,
                    'patient_id' => $data['patient_id'],
                ];

                if (! empty($line['id'])) {
                    $existing = $prescription->lines()->whereKey($line['id'])->first();
                    if ($existing) {
                        $existing->update($attributes);
                        $keptIds[] = $existing->getKey();

                        continue;
                    }
                }

                $created = $prescription->lines()->create([
                    ...$attributes,
                    'team_id' => $teamId,
                    'user_id' => $request->user()->getKey(),
                ]);
                $keptIds[] = $created->getKey();
            }

            $prescription->lines()->whereNotIn('id', $keptIds)->delete();

            $prescription->update(['total' => $total]);

            $billing = $prescription->billings()->first();
            if ($billing) {
                $billing->update(['total' => $total]);
            } elseif ($total > 0) {
                $prescription->billings()->create([
                    'team_id' => $teamId,
                    'patient_id' => $data['patient_id'],
                    'user_id' => $request->user()->getKey(),
                    'total' => $total,
                ]);
            }
        });

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Prescription updated.']);

        return to_route('pharmacy.prescriptions.show', [
            'current_team' => $request->user()->currentTeam->slug,
            'prescription' => $prescription->getKey(),
        ]);
    }

    /**
     * Refund selected lines of a dispensed prescription and return stock.
     */
    public function refund(Request $request, string $current_team, Prescription $prescription): RedirectResponse
    {
        abort_unless($prescription->status === 'dispensed', 409, 'Only dispensed prescriptions can be refunded.');

        $teamId = $request->user()->currentTeam->getKey();

        $data = $request->validate([
            'lines' => ['required', 'array', 'min:1'],
            'lines.*.refund' => ['required', 'boolean'],
            'lines.*.line_id' => ['required', 'integer', Rule::exists('lines', 'id')->where('team_id', $teamId)],
        ]);

        /** @var array<int, array<string, mixed>> $lines */
        $lines = $data['lines'];

        $selected = collect($lines)->where('refund', true)->values();

        abort_if($selected->isEmpty(), 422, 'Select at least one drug to refund.');

        DB::transaction(function () use ($request, $prescription, $selected, $teamId): void {
            $receiver = Patient::query()->where('slug', $prescription->patient_id)->firstOrFail();

            $refunded = Prescription::create([
                'team_id' => $teamId,
                'patient_id' => $prescription->patient_id,
                'appointment_id' => $prescription->appointment_id,
                'doctor_id' => $prescription->doctor_id,
                'status' => 'refunded',
                'total' => 0,
            ]);

            $refundTotal = 0.0;

            foreach ($selected as $lineData) {
                $line = $prescription->lines()->whereKey($lineData['line_id'])->first();
                if (! $line) {
                    continue;
                }

                $refundTotal += (float) $line->quantity * (float) $line->unitPrice;

                $parentInventory = Inventory::query()->where('price_list_id', $line->price_list_id)->first();
                $drugInventory = DrugInventory::query()->where('price_list_id', $line->price_list_id)->first();

                abort_unless($parentInventory, 422, 'The medication does not have a linked inventory record.');

                Stock::create([
                    'team_id' => $teamId,
                    'user_id' => $request->user()->getKey(),
                    'inventory_id' => $parentInventory->getKey(),
                    'stockable_id' => $refunded->getKey(),
                    'stockable_type' => Prescription::class,
                    'receivable_id' => $receiver->getKey(),
                    'receivable_type' => Patient::class,
                    'quantity' => -1 * (float) $line->quantity,
                    'status' => 'Returned',
                ]);

                if ($drugInventory) {
                    Stock::create([
                        'team_id' => $teamId,
                        'user_id' => $request->user()->getKey(),
                        'inventory_id' => $parentInventory->getKey(),
                        'stockable_id' => $drugInventory->getKey(),
                        'stockable_type' => DrugInventory::class,
                        'receivable_id' => $receiver->getKey(),
                        'receivable_type' => Patient::class,
                        'quantity' => (float) $line->quantity,
                        'status' => 'Returned',
                    ]);

                    $nextQuantity = (float) $drugInventory->quantity + (float) $line->quantity;
                    $drugInventory->update([
                        'quantity' => $nextQuantity,
                        'status' => $nextQuantity <= (float) $drugInventory->min_qty ? 'low' : 'available',
                    ]);
                }

                $refunded->lines()->create([
                    'team_id' => $teamId,
                    'price_list_id' => $line->price_list_id,
                    'unitPrice' => $line->unitPrice,
                    'unitCost' => $line->unitCost,
                    'frequency' => $line->frequency,
                    'duration' => $line->duration,
                    'dosage' => $line->dosage,
                    'quantity' => $line->quantity,
                    'patient_id' => $line->patient_id,
                    'user_id' => $line->user_id,
                ]);
            }

            $refunded->update(['total' => $refundTotal]);

            if ($refundTotal > 0) {
                $refunded->billings()->create([
                    'team_id' => $teamId,
                    'patient_id' => $prescription->patient_id,
                    'user_id' => $request->user()->getKey(),
                    'total' => -1 * $refundTotal,
                ]);
            }
        });

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Refund processed successfully.']);

        return to_route('pharmacy.prescriptions.show', [
            'current_team' => $request->user()->currentTeam->slug,
            'prescription' => $prescription->getKey(),
        ]);
    }

    /**
     * Dispense a paid prescription and record its stock movements.
     */
    public function dispense(Request $request, string $current_team, Prescription $prescription): RedirectResponse
    {
        if ($prescription->status !== 'paid') {
            Inertia::flash('toast', ['type' => 'error', 'message' => 'Only paid prescriptions can be dispensed.']);

            return to_route('pharmacy.prescriptions.show', [
                'current_team' => $request->user()->currentTeam->slug,
                'prescription' => $prescription->getKey(),
            ]);
        }

        $prescription->load(['lines.priceList.drugInventory', 'patient']);

        $missingStock = $prescription->lines
            ->filter(fn (Line $line): bool => $line->priceList?->drugInventory === null)
            ->map(fn (Line $line): string => $line->priceList->name ?? "Price list #{$line->price_list_id}")
            ->values();

        if ($missingStock->isNotEmpty()) {
            Inertia::flash('toast', ['type' => 'error', 'message' => 'Cannot dispense — no pharmacy stock available for: '.$missingStock->implode(', ')]);

            return to_route('pharmacy.prescriptions.show', [
                'current_team' => $request->user()->currentTeam->slug,
                'prescription' => $prescription->getKey(),
            ]);
        }

        DB::transaction(function () use ($prescription): void {
            $patient = Patient::query()->where('slug', $prescription->patient_id)->firstOrFail();

            foreach ($prescription->lines as $line) {
                /** @var DrugInventory $drugInventory */
                $drugInventory = $line->priceList->drugInventory;

                app(InventoryUsageService::class)->use(
                    $drugInventory,
                    quantity: (int) $line->quantity,
                    stockStatus: 'Dispensed',
                    patientId: (int) $patient->getKey(),
                );
            }

            $prescription->update(['status' => 'dispensed']);
        });

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Prescription dispensed successfully.']);

        return to_route('pharmacy.prescriptions.show', [
            'current_team' => $request->user()->currentTeam->slug,
            'prescription' => $prescription->getKey(),
        ]);
    }

    /**
     * Delete a prescription that has not been paid, dispensed, or refunded.
     */
    public function destroy(Request $request, string $current_team, Prescription $prescription): RedirectResponse
    {
        abort_if(in_array($prescription->status, ['paid', 'dispensed', 'refunded'], true), 409, 'This prescription can no longer be deleted.');

        DB::transaction(function () use ($prescription): void {
            $prescription->lines()->delete();
            $prescription->billings()->delete();
            $prescription->delete();
        });

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Prescription deleted.']);

        return to_route('pharmacy.prescriptions.index', $request->user()->currentTeam->slug);
    }

    /**
     * Delete multiple deletable prescriptions.
     */
    public function bulkDestroy(Request $request): RedirectResponse
    {
        $teamId = $request->user()->currentTeam->getKey();
        $data = $request->validate([
            'ids' => ['required', 'array', 'min:1'],
            'ids.*' => ['integer', Rule::exists('prescriptions', 'id')->where('team_id', $teamId)],
        ]);

        $prescriptions = Prescription::query()
            ->whereIn('id', $data['ids'])
            ->whereNotIn('status', ['paid', 'dispensed', 'refunded'])
            ->get();

        DB::transaction(function () use ($prescriptions): void {
            foreach ($prescriptions as $prescription) {
                $prescription->lines()->delete();
                $prescription->billings()->delete();
                $prescription->delete();
            }
        });

        Inertia::flash('toast', ['type' => 'success', 'message' => $prescriptions->count().' prescription(s) deleted.']);

        return to_route('pharmacy.prescriptions.index', $request->user()->currentTeam->slug);
    }

    /**
     * Present a prescription row for the list.
     *
     * @return array<string, mixed>
     */
    private function present(Prescription $prescription): array
    {
        return [
            'id' => $prescription->getKey(),
            'patientSlug' => $prescription->patient_id,
            'patientName' => $prescription->patient?->fullName,
            'doctorName' => $prescription->doctor?->name,
            'total' => (float) $prescription->total,
            'status' => $prescription->status,
            'linesCount' => $prescription->lines_count ?? $prescription->lines()->count(),
            'createdAt' => $prescription->created_at?->toIso8601String(),
        ];
    }

    /**
     * Present a prescription with its lines and billings.
     *
     * @return array<string, mixed>
     */
    private function detail(Prescription $prescription): array
    {
        return [
            ...$this->present($prescription),
            'lines' => $prescription->lines->map(fn (Line $line) => [
                'id' => $line->getKey(),
                'priceListId' => $line->price_list_id,
                'name' => $line->priceList?->name,
                'unitPrice' => (float) $line->unitPrice,
                'unitCost' => (float) $line->unitCost,
                'frequency' => $line->frequency !== null ? (float) $line->frequency : null,
                'duration' => $line->duration !== null ? (float) $line->duration : null,
                'dosage' => $line->dosage !== null ? (float) $line->dosage : null,
                'quantity' => (float) $line->quantity,
                'totalPrice' => (float) $line->totalPrice,
            ])->values(),
            'billings' => $prescription->billings->map(fn (Billing $billing) => [
                'id' => $billing->getKey(),
                'total' => (float) $billing->total,
                'status' => $billing->status,
            ])->values(),
            'canEdit' => ! in_array($prescription->status, ['paid', 'dispensed', 'refunded'], true),
            'canRefund' => $prescription->status === 'dispensed',
            'canDispense' => $prescription->status === 'paid',
            'canDelete' => ! in_array($prescription->status, ['paid', 'dispensed', 'refunded'], true),
        ];
    }

    /**
     * Pharmacy catalog items available for prescribing.
     *
     * @return Collection<int, array<string, mixed>>
     */
    private function pharmacyPriceLists(): Collection
    {
        return PriceList::query()
            ->where('is_inventory', true)
            ->whereHas('subCategory.category', fn (Builder $query) => $query->where('name', 'Pharmacy'))
            ->with('drugInventories.drugForm')
            ->orderBy('name')
            ->get()
            ->map(fn (PriceList $priceList) => [
                'id' => $priceList->getKey(),
                'name' => $priceList->name,
                'price' => (float) $priceList->price,
                'drugForm' => $priceList->drugInventories->first()?->drugForm?->name,
            ]);
    }

    /**
     * Options used by the prescription create and edit forms.
     *
     * @return array{patients: Collection<int, array<string, mixed>>, priceLists: Collection<int, array<string, mixed>>}
     */
    private function formOptions(?string $search = null, ?string $selectedPatientSlug = null): array
    {
        return [
            'patients' => $this->patientOptions($search, $selectedPatientSlug),
            'priceLists' => $this->pharmacyPriceLists(),
        ];
    }

    /**
     * Patients that may be prescribed to, filtered by a search term.
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
            ->limit(self::PATIENT_OPTION_LIMIT)
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
