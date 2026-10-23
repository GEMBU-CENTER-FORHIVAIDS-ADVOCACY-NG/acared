<?php

namespace App\Http\Controllers\Api\Resources\WalletHistories\Handlers;

use App\Http\Controllers\Api\Handlers\PaginationHandler as BasePaginationHandler;
use App\Http\Controllers\Api\Resources\WalletHistories\WalletHistoryApiService;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class PaginationHandler extends BasePaginationHandler
{
    public static ?string $uri = '/';

    public static ?string $resource = WalletHistoryApiService::class;

    /**
     * List the wallet history records.
     */
    public function handler(Request $request): AnonymousResourceCollection
    {
        return $this->paginate($request);
    }
}
