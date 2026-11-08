import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import ConsultationRecordController from '@/actions/App/Http/Controllers/ConsultationRecordController';
import Heading from '@/components/heading';
import Pagination from '@/components/pagination';
import { VitalSignsViewModal } from '@/components/vital-signs-view-modal';
import { TreatmentViewModal } from '@/components/treatment-view-modal';
import { PrescriptionViewModal } from '@/components/prescription-view-modal';
import { LaboratoryViewModal } from '@/components/laboratory-view-modal';
import { ComplaintViewModal } from '@/components/complaint-view-modal';
import { ExaminationViewModal } from '@/components/examination-view-modal';
import { DiagnosisViewModal } from '@/components/diagnosis-view-modal';
import { AdmissionViewModal } from '@/components/admission-view-modal';
import { EndAppointmentModal } from '@/components/end-appointment-modal';
import { notesToString } from '@/utils/notes';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogClose,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SelectNative } from '@/components/ui/select-native';
import { end, index, start, transfer, view, viewAll } from '@/routes/consultations';
import { ConsultationRecordForm } from './record-form';
import type {
    ConsultationDetail,
    ConsultationFormValues,
    ConsultationItem,
    ConsultationPagination,
    ConsultationRecord,
    ConsultationRecordOptions,
    ConsultationRecordType,
    ConsultationRecordsWithPagination,
    ConsultationSection,
    PaginatedConsultationRecords,
} from '@/types';
type DoctorOption = { id: number; name: string };
type NurseOption = { id: number; name: string };

type Props = {
    section: ConsultationSection;
    consultation: ConsultationItem;
    detail: ConsultationDetail;
    records: ConsultationRecordsWithPagination;
    options: ConsultationRecordOptions;
    currencySymbol: string;
    pagination: ConsultationPagination | null;
    doctorOptions: DoctorOption[];
    nurseOptions: NurseOption[];
};

const SECTIONS: { key: ConsultationSection; label: string }[] = [
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

const EMPTY_TRANSFER = {
    transferTo: 'doctor' as 'doctor' | 'nurse',
    doctor_id: '',
    nurse_id: '',
};

export default function ConsultationsView({
    section,
    consultation,
    detail,
    records,
    options,
    currencySymbol,
    pagination,
    doctorOptions,
    nurseOptions,
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
    const [viewComplaint, setViewComplaint] = useState<ConsultationRecord | null>(null);
    const [viewExamination, setViewExamination] = useState<ConsultationRecord | null>(null);
    const [viewDiagnosis, setViewDiagnosis] = useState<ConsultationRecord | null>(null);
    const [viewAdmission, setViewAdmission] = useState<ConsultationRecord | null>(null);
    const [showEndAppointment, setShowEndAppointment] = useState(false);

    // Transfer state
    const [transferOpen, setTransferOpen] = useState(false);
    const [transferForm, setTransferForm] = useState(EMPTY_TRANSFER);
    const [transferProcessing, setTransferProcessing] = useState(false);
    const [transferError, setTransferError] = useState<string | null>(null);

    const recordType = section === 'overview' ? null : section;

    // Transfer functions
    function openTransfer() {
        setTransferForm(EMPTY_TRANSFER);
        setTransferError(null);
        setTransferOpen(true);
    }

    function submitTransfer() {
        setTransferProcessing(true);
        setTransferError(null);

        router.patch(
            transfer.url({
                current_team: teamSlug,
                consultation: consultation.id,
            }),
            transferForm,
            {
                preserveScroll: true,
                onError: (errors: Record<string, string>) =>
                    setTransferError(
                        Object.values(errors)[0] ?? 'Something went wrong.',
                    ),
                onSuccess: () => {
                    setTransferOpen(false);
                    setTransferForm(EMPTY_TRANSFER);
                },
                onFinish: () => setTransferProcessing(false),
            },
        );
    }

    // Determine if records are paginated
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
            view.url({
                current_team: teamSlug,
                consultation: consultation.id,
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
        if (consultation.status === 'scheduled' && next !== 'overview') {
            return;
        }

        router.get(
            view.url({
                current_team: teamSlug,
                consultation: consultation.id,
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

        const options_ = {
            preserveScroll: true,
            onError: (errors: Record<string, string>) =>
                setError(Object.values(errors)[0] ?? 'Something went wrong.'),
            onSuccess: () => {
                setFormOpen(false);
                setActiveRecord(null);
                // Show end appointment modal only for new prescriptions
                if (!activeRecord && recordType === 'prescriptions') {
                    setShowEndAppointment(true);
                }
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

    function destroy(record: ConsultationRecord) {
        if (!recordType) {
            return;
        }

        router.delete(
            ConsultationRecordController.destroy.url({
                current_team: teamSlug,
                consultation: consultation.id,
                type: recordType,
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
                            description="Consultation details and clinical records."
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            size="sm"
                            variant="outline"
                            asChild
                        >
                            <Link
                                href={viewAll.url({
                                    current_team: teamSlug,
                                    consultation: consultation.id,
                                })}
                            >
                                All records
                            </Link>
                        </Button>
                        <Button
                            size="sm"
                            variant="secondary"
                            onClick={openTransfer}
                        >
                            Transfer patient
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

                <div className="flex flex-wrap gap-2">
                    {SECTIONS.map((item) => {
                        const isDisabled =
                            consultation.status === 'scheduled' &&
                            item.key !== 'overview';

                        return (
                            <Button
                                key={item.key}
                                size="sm"
                                variant={
                                    item.key === section
                                        ? 'default'
                                        : 'secondary'
                                }
                                disabled={isDisabled}
                                onClick={() => switchSection(item.key)}
                            >
                                {item.label}
                            </Button>
                        );
                    })}
                </div>

                {section === 'overview' ? (
                    <Card>
                        <CardHeader>
                            <CardTitle>Patient information</CardTitle>
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
                                {consultation.status !== 'scheduled' ? (
                                    <Button size="sm" onClick={openCreate}>
                                        New
                                    </Button>
                                ) : null}
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
                                                onViewComplaint={(r) => setViewComplaint(r)}
                                                onViewExamination={(r) => setViewExamination(r)}
                                                onViewDiagnosis={(r) => setViewDiagnosis(r)}
                                                onViewAdmission={(r) => setViewAdmission(r)}
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

            <EndAppointmentModal
                open={showEndAppointment}
                onEndAppointment={() => {
                    setShowEndAppointment(false);
                    endConsultation();
                }}
                onContinue={() => setShowEndAppointment(false)}
            />

            {/* Transfer Patient Dialog */}
            <Dialog open={transferOpen} onOpenChange={setTransferOpen}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Transfer patient</DialogTitle>
                        <DialogDescription>
                            Transfer {consultation.patientId} to another{' '}
                            {transferForm.transferTo}.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="consultation-transfer-to-type">
                                Transfer to
                            </Label>
                            <SelectNative
                                id="consultation-transfer-to-type"
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
                                <Label htmlFor="consultation-transfer-doctor">
                                    To doctor
                                </Label>
                                <SelectNative
                                    id="consultation-transfer-doctor"
                                    value={transferForm.doctor_id}
                                    onChange={(event) =>
                                        setTransferForm((current) => ({
                                            ...current,
                                            doctor_id: event.target.value,
                                        }))
                                    }
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
                                <Label htmlFor="consultation-transfer-nurse">
                                    To nurse
                                </Label>
                                <SelectNative
                                    id="consultation-transfer-nurse"
                                    value={transferForm.nurse_id}
                                    onChange={(event) =>
                                        setTransferForm((current) => ({
                                            ...current,
                                            nurse_id: event.target.value,
                                        }))
                                    }
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

                        {transferError ? (
                            <p className="text-sm text-destructive">
                                {transferError}
                            </p>
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
                            disabled={transferProcessing}
                        >
                            {transferProcessing
                                ? 'Transferring...'
                                : 'Transfer patient'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
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

const isDisabledForEdit = (type: ConsultationRecordType, status: string | null | undefined): boolean => {
    if (!status) {
        return false;
    }
    const generalDisabled = ['paid', 'submitted', 'dispensed', 'completed', 'cancelled'];
    if (generalDisabled.includes(status)) {
        return true;
    }
    if (type === 'admissions' && status === 'admitted') {
        return true;
    }
    if (type === 'prescriptions' && status === 'refund') {
        return true;
    }
    return false;
};

const isDisabledForDelete = (type: ConsultationRecordType, status: string | null | undefined): boolean => {
    if (!status) {
        return false;
    }
    const generalDisabled = ['paid', 'submitted', 'dispensed', 'completed', 'cancelled'];
    if (generalDisabled.includes(status)) {
        return true;
    }
    if (type === 'admissions' && status === 'admitted') {
        return true;
    }
    if (type === 'prescriptions' && status === 'refund') {
        return true;
    }
    return false;
};

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
    onViewComplaint,
    onViewExamination,
    onViewDiagnosis,
    onViewAdmission,
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
    onViewComplaint: (record: ConsultationRecord) => void;
    onViewExamination: (record: ConsultationRecord) => void;
    onViewDiagnosis: (record: ConsultationRecord) => void;
    onViewAdmission: (record: ConsultationRecord) => void;
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
                    disabled={isDisabledForEdit(type, record.status)}
                    onClick={onEdit}
                >
                    Edit
                </Button>
                <Button
                    size="sm"
                    variant="outline"
                    disabled={isDisabledForDelete(type, record.status)}
                    onClick={onDelete}
                >
                    Delete
                </Button>
            </div>
        </div>
    );
}

ConsultationsView.layout = (props: {
    currentTeam?: { slug: string } | null;
}) => ({
    breadcrumbs: [
        {
            title: 'Consultations',
            href: props.currentTeam ? index.url(props.currentTeam.slug) : '/',
        },
    ],
});
