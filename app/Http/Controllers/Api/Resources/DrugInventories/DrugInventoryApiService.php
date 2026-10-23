<?php

namespace App\Http\Controllers\Api\Resources\DrugInventories;

use App\Http\Controllers\Api\ApiService;
use App\Http\Controllers\Api\Resources\DrugInventories\Transformers\DrugInventoryTransformer;
use App\Models\DrugInventory;

class DrugInventoryApiService extends ApiService
{
    protected static string $model = DrugInventory::class;

    protected static string $slug = 'drug-inventories';

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
        return DrugInventoryTransformer::class;
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
