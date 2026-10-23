<?php

namespace App\Http\Controllers\Api\Resources\Users\Handlers;

use App\Http\Controllers\Api\Handlers\DeleteHandler as BaseDeleteHandler;
use App\Http\Controllers\Api\Resources\Users\UserApiService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DeleteHandler extends BaseDeleteHandler
{
    public static ?string $uri = '/{id}';

    public static ?string $resource = UserApiService::class;

    /**
     * Delete a user record.
     */
    public function handler(Request $request): JsonResponse
    {
        return $this->delete($request);
    }
}
