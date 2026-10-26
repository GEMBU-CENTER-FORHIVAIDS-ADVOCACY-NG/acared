import { Head, Link, router, usePage } from '@inertiajs/react';
import Calendar, { plugins } from '@fullcalendar/react/all';
import formaThemePlugin from '@fullcalendar/react/themes/forma';
import '@fullcalendar/react/skeleton.css';
import '@fullcalendar/react/themes/forma/theme.css';
import '@fullcalendar/react/themes/forma/palettes/blue.css';
import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SelectNative } from '@/components/ui/select-native';
import { index, view } from '@/routes/consultations';
import type {
    ConsultationEvent,
    ConsultationFilters,
    ConsultationSidebar,
    ConsultationStatusOption,
    DoctorOption,
} from '@/types';

type Props = {
    filters: ConsultationFilters;
    statusOptions: ConsultationStatusOption[];
    doctorOptions: DoctorOption[];
    events: ConsultationEvent[];
    sidebar: ConsultationSidebar;
};

const STATUS_BADGE: Record<string, string> = {
    warning: 'bg-amber-100 text-amber-800',
    info: 'bg-sky-100 text-sky-800',
    success: 'bg-emerald-100 text-emerald-800',
    danger: 'bg-rose-100 text-rose-800',
    gray: 'bg-muted text-muted-foreground',
};

export default function ConsultationsIndex({
    filters,
    statusOptions,
    doctorOptions,
    events,
    sidebar,
}: Props) {
    const { currentTeam } = usePage().props;
    const teamSlug = currentTeam?.slug;

    const calendarEvents = events.map((event) => ({
        id: String(event.id),
        title: event.title,
        start: event.start ?? undefined,
        end: event.end ?? undefined,
        backgroundColor: `${event.color}1a`,
        borderColor: event.color,
        textColor: '#111827',
        url: event.url,
    }));

    function applyFilters(next: Partial<ConsultationFilters>) {
        const merged = { ...filters, ...next };

        router.get(
            index.url(teamSlug, {
                query: {
                    status: merged.status || undefined,
                    doctor_id: merged.doctor_id ?? undefined,
                },
            }),
            {},
            { preserveState: true, preserveScroll: true, replace: true },
        );
    }

    const statCards = [
        { title: 'Scheduled', value: sidebar.monthStats.scheduled },
        { title: 'Started', value: sidebar.monthStats.started },
        { title: 'Completed', value: sidebar.monthStats.completed },
        { title: 'Open slots today', value: sidebar.availableCount },
    ];

    return (
        <>
            <Head title="Consultations" />

            <div className="flex w-full flex-col space-y-6 p-4 md:p-6 lg:p-8">
                <div className="flex flex-wrap items-center justify-between gap-2">
                    <Heading
                        variant="small"
                        title="Consultations"
                        description="Track appointments and clinical records."
                    />
                    <div className="flex items-center gap-2">
                        <SelectNative
                            value={filters.status}
                            onChange={(event) =>
                                applyFilters({ status: event.target.value })
                            }
                            className="w-40"
                            data-test="status-filter"
                        >
                            <option value="">All statuses</option>
                            {statusOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </SelectNative>
                        <SelectNative
                            value={filters.doctor_id ?? ''}
                            onChange={(event) =>
                                applyFilters({
                                    doctor_id: event.target.value
                                        ? Number(event.target.value)
                                        : null,
                                })
                            }
                            className="w-44"
                            data-test="doctor-filter"
                        >
                            <option value="">All doctors</option>
                            {doctorOptions.map((doctor) => (
                                <option key={doctor.id} value={doctor.id}>
                                    {doctor.name}
                                </option>
                            ))}
                        </SelectNative>
                    </div>
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
                            <CardTitle>Consultation calendar</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Calendar
                                plugins={[...plugins, formaThemePlugin]}
                                initialView="timeGridDay"
                                headerToolbar={{
                                    start: 'title',
                                    center: '',
                                    end: 'dayGridMonth,timeGridWeek,timeGridDay today prev,next',
                                }}
                                slotDuration="00:30:00"
                                slotMinTime="08:00:00"
                                slotMaxTime="18:00:00"
                                slotMinHeight={56}
                                displayEventTime={false}
                                displayEventEnd={false}
                                events={calendarEvents}
                                height="auto"
                            />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>{sidebar.monthLabel}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
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
                                        className={`flex h-8 items-center justify-center rounded-md ${
                                            day.isToday
                                                ? 'bg-primary text-primary-foreground'
                                                : day.hasAppointments
                                                  ? 'bg-muted font-medium'
                                                  : ''
                                        } ${day.inMonth ? '' : 'opacity-40'}`}
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
                                            No upcoming consultations.
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
                                                            consultation:
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
            </div>
        </>
    );
}

ConsultationsIndex.layout = (props: {
    currentTeam?: { slug: string } | null;
}) => ({
    breadcrumbs: [
        {
            title: 'Consultations',
            href: props.currentTeam ? index.url(props.currentTeam.slug) : '/',
        },
    ],
});
