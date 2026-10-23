<?php

namespace App\Http\Controllers\Api\Resources\PriceLists\Handlers;

use App\Http\Controllers\Api\Handlers\CreateHandler as BaseCreateHandler;
use App\Http\Controllers\Api\Resources\PriceLists\PriceListApiService;
use App\Http\Controllers\Api\Resources\PriceLists\Requests\CreatePriceListRequest;
use Illuminate\Http\JsonResponse;

class CreateHandler extends BaseCreateHandler
{
    public static ?string $uri = '/';

    public static ?string $resource = PriceListApiService::class;

    /**
     * Create a price list record.
     */
    public function handler(CreatePriceListRequest $request): JsonResponse
    {
        return $this->create($request->validated());
    }
}
