<?php

namespace App\Http\Controllers\Api\Resources\DrugForms\Handlers;

use App\Http\Controllers\Api\Handlers\DeleteHandler as BaseDeleteHandler;
use App\Http\Controllers\Api\Resources\DrugForms\DrugFormApiService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DeleteHandler extends BaseDeleteHandler
{
    public static ?string $uri = '/{id}';

    public static ?string $resource = DrugFormApiService::class;

    /**
     * Delete a drug form record.
     */
    public function handler(Request $request): JsonResponse
    {
        return $this->delete($request);
    }
}
