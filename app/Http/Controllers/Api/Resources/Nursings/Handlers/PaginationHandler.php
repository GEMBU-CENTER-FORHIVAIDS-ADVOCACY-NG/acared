<?php

namespace App\Http\Controllers\Api\Resources\Nursings\Handlers;

use App\Http\Controllers\Api\Handlers\PaginationHandler as BasePaginationHandler;
use App\Http\Controllers\Api\Resources\Nursings\NursingApiService;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class PaginationHandler extends BasePaginationHandler
{
    public static ?string $uri = '/';

    public static ?string $resource = NursingApiService::class;

    /**
     * List the nursing records.
     */
    public function handler(Request $request): AnonymousResourceCollection
    {
        return $this->paginate($request);
    }
}
