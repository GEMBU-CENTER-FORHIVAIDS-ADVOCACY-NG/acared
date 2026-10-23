<?php

namespace App\Http\Controllers\Api\Resources\WalletHistories\Handlers;

use App\Http\Controllers\Api\Handlers\DeleteHandler as BaseDeleteHandler;
use App\Http\Controllers\Api\Resources\WalletHistories\WalletHistoryApiService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DeleteHandler extends BaseDeleteHandler
{
    public static ?string $uri = '/{id}';

    public static ?string $resource = WalletHistoryApiService::class;

    /**
     * Delete a wallet history record.
     */
    public function handler(Request $request): JsonResponse
    {
        return $this->delete($request);
    }
}
