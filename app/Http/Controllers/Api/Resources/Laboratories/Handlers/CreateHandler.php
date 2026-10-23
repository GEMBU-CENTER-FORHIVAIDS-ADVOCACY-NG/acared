<?php

namespace App\Http\Controllers\Api\Resources\Laboratories\Handlers;

use App\Http\Controllers\Api\Handlers\CreateHandler as BaseCreateHandler;
use App\Http\Controllers\Api\Resources\Laboratories\LaboratoryApiService;
use App\Http\Controllers\Api\Resources\Laboratories\Requests\CreateLaboratoryRequest;
use Illuminate\Http\JsonResponse;

class CreateHandler extends BaseCreateHandler
{
    public static ?string $uri = '/';

    public static ?string $resource = LaboratoryApiService::class;

    /**
     * Create a laboratory record.
     */
    public function handler(CreateLaboratoryRequest $request): JsonResponse
    {
        return $this->create($request->validated());
    }
}
