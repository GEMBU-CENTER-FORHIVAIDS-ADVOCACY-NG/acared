<?php

namespace App\Http\Controllers\Api\Resources\Nursings;

use App\Http\Controllers\Api\ApiService;
use App\Http\Controllers\Api\Resources\Nursings\Transformers\NursingTransformer;
use App\Models\Nursing;

class NursingApiService extends ApiService
{
    protected static string $model = Nursing::class;

    protected static string $slug = 'nursings';

    protected static bool $scopedToTeam = true;

    /**
     * @var array<int, string>
     */
    protected static array $searchable = ['patient_id', 'purpose', 'status'];

    /**
     * @var array<int, string>
     */
    protected static array $filterable = ['status'];

    /**
     * @var array<int, string>
     */
    protected static array $sortable = ['id', 'patient_id', 'status', 'created_at', 'updated_at'];

    public static function getApiTransformer(): string
    {
        return NursingTransformer::class;
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
