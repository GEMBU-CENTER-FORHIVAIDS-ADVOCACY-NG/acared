<?php

namespace App\Http\Controllers\Api\Resources\DrugInventories\Handlers;

use App\Http\Controllers\Api\Handlers\DeleteHandler as BaseDeleteHandler;
use App\Http\Controllers\Api\Resources\DrugInventories\DrugInventoryApiService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DeleteHandler extends BaseDeleteHandler
{
    public static ?string $uri = '/{id}';

    public static ?string $resource = DrugInventoryApiService::class;

    /**
     * Delete a drug inventory record.
     */
    public function handler(Request $request): JsonResponse
    {
        return $this->delete($request);
    }
}
