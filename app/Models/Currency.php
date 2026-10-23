<?php

namespace App\Models;

use Carbon\CarbonInterface;
use Illuminate\Database\Eloquent\Model;

/**
 * @property int $id
 * @property string $alpha3
 * @property int $number
 * @property int $decimals
 * @property string $langEN
 * @property string $langIT
 * @property string|null $symbol_decimal
 * @property string|null $symbol_hex
 * @property CarbonInterface|null $created_at
 * @property CarbonInterface|null $updated_at
 * @property-read ?string $symbol
 */
class Currency extends Model
{
    protected $guarded = [];

    public function getSymbolAttribute(): ?string
    {
        if (! $this->symbol_hex) {
            return null;
        }

        $codePoints = explode(';', $this->symbol_hex);

        return implode('', array_map(function ($hex) {
            $code = hexdec($hex);

            // mb_chr may not exist in older PHP versions, but in PHP 8+ it does.
            return function_exists('mb_chr') ? mb_chr($code, 'UTF-8') : chr($code);
        }, $codePoints));
    }
}
