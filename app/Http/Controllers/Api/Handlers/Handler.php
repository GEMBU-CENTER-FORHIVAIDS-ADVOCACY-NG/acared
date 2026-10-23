<?php

namespace App\Http\Controllers\Api\Handlers;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Routing\Router;
use Illuminate\Support\Str;

abstract class Handler
{
    public const POST = 'post';

    public const GET = 'get';

    public const DELETE = 'delete';

    public const PATCH = 'patch';

    public const PUT = 'put';

    /**
     * The URI the handler is registered under.
     */
    public static ?string $uri = '/';

    /**
     * The HTTP method the handler responds to.
     */
    public static string $method = self::GET;

    /**
     * The API service the handler belongs to.
     */
    public static ?string $resource = null;

    /**
     * Get the HTTP method the handler responds to.
     */
    public static function getMethod(): string
    {
        return static::$method;
    }

    /**
     * Get the API service the handler belongs to.
     */
    public static function getResource(): string
    {
        return static::$resource;
    }

    /**
     * Get the Eloquent model exposed by the service.
     *
     * @return class-string<Model>
     */
    public static function getModel(): string
    {
        return static::getResource()::getModel();
    }

    /**
     * Get the key used to resolve a single record.
     */
    public static function getKeyName(): string
    {
        return static::getResource()::getKeyName();
    }

    /**
     * Get the transformer used to serialize the records.
     *
     * @return class-string<JsonResource>
     */
    public static function getApiTransformer(): string
    {
        return static::getResource()::getApiTransformer();
    }

    /**
     * Get the kebab cased name of the handler, used to name the route.
     */
    public static function getKebabClassName(): string
    {
        return Str::kebab(str(static::class)->beforeLast('Handler')->explode('\\')->last());
    }

    /**
     * Register the route of the handler.
     */
    public static function route(Router $router): void
    {
        $router
            ->{static::getMethod()}(static::$uri, [static::class, 'handler'])
            ->name(static::getKebabClassName());
    }

    /**
     * Get the query used to resolve the records of the handler.
     *
     * @return Builder<Model>
     */
    protected static function getEloquentQuery(): Builder
    {
        return static::getResource()::scopeQuery(static::getModel()::query());
    }

    /**
     * Find the record addressed by the request.
     */
    protected function findModel(Request $request): ?Model
    {
        return static::getEloquentQuery()
            ->where(static::getKeyName(), $request->route('id'))
            ->first();
    }

    /**
     * Get the team the authenticated user is currently working in.
     */
    protected function currentTeamId(): int
    {
        $teamId = request()->user()?->currentTeam?->getKey();

        abort_if($teamId === null, 403, 'The authenticated user does not have an active team.');

        return $teamId;
    }

    /**
     * Build the successful API response.
     */
    public static function sendSuccessResponse(mixed $data, string $message = 'ok'): JsonResponse
    {
        return response()->json([
            'message' => $message,
            'data' => $data,
        ]);
    }

    /**
     * Build the "not found" API response.
     */
    public static function sendNotFoundResponse(string $message = 'resource not found'): JsonResponse
    {
        return response()->json([
            'message' => $message,
        ], 404);
    }
}
