export type ReceptionStats = {
    awaitingBooking: string;
    completedAppointments: string;
    awaitingDoctor: string;
    totalAppointments: string;
};

export type ReceptionAppointment = {
    id: number;
    patientId: string;
    patientName: string | null;
    gender: string | null;
    age: string | null;
    doctorId: number | null;
    doctorName: string | null;
    nurseId: number | null;
    nurseName: string | null;
    purpose: string | null;
    status: string;
    startsAt: string | null;
    endsAt: string | null;
    color: string;
    state: 'active' | 'past' | 'future';
};

export type ReceptionFilters = {
    dateFilter: string;
    dateFilterLabel: string;
};

export type ReceptionOption = {
    value: string;
    label: string;
};

export type BillingOption = {
    id: number;
    label: string;
    category: string | null;
};

export type DoctorOption = {
    id: number;
    name: string;
};

export type NurseOption = {
    id: number;
    name: string;
};

export type ScheduleAppointmentValues = {
    billing_id: string;
    doctor_id: string;
    nurse_id: string;
    starts_at: string;
    purpose: string;
};

export type TransferPatientValues = {
    patient_id: string;
    doctor_id: string;
};
