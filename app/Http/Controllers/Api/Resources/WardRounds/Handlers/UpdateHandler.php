<?php

namespace App\Http\Controllers\Api\Resources\WardRounds\Handlers;

use App\Http\Controllers\Api\Handlers\UpdateHandler as BaseUpdateHandler;
use App\Http\Controllers\Api\Resources\WardRounds\Requests\UpdateWardRoundRequest;
use App\Http\Controllers\Api\Resources\WardRounds\WardRoundApiService;
use Illuminate\Http\JsonResponse;

class UpdateHandler extends BaseUpdateHandler
{
    public static ?string $uri = '/{id}';

    public static ?string $resource = WardRoundApiService::class;

    /**
     * Update a ward round record.
     */
    public function handler(UpdateWardRoundRequest $request): JsonResponse
    {
        return $this->update($request, $request->validated());
    }
}
