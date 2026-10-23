<?php

namespace App\Http\Controllers\Api\Handlers;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\JsonResponse;

abstract class CreateHandler extends Handler
{
    public static ?string $uri = '/';

    public static string $method = self::POST;

    /**
     * Create a record from the validated payload.
     *
     * @param  array<string, mixed>  $attributes
     */
    public function create(array $attributes): JsonResponse
    {
        $model = new (static::getModel());

        $model->fill($attributes);

        $this->applyTeamScope($model);

        $model->save();

        $this->afterCreate($model);

        return static::sendSuccessResponse($model, 'Successfully Create Resource');
    }

    /**
     * Perform additional actions once the record is created.
     */
    protected function afterCreate(Model $model): void
    {
        //
    }

    /**
     * Attach the record to the team of the authenticated user.
     */
    protected function applyTeamScope(Model $model): void
    {
        if (! static::getResource()::isScopedToTeam()) {
            return;
        }

        $model->setAttribute('team_id', $this->currentTeamId());
    }
}
