<?php

namespace App\Http\Controllers\Pharmacy;

use App\Http\Controllers\Controller;
use App\Models\DrugForm;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class DrugFormController extends Controller
{
    /**
     * List the medication dosage forms for the active team.
     */
    public function index(Request $request): Response
    {
        $filters = [
            'q' => trim((string) $request->query('q', '')),
            'perPage' => in_array((int) $request->query('perPage', 25), [10, 25, 50, 100], true)
                ? (int) $request->query('perPage', 25)
                : 25,
        ];

        $drugForms = DrugForm::query()
            ->withCount(['inventories', 'drugInventories'])
            ->when($filters['q'] !== '', fn ($query) => $query->where('name', 'like', '%'.$filters['q'].'%'))
            ->orderBy('name')
            ->paginate($filters['perPage'])
            ->withQueryString()
            ->through(fn (DrugForm $drugForm) => [
                'id' => $drugForm->getKey(),
                'name' => $drugForm->name,
                'inventoriesCount' => $drugForm->inventories_count + $drugForm->drug_inventories_count,
                'createdAt' => $drugForm->created_at?->toIso8601String(),
                'updatedAt' => $drugForm->updated_at?->toIso8601String(),
            ]);

        return Inertia::render('pharmacy/drug-forms/index', [
            'drugForms' => $drugForms,
            'filters' => $filters,
        ]);
    }

    /**
     * Create a new medication dosage form.
     */
    public function store(Request $request): RedirectResponse
    {
        $data = $this->validated($request);

        DrugForm::create([
            ...$data,
            'team_id' => $request->user()->currentTeam->getKey(),
        ]);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Drug form added.']);

        return to_route('pharmacy.drug-forms.index', $request->user()->currentTeam->slug);
    }

    /**
     * Update an existing medication dosage form.
     */
    public function update(Request $request, string $current_team, DrugForm $drug_form): RedirectResponse
    {
        $drug_form->update($this->validated($request, $drug_form));

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Drug form updated.']);

        return to_route('pharmacy.drug-forms.index', $request->user()->currentTeam->slug);
    }

    /**
     * Delete a medication dosage form with no linked inventories.
     */
    public function destroy(Request $request, string $current_team, DrugForm $drug_form): RedirectResponse
    {
        abort_if(
            $drug_form->inventories()->exists()
            || $drug_form->drugInventories()->exists()
            || $drug_form->labInventories()->exists(),
            409,
            'This drug form is in use and cannot be deleted.',
        );
        $drug_form->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Drug form deleted.']);

        return to_route('pharmacy.drug-forms.index', $request->user()->currentTeam->slug);
    }

    /**
     * Validate medication dosage form attributes for the active team.
     *
     * @return array<string, mixed>
     */
    private function validated(Request $request, ?DrugForm $drugForm = null): array
    {
        $teamId = $request->user()->currentTeam->getKey();

        return $request->validate([
            'name' => [
                'required',
                'string',
                'max:255',
                Rule::unique('drug_forms', 'name')
                    ->where('team_id', $teamId)
                    ->ignore($drugForm?->getKey()),
            ],
        ]);
    }
}
