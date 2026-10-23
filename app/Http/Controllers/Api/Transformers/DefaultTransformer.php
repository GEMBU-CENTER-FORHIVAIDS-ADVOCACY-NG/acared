<?php

namespace App\Http\Controllers\Api\Transformers;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @template TModel of Model
 */
class DefaultTransformer extends JsonResource
{
    /**
     * The model being transformed.
     *
     * @var TModel
     */
    public $resource;

    /**
     * Transform the resource into an array.
     *
     * @param  Request  $request
     * @return array<string, mixed>
     */
    public function toArray($request): array
    {
        return $this->resource->toArray();
    }
}
