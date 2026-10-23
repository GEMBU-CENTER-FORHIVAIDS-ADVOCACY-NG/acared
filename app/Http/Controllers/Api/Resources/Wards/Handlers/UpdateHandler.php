<?php

namespace App\Http\Controllers\Api\Resources\Wards\Handlers;

use App\Http\Controllers\Api\Handlers\UpdateHandler as BaseUpdateHandler;
use App\Http\Controllers\Api\Resources\Wards\Requests\UpdateWardRequest;
use App\Http\Controllers\Api\Resources\Wards\WardApiService;
use Illuminate\Http\JsonResponse;

class UpdateHandler extends BaseUpdateHandler
{
    public static ?string $uri = '/{id}';

    public static ?string $resource = WardApiService::class;

    /**
     * Update a ward record.
     */
    public function handler(UpdateWardRequest $request): JsonResponse
    {
        return $this->update($request, $request->validated());
    }
}
