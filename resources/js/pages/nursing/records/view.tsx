import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
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
import { notesToString, parseExaminationNotes } from '@/utils/notes';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import { SelectNative } from '@/components/ui/select-native';
import { Textarea } from '@/components/ui/textarea';
import { index as recordsIndex } from '@/routes/nursing/records';
import { end, start, transfer, view } from '@/routes/nursing/records';
import { destroy as historyDestroy, store as historyStore, update as historyUpdate } from '@/routes/nursing/records/histories';
import {
    destroy as presentPregnancyDestroy,
    store as presentPregnancyStore,
    update as presentPregnancyUpdate,
} from '@/routes/nursing/records/present-pregnancy';
import {
    destroy as previousPregnancyDestroy,
    store as previousPregnancyStore,
    update as previousPregnancyUpdate,
} from '@/routes/nursing/records/previous-pregnancy';
import {
    destroy,
    store,
    update,
} from '@/routes/nursing/records/records';
import { ConsultationRecordForm } from '@/pages/consultations/record-form';
import { NursingExaminationForm } from '@/pages/nursing/nursing-examination-form';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import type {
    ConsultationFormValues,
    ConsultationPagination,
    ConsultationRecord,
    ConsultationRecordOptions,
    ConsultationRecordType,
    ConsultationRecordsWithPagination,
    PaginatedConsultationRecords,
} from '@/types';
import type { Team } from '@/types';

type NursingSection = 'overview' | 'history' | 'present-pregnancy' | 'previous-pregnancy' | ConsultationRecordType;

const SECTIONS: { key: NursingSection; label: string }[] = [
    { key: 'overview', label: 'Overview' },
    { key: 'vital-signs', label: 'Vital signs' },
    { key: 'complaints', label: 'Complaints' },
    { key: 'examinations', label: 'Examinations' },
    { key: 'diagnoses', label: 'Diagnoses' },
    { key: 'history', label: 'History' },
    { key: 'present-pregnancy', label: 'Present Pregnancy' },
    { key: 'previous-pregnancy', label: 'Previous Pregnancy' },
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

type DoctorOption = { id: number; name: string };
type NurseOption = { id: number; name: string };

const EMPTY_TRANSFER = {
    transferTo: 'doctor' as 'doctor' | 'nurse',
    doctor_id: '',
    nurse_id: '',
};

type FamilyHistoryItem = {
    status: 'yes' | 'no' | 'others' | null;
    others: string | null;
};

type HistoryItem = {
    id: number;
    familyHistory: Record<string, FamilyHistoryItem>;
    socialHistory: string | null;
    surgicalHistory: Record<string, FamilyHistoryItem>;
    nurseName: string | null;
    canEdit: number;
    createdAt: string | null;
};

type HistoryPaginator = {
    data: HistoryItem[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
};

type PresentPregnancyPaginator = {
    data: PresentPregnancyItem[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
};

type PreviousPregnancyPaginator = {
    data: PreviousPregnancyItem[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
};

type PresentPregnancyItem = {
    id: number;
    date: string | null;
    bp: string | null;
    gA: string | null;
    weight: number | null;
    lmp: string | null;
    edd: string | null;
    sfh: number | null;
    lie: string | null;
    position: string | null;
    fhr: number | null;
    hb: number | null;
    oedema: boolean | null;
    nurseName: string | null;
    canEdit: number;
    createdAt: string | null;
};

type PreviousPregnancyItem = {
    id: number;
    year: number | null;
    ga: string | null;
    durationOfPregnancy: string | null;
    durationOfLabour: string | null;
    abortion: boolean | null;
    iufd: boolean | null;
    aph: boolean | null;
    pph: boolean | null;
    sex: string | null;
    weight: number | null;
    modeOfDelivery: string | null;
    ageLife: string | null;
    ageDeath: string | null;
    nurseName: string | null;
    canEdit: number;
    createdAt: string | null;
};

const FAMILY_HISTORY_FIELDS = [
    { key: 'hypertension', label: 'Hypertension' },
    { key: 'sickle_cell', label: 'Sickle Cell' },
    { key: 'tuberculosis', label: 'Tuberculosis' },
    { key: 'diabetes', label: 'Diabetes' },
    { key: 'pud', label: 'PUD' },
];

const SURGICAL_HISTORY_FIELDS = [
    { key: 'myomectomy', label: 'Myomectomy' },
    { key: 'cs', label: 'Caesarean Section' },
    { key: 'mastectomy', label: 'Mastectomy' },
    { key: 'hysterectomy', label: 'Hysterectomy' },
    { key: 'blood_transfusion', label: 'Blood Transfusion' },
];

function emptyFamilyHistory(): Record<string, FamilyHistoryItem> {
    const result: Record<string, FamilyHistoryItem> = {};
    FAMILY_HISTORY_FIELDS.forEach((field) => {
        result[field.key] = { status: null, others: null };
    });
    return result;
}

function emptySurgicalHistory(): Record<string, FamilyHistoryItem> {
    const result: Record<string, FamilyHistoryItem> = {};
    SURGICAL_HISTORY_FIELDS.forEach((field) => {
        result[field.key] = { status: null, others: null };
    });
    return result;
}

type HistoryForm = {
    familyHistory: Record<string, FamilyHistoryItem>;
    socialHistory: string;
    surgicalHistory: Record<string, FamilyHistoryItem>;
};

const emptyHistoryForm: HistoryForm = {
    familyHistory: emptyFamilyHistory(),
    socialHistory: '',
    surgicalHistory: emptySurgicalHistory(),
};

type PresentPregnancyForm = {
    date: string;
    bp: string;
    gA: string;
    weight: string;
    lmp: string;
    edd: string;
    sfh: string;
    lie: string;
    position: string;
    fhr: string;
    hb: string;
    oedema: string;
};

const emptyPresentPregnancyForm: PresentPregnancyForm = {
    date: new Date().toISOString().split('T')[0],
    bp: '',
    gA: '',
    weight: '',
    lmp: '',
    edd: '',
    sfh: '',
    lie: '',
    position: '',
    fhr: '',
    hb: '',
    oedema: '',
};

const LIE_OPTIONS = ['longitudinal', 'transverse', 'oblique'];
const POSITION_OPTIONS = ['left anterior', 'left posterior', 'right anterior', 'right posterior'];

type PreviousPregnancyForm = {
    year: string;
    ga: string;
    durationOfPregnancy: string;
    durationOfLabour: string;
    abortion: string;
    iufd: string;
    aph: string;
    pph: string;
    sex: string;
    weight: string;
    modeOfDelivery: string;
    ageLife: string;
    ageDeath: string;
};

const emptyPreviousPregnancyForm: PreviousPregnancyForm = {
    year: '',
    ga: '',
    durationOfPregnancy: '',
    durationOfLabour: '',
    abortion: '',
    iufd: '',
    aph: '',
    pph: '',
    sex: '',
    weight: '',
    modeOfDelivery: '',
    ageLife: '',
    ageDeath: '',
};

export default function NursingRecordsView({
    section,
    nursing,
    detail,
    records,
    histories,
    presentPregnancies,
    previousPregnancies,
    options,
    currencySymbol,
    pagination,
    doctorOptions,
    nurseOptions,
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
        category: string | null;
        nurseName: string | null;
        billingStatus: string | null;
        purpose: string | null;
        status: string;
        createdAt: string | null;
    };
    records: ConsultationRecordsWithPagination;
    histories: HistoryPaginator;
    presentPregnancies: PresentPregnancyPaginator;
    previousPregnancies: PreviousPregnancyPaginator;
    options: ConsultationRecordOptions;
    currencySymbol: string;
    pagination: ConsultationPagination | null;
    doctorOptions: DoctorOption[];
    nurseOptions: NurseOption[];
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
    const [viewVitalSigns, setViewVitalSigns] = useState<ConsultationRecord | null>(null);
    const [viewTreatment, setViewTreatment] = useState<ConsultationRecord | null>(null);
    const [viewPrescription, setViewPrescription] = useState<ConsultationRecord | null>(null);
    const [viewLaboratory, setViewLaboratory] = useState<number | null>(null);
    const [viewComplaint, setViewComplaint] = useState<ConsultationRecord | null>(null);
    const [viewExamination, setViewExamination] = useState<ConsultationRecord | null>(null);
    const [viewDiagnosis, setViewDiagnosis] = useState<ConsultationRecord | null>(null);
    const [viewAdmission, setViewAdmission] = useState<ConsultationRecord | null>(null);
    const [showEndAppointment, setShowEndAppointment] = useState(false);

    // History state
    const [historyFormOpen, setHistoryFormOpen] = useState(false);
    const [historyEditId, setHistoryEditId] = useState<number | null>(null);
    const [historyForm, setHistoryForm] = useState<HistoryForm>(emptyHistoryForm);
    const [historyProcessing, setHistoryProcessing] = useState(false);
    const [historyError, setHistoryError] = useState<string | null>(null);

    // Present Pregnancy state
    const [presentPregFormOpen, setPresentPregFormOpen] = useState(false);
    const [presentPregEditId, setPresentPregEditId] = useState<number | null>(null);
    const [presentPregForm, setPresentPregForm] = useState<PresentPregnancyForm>(emptyPresentPregnancyForm);
    const [presentPregProcessing, setPresentPregProcessing] = useState(false);
    const [presentPregError, setPresentPregError] = useState<string | null>(null);

    // Previous Pregnancy state
    const [previousPregFormOpen, setPreviousPregFormOpen] = useState(false);
    const [previousPregEditId, setPreviousPregEditId] = useState<number | null>(null);
    const [previousPregForm, setPreviousPregForm] = useState<PreviousPregnancyForm>(emptyPreviousPregnancyForm);
    const [previousPregProcessing, setPreviousPregProcessing] = useState(false);
    const [previousPregError, setPreviousPregError] = useState<string | null>(null);

    // Transfer state
    const [transferOpen, setTransferOpen] = useState(false);
    const [transferForm, setTransferForm] = useState(EMPTY_TRANSFER);
    const [transferProcessing, setTransferProcessing] = useState(false);
    const [transferError, setTransferError] = useState<string | null>(null);

    const recordType = (section !== 'overview' && section !== 'history' && section !== 'present-pregnancy' && section !== 'previous-pregnancy')
        ? section
        : null;

    const isPaginated = recordType
        ? typeof records[recordType] !== 'undefined'
            && 'data' in records[recordType]
            && 'currentPage' in records[recordType]
        : false;

    const paginatedRecords: PaginatedConsultationRecords | null = isPaginated
        ? records[recordType as keyof typeof records] as PaginatedConsultationRecords
        : null;

    const currentRecords: ConsultationRecord[] = isPaginated
        ? paginatedRecords?.data ?? []
        : recordType
            ? (records[recordType] as ConsultationRecord[])
            : [];

    function applyPagination(page: number, perPage?: number) {
        if (!recordType) {
            return;
        }

        const currentPerPage = perPage ?? (pagination as ConsultationPagination)?.perPage ?? 25;

        router.get(
            view.url({
                current_team: teamSlug,
                nursing: nursing.id,
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
                // Show end appointment modal only for new prescriptions
                if (!activeRecord && recordType === 'prescriptions') {
                    setShowEndAppointment(true);
                }
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

    function endNursing() {
        router.patch(
            end.url({
                current_team: teamSlug,
                nursing: nursing.id,
            }),
            {},
            { preserveScroll: true },
        );
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

    function startANC() {
        router.patch(
            start.url({
                current_team: teamSlug,
                nursing: nursing.id,
            }),
            {},
            { preserveScroll: true },
        );
    }

    function endANC() {
        router.patch(
            end.url({
                current_team: teamSlug,
                nursing: nursing.id,
            }),
            {},
            { preserveScroll: true },
        );
    }

    // History handlers
    function startHistoryCreate() {
        setHistoryEditId(null);
        setHistoryForm(emptyHistoryForm);
        setHistoryError(null);
        setHistoryFormOpen(true);
    }

    function startHistoryEdit(item: HistoryItem) {
        setHistoryEditId(item.id);
        setHistoryForm({
            familyHistory: JSON.parse(JSON.stringify(item.familyHistory)),
            socialHistory: item.socialHistory ?? '',
            surgicalHistory: JSON.parse(JSON.stringify(item.surgicalHistory)),
        });
        setHistoryError(null);
        setHistoryFormOpen(true);
    }

    function submitHistory(event: React.FormEvent) {
        event.preventDefault();
        setHistoryProcessing(true);
        setHistoryError(null);

        const payload = {
            family_history: historyForm.familyHistory,
            social_history: historyForm.socialHistory || null,
            surgical_history: historyForm.surgicalHistory,
        };

        const opts = {
            preserveScroll: true,
            onError: (errors: Record<string, string>) =>
                setHistoryError(Object.values(errors)[0] ?? 'Something went wrong.'),
            onSuccess: () => {
                setHistoryFormOpen(false);
                setHistoryEditId(null);
            },
            onFinish: () => setHistoryProcessing(false),
        };

        if (historyEditId) {
            router.patch(
                historyUpdate.url({
                    current_team: teamSlug,
                    nursing: nursing.id,
                    history: historyEditId,
                }),
                payload,
                opts,
            );
        } else {
            router.post(
                historyStore.url({
                    current_team: teamSlug,
                    nursing: nursing.id,
                }),
                payload,
                opts,
            );
        }
    }

    function deleteHistory(id: number) {
        router.delete(
            historyDestroy.url({
                current_team: teamSlug,
                nursing: nursing.id,
                history: id,
            }),
            { preserveScroll: true },
        );
    }

    function updateHistoryFamilyHistory(
        key: string,
        field: 'status' | 'others',
        value: string | null,
    ) {
        setHistoryForm((prev) => ({
            ...prev,
            familyHistory: {
                ...prev.familyHistory,
                [key]: { ...prev.familyHistory[key], [field]: value },
            },
        }));
    }

    function updateHistorySurgicalHistory(
        key: string,
        field: 'status' | 'others',
        value: string | null,
    ) {
        setHistoryForm((prev) => ({
            ...prev,
            surgicalHistory: {
                ...prev.surgicalHistory,
                [key]: { ...prev.surgicalHistory[key], [field]: value },
            },
        }));
    }

    function renderHistoryStatusBadge(status: string | null) {
        if (!status) return '—';
        if (status === 'yes') return <Badge className="bg-emerald-100 text-emerald-800">Yes</Badge>;
        if (status === 'no') return <Badge className="bg-muted text-muted-foreground">No</Badge>;
        return <Badge className="bg-amber-100 text-amber-800">Others</Badge>;
    }

    // Present Pregnancy handlers
    function startPresentPregCreate() {
        setPresentPregEditId(null);
        setPresentPregForm(emptyPresentPregnancyForm);
        setPresentPregError(null);
        setPresentPregFormOpen(true);
    }

    function startPresentPregEdit(record: PresentPregnancyItem) {
        setPresentPregEditId(record.id);
        setPresentPregForm({
            date: record.date ? record.date.split('T')[0] : new Date().toISOString().split('T')[0],
            bp: record.bp ?? '',
            gA: record.gA ?? '',
            weight: record.weight?.toString() ?? '',
            lmp: record.lmp ? record.lmp.split('T')[0] : '',
            edd: record.edd ? record.edd.split('T')[0] : '',
            sfh: record.sfh?.toString() ?? '',
            lie: record.lie ?? '',
            position: record.position ?? '',
            fhr: record.fhr?.toString() ?? '',
            hb: record.hb?.toString() ?? '',
            oedema: record.oedema === true ? 'yes' : record.oedema === false ? 'no' : '',
        });
        setPresentPregError(null);
        setPresentPregFormOpen(true);
    }

    function submitPresentPregnancy(event: React.FormEvent) {
        event.preventDefault();
        setPresentPregProcessing(true);
        setPresentPregError(null);

        const payload = {
            date: presentPregForm.date,
            bp: presentPregForm.bp || null,
            g_a: presentPregForm.gA || null,
            weight: presentPregForm.weight ? parseFloat(presentPregForm.weight) : null,
            lmp: presentPregForm.lmp || null,
            edd: presentPregForm.edd || null,
            sfh: presentPregForm.sfh ? parseFloat(presentPregForm.sfh) : null,
            lie: presentPregForm.lie || null,
            position: presentPregForm.position || null,
            fhr: presentPregForm.fhr ? parseInt(presentPregForm.fhr, 10) : null,
            hb: presentPregForm.hb ? parseFloat(presentPregForm.hb) : null,
            oedema: presentPregForm.oedema === 'yes' ? true : presentPregForm.oedema === 'no' ? false : null,
        };

        const opts = {
            preserveScroll: true,
            onError: (errors: Record<string, string>) =>
                setPresentPregError(Object.values(errors)[0] ?? 'Something went wrong.'),
            onSuccess: () => {
                setPresentPregFormOpen(false);
                setPresentPregEditId(null);
            },
            onFinish: () => setPresentPregProcessing(false),
        };

        if (presentPregEditId) {
            router.patch(
                presentPregnancyUpdate.url({
                    current_team: teamSlug,
                    nursing: nursing.id,
                    presentPregnancy: presentPregEditId,
                }),
                payload,
                opts,
            );
        } else {
            router.post(
                presentPregnancyStore.url({
                    current_team: teamSlug,
                    nursing: nursing.id,
                }),
                payload,
                opts,
            );
        }
    }

    function deletePresentPregnancy(id: number) {
        router.delete(
            presentPregnancyDestroy.url({
                current_team: teamSlug,
                nursing: nursing.id,
                presentPregnancy: id,
            }),
            { preserveScroll: true },
        );
    }

    function updatePresentPregField(field: keyof PresentPregnancyForm, value: string) {
        setPresentPregForm((prev) => ({ ...prev, [field]: value }));
    }

    function renderOedemaBadge(value: boolean | null) {
        if (value === null) return '—';
        if (value) return <Badge className="bg-emerald-100 text-emerald-800">Present</Badge>;
        return <Badge className="bg-muted text-muted-foreground">Absent</Badge>;
    }

    // Previous Pregnancy handlers
    function startPreviousPregCreate() {
        setPreviousPregEditId(null);
        setPreviousPregForm(emptyPreviousPregnancyForm);
        setPreviousPregError(null);
        setPreviousPregFormOpen(true);
    }

    function startPreviousPregEdit(record: PreviousPregnancyItem) {
        setPreviousPregEditId(record.id);
        setPreviousPregForm({
            year: record.year?.toString() ?? '',
            ga: record.ga ?? '',
            durationOfPregnancy: record.durationOfPregnancy ?? '',
            durationOfLabour: record.durationOfLabour ?? '',
            abortion: record.abortion === true ? 'yes' : record.abortion === false ? 'no' : '',
            iufd: record.iufd === true ? 'yes' : record.iufd === false ? 'no' : '',
            aph: record.aph === true ? 'yes' : record.aph === false ? 'no' : '',
            pph: record.pph === true ? 'yes' : record.pph === false ? 'no' : '',
            sex: record.sex ?? '',
            weight: record.weight?.toString() ?? '',
            modeOfDelivery: record.modeOfDelivery ?? '',
            ageLife: record.ageLife ?? '',
            ageDeath: record.ageDeath ?? '',
        });
        setPreviousPregError(null);
        setPreviousPregFormOpen(true);
    }

    function submitPreviousPregnancy(event: React.FormEvent) {
        event.preventDefault();
        setPreviousPregProcessing(true);
        setPreviousPregError(null);

        const payload = {
            year: previousPregForm.year ? parseInt(previousPregForm.year, 10) : null,
            ga: previousPregForm.ga || null,
            duration_of_pregnancy: previousPregForm.durationOfPregnancy || null,
            duration_of_labour: previousPregForm.durationOfLabour || null,
            abortion: previousPregForm.abortion === 'yes' ? true : previousPregForm.abortion === 'no' ? false : null,
            iufd: previousPregForm.iufd === 'yes' ? true : previousPregForm.iufd === 'no' ? false : null,
            aph: previousPregForm.aph === 'yes' ? true : previousPregForm.aph === 'no' ? false : null,
            pph: previousPregForm.pph === 'yes' ? true : previousPregForm.pph === 'no' ? false : null,
            sex: previousPregForm.sex || null,
            weight: previousPregForm.weight ? parseFloat(previousPregForm.weight) : null,
            mode_of_delivery: previousPregForm.modeOfDelivery || null,
            age_life: previousPregForm.ageLife || null,
            age_death: previousPregForm.ageDeath || null,
        };

        const opts = {
            preserveScroll: true,
            onError: (errors: Record<string, string>) =>
                setPreviousPregError(Object.values(errors)[0] ?? 'Something went wrong.'),
            onSuccess: () => {
                setPreviousPregFormOpen(false);
                setPreviousPregEditId(null);
            },
            onFinish: () => setPreviousPregProcessing(false),
        };

        if (previousPregEditId) {
            router.patch(
                previousPregnancyUpdate.url({
                    current_team: teamSlug,
                    nursing: nursing.id,
                    previousPregnancy: previousPregEditId,
                }),
                payload,
                opts,
            );
        } else {
            router.post(
                previousPregnancyStore.url({
                    current_team: teamSlug,
                    nursing: nursing.id,
                }),
                payload,
                opts,
            );
        }
    }

    function deletePreviousPregnancy(id: number) {
        router.delete(
            previousPregnancyDestroy.url({
                current_team: teamSlug,
                nursing: nursing.id,
                previousPregnancy: id,
            }),
            { preserveScroll: true },
        );
    }

    function updatePreviousPregField(field: keyof PreviousPregnancyForm, value: string) {
        setPreviousPregForm((prev) => ({ ...prev, [field]: value }));
    }

    function renderYesNoBadge(value: boolean | null) {
        if (value === null) return '—';
        if (value) return <Badge className="bg-emerald-100 text-emerald-800">Yes</Badge>;
        return <Badge className="bg-muted text-muted-foreground">No</Badge>;
    }

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
                nursing: nursing.id,
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
                        <Button
                            size="sm"
                            variant="secondary"
                            onClick={openTransfer}
                        >
                            Transfer patient
                        </Button>
                        {nursing.status === 'scheduled' ? (
                            <Button onClick={startANC}>
                                Start ANC
                            </Button>
                        ) : null}
                        {nursing.status === 'in_progress' ? (
                            <Button
                                variant="secondary"
                                onClick={endANC}
                            >
                                End ANC
                            </Button>
                        ) : null}
                    </div>
                </div>

                <div className="flex flex-wrap gap-2">
                    {SECTIONS.map((item) => {
                        const isDisabled =
                            nursing.status === 'scheduled' &&
                            item.key !== 'overview';

                        return (
                            <Button
                                key={item.key}
                                size="sm"
                                variant={
                                    item.key === section ? 'default' : 'secondary'
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
                            <CardTitle>Visit information</CardTitle>
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
                ) : section === 'history' ? (
                    <>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <CardTitle>History records</CardTitle>
                                <Button size="sm" onClick={startHistoryCreate}>
                                    New
                                </Button>
                            </CardHeader>
                            <CardContent>
                                {histories.data.length === 0 ? (
                                    <p className="py-8 text-center text-muted-foreground">
                                        No history records yet.
                                    </p>
                                ) : (
                                    <div className="space-y-6">
                                        {histories.data.map((item) => (
                                            <div
                                                key={item.id}
                                                className="rounded-lg border p-4 space-y-4"
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <p className="text-sm font-medium">
                                                            {item.nurseName ?? 'Unknown nurse'}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground">
                                                            {item.createdAt
                                                                ? new Date(item.createdAt).toLocaleString()
                                                                : ''}
                                                        </p>
                                                    </div>
                                                    {item.canEdit ? (
                                                        <div className="flex items-center gap-2">
                                                            <Button
                                                                size="sm"
                                                                variant="secondary"
                                                                onClick={() => startHistoryEdit(item)}
                                                            >
                                                                Edit
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                onClick={() => deleteHistory(item.id)}
                                                            >
                                                                Delete
                                                            </Button>
                                                        </div>
                                                    ) : null}
                                                </div>

                                                <div className="grid gap-4 md:grid-cols-2">
                                                    <div>
                                                        <h4 className="mb-2 text-sm font-semibold">
                                                            Family History
                                                        </h4>
                                                        <div className="space-y-1">
                                                            {FAMILY_HISTORY_FIELDS.map((field) => {
                                                                const value = item.familyHistory[field.key];
                                                                return (
                                                                    <div
                                                                        key={field.key}
                                                                        className="flex items-center justify-between text-sm"
                                                                    >
                                                                        <span className="text-muted-foreground">
                                                                            {field.label}
                                                                        </span>
                                                                        <div className="flex items-center gap-2">
                                                                            {renderHistoryStatusBadge(value?.status ?? null)}
                                                                            {value?.status === 'others' && value.others && (
                                                                                <span className="text-xs text-muted-foreground">
                                                                                    ({value.others})
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>

                                                    <div>
                                                        <h4 className="mb-2 text-sm font-semibold">
                                                            Surgical History
                                                        </h4>
                                                        <div className="space-y-1">
                                                            {SURGICAL_HISTORY_FIELDS.map((field) => {
                                                                const value = item.surgicalHistory[field.key];
                                                                return (
                                                                    <div
                                                                        key={field.key}
                                                                        className="flex items-center justify-between text-sm"
                                                                    >
                                                                        <span className="text-muted-foreground">
                                                                            {field.label}
                                                                        </span>
                                                                        {renderHistoryStatusBadge(value?.status ?? null)}
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                </div>

                                                {item.socialHistory && (
                                                    <div>
                                                        <h4 className="mb-1 text-sm font-semibold">
                                                            Social History
                                                        </h4>
                                                        <p className="text-sm whitespace-pre-line">
                                                            {item.socialHistory}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                        <Pagination
                            meta={{
                                currentPage: histories.current_page,
                                lastPage: histories.last_page,
                                perPage: histories.per_page,
                                total: histories.total,
                            }}
                            onPageChange={(page) => {
                                router.get(
                                    view.url({
                                        current_team: teamSlug,
                                        nursing: nursing.id,
                                        section: 'history',
                                    }, {
                                        query: {
                                            page,
                                        },
                                    }),
                                    {},
                                    { preserveState: true, preserveScroll: true, replace: true },
                                );
                            }}
                            onPerPageChange={(perPage) => {
                                router.get(
                                    view.url({
                                        current_team: teamSlug,
                                        nursing: nursing.id,
                                        section: 'history',
                                    }, {
                                        query: {
                                            page: 1,
                                            perPage,
                                        },
                                    }),
                                    {},
                                    { preserveState: true, preserveScroll: true, replace: true },
                                );
                            }}
                        />
                    </>
                ) : section === 'present-pregnancy' ? (
                    <>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <CardTitle>Present pregnancy records</CardTitle>
                                <Button size="sm" onClick={startPresentPregCreate}>
                                    New
                                </Button>
                            </CardHeader>
                            <CardContent>
                                {presentPregnancies.data.length === 0 ? (
                                    <p className="py-8 text-center text-muted-foreground">
                                        No present pregnancy records yet.
                                    </p>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Date</TableHead>
                                                    <TableHead>BP</TableHead>
                                                    <TableHead>G/A</TableHead>
                                                    <TableHead>Weight</TableHead>
                                                    <TableHead>LMP</TableHead>
                                                    <TableHead>EDD</TableHead>
                                                    <TableHead>SFH</TableHead>
                                                    <TableHead>Lie</TableHead>
                                                    <TableHead>Position</TableHead>
                                                    <TableHead>FHR</TableHead>
                                                    <TableHead>HB</TableHead>
                                                    <TableHead>Oedema</TableHead>
                                                    <TableHead>Nurse</TableHead>
                                                    <TableHead>Actions</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {presentPregnancies.data.map((record) => (
                                                    <TableRow key={record.id}>
                                                        <TableCell>
                                                            {record.date
                                                                ? new Date(record.date).toLocaleDateString()
                                                                : '—'}
                                                        </TableCell>
                                                        <TableCell>{record.bp ?? '—'}</TableCell>
                                                        <TableCell>{record.gA ?? '—'}</TableCell>
                                                        <TableCell>{record.weight ?? '—'}</TableCell>
                                                        <TableCell>
                                                            {record.lmp
                                                                ? new Date(record.lmp).toLocaleDateString()
                                                                : '—'}
                                                        </TableCell>
                                                        <TableCell>
                                                            {record.edd
                                                                ? new Date(record.edd).toLocaleDateString()
                                                                : '—'}
                                                        </TableCell>
                                                        <TableCell>{record.sfh ?? '—'}</TableCell>
                                                        <TableCell>
                                                            {record.lie ? (
                                                                <span className="capitalize">{record.lie}</span>
                                                            ) : (
                                                                '—'
                                                            )}
                                                        </TableCell>
                                                        <TableCell>
                                                            {record.position ? (
                                                                <span className="capitalize">{record.position}</span>
                                                            ) : (
                                                                '—'
                                                            )}
                                                        </TableCell>
                                                        <TableCell>{record.fhr ?? '—'}</TableCell>
                                                        <TableCell>{record.hb ?? '—'}</TableCell>
                                                        <TableCell>{renderOedemaBadge(record.oedema)}</TableCell>
                                                        <TableCell>{record.nurseName ?? '—'}</TableCell>
                                                        <TableCell>
                                                            {record.canEdit ? (
                                                                <div className="flex items-center gap-2">
                                                                    <Button
                                                                        size="sm"
                                                                        variant="secondary"
                                                                        onClick={() => startPresentPregEdit(record)}
                                                                    >
                                                                        Edit
                                                                    </Button>
                                                                    <Button
                                                                        size="sm"
                                                                        variant="outline"
                                                                        onClick={() => deletePresentPregnancy(record.id)}
                                                                    >
                                                                        Delete
                                                                    </Button>
                                                                </div>
                                                            ) : null}
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                        <Pagination
                            meta={{
                                currentPage: presentPregnancies.current_page,
                                lastPage: presentPregnancies.last_page,
                                perPage: presentPregnancies.per_page,
                                total: presentPregnancies.total,
                            }}
                            onPageChange={(page) => {
                                router.get(
                                    view.url({
                                        current_team: teamSlug,
                                        nursing: nursing.id,
                                        section: 'present-pregnancy',
                                    }, {
                                        query: {
                                            page,
                                        },
                                    }),
                                    {},
                                    { preserveState: true, preserveScroll: true, replace: true },
                                );
                            }}
                            onPerPageChange={(perPage) => {
                                router.get(
                                    view.url({
                                        current_team: teamSlug,
                                        nursing: nursing.id,
                                        section: 'present-pregnancy',
                                    }, {
                                        query: {
                                            page: 1,
                                            perPage,
                                        },
                                    }),
                                    {},
                                    { preserveState: true, preserveScroll: true, replace: true },
                                );
                            }}
                        />
                    </>
                ) : section === 'previous-pregnancy' ? (
                    <>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <CardTitle>Previous pregnancy records</CardTitle>
                                <Button size="sm" onClick={startPreviousPregCreate}>
                                    New
                                </Button>
                            </CardHeader>
                            <CardContent>
                                {previousPregnancies.data.length === 0 ? (
                                    <p className="py-8 text-center text-muted-foreground">
                                        No previous pregnancy records yet.
                                    </p>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Year</TableHead>
                                                    <TableHead>GA</TableHead>
                                                    <TableHead>Pregnancy</TableHead>
                                                    <TableHead>Labour</TableHead>
                                                    <TableHead>Abortion</TableHead>
                                                    <TableHead>IUFD</TableHead>
                                                    <TableHead>APH</TableHead>
                                                    <TableHead>PPH</TableHead>
                                                    <TableHead>Sex</TableHead>
                                                    <TableHead>Weight</TableHead>
                                                    <TableHead>Delivery</TableHead>
                                                    <TableHead>Age (Life)</TableHead>
                                                    <TableHead>Age (Death)</TableHead>
                                                    <TableHead>Nurse</TableHead>
                                                    <TableHead>Actions</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {previousPregnancies.data.map((record) => (
                                                    <TableRow key={record.id}>
                                                        <TableCell>{record.year ?? '—'}</TableCell>
                                                        <TableCell>{record.ga ?? '—'}</TableCell>
                                                        <TableCell>{record.durationOfPregnancy ?? '—'}</TableCell>
                                                        <TableCell>{record.durationOfLabour ?? '—'}</TableCell>
                                                        <TableCell>{renderYesNoBadge(record.abortion)}</TableCell>
                                                        <TableCell>{renderYesNoBadge(record.iufd)}</TableCell>
                                                        <TableCell>{renderYesNoBadge(record.aph)}</TableCell>
                                                        <TableCell>{renderYesNoBadge(record.pph)}</TableCell>
                                                        <TableCell>
                                                            {record.sex ? (
                                                                <span className="capitalize">{record.sex}</span>
                                                            ) : (
                                                                '—'
                                                            )}
                                                        </TableCell>
                                                        <TableCell>{record.weight ?? '—'}</TableCell>
                                                        <TableCell>{record.modeOfDelivery ?? '—'}</TableCell>
                                                        <TableCell>{record.ageLife ?? '—'}</TableCell>
                                                        <TableCell>{record.ageDeath ?? '—'}</TableCell>
                                                        <TableCell>{record.nurseName ?? '—'}</TableCell>
                                                        <TableCell>
                                                            {record.canEdit ? (
                                                                <div className="flex items-center gap-2">
                                                                    <Button
                                                                        size="sm"
                                                                        variant="secondary"
                                                                        onClick={() => startPreviousPregEdit(record)}
                                                                    >
                                                                        Edit
                                                                    </Button>
                                                                    <Button
                                                                        size="sm"
                                                                        variant="outline"
                                                                        onClick={() => deletePreviousPregnancy(record.id)}
                                                                    >
                                                                        Delete
                                                                    </Button>
                                                                </div>
                                                            ) : null}
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                        <Pagination
                            meta={{
                                currentPage: previousPregnancies.current_page,
                                lastPage: previousPregnancies.last_page,
                                perPage: previousPregnancies.per_page,
                                total: previousPregnancies.total,
                            }}
                            onPageChange={(page) => {
                                router.get(
                                    view.url({
                                        current_team: teamSlug,
                                        nursing: nursing.id,
                                        section: 'previous-pregnancy',
                                    }, {
                                        query: {
                                            page,
                                        },
                                    }),
                                    {},
                                    { preserveState: true, preserveScroll: true, replace: true },
                                );
                            }}
                            onPerPageChange={(perPage) => {
                                router.get(
                                    view.url({
                                        current_team: teamSlug,
                                        nursing: nursing.id,
                                        section: 'previous-pregnancy',
                                    }, {
                                        query: {
                                            page: 1,
                                            perPage,
                                        },
                                    }),
                                    {},
                                    { preserveState: true, preserveScroll: true, replace: true },
                                );
                            }}
                        />
                    </>
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
                                                onDelete={() => destroyRecord(record)}
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
                    endNursing();
                }}
                onContinue={() => setShowEndAppointment(false)}
            />

            <Sheet
                open={historyFormOpen}
                onOpenChange={(open) => {
                    if (!open) {
                        setHistoryFormOpen(false);
                        setHistoryEditId(null);
                    }
                }}
            >
                <SheetContent className="w-full overflow-y-auto sm:max-w-2xl">
                    <SheetHeader>
                        <SheetTitle>
                            {historyEditId ? 'Edit' : 'New'} history record
                        </SheetTitle>
                        <SheetDescription>
                            Record family, social, and surgical history for this patient.
                        </SheetDescription>
                    </SheetHeader>

                    <form onSubmit={submitHistory}>
                        <div className="space-y-4 px-4 pb-4">
                            {historyError && (
                                <p className="rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700">
                                    {historyError}
                                </p>
                            )}

                            <div>
                                <Label className="text-base font-semibold">Family History</Label>
                                <div className="mt-2 grid grid-cols-2 gap-4">
                                    {FAMILY_HISTORY_FIELDS.map((field) => (
                                        <div key={field.key} className="space-y-2">
                                            <Label className="text-sm">{field.label}</Label>
                                            <div className="flex gap-4">
                                                {['yes', 'no', 'others'].map((option) => (
                                                    <label
                                                        key={option}
                                                        className="flex items-center gap-2 text-sm"
                                                    >
                                                        <input
                                                            type="radio"
                                                            name={`family-${field.key}`}
                                                            value={option}
                                                            checked={
                                                                historyForm.familyHistory[field.key]?.status === option
                                                            }
                                                            onChange={() =>
                                                                updateHistoryFamilyHistory(
                                                                    field.key,
                                                                    'status',
                                                                    option,
                                                                )
                                                            }
                                                        />
                                                        <span className="capitalize">{option}</span>
                                                    </label>
                                                ))}
                                            </div>
                                            {historyForm.familyHistory[field.key]?.status === 'others' && (
                                                <input
                                                    type="text"
                                                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm"
                                                    placeholder="Specify condition"
                                                    value={historyForm.familyHistory[field.key]?.others ?? ''}
                                                    onChange={(e) =>
                                                        updateHistoryFamilyHistory(
                                                            field.key,
                                                            'others',
                                                            e.target.value || null,
                                                        )
                                                    }
                                                />
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <Label className="text-base font-semibold">Surgical History</Label>
                                <div className="mt-2 grid grid-cols-2 gap-4">
                                    {SURGICAL_HISTORY_FIELDS.map((field) => (
                                        <div key={field.key} className="space-y-2">
                                            <Label className="text-sm">{field.label}</Label>
                                            <div className="flex gap-4">
                                                {['yes', 'no', 'others'].map((option) => (
                                                    <label
                                                        key={option}
                                                        className="flex items-center gap-2 text-sm"
                                                    >
                                                        <input
                                                            type="radio"
                                                            name={`surgical-${field.key}`}
                                                            value={option}
                                                            checked={
                                                                historyForm.surgicalHistory[field.key]?.status === option
                                                            }
                                                            onChange={() =>
                                                                updateHistorySurgicalHistory(
                                                                    field.key,
                                                                    'status',
                                                                    option,
                                                                )
                                                            }
                                                        />
                                                        <span className="capitalize">{option}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-3">
                                <Label htmlFor="social-history">Social History</Label>
                                <Textarea
                                    id="social-history"
                                    value={historyForm.socialHistory}
                                    onChange={(e) =>
                                        setHistoryForm((prev) => ({ ...prev, socialHistory: e.target.value }))
                                    }
                                    placeholder="Enter social history notes..."
                                    rows={4}
                                />
                            </div>
                        </div>

                        <SheetFooter>
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={() => {
                                    setHistoryFormOpen(false);
                                    setHistoryEditId(null);
                                }}
                                disabled={historyProcessing}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={historyProcessing}>
                                {historyProcessing ? 'Saving...' : 'Save history'}
                            </Button>
                        </SheetFooter>
                    </form>
                </SheetContent>
            </Sheet>

            {/* Present Pregnancy Sheet */}
            <Sheet
                open={presentPregFormOpen}
                onOpenChange={(open) => {
                    if (!open) {
                        setPresentPregFormOpen(false);
                        setPresentPregEditId(null);
                    }
                }}
            >
                <SheetContent className="w-full overflow-y-auto sm:max-w-2xl">
                    <SheetHeader>
                        <SheetTitle>
                            {presentPregEditId ? 'Edit' : 'New'} present pregnancy record
                        </SheetTitle>
                        <SheetDescription>
                            Record antenatal visit details for this patient.
                        </SheetDescription>
                    </SheetHeader>

                    <form onSubmit={submitPresentPregnancy}>
                        <div className="space-y-4 px-4 pb-4">
                            {presentPregError && (
                                <p className="rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700">
                                    {presentPregError}
                                </p>
                            )}

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="pp-date">Date</Label>
                                    <Input
                                        id="pp-date"
                                        type="date"
                                        value={presentPregForm.date}
                                        onChange={(e) => updatePresentPregField('date', e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="pp-bp">BP</Label>
                                    <Input
                                        id="pp-bp"
                                        type="text"
                                        placeholder="e.g. 120/80"
                                        value={presentPregForm.bp}
                                        onChange={(e) => updatePresentPregField('bp', e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="pp-ga">G/A (weeks)</Label>
                                    <Input
                                        id="pp-ga"
                                        type="text"
                                        placeholder="e.g. 28"
                                        value={presentPregForm.gA}
                                        onChange={(e) => updatePresentPregField('gA', e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="pp-weight">Weight (kg)</Label>
                                    <Input
                                        id="pp-weight"
                                        type="number"
                                        step="0.01"
                                        placeholder="e.g. 65.5"
                                        value={presentPregForm.weight}
                                        onChange={(e) => updatePresentPregField('weight', e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="pp-lmp">LMP</Label>
                                    <Input
                                        id="pp-lmp"
                                        type="date"
                                        value={presentPregForm.lmp}
                                        onChange={(e) => updatePresentPregField('lmp', e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="pp-edd">EDD</Label>
                                    <Input
                                        id="pp-edd"
                                        type="date"
                                        value={presentPregForm.edd}
                                        onChange={(e) => updatePresentPregField('edd', e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="pp-sfh">SFH (cm)</Label>
                                    <Input
                                        id="pp-sfh"
                                        type="number"
                                        step="0.1"
                                        placeholder="e.g. 30.5"
                                        value={presentPregForm.sfh}
                                        onChange={(e) => updatePresentPregField('sfh', e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="pp-lie">Lie</Label>
                                    <Select
                                        value={presentPregForm.lie}
                                        onValueChange={(value) => updatePresentPregField('lie', value)}
                                    >
                                        <SelectTrigger id="pp-lie">
                                            <SelectValue placeholder="Select lie" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {LIE_OPTIONS.map((option) => (
                                                <SelectItem key={option} value={option}>
                                                    {option}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="pp-position">Position</Label>
                                    <Select
                                        value={presentPregForm.position}
                                        onValueChange={(value) => updatePresentPregField('position', value)}
                                    >
                                        <SelectTrigger id="pp-position">
                                            <SelectValue placeholder="Select position" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {POSITION_OPTIONS.map((option) => (
                                                <SelectItem key={option} value={option}>
                                                    {option}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="pp-fhr">FHR (bpm)</Label>
                                    <Input
                                        id="pp-fhr"
                                        type="number"
                                        placeholder="e.g. 140"
                                        value={presentPregForm.fhr}
                                        onChange={(e) => updatePresentPregField('fhr', e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="pp-hb">HB (g/dl)</Label>
                                    <Input
                                        id="pp-hb"
                                        type="number"
                                        step="0.1"
                                        placeholder="e.g. 12.5"
                                        value={presentPregForm.hb}
                                        onChange={(e) => updatePresentPregField('hb', e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="pp-oedema">Oedema</Label>
                                    <Select
                                        value={presentPregForm.oedema}
                                        onValueChange={(value) => updatePresentPregField('oedema', value)}
                                    >
                                        <SelectTrigger id="pp-oedema">
                                            <SelectValue placeholder="Select" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="yes">Present</SelectItem>
                                            <SelectItem value="no">Absent</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>

                        <SheetFooter>
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={() => {
                                    setPresentPregFormOpen(false);
                                    setPresentPregEditId(null);
                                }}
                                disabled={presentPregProcessing}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={presentPregProcessing}>
                                {presentPregProcessing ? 'Saving...' : 'Save record'}
                            </Button>
                        </SheetFooter>
                    </form>
                </SheetContent>
            </Sheet>

            {/* Previous Pregnancy Sheet */}
            <Sheet
                open={previousPregFormOpen}
                onOpenChange={(open) => {
                    if (!open) {
                        setPreviousPregFormOpen(false);
                        setPreviousPregEditId(null);
                    }
                }}
            >
                <SheetContent className="w-full overflow-y-auto sm:max-w-2xl">
                    <SheetHeader>
                        <SheetTitle>
                            {previousPregEditId ? 'Edit' : 'New'} previous pregnancy record
                        </SheetTitle>
                        <SheetDescription>
                            Record past pregnancy history for this patient.
                        </SheetDescription>
                    </SheetHeader>

                    <form onSubmit={submitPreviousPregnancy}>
                        <div className="space-y-4 px-4 pb-4">
                            {previousPregError && (
                                <p className="rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700">
                                    {previousPregError}
                                </p>
                            )}

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="vp-year">Year</Label>
                                    <Input
                                        id="vp-year"
                                        type="number"
                                        placeholder="e.g. 2020"
                                        value={previousPregForm.year}
                                        onChange={(e) => updatePreviousPregField('year', e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="vp-ga">GA</Label>
                                    <Input
                                        id="vp-ga"
                                        type="text"
                                        placeholder="e.g. 40 weeks"
                                        value={previousPregForm.ga}
                                        onChange={(e) => updatePreviousPregField('ga', e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="vp-dur-preg">Duration of Pregnancy</Label>
                                    <Input
                                        id="vp-dur-preg"
                                        type="text"
                                        placeholder="e.g. 40 weeks"
                                        value={previousPregForm.durationOfPregnancy}
                                        onChange={(e) => updatePreviousPregField('durationOfPregnancy', e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="vp-dur-labour">Duration of Labour</Label>
                                    <Input
                                        id="vp-dur-labour"
                                        type="text"
                                        placeholder="e.g. 12 hours"
                                        value={previousPregForm.durationOfLabour}
                                        onChange={(e) => updatePreviousPregField('durationOfLabour', e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="vp-abortion">Abortion</Label>
                                    <Select
                                        value={previousPregForm.abortion}
                                        onValueChange={(value) => updatePreviousPregField('abortion', value)}
                                    >
                                        <SelectTrigger id="vp-abortion">
                                            <SelectValue placeholder="Select" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="yes">Yes</SelectItem>
                                            <SelectItem value="no">No</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="vp-iufd">IUFD</Label>
                                    <Select
                                        value={previousPregForm.iufd}
                                        onValueChange={(value) => updatePreviousPregField('iufd', value)}
                                    >
                                        <SelectTrigger id="vp-iufd">
                                            <SelectValue placeholder="Select" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="yes">Yes</SelectItem>
                                            <SelectItem value="no">No</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="vp-aph">APH</Label>
                                    <Select
                                        value={previousPregForm.aph}
                                        onValueChange={(value) => updatePreviousPregField('aph', value)}
                                    >
                                        <SelectTrigger id="vp-aph">
                                            <SelectValue placeholder="Select" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="yes">Yes</SelectItem>
                                            <SelectItem value="no">No</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="vp-pph">PPH</Label>
                                    <Select
                                        value={previousPregForm.pph}
                                        onValueChange={(value) => updatePreviousPregField('pph', value)}
                                    >
                                        <SelectTrigger id="vp-pph">
                                            <SelectValue placeholder="Select" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="yes">Yes</SelectItem>
                                            <SelectItem value="no">No</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="vp-sex">Sex</Label>
                                    <Select
                                        value={previousPregForm.sex}
                                        onValueChange={(value) => updatePreviousPregField('sex', value)}
                                    >
                                        <SelectTrigger id="vp-sex">
                                            <SelectValue placeholder="Select" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="male">Male</SelectItem>
                                            <SelectItem value="female">Female</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="vp-weight">Weight (kg)</Label>
                                    <Input
                                        id="vp-weight"
                                        type="number"
                                        step="0.01"
                                        placeholder="e.g. 3.2"
                                        value={previousPregForm.weight}
                                        onChange={(e) => updatePreviousPregField('weight', e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="vp-delivery">Mode of Delivery</Label>
                                    <Input
                                        id="vp-delivery"
                                        type="text"
                                        placeholder="e.g. Normal"
                                        value={previousPregForm.modeOfDelivery}
                                        onChange={(e) => updatePreviousPregField('modeOfDelivery', e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="vp-age-life">Age (Life)</Label>
                                    <Input
                                        id="vp-age-life"
                                        type="text"
                                        placeholder="e.g. 5 years"
                                        value={previousPregForm.ageLife}
                                        onChange={(e) => updatePreviousPregField('ageLife', e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="vp-age-death">Age (Death)</Label>
                                    <Input
                                        id="vp-age-death"
                                        type="text"
                                        placeholder="e.g. 2 years"
                                        value={previousPregForm.ageDeath}
                                        onChange={(e) => updatePreviousPregField('ageDeath', e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>

                        <SheetFooter>
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={() => {
                                    setPreviousPregFormOpen(false);
                                    setPreviousPregEditId(null);
                                }}
                                disabled={previousPregProcessing}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={previousPregProcessing}>
                                {previousPregProcessing ? 'Saving...' : 'Save record'}
                            </Button>
                        </SheetFooter>
                    </form>
                </SheetContent>
            </Sheet>

            {/* Transfer Patient Dialog */}
            <Dialog open={transferOpen} onOpenChange={setTransferOpen}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Transfer patient</DialogTitle>
                        <DialogDescription>
                            Transfer {nursing.patientId} to another{' '}
                            {transferForm.transferTo}.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="nursing-transfer-to-type">
                                Transfer to
                            </Label>
                            <SelectNative
                                id="nursing-transfer-to-type"
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
                                <Label htmlFor="nursing-transfer-doctor">
                                    To doctor
                                </Label>
                                <SelectNative
                                    id="nursing-transfer-doctor"
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
                                <Label htmlFor="nursing-transfer-nurse">
                                    To nurse
                                </Label>
                                <SelectNative
                                    id="nursing-transfer-nurse"
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
                <Button size="sm" variant="secondary" disabled={isDisabledForEdit(type, record.status)} onClick={onEdit}>
                    Edit
                </Button>
                <Button size="sm" variant="outline" disabled={isDisabledForDelete(type, record.status)} onClick={onDelete}>
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
