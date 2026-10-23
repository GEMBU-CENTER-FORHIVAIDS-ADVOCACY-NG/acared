<?php

namespace App\Http\Controllers\Api\Resources\Consultations;

use App\Http\Controllers\Api\ApiService;
use App\Http\Controllers\Api\Resources\Consultations\Transformers\ConsultationTransformer;
use App\Models\Appointment;

class ConsultationApiService extends ApiService
{
    protected static string $model = Appointment::class;

    protected static string $slug = 'consultations';

    protected static bool $scopedToTeam = true;

    /**
     * @var array<int, string>
     */
    protected static array $searchable = ['patient_id', 'purpose', 'status'];

    /**
     * @var array<int, string>
     */
    protected static array $filterable = ['status', 'doctor_id'];

    /**
     * @var array<int, string>
     */
    protected static array $sortable = ['id', 'patient_id', 'starts_at', 'status', 'created_at', 'updated_at'];

    public static function getApiTransformer(): string
    {
        return ConsultationTransformer::class;
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
