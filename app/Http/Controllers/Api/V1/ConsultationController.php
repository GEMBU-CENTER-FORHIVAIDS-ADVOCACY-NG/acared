<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\StoreConsultationRequest;
use App\Http\Requests\Api\V1\TransferConsultationRequest;
use App\Http\Resources\Api\V1\ConsultationResource;
use App\Models\Consultation;
use App\Models\Nursing;
use Carbon\CarbonImmutable;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class ConsultationController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Consultation::query()->with(['patient:id,slug,firstName,lastName', 'doctor:id,name']);

        if ($request->filled('status')) {
            $query->where('status', $request->string('status'));
        }
        if ($request->filled('patient')) {
            $query->where('patient_id', $request->string('patient'));
        }

        $consultations = $query->latest()->paginate($request->integer('per_page', 15));

        return ConsultationResource::collection($consultations)->response();
    }

    public function store(StoreConsultationRequest $request): JsonResponse
    {
        $team = $request->attributes->get('currentTeam');
        $data = $request->validated();
        $startsAt = isset($data['starts_at']) ? CarbonImmutable::parse($data['starts_at']) : now();
        $endsAt = isset($data['ends_at']) ? CarbonImmutable::parse($data['ends_at']) : $startsAt->addMinutes(Consultation::DEFAULT_DURATION_MINUTES);

        $consultation = DB::transaction(fn () => Consultation::query()->create([
            'team_id' => $team->id,
            'patient_id' => $data['patient_id'],
            'doctor_id' => $data['doctor_id'] ?? null,
            'billing_id' => $data['billing_id'] ?? null,
            'user_id' => $request->user()->id,
            'purpose' => $data['purpose'] ?? null,
            'status' => $data['status'] ?? 'scheduled',
            'starts_at' => $startsAt,
            'ends_at' => $endsAt,
        ]));

        $consultation->load(['patient:id,slug,firstName,lastName', 'doctor:id,name']);

        return (new ConsultationResource($consultation))
            ->additional(['message' => 'Consultation created.'])
            ->response()
            ->setStatusCode(201);
    }

    public function show(Consultation $consultation): ConsultationResource
    {
        $consultation->loadMissing(['patient:id,slug,firstName,lastName', 'doctor:id,name', 'appointment:id,starts_at,ends_at,status']);

        return new ConsultationResource($consultation);
    }

    public function start(Consultation $consultation): ConsultationResource
    {
        if ($consultation->status === 'completed') {
            throw ValidationException::withMessages(['status' => 'Completed consultations cannot be started.']);
        }

        $consultation->update(['status' => 'started', 'starts_at' => $consultation->starts_at ?? now()]);

        return new ConsultationResource($consultation->fresh(['patient:id,slug,firstName,lastName', 'doctor:id,name']));
    }

    public function end(Consultation $consultation): ConsultationResource
    {
        if ($consultation->status !== 'started') {
            throw ValidationException::withMessages(['status' => 'Only started consultations can be completed.']);
        }

        $consultation->update(['status' => 'completed', 'ends_at' => now()]);

        return new ConsultationResource($consultation->fresh(['patient:id,slug,firstName,lastName', 'doctor:id,name']));
    }

    public function transfer(TransferConsultationRequest $request, Consultation $consultation): JsonResponse
    {
        $validated = $request->validated();

        if ($validated['transferTo'] === 'doctor') {
            $consultation->update(['doctor_id' => $validated['doctor_id']]);

            return (new ConsultationResource($consultation->fresh(['patient:id,slug,firstName,lastName', 'doctor:id,name'])))->response();
        }

        $now = now();
        $nursing = Nursing::query()->create([
            'team_id' => $consultation->team_id,
            'billing_id' => $consultation->billing_id,
            'patient_id' => $consultation->patient_id,
            'nurse_id' => $validated['nurse_id'],
            'starts_at' => $now,
            'ends_at' => $now->copy()->addHour(),
            'status' => 'scheduled',
            'user_id' => $request->user()->id,
        ]);

        return response()->json([
            'data' => (new ConsultationResource($consultation->fresh(['patient:id,slug,firstName,lastName', 'doctor:id,name'])))->resolve($request),
            'meta' => [
                'transferred_to' => 'nurse',
                'nursing_id' => $nursing->id,
            ],
        ]);
    }
}
