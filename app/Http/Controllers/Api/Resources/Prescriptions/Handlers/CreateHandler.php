<?php

namespace App\Http\Controllers\Api\Resources\Prescriptions\Handlers;

use App\Http\Controllers\Api\Handlers\CreateHandler as BaseCreateHandler;
use App\Http\Controllers\Api\Resources\Prescriptions\PrescriptionApiService;
use App\Http\Controllers\Api\Resources\Prescriptions\Requests\CreatePrescriptionRequest;
use Illuminate\Http\JsonResponse;

class CreateHandler extends BaseCreateHandler
{
    public static ?string $uri = '/';

    public static ?string $resource = PrescriptionApiService::class;

    /**
     * Create a prescription record.
     */
    public function handler(CreatePrescriptionRequest $request): JsonResponse
    {
        return $this->create($request->validated());
    }
}
