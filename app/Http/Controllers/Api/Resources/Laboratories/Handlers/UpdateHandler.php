<?php

namespace App\Http\Controllers\Api\Resources\Laboratories\Handlers;

use App\Http\Controllers\Api\Handlers\UpdateHandler as BaseUpdateHandler;
use App\Http\Controllers\Api\Resources\Laboratories\LaboratoryApiService;
use App\Http\Controllers\Api\Resources\Laboratories\Requests\UpdateLaboratoryRequest;
use Illuminate\Http\JsonResponse;

class UpdateHandler extends BaseUpdateHandler
{
    public static ?string $uri = '/{id}';

    public static ?string $resource = LaboratoryApiService::class;

    /**
     * Update a laboratory record.
     */
    public function handler(UpdateLaboratoryRequest $request): JsonResponse
    {
        return $this->update($request, $request->validated());
    }
}
