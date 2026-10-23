<?php

namespace App\Http\Controllers\Api\Resources\Methods\Handlers;

use App\Http\Controllers\Api\Handlers\DeleteHandler as BaseDeleteHandler;
use App\Http\Controllers\Api\Resources\Methods\MethodApiService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DeleteHandler extends BaseDeleteHandler
{
    public static ?string $uri = '/{id}';

    public static ?string $resource = MethodApiService::class;

    /**
     * Delete a method record.
     */
    public function handler(Request $request): JsonResponse
    {
        return $this->delete($request);
    }
}
