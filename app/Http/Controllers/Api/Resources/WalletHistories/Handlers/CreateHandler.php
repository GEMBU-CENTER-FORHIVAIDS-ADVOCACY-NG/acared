<?php

namespace App\Http\Controllers\Api\Resources\WalletHistories\Handlers;

use App\Http\Controllers\Api\Handlers\CreateHandler as BaseCreateHandler;
use App\Http\Controllers\Api\Resources\WalletHistories\Requests\CreateWalletHistoryRequest;
use App\Http\Controllers\Api\Resources\WalletHistories\WalletHistoryApiService;
use Illuminate\Http\JsonResponse;

class CreateHandler extends BaseCreateHandler
{
    public static ?string $uri = '/';

    public static ?string $resource = WalletHistoryApiService::class;

    /**
     * Create a wallet history record.
     */
    public function handler(CreateWalletHistoryRequest $request): JsonResponse
    {
        return $this->create($request->validated());
    }
}
