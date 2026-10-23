<?php

namespace App\Http\Controllers\Api\Resources\DrugInventories\Handlers;

use App\Http\Controllers\Api\Handlers\CreateHandler as BaseCreateHandler;
use App\Http\Controllers\Api\Resources\DrugInventories\DrugInventoryApiService;
use App\Http\Controllers\Api\Resources\DrugInventories\Requests\CreateDrugInventoryRequest;
use Illuminate\Http\JsonResponse;

class CreateHandler extends BaseCreateHandler
{
    public static ?string $uri = '/';

    public static ?string $resource = DrugInventoryApiService::class;

    /**
     * Create a drug inventory record.
     */
    public function handler(CreateDrugInventoryRequest $request): JsonResponse
    {
        return $this->create($request->validated());
    }
}
