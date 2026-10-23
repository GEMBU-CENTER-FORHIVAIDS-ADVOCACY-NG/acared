<?php

namespace App\Http\Controllers\Api\Resources\Users;

use App\Http\Controllers\Api\ApiService;
use App\Http\Controllers\Api\Resources\Users\Transformers\UserTransformer;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;

class UserApiService extends ApiService
{
    protected static string $model = User::class;

    protected static string $slug = 'users';

    protected static bool $scopedToTeam = false;

    /**
     * @var array<int, string>
     */
    protected static array $searchable = ['name', 'email'];

    /**
     * @var array<int, string>
     */
    protected static array $filterable = [];

    /**
     * @var array<int, string>
     */
    protected static array $sortable = ['id', 'name', 'email', 'created_at', 'updated_at'];

    /**
     * Limit the query to the users that share a team with the authenticated user.
     *
     * @param  Builder<User>  $query
     * @return Builder<User>
     */
    public static function scopeQuery(Builder $query): Builder
    {
        $teamIds = request()->user()?->teams?->pluck('id')->all() ?? [];

        return $query->whereHas('teams', fn (Builder $query): Builder => $query->whereIn('teams.id', $teamIds));
    }

    public static function getApiTransformer(): string
    {
        return UserTransformer::class;
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
