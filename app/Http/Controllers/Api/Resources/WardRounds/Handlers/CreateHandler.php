<?php

namespace App\Http\Controllers\Api\Resources\WardRounds\Handlers;

use App\Http\Controllers\Api\Handlers\CreateHandler as BaseCreateHandler;
use App\Http\Controllers\Api\Resources\WardRounds\Requests\CreateWardRoundRequest;
use App\Http\Controllers\Api\Resources\WardRounds\WardRoundApiService;
use Illuminate\Http\JsonResponse;

class CreateHandler extends BaseCreateHandler
{
    public static ?string $uri = '/';

    public static ?string $resource = WardRoundApiService::class;

    /**
     * Create a ward round record.
     */
    public function handler(CreateWardRoundRequest $request): JsonResponse
    {
        return $this->create($request->validated());
    }
}
