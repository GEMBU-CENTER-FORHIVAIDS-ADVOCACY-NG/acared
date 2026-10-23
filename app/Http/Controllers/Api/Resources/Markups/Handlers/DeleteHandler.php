<?php

namespace App\Http\Controllers\Api\Resources\Markups\Handlers;

use App\Http\Controllers\Api\Handlers\DeleteHandler as BaseDeleteHandler;
use App\Http\Controllers\Api\Resources\Markups\MarkupApiService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DeleteHandler extends BaseDeleteHandler
{
    public static ?string $uri = '/{id}';

    public static ?string $resource = MarkupApiService::class;

    /**
     * Delete a markup record.
     */
    public function handler(Request $request): JsonResponse
    {
        return $this->delete($request);
    }
}
