<?php

namespace App\Http\Controllers\Api\Resources\Inventories\Handlers;

use App\Http\Controllers\Api\Handlers\DeleteHandler as BaseDeleteHandler;
use App\Http\Controllers\Api\Resources\Inventories\InventoryApiService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DeleteHandler extends BaseDeleteHandler
{
    public static ?string $uri = '/{id}';

    public static ?string $resource = InventoryApiService::class;

    /**
     * Delete a inventory record.
     */
    public function handler(Request $request): JsonResponse
    {
        return $this->delete($request);
    }
}
