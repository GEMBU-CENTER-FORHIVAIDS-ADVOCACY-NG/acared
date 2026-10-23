<?php

namespace App\Http\Controllers\Api\Resources\PurchaseOrders\Handlers;

use App\Http\Controllers\Api\Handlers\CreateHandler as BaseCreateHandler;
use App\Http\Controllers\Api\Resources\PurchaseOrders\PurchaseOrderApiService;
use App\Http\Controllers\Api\Resources\PurchaseOrders\Requests\CreatePurchaseOrderRequest;
use App\Models\PurchaseOrder;
use Illuminate\Http\JsonResponse;

class CreateHandler extends BaseCreateHandler
{
    public static ?string $uri = '/';

    public static ?string $resource = PurchaseOrderApiService::class;

    /**
     * Create a purchase order record.
     */
    public function handler(CreatePurchaseOrderRequest $request): JsonResponse
    {
        $attributes = $request->validated();

        $attributes['slug'] = $attributes['slug'] ?? $this->nextPurchaseNumber();

        return $this->create($attributes);
    }

    /**
     * Get the next purchase order number.
     */
    protected function nextPurchaseNumber(): string
    {
        $lastId = PurchaseOrder::query()->max('id');

        return 'PUR-'.str_pad((string) ($lastId + 1), 5, '0', STR_PAD_LEFT);
    }
}
