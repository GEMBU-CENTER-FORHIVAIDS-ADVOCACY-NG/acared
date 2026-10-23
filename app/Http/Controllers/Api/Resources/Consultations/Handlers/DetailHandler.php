<?php

namespace App\Http\Controllers\Api\Resources\Consultations\Handlers;

use App\Http\Controllers\Api\Handlers\DetailHandler as BaseDetailHandler;
use App\Http\Controllers\Api\Resources\Consultations\ConsultationApiService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DetailHandler extends BaseDetailHandler
{
    public static ?string $uri = '/{id}';

    public static ?string $resource = ConsultationApiService::class;

    /**
     * Get a consultation record.
     */
    public function handler(Request $request): JsonResponse|JsonResource
    {
        return $this->detail($request);
    }
}
