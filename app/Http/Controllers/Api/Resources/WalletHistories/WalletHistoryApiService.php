<?php

namespace App\Http\Controllers\Api\Resources\WalletHistories;

use App\Http\Controllers\Api\ApiService;
use App\Http\Controllers\Api\Resources\WalletHistories\Transformers\WalletHistoryTransformer;
use App\Models\WalletHistory;

class WalletHistoryApiService extends ApiService
{
    protected static string $model = WalletHistory::class;

    protected static string $slug = 'wallet-histories';

    protected static bool $scopedToTeam = true;

    /**
     * @var array<int, string>
     */
    protected static array $searchable = ['patient_id'];

    /**
     * @var array<int, string>
     */
    protected static array $filterable = ['method_id'];

    /**
     * @var array<int, string>
     */
    protected static array $sortable = ['id', 'patient_id', 'credit', 'debit', 'created_at', 'updated_at'];

    public static function getApiTransformer(): string
    {
        return WalletHistoryTransformer::class;
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
