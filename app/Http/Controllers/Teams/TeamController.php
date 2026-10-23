<?php

namespace App\Http\Controllers\Teams;

use App\Actions\Teams\CreateTeam;
use App\Enums\TeamPermission;
use App\Enums\TeamRole;
use App\Http\Controllers\Controller;
use App\Http\Requests\Teams\DeleteTeamRequest;
use App\Http\Requests\Teams\SaveTeamRequest;
use App\Models\Membership;
use App\Models\Team;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class TeamController extends Controller
{
    /**
     * Display a listing of the user's teams.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();
        $query = trim((string) $request->query('q', ''));
        $perPage = in_array((int) $request->query('perPage', 25), [10, 25, 50, 100], true) ? (int) $request->query('perPage', 25) : 25;

        $teams = $user->teams()
            ->when($query !== '', function ($builder) use ($query) {
                $builder->where(function ($b) use ($query) {
                    $b->where('teams.name', 'like', "%{$query}%")
                        ->orWhere('teams.slug', 'like', "%{$query}%")
                        ->orWhere('teams.email', 'like', "%{$query}%")
                        ->orWhere('teams.phone', 'like', "%{$query}%")
                        ->orWhere('teams.mobile', 'like', "%{$query}%");
                });
            })
            ->orderBy('teams.name')
            ->paginate($perPage)
            ->withQueryString()
            ->through(function (Team $team) use ($user) {
                /** @var Membership|null $membership */
                $membership = $team->getRelation('pivot');
                $role = $membership?->role;
                $roleValue = $role instanceof TeamRole ? $role->value : (is_string($role) ? $role : null);
                $roleLabel = $role instanceof TeamRole ? $role->label() : ($roleValue ? ucfirst($roleValue) : null);

                return [
                    'id' => $team->id,
                    'name' => $team->name,
                    'slug' => $team->slug,
                    'isPersonal' => (bool) $team->is_personal,
                    'logo' => $team->logo ? Storage::disk('public')->url($team->logo) : null,
                    'phone' => $team->phone,
                    'mobile' => $team->mobile,
                    'email' => $team->email,
                    'address' => $team->address,
                    'createdAt' => $team->created_at?->toIso8601String(),
                    'updatedAt' => $team->updated_at?->toIso8601String(),
                    'role' => $roleValue,
                    'roleLabel' => $roleLabel,
                    'isCurrent' => $user->isCurrentTeam($team),
                    'canUpdate' => $user->hasTeamPermission($team, TeamPermission::UpdateTeam),
                    'canDelete' => $user->hasTeamPermission($team, TeamPermission::DeleteTeam) && ! $team->is_personal,
                    'canLeave' => ! $team->is_personal && $roleValue !== TeamRole::Owner->value,
                ];
            });

        return Inertia::render('teams/index', [
            'teamList' => $teams,
            'filters' => ['q' => $query, 'perPage' => $perPage],
        ]);
    }

    /**
     * Store a newly created team.
     */
    public function store(SaveTeamRequest $request, CreateTeam $createTeam): RedirectResponse
    {
        $data = $request->validated();
        if ($request->hasFile('logo')) {
            $data['logo'] = $request->file('logo')->store('teams', 'public');
        }

        $createTeam->handle($request->user(), $data);

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Team created.')]);

        return to_route('teams.index');
    }

    /**
     * Show the team edit page.
     */
    public function edit(Request $request, Team $team): Response
    {
        $user = $request->user();

        return Inertia::render('teams/edit', [
            'team' => [
                'id' => $team->id,
                'name' => $team->name,
                'slug' => $team->slug,
                'isPersonal' => $team->is_personal,
                'logo' => $team->logo ? Storage::disk('public')->url($team->logo) : null,
                'phone' => $team->phone,
                'mobile' => $team->mobile,
                'email' => $team->email,
                'address' => $team->address,
                'createdAt' => $team->created_at?->toIso8601String(),
                'updatedAt' => $team->updated_at?->toIso8601String(),
            ],
            'members' => $team->members()->get()->map(function (User $member) {
                /** @var Membership $membership */
                $membership = $member->getRelation('pivot');

                return [
                    'id' => $member->id,
                    'name' => $member->name,
                    'email' => $member->email,
                    'email_verified_at' => $member->email_verified_at?->toIso8601String(),
                    'created_at' => $member->created_at?->toIso8601String(),
                    'updated_at' => $member->updated_at?->toIso8601String(),
                    'avatar' => $member->avatar ?? null,
                    'role' => $membership->role->value,
                    'role_label' => $membership->role->label(),
                ];
            }),
            'invitations' => $team->invitations()
                ->whereNull('accepted_at')
                ->get()
                ->map(fn ($invitation) => [
                    'code' => $invitation->code,
                    'email' => $invitation->email,
                    'role' => $invitation->role->value,
                    'role_label' => $invitation->role->label(),
                    'created_at' => $invitation->created_at->toISOString(),
                ]),
            'permissions' => $user->toTeamPermissions($team),
            'availableRoles' => TeamRole::assignable(),
        ]);
    }

    /**
     * Update the specified team.
     */
    public function update(SaveTeamRequest $request, Team $team): RedirectResponse
    {
        Gate::authorize('update', $team);

        $team = DB::transaction(function () use ($request, $team) {
            $team = Team::whereKey($team->id)->lockForUpdate()->firstOrFail();

            $data = $request->validated();
            if ($request->hasFile('logo')) {
                if ($team->logo) {
                    Storage::disk('public')->delete($team->logo);
                }
                $data['logo'] = $request->file('logo')->store('teams', 'public');
            }

            $team->update($data);

            return $team;
        });

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Team updated.')]);

        return to_route('teams.edit', ['team' => $team->slug]);
    }

    /**
     * Switch the user's current team.
     */
    public function switch(Request $request, Team $team): RedirectResponse
    {
        abort_unless($request->user()->belongsToTeam($team), 403);

        $request->user()->switchTeam($team);

        return back();
    }

    /**
     * Leave the specified team.
     */
    public function leave(Request $request, Team $team): RedirectResponse
    {
        Gate::authorize('leave', $team);

        $user = $request->user();

        $fallbackTeam = $user->isCurrentTeam($team)
            ? $user->fallbackTeam($team)
            : null;

        $team->memberships()
            ->where('user_id', $user->id)
            ->delete();

        if ($fallbackTeam) {
            $user->switchTeam($fallbackTeam);
        }

        Inertia::flash('toast', ['type' => 'success', 'message' => __('You left the team ":name"', ['name' => $team->name])]);

        return to_route('teams.index');
    }

    /**
     * Delete the specified team.
     */
    public function destroy(DeleteTeamRequest $request, Team $team): RedirectResponse
    {
        $user = $request->user();
        $fallbackTeam = $user->isCurrentTeam($team)
            ? $user->fallbackTeam($team)
            : null;

        DB::transaction(function () use ($user, $team) {
            User::where('current_team_id', $team->id)
                ->where('id', '!=', $user->id)
                ->each(fn (User $affectedUser) => $affectedUser->switchTeam($affectedUser->personalTeam()));

            $team->invitations()->delete();
            $team->memberships()->delete();
            if ($team->logo) {
                Storage::disk('public')->delete($team->logo);
            }
            $team->delete();
        });

        if ($fallbackTeam) {
            $user->switchTeam($fallbackTeam);
        }

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Team deleted.')]);

        return to_route('teams.index');
    }

    /**
     * Bulk delete specified teams.
     */
    public function bulkDestroy(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'ids' => ['required', 'array', 'min:1'],
            'ids.*' => ['integer', Rule::exists('teams', 'id')],
        ]);

        $user = $request->user();
        $teams = Team::query()->whereIn('id', $data['ids'])->get();

        foreach ($teams as $team) {
            if ($team->is_personal || ! $user->ownsTeam($team)) {
                continue;
            }

            $fallbackTeam = $user->isCurrentTeam($team)
                ? $user->fallbackTeam($team)
                : null;

            DB::transaction(function () use ($user, $team) {
                User::where('current_team_id', $team->id)
                    ->where('id', '!=', $user->id)
                    ->each(fn (User $affectedUser) => $affectedUser->switchTeam($affectedUser->personalTeam()));

                $team->invitations()->delete();
                $team->memberships()->delete();
                if ($team->logo) {
                    Storage::disk('public')->delete($team->logo);
                }
                $team->delete();
            });

            if ($fallbackTeam && $user->isCurrentTeam($team)) {
                $user->switchTeam($fallbackTeam);
            }
        }

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Selected teams deleted.')]);

        return to_route('teams.index');
    }
}
