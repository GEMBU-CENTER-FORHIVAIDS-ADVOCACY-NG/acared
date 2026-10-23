<?php

namespace App\Http\Controllers\Api\Resources\Methods\Handlers;

use App\Http\Controllers\Api\Handlers\UpdateHandler as BaseUpdateHandler;
use App\Http\Controllers\Api\Resources\Methods\MethodApiService;
use App\Http\Controllers\Api\Resources\Methods\Requests\UpdateMethodRequest;
use Illuminate\Http\JsonResponse;

class UpdateHandler extends BaseUpdateHandler
{
    public static ?string $uri = '/{id}';

    public static ?string $resource = MethodApiService::class;

    /**
     * Update a method record.
     */
    public function handler(UpdateMethodRequest $request): JsonResponse
    {
        return $this->update($request, $request->validated());
    }
}
