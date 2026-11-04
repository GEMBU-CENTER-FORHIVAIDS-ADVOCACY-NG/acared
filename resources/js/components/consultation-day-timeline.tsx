import { Link } from '@inertiajs/react';
import { Search, X } from 'lucide-react';
import { useState } from 'react';
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
    const [searchQuery, setSearchQuery] = useState('');

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

    const filteredEvents = searchQuery.trim()
        ? sortedEvents.filter((event) => {
            const q = searchQuery.toLowerCase();
            return (
                event.title.toLowerCase().includes(q) ||
                event.patientId.toLowerCase().includes(q) ||
                (event.birthDate ?? '').toLowerCase().includes(q) ||
                (event.age ?? '').toLowerCase().includes(q) ||
                (event.categoryName ?? '').toLowerCase().includes(q)
            );
        })
        : sortedEvents;

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
            {/* Patient search / filter */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search scheduled patients by name or number..."
                    className="w-full rounded-md border border-input bg-background py-2 pl-9 pr-8 text-sm shadow-xs outline-none placeholder:text-muted-foreground focus:border-ring focus:ring-ring/50 focus:ring-[3px]"
                />
                {searchQuery && (
                    <button
                        type="button"
                        onClick={() => setSearchQuery('')}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                        <X className="size-4" />
                    </button>
                )}
            </div>

            {searchQuery.trim() && filteredEvents.length === 0 && (
                <div className="flex flex-col items-center justify-center py-6 text-center">
                    <p className="text-sm text-muted-foreground">
                        No scheduled patients match &ldquo;{searchQuery}&rdquo;.
                    </p>
                </div>
            )}

            {searchQuery.trim() && (
                <p className="text-xs text-muted-foreground">
                    Showing {filteredEvents.length} of {sortedEvents.length} scheduled patient{sortedEvents.length !== 1 ? 's' : ''}.
                </p>
            )}

            <div className="flex flex-col space-y-3">
            {filteredEvents.map((event) => (
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
        </div>
    );
}
