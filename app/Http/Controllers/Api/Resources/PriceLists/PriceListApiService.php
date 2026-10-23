<?php

namespace App\Http\Controllers\Api\Resources\PriceLists;

use App\Http\Controllers\Api\ApiService;
use App\Http\Controllers\Api\Resources\PriceLists\Transformers\PriceListTransformer;
use App\Models\PriceList;

class PriceListApiService extends ApiService
{
    protected static string $model = PriceList::class;

    protected static string $slug = 'price-lists';

    protected static bool $scopedToTeam = true;

    /**
     * @var array<int, string>
     */
    protected static array $searchable = ['name', 'description'];

    /**
     * @var array<int, string>
     */
    protected static array $filterable = ['result_type', 'is_category', 'is_inventory'];

    /**
     * @var array<int, string>
     */
    protected static array $sortable = ['id', 'name', 'price', 'created_at', 'updated_at'];

    public static function getApiTransformer(): string
    {
        return PriceListTransformer::class;
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
