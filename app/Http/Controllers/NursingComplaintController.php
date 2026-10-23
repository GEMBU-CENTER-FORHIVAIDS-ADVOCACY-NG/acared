<?php

namespace App\Http\Controllers;

use App\Models\Complaint;
use App\Models\Nursing;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class NursingComplaintController extends Controller
{
    public function index(Request $request, string $current_team, Nursing $nursing): Response
    {
        $nursing->load('patient');
        $complaints = Complaint::query()
            ->where('patient_id', $nursing->patient_id)
            ->with('doctor')
            ->latest()
            ->paginate(10)
            ->withQueryString()
            ->through(fn (Complaint $complaint): array => [
                'id' => $complaint->getKey(),
                'notes' => $complaint->notes,
                'doctorName' => $complaint->doctor?->name,
                'canEdit' => (int) $complaint->doctor_id === (int) $request->user()->getKey(),
                'createdAt' => $complaint->created_at?->toIso8601String(),
            ]);

        return Inertia::render('nursing/records/complaints', [
            'nursing' => ['id' => $nursing->getKey(), 'patientId' => $nursing->patient_id, 'patientName' => $nursing->patient?->fullName],
            'complaints' => $complaints,
        ]);
    }

    public function store(Request $request, string $current_team, Nursing $nursing): RedirectResponse
    {
        $data = $request->validate(['notes' => ['required', 'string', 'max:30000']]);
        Complaint::query()->create([
            'team_id' => $request->user()->currentTeam->getKey(),
            'patient_id' => $nursing->patient_id,
            'doctor_id' => $request->user()->getKey(),
            'notes' => $data['notes'],
            'notes_en' => $data['notes'],
        ]);

        return to_route('nursing.records.complaints.index', [$current_team, $nursing->getKey()]);
    }

    public function update(Request $request, string $current_team, Nursing $nursing, Complaint $complaint): RedirectResponse
    {
        $this->authorizeComplaint($request, $nursing, $complaint);
        $data = $request->validate(['notes' => ['required', 'string', 'max:30000']]);
        $complaint->update(['notes' => $data['notes'], 'notes_en' => $data['notes']]);

        return to_route('nursing.records.complaints.index', [$current_team, $nursing->getKey()]);
    }

    public function destroy(Request $request, string $current_team, Nursing $nursing, Complaint $complaint): RedirectResponse
    {
        $this->authorizeComplaint($request, $nursing, $complaint);
        $complaint->delete();

        return to_route('nursing.records.complaints.index', [$current_team, $nursing->getKey()]);
    }

    private function authorizeComplaint(Request $request, Nursing $nursing, Complaint $complaint): void
    {
        abort_unless($complaint->patient_id === $nursing->patient_id, 404);
        abort_unless((int) $complaint->doctor_id === (int) $request->user()->getKey(), 403);
    }
}
