<?php

namespace App\Http\Controllers\Api\Resources\Vendors\Handlers;

use App\Http\Controllers\Api\Handlers\DetailHandler as BaseDetailHandler;
use App\Http\Controllers\Api\Resources\Vendors\VendorApiService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DetailHandler extends BaseDetailHandler
{
    public static ?string $uri = '/{id}';

    public static ?string $resource = VendorApiService::class;

    /**
     * Get a vendor record.
     */
    public function handler(Request $request): JsonResponse|JsonResource
    {
        return $this->detail($request);
    }
}
