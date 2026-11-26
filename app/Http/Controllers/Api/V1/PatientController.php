<?php

namespace App\Http\Controllers\Api\V1;

use App\Concerns\PatientFormOptions;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\StorePatientRequest;
use App\Http\Requests\Api\V1\UpdatePatientRequest;
use App\Http\Resources\Api\V1\PatientResource;
use App\Models\Patient;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class PatientController extends Controller
{
    use PatientFormOptions;

    public function index(Request $request): JsonResponse
    {
        $query = Patient::query()->with(['category:id,name']);

        if ($request->filled('q')) {
            $q = $request->string('q')->toString();
            $query->where(function ($builder) use ($q) {
                $builder->where('firstName', 'like', "%{$q}%")
                    ->orWhere('lastName', 'like', "%{$q}%")
                    ->orWhere('slug', 'like', "%{$q}%")
                    ->orWhere('phone', 'like', "%{$q}%");
            });
        }

        $patients = $query->latest()->paginate($request->integer('per_page', 15));

        return PatientResource::collection($patients)->response();
    }

    public function store(StorePatientRequest $request): JsonResponse
    {
        $patient = Patient::query()->create([
            ...$request->validated(),
            'team_id' => $request->attributes->get('currentTeam')->id,
            'slug' => 'PAT-'.Str::upper(Str::random(8)),
        ]);

        return (new PatientResource($patient->load('category:id,name')))->response()->setStatusCode(201);
    }

    public function show(Patient $patient): PatientResource
    {
        $patient->loadMissing(['category:id,name', 'country:id,name', 'state:id,name', 'lga:id,name,state_id']);

        return new PatientResource($patient);
    }

    public function update(UpdatePatientRequest $request, Patient $patient): PatientResource
    {
        $patient->update($request->validated());

        return new PatientResource($patient->fresh(['category:id,name']));
    }

    public function formOptions(): JsonResponse
    {
        return response()->json(['data' => $this->patientFormOptions()]);
    }
}
