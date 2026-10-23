<?php

namespace App\Http\Controllers\Api\Resources\Vendors\Handlers;

use App\Http\Controllers\Api\Handlers\UpdateHandler as BaseUpdateHandler;
use App\Http\Controllers\Api\Resources\Vendors\Requests\UpdateVendorRequest;
use App\Http\Controllers\Api\Resources\Vendors\VendorApiService;
use Illuminate\Http\JsonResponse;

class UpdateHandler extends BaseUpdateHandler
{
    public static ?string $uri = '/{id}';

    public static ?string $resource = VendorApiService::class;

    /**
     * Update a vendor record.
     */
    public function handler(UpdateVendorRequest $request): JsonResponse
    {
        return $this->update($request, $request->validated());
    }
}
