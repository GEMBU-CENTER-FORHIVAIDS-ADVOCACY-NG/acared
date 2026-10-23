<?php

namespace App\Http\Controllers\Api\Resources\Inventories\Handlers;

use App\Http\Controllers\Api\Handlers\CreateHandler as BaseCreateHandler;
use App\Http\Controllers\Api\Resources\Inventories\InventoryApiService;
use App\Http\Controllers\Api\Resources\Inventories\Requests\CreateInventoryRequest;
use Illuminate\Http\JsonResponse;

class CreateHandler extends BaseCreateHandler
{
    public static ?string $uri = '/';

    public static ?string $resource = InventoryApiService::class;

    /**
     * Create a inventory record.
     */
    public function handler(CreateInventoryRequest $request): JsonResponse
    {
        return $this->create($request->validated());
    }
}
