<?php

namespace App\Http\Controllers\Api\Resources\PriceLists\Handlers;

use App\Http\Controllers\Api\Handlers\UpdateHandler as BaseUpdateHandler;
use App\Http\Controllers\Api\Resources\PriceLists\PriceListApiService;
use App\Http\Controllers\Api\Resources\PriceLists\Requests\UpdatePriceListRequest;
use Illuminate\Http\JsonResponse;

class UpdateHandler extends BaseUpdateHandler
{
    public static ?string $uri = '/{id}';

    public static ?string $resource = PriceListApiService::class;

    /**
     * Update a price list record.
     */
    public function handler(UpdatePriceListRequest $request): JsonResponse
    {
        return $this->update($request, $request->validated());
    }
}
