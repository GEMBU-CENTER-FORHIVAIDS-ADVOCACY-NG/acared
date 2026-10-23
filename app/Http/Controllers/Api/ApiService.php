<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\Transformers\DefaultTransformer;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Routing\Router;
use Illuminate\Support\Facades\Route;

abstract class ApiService
{
    /**
     * The Eloquent model exposed by the service.
     *
     * @var class-string<Model>
     */
    protected static string $model;

    /**
     * The URL segment the service is registered under.
     */
    protected static string $slug;

    /**
     * The key used to resolve a single record.
     */
    protected static string $keyName = 'id';

    /**
     * Whether the records belong to the team of the authenticated user.
     */
    protected static bool $scopedToTeam = true;

    /**
     * The columns that may be searched with the "q" query parameter.
     *
     * @var array<int, string>
     */
    protected static array $searchable = [];

    /**
     * The columns that may be filtered with the "filter" query parameter.
     *
     * @var array<int, string>
     */
    protected static array $filterable = [];

    /**
     * The columns that may be sorted with the "sort" query parameter.
     *
     * @var array<int, string>
     */
    protected static array $sortable = ['id', 'created_at', 'updated_at'];

    /**
     * The number of records returned per page by default.
     */
    protected static int $perPage = 25;

    /**
     * The maximum number of records that may be returned per page.
     */
    protected static int $maxPerPage = 100;

    /**
     * Get the Eloquent model exposed by the service.
     *
     * @return class-string<Model>
     */
    public static function getModel(): string
    {
        return static::$model;
    }

    /**
     * Get the URL segment the service is registered under.
     */
    public static function getSlug(): string
    {
        return static::$slug;
    }

    /**
     * Get the key used to resolve a single record.
     */
    public static function getKeyName(): string
    {
        return static::$keyName;
    }

    /**
     * Determine whether the records belong to the team of the authenticated user.
     */
    public static function isScopedToTeam(): bool
    {
        return static::$scopedToTeam;
    }

    /**
     * @return array<int, string>
     */
    public static function getSearchable(): array
    {
        return static::$searchable;
    }

    /**
     * @return array<int, string>
     */
    public static function getFilterable(): array
    {
        return static::$filterable;
    }

    /**
     * @return array<int, string>
     */
    public static function getSortable(): array
    {
        return static::$sortable;
    }

    /**
     * Get the number of records returned per page by default.
     */
    public static function getPerPage(): int
    {
        return static::$perPage;
    }

    /**
     * Get the maximum number of records that may be returned per page.
     */
    public static function getMaxPerPage(): int
    {
        return static::$maxPerPage;
    }

    /**
     * Get the transformer used to serialize the records.
     *
     * @return class-string<JsonResource>
     */
    public static function getApiTransformer(): string
    {
        return DefaultTransformer::class;
    }

    /**
     * Get the handlers registered for the service.
     *
     * @return array<int, class-string>
     */
    public static function handlers(): array
    {
        return [];
    }

    /**
     * Narrow the query of the service.
     *
     * @param  Builder<Model>  $query
     * @return Builder<Model>
     */
    public static function scopeQuery(Builder $query): Builder
    {
        return $query;
    }

    /**
     * Register the routes of the service.
     */
    public static function registerRoutes(): void
    {
        Route::name(static::getSlug().'.')
            ->prefix(static::getSlug())
            ->middleware(['auth:api', 'throttle:api'])
            ->group(function (Router $router): void {
                foreach (static::handlers() as $handler) {
                    $handler::route($router);
                }
            });
    }
}
