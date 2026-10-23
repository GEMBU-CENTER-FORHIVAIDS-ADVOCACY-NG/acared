<?php

namespace App\Http\Controllers\Api\Resources\Patients;

use App\Http\Controllers\Api\ApiService;
use App\Http\Controllers\Api\Resources\Patients\Transformers\PatientTransformer;
use App\Models\Patient;

class PatientApiService extends ApiService
{
    protected static string $model = Patient::class;

    protected static string $slug = 'patients';

    protected static bool $scopedToTeam = true;

    /**
     * @var array<int, string>
     */
    protected static array $searchable = ['firstName', 'lastName', 'email', 'phone', 'slug'];

    /**
     * @var array<int, string>
     */
    protected static array $filterable = ['category_id', 'gender'];

    /**
     * @var array<int, string>
     */
    protected static array $sortable = ['id', 'firstName', 'lastName', 'slug', 'created_at', 'updated_at'];

    public static function getApiTransformer(): string
    {
        return PatientTransformer::class;
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
