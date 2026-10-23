<?php

namespace App\Http\Controllers\Api\Handlers;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

abstract class PaginationHandler extends Handler
{
    public static ?string $uri = '/';

    public static string $method = self::GET;

    /**
     * Get the paginated records of the service.
     */
    public function paginate(Request $request): AnonymousResourceCollection
    {
        $query = static::getEloquentQuery();

        $this->applySearch($query, $request);
        $this->applyFilters($query, $request);
        $this->applySorting($query, $request);

        $paginator = $query
            ->paginate($this->perPage($request))
            ->appends($request->query());

        return static::getApiTransformer()::collection($paginator);
    }

    /**
     * Get the number of records to return per page.
     */
    protected function perPage(Request $request): int
    {
        $perPage = (int) $request->query('per_page', static::getResource()::getPerPage());

        return max(1, min($perPage, static::getResource()::getMaxPerPage()));
    }

    /**
     * Apply the "q" search to the query.
     *
     * @param  Builder<Model>  $query
     */
    protected function applySearch(Builder $query, Request $request): void
    {
        $term = trim((string) $request->query('q', ''));

        $searchable = static::getResource()::getSearchable();

        if ($term === '' || $searchable === []) {
            return;
        }

        $query->where(function (Builder $query) use ($searchable, $term): void {
            foreach ($searchable as $column) {
                $query->orWhere($column, 'like', "%{$term}%");
            }
        });
    }

    /**
     * Apply the "filter" parameters to the query.
     *
     * @param  Builder<Model>  $query
     */
    protected function applyFilters(Builder $query, Request $request): void
    {
        $filters = $request->query('filter', []);

        if (! is_array($filters)) {
            return;
        }

        foreach ($filters as $column => $value) {
            if (! in_array($column, static::getResource()::getFilterable(), true)) {
                continue;
            }

            if ($value === null || $value === '') {
                continue;
            }

            $query->where($column, $value);
        }
    }

    /**
     * Apply the "sort" and "direction" parameters to the query.
     *
     * @param  Builder<Model>  $query
     */
    protected function applySorting(Builder $query, Request $request): void
    {
        $column = (string) $request->query('sort', '');

        if (! in_array($column, static::getResource()::getSortable(), true)) {
            return;
        }

        $direction = $request->query('direction') === 'asc' ? 'asc' : 'desc';

        $query->orderBy($column, $direction);
    }
}
