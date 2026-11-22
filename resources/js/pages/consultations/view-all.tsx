import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import ConsultationRecordController from '@/actions/App/Http/Controllers/ConsultationRecordController';
import AlertError from '@/components/alert-error';
import ConfirmDialog from '@/components/confirm-dialog';
import Heading from '@/components/heading';
import { VitalSignsViewModal } from '@/components/vital-signs-view-modal';
import { TreatmentViewModal } from '@/components/treatment-view-modal';
import { PrescriptionViewModal } from '@/components/prescription-view-modal';
import { LaboratoryViewModal } from '@/components/laboratory-view-modal';
import { ComplaintViewModal } from '@/components/complaint-view-modal';
import { ExaminationViewModal } from '@/components/examination-view-modal';
import { DiagnosisViewModal } from '@/components/diagnosis-view-modal';
import { AdmissionViewModal } from '@/components/admission-view-modal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { home } from '@/routes';
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
    warning:
        'bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300',
    info: 'bg-sky-100 text-sky-800 dark:bg-sky-500/15 dark:text-sky-300',
    success:
        'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300',
    danger: 'bg-rose-100 text-rose-800 dark:bg-rose-500/15 dark:text-rose-300',
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
    const [viewVitalSigns, setViewVitalSigns] =
        useState<ConsultationRecord | null>(null);
    const [viewTreatment, setViewTreatment] =
        useState<ConsultationRecord | null>(null);
    const [viewPrescription, setViewPrescription] =
        useState<ConsultationRecord | null>(null);
    const [viewLaboratory, setViewLaboratory] = useState<number | null>(null);
    const [viewComplaint, setViewComplaint] =
        useState<ConsultationRecord | null>(null);
    const [viewExamination, setViewExamination] =
        useState<ConsultationRecord | null>(null);
    const [viewDiagnosis, setViewDiagnosis] =
        useState<ConsultationRecord | null>(null);
    const [viewAdmission, setViewAdmission] =
        useState<ConsultationRecord | null>(null);
    const [actionError, setActionError] = useState<string | null>(null);
    const [recordToDelete, setRecordToDelete] = useState<{
        type: ConsultationRecordType;
        record: ConsultationRecord;
    } | null>(null);
    const [deleteProcessing, setDeleteProcessing] = useState(false);
    const [showStartConfirm, setShowStartConfirm] = useState(false);
    const [startProcessing, setStartProcessing] = useState(false);
    const [showEndConfirm, setShowEndConfirm] = useState(false);
    const [endProcessing, setEndProcessing] = useState(false);

    function openCreate(type: ConsultationRecordType) {
        setActiveType(type);
        setActiveRecord(null);
        setError(null);
        setFormOpen(true);
    }

    function openEdit(
        type: ConsultationRecordType,
        record: ConsultationRecord,
    ) {
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
        setActionError(null);
        setRecordToDelete({ type, record });
    }

    function confirmDelete() {
        if (!recordToDelete) {
            return;
        }

        setDeleteProcessing(true);
        setActionError(null);

        router.delete(
            ConsultationRecordController.destroy.url({
                current_team: teamSlug,
                consultation: consultation.id,
                type: recordToDelete.type,
                record: recordToDelete.record.id,
            }),
            {
                preserveScroll: true,
                onError: (errors: Record<string, string>) =>
                    setActionError(
                        Object.values(errors)[0] ?? 'Something went wrong.',
                    ),
                onSuccess: () => setRecordToDelete(null),
                onFinish: () => setDeleteProcessing(false),
            },
        );
    }

    function startConsultation() {
        setStartProcessing(true);
        setActionError(null);

        router.patch(
            start.url({
                current_team: teamSlug,
                consultation: consultation.id,
            }),
            {},
            {
                preserveScroll: true,
                onError: (errors: Record<string, string>) =>
                    setActionError(
                        Object.values(errors)[0] ?? 'Something went wrong.',
                    ),
                onSuccess: () => setShowStartConfirm(false),
                onFinish: () => setStartProcessing(false),
            },
        );
    }

    function endConsultation() {
        setEndProcessing(true);
        setActionError(null);

        router.patch(
            end.url({
                current_team: teamSlug,
                consultation: consultation.id,
            }),
            {},
            {
                preserveScroll: true,
                onError: (errors: Record<string, string>) =>
                    setActionError(
                        Object.values(errors)[0] ?? 'Something went wrong.',
                    ),
                onSuccess: () => setShowEndConfirm(false),
                onFinish: () => setEndProcessing(false),
            },
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
                        <Button size="sm" variant="outline" asChild>
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
                            <Button
                                onClick={() => {
                                    setActionError(null);
                                    setShowStartConfirm(true);
                                }}
                                disabled={startProcessing}
                            >
                                {startProcessing
                                    ? 'Starting...'
                                    : 'Start appointment'}
                            </Button>
                        ) : null}
                        {canEnd ? (
                            <Button
                                variant="secondary"
                                onClick={() => {
                                    setActionError(null);
                                    setShowEndConfirm(true);
                                }}
                                disabled={endProcessing}
                            >
                                {endProcessing
                                    ? 'Ending...'
                                    : 'End appointment'}
                            </Button>
                        ) : null}
                    </div>
                </div>

                {actionError ? <AlertError errors={[actionError]} /> : null}

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
                                    ? new Date(detail.startsAt).toLocaleString()
                                    : null
                            }
                        />
                        <DetailRow
                            label="Ends at"
                            value={
                                detail.endsAt
                                    ? new Date(detail.endsAt).toLocaleString()
                                    : null
                            }
                        />
                        <DetailRow label="Doctor" value={detail.doctorName} />
                        <DetailRow label="Purpose" value={detail.purpose} />
                        <div>
                            <p className="text-xs text-muted-foreground">
                                Status
                            </p>
                            <Badge
                                className={
                                    STATUS_BADGE[consultation.statusColor] ??
                                    STATUS_BADGE.gray
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
                                    {section.label} ({sectionRecords.length})
                                </CardTitle>
                                {consultation.status !== 'scheduled' ? (
                                    <Button
                                        size="sm"
                                        onClick={() => openCreate(section.key)}
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
                                                onEdit={() =>
                                                    openEdit(
                                                        section.key,
                                                        record,
                                                    )
                                                }
                                                onDelete={() =>
                                                    destroy(section.key, record)
                                                }
                                                deleteProcessing={
                                                    deleteProcessing
                                                }
                                                onViewVitalSigns={(r) =>
                                                    setViewVitalSigns(r)
                                                }
                                                onViewTreatment={(r) =>
                                                    setViewTreatment(r)
                                                }
                                                onViewPrescription={(r) =>
                                                    setViewPrescription(r)
                                                }
                                                onViewLaboratory={(id) =>
                                                    setViewLaboratory(id)
                                                }
                                                onViewComplaint={(r) =>
                                                    setViewComplaint(r)
                                                }
                                                onViewExamination={(r) =>
                                                    setViewExamination(r)
                                                }
                                                onViewDiagnosis={(r) =>
                                                    setViewDiagnosis(r)
                                                }
                                                onViewAdmission={(r) =>
                                                    setViewAdmission(r)
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

            <ComplaintViewModal
                record={viewComplaint}
                open={viewComplaint !== null}
                onOpenChange={(open) => {
                    if (!open) {
                        setViewComplaint(null);
                    }
                }}
            />

            <ExaminationViewModal
                record={viewExamination}
                open={viewExamination !== null}
                onOpenChange={(open) => {
                    if (!open) {
                        setViewExamination(null);
                    }
                }}
            />

            <DiagnosisViewModal
                record={viewDiagnosis}
                open={viewDiagnosis !== null}
                onOpenChange={(open) => {
                    if (!open) {
                        setViewDiagnosis(null);
                    }
                }}
            />

            <AdmissionViewModal
                record={viewAdmission}
                open={viewAdmission !== null}
                onOpenChange={(open) => {
                    if (!open) {
                        setViewAdmission(null);
                    }
                }}
            />

            <ConfirmDialog
                open={recordToDelete !== null}
                onOpenChange={(open) => {
                    if (!open && !deleteProcessing) {
                        setRecordToDelete(null);
                    }
                }}
                title="Delete record"
                description={`Delete this ${recordToDelete?.type ?? 'consultation'} record? This cannot be undone.`}
                confirmLabel={deleteProcessing ? 'Deleting...' : 'Delete'}
                destructive
                processing={deleteProcessing}
                onConfirm={confirmDelete}
            />

            <ConfirmDialog
                open={showStartConfirm}
                onOpenChange={(open) => {
                    if (!open && !startProcessing) {
                        setShowStartConfirm(false);
                    }
                }}
                title="Start appointment"
                description="Start this consultation appointment now?"
                confirmLabel={
                    startProcessing ? 'Starting...' : 'Start appointment'
                }
                processing={startProcessing}
                onConfirm={startConsultation}
            />

            <ConfirmDialog
                open={showEndConfirm}
                onOpenChange={(open) => {
                    if (!open && !endProcessing) {
                        setShowEndConfirm(false);
                    }
                }}
                title="End appointment"
                description="End this consultation appointment now?"
                confirmLabel={endProcessing ? 'Ending...' : 'End appointment'}
                destructive
                processing={endProcessing}
                onConfirm={endConsultation}
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
    onEdit,
    onDelete,
    deleteProcessing,
    onViewVitalSigns,
    onViewTreatment,
    onViewPrescription,
    onViewLaboratory,
    onViewComplaint,
    onViewExamination,
    onViewDiagnosis,
    onViewAdmission,
    disabled,
}: {
    type: ConsultationRecordType;
    record: ConsultationRecord;
    onEdit: () => void;
    onDelete: () => void;
    deleteProcessing: boolean;
    onViewVitalSigns: (record: ConsultationRecord) => void;
    onViewTreatment: (record: ConsultationRecord) => void;
    onViewPrescription: (record: ConsultationRecord) => void;
    onViewLaboratory: (id: number) => void;
    onViewComplaint: (record: ConsultationRecord) => void;
    onViewExamination: (record: ConsultationRecord) => void;
    onViewDiagnosis: (record: ConsultationRecord) => void;
    onViewAdmission: (record: ConsultationRecord) => void;
    disabled: boolean;
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
                {type === 'complaints' ? (
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onViewComplaint(record)}
                    >
                        View
                    </Button>
                ) : null}
                {type === 'examinations' ? (
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onViewExamination(record)}
                    >
                        View
                    </Button>
                ) : null}
                {type === 'diagnoses' ? (
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onViewDiagnosis(record)}
                    >
                        View
                    </Button>
                ) : null}
                {type === 'admissions' ? (
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onViewAdmission(record)}
                    >
                        View
                    </Button>
                ) : null}
                <Button
                    size="sm"
                    variant="secondary"
                    disabled={
                        disabled ||
                        (record.status
                            ? [
                                  'paid',
                                  'submitted',
                                  'dispensed',
                                  'completed',
                                  'cancelled',
                              ].includes(record.status)
                            : false)
                    }
                    onClick={onEdit}
                >
                    Edit
                </Button>
                <Button
                    size="sm"
                    variant="destructive"
                    disabled={
                        disabled ||
                        deleteProcessing ||
                        (record.status
                            ? [
                                  'paid',
                                  'submitted',
                                  'dispensed',
                                  'completed',
                                  'cancelled',
                              ].includes(record.status)
                            : false)
                    }
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
            href: props.currentTeam ? index.url(props.currentTeam.slug) : home.url(),
        },
    ],
});
