<?php

namespace App\Http\Controllers\Api\Resources\Coupons\Handlers;

use App\Http\Controllers\Api\Handlers\DetailHandler as BaseDetailHandler;
use App\Http\Controllers\Api\Resources\Coupons\CouponApiService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DetailHandler extends BaseDetailHandler
{
    public static ?string $uri = '/{id}';

    public static ?string $resource = CouponApiService::class;

    /**
     * Get a coupon record.
     */
    public function handler(Request $request): JsonResponse|JsonResource
    {
        return $this->detail($request);
    }
}
