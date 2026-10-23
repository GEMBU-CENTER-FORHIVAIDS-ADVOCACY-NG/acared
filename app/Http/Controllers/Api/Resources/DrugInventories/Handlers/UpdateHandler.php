<?php

namespace App\Http\Controllers\Api\Resources\DrugInventories\Handlers;

use App\Http\Controllers\Api\Handlers\UpdateHandler as BaseUpdateHandler;
use App\Http\Controllers\Api\Resources\DrugInventories\DrugInventoryApiService;
use App\Http\Controllers\Api\Resources\DrugInventories\Requests\UpdateDrugInventoryRequest;
use Illuminate\Http\JsonResponse;

class UpdateHandler extends BaseUpdateHandler
{
    public static ?string $uri = '/{id}';

    public static ?string $resource = DrugInventoryApiService::class;

    /**
     * Update a drug inventory record.
     */
    public function handler(UpdateDrugInventoryRequest $request): JsonResponse
    {
        return $this->update($request, $request->validated());
    }
}
