<?php

namespace App\Http\Controllers\Api\Resources\Nursings\Handlers;

use App\Http\Controllers\Api\Handlers\CreateHandler as BaseCreateHandler;
use App\Http\Controllers\Api\Resources\Nursings\NursingApiService;
use App\Http\Controllers\Api\Resources\Nursings\Requests\CreateNursingRequest;
use Illuminate\Http\JsonResponse;

class CreateHandler extends BaseCreateHandler
{
    public static ?string $uri = '/';

    public static ?string $resource = NursingApiService::class;

    /**
     * Create a nursing record.
     */
    public function handler(CreateNursingRequest $request): JsonResponse
    {
        return $this->create($request->validated());
    }
}
