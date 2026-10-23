<?php

namespace App\Http\Controllers\Api\Handlers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

abstract class DeleteHandler extends Handler
{
    public static ?string $uri = '/{id}';

    public static string $method = self::DELETE;

    /**
     * Delete the record addressed by the request.
     */
    public function delete(Request $request): JsonResponse
    {
        $model = $this->findModel($request);

        if (! $model) {
            return static::sendNotFoundResponse();
        }

        $model->delete();

        return static::sendSuccessResponse($model, 'Successfully Delete Resource');
    }
}
