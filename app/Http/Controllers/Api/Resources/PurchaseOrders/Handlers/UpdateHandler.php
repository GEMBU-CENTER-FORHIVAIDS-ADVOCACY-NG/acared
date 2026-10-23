<?php

namespace App\Http\Controllers\Api\Resources\PurchaseOrders\Handlers;

use App\Http\Controllers\Api\Handlers\UpdateHandler as BaseUpdateHandler;
use App\Http\Controllers\Api\Resources\PurchaseOrders\PurchaseOrderApiService;
use App\Http\Controllers\Api\Resources\PurchaseOrders\Requests\UpdatePurchaseOrderRequest;
use Illuminate\Http\JsonResponse;

class UpdateHandler extends BaseUpdateHandler
{
    public static ?string $uri = '/{id}';

    public static ?string $resource = PurchaseOrderApiService::class;

    /**
     * Update a purchase order record.
     */
    public function handler(UpdatePurchaseOrderRequest $request): JsonResponse
    {
        return $this->update($request, $request->validated());
    }
}
