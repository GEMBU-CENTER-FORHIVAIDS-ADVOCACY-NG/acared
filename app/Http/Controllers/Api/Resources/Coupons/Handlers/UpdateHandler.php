<?php

namespace App\Http\Controllers\Api\Resources\Coupons\Handlers;

use App\Http\Controllers\Api\Handlers\UpdateHandler as BaseUpdateHandler;
use App\Http\Controllers\Api\Resources\Coupons\CouponApiService;
use App\Http\Controllers\Api\Resources\Coupons\Requests\UpdateCouponRequest;
use Illuminate\Http\JsonResponse;

class UpdateHandler extends BaseUpdateHandler
{
    public static ?string $uri = '/{id}';

    public static ?string $resource = CouponApiService::class;

    /**
     * Update a coupon record.
     */
    public function handler(UpdateCouponRequest $request): JsonResponse
    {
        return $this->update($request, $request->validated());
    }
}
