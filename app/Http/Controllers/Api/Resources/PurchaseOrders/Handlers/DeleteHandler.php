<?php

namespace App\Http\Controllers\Api\Resources\PurchaseOrders\Handlers;

use App\Http\Controllers\Api\Handlers\DeleteHandler as BaseDeleteHandler;
use App\Http\Controllers\Api\Resources\PurchaseOrders\PurchaseOrderApiService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DeleteHandler extends BaseDeleteHandler
{
    public static ?string $uri = '/{id}';

    public static ?string $resource = PurchaseOrderApiService::class;

    /**
     * Delete a purchase order record.
     */
    public function handler(Request $request): JsonResponse
    {
        return $this->delete($request);
    }
}
