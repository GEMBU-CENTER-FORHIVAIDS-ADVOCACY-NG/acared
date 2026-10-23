<?php

namespace App\Http\Controllers\Api\Resources\Vendors\Handlers;

use App\Http\Controllers\Api\Handlers\PaginationHandler as BasePaginationHandler;
use App\Http\Controllers\Api\Resources\Vendors\VendorApiService;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class PaginationHandler extends BasePaginationHandler
{
    public static ?string $uri = '/';

    public static ?string $resource = VendorApiService::class;

    /**
     * List the vendor records.
     */
    public function handler(Request $request): AnonymousResourceCollection
    {
        return $this->paginate($request);
    }
}
