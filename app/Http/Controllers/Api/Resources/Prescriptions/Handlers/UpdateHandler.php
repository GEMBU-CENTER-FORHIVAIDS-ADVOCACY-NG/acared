<?php

namespace App\Http\Controllers\Api\Resources\Prescriptions\Handlers;

use App\Http\Controllers\Api\Handlers\UpdateHandler as BaseUpdateHandler;
use App\Http\Controllers\Api\Resources\Prescriptions\PrescriptionApiService;
use App\Http\Controllers\Api\Resources\Prescriptions\Requests\UpdatePrescriptionRequest;
use Illuminate\Http\JsonResponse;

class UpdateHandler extends BaseUpdateHandler
{
    public static ?string $uri = '/{id}';

    public static ?string $resource = PrescriptionApiService::class;

    /**
     * Update a prescription record.
     */
    public function handler(UpdatePrescriptionRequest $request): JsonResponse
    {
        return $this->update($request, $request->validated());
    }
}
