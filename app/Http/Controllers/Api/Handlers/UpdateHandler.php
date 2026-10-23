<?php

namespace App\Http\Controllers\Api\Handlers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

abstract class UpdateHandler extends Handler
{
    public static ?string $uri = '/{id}';

    public static string $method = self::PUT;

    /**
     * Update the record addressed by the request with the validated payload.
     *
     * @param  array<string, mixed>  $attributes
     */
    public function update(Request $request, array $attributes): JsonResponse
    {
        $model = $this->findModel($request);

        if (! $model) {
            return static::sendNotFoundResponse();
        }

        $model->fill($attributes);

        $model->save();

        return static::sendSuccessResponse($model, 'Successfully Update Resource');
    }
}
