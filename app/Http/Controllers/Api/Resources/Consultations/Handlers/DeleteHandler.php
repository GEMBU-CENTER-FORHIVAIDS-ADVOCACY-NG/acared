<?php

namespace App\Http\Controllers\Api\Resources\Consultations\Handlers;

use App\Http\Controllers\Api\Handlers\DeleteHandler as BaseDeleteHandler;
use App\Http\Controllers\Api\Resources\Consultations\ConsultationApiService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DeleteHandler extends BaseDeleteHandler
{
    public static ?string $uri = '/{id}';

    public static ?string $resource = ConsultationApiService::class;

    /**
     * Delete a consultation record.
     */
    public function handler(Request $request): JsonResponse
    {
        return $this->delete($request);
    }
}
