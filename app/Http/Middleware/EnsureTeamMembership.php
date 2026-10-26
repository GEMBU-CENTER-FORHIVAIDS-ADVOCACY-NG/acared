<?php

namespace App\Http\Middleware;

use App\Enums\TeamRole;
use App\Models\Team;
use App\Models\User;
use Closure;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureTeamMembership
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next, ?string $minimumRole = null): Response
    {
        [$user, $team] = [$request->user(), $this->team($request)];

        // If the user is authenticated but has no team resolved from the route,
        // try to switch to their first available team.
        if ($user && $team === null) {
            $firstTeam = $user->teams->first();

            if ($firstTeam) {
                $user->switchTeam($firstTeam);
                $team = $firstTeam;
            }
        }

        if (! $user || ! $team || ! $user->belongsToTeam($team)) {
            return redirect()->route('forbidden')->with('error', 'You do not have access to this resource.');
        }

        $forbiddenRedirect = $this->ensureTeamMemberHasRequiredRole($user, $team, $minimumRole);
        if ($forbiddenRedirect !== null) {
            return $forbiddenRedirect;
        }

        if ($request->route('current_team') && ! $user->isCurrentTeam($team)) {
            $user->switchTeam($team);
        }

        return $next($request);
    }

    /**
     * Ensure the given user has at least the given role, if applicable.
     */
    protected function ensureTeamMemberHasRequiredRole(User $user, Team $team, ?string $minimumRole): ?RedirectResponse
    {
        if ($minimumRole === null) {
            return null;
        }

        $role = $user->teamRole($team);

        $requiredRole = TeamRole::tryFrom($minimumRole);

        if ($requiredRole === null || $role === null || ! $role->isAtLeast($requiredRole)) {
            return redirect()->route('forbidden')->with('error', 'You do not have access to this resource.');
        }

        return null;
    }

    /**
     * Get the team associated with the request.
     */
    protected function team(Request $request): ?Team
    {
        $team = $request->route('current_team') ?? $request->route('team');

        if (is_string($team)) {
            $team = Team::where('slug', $team)->first();
        }

        return $team;
    }
}
