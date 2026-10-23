<?php

namespace App\Http\Controllers\Api\Resources\Coupons;

use App\Http\Controllers\Api\ApiService;
use App\Http\Controllers\Api\Resources\Coupons\Transformers\CouponTransformer;
use App\Models\Coupon;

class CouponApiService extends ApiService
{
    protected static string $model = Coupon::class;

    protected static string $slug = 'coupons';

    protected static bool $scopedToTeam = true;

    /**
     * @var array<int, string>
     */
    protected static array $searchable = ['code', 'patient_id'];

    /**
     * @var array<int, string>
     */
    protected static array $filterable = ['type', 'is_active'];

    /**
     * @var array<int, string>
     */
    protected static array $sortable = ['id', 'code', 'value', 'used_count', 'expires_at', 'created_at', 'updated_at'];

    public static function getApiTransformer(): string
    {
        return CouponTransformer::class;
    }

    /**
     * @return array<int, class-string>
     */
    public static function handlers(): array
    {
        return [
            Handlers\CreateHandler::class,
            Handlers\UpdateHandler::class,
            Handlers\DeleteHandler::class,
            Handlers\PaginationHandler::class,
            Handlers\DetailHandler::class,
        ];
    }
}
