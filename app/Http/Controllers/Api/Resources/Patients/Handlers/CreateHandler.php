<?php

namespace App\Http\Controllers\Api\Resources\Patients\Handlers;

use App\Http\Controllers\Api\Handlers\CreateHandler as BaseCreateHandler;
use App\Http\Controllers\Api\Resources\Patients\PatientApiService;
use App\Http\Controllers\Api\Resources\Patients\Requests\CreatePatientRequest;
use App\Models\Patient;
use Illuminate\Http\JsonResponse;

class CreateHandler extends BaseCreateHandler
{
    public static ?string $uri = '/';

    public static ?string $resource = PatientApiService::class;

    /**
     * Create a patient record.
     */
    public function handler(CreatePatientRequest $request): JsonResponse
    {
        $attributes = $request->validated();

        $attributes['slug'] = $attributes['slug'] ?? $this->nextHospitalNumber();

        return $this->create($attributes);
    }

    /**
     * Get the next hospital number.
     */
    protected function nextHospitalNumber(): string
    {
        return 'PAT-'.str_pad((string) (Patient::withTrashed()->count() + 1), 5, '0', STR_PAD_LEFT);
    }
}
