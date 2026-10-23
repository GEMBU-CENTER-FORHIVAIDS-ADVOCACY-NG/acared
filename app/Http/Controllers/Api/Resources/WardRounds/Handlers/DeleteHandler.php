<?php

namespace App\Http\Controllers\Api\Resources\WardRounds\Handlers;

use App\Http\Controllers\Api\Handlers\DeleteHandler as BaseDeleteHandler;
use App\Http\Controllers\Api\Resources\WardRounds\WardRoundApiService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DeleteHandler extends BaseDeleteHandler
{
    public static ?string $uri = '/{id}';

    public static ?string $resource = WardRoundApiService::class;

    /**
     * Delete a ward round record.
     */
    public function handler(Request $request): JsonResponse
    {
        return $this->delete($request);
    }
}
