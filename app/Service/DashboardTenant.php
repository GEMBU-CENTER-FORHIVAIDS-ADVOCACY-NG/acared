<?php

namespace App\Service;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;

final class DashboardTenant
{
    /**
     * Scope the query to the team of the authenticated user.
     *
     * @template TModel of Model
     *
     * @param  Builder<TModel>  $query
     * @return Builder<TModel>
     */
    public static function apply(Builder $query, string $column = 'team_id'): Builder
    {
        $tenantId = self::id();

        if ($tenantId !== null) {
            return $query->where($column, $tenantId);
        }

        return app()->runningInConsole()
            ? $query
            : $query->whereRaw('1 = 0');
    }

    public static function id(): ?int
    {
        $tenantId = auth()->user()?->currentTeam?->getKey();

        return $tenantId === null ? null : (int) $tenantId;
    }
}
