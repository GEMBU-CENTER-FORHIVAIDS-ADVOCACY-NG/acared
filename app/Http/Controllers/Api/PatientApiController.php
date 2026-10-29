<?php

namespace App\Http\Controllers\Api;

use App\Models\Patient;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class PatientApiController
{
    public function index(Request $request): JsonResponse
    {
        $patients = Patient::query()->paginate();

        return response()->json([
            'data' => $patients->items(),
            'links' => [
                'first' => $patients->url(1),
                'last' => $patients->url($patients->lastPage()),
                'prev' => $patients->previousPageUrl(),
                'next' => $patients->nextPageUrl(),
            ],
            'meta' => [
                'current_page' => $patients->currentPage(),
                'from' => $patients->firstItem(),
                'last_page' => $patients->lastPage(),
                'per_page' => $patients->perPage(),
                'to' => $patients->lastItem(),
                'total' => $patients->total(),
            ],
        ]);
    }

    public function show(Request $request, Patient $patient): JsonResponse
    {
        if ($patient->team_id !== $request->user()->currentTeam->getKey()) {
            return response()->json([
                'message' => 'Not found.',
            ], 404);
        }

        return response()->json([
            'data' => $patient,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'category_id' => 'required|integer',
            'firstName' => 'required|string',
            'lastName' => 'required|string',
            'gender' => 'required|string',
            'birthDate' => 'required|date',
            'phone' => 'required|string',
            'country_id' => 'required|integer',
            'state_id' => 'required|integer',
            'lga_id' => 'required|integer',
            'address' => 'required|string',
        ]);

        $slug = 'PAT-'.Str::upper(Str::random(8));

        $patient = Patient::create([
            'team_id' => $request->user()->currentTeam->getKey(),
            'category_id' => $request->category_id,
            'slug' => $slug,
            'firstName' => $request->firstName,
            'lastName' => $request->lastName,
            'gender' => $request->gender,
            'birthDate' => $request->birthDate,
            'phone' => $request->phone,
            'country_id' => $request->country_id,
            'state_id' => $request->state_id,
            'lga_id' => $request->lga_id,
            'address' => $request->address,
        ]);

        return response()->json([
            'message' => 'Successfully Create Resource',
            'data' => $patient,
        ]);
    }
}
