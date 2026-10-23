import { Head, router, usePage } from '@inertiajs/react';
import Calendar, { plugins } from '@fullcalendar/react/all';
import formaThemePlugin from '@fullcalendar/react/themes/forma';
import '@fullcalendar/react/skeleton.css';
import '@fullcalendar/react/themes/forma/theme.css';
import '@fullcalendar/react/themes/forma/palettes/blue.css';
import { AlertCircle, CalendarPlus } from 'lucide-react';
import { useState } from 'react';
import ReceptionController from '@/actions/App/Http/Controllers/ReceptionController';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SelectNative } from '@/components/ui/select-native';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import { Textarea } from '@/components/ui/textarea';
import { index } from '@/routes/reception';
import type {
    BillingOption,
    DoctorOption,
    ReceptionAppointment,
    ReceptionFilters,
    ReceptionOption,
    ReceptionStats,
    Team,
} from '@/types';

type LayoutProps = {
    currentTeam?: Team | null;
};

type VitalSignOption = { id: number; name: string; uom: string };
type VitalSignForm = { price_list_id: string; results: string };

function formatDateTimeLocal(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
}

function getDefaultFutureSlot(): string {
    const now = new Date();
    const remainder = 30 - (now.getMinutes() % 30);
    now.setMinutes(now.getMinutes() + remainder, 0, 0);
    return formatDateTimeLocal(now);
}

const EMPTY_APPOINTMENT = {
    billing_id: '',
    doctor_id: '',
    starts_at: '',
    purpose: '',
    vital_signs: [] as VitalSignForm[],
};

const EMPTY_TRANSFER = {
    patient_id: '',
    doctor_id: '',
};

export default function ReceptionIndex({
    stats,
    appointments,
    filters,
    dateFilterOptions,
    doctorOptions,
    billingOptions,
    vitalSigns,
}: {
    stats: ReceptionStats;
    appointments: ReceptionAppointment[];
    filters: ReceptionFilters;
    dateFilterOptions: ReceptionOption[];
    doctorOptions: DoctorOption[];
    billingOptions: BillingOption[];
    vitalSigns: VitalSignOption[];
}) {
    const page = usePage<LayoutProps>();
    const teamSlug = page.props.currentTeam?.slug ?? '';

    const [appointmentOpen, setAppointmentOpen] = useState(false);
    const [appointmentForm, setAppointmentForm] = useState(EMPTY_APPOINTMENT);
    const [transferOpen, setTransferOpen] = useState(false);
    const [transferForm, setTransferForm] = useState(EMPTY_TRANSFER);
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const statCards = [
        {
            title: 'Awaiting Booking',
            value: stats.awaitingBooking,
            description: 'Appointments yet to be scheduled',
        },
        {
            title: 'Completed Appointment',
            value: stats.completedAppointments,
            description: 'Appointments doctor attended to',
        },
        {
            title: 'Awaiting Doctor',
            value: stats.awaitingDoctor,
            description: 'Appointments awaiting doctor',
        },
        {
            title: 'Total Appointments',
            value: stats.totalAppointments,
            description: 'Total appointments booked',
        },
    ];

    const events = appointments
        .filter((appointment) => appointment.startsAt && appointment.endsAt)
        .map((appointment) => ({
            id: String(appointment.id),
            title: `${appointment.patientId} - ${appointment.patientName ?? 'Unknown patient'}`,
            start: appointment.startsAt as string,
            end: appointment.endsAt as string,
            backgroundColor: `${appointment.color}1a`,
            borderColor: appointment.color,
            textColor: '#111827',
        }));

    function applyDateFilter(dateFilter: string) {
        router.get(
            index.url(teamSlug, { query: { dateFilter } }),
            {},
            { preserveState: true, preserveScroll: true, replace: true },
        );
    }

    function openSchedule(startsAt?: string) {
        setAppointmentForm({
            ...EMPTY_APPOINTMENT,
            starts_at: startsAt || getDefaultFutureSlot(),
        });
        setError(null);
        setAppointmentOpen(true);
    }

    function submitAppointment() {
        if (!appointmentForm.billing_id) {
            setError('Please select a billing record.');
            return;
        }

        if (!appointmentForm.doctor_id) {
            setError('Please select an assigned doctor.');
            return;
        }

        if (!appointmentForm.starts_at) {
            setError('Please choose an appointment date and time.');
            return;
        }

        setProcessing(true);
        setError(null);

        const payload = {
            ...appointmentForm,
            vital_signs: appointmentForm.vital_signs.filter(
                (vitalSign) => vitalSign.results.trim() !== '',
            ),
        };

        router.post(
            ReceptionController.storeAppointment.url(teamSlug),
            payload,
            {
                preserveScroll: true,
                onError: (errors: Record<string, string>) =>
                    setError(
                        Object.values(errors)[0] ?? 'Something went wrong.',
                    ),
                onSuccess: () => {
                    setAppointmentOpen(false);
                    setAppointmentForm(EMPTY_APPOINTMENT);
                },
                onFinish: () => setProcessing(false),
            },
        );
    }

    function openTransfer() {
        setTransferForm(EMPTY_TRANSFER);
        setError(null);
        setTransferOpen(true);
    }

    function submitTransfer() {
        setProcessing(true);
        setError(null);

        router.patch(
            ReceptionController.transfer.url(teamSlug),
            transferForm,
            {
                preserveScroll: true,
                onError: (errors: Record<string, string>) =>
                    setError(
                        Object.values(errors)[0] ?? 'Something went wrong.',
                    ),
                onSuccess: () => {
                    setTransferOpen(false);
                    setTransferForm(EMPTY_TRANSFER);
                },
                onFinish: () => setProcessing(false),
            },
        );
    }

    return (
        <>
            <Head title="Reception" />

            <div className="space-y-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <Heading
                        title="Reception"
                        description="Triage overview and appointment scheduling."
                    />
                    <div className="flex flex-wrap items-center gap-2">
                        <SelectNative
                            value={filters.dateFilter}
                            onChange={(event) =>
                                applyDateFilter(event.target.value)
                            }
                            className="w-[180px]"
                            data-test="reception-date-filter"
                        >
                            {dateFilterOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </SelectNative>
                        <Button variant="secondary" onClick={openTransfer}>
                            Transfer patient
                        </Button>
                        <Button
                            onClick={() => openSchedule()}
                            data-test="open-schedule-appointment"
                        >
                            <CalendarPlus className="mr-2 size-4" />
                            Schedule appointment
                        </Button>
                    </div>
                </div>

                <div>
                    <p className="mb-3 text-sm font-medium text-muted-foreground">
                        Triage Overview — {filters.dateFilterLabel}
                    </p>
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
                                        {card.description}
                                    </p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Reception appointment calendar</CardTitle>
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
                            events={events}
                            selectable
                            dateClick={(info) =>
                                openSchedule(formatDateTimeLocal(info.date))
                            }
                            eventClick={(info) =>
                                info.event.start
                                    ? openSchedule(
                                          formatDateTimeLocal(info.event.start),
                                      )
                                    : openSchedule()
                            }
                            height="auto"
                        />
                    </CardContent>
                </Card>
            </div>

            {/* Schedule Appointment Slide-Over */}
            <Sheet open={appointmentOpen} onOpenChange={setAppointmentOpen}>
                <SheetContent
                    side="right"
                    className="w-full sm:max-w-lg md:max-w-xl p-0 gap-0 flex flex-col h-full bg-background"
                >
                    <SheetHeader className="p-6 border-b shrink-0 bg-muted/10 pr-12">
                        <SheetTitle className="text-lg font-semibold flex items-center gap-2">
                            <CalendarPlus className="size-5 text-primary" />
                            Schedule appointment
                        </SheetTitle>
                        <SheetDescription className="text-sm text-muted-foreground">
                            Select a billing record and doctor. Appointments are
                            scheduled for 30 minutes.
                        </SheetDescription>
                    </SheetHeader>

                    <div className="flex-1 overflow-y-auto p-6 space-y-5">
                        <div className="space-y-2">
                            <Label htmlFor="appointment-billing">
                                Patient (Billing) <span className="text-destructive">*</span>
                            </Label>
                            <SelectNative
                                id="appointment-billing"
                                placeholder="Select patient (billing)"
                                value={appointmentForm.billing_id}
                                onChange={(event) =>
                                    setAppointmentForm((current) => ({
                                        ...current,
                                        billing_id: event.target.value,
                                        vital_signs: event.target.value
                                            ? vitalSigns.map((vitalSign) => ({
                                                  price_list_id: String(
                                                      vitalSign.id,
                                                  ),
                                                  results: '',
                                              }))
                                            : [],
                                    }))
                                }
                                data-test="appointment-billing"
                            >
                                <option value="">Select patient (billing)</option>
                                {billingOptions.map((option) => (
                                    <option key={option.id} value={option.id}>
                                        {option.label}
                                    </option>
                                ))}
                            </SelectNative>
                            {billingOptions.length === 0 ? (
                                <p className="text-xs text-amber-600 dark:text-amber-400">
                                    No billings currently available for scheduling.
                                </p>
                            ) : null}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="appointment-doctor">
                                Doctor <span className="text-destructive">*</span>
                            </Label>
                            <SelectNative
                                id="appointment-doctor"
                                placeholder="Select a doctor"
                                value={appointmentForm.doctor_id}
                                onChange={(event) =>
                                    setAppointmentForm((current) => ({
                                        ...current,
                                        doctor_id: event.target.value,
                                    }))
                                }
                                data-test="appointment-doctor"
                            >
                                <option value="">Select a doctor</option>
                                {doctorOptions.map((option) => (
                                    <option key={option.id} value={option.id}>
                                        {option.name}
                                    </option>
                                ))}
                            </SelectNative>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="appointment-start">
                                Appointment date and time <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="appointment-start"
                                type="datetime-local"
                                value={appointmentForm.starts_at}
                                onChange={(event) =>
                                    setAppointmentForm((current) => ({
                                        ...current,
                                        starts_at: event.target.value,
                                    }))
                                }
                                data-test="appointment-start"
                            />
                            <p className="text-xs text-muted-foreground">
                                Default consultation slot is 30 minutes.
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="appointment-purpose">Purpose</Label>
                            <Textarea
                                id="appointment-purpose"
                                rows={3}
                                placeholder="Consultation purpose, notes, or patient complaints..."
                                value={appointmentForm.purpose}
                                onChange={(event) =>
                                    setAppointmentForm((current) => ({
                                        ...current,
                                        purpose: event.target.value,
                                    }))
                                }
                            />
                        </div>

                        {appointmentForm.billing_id && vitalSigns.length > 0 ? (
                            <section
                                className="space-y-3 rounded-lg border bg-card p-4"
                                aria-labelledby="appointment-vital-signs"
                            >
                                <div>
                                    <h3
                                        id="appointment-vital-signs"
                                        className="text-sm font-medium"
                                    >
                                        Vital signs triage
                                    </h3>
                                    <p className="text-xs text-muted-foreground">
                                        Enter results for vital signs (optional).
                                    </p>
                                </div>
                                <div className="space-y-3">
                                    {appointmentForm.vital_signs.map(
                                        (vitalSign, index) => {
                                            const option = vitalSigns.find(
                                                (item) =>
                                                    String(item.id) ===
                                                    vitalSign.price_list_id,
                                            );

                                            return (
                                                <div
                                                    key={
                                                        vitalSign.price_list_id
                                                    }
                                                    className="grid gap-2 rounded-md border p-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] sm:items-center bg-background"
                                                >
                                                    <div className="space-y-0.5">
                                                        <Label
                                                            htmlFor={`vital-result-${vitalSign.price_list_id}`}
                                                            className="text-xs font-medium"
                                                        >
                                                            {option?.name ??
                                                                'Vital sign'}
                                                        </Label>
                                                        <p className="text-[11px] text-muted-foreground">
                                                            Unit:{' '}
                                                            {option?.uom ||
                                                                'Not specified'}
                                                        </p>
                                                    </div>
                                                    <Input
                                                        id={`vital-result-${vitalSign.price_list_id}`}
                                                        value={
                                                            vitalSign.results
                                                        }
                                                        onChange={(event) =>
                                                            setAppointmentForm(
                                                                (current) => ({
                                                                    ...current,
                                                                    vital_signs:
                                                                        current.vital_signs.map(
                                                                            (
                                                                                item,
                                                                                itemIndex,
                                                                            ) =>
                                                                                itemIndex ===
                                                                                index
                                                                                    ? {
                                                                                          ...item,
                                                                                          results:
                                                                                              event
                                                                                                  .target
                                                                                                  .value,
                                                                                      }
                                                                                    : item,
                                                                        ),
                                                                }),
                                                            )
                                                        }
                                                        placeholder="Result"
                                                        className="h-8 text-xs"
                                                    />
                                                </div>
                                            );
                                        },
                                    )}
                                </div>
                            </section>
                        ) : null}

                        {error ? (
                            <div className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
                                <AlertCircle className="size-4 shrink-0 mt-0.5" />
                                <span>{error}</span>
                            </div>
                        ) : null}
                    </div>

                    <SheetFooter className="p-4 sm:p-6 border-t shrink-0 bg-muted/20 flex flex-row items-center justify-end gap-3">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setAppointmentOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            onClick={submitAppointment}
                            disabled={
                                processing ||
                                !appointmentForm.billing_id ||
                                !appointmentForm.doctor_id ||
                                !appointmentForm.starts_at
                            }
                            data-test="submit-appointment"
                        >
                            {processing
                                ? 'Scheduling...'
                                : 'Schedule appointment'}
                        </Button>
                    </SheetFooter>
                </SheetContent>
            </Sheet>

            {/* Transfer Patient Dialog */}
            <Dialog open={transferOpen} onOpenChange={setTransferOpen}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Transfer patient</DialogTitle>
                        <DialogDescription>
                            Reassign the latest active appointment to another
                            doctor.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="transfer-patient">
                                From patient
                            </Label>
                            <SelectNative
                                id="transfer-patient"
                                value={transferForm.patient_id}
                                onChange={(event) =>
                                    setTransferForm((current) => ({
                                        ...current,
                                        patient_id: event.target.value,
                                    }))
                                }
                                data-test="transfer-patient"
                            >
                                <option value="">Select a patient</option>
                                {appointments
                                    .filter((appointment) =>
                                        ['scheduled', 'started'].includes(
                                            appointment.status,
                                        ),
                                    )
                                    .map((appointment) => (
                                        <option
                                            key={appointment.patientId}
                                            value={appointment.patientId}
                                        >
                                            {appointment.patientId} -{' '}
                                            {appointment.patientName ??
                                                'Unknown patient'}
                                        </option>
                                    ))}
                            </SelectNative>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="transfer-doctor">To doctor</Label>
                            <SelectNative
                                id="transfer-doctor"
                                value={transferForm.doctor_id}
                                onChange={(event) =>
                                    setTransferForm((current) => ({
                                        ...current,
                                        doctor_id: event.target.value,
                                    }))
                                }
                                data-test="transfer-doctor"
                            >
                                <option value="">Select a doctor</option>
                                {doctorOptions.map((option) => (
                                    <option key={option.id} value={option.id}>
                                        {option.name}
                                    </option>
                                ))}
                            </SelectNative>
                        </div>

                        {error ? (
                            <p className="text-sm text-destructive">{error}</p>
                        ) : null}
                    </div>

                    <DialogFooter className="gap-2">
                        <DialogClose asChild>
                            <Button type="button" variant="secondary">
                                Cancel
                            </Button>
                        </DialogClose>
                        <Button
                            type="button"
                            onClick={submitTransfer}
                            disabled={processing}
                            data-test="submit-transfer"
                        >
                            {processing
                                ? 'Transferring...'
                                : 'Transfer patient'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

ReceptionIndex.layout = (props: LayoutProps) => ({
    breadcrumbs: [
        {
            title: 'Reception',
            href: index(props.currentTeam?.slug),
        },
    ],
});
