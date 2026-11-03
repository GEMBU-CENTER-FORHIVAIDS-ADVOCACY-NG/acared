<?php

namespace App\Http\Controllers;

use App\Models\Nursing;
use App\Models\PreviousPregnancy;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class PreviousPregnancyController extends Controller
{
    public function index(Request $request, string $current_team, Nursing $nursing): Response
    {
        $nursing->load('patient');
        $records = PreviousPregnancy::query()
            ->where('patient_id', $nursing->patient_id)
            ->with('nurse')
            ->latest('year')
            ->get()
            ->map(fn (PreviousPregnancy $record): array => [
                'id' => $record->getKey(),
                'year' => $record->year,
                'ga' => $record->ga,
                'durationOfPregnancy' => $record->duration_of_pregnancy,
                'durationOfLabour' => $record->duration_of_labour,
                'abortion' => $record->abortion,
                'iufd' => $record->iufd,
                'aph' => $record->aph,
                'pph' => $record->pph,
                'sex' => $record->sex,
                'weight' => $record->weight,
                'modeOfDelivery' => $record->mode_of_delivery,
                'ageLife' => $record->age_life,
                'ageDeath' => $record->age_death,
                'nurseName' => $record->nurse?->name,
                'canEdit' => (int) $record->nurse_id === (int) $request->user()->getKey(),
                'createdAt' => $record->created_at?->toIso8601String(),
            ]);

        return Inertia::render('nursing/records/previous-pregnancy', [
            'nursing' => [
                'id' => $nursing->getKey(),
                'patientId' => $nursing->patient_id,
                'patientName' => $nursing->patient?->fullName,
                'purpose' => $nursing->purpose,
                'status' => $nursing->status,
            ],
            'records' => $records,
        ]);
    }

    public function store(Request $request, string $current_team, Nursing $nursing): RedirectResponse
    {
        $data = $request->validate($this->rules());

        PreviousPregnancy::create([
            ...$data,
            'team_id' => $request->user()->currentTeam->getKey(),
            'patient_id' => $nursing->patient_id,
            'nurse_id' => $request->user()->getKey(),
        ]);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Previous pregnancy record added.']);

        return to_route('nursing.records.previous-pregnancy.index', [$current_team, $nursing->getKey()]);
    }

    public function update(Request $request, string $current_team, Nursing $nursing, PreviousPregnancy $previousPregnancy): RedirectResponse
    {
        $this->authorizeRecord($previousPregnancy, $nursing, $request);
        $data = $request->validate($this->rules());

        $previousPregnancy->update($data);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Previous pregnancy record updated.']);

        return to_route('nursing.records.previous-pregnancy.index', [$current_team, $nursing->getKey()]);
    }

    public function destroy(Request $request, string $current_team, Nursing $nursing, PreviousPregnancy $previousPregnancy): RedirectResponse
    {
        $this->authorizeRecord($previousPregnancy, $nursing, $request);
        $previousPregnancy->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Previous pregnancy record deleted.']);

        return to_route('nursing.records.previous-pregnancy.index', [$current_team, $nursing->getKey()]);
    }

    /**
     * @return array<string, mixed>
     */
    private function rules(): array
    {
        return [
            'year' => ['nullable', 'integer', 'min:1900', 'max:'.(date('Y') + 1)],
            'ga' => ['nullable', 'string', 'max:10'],
            'duration_of_pregnancy' => ['nullable', 'string', 'max:20'],
            'duration_of_labour' => ['nullable', 'string', 'max:20'],
            'abortion' => ['nullable', 'boolean'],
            'iufd' => ['nullable', 'boolean'],
            'aph' => ['nullable', 'boolean'],
            'pph' => ['nullable', 'boolean'],
            'sex' => ['nullable', Rule::in(['male', 'female'])],
            'weight' => ['nullable', 'numeric', 'min:0', 'max:999.99'],
            'mode_of_delivery' => ['nullable', 'string', 'max:255'],
            'age_life' => ['nullable', 'string', 'max:10'],
            'age_death' => ['nullable', 'string', 'max:10'],
        ];
    }

    private function authorizeRecord(PreviousPregnancy $record, Nursing $nursing, Request $request): void
    {
        abort_unless($record->patient_id === $nursing->patient_id, 404);
        abort_unless((int) $record->nurse_id === (int) $request->user()->getKey(), 403);
    }
}
