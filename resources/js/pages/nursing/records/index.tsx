import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import Heading from '@/components/heading';
import NursingDayTimeline from '@/components/nursing-day-timeline';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { store, view, index } from '@/routes/nursing/records';
import { history as nursingRecordsHistory } from '@/routes/nursing/records';
import type {
    NursingDailyTimelineEvent,
    NursingSidebar,
} from '@/types';

type Patient = { slug: string; fullName: string };
type Nurse = { id: number; name: string };
type Billing = {
    id: number;
    patientId: string;
    patientName: string | null;
    status: string;
};
type Form = {
    patient_id: string;
    nurse_id: string;
    billing_id: string;
    purpose: string;
    status: string;
};
const empty: Form = {
    patient_id: '',
    nurse_id: '',
    billing_id: '',
    purpose: '',
    status: 'scheduled',
};

const STATUS_BADGE: Record<string, string> = {
    warning: 'bg-amber-100 text-amber-800',
    info: 'bg-sky-100 text-sky-800',
    success: 'bg-emerald-100 text-emerald-800',
    danger: 'bg-rose-100 text-rose-800',
    gray: 'bg-muted text-muted-foreground',
};

export default function NursingRecordsIndex({
    patients,
    nurses,
    billings,
    dailyTimeline,
    sidebar,
}: {
    patients: Patient[];
    nurses: Nurse[];
    billings: Billing[];
    dailyTimeline: NursingDailyTimelineEvent[];
    sidebar: NursingSidebar;
}) {
    const { currentTeam } = usePage().props;
    const teamSlug = currentTeam?.slug ?? '';
    const [form, setForm] = useState<Form>(empty);
    const [open, setOpen] = useState(false);

    const availableBillings = billings.filter(
        (billing) => billing.patientId === form.patient_id,
    );
    const startCreate = () => {
        setForm(empty);
        setOpen(true);
    };
    const submit = (event: React.FormEvent) => {
        event.preventDefault();
        const payload = { ...form, nurse_id: form.nurse_id || null };
        router.post(store.url(teamSlug), payload, {
            preserveScroll: true,
            onSuccess: () => setOpen(false),
        });
    };

    function applyFilters(next: { date: string }) {
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
                    <Button onClick={startCreate}>
                        New maternity visit
                    </Button>
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
                                                applyFilters({ date: day.date });
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
            {open && (
                <div
                    className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4"
                    role="dialog"
                    aria-modal="true"
                >
                    <form
                        onSubmit={submit}
                        className="max-h-[90vh] w-full max-w-xl space-y-4 overflow-y-auto rounded-lg bg-background p-6 shadow-xl"
                    >
                        <div>
                            <h2 className="text-lg font-semibold">
                                New maternity visit
                            </h2>
                            <p className="text-sm text-muted-foreground">
                                Choose a billing record associated with this
                                patient.
                            </p>
                        </div>
                        <div className="space-y-1">
                            <Label>Patient</Label>
                            <Select
                                value={form.patient_id}
                                onValueChange={(patient_id) =>
                                    setForm({
                                        ...form,
                                        patient_id,
                                        billing_id: '',
                                    })
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select patient" />
                                </SelectTrigger>
                                <SelectContent>
                                    {patients.map((patient) => (
                                        <SelectItem
                                            key={patient.slug}
                                            value={patient.slug}
                                        >
                                            {patient.slug} — {patient.fullName}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-1">
                            <Label>Billing record</Label>
                            <Select
                                value={form.billing_id}
                                onValueChange={(billing_id) =>
                                    setForm({ ...form, billing_id })
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select billing" />
                                </SelectTrigger>
                                <SelectContent>
                                    {availableBillings.map((billing) => (
                                        <SelectItem
                                            key={billing.id}
                                            value={String(billing.id)}
                                        >
                                            #{billing.id} · {billing.status} ·{' '}
                                            {billing.patientName}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-1">
                            <Label>Nurse</Label>
                            <Select
                                value={form.nurse_id}
                                onValueChange={(nurse_id) =>
                                    setForm({ ...form, nurse_id })
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Unassigned" />
                                </SelectTrigger>
                                <SelectContent>
                                    {nurses.map((nurse) => (
                                        <SelectItem
                                            key={nurse.id}
                                            value={String(nurse.id)}
                                        >
                                            {nurse.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-1">
                            <Label>Purpose</Label>
                            <Textarea
                                value={form.purpose}
                                onChange={(event) =>
                                    setForm({
                                        ...form,
                                        purpose: event.target.value,
                                    })
                                }
                            />
                        </div>
                        <div className="space-y-1">
                            <Label>Status</Label>
                            <Select
                                value={form.status}
                                onValueChange={(status) =>
                                    setForm({ ...form, status })
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="scheduled">
                                        Scheduled
                                    </SelectItem>
                                    <SelectItem value="in_progress">
                                        In progress
                                    </SelectItem>
                                    <SelectItem value="completed">
                                        Completed
                                    </SelectItem>
                                    <SelectItem value="cancelled">
                                        Cancelled
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex justify-end gap-2">
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={() => setOpen(false)}
                            >
                                Cancel
                            </Button>
                            <Button type="submit">Save visit</Button>
                        </div>
                    </form>
                </div>
            )}
        </>
    );
}
