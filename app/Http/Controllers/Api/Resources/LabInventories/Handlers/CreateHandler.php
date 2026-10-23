<?php

namespace App\Http\Controllers\Api\Resources\LabInventories\Handlers;

use App\Http\Controllers\Api\Handlers\CreateHandler as BaseCreateHandler;
use App\Http\Controllers\Api\Resources\LabInventories\LabInventoryApiService;
use App\Http\Controllers\Api\Resources\LabInventories\Requests\CreateLabInventoryRequest;
use Illuminate\Http\JsonResponse;

class CreateHandler extends BaseCreateHandler
{
    public static ?string $uri = '/';

    public static ?string $resource = LabInventoryApiService::class;

    /**
     * Create a lab inventory record.
     */
    public function handler(CreateLabInventoryRequest $request): JsonResponse
    {
        return $this->create($request->validated());
    }
}
