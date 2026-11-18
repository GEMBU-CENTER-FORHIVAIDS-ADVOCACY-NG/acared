import { Head, Link, router, usePage } from '@inertiajs/react';
import { AlertCircle, CalendarPlus, Search, X } from 'lucide-react';
import { useState } from 'react';
import ReceptionController from '@/actions/App/Http/Controllers/ReceptionController';
import ConsultationDayTimeline from '@/components/consultation-day-timeline';
import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
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
import { Textarea } from '@/components/ui/textarea';
import { index } from '@/routes/reception';
import type {
    BillingOption,
    ConsultationDailyTimelineEvent,
    ConsultationSidebar,
    DoctorOption,
    NurseOption,
    ReceptionAppointment,
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
    const remainder = 10 - (now.getMinutes() % 10);
    now.setMinutes(now.getMinutes() + remainder, 0, 0);
    return formatDateTimeLocal(now);
}

const EMPTY_APPOINTMENT = {
    billing_id: '',
    doctor_id: '',
    nurse_id: '',
    starts_at: '',
    purpose: '',
    vital_signs: [] as VitalSignForm[],
};

const EMPTY_TRANSFER = {
    patient_id: '',
    transferTo: 'doctor' as 'doctor' | 'nurse',
    doctor_id: '',
    nurse_id: '',
};

export default function ReceptionIndex({
    stats,
    appointments,
    nursingAppointments,
    doctorOptions,
    nurseOptions,
    billingOptions,
    vitalSigns,
    dailyTimeline,
    sidebar,
    filters,
}: {
    stats: ReceptionStats;
    appointments: ReceptionAppointment[];
    nursingAppointments: ReceptionAppointment[];
    doctorOptions: DoctorOption[];
    nurseOptions: NurseOption[];
    billingOptions: BillingOption[];
    vitalSigns: VitalSignOption[];
    dailyTimeline: ConsultationDailyTimelineEvent[];
    sidebar: ConsultationSidebar;
    filters: { q: string };
}) {
    const page = usePage<LayoutProps>();
    const teamSlug = page.props.currentTeam?.slug ?? '';
    const [search, setSearch] = useState(filters.q);

    function applySearch() {
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

    const [appointmentForm, setAppointmentForm] = useState(EMPTY_APPOINTMENT);
    const [staffType, setStaffType] = useState<'doctor' | 'nurse'>('doctor');
    const [formVisible, setFormVisible] = useState(false);
    const [transferOpen, setTransferOpen] = useState(false);
    const [transferForm, setTransferForm] = useState(EMPTY_TRANSFER);
    const [transferFromType, setTransferFromType] = useState<'appointment' | 'nursing' | null>(null);
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

    const STATUS_BADGE: Record<string, string> = {
        warning: 'bg-amber-100 text-amber-800',
        info: 'bg-sky-100 text-sky-800',
        success: 'bg-emerald-100 text-emerald-800',
        danger: 'bg-rose-100 text-rose-800',
        gray: 'bg-muted text-muted-foreground',
    };

    function applyDate(date: string) {
        router.get(
            index.url(teamSlug, { query: { date, q: search || undefined } }),
            {},
            { preserveState: true, preserveScroll: true, replace: true },
        );
    }

    function openSchedule(startsAt?: string) {
        setAppointmentForm({
            ...EMPTY_APPOINTMENT,
            starts_at: startsAt || getDefaultFutureSlot(),
        });
        setStaffType('doctor');
        setError(null);
        setFormVisible(true);
    }

    function resetForm() {
        setAppointmentForm(EMPTY_APPOINTMENT);
        setStaffType('doctor');
        setError(null);
        setFormVisible(false);
    }

    function submitAppointment() {
        if (!appointmentForm.billing_id) {
            setError('Please select a billing record.');
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
            billing_id: parseInt(appointmentForm.billing_id, 10),
            doctor_id: appointmentForm.doctor_id
                ? parseInt(appointmentForm.doctor_id, 10)
                : undefined,
            nurse_id: appointmentForm.nurse_id
                ? parseInt(appointmentForm.nurse_id, 10)
                : undefined,
            vital_signs: appointmentForm.vital_signs
                .filter((vitalSign) => vitalSign.results.trim() !== '')
                .map((vitalSign) => ({
                    ...vitalSign,
                    price_list_id: parseInt(vitalSign.price_list_id, 10),
                })),
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

    function openTransferWithPatient(patientId: string) {
        // Determine if the patient comes from an appointment or nursing record
        const fromNursing = nursingAppointments.some(
            (a) => a.patientId === patientId
        );
        setTransferFromType(fromNursing ? 'nursing' : 'appointment');
        setTransferForm({
            patient_id: patientId,
            transferTo: fromNursing ? 'doctor' : 'doctor',
            doctor_id: '',
            nurse_id: '',
        });
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
                        <Button variant="secondary" onClick={openTransfer}>
                            Transfer patient
                        </Button>
                        <Button
                            onClick={() => openSchedule()}
                            data-test="open-schedule-appointment"
                            disabled={formVisible}
                        >
                            <CalendarPlus className="mr-2 size-4" />
                            Schedule appointment
                        </Button>
                    </div>
                </div>

                <div>
                    <p className="mb-3 text-sm font-medium text-muted-foreground">
                        Triage Overview
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

                <div className="grid gap-6 lg:grid-cols-3">
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <CardTitle>
                                {sidebar.calendarLabel}'s schedule
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ConsultationDayTimeline
                                events={dailyTimeline}
                                onEventClick={(event) =>
                                    openTransferWithPatient(event.patientId)
                                }
                            />
                        </CardContent>
                    </Card>

                    <Card className="flex flex-col">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                            <CardTitle className="text-base">
                                {formVisible ? 'Schedule appointment' : sidebar.calendarLabel}
                            </CardTitle>
                            {formVisible && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0"
                                    onClick={resetForm}
                                >
                                    <X className="size-4" />
                                </Button>
                            )}
                        </CardHeader>
                        <CardContent className="flex-1 overflow-y-auto">
                            {formVisible ? (
                                <div className="space-y-4">
                                    <p className="text-xs text-muted-foreground">
                                        Select a billing record and a doctor or nurse.
                                        Appointments are scheduled for 10 minutes.
                                    </p>

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
                                        {appointmentForm.billing_id && (
                                            (() => {
                                                const selectedBilling = billingOptions.find(
                                                    (opt) => String(opt.id) === appointmentForm.billing_id,
                                                );
                                                return selectedBilling?.category ? (
                                                    <Badge variant="secondary" className="mt-1.5">
                                                        {selectedBilling.category}
                                                    </Badge>
                                                ) : null;
                                            })()
                                        )}
                                        {billingOptions.length === 0 ? (
                                            <p className="text-xs text-amber-600 dark:text-amber-400">
                                                No billings currently available for scheduling.
                                            </p>
                                        ) : null}
                                    </div>

                                    <div className="space-y-3 rounded-lg border bg-card p-3">
                                        <Label>Staff member</Label>
                                        <div className="flex gap-2">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setStaffType('doctor');
                                                    setAppointmentForm((current) => ({
                                                        ...current,
                                                        doctor_id: '',
                                                        nurse_id: '',
                                                    }));
                                                }}
                                                className={`flex-1 rounded-md border px-3 py-2 text-sm font-medium transition-colors ${
                                                    staffType === 'doctor'
                                                        ? 'border-primary bg-primary/10 text-primary'
                                                        : 'border-border bg-background text-muted-foreground hover:bg-muted'
                                                }`}
                                            >
                                                Doctor
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setStaffType('nurse');
                                                    setAppointmentForm((current) => ({
                                                        ...current,
                                                        doctor_id: '',
                                                        nurse_id: '',
                                                    }));
                                                }}
                                                className={`flex-1 rounded-md border px-3 py-2 text-sm font-medium transition-colors ${
                                                    staffType === 'nurse'
                                                        ? 'border-primary bg-primary/10 text-primary'
                                                        : 'border-border bg-background text-muted-foreground hover:bg-muted'
                                                }`}
                                            >
                                                Nurse
                                            </button>
                                        </div>
                                        {staffType === 'doctor' ? (
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
                                        ) : (
                                            <SelectNative
                                                id="appointment-nurse"
                                                placeholder="Select a nurse"
                                                value={appointmentForm.nurse_id}
                                                onChange={(event) =>
                                                    setAppointmentForm((current) => ({
                                                        ...current,
                                                        nurse_id: event.target.value,
                                                    }))
                                                }
                                                data-test="appointment-nurse"
                                            >
                                                <option value="">Select a nurse</option>
                                                {nurseOptions.map((option) => (
                                                    <option key={option.id} value={option.id}>
                                                        {option.name}
                                                    </option>
                                                ))}
                                            </SelectNative>
                                        )}
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
                                            Default consultation slot is 10 minutes.
                                        </p>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="appointment-purpose">Purpose</Label>
                                        <Textarea
                                            id="appointment-purpose"
                                            rows={2}
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
                                            className="space-y-3 rounded-lg border bg-card p-3"
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

                                    <div className="flex items-center justify-end gap-2 pt-2 border-t">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={resetForm}
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            type="button"
                                            size="sm"
                                            onClick={submitAppointment}
                                            disabled={
                                                processing ||
                                                !appointmentForm.billing_id ||
                                                !appointmentForm.starts_at
                                            }
                                            data-test="submit-appointment"
                                        >
                                            {processing
                                                ? 'Scheduling...'
                                                : 'Schedule'}
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <form
                                        className="flex items-center gap-2"
                                        onSubmit={(event) => {
                                            event.preventDefault();
                                            applySearch();
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
                                                        applyDate(day.date);
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

                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Transfer Patient Dialog */}
            <Dialog open={transferOpen} onOpenChange={setTransferOpen}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Transfer patient</DialogTitle>
                        <DialogDescription>
                            {transferForm.patient_id
                                ? `Transfer ${transferForm.patient_id} to another ${transferForm.transferTo}.`
                                : 'Select a patient and reassign their appointment to another staff member.'}
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
                                {[...appointments, ...nursingAppointments]
                                    .filter((appointment) =>
                                        ['scheduled', 'started', 'completed'].includes(
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
                            <Label htmlFor="transfer-to-type">
                                Transfer to
                            </Label>
                            <SelectNative
                                id="transfer-to-type"
                                value={transferForm.transferTo}
                                onChange={(event) =>
                                    setTransferForm((current) => ({
                                        ...current,
                                        transferTo: event.target.value as
                                            | 'doctor'
                                            | 'nurse',
                                        doctor_id: '',
                                        nurse_id: '',
                                    }))
                                }
                            >
                                <option value="doctor">Doctor</option>
                                <option value="nurse">Nurse</option>
                            </SelectNative>
                        </div>

                        {transferForm.transferTo === 'doctor' ? (
                            <div className="space-y-2">
                                <Label htmlFor="transfer-doctor">
                                    To doctor
                                </Label>
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
                                        <option
                                            key={option.id}
                                            value={option.id}
                                        >
                                            {option.name}
                                        </option>
                                    ))}
                                </SelectNative>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                <Label htmlFor="transfer-nurse">
                                    To nurse
                                </Label>
                                <SelectNative
                                    id="transfer-nurse"
                                    value={transferForm.nurse_id}
                                    onChange={(event) =>
                                        setTransferForm((current) => ({
                                            ...current,
                                            nurse_id: event.target.value,
                                        }))
                                    }
                                    data-test="transfer-nurse"
                                >
                                    <option value="">Select a nurse</option>
                                    {nurseOptions.map((option) => (
                                        <option
                                            key={option.id}
                                            value={option.id}
                                        >
                                            {option.name}
                                        </option>
                                    ))}
                                </SelectNative>
                            </div>
                        )}

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
