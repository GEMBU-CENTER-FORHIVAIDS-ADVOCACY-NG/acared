<?php

namespace App\Http\Controllers\Api\Resources\Consultations\Handlers;

use App\Http\Controllers\Api\Handlers\UpdateHandler as BaseUpdateHandler;
use App\Http\Controllers\Api\Resources\Consultations\ConsultationApiService;
use App\Http\Controllers\Api\Resources\Consultations\Requests\UpdateConsultationRequest;
use Illuminate\Http\JsonResponse;

class UpdateHandler extends BaseUpdateHandler
{
    public static ?string $uri = '/{id}';

    public static ?string $resource = ConsultationApiService::class;

    /**
     * Update a consultation record.
     */
    public function handler(UpdateConsultationRequest $request): JsonResponse
    {
        return $this->update($request, $request->validated());
    }
}
