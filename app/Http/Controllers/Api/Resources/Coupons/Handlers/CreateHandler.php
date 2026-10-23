<?php

namespace App\Http\Controllers\Api\Resources\Coupons\Handlers;

use App\Http\Controllers\Api\Handlers\CreateHandler as BaseCreateHandler;
use App\Http\Controllers\Api\Resources\Coupons\CouponApiService;
use App\Http\Controllers\Api\Resources\Coupons\Requests\CreateCouponRequest;
use Illuminate\Http\JsonResponse;

class CreateHandler extends BaseCreateHandler
{
    public static ?string $uri = '/';

    public static ?string $resource = CouponApiService::class;

    /**
     * Create a coupon record.
     */
    public function handler(CreateCouponRequest $request): JsonResponse
    {
        return $this->create($request->validated());
    }
}
