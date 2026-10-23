<?php

namespace App\Http\Controllers\Api\Resources\DrugForms;

use App\Http\Controllers\Api\ApiService;
use App\Http\Controllers\Api\Resources\DrugForms\Transformers\DrugFormTransformer;
use App\Models\DrugForm;

class DrugFormApiService extends ApiService
{
    protected static string $model = DrugForm::class;

    protected static string $slug = 'drug-forms';

    protected static bool $scopedToTeam = true;

    /**
     * @var array<int, string>
     */
    protected static array $searchable = ['name'];

    /**
     * @var array<int, string>
     */
    protected static array $filterable = [];

    /**
     * @var array<int, string>
     */
    protected static array $sortable = ['id', 'name', 'created_at', 'updated_at'];

    public static function getApiTransformer(): string
    {
        return DrugFormTransformer::class;
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
