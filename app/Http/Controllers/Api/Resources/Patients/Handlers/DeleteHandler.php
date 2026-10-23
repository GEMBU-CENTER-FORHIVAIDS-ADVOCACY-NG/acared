<?php

namespace App\Http\Controllers\Api\Resources\Patients\Handlers;

use App\Http\Controllers\Api\Handlers\DeleteHandler as BaseDeleteHandler;
use App\Http\Controllers\Api\Resources\Patients\PatientApiService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DeleteHandler extends BaseDeleteHandler
{
    public static ?string $uri = '/{id}';

    public static ?string $resource = PatientApiService::class;

    /**
     * Delete a patient record.
     */
    public function handler(Request $request): JsonResponse
    {
        return $this->delete($request);
    }
}
