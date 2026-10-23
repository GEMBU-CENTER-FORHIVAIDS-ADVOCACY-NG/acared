<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\Requests\LoginRequest;
use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AuthController extends Controller
{
    /**
     * Exchange the given credentials for an API token.
     */
    public function login(LoginRequest $request): JsonResponse
    {
        if (! Auth::validate($request->validated())) {
            return response()->json([
                'success' => false,
                'message' => 'The provided credentials are incorrect.',
            ], 401);
        }

        $user = Auth::getLastAttempted();

        if (! $user instanceof User) {
            return response()->json([
                'success' => false,
                'message' => 'The provided credentials are incorrect.',
            ], 401);
        }

        return response()->json([
            'success' => true,
            'message' => 'Login success.',
            'token' => $user->createToken($request->header('User-Agent') ?: 'api', ['*'])->plainTextToken,
            'team' => $user->currentTeam,
            'teams' => $user->teams,
        ], 201);
    }

    /**
     * Revoke the token used to authenticate the request.
     */
    public function logout(Request $request): JsonResponse
    {
        $user = $request->user();

        if ($user instanceof User) {
            $user->currentAccessToken()->delete();
        }

        return response()->json([
            'success' => true,
            'message' => 'Logout success.',
        ]);
    }

    /**
     * Get the user authenticated by the request.
     */
    public function user(Request $request): JsonResponse
    {
        return response()->json($request->user());
    }
}
