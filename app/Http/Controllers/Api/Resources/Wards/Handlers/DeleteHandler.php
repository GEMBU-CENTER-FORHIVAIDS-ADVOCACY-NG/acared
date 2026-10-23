<?php

namespace App\Http\Controllers\Api\Resources\Wards\Handlers;

use App\Http\Controllers\Api\Handlers\DeleteHandler as BaseDeleteHandler;
use App\Http\Controllers\Api\Resources\Wards\WardApiService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DeleteHandler extends BaseDeleteHandler
{
    public static ?string $uri = '/{id}';

    public static ?string $resource = WardApiService::class;

    /**
     * Delete a ward record.
     */
    public function handler(Request $request): JsonResponse
    {
        return $this->delete($request);
    }
}
