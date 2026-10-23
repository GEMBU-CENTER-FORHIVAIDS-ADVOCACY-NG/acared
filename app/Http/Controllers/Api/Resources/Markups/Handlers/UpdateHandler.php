<?php

namespace App\Http\Controllers\Api\Resources\Markups\Handlers;

use App\Http\Controllers\Api\Handlers\UpdateHandler as BaseUpdateHandler;
use App\Http\Controllers\Api\Resources\Markups\MarkupApiService;
use App\Http\Controllers\Api\Resources\Markups\Requests\UpdateMarkupRequest;
use Illuminate\Http\JsonResponse;

class UpdateHandler extends BaseUpdateHandler
{
    public static ?string $uri = '/{id}';

    public static ?string $resource = MarkupApiService::class;

    /**
     * Update a markup record.
     */
    public function handler(UpdateMarkupRequest $request): JsonResponse
    {
        return $this->update($request, $request->validated());
    }
}
