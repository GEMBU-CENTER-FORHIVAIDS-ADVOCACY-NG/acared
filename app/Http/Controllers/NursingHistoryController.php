<?php

namespace App\Http\Controllers;

use App\Models\History;
use App\Models\Nursing;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class NursingHistoryController extends Controller
{
    public function index(Request $request, string $current_team, Nursing $nursing): Response
    {
        $nursing->load('patient');
        $histories = History::query()
            ->where('patient_id', $nursing->patient_id)
            ->with('nurse')
            ->latest()
            ->paginate(10)
            ->withQueryString()
            ->through(fn (History $history): array => [
                'id' => $history->getKey(),
                'familyHistory' => $history->family_history ?? [],
                'socialHistory' => $history->social_history,
                'surgicalHistory' => $history->surgical_history ?? [],
                'nurseName' => $history->nurse?->name,
                'canEdit' => (int) $history->nurse_id === (int) $request->user()->getKey(),
                'createdAt' => $history->created_at?->toIso8601String(),
            ]);

        return Inertia::render('nursing/records/history', [
            'nursing' => [
                'id' => $nursing->getKey(),
                'patientId' => $nursing->patient_id,
                'patientName' => $nursing->patient?->fullName,
                'purpose' => $nursing->purpose,
                'status' => $nursing->status,
            ],
            'histories' => $histories,
        ]);
    }

    public function store(Request $request, string $current_team, Nursing $nursing): RedirectResponse
    {
        $data = $request->validate($this->rules());

        History::query()->create([
            ...$data,
            'team_id' => $request->user()->currentTeam->getKey(),
            'patient_id' => $nursing->patient_id,
            'nurse_id' => $request->user()->getKey(),
        ]);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Maternity history recorded.']);

        return to_route('nursing.records.histories.index', [$current_team, $nursing->getKey()]);
    }

    public function update(Request $request, string $current_team, Nursing $nursing, History $history): RedirectResponse
    {
        $this->authorizeHistory($history, $nursing, $request);
        $data = $request->validate($this->rules());

        $history->update($data);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Maternity history updated.']);

        return to_route('nursing.records.histories.index', [$current_team, $nursing->getKey()]);
    }

    public function destroy(Request $request, string $current_team, Nursing $nursing, History $history): RedirectResponse
    {
        $this->authorizeHistory($history, $nursing, $request);
        $history->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Maternity history deleted.']);

        return to_route('nursing.records.histories.index', [$current_team, $nursing->getKey()]);
    }

    /**
     * @return array<string, array<int|string, mixed>>
     */
    private function rules(): array
    {
        $rules = [
            'social_history' => ['nullable', 'string', 'max:10000'],
        ];

        foreach (['hypertension', 'sickle_cell', 'tuberculosis', 'diabetes', 'pud'] as $field) {
            $rules["family_history.{$field}.status"] = ['nullable', Rule::in(['yes', 'no', 'others'])];
            $rules["family_history.{$field}.others"] = ['nullable', 'string', 'max:255'];
        }

        foreach (['myomectomy', 'cs', 'mastectomy', 'hysterectomy', 'blood_transfusion'] as $field) {
            $rules["surgical_history.{$field}.status"] = ['nullable', Rule::in(['yes', 'no', 'others'])];
        }

        return $rules;
    }

    private function authorizeHistory(History $history, Nursing $nursing, Request $request): void
    {
        abort_unless($history->patient_id === $nursing->patient_id, 404);
        abort_unless((int) $history->nurse_id === (int) $request->user()->getKey(), 403);
    }
}
