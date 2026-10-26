<?php

namespace App\Service;

use Carbon\CarbonImmutable;

final class DashboardDateRange
{
    public const FILTER_FIELD = 'period';

    public const DATE_RANGE_FIELD = 'created_at';

    public const DATE_RANGE_FORMAT = 'F j, Y';

    public const DATE_RANGE_SEPARATOR = ' - ';

    /**
     * @var array<string, string>
     */
    public const FILTERS = [
        'today' => 'Today',
        'week' => 'This week',
        'month' => 'This month',
        'last_month' => 'Last month',
        'year' => 'This year',
        'last_year' => 'Last year',
    ];

    /**
     * @return array{0: CarbonImmutable, 1: CarbonImmutable}
     */
    public static function range(?string $filter = 'today', ?CarbonImmutable $now = null): array
    {
        $now ??= CarbonImmutable::now();

        return match (self::normalize($filter)) {
            'today' => [$now->startOfDay(), $now->endOfDay()],
            'week' => [$now->startOfWeek(), $now->endOfWeek()],
            'last_month' => [
                $now->subMonthNoOverflow()->startOfMonth(),
                $now->subMonthNoOverflow()->endOfMonth(),
            ],
            'year' => [$now->startOfYear(), $now->endOfYear()],
            'last_year' => [
                $now->subYear()->startOfYear(),
                $now->subYear()->endOfYear(),
            ],
            default => [$now->startOfMonth(), $now->endOfMonth()],
        };
    }

    /**
     * @return list<array{start: CarbonImmutable, end: CarbonImmutable, label: string}>
     */
    public static function buckets(?string $filter = 'today', ?CarbonImmutable $now = null): array
    {
        $now ??= CarbonImmutable::now();

        return match (self::normalize($filter)) {
            'today' => self::hourlyBuckets($now),
            'week' => self::dailyBuckets($now->startOfWeek(), 7, 'l'),
            'month' => self::dailyBuckets($now->startOfMonth(), $now->daysInMonth, 'M j'),
            'last_month' => self::dailyBuckets(
                $now->subMonthNoOverflow()->startOfMonth(),
                $now->subMonthNoOverflow()->daysInMonth,
                'M j',
            ),
            'year' => self::monthlyBuckets($now->startOfYear()),
            'last_year' => self::monthlyBuckets($now->subYear()->startOfYear()),
            default => self::dailyBuckets($now->startOfMonth(), $now->daysInMonth, 'M j'),
        };
    }

    public static function label(?string $filter): string
    {
        return self::FILTERS[self::normalize($filter)];
    }

    /**
     * @param  array<string, mixed>|null  $pageFilters
     */
    public static function periodFromPageFilters(?array $pageFilters): string
    {
        $filter = $pageFilters[self::FILTER_FIELD] ?? null;

        return self::normalize(is_string($filter) ? $filter : null);
    }

    /**
     * @param  array<string, mixed>|null  $pageFilters
     * @return array{0: CarbonImmutable, 1: CarbonImmutable}
     */
    public static function rangeFromPageFilters(?array $pageFilters, ?CarbonImmutable $now = null): array
    {
        $now ??= CarbonImmutable::now();
        $dateRange = self::dateRangeFromPageFilters($pageFilters);

        if ($dateRange !== null) {
            [$start, $end] = $dateRange;

            if ($start->greaterThan($end)) {
                [$start, $end] = [$end, $start];
            }

            return [$start->startOfDay(), $end->endOfDay()];
        }

        return self::range(self::periodFromPageFilters($pageFilters), $now);
    }

    /**
     * @param  array<string, mixed>|null  $pageFilters
     * @return list<array{start: CarbonImmutable, end: CarbonImmutable, label: string}>
     */
    public static function bucketsFromPageFilters(?array $pageFilters, ?CarbonImmutable $now = null): array
    {
        [$start, $end] = self::rangeFromPageFilters($pageFilters, $now);

        return self::bucketsForRange($start, $end);
    }

    public static function labelFromPageFilters(?array $pageFilters, ?CarbonImmutable $now = null): string
    {
        $dateRange = self::dateRangeFromPageFilters($pageFilters);

        if ($dateRange === null) {
            return self::label(self::periodFromPageFilters($pageFilters));
        }

        [$start, $end] = $dateRange;

        if ($start->greaterThan($end)) {
            [$start, $end] = [$end, $start];
        }

        if ($start->isSameDay($end)) {
            return $start->format(self::DATE_RANGE_FORMAT);
        }

        return $start->format(self::DATE_RANGE_FORMAT).self::DATE_RANGE_SEPARATOR.$end->format(self::DATE_RANGE_FORMAT);
    }

    private static function normalize(?string $filter): string
    {
        return is_string($filter) && array_key_exists($filter, self::FILTERS)
            ? $filter
            : 'today';
    }

    /**
     * @return list<array{start: CarbonImmutable, end: CarbonImmutable, label: string}>
     */
    public static function bucketsForRange(CarbonImmutable $start, CarbonImmutable $end): array
    {
        $start = $start->startOfDay();
        $end = $end->endOfDay();
        $days = (int) $start->diffInDays($end) + 1;

        if ($days <= 1) {
            return self::hourlyBuckets($start);
        }

        if ($days <= 62) {
            $labelFormat = $start->year === $end->year ? 'M j' : 'M j, Y';

            return self::dailyBuckets($start, $days, $labelFormat);
        }

        return self::monthlyBucketsForRange($start, $end);
    }

    /**
     * @param  array<string, mixed>|null  $pageFilters
     * @return array{0: CarbonImmutable, 1: CarbonImmutable}|null
     */
    private static function dateRangeFromPageFilters(?array $pageFilters): ?array
    {
        $value = $pageFilters[self::DATE_RANGE_FIELD] ?? null;

        if (! is_string($value)) {
            return null;
        }

        $parts = explode(self::DATE_RANGE_SEPARATOR, $value, 2);

        if (count($parts) !== 2) {
            return null;
        }

        $start = self::parseDate(trim($parts[0]));
        $end = self::parseDate(trim($parts[1]));

        if ($start === null || $end === null) {
            return null;
        }

        return [$start, $end];
    }

    private static function parseDate(string $value): ?CarbonImmutable
    {
        try {
            $date = CarbonImmutable::createFromFormat(
                '!'.self::DATE_RANGE_FORMAT,
                $value,
                'UTC',
            );
        } catch (\Throwable) {
            return null;
        }

        return $date === false ? null : $date;
    }

    /**
     * @return list<array{start: CarbonImmutable, end: CarbonImmutable, label: string}>
     */
    private static function monthlyBucketsForRange(CarbonImmutable $start, CarbonImmutable $end): array
    {
        $cursor = $start->startOfMonth();
        $buckets = [];

        while ($cursor->lessThanOrEqualTo($end)) {
            $nextMonth = $cursor->addMonthNoOverflow()->startOfMonth();
            $bucketStart = $cursor->lessThan($start) ? $start : $cursor;
            $bucketEnd = $nextMonth->greaterThan($end)
                ? $end->addDay()->startOfDay()
                : $nextMonth;
            $label = $cursor->year === $end->year
                ? $cursor->format('F')
                : $cursor->format('M Y');

            $buckets[] = [
                'start' => $bucketStart,
                'end' => $bucketEnd,
                'label' => $label,
            ];

            $cursor = $nextMonth;
        }

        return $buckets;
    }

    /**
     * @return list<array{start: CarbonImmutable, end: CarbonImmutable, label: string}>
     */
    private static function hourlyBuckets(CarbonImmutable $date): array
    {
        $start = $date->startOfDay();

        return array_map(
            static fn (int $hour): array => [
                'start' => $start->addHours($hour),
                'end' => $start->addHours($hour + 1),
                'label' => $start->addHours($hour)->format('g A'),
            ],
            range(0, 23),
        );
    }

    /**
     * @return list<array{start: CarbonImmutable, end: CarbonImmutable, label: string}>
     */
    private static function dailyBuckets(CarbonImmutable $start, int $days, string $labelFormat): array
    {
        return array_map(
            static fn (int $day): array => [
                'start' => $start->addDays($day),
                'end' => $start->addDays($day + 1),
                'label' => $start->addDays($day)->format($labelFormat),
            ],
            range(0, $days - 1),
        );
    }

    /**
     * @return list<array{start: CarbonImmutable, end: CarbonImmutable, label: string}>
     */
    private static function monthlyBuckets(CarbonImmutable $start): array
    {
        return array_map(
            static fn (int $month): array => [
                'start' => $start->addMonths($month - 1),
                'end' => $start->addMonths($month),
                'label' => $start->addMonths($month - 1)->format('F'),
            ],
            range(1, 12),
        );
    }
}
