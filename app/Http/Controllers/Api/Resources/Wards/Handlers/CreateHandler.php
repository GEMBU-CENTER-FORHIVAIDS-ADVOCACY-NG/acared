<?php

namespace App\Http\Controllers\Api\Resources\Wards\Handlers;

use App\Http\Controllers\Api\Handlers\CreateHandler as BaseCreateHandler;
use App\Http\Controllers\Api\Resources\Wards\Requests\CreateWardRequest;
use App\Http\Controllers\Api\Resources\Wards\WardApiService;
use Illuminate\Http\JsonResponse;

class CreateHandler extends BaseCreateHandler
{
    public static ?string $uri = '/';

    public static ?string $resource = WardApiService::class;

    /**
     * Create a ward record.
     */
    public function handler(CreateWardRequest $request): JsonResponse
    {
        return $this->create($request->validated());
    }
}
