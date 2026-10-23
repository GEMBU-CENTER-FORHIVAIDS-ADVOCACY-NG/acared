<?php

namespace App\Http\Controllers\Api\Resources\Billings\Handlers;

use App\Http\Controllers\Api\Handlers\CreateHandler as BaseCreateHandler;
use App\Http\Controllers\Api\Resources\Billings\BillingApiService;
use App\Http\Controllers\Api\Resources\Billings\Requests\CreateBillingRequest;
use Illuminate\Http\JsonResponse;

class CreateHandler extends BaseCreateHandler
{
    public static ?string $uri = '/';

    public static ?string $resource = BillingApiService::class;

    /**
     * Create a billing record.
     */
    public function handler(CreateBillingRequest $request): JsonResponse
    {
        return $this->create($request->validated());
    }
}
