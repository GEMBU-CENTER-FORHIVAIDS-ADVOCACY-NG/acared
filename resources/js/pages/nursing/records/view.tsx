import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import Heading from '@/components/heading';
import { notesToString, parseExaminationNotes } from '@/utils/notes';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { index as recordsIndex } from '@/routes/nursing/records';
import { view } from '@/routes/nursing/records';
import {
    destroy,
    store,
    update,
} from '@/routes/nursing/records/records';
import { ConsultationRecordForm } from '@/pages/consultations/record-form';
import { NursingExaminationForm } from '@/pages/nursing/nursing-examination-form';
import type {
    ConsultationFormValues,
    ConsultationRecord,
    ConsultationRecordOptions,
    ConsultationRecordType,
    ConsultationRecords,
} from '@/types';
import type { Team } from '@/types';

type NursingSection = 'overview' | ConsultationRecordType;

const SECTIONS: { key: NursingSection; label: string }[] = [
    { key: 'overview', label: 'Overview' },
    { key: 'vital-signs', label: 'Vital signs' },
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

export default function NursingRecordsView({
    section,
    nursing,
    detail,
    records,
    options,
    currencySymbol,
}: {
    section: NursingSection;
    nursing: {
        id: number;
        patientId: string;
        patientName: string | null;
        nurseName: string | null;
        billingId: number;
        billingStatus: string | null;
        purpose: string | null;
        status: string;
        createdAt: string | null;
    };
    detail: {
        birthDate: string | null;
        gender: string | null;
        age: string | null;
        nurseName: string | null;
        billingStatus: string | null;
        purpose: string | null;
        status: string;
        createdAt: string | null;
    };
    records: ConsultationRecords;
    options: ConsultationRecordOptions;
    currencySymbol: string;
}) {
    const { currentTeam } = usePage().props;
    const teamSlug = currentTeam?.slug;

    const [formOpen, setFormOpen] = useState(false);
    const [examFormOpen, setExamFormOpen] = useState(false);
    const [activeRecord, setActiveRecord] = useState<ConsultationRecord | null>(
        null,
    );
    const [examRecord, setExamRecord] = useState<ConsultationRecord | null>(
        null,
    );
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const recordType = section === 'overview' ? null : section;
    const currentRecords: ConsultationRecord[] = recordType
        ? records[recordType]
        : [];

    function switchSection(next: NursingSection) {
        router.get(
            view.url({
                current_team: teamSlug,
                nursing: nursing.id,
                section: next,
            }),
            {},
            { preserveState: false, preserveScroll: true, replace: true },
        );
    }

    function openCreate() {
        if (recordType === 'examinations') {
            setExamRecord(null);
            setError(null);
            setExamFormOpen(true);
        } else {
            setActiveRecord(null);
            setError(null);
            setFormOpen(true);
        }
    }

    function openEdit(record: ConsultationRecord) {
        if (recordType === 'examinations') {
            setExamRecord(record);
            setError(null);
            setExamFormOpen(true);
        } else {
            setActiveRecord(record);
            setError(null);
            setFormOpen(true);
        }
    }

    function submit(values: ConsultationFormValues) {
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

        const opts = {
            preserveScroll: true,
            onError: (errors: Record<string, string>) =>
                setError(Object.values(errors)[0] ?? 'Something went wrong.'),
            onSuccess: () => {
                setFormOpen(false);
                setActiveRecord(null);
            },
            onFinish: () => setProcessing(false),
        };

        if (activeRecord) {
            router.patch(
                update.url({
                    current_team: teamSlug,
                    nursing: nursing.id,
                    type: recordType,
                    record: activeRecord.id,
                }),
                payload,
                opts,
            );
        } else {
            router.post(
                store.url({
                    current_team: teamSlug,
                    nursing: nursing.id,
                    type: recordType,
                }),
                payload,
                opts,
            );
        }
    }

    function submitExamination(notes: Record<string, string>) {
        if (!recordType) {
            return;
        }

        setProcessing(true);
        setError(null);

        // Only include fields that have values
        const filtered = Object.fromEntries(
            Object.entries(notes).filter(([, v]) => v !== ''),
        );

        const payload = {
            notes: Object.keys(filtered).length > 0 ? filtered : {},
            lines: [],
            total: 0,
            duration: 0,
        };

        const opts = {
            preserveScroll: true,
            onError: (errors: Record<string, string>) =>
                setError(Object.values(errors)[0] ?? 'Something went wrong.'),
            onSuccess: () => {
                setExamFormOpen(false);
                setExamRecord(null);
            },
            onFinish: () => setProcessing(false),
        };

        if (examRecord) {
            router.patch(
                update.url({
                    current_team: teamSlug,
                    nursing: nursing.id,
                    type: recordType,
                    record: examRecord.id,
                }),
                payload,
                opts,
            );
        } else {
            router.post(
                store.url({
                    current_team: teamSlug,
                    nursing: nursing.id,
                    type: recordType,
                }),
                payload,
                opts,
            );
        }
    }

    function destroyRecord(record: ConsultationRecord) {
        if (!recordType) {
            return;
        }

        router.delete(
            destroy.url({
                current_team: teamSlug,
                nursing: nursing.id,
                type: recordType,
                record: record.id,
            }),
            { preserveScroll: true },
        );
    }

    return (
        <>
            <Head title={`${nursing.patientId} — Maternity`} />

            <div className="flex w-full flex-col space-y-6 p-4 md:p-6 lg:p-8">
                <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                        <Heading
                            variant="small"
                            title={`${nursing.patientId} - ${nursing.patientName ?? 'Unknown patient'}`}
                            description="Maternity visit details and clinical records."
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" asChild>
                            <Link href={recordsIndex.url(teamSlug)}>
                                Back to maternity
                            </Link>
                        </Button>
                    </div>
                </div>

                <div className="flex flex-wrap gap-2">
                    {SECTIONS.map((item) => (
                        <Button
                            key={item.key}
                            size="sm"
                            variant={
                                item.key === section ? 'default' : 'secondary'
                            }
                            onClick={() => switchSection(item.key)}
                        >
                            {item.label}
                        </Button>
                    ))}
                </div>

                {section === 'overview' ? (
                    <Card>
                        <CardHeader>
                            <CardTitle>Visit information</CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            <DetailRow
                                label="Date of birth"
                                value={detail.birthDate}
                            />
                            <DetailRow label="Gender" value={detail.gender} />
                            <DetailRow label="Age" value={detail.age} />
                            <DetailRow
                                label="Nurse"
                                value={detail.nurseName}
                            />
                            <DetailRow
                                label="Billing"
                                value={
                                    detail.billingStatus
                                        ? `#${nursing.billingId} · ${detail.billingStatus}`
                                        : `#${nursing.billingId}`
                                }
                            />
                            <DetailRow
                                label="Created"
                                value={
                                    detail.createdAt
                                        ? new Date(
                                              detail.createdAt,
                                          ).toLocaleString()
                                        : null
                                }
                            />
                            <DetailRow label="Purpose" value={detail.purpose} />
                            <div>
                                <p className="text-xs text-muted-foreground">
                                    Status
                                </p>
                                <Badge
                                    className={
                                        STATUS_BADGE.gray
                                    }
                                >
                                    {detail.status.replace('_', ' ')}
                                </Badge>
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>
                                {
                                    SECTIONS.find(
                                        (item) => item.key === section,
                                    )?.label
                                }
                            </CardTitle>
                            <Button size="sm" onClick={openCreate}>
                                New
                            </Button>
                        </CardHeader>
                        <CardContent>
                            {currentRecords.length === 0 ? (
                                <p className="py-8 text-center text-muted-foreground">
                                    No records yet.
                                </p>
                            ) : (
                                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                                    {currentRecords.map((record) => (
                                        <RecordCard
                                            key={record.id}
                                            type={
                                                recordType as ConsultationRecordType
                                            }
                                            record={record}
                                            currencySymbol={currencySymbol}
                                            onEdit={() => openEdit(record)}
                                            onDelete={() => destroyRecord(record)}
                                        />
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}
            </div>

            {recordType && recordType !== 'examinations' ? (
                <ConsultationRecordForm
                    key={`${recordType}-${activeRecord?.id ?? 'new'}-${formOpen}`}
                    open={formOpen}
                    type={recordType}
                    record={activeRecord}
                    options={options}
                    processing={processing}
                    error={error}
                    onClose={() => setFormOpen(false)}
                    onSubmit={submit}
                />
            ) : null}

            {recordType === 'examinations' ? (
                <NursingExaminationForm
                    key={`examination-${examRecord?.id ?? 'new'}-${examFormOpen}`}
                    open={examFormOpen}
                    record={examRecord}
                    processing={processing}
                    error={error}
                    onClose={() => setExamFormOpen(false)}
                    onSubmit={submitExamination}
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
}: {
    type: ConsultationRecordType;
    record: ConsultationRecord;
    currencySymbol: string;
    onEdit: () => void;
    onDelete: () => void;
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

                {type === 'examinations' ? (
                    <div className="space-y-1 text-sm">
                        {Object.entries(parseExaminationNotes(record.notes)).map(
                            ([key, value]) => (
                                <div key={key} className="flex justify-between gap-2">
                                    <span className="text-muted-foreground">{key}:</span>
                                    <span className="text-right">{value || '—'}</span>
                                </div>
                            ),
                        )}
                        {Object.keys(parseExaminationNotes(record.notes)).length === 0 && (
                            <p className="text-muted-foreground">—</p>
                        )}
                    </div>
                ) : null}

                {type === 'diagnoses' ? (
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

                {type === 'treatments' ? (
                    <div className="space-y-1 text-sm">
                        <p>{notesToString(record.notes) || '—'}</p>
                    </div>
                ) : null}

                {type !== 'complaints' &&
                type !== 'examinations' &&
                type !== 'diagnoses' &&
                type !== 'admissions' &&
                type !== 'treatments' ? (
                    <div className="space-y-1">
                        {(record.lines ?? []).map((line) => (
                            <div
                                key={line.id}
                                className="flex items-center justify-between text-sm"
                            >
                                <span>{line.priceList?.name ?? '—'}</span>
                                <span className="text-muted-foreground">
                                    {type === 'vital-signs'
                                        ? (line.results ?? '—')
                                        : `×${line.quantity}`}
                                </span>
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
                <Button size="sm" variant="secondary" onClick={onEdit}>
                    Edit
                </Button>
                <Button size="sm" variant="ghost" onClick={onDelete}>
                    Delete
                </Button>
            </div>
        </div>
    );
}

NursingRecordsView.layout = (props: {
    currentTeam?: Team | null;
}) => ({
    breadcrumbs: [
        {
            title: 'Maternity',
            href: props.currentTeam
                ? recordsIndex.url(props.currentTeam.slug)
                : '/',
        },
    ],
});
