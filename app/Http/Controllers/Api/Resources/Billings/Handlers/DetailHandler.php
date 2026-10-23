<?php

namespace App\Http\Controllers\Api\Resources\Billings\Handlers;

use App\Http\Controllers\Api\Handlers\DetailHandler as BaseDetailHandler;
use App\Http\Controllers\Api\Resources\Billings\BillingApiService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DetailHandler extends BaseDetailHandler
{
    public static ?string $uri = '/{id}';

    public static ?string $resource = BillingApiService::class;

    /**
     * Get a billing record.
     */
    public function handler(Request $request): JsonResponse|JsonResource
    {
        return $this->detail($request);
    }
}
