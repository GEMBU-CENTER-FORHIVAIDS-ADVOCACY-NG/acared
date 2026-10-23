<?php

namespace App\Http\Controllers\Api\Resources\Prescriptions\Handlers;

use App\Http\Controllers\Api\Handlers\DeleteHandler as BaseDeleteHandler;
use App\Http\Controllers\Api\Resources\Prescriptions\PrescriptionApiService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DeleteHandler extends BaseDeleteHandler
{
    public static ?string $uri = '/{id}';

    public static ?string $resource = PrescriptionApiService::class;

    /**
     * Delete a prescription record.
     */
    public function handler(Request $request): JsonResponse
    {
        return $this->delete($request);
    }
}
