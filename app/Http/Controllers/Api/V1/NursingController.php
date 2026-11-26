<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\StoreNursingRequest;
use App\Http\Requests\Api\V1\StoreNursingVitalsRequest;
use App\Http\Requests\Api\V1\TransferNursingRequest;
use App\Http\Resources\Api\V1\NursingResource;
use App\Models\Appointment;
use App\Models\Consultation;
use App\Models\Nursing;
use App\Models\PriceList;
use App\Models\Vital;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class NursingController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Nursing::query()->with(['patient:id,slug,firstName,lastName', 'nurse:id,name']);

        if ($request->filled('status')) {
            $query->where('status', $request->string('status'));
        }
        if ($request->filled('patient')) {
            $query->where('patient_id', $request->string('patient'));
        }

        $nursings = $query->latest()->paginate($request->integer('per_page', 15));

        return NursingResource::collection($nursings)->response();
    }

    public function store(StoreNursingRequest $request): JsonResponse
    {
        $team = $request->attributes->get('currentTeam');
        $data = $request->validated();

        $nursing = Nursing::query()->create([
            ...$data,
            'team_id' => $team->id,
            'user_id' => $request->user()->id,
            'status' => $data['status'] ?? 'scheduled',
        ]);

        return (new NursingResource($nursing->load(['patient:id,slug,firstName,lastName', 'nurse:id,name'])))->response()->setStatusCode(201);
    }

    public function show(Nursing $nursing): NursingResource
    {
        $nursing->loadMissing(['patient:id,slug,firstName,lastName', 'nurse:id,name', 'vitals']);

        return new NursingResource($nursing);
    }

    public function start(Nursing $nursing): NursingResource
    {
        if ($nursing->status === 'completed') {
            throw ValidationException::withMessages(['status' => 'Completed nursing records cannot be started.']);
        }

        $nursing->update(['status' => 'in_progress', 'starts_at' => $nursing->starts_at ?? now()]);

        return new NursingResource($nursing->fresh(['patient:id,slug,firstName,lastName', 'nurse:id,name']));
    }

    public function storeVitals(StoreNursingVitalsRequest $request, Nursing $nursing): JsonResponse
    {
        $team = $request->attributes->get('currentTeam');
        $vital = Vital::query()->create([
            'team_id' => $team->id,
            'patient_id' => $nursing->patient_id,
            'nursing_id' => $nursing->id,
            'user_id' => $request->user()->id,
        ]);

        foreach ($request->validated('vital_signs') as $sign) {
            $priceList = PriceList::query()->find($sign['price_list_id']);
            $vital->lines()->create([
                'team_id' => $team->id,
                'patient_id' => $nursing->patient_id,
                'user_id' => $request->user()->id,
                'price_list_id' => $sign['price_list_id'],
                'results' => $sign['results'],
                'unitPrice' => $priceList?->price ?? 0,
                'quantity' => 1,
            ]);
        }

        $nursing->update([
            'status' => 'in_progress',
            'starts_at' => $nursing->starts_at ?? now(),
        ]);

        return (new NursingResource($nursing->fresh(['patient:id,slug,firstName,lastName', 'nurse:id,name', 'vitals'])))->response()->setStatusCode(201);
    }

    public function complete(Nursing $nursing): NursingResource
    {
        $nursing->update(['status' => 'completed', 'ends_at' => now()]);

        return new NursingResource($nursing->fresh(['patient:id,slug,firstName,lastName', 'nurse:id,name']));
    }

    public function transfer(TransferNursingRequest $request, Nursing $nursing): JsonResponse
    {
        $validated = $request->validated();

        if ($validated['transferTo'] === 'nurse') {
            $nursing->update(['nurse_id' => $validated['nurse_id']]);

            return (new NursingResource($nursing->fresh(['patient:id,slug,firstName,lastName', 'nurse:id,name'])))
                ->response();
        }

        $now = now();
        $appointment = Appointment::query()->create([
            'team_id' => $nursing->team_id,
            'billing_id' => $nursing->billing_id,
            'patient_id' => $nursing->patient_id,
            'doctor_id' => $validated['doctor_id'],
            'starts_at' => $now,
            'ends_at' => $now->copy()->addHour(),
            'status' => 'scheduled',
        ]);

        $consultation = Consultation::query()->create([
            'team_id' => $nursing->team_id,
            'billing_id' => $nursing->billing_id,
            'patient_id' => $nursing->patient_id,
            'doctor_id' => $validated['doctor_id'],
            'appointment_id' => $appointment->getKey(),
            'starts_at' => $now,
            'ends_at' => $now->copy()->addHour(),
            'status' => 'scheduled',
        ]);

        return response()->json([
            'data' => (new NursingResource($nursing->fresh(['patient:id,slug,firstName,lastName', 'nurse:id,name'])))->resolve($request),
            'meta' => [
                'transferred_to' => 'doctor',
                'appointment_id' => $appointment->id,
                'consultation_id' => $consultation->id,
            ],
        ]);
    }
}
