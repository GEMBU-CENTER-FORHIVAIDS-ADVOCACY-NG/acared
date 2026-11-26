<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureApiPermission
{
    /**
     * Accepts a single permission or pipe-separated alternatives.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next, string $permission): Response
    {
        $user = $request->user();

        if (! $user) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        // Legacy/mobile compatibility: opt-in only. Default is enforced.
        if (config('api_v1.allow_roleless_permission_pass', false)
            && method_exists($user, 'roles')
            && $user->roles->isEmpty()) {
            return $next($request);
        }

        $permissions = array_filter(array_map('trim', explode('|', $permission)));
        foreach ($permissions as $candidate) {
            if ($user->can($candidate)) {
                return $next($request);
            }
        }

        return response()->json(['message' => 'Forbidden.'], 403);
    }
}
