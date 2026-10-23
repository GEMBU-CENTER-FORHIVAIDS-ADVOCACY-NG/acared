<?php

namespace App\Http\Controllers\Api\Resources\Markups\Handlers;

use App\Http\Controllers\Api\Handlers\CreateHandler as BaseCreateHandler;
use App\Http\Controllers\Api\Resources\Markups\MarkupApiService;
use App\Http\Controllers\Api\Resources\Markups\Requests\CreateMarkupRequest;
use Illuminate\Http\JsonResponse;

class CreateHandler extends BaseCreateHandler
{
    public static ?string $uri = '/';

    public static ?string $resource = MarkupApiService::class;

    /**
     * Create a markup record.
     */
    public function handler(CreateMarkupRequest $request): JsonResponse
    {
        return $this->create($request->validated());
    }
}
