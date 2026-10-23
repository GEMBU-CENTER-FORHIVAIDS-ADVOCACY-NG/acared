<?php

namespace App\Http\Controllers\Api\Resources\Patients\Handlers;

use App\Http\Controllers\Api\Handlers\UpdateHandler as BaseUpdateHandler;
use App\Http\Controllers\Api\Resources\Patients\PatientApiService;
use App\Http\Controllers\Api\Resources\Patients\Requests\UpdatePatientRequest;
use Illuminate\Http\JsonResponse;

class UpdateHandler extends BaseUpdateHandler
{
    public static ?string $uri = '/{id}';

    public static ?string $resource = PatientApiService::class;

    /**
     * Update a patient record.
     */
    public function handler(UpdatePatientRequest $request): JsonResponse
    {
        return $this->update($request, $request->validated());
    }
}
