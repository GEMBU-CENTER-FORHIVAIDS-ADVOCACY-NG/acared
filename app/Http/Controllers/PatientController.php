<?php

namespace App\Http\Controllers;

use App\Http\Requests\StorePatientRequest;
use App\Http\Requests\UpdatePatientRequest;
use App\Models\Appointment;
use App\Models\Billing;
use App\Models\Category;
use App\Models\Country;
use App\Models\Lga;
use App\Models\Line;
use App\Models\Patient;
use App\Models\PriceList;
use App\Models\State;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PatientController extends Controller
{
    /**
     * The patient columns that may be used to sort the list.
     */
    private const SORTABLE_COLUMNS = ['created_at', 'updated_at', 'birthDate'];

    /**
     * The pagination sizes that users may pick.
     */
    private const PER_PAGE_OPTIONS = [10, 25, 50, 100];

    /**
     * List the patients for the current team.
     */
    public function index(Request $request): Response
    {
        $tab = $this->activeTab($request);
        $filters = [
            'tab' => $tab,
            'q' => $this->searchQuery($request),
            'trashed' => $this->trashedFilter($request),
            'sort' => $this->sortBy($request),
            'direction' => $this->sortDirection($request),
            'perPage' => $this->perPage($request),
        ];

        $patients = $this->filteredQuery($filters)
            ->with('category')
            ->orderBy($filters['sort'], $filters['direction'])
            ->paginate($filters['perPage'])
            ->withQueryString()
            ->through(fn (Patient $patient) => $this->listItem($patient));

        return Inertia::render('patients/index', [
            'patients' => $patients,
            'tabs' => $this->tabs($request),
            'stats' => $this->stats(),
            'filters' => $filters,
        ]);
    }

    /**
     * Show the form to register a new patient.
     */
    public function create(Request $request): Response
    {
        return Inertia::render('patients/create', [
            'options' => $this->formOptions(),
            'nextHospitalNo' => $this->nextHospitalNumber(),
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
        ]);
    }

    /**
     * Store a newly registered patient.
     */
    public function store(StorePatientRequest $request): RedirectResponse
    {
        $user = $request->user();
        $teamId = $user->currentTeam->getKey();
        $validated = $request->validated();
        unset($validated['billings']);

        $patient = Patient::create([
            ...$validated,
            'slug' => $validated['slug'] ?? $this->nextHospitalNumber(),
            'team_id' => $teamId,
        ]);

        $this->applyBillings($patient->slug, $teamId, $user, (array) $request->input('billings', []));

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Patient registered.']);

        return to_route('patients.show', [$user->currentTeam->slug, $patient->getKey()]);
    }

    /**
     * Create the patient invoices and their lines.
     *
     * @param  array<int, array{lines: array<int, array{price_list_id: int, unitPrice: float}>, total?: float}>  $billings
     */
    private function applyBillings(string $patientSlug, int $teamId, User $user, array $billings): void
    {
        foreach ($billings as $billingData) {
            if (empty($billingData['lines'])) {
                continue;
            }

            $total = $billingData['total'] ?? collect($billingData['lines'])->sum(fn (array $line) => $line['unitPrice']);

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
        }
    }

    /**
     * Display the given patient.
     */
    public function show(Request $request, string $current_team, Patient $patient): Response
    {
        return Inertia::render('patients/show', [
            'patient' => $this->detail($patient),
        ]);
    }

    /**
     * Show the form to edit the given patient.
     */
    public function edit(Request $request, string $current_team, Patient $patient): Response
    {
        return Inertia::render('patients/edit', [
            'patient' => $this->detail($patient),
            'options' => $this->formOptions(),
        ]);
    }

    /**
     * Update the given patient.
     */
    public function update(UpdatePatientRequest $request, string $current_team, Patient $patient): RedirectResponse
    {
        $patient->update($request->validated());

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Patient updated.']);

        return to_route('patients.show', [$request->user()->currentTeam->slug, $patient->getKey()]);
    }

    /**
     * Soft delete the given patient.
     */
    public function destroy(Request $request, string $current_team, Patient $patient): RedirectResponse
    {
        $patient->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Patient moved to trash.']);

        return to_route('patients.index', $request->user()->currentTeam->slug);
    }

    /**
     * Restore the given soft deleted patient.
     */
    public function restore(Request $request, string $current_team, Patient $patient): RedirectResponse
    {
        $patient->restore();

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Patient restored.']);

        return to_route('patients.index', $request->user()->currentTeam->slug);
    }

    /**
     * Permanently delete the given patient.
     */
    public function forceDelete(Request $request, string $current_team, Patient $patient): RedirectResponse
    {
        $patient->forceDelete();

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Patient permanently deleted.']);

        return to_route('patients.index', $request->user()->currentTeam->slug);
    }

    /**
     * Soft delete the selected patients.
     */
    public function bulkDestroy(Request $request, string $current_team): RedirectResponse
    {
        $this->selectedPatients($request)->get()->each->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Selected patients moved to trash.']);

        return to_route('patients.index', $request->user()->currentTeam->slug);
    }

    /**
     * Permanently delete the selected patients.
     */
    public function bulkForceDelete(Request $request, string $current_team): RedirectResponse
    {
        $this->selectedPatients($request)->restore();
        $this->selectedPatients($request)->forceDelete();

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Selected patients permanently deleted.']);

        return to_route('patients.index', $request->user()->currentTeam->slug);
    }

    /**
     * Find the selected patients for the current team.
     *
     * @return Builder<Patient>
     */
    private function selectedPatients(Request $request): Builder
    {
        $ids = $request->validate([
            'ids' => ['required', 'array', 'min:1'],
            'ids.*' => ['integer', 'exists:patients,id'],
        ])['ids'];

        return Patient::whereIn('id', $ids);
    }

    /**
     * Build the filtered patient query for the list page.
     *
     * @param  array{tab: string, q: string, trashed: string, sort: string, direction: string, perPage: int}  $filters
     * @return Builder<Patient>
     */
    private function filteredQuery(array $filters): Builder
    {
        $query = Patient::query();

        if ($filters['tab'] === 'children') {
            $query->where('birthDate', '>=', now()->subYears(18)->toDateString());
        } elseif (ctype_digit($filters['tab'])) {
            $query->where('category_id', (int) $filters['tab']);
        }

        match ($filters['trashed']) {
            'with' => $query->withTrashed(),
            'only' => $query->onlyTrashed(),
            default => null,
        };

        if ($filters['q'] !== '') {
            $like = '%'.$filters['q'].'%';

            $query->where(fn (Builder $query) => $query
                ->where('slug', 'like', $like)
                ->orWhere('art', 'like', $like)
                ->orWhere('slugOther', 'like', $like)
                ->orWhere('fullName', 'like', $like)
                ->orWhere('firstName', 'like', $like)
                ->orWhere('middleName', 'like', $like)
                ->orWhere('lastName', 'like', $like)
                ->orWhere('gender', 'like', $like)
                ->orWhere('email', 'like', $like)
                ->orWhere('phone', 'like', $like));
        }

        return $query;
    }

    /**
     * Get the list tabs with their counts.
     *
     * @return array<int, array{key: string, label: string, count: int, badge: string}>
     */
    private function tabs(Request $request): array
    {
        $counts = Patient::query()
            ->selectRaw('category_id, COUNT(*) as total')
            ->groupBy('category_id')
            ->pluck('total', 'category_id');

        $childrenCutoff = now()->subYears(18)->toDateString();

        $tabs = [
            [
                'key' => 'all',
                'label' => 'All',
                'count' => Patient::count(),
                'badge' => 'default',
            ],
            [
                'key' => 'children',
                'label' => 'Children',
                'count' => Patient::query()->where('birthDate', '>=', $childrenCutoff)->count(),
                'badge' => 'warning',
            ],
        ];

        Category::query()
            ->orderBy('name')
            ->get()
            ->each(function (Category $category) use (&$tabs, $counts) {
                $tabs[] = [
                    'key' => (string) $category->getKey(),
                    'label' => $category->name,
                    'count' => (int) $counts->get($category->getKey(), 0),
                    'badge' => 'default',
                ];
            });

        return $tabs;
    }

    /**
     * Get the patient overview statistics.
     *
     * @return array{total: int, newLast30Days: int, revisiting: int}
     */
    private function stats(): array
    {
        return [
            'total' => Patient::count(),
            'newLast30Days' => Patient::query()
                ->where('created_at', '>=', now()->subDays(29)->startOfDay())
                ->count(),
            'revisiting' => Appointment::query()
                ->select('patient_id')
                ->groupBy('patient_id')
                ->havingRaw('COUNT(*) > 1')
                ->toBase()
                ->count(),
        ];
    }

    /**
     * Get the form options (categories and location lookups).
     *
     * @return array{categories: array<int, array{id: int, name: string}>, countries: array<int, array{id: int, name: string}>, states: array<int, array{id: int, name: string}>, lgas: array<int, array{id: int, stateId: int, name: string}>}
     */
    private function formOptions(): array
    {
        return [
            'categories' => Category::query()->orderBy('name')->get()
                ->map(fn (Category $category) => ['id' => $category->getKey(), 'name' => $category->name])
                ->all(),
            'countries' => Country::query()->orderBy('name')->get()
                ->map(fn (Country $country) => ['id' => $country->getKey(), 'name' => $country->name])
                ->all(),
            'states' => State::query()->orderBy('name')->get()
                ->map(fn (State $state) => ['id' => $state->getKey(), 'name' => $state->name])
                ->all(),
            'lgas' => Lga::query()->orderBy('name')->get()
                ->map(fn (Lga $lga) => ['id' => $lga->getKey(), 'stateId' => $lga->state_id, 'name' => $lga->name])
                ->all(),
        ];
    }

    /**
     * Serialize a patient for the list table.
     *
     * @return array<string, mixed>
     */
    private function listItem(Patient $patient): array
    {
        return [
            'id' => $patient->getKey(),
            'slug' => $patient->slug,
            'art' => $patient->art,
            'slugOther' => $patient->slugOther,
            'fullName' => $patient->fullName,
            'gender' => $patient->gender,
            'birthDate' => $patient->birthDate?->toDateString(),
            'email' => $patient->email,
            'phone' => $patient->phone,
            'createdAt' => $patient->created_at?->toIso8601String(),
            'deletedAt' => $patient->deleted_at?->toIso8601String(),
            'category' => $patient->category === null
                ? null
                : ['id' => $patient->category->getKey(), 'name' => $patient->category->name],
        ];
    }

    /**
     * Serialize a patient for the view and edit pages.
     *
     * @return array<string, mixed>
     */
    private function detail(Patient $patient): array
    {
        return [
            'id' => $patient->getKey(),
            'slug' => $patient->slug,
            'art' => $patient->art,
            'slugOther' => $patient->slugOther,
            'firstName' => $patient->firstName,
            'middleName' => $patient->middleName,
            'lastName' => $patient->lastName,
            'fullName' => $patient->fullName,
            'gender' => $patient->gender,
            'birthDate' => $patient->birthDate?->toDateString(),
            'age' => $patient->age,
            'email' => $patient->email,
            'phone' => $patient->phone,
            'mobile' => $patient->mobile,
            'address' => $patient->address,
            'kinFullName' => $patient->kinFullName,
            'kinPhone' => $patient->kinPhone,
            'kinEmail' => $patient->kinEmail,
            'relation' => $patient->relation,
            'wallet' => $patient->wallet,
            'category' => $patient->category === null
                ? null
                : ['id' => $patient->category->getKey(), 'name' => $patient->category->name],
            'country' => $patient->country === null
                ? null
                : ['id' => $patient->country->getKey(), 'name' => $patient->country->name],
            'state' => $patient->state === null
                ? null
                : ['id' => $patient->state->getKey(), 'name' => $patient->state->name],
            'lga' => $patient->lga === null
                ? null
                : ['id' => $patient->lga->getKey(), 'name' => $patient->lga->name],
            'createdAt' => $patient->created_at?->toIso8601String(),
            'updatedAt' => $patient->updated_at?->toIso8601String(),
            'deletedAt' => $patient->deleted_at?->toIso8601String(),
        ];
    }

    /**
     * Generate the next sequential hospital number.
     */
    private function nextHospitalNumber(): string
    {
        return 'PAT-'.str_pad((string) (Patient::withTrashed()->count() + 1), 5, '0', STR_PAD_LEFT);
    }

    /**
     * Get the active list tab.
     */
    private function activeTab(Request $request): string
    {
        $tab = (string) $request->query('tab', '');

        if ($tab === '' || $tab === 'all' || $tab === 'children' || ctype_digit($tab)) {
            return $tab === '' ? 'all' : $tab;
        }

        return 'all';
    }

    /**
     * Get the trimmed search query.
     */
    private function searchQuery(Request $request): string
    {
        return trim((string) $request->query('q', ''));
    }

    /**
     * Get the validated trashed filter.
     */
    private function trashedFilter(Request $request): string
    {
        $trashed = (string) $request->query('trashed', 'without');

        return in_array($trashed, ['with', 'only'], true) ? $trashed : 'without';
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
     * Get the validated sort direction.
     */
    private function sortDirection(Request $request): string
    {
        return $request->query('direction') === 'asc' ? 'asc' : 'desc';
    }

    /**
     * Get the validated page size.
     */
    private function perPage(Request $request): int
    {
        $perPage = (int) $request->query('perPage', 25);

        return in_array($perPage, self::PER_PAGE_OPTIONS, true) ? $perPage : 25;
    }
}
