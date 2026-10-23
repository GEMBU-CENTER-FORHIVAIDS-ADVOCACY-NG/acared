<?php

namespace App\Http\Controllers\Api\Resources\Users\Handlers;

use App\Enums\TeamRole;
use App\Http\Controllers\Api\Handlers\CreateHandler as BaseCreateHandler;
use App\Http\Controllers\Api\Resources\Users\Requests\CreateUserRequest;
use App\Http\Controllers\Api\Resources\Users\UserApiService;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\JsonResponse;

class CreateHandler extends BaseCreateHandler
{
    public static ?string $uri = '/';

    public static ?string $resource = UserApiService::class;

    /**
     * Create a user record.
     */
    public function handler(CreateUserRequest $request): JsonResponse
    {
        return $this->create($request->validated());
    }

    /**
     * Attach the new user to the current team.
     */
    protected function afterCreate(Model $model): void
    {
        $team = request()->user()?->currentTeam;

        if (! $team) {
            return;
        }

        $team->members()->attach($model, ['role' => TeamRole::Member->value]);

        $model->forceFill(['current_team_id' => $team->getKey()])->save();
    }
}
