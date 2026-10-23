<?php

namespace App\Http\Controllers\Api\Resources\PurchaseOrders;

use App\Http\Controllers\Api\ApiService;
use App\Http\Controllers\Api\Resources\PurchaseOrders\Transformers\PurchaseOrderTransformer;
use App\Models\PurchaseOrder;

class PurchaseOrderApiService extends ApiService
{
    protected static string $model = PurchaseOrder::class;

    protected static string $slug = 'purchase-orders';

    protected static bool $scopedToTeam = true;

    /**
     * @var array<int, string>
     */
    protected static array $searchable = ['slug', 'status'];

    /**
     * @var array<int, string>
     */
    protected static array $filterable = ['status', 'vendor_id'];

    /**
     * @var array<int, string>
     */
    protected static array $sortable = ['id', 'slug', 'total', 'status', 'created_at', 'updated_at'];

    public static function getApiTransformer(): string
    {
        return PurchaseOrderTransformer::class;
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
