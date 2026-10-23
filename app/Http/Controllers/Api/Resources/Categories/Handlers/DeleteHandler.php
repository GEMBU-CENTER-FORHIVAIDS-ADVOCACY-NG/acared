<?php

namespace App\Http\Controllers\Api\Resources\Categories\Handlers;

use App\Http\Controllers\Api\Handlers\DeleteHandler as BaseDeleteHandler;
use App\Http\Controllers\Api\Resources\Categories\CategoryApiService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DeleteHandler extends BaseDeleteHandler
{
    public static ?string $uri = '/{id}';

    public static ?string $resource = CategoryApiService::class;

    /**
     * Delete a category record.
     */
    public function handler(Request $request): JsonResponse
    {
        return $this->delete($request);
    }
}
