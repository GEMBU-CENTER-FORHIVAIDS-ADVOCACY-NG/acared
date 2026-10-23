<?php

namespace App\Http\Controllers\Api\Resources\Inventories;

use App\Http\Controllers\Api\ApiService;
use App\Http\Controllers\Api\Resources\Inventories\Transformers\InventoryTransformer;
use App\Models\Inventory;

class InventoryApiService extends ApiService
{
    protected static string $model = Inventory::class;

    protected static string $slug = 'inventories';

    protected static bool $scopedToTeam = true;

    /**
     * @var array<int, string>
     */
    protected static array $searchable = ['sku', 'status'];

    /**
     * @var array<int, string>
     */
    protected static array $filterable = ['status', 'drug_form_id', 'price_list_id'];

    /**
     * @var array<int, string>
     */
    protected static array $sortable = ['id', 'sku', 'quantity', 'price', 'cost', 'status', 'expires_at', 'created_at', 'updated_at'];

    public static function getApiTransformer(): string
    {
        return InventoryTransformer::class;
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
