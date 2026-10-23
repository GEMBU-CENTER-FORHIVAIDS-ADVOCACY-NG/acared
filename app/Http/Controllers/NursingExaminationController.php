<?php

namespace App\Http\Controllers;

use App\Models\Examination;
use App\Models\Nursing;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class NursingExaminationController extends Controller
{
    private const FIELDS = ['Hair', 'Ear', 'Eye', 'Nose', 'Mouth', 'Neck', 'Breast', 'Abdomen', 'Leg'];

    public function index(Request $request, string $current_team, Nursing $nursing): Response
    {
        $nursing->load('patient');
        $examinations = Examination::query()
            ->where('patient_id', $nursing->patient_id)
            ->with('doctor')
            ->latest()
            ->paginate(10)
            ->withQueryString()
            ->through(fn (Examination $examination): array => [
                'id' => $examination->getKey(),
                'notes' => $examination->notes[0]['data'] ?? [],
                'doctorName' => $examination->doctor?->name,
                'canEdit' => (int) $examination->doctor_id === (int) $request->user()->getKey(),
                'createdAt' => $examination->created_at?->toIso8601String(),
            ]);

        return Inertia::render('nursing/records/examinations', [
            'nursing' => [
                'id' => $nursing->getKey(),
                'patientId' => $nursing->patient_id,
                'patientName' => $nursing->patient?->fullName,
            ],
            'examinations' => $examinations,
            'fields' => self::FIELDS,
        ]);
    }

    public function store(Request $request, string $current_team, Nursing $nursing): RedirectResponse
    {
        $data = $this->validated($request);
        Examination::query()->create([
            'team_id' => $request->user()->currentTeam->getKey(),
            'patient_id' => $nursing->patient_id,
            'doctor_id' => $request->user()->getKey(),
            'notes' => [['type' => 'heading', 'data' => $data['notes']]],
        ]);

        return to_route('nursing.records.examinations.index', [$current_team, $nursing->getKey()]);
    }

    public function update(Request $request, string $current_team, Nursing $nursing, Examination $examination): RedirectResponse
    {
        $this->authorizeExamination($request, $nursing, $examination);
        $data = $this->validated($request);
        $examination->update(['notes' => [['type' => 'heading', 'data' => $data['notes']]]]);

        return to_route('nursing.records.examinations.index', [$current_team, $nursing->getKey()]);
    }

    public function destroy(Request $request, string $current_team, Nursing $nursing, Examination $examination): RedirectResponse
    {
        $this->authorizeExamination($request, $nursing, $examination);
        $examination->delete();

        return to_route('nursing.records.examinations.index', [$current_team, $nursing->getKey()]);
    }

    /** @return array{notes: array<string, string|null>} */
    private function validated(Request $request): array
    {
        $rules = ['notes' => ['required', 'array']];
        foreach (self::FIELDS as $field) {
            $rules["notes.{$field}"] = ['nullable', 'string', 'max:10000'];
        }

        return $request->validate($rules);
    }

    private function authorizeExamination(Request $request, Nursing $nursing, Examination $examination): void
    {
        abort_unless($examination->patient_id === $nursing->patient_id, 404);
        abort_unless((int) $examination->doctor_id === (int) $request->user()->getKey(), 403);
    }
}
