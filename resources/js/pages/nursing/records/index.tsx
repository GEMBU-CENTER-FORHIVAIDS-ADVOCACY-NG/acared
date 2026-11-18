import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import Heading from '@/components/heading';
import NursingDayTimeline from '@/components/nursing-day-timeline';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { view, index } from '@/routes/nursing/records';
import { history as nursingRecordsHistory } from '@/routes/nursing/records';
import { Search } from 'lucide-react';
import type {
    NursingDailyTimelineEvent,
    NursingSidebar,
} from '@/types';

const STATUS_BADGE: Record<string, string> = {
    warning: 'bg-amber-100 text-amber-800',
    info: 'bg-sky-100 text-sky-800',
    success: 'bg-emerald-100 text-emerald-800',
    danger: 'bg-rose-100 text-rose-800',
    gray: 'bg-muted text-muted-foreground',
};

export default function NursingRecordsIndex({
    dailyTimeline,
    sidebar,
    filters,
}: {
    dailyTimeline: NursingDailyTimelineEvent[];
    sidebar: NursingSidebar;
    filters: { q: string };
}) {
    const { currentTeam } = usePage().props;
    const teamSlug = currentTeam?.slug ?? '';
    const [search, setSearch] = useState(filters.q);

    function applyFilters() {
        router.get(
            index.url(teamSlug, {
                query: {
                    q: search || undefined,
                },
            }),
            {},
            { preserveState: true, preserveScroll: true, replace: true },
        );
    }

    function applyDateFilter(next: { date: string }) {
        router.get(
            index.url(teamSlug, {
                query: {
                    date: next.date || undefined,
                },
            }),
            {},
            { preserveState: true, preserveScroll: true, replace: true },
        );
    }

    const statCards = [
        { title: 'Scheduled', value: sidebar.monthStats.scheduled },
        { title: 'In Progress', value: sidebar.monthStats.started },
        { title: 'Completed', value: sidebar.monthStats.completed },
        { title: 'Open slots today', value: sidebar.availableCount },
    ];

    return (
        <>
            <Head title="Maternity" />

            <div className="flex w-full flex-col space-y-6 p-4 md:p-6 lg:p-8">
                <div className="flex flex-wrap items-center justify-between gap-2">
                    <Heading
                        variant="small"
                        title="Maternity"
                        description="Manage maternity nursing visits and their billing records."
                    />
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {statCards.map((card) => (
                        <Card key={card.title}>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">
                                    {card.title}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-semibold tabular-nums">
                                    {card.value}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    {sidebar.monthLabel}
                                </p>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <CardTitle>
                                {sidebar.calendarLabel}'s schedule
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <NursingDayTimeline events={dailyTimeline} />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>
                                {sidebar.calendarLabel}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <form
                                className="flex items-center gap-2"
                                onSubmit={(event) => {
                                    event.preventDefault();
                                    applyFilters();
                                }}
                            >
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        className="pl-10"
                                        value={search}
                                        placeholder="Search visits..."
                                        onChange={(event) => setSearch(event.target.value)}
                                    />
                                </div>
                                <Button type="submit" size="sm" className="shrink-0" variant="default">
                                    <Search className="h-4 w-4" />
                                </Button>
                            </form>

                            <div className="grid grid-cols-7 gap-1 text-center text-xs">
                                {sidebar.weekdays.map((day) => (
                                    <span
                                        key={day}
                                        className="text-muted-foreground"
                                    >
                                        {day}
                                    </span>
                                ))}
                                {sidebar.days.map((day) => (
                                    <span
                                        key={day.date}
                                        onClick={() => {
                                            if (day.inMonth) {
                                                applyDateFilter({ date: day.date });
                                            }
                                        }}
                                        className={`flex h-8 cursor-default items-center justify-center rounded-md ${
                                            day.isToday
                                                ? 'bg-primary text-primary-foreground'
                                                : day.hasAppointments
                                                  ? 'bg-muted font-medium'
                                                  : ''
                                        } ${day.inMonth ? 'cursor-pointer hover:bg-accent' : 'opacity-40'} ${sidebar.selectedDate === day.date ? 'ring-2 ring-primary ring-offset-1' : ''}`}
                                    >
                                        {day.day}
                                    </span>
                                ))}
                            </div>

                            <div>
                                <p className="mb-2 text-sm font-medium">
                                    Today&apos;s slots
                                </p>
                                <div className="flex flex-wrap gap-1">
                                    {sidebar.timeSlots.map((slot) => (
                                        <span
                                            key={slot.label}
                                            className={`rounded px-2 py-0.5 text-xs ${
                                                slot.status === 'available'
                                                    ? 'bg-emerald-100 text-emerald-800'
                                                    : slot.status === 'booked'
                                                      ? 'bg-rose-100 text-rose-800'
                                                      : STATUS_BADGE.gray
                                            }`}
                                        >
                                            {slot.label}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <p className="mb-2 text-sm font-medium">
                                    Upcoming
                                </p>
                                <ul className="space-y-2">
                                    {sidebar.upcoming.length === 0 ? (
                                        <li className="text-sm text-muted-foreground">
                                            No upcoming visits.
                                        </li>
                                    ) : (
                                        sidebar.upcoming.map((item) => (
                                            <li
                                                key={item.id}
                                                className="flex items-start justify-between gap-2"
                                            >
                                                <div>
                                                    <Link
                                                        href={view.url({
                                                            current_team:
                                                                teamSlug,
                                                            nursing:
                                                                 item.id,
                                                        })}
                                                        className="text-sm font-medium hover:underline"
                                                    >
                                                        {item.name}
                                                    </Link>
                                                    <p className="text-xs text-muted-foreground">
                                                        {item.meta}
                                                    </p>
                                                </div>
                                                <Badge
                                                    className={
                                                        STATUS_BADGE.gray
                                                    }
                                                >
                                                    {item.status}
                                                </Badge>
                                            </li>
                                        ))
                                    )}
                                </ul>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Current Visits</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">
                            View all maternity records in{' '}
                            <Link
                                href={nursingRecordsHistory.url(teamSlug)}
                                className="font-medium text-primary hover:underline"
                            >
                                ANC History
                            </Link>
                            .
                        </p>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
