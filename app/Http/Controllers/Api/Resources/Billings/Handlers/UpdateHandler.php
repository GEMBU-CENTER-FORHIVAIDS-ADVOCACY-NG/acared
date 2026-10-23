<?php

namespace App\Http\Controllers\Api\Resources\Billings\Handlers;

use App\Http\Controllers\Api\Handlers\UpdateHandler as BaseUpdateHandler;
use App\Http\Controllers\Api\Resources\Billings\BillingApiService;
use App\Http\Controllers\Api\Resources\Billings\Requests\UpdateBillingRequest;
use Illuminate\Http\JsonResponse;

class UpdateHandler extends BaseUpdateHandler
{
    public static ?string $uri = '/{id}';

    public static ?string $resource = BillingApiService::class;

    /**
     * Update a billing record.
     */
    public function handler(UpdateBillingRequest $request): JsonResponse
    {
        return $this->update($request, $request->validated());
    }
}
