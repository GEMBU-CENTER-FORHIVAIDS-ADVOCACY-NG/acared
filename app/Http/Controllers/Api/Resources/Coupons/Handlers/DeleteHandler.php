<?php

namespace App\Http\Controllers\Api\Resources\Coupons\Handlers;

use App\Http\Controllers\Api\Handlers\DeleteHandler as BaseDeleteHandler;
use App\Http\Controllers\Api\Resources\Coupons\CouponApiService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DeleteHandler extends BaseDeleteHandler
{
    public static ?string $uri = '/{id}';

    public static ?string $resource = CouponApiService::class;

    /**
     * Delete a coupon record.
     */
    public function handler(Request $request): JsonResponse
    {
        return $this->delete($request);
    }
}
