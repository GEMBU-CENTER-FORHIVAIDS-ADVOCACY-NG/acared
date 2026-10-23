<?php

namespace App\Http\Controllers\Api\Resources\WalletHistories\Handlers;

use App\Http\Controllers\Api\Handlers\UpdateHandler as BaseUpdateHandler;
use App\Http\Controllers\Api\Resources\WalletHistories\Requests\UpdateWalletHistoryRequest;
use App\Http\Controllers\Api\Resources\WalletHistories\WalletHistoryApiService;
use Illuminate\Http\JsonResponse;

class UpdateHandler extends BaseUpdateHandler
{
    public static ?string $uri = '/{id}';

    public static ?string $resource = WalletHistoryApiService::class;

    /**
     * Update a wallet history record.
     */
    public function handler(UpdateWalletHistoryRequest $request): JsonResponse
    {
        return $this->update($request, $request->validated());
    }
}
