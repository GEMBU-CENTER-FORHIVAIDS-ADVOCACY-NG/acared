<?php

namespace App\Service;

use Carbon\CarbonImmutable;
use Illuminate\Database\Eloquent\Builder;
use InvalidArgumentException;

final class DashboardTimeSeries
{
    private const IDENTIFIER_PATTERN = '/^[A-Za-z_][A-Za-z0-9_.]*$/';

    /**
     * @param  list<array{start: CarbonImmutable, end: CarbonImmutable, label: string}>  $buckets
     * @return list<float>
     */
    public static function aggregate(
        Builder $query,
        string $column,
        array $buckets,
        bool $onlyPositive = false,
        string $dateColumn = 'created_at',
    ): array {
        $values = self::aggregateMany(
            query: $query,
            columns: [$column],
            buckets: $buckets,
            onlyPositiveColumns: $onlyPositive ? [$column] : [],
            dateColumn: $dateColumn,
        );

        return $values[$column] ?? [];
    }

    /**
     * @param  list<string>  $columns
     * @param  list<array{start: CarbonImmutable, end: CarbonImmutable, label: string}>  $buckets
     * @param  list<string>  $onlyPositiveColumns
     * @return array<string, list<float>>
     */
    public static function aggregateMany(
        Builder $query,
        array $columns,
        array $buckets,
        array $onlyPositiveColumns = [],
        string $dateColumn = 'created_at',
    ): array {
        $columns = array_values(array_unique($columns));

        if ($columns === [] || $buckets === []) {
            return array_fill_keys($columns, []);
        }

        self::assertIdentifier($dateColumn, 'The date column must be a valid identifier.');

        foreach ($columns as $column) {
            self::assertIdentifier($column);
        }

        foreach ($onlyPositiveColumns as $column) {
            self::assertIdentifier($column);

            if (! in_array($column, $columns, true)) {
                throw new InvalidArgumentException('Positive columns must be included in the aggregate columns.');
            }
        }

        $query = clone $query;

        $grammar = $query->getQuery()->getGrammar();
        $wrappedDateColumn = $grammar->wrap($dateColumn);
        $wrappedColumns = [];

        foreach ($columns as $columnIndex => $column) {
            $wrappedColumns[$columnIndex] = $grammar->wrap($column);
        }

        $selects = [];
        $bindings = [];

        foreach ($columns as $columnIndex => $column) {
            $positiveCondition = in_array($column, $onlyPositiveColumns, true)
                ? " AND {$wrappedColumns[$columnIndex]} > 0"
                : '';

            foreach (array_values($buckets) as $bucketIndex => $bucket) {
                $alias = "metric_{$columnIndex}_bucket_{$bucketIndex}";
                $selects[] = "COALESCE(SUM(CASE WHEN {$wrappedDateColumn} >= ? AND {$wrappedDateColumn} < ?{$positiveCondition} THEN {$wrappedColumns[$columnIndex]} ELSE 0 END), 0) AS {$alias}";
                $bindings[] = $bucket['start'];
                $bindings[] = $bucket['end'];
            }
        }

        $firstBucket = $buckets[array_key_first($buckets)];
        $lastBucket = $buckets[array_key_last($buckets)];

        $result = $query
            ->where($dateColumn, '>=', $firstBucket['start'])
            ->where($dateColumn, '<', $lastBucket['end'])
            ->selectRaw(implode(', ', $selects), $bindings)
            ->toBase()
            ->first();

        $values = [];

        foreach ($columns as $columnIndex => $column) {
            $values[$column] = array_map(
                static fn (int $bucketIndex): float => (float) ($result?->{'metric_'.$columnIndex.'_bucket_'.$bucketIndex} ?? 0),
                array_keys(array_values($buckets)),
            );
        }

        return $values;
    }

    private static function assertIdentifier(
        string $identifier,
        string $message = 'The aggregate column must be a valid identifier.',
    ): void {
        if (! preg_match(self::IDENTIFIER_PATTERN, $identifier)) {
            throw new InvalidArgumentException($message);
        }
    }
}
