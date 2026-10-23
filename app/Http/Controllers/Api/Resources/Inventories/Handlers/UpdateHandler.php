<?php

namespace App\Http\Controllers\Api\Resources\Inventories\Handlers;

use App\Http\Controllers\Api\Handlers\UpdateHandler as BaseUpdateHandler;
use App\Http\Controllers\Api\Resources\Inventories\InventoryApiService;
use App\Http\Controllers\Api\Resources\Inventories\Requests\UpdateInventoryRequest;
use Illuminate\Http\JsonResponse;

class UpdateHandler extends BaseUpdateHandler
{
    public static ?string $uri = '/{id}';

    public static ?string $resource = InventoryApiService::class;

    /**
     * Update a inventory record.
     */
    public function handler(UpdateInventoryRequest $request): JsonResponse
    {
        return $this->update($request, $request->validated());
    }
}
