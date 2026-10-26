import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import ConsultationRecordController from '@/actions/App/Http/Controllers/ConsultationRecordController';
import Heading from '@/components/heading';
import { notesToString } from '@/utils/notes';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { index, end, start, view } from '@/routes/consultations';
import { ConsultationRecordForm } from './record-form';
import type {
    ConsultationDetail,
    ConsultationFormValues,
    ConsultationItem,
    ConsultationRecord,
    ConsultationRecordOptions,
    ConsultationRecordType,
    ConsultationRecords,
} from '@/types';

type Props = {
    consultation: ConsultationItem;
    detail: ConsultationDetail;
    records: ConsultationRecords;
    options: ConsultationRecordOptions;
    currencySymbol: string;
};

const SECTIONS: { key: ConsultationRecordType; label: string }[] = [
    { key: 'vital-signs', label: 'Vital Signs' },
    { key: 'complaints', label: 'Complaints' },
    { key: 'examinations', label: 'Examinations' },
    { key: 'diagnoses', label: 'Diagnoses' },
    { key: 'admissions', label: 'Admissions' },
    { key: 'treatments', label: 'Treatments' },
    { key: 'laboratories', label: 'Laboratories' },
    { key: 'prescriptions', label: 'Prescriptions' },
];

const STATUS_BADGE: Record<string, string> = {
    warning: 'bg-amber-100 text-amber-800',
    info: 'bg-sky-100 text-sky-800',
    success: 'bg-emerald-100 text-emerald-800',
    danger: 'bg-rose-100 text-rose-800',
    gray: 'bg-muted text-muted-foreground',
};

export default function ConsultationsAllView({
    consultation,
    detail,
    records,
    options,
    currencySymbol,
}: Props) {
    const { currentTeam } = usePage().props;
    const teamSlug = currentTeam?.slug;

    const [formOpen, setFormOpen] = useState(false);
    const [activeRecord, setActiveRecord] = useState<ConsultationRecord | null>(
        null,
    );
    const [activeType, setActiveType] = useState<ConsultationRecordType | null>(
        null,
    );
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    function openCreate(type: ConsultationRecordType) {
        setActiveType(type);
        setActiveRecord(null);
        setError(null);
        setFormOpen(true);
    }

    function openEdit(type: ConsultationRecordType, record: ConsultationRecord) {
        setActiveType(type);
        setActiveRecord(record);
        setError(null);
        setFormOpen(true);
    }

    function submit(values: ConsultationFormValues) {
        const recordType = activeType;
        if (!recordType) {
            return;
        }

        setProcessing(true);
        setError(null);

        const payload = {
            ...values,
            lines: values.lines
                .filter((line) => line.price_list_id !== '')
                .map((line) => ({
                    price_list_id: Number(line.price_list_id),
                    unitPrice: Number(line.unitPrice || 0),
                    quantity: Number(line.quantity || 1),
                    results: line.results || null,
                    frequency: line.frequency || null,
                    duration: line.duration || null,
                    dosage: line.dosage || null,
                })),
            ward_id: values.ward_id ? Number(values.ward_id) : null,
            bed_id: values.bed_id ? Number(values.bed_id) : null,
            duration: Number(values.duration || 0),
            total: Number(values.total || 0),
        };

        const options_ = {
            preserveScroll: true,
            onError: (errors: Record<string, string>) =>
                setError(Object.values(errors)[0] ?? 'Something went wrong.'),
            onSuccess: () => {
                setFormOpen(false);
                setActiveRecord(null);
                setActiveType(null);
            },
            onFinish: () => setProcessing(false),
        };

        if (activeRecord) {
            router.patch(
                ConsultationRecordController.update.url({
                    current_team: teamSlug,
                    consultation: consultation.id,
                    type: recordType,
                    record: activeRecord.id,
                }),
                payload,
                options_,
            );
        } else {
            router.post(
                ConsultationRecordController.store.url({
                    current_team: teamSlug,
                    consultation: consultation.id,
                    type: recordType,
                }),
                payload,
                options_,
            );
        }
    }

    function destroy(type: ConsultationRecordType, record: ConsultationRecord) {
        router.delete(
            ConsultationRecordController.destroy.url({
                current_team: teamSlug,
                consultation: consultation.id,
                type: type,
                record: record.id,
            }),
            { preserveScroll: true },
        );
    }

    function startConsultation() {
        router.patch(
            start.url({
                current_team: teamSlug,
                consultation: consultation.id,
            }),
            {},
            { preserveScroll: true },
        );
    }

    function endConsultation() {
        router.patch(
            end.url({
                current_team: teamSlug,
                consultation: consultation.id,
            }),
            {},
            { preserveScroll: true },
        );
    }

    const canEnd =
        detail.status !== 'completed' &&
        (records.prescriptions?.length ?? 0) > 0;

    return (
        <>
            <Head title={`${consultation.patientId} — Consultation`} />

            <div className="flex w-full flex-col space-y-6 p-4 md:p-6 lg:p-8">
                <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                        <Heading
                            variant="small"
                            title={`${consultation.patientId} - ${consultation.patientName ?? 'Unknown patient'}`}
                            description="Consultation details and all clinical records."
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            size="sm"
                            variant="outline"
                            asChild
                        >
                            <Link
                                href={view.url({
                                    current_team: teamSlug,
                                    consultation: consultation.id,
                                    section: 'overview',
                                })}
                            >
                                Tab View
                            </Link>
                        </Button>
                        {consultation.status !== 'started' &&
                        consultation.status !== 'completed' ? (
                            <Button onClick={startConsultation}>
                                Start appointment
                            </Button>
                        ) : null}
                        {canEnd ? (
                            <Button
                                variant="secondary"
                                onClick={endConsultation}
                            >
                                End appointment
                            </Button>
                        ) : null}
                    </div>
                </div>

                {/* Patient Overview Section */}
                <Card>
                    <CardHeader>
                        <CardTitle>Patient Information</CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        <DetailRow
                            label="Date of birth"
                            value={detail.birthDate}
                        />
                        <DetailRow label="Gender" value={detail.gender} />
                        <DetailRow label="Age" value={detail.age} />
                        <DetailRow
                            label="Appointment date and time"
                            value={
                                detail.startsAt
                                    ? new Date(
                                          detail.startsAt,
                                      ).toLocaleString()
                                    : null
                            }
                        />
                        <DetailRow
                            label="Ends at"
                            value={
                                detail.endsAt
                                    ? new Date(
                                          detail.endsAt,
                                      ).toLocaleString()
                                    : null
                            }
                        />
                        <DetailRow
                            label="Doctor"
                            value={detail.doctorName}
                        />
                        <DetailRow label="Purpose" value={detail.purpose} />
                        <div>
                            <p className="text-xs text-muted-foreground">
                                Status
                            </p>
                            <Badge
                                className={
                                    STATUS_BADGE[
                                        consultation.statusColor
                                    ] ?? STATUS_BADGE.gray
                                }
                            >
                                {detail.status}
                            </Badge>
                        </div>
                    </CardContent>
                </Card>

                {/* All Clinical Record Sections */}
                {SECTIONS.map((section) => {
                    const sectionRecords = records[section.key] ?? [];

                    return (
                        <Card key={section.key}>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <CardTitle>
                                    {section.label} (
                                    {sectionRecords.length})
                                </CardTitle>
                                {consultation.status !== 'scheduled' &&
                                consultation.status !== 'completed' ? (
                                    <Button
                                        size="sm"
                                        onClick={() =>
                                            openCreate(section.key)
                                        }
                                    >
                                        New
                                    </Button>
                                ) : null}
                            </CardHeader>
                            <CardContent>
                                {sectionRecords.length === 0 ? (
                                    <p className="py-8 text-center text-muted-foreground">
                                        No {section.label.toLowerCase()} records
                                        yet.
                                    </p>
                                ) : (
                                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                                        {sectionRecords.map((record) => (
                                            <RecordCard
                                                key={record.id}
                                                type={section.key}
                                                record={record}
                                                currencySymbol={
                                                    currencySymbol
                                                }
                                                onEdit={() =>
                                                    openEdit(
                                                        section.key,
                                                        record,
                                                    )
                                                }
                                                onDelete={() =>
                                                    destroy(
                                                        section.key,
                                                        record,
                                                    )
                                                }
                                                disabled={
                                                    consultation.status ===
                                                    'scheduled'
                                                }
                                            />
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {activeType ? (
                <ConsultationRecordForm
                    key={`${activeType}-${activeRecord?.id ?? 'new'}-${formOpen}`}
                    open={formOpen}
                    type={activeType}
                    record={activeRecord}
                    options={options}
                    processing={processing}
                    error={error}
                    onClose={() => setFormOpen(false)}
                    onSubmit={submit}
                />
            ) : null}
        </>
    );
}

function DetailRow({ label, value }: { label: string; value: string | null }) {
    return (
        <div>
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="text-sm font-medium">{value ?? '—'}</p>
        </div>
    );
}

function RecordCard({
    type,
    record,
    currencySymbol,
    onEdit,
    onDelete,
    disabled,
}: {
    type: ConsultationRecordType;
    record: ConsultationRecord;
    currencySymbol: string;
    onEdit: () => void;
    onDelete: () => void;
    disabled: boolean;
}) {
    const { currentTeam } = usePage().props;
    const teamSlug = currentTeam?.slug;
    const recordedBy = record.recordedByName ?? '—';

    return (
        <div className="flex flex-col justify-between rounded-md border p-4">
            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold">{recordedBy}</span>
                    {record.status ? (
                        <Badge className={STATUS_BADGE.gray}>
                            {record.status}
                        </Badge>
                    ) : null}
                </div>

                {type === 'complaints' ? (
                    <p className="line-clamp-4 text-sm whitespace-pre-line">
                        {record.notes_en ?? record.notes ?? '—'}
                    </p>
                ) : null}

                {type === 'examinations' || type === 'diagnoses' ? (
                    <p className="line-clamp-4 text-sm whitespace-pre-line">
                        {record.notes ? String(record.notes) : '—'}
                    </p>
                ) : null}

                {type === 'admissions' ? (
                    <div className="space-y-1 text-sm">
                        <p>{notesToString(record.notes) || '—'}</p>
                        <p className="text-xs text-muted-foreground">
                            Ward: {record.ward?.name ?? '—'} · Duration:{' '}
                            {record.duration ?? 0} day(s)
                        </p>
                    </div>
                ) : null}

                {type !== 'complaints' &&
                type !== 'examinations' &&
                type !== 'diagnoses' &&
                type !== 'admissions' ? (
                    <div className="space-y-2">
                        {(record.lines ?? []).map((line) => (
                            <div
                                key={line.id}
                                className="rounded-md border p-2"
                            >
                                <p className="text-sm font-medium">
                                    {line.price_list?.name ?? '—'}
                                </p>
                                {type === 'vital-signs' ? (
                                    <p className="text-sm text-muted-foreground">
                                        Result: {line.results ?? '—'}
                                    </p>
                                ) : (
                                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                        {line.quantity ? (
                                            <span>Qty: {line.quantity}</span>
                                        ) : null}
                                        {line.frequency ? (
                                            <span>
                                                Frequency: {line.frequency}
                                            </span>
                                        ) : null}
                                        {line.duration ? (
                                            <span>
                                                Duration: {line.duration}
                                            </span>
                                        ) : null}
                                        {line.dosage ? (
                                            <span>Dosage: {line.dosage}</span>
                                        ) : null}
                                    </div>
                                )}
                            </div>
                        ))}
                        {record.total !== undefined && record.total !== null ? (
                            <p className="pt-2 text-sm font-semibold">
                                Total: {currencySymbol}
                                {Number(record.total).toLocaleString()}
                            </p>
                        ) : null}
                    </div>
                ) : null}

                <p className="text-xs text-muted-foreground">
                    {record.recordedAt
                        ? new Date(record.recordedAt).toLocaleString()
                        : ''}
                </p>
            </div>

            <div className="mt-3 flex items-center gap-2">
                {type === 'laboratories' && teamSlug ? (
                    <Button
                        size="sm"
                        variant="outline"
                        asChild
                    >
                        <Link
                            href={`/${teamSlug}/laboratories/${record.id}`}
                        >
                            View
                        </Link>
                    </Button>
                ) : null}
                <Button
                    size="sm"
                    variant="secondary"
                    disabled={disabled || record.status === 'paid'}
                    onClick={onEdit}
                >
                    Edit
                </Button>
                <Button
                    size="sm"
                    variant="outline"
                    disabled={disabled || record.status === 'paid'}
                    onClick={onDelete}
                >
                    Delete
                </Button>
            </div>
        </div>
    );
}

ConsultationsAllView.layout = (props: {
    currentTeam?: { slug: string } | null;
}) => ({
    breadcrumbs: [
        {
            title: 'Consultations',
            href: props.currentTeam
                ? index.url(props.currentTeam.slug)
                : '/',
        },
    ],
});

