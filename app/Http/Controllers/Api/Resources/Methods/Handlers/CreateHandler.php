<?php

namespace App\Http\Controllers\Api\Resources\Methods\Handlers;

use App\Http\Controllers\Api\Handlers\CreateHandler as BaseCreateHandler;
use App\Http\Controllers\Api\Resources\Methods\MethodApiService;
use App\Http\Controllers\Api\Resources\Methods\Requests\CreateMethodRequest;
use Illuminate\Http\JsonResponse;

class CreateHandler extends BaseCreateHandler
{
    public static ?string $uri = '/';

    public static ?string $resource = MethodApiService::class;

    /**
     * Create a method record.
     */
    public function handler(CreateMethodRequest $request): JsonResponse
    {
        return $this->create($request->validated());
    }
}
