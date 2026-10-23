<?php

namespace App\Http\Controllers\Api\Resources\Methods;

use App\Http\Controllers\Api\ApiService;
use App\Http\Controllers\Api\Resources\Methods\Transformers\MethodTransformer;
use App\Models\Method;

class MethodApiService extends ApiService
{
    protected static string $model = Method::class;

    protected static string $slug = 'methods';

    protected static bool $scopedToTeam = true;

    /**
     * @var array<int, string>
     */
    protected static array $searchable = ['name', 'description'];

    /**
     * @var array<int, string>
     */
    protected static array $filterable = [];

    /**
     * @var array<int, string>
     */
    protected static array $sortable = ['id', 'name', 'created_at', 'updated_at'];

    public static function getApiTransformer(): string
    {
        return MethodTransformer::class;
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
