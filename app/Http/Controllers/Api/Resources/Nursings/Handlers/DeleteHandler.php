<?php

namespace App\Http\Controllers\Api\Resources\Nursings\Handlers;

use App\Http\Controllers\Api\Handlers\DeleteHandler as BaseDeleteHandler;
use App\Http\Controllers\Api\Resources\Nursings\NursingApiService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DeleteHandler extends BaseDeleteHandler
{
    public static ?string $uri = '/{id}';

    public static ?string $resource = NursingApiService::class;

    /**
     * Delete a nursing record.
     */
    public function handler(Request $request): JsonResponse
    {
        return $this->delete($request);
    }
}
