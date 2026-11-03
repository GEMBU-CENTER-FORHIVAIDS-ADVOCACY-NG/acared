import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import Heading from '@/components/heading';
import Pagination from '@/components/pagination';
import { VitalSignsViewModal } from '@/components/vital-signs-view-modal';
import { TreatmentViewModal } from '@/components/treatment-view-modal';
import { PrescriptionViewModal } from '@/components/prescription-view-modal';
import { LaboratoryViewModal } from '@/components/laboratory-view-modal';
import { notesToString } from '@/utils/notes';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ConsultationRecordController from '@/actions/App/Http/Controllers/ConsultationRecordController';
import {
    show as wardRoundShow,
    view as wardRoundView,
} from '@/routes/nursing/ward-rounds';
import { ConsultationRecordForm } from '@/pages/consultations/record-form';
import type {
    ConsultationFormValues,
    ConsultationPagination,
    ConsultationRecord,
    ConsultationRecordOptions,
    ConsultationRecordType,
    ConsultationRecordsWithPagination,
    ConsultationSection,
    PaginatedConsultationRecords,
} from '@/types';

type AdmissionSummary = {
    id: number;
    patientId: string;
    patientName: string | null;
    wardId: number;
    wardName: string | null;
    bedName: string | null;
    doctorName: string | null;
    status: string;
    admittedAt: string | null;
    notes: string | null;
};

type AdmissionDetail = {
    birthDate: string | null;
    gender: string | null;
    age: string | null;
    category: string | null;
    wardName: string | null;
    bedName: string | null;
    doctorName: string | null;
    status: string;
    admittedAt: string | null;
    duration: number;
    notes: string | null;
};

type Props = {
    section: ConsultationSection;
    admission: AdmissionSummary;
    detail: AdmissionDetail;
    records: ConsultationRecordsWithPagination;
    options: ConsultationRecordOptions;
    currencySymbol: string;
    pagination: ConsultationPagination | null;
};

const SECTIONS: { key: ConsultationSection; label: string }[] = [
    { key: 'overview', label: 'Overview' },
    { key: 'vital-signs', label: 'Vital signs' },
    { key: 'complaints', label: 'Complaints' },
    { key: 'examinations', label: 'Examinations' },
    { key: 'diagnoses', label: 'Diagnoses' },
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

export default function WardRoundView({
    section,
    admission,
    detail,
    records,
    options,
    currencySymbol,
    pagination,
}: Props) {
    const { currentTeam } = usePage().props;
    const teamSlug = currentTeam?.slug;

    const [formOpen, setFormOpen] = useState(false);
    const [activeRecord, setActiveRecord] = useState<ConsultationRecord | null>(
        null,
    );
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [viewVitalSigns, setViewVitalSigns] = useState<ConsultationRecord | null>(null);
    const [viewTreatment, setViewTreatment] = useState<ConsultationRecord | null>(null);
    const [viewPrescription, setViewPrescription] = useState<ConsultationRecord | null>(null);
    const [viewLaboratory, setViewLaboratory] = useState<number | null>(null);

    const recordType = (
        section === 'overview' ? null : section
    ) as ConsultationRecordType | null;

    const isPaginated = recordType
        ? typeof records[recordType] !== 'undefined'
            && 'data' in records[recordType]
            && 'currentPage' in records[recordType]
        : false;

    const paginatedRecords: PaginatedConsultationRecords | null = isPaginated
        ? records[recordType as keyof typeof records] as PaginatedConsultationRecords
        : null;

    const currentRecords: ConsultationRecord[] = isPaginated
        ? paginatedRecords.data
        : recordType
            ? (records[recordType] as ConsultationRecord[])
            : [];

    function applyPagination(page: number, perPage?: number) {
        if (!recordType) {
            return;
        }

        const currentPerPage = perPage ?? pagination?.perPage ?? 25;

        router.get(
            wardRoundView.url({
                current_team: teamSlug,
                admission: admission.id,
                section: recordType,
            }, {
                query: {
                    page,
                    perPage: currentPerPage,
                },
            }),
            {},
            { preserveState: false, preserveScroll: true, replace: true },
        );
    }

    function switchSection(next: ConsultationSection) {
        router.get(
            wardRoundView.url({
                current_team: teamSlug,
                admission: admission.id,
                section: next,
            }),
            {},
            { preserveState: false, preserveScroll: true, replace: true },
        );
    }

    function openCreate() {
        setActiveRecord(null);
        setError(null);
        setFormOpen(true);
    }

    function openEdit(record: ConsultationRecord) {
        setActiveRecord(record);
        setError(null);
        setFormOpen(true);
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

        const requestOptions = {
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
                ConsultationRecordController.updateForAdmission.url({
                    current_team: teamSlug,
                    admission: admission.id,
                    type: recordType,
                    record: activeRecord.id,
                }),
                payload,
                requestOptions,
            );
        } else {
            router.post(
                ConsultationRecordController.storeForAdmission.url({
                    current_team: teamSlug,
                    admission: admission.id,
                    type: recordType,
                }),
                payload,
                requestOptions,
            );
        }
    }

    function destroy(record: ConsultationRecord) {
        if (!recordType) {
            return;
        }

        router.delete(
            ConsultationRecordController.destroyForAdmission.url({
                current_team: teamSlug,
                admission: admission.id,
                type: recordType,
                record: record.id,
            }),
            { preserveScroll: true },
        );
    }

    return (
        <>
            <Head
                title={`${admission.patientId} - Ward round`}
            />

            <div className="flex w-full flex-col space-y-6 p-4 md:p-6 lg:p-8">
                <div className="flex flex-wrap items-center justify-between gap-2">
                    <Heading
                        variant="small"
                        title={`${admission.patientId} - ${admission.patientName ?? 'Unknown patient'}`}
                        description="Ward round details and clinical records."
                    />
                    <Button variant="outline" asChild>
                        <Link
                            href={wardRoundShow.url({
                                current_team: teamSlug,
                                ward: admission.wardId,
                            })}
                        >
                            Back to ward
                        </Link>
                    </Button>
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
                            <CardTitle>Admission information</CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            <DetailRow
                                label="Date of birth"
                                value={
                                    detail.birthDate
                                        ? new Date(
                                              detail.birthDate,
                                          ).toLocaleDateString()
                                        : null
                                }
                            />
                            <DetailRow label="Gender" value={detail.gender} />
                            <DetailRow label="Age" value={detail.age} />
                            <DetailRow label="Category" value={detail.category} />
                            <DetailRow label="Ward" value={detail.wardName} />
                            <DetailRow label="Bed" value={detail.bedName} />
                            <DetailRow
                                label="Doctor"
                                value={detail.doctorName}
                            />
                            <DetailRow
                                label="Status"
                                value={detail.status}
                            />
                            <DetailRow
                                label="Admitted"
                                value={
                                    detail.admittedAt
                                        ? new Date(
                                              detail.admittedAt,
                                          ).toLocaleString()
                                        : null
                                }
                            />
                            <DetailRow
                                label="Duration"
                                value={`${detail.duration} day(s)`}
                            />
                            <div className="sm:col-span-2 lg:col-span-3">
                                <p className="text-xs text-muted-foreground">
                                    Notes
                                </p>
                                <p className="text-sm font-medium whitespace-pre-line">
                                    {detail.notes ?? '—'}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    <>
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
                                                onDelete={() => destroy(record)}
                                                onViewVitalSigns={(r) => setViewVitalSigns(r)}
                                                onViewTreatment={(r) => setViewTreatment(r)}
                                                onViewPrescription={(r) => setViewPrescription(r)}
                                                onViewLaboratory={(id) => setViewLaboratory(id)}
                                            />
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                        {isPaginated && paginatedRecords ? (
                            <Pagination
                                meta={{
                                    currentPage: paginatedRecords.currentPage,
                                    lastPage: paginatedRecords.lastPage,
                                    perPage: paginatedRecords.perPage,
                                    total: paginatedRecords.total,
                                }}
                                onPageChange={(page) => applyPagination(page)}
                                onPerPageChange={(perPage) =>
                                    applyPagination(1, perPage)
                                }
                            />
                        ) : null}
                    </>
                )}
            </div>

            {recordType ? (
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

            <VitalSignsViewModal
                record={viewVitalSigns}
                open={viewVitalSigns !== null}
                onOpenChange={(open) => {
                    if (!open) {
                        setViewVitalSigns(null);
                    }
                }}
            />

            <TreatmentViewModal
                record={viewTreatment}
                open={viewTreatment !== null}
                onOpenChange={(open) => {
                    if (!open) {
                        setViewTreatment(null);
                    }
                }}
            />

            <PrescriptionViewModal
                record={viewPrescription}
                open={viewPrescription !== null}
                onOpenChange={(open) => {
                    if (!open) {
                        setViewPrescription(null);
                    }
                }}
                currencySymbol={currencySymbol}
            />

            <LaboratoryViewModal
                laboratoryId={viewLaboratory}
                teamSlug={teamSlug ?? ''}
                open={viewLaboratory !== null}
                onOpenChange={(open) => {
                    if (!open) {
                        setViewLaboratory(null);
                    }
                }}
            />
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
    onViewVitalSigns,
    onViewTreatment,
    onViewPrescription,
    onViewLaboratory,
}: {
    type: ConsultationRecordType;
    record: ConsultationRecord;
    currencySymbol: string;
    onEdit: () => void;
    onDelete: () => void;
    onViewVitalSigns: (record: ConsultationRecord) => void;
    onViewTreatment: (record: ConsultationRecord) => void;
    onViewPrescription: (record: ConsultationRecord) => void;
    onViewLaboratory: (id: number) => void;
}) {
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
                    <p className="line-clamp-4 text-sm whitespace-pre-line">
                        {record.notes ? String(record.notes) : '—'}
                    </p>
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

                {type === 'vital-signs' ? (
                    <div className="space-y-2">
                        {(record.lines ?? []).map((line) => (
                            <div
                                key={line.id}
                                className="rounded-md border p-2"
                            >
                                <p className="text-sm font-medium">
                                    {line.price_list?.name ?? '—'}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    Result: {line.results ?? '—'}
                                </p>
                            </div>
                        ))}
                    </div>
                ) : null}

                {type !== 'vital-signs' &&
                type !== 'complaints' &&
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
                                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                    {line.quantity ? (
                                        <span>Qty: {line.quantity}</span>
                                    ) : null}
                                    {line.frequency ? (
                                        <span>Frequency: {line.frequency}</span>
                                    ) : null}
                                    {line.duration ? (
                                        <span>Duration: {line.duration}</span>
                                    ) : null}
                                    {line.dosage ? (
                                        <span>Dosage: {line.dosage}</span>
                                    ) : null}
                                </div>
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
                {type === 'vital-signs' ? (
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onViewVitalSigns(record)}
                    >
                        View
                    </Button>
                ) : null}
                {type === 'treatments' ? (
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onViewTreatment(record)}
                    >
                        View
                    </Button>
                ) : null}
                {type === 'laboratories' ? (
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onViewLaboratory(record.id)}
                    >
                        View
                    </Button>
                ) : null}
                {type === 'prescriptions' ? (
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onViewPrescription(record)}
                    >
                        View
                    </Button>
                ) : null}
                <Button
                    size="sm"
                    variant="secondary"
                    disabled={record.status ? ['paid', 'submitted', 'dispensed', 'completed', 'cancelled'].includes(record.status) : false}
                    onClick={onEdit}
                >
                    Edit
                </Button>
                <Button
                    size="sm"
                    variant="outline"
                    disabled={record.status ? ['paid', 'submitted', 'dispensed', 'completed', 'cancelled'].includes(record.status) : false}
                    onClick={onDelete}
                >
                    Delete
                </Button>
            </div>
        </div>
    );
}
