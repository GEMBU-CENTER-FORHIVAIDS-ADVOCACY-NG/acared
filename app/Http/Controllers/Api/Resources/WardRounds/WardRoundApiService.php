<?php

namespace App\Http\Controllers\Api\Resources\WardRounds;

use App\Http\Controllers\Api\ApiService;
use App\Http\Controllers\Api\Resources\WardRounds\Transformers\WardRoundTransformer;
use App\Models\Admission;

class WardRoundApiService extends ApiService
{
    protected static string $model = Admission::class;

    protected static string $slug = 'ward-rounds';

    protected static bool $scopedToTeam = true;

    /**
     * @var array<int, string>
     */
    protected static array $searchable = ['patient_id', 'notes', 'status'];

    /**
     * @var array<int, string>
     */
    protected static array $filterable = ['status', 'ward_id'];

    /**
     * @var array<int, string>
     */
    protected static array $sortable = ['id', 'patient_id', 'status', 'created_at', 'updated_at'];

    public static function getApiTransformer(): string
    {
        return WardRoundTransformer::class;
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
