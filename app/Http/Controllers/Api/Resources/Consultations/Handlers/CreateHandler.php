<?php

namespace App\Http\Controllers\Api\Resources\Consultations\Handlers;

use App\Http\Controllers\Api\Handlers\CreateHandler as BaseCreateHandler;
use App\Http\Controllers\Api\Resources\Consultations\ConsultationApiService;
use App\Http\Controllers\Api\Resources\Consultations\Requests\CreateConsultationRequest;
use Illuminate\Http\JsonResponse;

class CreateHandler extends BaseCreateHandler
{
    public static ?string $uri = '/';

    public static ?string $resource = ConsultationApiService::class;

    /**
     * Create a consultation record.
     */
    public function handler(CreateConsultationRequest $request): JsonResponse
    {
        return $this->create($request->validated());
    }
}
