<?php

namespace App\Http\Controllers\Api\Resources\PriceLists\Handlers;

use App\Http\Controllers\Api\Handlers\DeleteHandler as BaseDeleteHandler;
use App\Http\Controllers\Api\Resources\PriceLists\PriceListApiService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DeleteHandler extends BaseDeleteHandler
{
    public static ?string $uri = '/{id}';

    public static ?string $resource = PriceListApiService::class;

    /**
     * Delete a price list record.
     */
    public function handler(Request $request): JsonResponse
    {
        return $this->delete($request);
    }
}
