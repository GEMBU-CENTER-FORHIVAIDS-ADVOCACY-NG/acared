import { Link } from '@inertiajs/react';
import type { NursingDailyTimelineEvent } from '@/types';

type Props = {
    events: NursingDailyTimelineEvent[];
};

const STATUS_LABEL: Record<string, string> = {
    scheduled: 'Scheduled',
    in_progress: 'In progress',
    completed: 'Completed',
};

const STATUS_BADGE: Record<string, string> = {
    scheduled: 'bg-sky-100 text-sky-800',
    in_progress: 'bg-amber-100 text-amber-800',
    completed: 'bg-emerald-100 text-emerald-800',
};

export default function NursingDayTimeline({ events }: Props) {
    const sortedEvents = [...events].sort((a, b) =>
        a.startsAt.localeCompare(b.startsAt)
    );

    if (sortedEvents.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-8 text-center">
                <p className="text-sm text-muted-foreground">
                    No maternity visits scheduled for today.
                </p>
            </div>
        );
    }

    return (
        <div className="flex flex-col space-y-3">
            {sortedEvents.map((event) => (
                <Link
                    key={event.id}
                    href={event.url}
                    className="flex items-center gap-3 rounded-lg border-l-[3px] px-3 py-2.5 shadow-sm transition-shadow hover:shadow-md"
                    style={{
                        backgroundColor: `${event.color}15`,
                        borderLeftColor: event.color,
                    }}
                >
                    {/* Time label */}
                    <div className="shrink-0 text-right">
                        <div className="text-sm font-semibold text-foreground">
                            {event.startsAt}
                        </div>
                        {event.endsAt && (
                            <div className="text-xs text-muted-foreground">
                                {event.endsAt}
                            </div>
                        )}
                    </div>

                    {/* Event details */}
                    <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                            <span className="truncate text-sm font-medium text-foreground">
                                {event.title}
                            </span>
                            <span
                                className={`ml-2 shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                                    STATUS_BADGE[event.status] ??
                                    'bg-muted text-muted-foreground'
                                }`}
                            >
                                {STATUS_LABEL[event.status] ?? event.status}
                            </span>
                        </div>
                    </div>
                </Link>
            ))}
        </div>
    );
}
