<?php

namespace App\Http\Controllers\Api\Resources\Categories\Handlers;

use App\Http\Controllers\Api\Handlers\CreateHandler as BaseCreateHandler;
use App\Http\Controllers\Api\Resources\Categories\CategoryApiService;
use App\Http\Controllers\Api\Resources\Categories\Requests\CreateCategoryRequest;
use Illuminate\Http\JsonResponse;

class CreateHandler extends BaseCreateHandler
{
    public static ?string $uri = '/';

    public static ?string $resource = CategoryApiService::class;

    /**
     * Create a category record.
     */
    public function handler(CreateCategoryRequest $request): JsonResponse
    {
        return $this->create($request->validated());
    }
}
