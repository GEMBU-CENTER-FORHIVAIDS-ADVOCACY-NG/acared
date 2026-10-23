<?php

namespace App\Service;

use App\Models\Appointment;
use Carbon\CarbonImmutable;
use Carbon\CarbonInterface;

final class ConsultationSlotGrid
{
    public const OPEN_AT = '08:00';

    public const CLOSE_AT = '17:00';

    /**
     * Build the appointment slot grid for a single day.
     *
     * @param  array<int, array{start: CarbonInterface, end: CarbonInterface|null}>  $busy
     * @return list<array{start: CarbonImmutable, label: string, status: 'available'|'booked'|'past'}>
     */
    public static function slots(CarbonInterface $date, array $busy = [], ?CarbonInterface $now = null): array
    {
        $now = $now === null ? CarbonImmutable::now() : CarbonImmutable::instance($now);

        $open = $date->toImmutable()->startOfDay()->setTimeFromTimeString(self::OPEN_AT);
        $close = $open->setTimeFromTimeString(self::CLOSE_AT);
        $duration = Appointment::DEFAULT_DURATION_MINUTES;

        $slots = [];

        for ($start = $open; $start->lessThan($close); $start = $start->addMinutes($duration)) {
            $end = $start->addMinutes($duration);

            if ($end->greaterThan($close)) {
                break;
            }

            $slots[] = [
                'start' => $start,
                'label' => $start->format('H:i'),
                'status' => self::status($start, $end, $busy, $now),
            ];
        }

        return $slots;
    }

    /**
     * @param  array<int, array{start: CarbonInterface, end: CarbonInterface|null}>  $busy
     * @return 'available'|'booked'|'past'
     */
    private static function status(CarbonImmutable $start, CarbonImmutable $end, array $busy, CarbonImmutable $now): string
    {
        if ($end->lessThanOrEqualTo($now)) {
            return 'past';
        }

        foreach ($busy as $period) {
            $busyStart = $period['start']->toImmutable();
            $busyEnd = ($period['end'] ?? null)?->toImmutable()
                ?? $busyStart->addMinutes(Appointment::DEFAULT_DURATION_MINUTES);

            if ($start->lessThan($busyEnd) && $end->greaterThan($busyStart)) {
                return 'booked';
            }
        }

        return 'available';
    }
}
