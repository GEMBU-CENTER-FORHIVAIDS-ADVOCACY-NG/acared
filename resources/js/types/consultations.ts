export type ConsultationStatus =
    | 'scheduled'
    | 'started'
    | 'completed'
    | 'cancelled';

export type ConsultationRecordType =
    | 'vital-signs'
    | 'complaints'
    | 'examinations'
    | 'diagnoses'
    | 'admissions'
    | 'treatments'
    | 'laboratories'
    | 'prescriptions';

export type ConsultationSection = 'overview' | ConsultationRecordType;

export type ConsultationItem = {
    id: number;
    patientId: string;
    patientName: string | null;
    doctorId: number | null;
    doctorName: string | null;
    purpose: string | null;
    status: string;
    startsAt: string | null;
    endsAt: string | null;
    statusColor: string;
};

export type ConsultationDetail = {
    birthDate: string | null;
    gender: string | null;
    age: string | null;
    startsAt: string | null;
    endsAt: string | null;
    doctorName: string | null;
    purpose: string | null;
    status: string;
};

export type ConsultationLine = {
    id: number;
    price_list_id: number;
    quantity: number | string;
    unitPrice: number | string;
    results: string | null;
    frequency: string | null;
    duration: string | null;
    dosage: string | null;
    priceList?: {
        id: number;
        name: string;
        uom?: string | null;
        price?: number | string | null;
    } | null;
};

export type ConsultationRecord = {
    id: number;
    patient_id: string;
    appointment_id: number | null;
    ward_id?: number | null;
    bed_id?: number | null;
    duration?: number | null;
    notes?: string | Record<string, unknown>[] | null;
    notes_en?: string | null;
    notes_ha?: string | null;
    notes_ff?: string | null;
    status?: string;
    total?: number | string;
    recordedAt: string | null;
    recordedByName: string | null;
    lines?: ConsultationLine[];
    doctor?: { id: number; name: string } | null;
    user?: { id: number; name: string } | null;
    ward?: { id: number; name: string } | null;
    bed?: { id: number; name: string } | null;
};

export type ConsultationRecords = Record<
    ConsultationRecordType,
    ConsultationRecord[]
>;

export type ConsultationSelectOption = {
    id: number;
    name: string;
    price?: number | string | null;
    uom?: string | null;
    ward_id?: number | null;
};

export type ConsultationRecordOptions = {
    wards: ConsultationSelectOption[];
    beds: ConsultationSelectOption[];
    vitalPriceLists: ConsultationSelectOption[];
    laboratoryTests: ConsultationSelectOption[];
    drugs: ConsultationSelectOption[];
    services: ConsultationSelectOption[];
    users: { id: number; name: string }[];
};

export type ConsultationEvent = {
    id: number;
    title: string;
    start: string | null;
    end: string | null;
    color: string;
    url: string;
    meta: string;
};

export type ConsultationCalendarDay = {
    date: string;
    day: number;
    inMonth: boolean;
    isToday: boolean;
    hasAppointments: boolean;
};

export type ConsultationTimeSlot = {
    label: string;
    status: 'available' | 'booked' | 'past';
};

export type ConsultationSidebar = {
    monthLabel: string;
    weekdays: string[];
    days: ConsultationCalendarDay[];
    timeSlots: ConsultationTimeSlot[];
    availableCount: number;
    monthStats: { scheduled: number; started: number; completed: number };
    upcoming: { id: number; name: string; meta: string; status: string }[];
};

export type ConsultationFilters = {
    status: string;
    doctor_id: number | null;
};

export type ConsultationStatusOption = {
    value: string;
    label: string;
};

/**
 * Structured examination body part notes.
 */
export type ExaminationNotes = {
    Hair: string;
    Ear: string;
    Eye: string;
    Nose: string;
    Mouth: string;
    Neck: string;
    Breast: string;
    Abdomen: string;
    Leg: string;
};

export type ConsultationFormValues = {
    lines: {
        price_list_id: string;
        unitPrice: string;
        quantity: string;
        results: string;
        frequency: string;
        duration: string;
        dosage: string;
    }[];
    total: string;
    status: string;
    notes: string;
    notes_en: string;
    notes_ha: string;
    notes_ff: string;
    ward_id: string;
    duration: string;
    bed_id: string;
    examinationNotes?: ExaminationNotes;
};
