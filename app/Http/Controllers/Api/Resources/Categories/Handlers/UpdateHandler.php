<?php

namespace App\Http\Controllers\Api\Resources\Categories\Handlers;

use App\Http\Controllers\Api\Handlers\UpdateHandler as BaseUpdateHandler;
use App\Http\Controllers\Api\Resources\Categories\CategoryApiService;
use App\Http\Controllers\Api\Resources\Categories\Requests\UpdateCategoryRequest;
use Illuminate\Http\JsonResponse;

class UpdateHandler extends BaseUpdateHandler
{
    public static ?string $uri = '/{id}';

    public static ?string $resource = CategoryApiService::class;

    /**
     * Update a category record.
     */
    public function handler(UpdateCategoryRequest $request): JsonResponse
    {
        return $this->update($request, $request->validated());
    }
}
