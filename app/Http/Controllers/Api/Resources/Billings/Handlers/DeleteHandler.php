<?php

namespace App\Http\Controllers\Api\Resources\Billings\Handlers;

use App\Http\Controllers\Api\Handlers\DeleteHandler as BaseDeleteHandler;
use App\Http\Controllers\Api\Resources\Billings\BillingApiService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DeleteHandler extends BaseDeleteHandler
{
    public static ?string $uri = '/{id}';

    public static ?string $resource = BillingApiService::class;

    /**
     * Delete a billing record.
     */
    public function handler(Request $request): JsonResponse
    {
        return $this->delete($request);
    }
}
