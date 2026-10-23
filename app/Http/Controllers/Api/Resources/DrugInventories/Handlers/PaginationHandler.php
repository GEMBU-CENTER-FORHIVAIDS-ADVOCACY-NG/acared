<?php

namespace App\Http\Controllers\Api\Resources\DrugInventories\Handlers;

use App\Http\Controllers\Api\Handlers\PaginationHandler as BasePaginationHandler;
use App\Http\Controllers\Api\Resources\DrugInventories\DrugInventoryApiService;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class PaginationHandler extends BasePaginationHandler
{
    public static ?string $uri = '/';

    public static ?string $resource = DrugInventoryApiService::class;

    /**
     * List the drug inventory records.
     */
    public function handler(Request $request): AnonymousResourceCollection
    {
        return $this->paginate($request);
    }
}
