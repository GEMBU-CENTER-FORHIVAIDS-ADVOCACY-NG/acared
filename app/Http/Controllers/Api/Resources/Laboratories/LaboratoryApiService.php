<?php

namespace App\Http\Controllers\Api\Resources\Laboratories;

use App\Http\Controllers\Api\ApiService;
use App\Http\Controllers\Api\Resources\Laboratories\Transformers\LaboratoryTransformer;
use App\Models\Laboratory;

class LaboratoryApiService extends ApiService
{
    protected static string $model = Laboratory::class;

    protected static string $slug = 'laboratories';

    protected static bool $scopedToTeam = true;

    /**
     * @var array<int, string>
     */
    protected static array $searchable = ['patient_id', 'status'];

    /**
     * @var array<int, string>
     */
    protected static array $filterable = ['status'];

    /**
     * @var array<int, string>
     */
    protected static array $sortable = ['id', 'patient_id', 'total', 'status', 'created_at', 'updated_at'];

    public static function getApiTransformer(): string
    {
        return LaboratoryTransformer::class;
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
