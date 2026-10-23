<?php

namespace App\Http\Controllers\Api\Resources\Billings;

use App\Http\Controllers\Api\ApiService;
use App\Http\Controllers\Api\Resources\Billings\Transformers\BillingTransformer;
use App\Models\Billing;

class BillingApiService extends ApiService
{
    protected static string $model = Billing::class;

    protected static string $slug = 'billings';

    protected static bool $scopedToTeam = true;

    /**
     * @var array<int, string>
     */
    protected static array $searchable = ['patient_id', 'status'];

    /**
     * @var array<int, string>
     */
    protected static array $filterable = ['status', 'patient_id'];

    /**
     * @var array<int, string>
     */
    protected static array $sortable = ['id', 'patient_id', 'total', 'status', 'created_at', 'updated_at'];

    public static function getApiTransformer(): string
    {
        return BillingTransformer::class;
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
