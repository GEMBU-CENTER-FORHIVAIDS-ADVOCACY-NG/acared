<?php

namespace App\Http\Controllers\Api\Resources\Nursings\Handlers;

use App\Http\Controllers\Api\Handlers\UpdateHandler as BaseUpdateHandler;
use App\Http\Controllers\Api\Resources\Nursings\NursingApiService;
use App\Http\Controllers\Api\Resources\Nursings\Requests\UpdateNursingRequest;
use Illuminate\Http\JsonResponse;

class UpdateHandler extends BaseUpdateHandler
{
    public static ?string $uri = '/{id}';

    public static ?string $resource = NursingApiService::class;

    /**
     * Update a nursing record.
     */
    public function handler(UpdateNursingRequest $request): JsonResponse
    {
        return $this->update($request, $request->validated());
    }
}
