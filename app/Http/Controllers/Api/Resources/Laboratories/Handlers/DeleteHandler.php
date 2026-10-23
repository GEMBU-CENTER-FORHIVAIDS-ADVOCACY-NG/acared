<?php

namespace App\Http\Controllers\Api\Resources\Laboratories\Handlers;

use App\Http\Controllers\Api\Handlers\DeleteHandler as BaseDeleteHandler;
use App\Http\Controllers\Api\Resources\Laboratories\LaboratoryApiService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DeleteHandler extends BaseDeleteHandler
{
    public static ?string $uri = '/{id}';

    public static ?string $resource = LaboratoryApiService::class;

    /**
     * Delete a laboratory record.
     */
    public function handler(Request $request): JsonResponse
    {
        return $this->delete($request);
    }
}
