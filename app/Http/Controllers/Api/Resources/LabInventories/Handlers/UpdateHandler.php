<?php

namespace App\Http\Controllers\Api\Resources\LabInventories\Handlers;

use App\Http\Controllers\Api\Handlers\UpdateHandler as BaseUpdateHandler;
use App\Http\Controllers\Api\Resources\LabInventories\LabInventoryApiService;
use App\Http\Controllers\Api\Resources\LabInventories\Requests\UpdateLabInventoryRequest;
use Illuminate\Http\JsonResponse;

class UpdateHandler extends BaseUpdateHandler
{
    public static ?string $uri = '/{id}';

    public static ?string $resource = LabInventoryApiService::class;

    /**
     * Update a lab inventory record.
     */
    public function handler(UpdateLabInventoryRequest $request): JsonResponse
    {
        return $this->update($request, $request->validated());
    }
}
