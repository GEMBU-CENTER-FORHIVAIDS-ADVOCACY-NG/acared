import { Link } from '@inertiajs/react';
import type { ConsultationDailyTimelineEvent } from '@/types';

type Props = {
    events: ConsultationDailyTimelineEvent[];
    onEventClick?: (event: ConsultationDailyTimelineEvent) => void;
};

const STATUS_LABEL: Record<string, string> = {
    scheduled: 'Scheduled',
    started: 'In progress',
    completed: 'Completed',
};

const STATUS_BADGE: Record<string, string> = {
    scheduled: 'bg-sky-100 text-sky-800',
    started: 'bg-amber-100 text-amber-800',
    completed: 'bg-emerald-100 text-emerald-800',
};

const VISIT_LABEL: Record<string, string> = {
    new: 'New',
    revisit: 'Revisit',
};

const VISIT_BADGE: Record<string, string> = {
    new: 'bg-emerald-100 text-emerald-800',
    revisit: 'bg-amber-100 text-amber-800',
};

const TYPE_LABEL: Record<string, string> = {
    anc: 'ANC',
    consultation: 'Consultation',
};

const TYPE_BADGE: Record<string, string> = {
    anc: 'bg-purple-100 text-purple-800',
    consultation: 'bg-blue-100 text-blue-800',
};

const CATEGORY_BADGE: Record<string, string> = {
    art: 'bg-red-100 text-red-800',
    employee: 'bg-indigo-100 text-indigo-800',
    'employee relation': 'bg-teal-100 text-teal-800',
    general: 'bg-gray-100 text-gray-800',
};

function getCategoryBadge(categoryName: string | null): { label: string; className: string } {
    if (!categoryName) {
        return { label: 'General', className: CATEGORY_BADGE.general };
    }

    const lower = categoryName.toLowerCase();

    if (lower.includes('art')) {
        return { label: categoryName, className: CATEGORY_BADGE.art };
    }

    if (lower.includes('employee relation')) {
        return { label: categoryName, className: CATEGORY_BADGE['employee relation'] };
    }

    if (lower.includes('employee')) {
        return { label: categoryName, className: CATEGORY_BADGE.employee };
    }

    return { label: categoryName, className: CATEGORY_BADGE.general };
}

export default function ConsultationDayTimeline({ events, onEventClick }: Props) {
    const sortedEvents = [...events].sort((a, b) => {
        const parseTime = (time: string) => {
            const match = time.match(/(\d+):(\d+)\s*(AM|PM)/i);
            if (!match) return 0;
            let hours = parseInt(match[1], 10);
            const minutes = parseInt(match[2], 10);
            const period = match[3].toUpperCase();
            if (period === 'AM' && hours === 12) hours = 0;
            if (period === 'PM' && hours !== 12) hours += 12;
            return hours * 60 + minutes;
        };
        return parseTime(a.startsAt) - parseTime(b.startsAt);
    });

    if (sortedEvents.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-8 text-center">
                <p className="text-sm text-muted-foreground">
                    No consultations scheduled for today.
                </p>
            </div>
        );
    }

    return (
        <div className="flex flex-col space-y-3">
            {sortedEvents.map((event) => (
                onEventClick ? (
                    <div
                        key={event.id}
                        role="button"
                        tabIndex={0}
                        onClick={() => onEventClick(event)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                onEventClick(event);
                            }
                        }}
                        className="flex cursor-pointer items-center gap-3 rounded-lg border-l-[3px] px-3 py-2.5 shadow-sm transition-shadow hover:shadow-md"
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
                                <div className="flex items-center gap-1.5">
                                    <span
                                        className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                                            TYPE_BADGE[event.type] ??
                                            'bg-muted text-muted-foreground'
                                        }`}
                                    >
                                        {TYPE_LABEL[event.type] ?? event.type}
                                    </span>
                                    <span
                                        className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                                            VISIT_BADGE[event.visitType] ??
                                            'bg-muted text-muted-foreground'
                                        }`}
                                    >
                                        {VISIT_LABEL[event.visitType] ?? event.visitType}
                                    </span>
                                    <span
                                        className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                                            STATUS_BADGE[event.status] ??
                                            'bg-muted text-muted-foreground'
                                        }`}
                                    >
                                        {STATUS_LABEL[event.status] ?? event.status}
                                    </span>
                                </div>
                            </div>
                            <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                                {event.birthDate && (
                                    <span>DOB: {event.birthDate}</span>
                                )}
                                {event.age && (
                                    <span>• {event.age}</span>
                                )}
                                {(() => {
                                    const { label, className } = getCategoryBadge(event.categoryName);
                                    return (
                                        <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${className}`}>
                                            {label}
                                        </span>
                                    );
                                })()}
                            </div>
                        </div>
                    </div>
                ) : (
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
                                <div className="flex items-center gap-1.5">
                                    <span
                                        className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                                            TYPE_BADGE[event.type] ??
                                            'bg-muted text-muted-foreground'
                                        }`}
                                    >
                                        {TYPE_LABEL[event.type] ?? event.type}
                                    </span>
                                    <span
                                        className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                                            VISIT_BADGE[event.visitType] ??
                                            'bg-muted text-muted-foreground'
                                        }`}
                                    >
                                        {VISIT_LABEL[event.visitType] ?? event.visitType}
                                    </span>
                                    <span
                                        className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                                            STATUS_BADGE[event.status] ??
                                            'bg-muted text-muted-foreground'
                                        }`}
                                    >
                                        {STATUS_LABEL[event.status] ?? event.status}
                                    </span>
                                </div>
                            </div>
                            <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                                {event.birthDate && (
                                    <span>DOB: {event.birthDate}</span>
                                )}
                                {event.age && (
                                    <span>• {event.age}</span>
                                )}
                                {(() => {
                                    const { label, className } = getCategoryBadge(event.categoryName);
                                    return (
                                        <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${className}`}>
                                            {label}
                                        </span>
                                    );
                                })()}
                            </div>
                        </div>
                    </Link>
                )
            ))}
        </div>
    );
}
