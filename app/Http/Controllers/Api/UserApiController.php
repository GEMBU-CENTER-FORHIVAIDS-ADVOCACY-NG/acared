<?php

namespace App\Http\Controllers\Api;

use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UserApiController
{
    public function index(Request $request): JsonResponse
    {
        $team = $request->user()->currentTeam;

        $users = User::query()
            ->whereHas('teams', fn (Builder $query) => $query->whereKey($team->getKey()))
            ->paginate();

        return response()->json([
            'data' => $users->items(),
            'links' => [
                'first' => $users->url(1),
                'last' => $users->url($users->lastPage()),
                'prev' => $users->previousPageUrl(),
                'next' => $users->nextPageUrl(),
            ],
            'meta' => [
                'current_page' => $users->currentPage(),
                'from' => $users->firstItem(),
                'last_page' => $users->lastPage(),
                'per_page' => $users->perPage(),
                'to' => $users->lastItem(),
                'total' => $users->total(),
            ],
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'name' => 'required|string',
            'email' => 'required|email|unique:users',
            'password' => 'required|string|min:8',
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => $request->password,
            'current_team_id' => $request->user()->currentTeam->getKey(),
        ]);

        $user->teams()->attach($request->user()->currentTeam->getKey(), ['role' => 'member']);

        $userData = $user->toArray();
        unset($userData['password']);

        return response()->json([
            'message' => 'Successfully Create Resource',
            'data' => $userData,
        ]);
    }

    public function show(Request $request, User $user): JsonResponse
    {
        return response()->json([
            'data' => $user,
        ]);
    }
}
