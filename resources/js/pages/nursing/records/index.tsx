import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import Heading from '@/components/heading';
import NursingDayTimeline from '@/components/nursing-day-timeline';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { view as nursingWardRoundView } from '@/routes/nursing/ward-rounds';
import { index } from '@/routes/nursing/records';
import { history as nursingRecordsHistory } from '@/routes/nursing/records';
import { Search } from 'lucide-react';
import type { NursingDailyTimelineEvent, NursingSidebar } from '@/types';

export default function NursingRecordsIndex({
    dailyTimeline,
    sidebar,
    filters,
}: {
    dailyTimeline: NursingDailyTimelineEvent[];
    sidebar: NursingSidebar;
    filters: { q: string; date?: string };
}) {
    const { currentTeam } = usePage().props;
    const teamSlug = currentTeam?.slug ?? '';
    const [search, setSearch] = useState(filters.q);
    const [admittedPatientSearch, setAdmittedPatientSearch] = useState('');

    const admittedPatientQuery = admittedPatientSearch.trim().toLowerCase();
    const filteredAdmittedPatients = sidebar.admittedPatients.filter((item) =>
        [item.name, item.meta, item.wardBed].some((value) =>
            value.toLowerCase().includes(admittedPatientQuery),
        ),
    );

    function applyFilters(next: { q?: string; date?: string } = {}) {
        const merged = {
            q: next.q !== undefined ? next.q : search,
            date:
                next.date !== undefined
                    ? next.date
                    : (filters.date ?? sidebar.selectedDate),
        };

        router.get(
            index.url(teamSlug, {
                query: {
                    q: merged.q || undefined,
                    date: merged.date || undefined,
                },
            }),
            {},
            { preserveState: true, preserveScroll: true, replace: true },
        );
    }

    function applyDateFilter(next: { date: string }) {
        applyFilters({ date: next.date });
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

                <div className="grid gap-6 lg:grid-cols-4">
                    <Card className="min-w-0 lg:col-span-3">
                        <CardHeader>
                            <CardTitle>
                                {sidebar.calendarLabel}'s schedule
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <NursingDayTimeline events={dailyTimeline} />
                        </CardContent>
                    </Card>

                    <div className="grid content-start gap-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>{sidebar.calendarLabel}</CardTitle>
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
                                        <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                        <Input
                                            aria-label="Search visits"
                                            className="pl-10"
                                            value={search}
                                            placeholder="Search visits..."
                                            onChange={(event) =>
                                                setSearch(event.target.value)
                                            }
                                        />
                                    </div>
                                    <Button
                                        type="submit"
                                        size="sm"
                                        className="shrink-0"
                                        variant="default"
                                        aria-label="Search visits"
                                    >
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
                                        <button
                                            key={day.date}
                                            type="button"
                                            aria-label={new Date(
                                                day.date,
                                            ).toLocaleDateString(undefined, {
                                                weekday: 'long',
                                                month: 'long',
                                                day: 'numeric',
                                                year: 'numeric',
                                            })}
                                            aria-pressed={
                                                sidebar.selectedDate ===
                                                day.date
                                            }
                                            disabled={!day.inMonth}
                                            onClick={() =>
                                                applyDateFilter({
                                                    date: day.date,
                                                })
                                            }
                                            className={`flex h-8 items-center justify-center rounded-md disabled:cursor-not-allowed ${
                                                day.isToday
                                                    ? 'bg-primary text-primary-foreground'
                                                    : day.hasAppointments
                                                      ? 'bg-muted font-medium'
                                                      : ''
                                            } ${day.inMonth ? 'hover:bg-accent' : 'opacity-40'} ${sidebar.selectedDate === day.date ? 'ring-2 ring-primary ring-offset-1' : ''}`}
                                        >
                                            {day.day}
                                        </button>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Patients on admission</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="relative">
                                    <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        aria-label="Search admitted patients"
                                        className="pl-9"
                                        value={admittedPatientSearch}
                                        placeholder="Search admitted patients..."
                                        onChange={(event) =>
                                            setAdmittedPatientSearch(
                                                event.target.value,
                                            )
                                        }
                                    />
                                </div>
                                <ul className="space-y-2">
                                    {filteredAdmittedPatients.length === 0 ? (
                                        <li className="text-sm text-muted-foreground">
                                            {admittedPatientQuery
                                                ? 'No admitted patients match your search.'
                                                : 'No patients currently on admission.'}
                                        </li>
                                    ) : (
                                        filteredAdmittedPatients.map((item) => (
                                            <li
                                                key={item.id}
                                                className="min-w-0"
                                            >
                                                <Link
                                                    href={nursingWardRoundView.url(
                                                        {
                                                            current_team:
                                                                teamSlug,
                                                            admission: item.id,
                                                        },
                                                    )}
                                                    className="block text-sm leading-snug font-medium break-words hover:underline"
                                                >
                                                    {item.name}
                                                </Link>
                                                <div className="mt-1 flex flex-wrap items-center gap-1.5">
                                                    <span className="text-xs break-words text-muted-foreground">
                                                        {item.meta}
                                                    </span>
                                                    <Badge className="bg-sky-100 text-sky-800 dark:bg-sky-500/15 dark:text-sky-300">
                                                        {item.wardBed}
                                                    </Badge>
                                                </div>
                                            </li>
                                        ))
                                    )}
                                </ul>
                            </CardContent>
                        </Card>
                    </div>
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
