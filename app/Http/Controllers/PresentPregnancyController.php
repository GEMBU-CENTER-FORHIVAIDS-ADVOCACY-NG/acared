<?php

namespace App\Http\Controllers;

use App\Models\Nursing;
use App\Models\PresentPregnancy;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class PresentPregnancyController extends Controller
{
    public function index(Request $request, string $current_team, Nursing $nursing): Response
    {
        $nursing->load('patient');
        $records = PresentPregnancy::query()
            ->where('patient_id', $nursing->patient_id)
            ->with('nurse')
            ->latest('date')
            ->get()
            ->map(fn (PresentPregnancy $record): array => [
                'id' => $record->getKey(),
                'date' => $record->date?->toIso8601String(),
                'bp' => $record->bp,
                'gA' => $record->g_a,
                'weight' => $record->weight,
                'lmp' => $record->lmp?->toIso8601String(),
                'edd' => $record->edd?->toIso8601String(),
                'sfh' => $record->sfh,
                'lie' => $record->lie,
                'position' => $record->position,
                'fhr' => $record->fhr,
                'hb' => $record->hb,
                'oedema' => $record->oedema,
                'nurseName' => $record->nurse?->name,
                'canEdit' => (int) $record->nurse_id === (int) $request->user()->getKey(),
                'createdAt' => $record->created_at?->toIso8601String(),
            ]);

        return Inertia::render('nursing/records/present-pregnancy', [
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

        PresentPregnancy::create([
            ...$data,
            'team_id' => $request->user()->currentTeam->getKey(),
            'patient_id' => $nursing->patient_id,
            'nurse_id' => $request->user()->getKey(),
        ]);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Present pregnancy record added.']);

        return to_route('nursing.records.present-pregnancy.index', [$current_team, $nursing->getKey()]);
    }

    public function update(Request $request, string $current_team, Nursing $nursing, PresentPregnancy $presentPregnancy): RedirectResponse
    {
        $this->authorizeRecord($presentPregnancy, $nursing, $request);
        $data = $request->validate($this->rules());

        $presentPregnancy->update($data);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Present pregnancy record updated.']);

        return to_route('nursing.records.present-pregnancy.index', [$current_team, $nursing->getKey()]);
    }

    public function destroy(Request $request, string $current_team, Nursing $nursing, PresentPregnancy $presentPregnancy): RedirectResponse
    {
        $this->authorizeRecord($presentPregnancy, $nursing, $request);
        $presentPregnancy->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Present pregnancy record deleted.']);

        return to_route('nursing.records.present-pregnancy.index', [$current_team, $nursing->getKey()]);
    }

    /**
     * @return array<string, mixed>
     */
    private function rules(): array
    {
        return [
            'date' => ['required', 'date'],
            'bp' => ['nullable', 'string', 'max:20'],
            'g_a' => ['nullable', 'string', 'max:10'],
            'weight' => ['nullable', 'numeric', 'min:0', 'max:999.99'],
            'lmp' => ['nullable', 'date'],
            'edd' => ['nullable', 'date'],
            'sfh' => ['nullable', 'numeric', 'min:0', 'max:99.9'],
            'lie' => ['nullable', Rule::in(['longitudinal', 'transverse', 'oblique'])],
            'position' => ['nullable', Rule::in(['left anterior', 'left posterior', 'right anterior', 'right posterior'])],
            'fhr' => ['nullable', 'integer', 'min:0', 'max:999'],
            'hb' => ['nullable', 'numeric', 'min:0', 'max:99.9'],
            'oedema' => ['nullable', 'boolean'],
        ];
    }

    private function authorizeRecord(PresentPregnancy $record, Nursing $nursing, Request $request): void
    {
        abort_unless($record->patient_id === $nursing->patient_id, 404);
        abort_unless((int) $record->nurse_id === (int) $request->user()->getKey(), 403);
    }
}
