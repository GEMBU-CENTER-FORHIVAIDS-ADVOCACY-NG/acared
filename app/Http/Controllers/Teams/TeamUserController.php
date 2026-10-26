<?php

namespace App\Http\Controllers\Teams;

use App\Enums\TeamRole;
use App\Http\Controllers\Controller;
use App\Http\Requests\Teams\StoreTeamUserRequest;
use App\Models\Team;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Role;

class TeamUserController extends Controller
{
    /**
     * Display all users belonging to the current team.
     */
    public function index(Team $team): Response
    {
        Gate::authorize('view', $team);

        $members = $team->members()->orderBy('name')->get()->map(function (User $user) {
            $membership = $user->getRelation('pivot');

            return [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'email_verified_at' => $user->email_verified_at?->toIso8601String(),
                'created_at' => $user->created_at?->toIso8601String(),
                'updated_at' => $user->updated_at?->toIso8601String(),
                'avatar' => $user->avatar ?? null,
                'role' => $membership->role->value,
                'role_label' => $membership->role->label(),
                'spatieRoles' => $user->getRoleNames()->toArray(),
            ];
        });

        $spatieRoles = Role::orderBy('name')->get()->map(fn ($role) => [
            'id' => $role->id,
            'name' => $role->name,
        ]);

        return Inertia::render('teams/users/index', [
            'team' => [
                'id' => $team->id,
                'name' => $team->name,
                'slug' => $team->slug,
            ],
            'members' => $members,
            'availableTeamRoles' => TeamRole::assignable(),
            'spatieRoles' => $spatieRoles,
            'permissions' => auth()->user()->toTeamPermissions($team),
        ]);
    }

    /**
     * Store a newly created user and add them to the team.
     */
    public function store(StoreTeamUserRequest $request, Team $team): RedirectResponse
    {
        Gate::authorize('addMember', $team);

        $data = $request->validated();

        $user = User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => Hash::make($data['password']),
        ]);

        $team->memberships()->create([
            'user_id' => $user->id,
            'role' => TeamRole::from($data['team_role']),
        ]);

        if (! empty($data['spatie_roles'] ?? [])) {
            $user->syncRoles($data['spatie_roles']);
        }

        Inertia::flash('toast', ['type' => 'success', 'message' => __('User created and added to the team.')]);

        return to_route('teams.users.index', ['team' => $team->slug]);
    }
}
