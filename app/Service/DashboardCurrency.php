<?php

namespace App\Service;

use App\Models\Currency;
use Illuminate\Support\Number;

final class DashboardCurrency
{
    public static function symbol(): string
    {
        $symbol = Currency::query()
            ->select(['id', 'symbol_hex'])
            ->where('alpha3', config('currency.default_code', 'NGN'))
            ->first()?->symbol;

        return filled($symbol)
            ? $symbol
            : (string) config('currency.fallback_symbol', '₦');
    }

    public static function format(
        int|float|string $amount,
        int $precision = 2,
        ?string $symbol = null,
    ): string {
        return ($symbol ?? self::symbol()).Number::format((float) $amount, $precision);
    }
}
