<?php

namespace App\Http\Controllers\Api\Resources\Coupons\Handlers;

use App\Http\Controllers\Api\Handlers\PaginationHandler as BasePaginationHandler;
use App\Http\Controllers\Api\Resources\Coupons\CouponApiService;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class PaginationHandler extends BasePaginationHandler
{
    public static ?string $uri = '/';

    public static ?string $resource = CouponApiService::class;

    /**
     * List the coupon records.
     */
    public function handler(Request $request): AnonymousResourceCollection
    {
        return $this->paginate($request);
    }
}
