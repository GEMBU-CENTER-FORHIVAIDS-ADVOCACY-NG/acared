<?php

namespace App\Http\Controllers\Api\Resources\Vendors;

use App\Http\Controllers\Api\ApiService;
use App\Http\Controllers\Api\Resources\Vendors\Transformers\VendorTransformer;
use App\Models\Vendor;

class VendorApiService extends ApiService
{
    protected static string $model = Vendor::class;

    protected static string $slug = 'vendors';

    protected static bool $scopedToTeam = true;

    /**
     * @var array<int, string>
     */
    protected static array $searchable = ['name', 'email', 'company'];

    /**
     * @var array<int, string>
     */
    protected static array $filterable = [];

    /**
     * @var array<int, string>
     */
    protected static array $sortable = ['id', 'name', 'email', 'created_at', 'updated_at'];

    public static function getApiTransformer(): string
    {
        return VendorTransformer::class;
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
