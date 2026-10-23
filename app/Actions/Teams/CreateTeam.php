<?php

namespace App\Actions\Teams;

use App\Enums\TeamRole;
use App\Models\Team;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class CreateTeam
{
    /**
     * Create a new team and add the user as owner.
     *
     * @param  array<string, mixed>|string  $attributes
     */
    public function handle(User $user, array|string $attributes, bool $isPersonal = false): Team
    {
        $data = is_array($attributes) ? $attributes : ['name' => $attributes];

        return DB::transaction(function () use ($user, $data, $isPersonal) {
            $team = Team::create(array_merge($data, [
                'is_personal' => $isPersonal,
            ]));

            $team->memberships()->create([
                'user_id' => $user->id,
                'role' => TeamRole::Owner,
            ]);

            $user->switchTeam($team);

            return $team;
        });
    }
}
