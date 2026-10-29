export type NursingDailyTimelineEvent = {
    id: number;
    title: string;
    startsAt: string;
    endsAt: string | null;
    status: string;
    color: string;
    url: string;
};

export type NursingCalendarDay = {
    date: string;
    day: number;
    inMonth: boolean;
    isToday: boolean;
    hasAppointments: boolean;
};

export type NursingTimeSlot = {
    label: string;
    status: 'available' | 'booked' | 'past';
};

export type NursingSidebar = {
    monthLabel: string;
    calendarLabel: string;
    weekdays: string[];
    days: NursingCalendarDay[];
    selectedDate: string;
    timeSlots: NursingTimeSlot[];
    availableCount: number;
    monthStats: { scheduled: number; started: number; completed: number };
    upcoming: { id: number; name: string; meta: string; status: string }[];
};

export type NursingFilters = {
    q: string;
    perPage: number;
    page?: number;
};

export type NursingStatusOption = {
    value: string;
    label: string;
};

