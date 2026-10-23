<?php

namespace App\Http\Controllers\Api\Resources\Markups;

use App\Http\Controllers\Api\ApiService;
use App\Http\Controllers\Api\Resources\Markups\Transformers\MarkupTransformer;
use App\Models\Markup;

class MarkupApiService extends ApiService
{
    protected static string $model = Markup::class;

    protected static string $slug = 'markups';

    protected static bool $scopedToTeam = true;

    /**
     * @var array<int, string>
     */
    protected static array $searchable = ['name'];

    /**
     * @var array<int, string>
     */
    protected static array $filterable = [];

    /**
     * @var array<int, string>
     */
    protected static array $sortable = ['id', 'name', 'value', 'created_at', 'updated_at'];

    public static function getApiTransformer(): string
    {
        return MarkupTransformer::class;
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
