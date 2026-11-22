import { Link } from '@inertiajs/react';
import type { NursingDailyTimelineEvent } from '@/types';

type Props = {
    events: NursingDailyTimelineEvent[];
};

type ColumnKey = 'scheduled' | 'inProgress' | 'completed';

const STATUS_BADGE: Record<string, string> = {
    scheduled: 'bg-sky-100 text-sky-800 dark:bg-sky-500/15 dark:text-sky-300',
    in_progress:
        'bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300',
    started:
        'bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300',
    completed:
        'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300',
};

const VISIT_LABEL: Record<string, string> = {
    new: 'New',
    revisit: 'Revisit',
};

const VISIT_BADGE: Record<string, string> = {
    new: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300',
    revisit:
        'bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300',
};

const CATEGORY_BADGE: Record<string, string> = {
    art: 'bg-red-100 text-red-800 dark:bg-red-500/15 dark:text-red-300',
    employee:
        'bg-indigo-100 text-indigo-800 dark:bg-indigo-500/15 dark:text-indigo-300',
    'employee relation':
        'bg-teal-100 text-teal-800 dark:bg-teal-500/15 dark:text-teal-300',
    general: 'bg-muted text-muted-foreground',
};

const COLUMNS: {
    key: ColumnKey;
    title: string;
    badge: string;
}[] = [
    {
        key: 'scheduled',
        title: 'Scheduled',
        badge: STATUS_BADGE.scheduled,
    },
    {
        key: 'inProgress',
        title: 'In progress',
        badge: STATUS_BADGE.in_progress,
    },
    {
        key: 'completed',
        title: 'Completed',
        badge: STATUS_BADGE.completed,
    },
];

function getCategoryBadge(categoryName: string | null): {
    label: string;
    className: string;
} {
    if (!categoryName) {
        return { label: 'General', className: CATEGORY_BADGE.general };
    }

    const lower = categoryName.toLowerCase();

    if (lower.includes('art')) {
        return { label: categoryName, className: CATEGORY_BADGE.art };
    }

    if (lower.includes('employee relation')) {
        return {
            label: categoryName,
            className: CATEGORY_BADGE['employee relation'],
        };
    }

    if (lower.includes('employee')) {
        return { label: categoryName, className: CATEGORY_BADGE.employee };
    }

    return { label: categoryName, className: CATEGORY_BADGE.general };
}

function columnForStatus(status: string): ColumnKey {
    if (status === 'in_progress' || status === 'started') {
        return 'inProgress';
    }

    if (status === 'completed') {
        return 'completed';
    }

    return 'scheduled';
}

function EventCard({ event }: { event: NursingDailyTimelineEvent }) {
    return (
        <Link
            href={event.url}
            className="flex items-center gap-3 rounded-lg border-l-[3px] px-2.5 py-2 shadow-sm transition-shadow hover:shadow-md"
            style={{
                backgroundColor: `${event.color}15`,
                borderLeftColor: event.color,
            }}
        >
            <div className="shrink-0 text-right">
                <div className="text-sm font-semibold text-foreground">
                    {event.startsAt}
                </div>
                {event.endsAt ? (
                    <div className="text-xs text-muted-foreground">
                        {event.endsAt}
                    </div>
                ) : null}
            </div>

            <div className="min-w-0 flex-1">
                <div className="text-sm leading-snug font-medium break-words text-foreground">
                    {event.title}
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-1.5">
                    <span
                        className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                            VISIT_BADGE[event.visitType] ??
                            'bg-muted text-muted-foreground'
                        }`}
                    >
                        {VISIT_LABEL[event.visitType] ?? event.visitType}
                    </span>
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    {(() => {
                        const { label, className: badgeClassName } =
                            getCategoryBadge(event.categoryName);

                        return (
                            <span
                                className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${badgeClassName}`}
                            >
                                {label}
                            </span>
                        );
                    })()}
                </div>
            </div>
        </Link>
    );
}

export default function NursingDayTimeline({ events }: Props) {
    const sortedEvents = [...events].sort((a, b) =>
        a.startsAt.localeCompare(b.startsAt),
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

    const groupedColumns = COLUMNS.map((column) => ({
        ...column,
        events: sortedEvents.filter(
            (event) => columnForStatus(event.status) === column.key,
        ),
    })).filter((column) => column.events.length > 0);

    const gridClassName =
        {
            1: 'md:grid-cols-1',
            2: 'md:grid-cols-2',
            3: 'md:grid-cols-3',
        }[groupedColumns.length] ?? 'md:grid-cols-3';

    return (
        <div className={`grid gap-4 ${gridClassName}`}>
            {groupedColumns.map((column) => (
                <section
                    key={column.key}
                    aria-label={column.title}
                    className="flex min-h-36 flex-col rounded-lg border bg-muted/20 p-3"
                >
                    <header className="mb-3 flex items-center justify-between gap-2">
                        <h3 className="text-sm font-semibold text-foreground">
                            {column.title}
                        </h3>
                        <span
                            className={`rounded-full px-2 py-0.5 text-xs font-semibold ${column.badge}`}
                        >
                            {column.events.length}
                        </span>
                    </header>
                    <div className="flex flex-1 flex-col gap-2">
                        {column.events.map((event) => (
                            <EventCard key={event.id} event={event} />
                        ))}
                    </div>
                </section>
            ))}
        </div>
    );
}
