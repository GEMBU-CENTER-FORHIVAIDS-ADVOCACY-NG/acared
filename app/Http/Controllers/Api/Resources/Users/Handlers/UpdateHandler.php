<?php

namespace App\Http\Controllers\Api\Resources\Users\Handlers;

use App\Http\Controllers\Api\Handlers\UpdateHandler as BaseUpdateHandler;
use App\Http\Controllers\Api\Resources\Users\Requests\UpdateUserRequest;
use App\Http\Controllers\Api\Resources\Users\UserApiService;
use Illuminate\Http\JsonResponse;

class UpdateHandler extends BaseUpdateHandler
{
    public static ?string $uri = '/{id}';

    public static ?string $resource = UserApiService::class;

    /**
     * Update a user record.
     */
    public function handler(UpdateUserRequest $request): JsonResponse
    {
        return $this->update($request, $request->validated());
    }
}
