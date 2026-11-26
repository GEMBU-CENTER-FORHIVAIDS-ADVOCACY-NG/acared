<?php

namespace App\Http\Middleware;

use App\Models\Team;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SetApiTeamContext
{
    /**
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (! $user) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        $team = $this->resolveTeam($request);

        if (! $team) {
            return response()->json([
                'message' => 'Team context is required. Provide X-Team-Slug or X-Team-ID header.',
            ], 400);
        }

        if (! $user->belongsToTeam($team)) {
            return response()->json([
                'message' => 'You do not have access to this team.',
            ], 403);
        }

        $user->setRelation('currentTeam', $team);
        $request->attributes->set('currentTeam', $team);

        return $next($request);
    }

    protected function resolveTeam(Request $request): ?Team
    {
        $slug = $request->header('X-Team-Slug');
        if (is_string($slug) && $slug !== '') {
            return Team::query()->where('slug', $slug)->first();
        }

        $id = $request->header('X-Team-ID');
        if (is_string($id) && ctype_digit($id)) {
            return Team::query()->find((int) $id);
        }

        return null;
    }
}
