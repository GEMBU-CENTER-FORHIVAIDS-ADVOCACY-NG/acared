<?php

namespace App\Http\Controllers\Api\Resources\DrugForms\Handlers;

use App\Http\Controllers\Api\Handlers\UpdateHandler as BaseUpdateHandler;
use App\Http\Controllers\Api\Resources\DrugForms\DrugFormApiService;
use App\Http\Controllers\Api\Resources\DrugForms\Requests\UpdateDrugFormRequest;
use Illuminate\Http\JsonResponse;

class UpdateHandler extends BaseUpdateHandler
{
    public static ?string $uri = '/{id}';

    public static ?string $resource = DrugFormApiService::class;

    /**
     * Update a drug form record.
     */
    public function handler(UpdateDrugFormRequest $request): JsonResponse
    {
        return $this->update($request, $request->validated());
    }
}
