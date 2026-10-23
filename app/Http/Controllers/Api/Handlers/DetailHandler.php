<?php

namespace App\Http\Controllers\Api\Handlers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

abstract class DetailHandler extends Handler
{
    public static ?string $uri = '/{id}';

    public static string $method = self::GET;

    /**
     * Get the record addressed by the request.
     */
    public function detail(Request $request): JsonResponse|JsonResource
    {
        $model = $this->findModel($request);

        if (! $model) {
            return static::sendNotFoundResponse();
        }

        return new (static::getApiTransformer())($model);
    }
}
