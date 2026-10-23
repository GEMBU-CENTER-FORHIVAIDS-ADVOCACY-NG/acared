<?php

namespace App\Http\Controllers\Api\Resources\Vendors\Handlers;

use App\Http\Controllers\Api\Handlers\CreateHandler as BaseCreateHandler;
use App\Http\Controllers\Api\Resources\Vendors\Requests\CreateVendorRequest;
use App\Http\Controllers\Api\Resources\Vendors\VendorApiService;
use Illuminate\Http\JsonResponse;

class CreateHandler extends BaseCreateHandler
{
    public static ?string $uri = '/';

    public static ?string $resource = VendorApiService::class;

    /**
     * Create a vendor record.
     */
    public function handler(CreateVendorRequest $request): JsonResponse
    {
        return $this->create($request->validated());
    }
}
