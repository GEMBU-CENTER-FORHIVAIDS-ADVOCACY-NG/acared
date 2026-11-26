<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\Api\V1\TeamResource;
use App\Models\Team;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TeamController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user()->loadMissing('teams');

        return TeamResource::collection($user->teams)->response();
    }

    public function show(Request $request, Team $team): TeamResource|JsonResponse
    {
        $user = $request->user();

        if (! $user->belongsToTeam($team)) {
            return response()->json(['message' => 'Not found.'], 404);
        }

        return new TeamResource($team);
    }
}
