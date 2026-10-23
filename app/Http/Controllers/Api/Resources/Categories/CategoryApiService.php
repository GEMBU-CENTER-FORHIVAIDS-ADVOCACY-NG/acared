<?php

namespace App\Http\Controllers\Api\Resources\Categories;

use App\Http\Controllers\Api\ApiService;
use App\Http\Controllers\Api\Resources\Categories\Transformers\CategoryTransformer;
use App\Models\Category;

class CategoryApiService extends ApiService
{
    protected static string $model = Category::class;

    protected static string $slug = 'categories';

    protected static bool $scopedToTeam = true;

    /**
     * @var array<int, string>
     */
    protected static array $searchable = ['name', 'description'];

    /**
     * @var array<int, string>
     */
    protected static array $filterable = ['discount_percentage'];

    /**
     * @var array<int, string>
     */
    protected static array $sortable = ['id', 'name', 'discount_percentage', 'created_at', 'updated_at'];

    public static function getApiTransformer(): string
    {
        return CategoryTransformer::class;
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
