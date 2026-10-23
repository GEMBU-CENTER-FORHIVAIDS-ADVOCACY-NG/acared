<?php

namespace App\Http\Controllers\Api\Resources\Vendors\Handlers;

use App\Http\Controllers\Api\Handlers\DeleteHandler as BaseDeleteHandler;
use App\Http\Controllers\Api\Resources\Vendors\VendorApiService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DeleteHandler extends BaseDeleteHandler
{
    public static ?string $uri = '/{id}';

    public static ?string $resource = VendorApiService::class;

    /**
     * Delete a vendor record.
     */
    public function handler(Request $request): JsonResponse
    {
        return $this->delete($request);
    }
}
