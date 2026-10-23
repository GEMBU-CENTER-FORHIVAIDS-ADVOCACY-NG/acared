<?php

namespace App\Http\Controllers\Api\Resources\Wards;

use App\Http\Controllers\Api\ApiService;
use App\Http\Controllers\Api\Resources\Wards\Transformers\WardTransformer;
use App\Models\Ward;

class WardApiService extends ApiService
{
    protected static string $model = Ward::class;

    protected static string $slug = 'wards';

    protected static bool $scopedToTeam = true;

    /**
     * @var array<int, string>
     */
    protected static array $searchable = ['name', 'description'];

    /**
     * @var array<int, string>
     */
    protected static array $filterable = ['status', 'is_ward'];

    /**
     * @var array<int, string>
     */
    protected static array $sortable = ['id', 'name', 'capacity', 'status', 'created_at', 'updated_at'];

    public static function getApiTransformer(): string
    {
        return WardTransformer::class;
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
