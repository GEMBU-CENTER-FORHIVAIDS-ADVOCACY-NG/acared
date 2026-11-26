<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\AdmitPatientRequest;
use App\Http\Requests\Api\V1\StoreAdmissionRequest;
use App\Http\Requests\Api\V1\TransferAdmissionRequest;
use App\Http\Resources\Api\V1\AdmissionResource;
use App\Models\Admission;
use App\Models\Ward;
use App\Service\DashboardCurrency;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class AdmissionController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Admission::query()->with(['patient:id,slug,firstName,lastName,fullName', 'doctor:id,name', 'ward:id,name', 'bed:id,name']);

        if ($request->filled('status')) {
            $query->where('status', $request->string('status'));
        }
        if ($request->filled('patient')) {
            $query->where('patient_id', $request->string('patient'));
        }
        if ($request->filled('ward_id')) {
            $query->where('ward_id', $request->integer('ward_id'));
        }
        if ($request->filled('q')) {
            $search = trim((string) $request->string('q'));
            $query->whereHas('patient', function ($q) use ($search): void {
                $q->where('slug', 'like', "%{$search}%")
                    ->orWhere('fullName', 'like', "%{$search}%")
                    ->orWhere('firstName', 'like', "%{$search}%")
                    ->orWhere('lastName', 'like', "%{$search}%");
            });
        }

        $admissions = $query->latest()->paginate($request->integer('per_page', 15));

        return AdmissionResource::collection($admissions)->response();
    }

    public function history(Request $request): JsonResponse
    {
        $query = Admission::query()->with(['patient:id,slug,firstName,lastName,fullName', 'doctor:id,name', 'ward:id,name', 'bed:id,name']);
        if ($request->filled('status')) {
            $query->where('status', $request->string('status'));
        }
        if ($request->filled('q')) {
            $search = trim((string) $request->string('q'));
            $query->whereHas('patient', function ($q) use ($search): void {
                $q->where('slug', 'like', "%{$search}%")
                    ->orWhere('fullName', 'like', "%{$search}%")
                    ->orWhere('firstName', 'like', "%{$search}%")
                    ->orWhere('lastName', 'like', "%{$search}%");
            });
        }
        $admissions = $query->latest()->paginate($request->integer('per_page', 15));

        return AdmissionResource::collection($admissions)->response();
    }

    public function search(Request $request): JsonResponse
    {
        $search = trim((string) $request->query('q', ''));
        if ($search === '') {
            return response()->json(['data' => null]);
        }

        $admission = Admission::query()
            ->active()
            ->whereHas('patient', function ($q) use ($search): void {
                $q->where('slug', 'like', "%{$search}%")
                    ->orWhere('fullName', 'like', "%{$search}%")
                    ->orWhere('firstName', 'like', "%{$search}%")
                    ->orWhere('lastName', 'like', "%{$search}%");
            })
            ->with(['patient:id,slug,firstName,lastName,fullName', 'doctor:id,name'])
            ->latest()
            ->first();

        return response()->json(['data' => $admission ? [
            'id' => $admission->id,
            'patient_id' => $admission->patient_id,
            'patient_name' => $admission->patient?->fullName,
            'doctor_name' => $admission->doctor?->name,
            'ward_id' => $admission->ward_id,
            'status' => $admission->status,
        ] : null]);
    }

    public function dashboardCounts(): JsonResponse
    {
        $counts = [
            'pending' => Admission::query()->where('status', 'pending')->count(),
            'admitted' => Admission::query()->where('status', 'admitted')->count(),
            'discharged' => Admission::query()->where('status', 'discharged')->count(),
            'cancelled' => Admission::query()->where('status', 'cancelled')->count(),
        ];

        return response()->json(['data' => $counts]);
    }

    public function store(StoreAdmissionRequest $request): JsonResponse
    {
        $team = $request->attributes->get('currentTeam');
        $validated = $request->validated();
        $ward = Ward::query()->where('team_id', $team->id)->where('is_ward', true)->findOrFail($validated['ward_id']);
        $bedId = $validated['bed_id'] ?? null;

        $admission = DB::transaction(function () use ($team, $validated, $ward, $bedId): Admission {
            if ($bedId) {
                $bed = Ward::query()->where('team_id', $team->id)->where('is_ward', false)->where('ward_id', $ward->id)->lockForUpdate()->findOrFail($bedId);
                if ($bed->status === 'occupied' || $bed->bedAdmissions()->active()->exists()) {
                    throw ValidationException::withMessages(['bed_id' => 'Selected bed is not available.']);
                }
                $bed->update(['status' => 'occupied']);
            }

            return Admission::query()->create([
                'team_id' => $team->id,
                'patient_id' => $validated['patient_id'],
                'doctor_id' => $validated['doctor_id'] ?? null,
                'ward_id' => $ward->id,
                'bed_id' => $bedId,
                'status' => $bedId ? 'admitted' : 'pending',
                'duration' => $validated['duration'] ?? 1,
                'notes' => $validated['notes'] ?? null,
            ]);
        });

        return (new AdmissionResource($admission->load(['patient:id,slug,firstName,lastName,fullName', 'doctor:id,name', 'ward:id,name', 'bed:id,name'])))
            ->additional(['message' => 'Admission created.'])
            ->response()
            ->setStatusCode(201);
    }

    public function show(Admission $admission): AdmissionResource
    {
        $admission->loadMissing(['patient:id,slug,firstName,lastName', 'doctor:id,name', 'ward:id,name', 'bed:id,name']);

        return new AdmissionResource($admission);
    }

    public function admit(AdmitPatientRequest $request, Ward $ward): AdmissionResource
    {
        abort_unless($ward->is_ward, 404);
        $data = $request->validated();
        $targetWardId = $data['ward_id'] ?? $ward->getKey();

        $admission = DB::transaction(function () use ($data, $targetWardId): Admission {
            $bed = Ward::query()->whereKey($data['bed_id'])->lockForUpdate()->firstOrFail();
            if ($bed->is_ward || (int) $bed->ward_id !== (int) $targetWardId) {
                throw ValidationException::withMessages(['bed_id' => 'Choose a bed in the selected ward.']);
            }
            if ($bed->status === 'occupied' || $bed->bedAdmissions()->active()->exists()) {
                throw ValidationException::withMessages(['bed_id' => 'This bed is already occupied.']);
            }

            $admission = Admission::query()->whereKey($data['admission_id'])->lockForUpdate()->firstOrFail();
            if ($admission->status !== 'pending') {
                throw ValidationException::withMessages(['admission_id' => 'This admission is no longer waiting for a bed.']);
            }

            $admission->update([
                'ward_id' => $targetWardId,
                'bed_id' => $bed->getKey(),
                'status' => 'admitted',
                'notes' => $data['notes'] ?? $admission->notes,
            ]);
            $bed->update(['status' => 'occupied']);

            return $admission;
        });

        return new AdmissionResource($admission->fresh(['patient:id,slug,firstName,lastName', 'doctor:id,name', 'ward:id,name', 'bed:id,name']));
    }

    public function discharge(Admission $admission): AdmissionResource|JsonResponse
    {
        if ($admission->status !== 'admitted' || $admission->bed_id === null) {
            throw ValidationException::withMessages(['status' => 'This admission does not occupy a bed.']);
        }

        $wallet = (float) ($admission->patient?->wallet ?? 0);
        if ($wallet < 0) {
            throw ValidationException::withMessages(['wallet' => 'Cannot discharge: patient has an outstanding balance of '.DashboardCurrency::symbol().number_format(abs($wallet), 2)]);
        }

        DB::transaction(function () use ($admission): void {
            $bed = Ward::query()->whereKey($admission->bed_id)->lockForUpdate()->firstOrFail();
            $admission->update(['status' => 'discharged']);
            $bed->update(['status' => 'available']);
        });

        return new AdmissionResource($admission->fresh(['patient:id,slug,firstName,lastName', 'doctor:id,name', 'ward:id,name', 'bed:id,name']));
    }

    public function cancel(Admission $admission): AdmissionResource
    {
        if ($admission->status !== 'pending') {
            throw ValidationException::withMessages(['status' => 'This admission can only be cancelled while pending.']);
        }

        $admission->update(['status' => 'cancelled']);

        return new AdmissionResource($admission->fresh(['patient:id,slug,firstName,lastName', 'doctor:id,name', 'ward:id,name', 'bed:id,name']));
    }

    public function transfer(TransferAdmissionRequest $request, Admission $admission): AdmissionResource
    {
        if ($admission->status !== 'admitted' || $admission->bed_id === null) {
            throw ValidationException::withMessages(['status' => 'This admission does not occupy a bed.']);
        }

        $data = $request->validated();

        DB::transaction(function () use ($admission, $data): void {
            $targetBed = Ward::query()->whereKey($data['bed_id'])->lockForUpdate()->firstOrFail();
            if ($targetBed->is_ward || (int) $targetBed->ward_id !== (int) $data['ward_id']) {
                throw ValidationException::withMessages(['bed_id' => 'Choose a bed in the selected ward.']);
            }
            if ($targetBed->status === 'occupied' || $targetBed->bedAdmissions()->active()->exists()) {
                throw ValidationException::withMessages(['bed_id' => 'This bed is already occupied.']);
            }

            $currentBedId = $admission->bed_id;
            Ward::query()->whereKey($currentBedId)->lockForUpdate()->firstOrFail();

            $admission->update([
                'ward_id' => $data['ward_id'],
                'bed_id' => $data['bed_id'],
                'notes' => $data['notes'] ?? $admission->notes,
            ]);

            Ward::query()->whereKey($currentBedId)->update(['status' => 'available']);
            $targetBed->update(['status' => 'occupied']);
        });

        return new AdmissionResource($admission->fresh(['patient:id,slug,firstName,lastName', 'doctor:id,name', 'ward:id,name', 'bed:id,name']));
    }
}
