<?php

namespace App\Http\Controllers\Api\Resources\DrugForms\Handlers;

use App\Http\Controllers\Api\Handlers\CreateHandler as BaseCreateHandler;
use App\Http\Controllers\Api\Resources\DrugForms\DrugFormApiService;
use App\Http\Controllers\Api\Resources\DrugForms\Requests\CreateDrugFormRequest;
use Illuminate\Http\JsonResponse;

class CreateHandler extends BaseCreateHandler
{
    public static ?string $uri = '/';

    public static ?string $resource = DrugFormApiService::class;

    /**
     * Create a drug form record.
     */
    public function handler(CreateDrugFormRequest $request): JsonResponse
    {
        return $this->create($request->validated());
    }
}
