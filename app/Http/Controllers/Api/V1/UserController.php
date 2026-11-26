<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\Api\V1\UserResource;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UserController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $team = $request->attributes->get('currentTeam');

        $users = User::query()
            ->whereHas('teams', fn ($query) => $query->whereKey($team->id))
            ->orderBy('name')
            ->paginate($request->integer('per_page', 15));

        return UserResource::collection($users)->response();
    }

    public function show(Request $request, User $user): UserResource|JsonResponse
    {
        $team = $request->attributes->get('currentTeam');

        if (! $user->belongsToTeam($team)) {
            return response()->json(['message' => 'Not found.'], 404);
        }

        return new UserResource($user);
    }
}
