<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Authorize the incoming request based on the resource permission.
 *
 * Usage: EnsurePermission::class.':patient'
 * or in route group: ['middleware' => ['permission:viewAny patient']]
 */
class EnsurePermission
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next, string $permission): Response
    {
        $user = $request->user();

        // Allow if no user is authenticated (unauthenticated routes)
        if (! $user) {
            return $next($request);
        }

        // Allow if the user has no roles assigned (super admin behavior)
        if (method_exists($user, 'roles') && $user->roles->isEmpty()) {
            return $next($request);
        }

        // Check if the user has the required permission
        if ($user->can($permission)) {
            return $next($request);
        }

        return redirect()->route('forbidden')->with('error', 'You do not have permission to access this resource.');
    }
}
