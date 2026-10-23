<?php

namespace App\Http\Controllers\Api\Resources\LabInventories;

use App\Http\Controllers\Api\ApiService;
use App\Http\Controllers\Api\Resources\LabInventories\Transformers\LabInventoryTransformer;
use App\Models\LabInventory;

class LabInventoryApiService extends ApiService
{
    protected static string $model = LabInventory::class;

    protected static string $slug = 'lab-inventories';

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
        return LabInventoryTransformer::class;
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
