import { Head, Link, router, usePage } from '@inertiajs/react';
import { ChevronLeft, ChevronRight, Plus, Search, X } from 'lucide-react';
import {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
    type KeyboardEvent,
} from 'react';
import BillingController from '@/actions/App/Http/Controllers/BillingController';
import AlertError from '@/components/alert-error';
import ConsultationDayTimeline from '@/components/consultation-day-timeline';
import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SelectNative } from '@/components/ui/select-native';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import { home } from '@/routes';
import { view as consultantWardRoundView } from '@/routes/consultant/ward-rounds';
import { index } from '@/routes/consultations';
import type {
    ConsultationDailyTimelineEvent,
    ConsultationFilters,
    ConsultationSidebar,
    ConsultationStatusOption,
    DoctorOption,
} from '@/types';
import type { BillingPatientOption, NewBillingOptions } from '@/types/finance';

type ServiceLineRow = {
    price_list_id: string;
    unitPrice: string;
};

const ADMITTED_PATIENTS_PER_PAGE = 5;

type Props = {
    filters: ConsultationFilters;
    statusOptions: ConsultationStatusOption[];
    doctorOptions: DoctorOption[];
    dailyTimeline: ConsultationDailyTimelineEvent[];
    sidebar: ConsultationSidebar;
    newBillingOptions: NewBillingOptions;
};

export default function ConsultationsIndex({
    filters,
    statusOptions,
    doctorOptions,
    dailyTimeline,
    sidebar,
    newBillingOptions,
}: Props) {
    const { currentTeam } = usePage().props;
    const currencySymbolProps = usePage().props.currencySymbol;
    const currencySymbol =
        typeof currencySymbolProps === 'string' ? currencySymbolProps : '₦';
    const teamSlug = currentTeam?.slug;
    const [search, setSearch] = useState(filters.q);
    const [admittedPatientSearch, setAdmittedPatientSearch] = useState('');
    const [admittedPatientsPage, setAdmittedPatientsPage] = useState(1);

    const admittedPatientQuery = admittedPatientSearch.trim().toLowerCase();
    const filteredAdmittedPatients = sidebar.admittedPatients.filter((item) =>
        [item.name, item.meta, item.wardBed].some((value) =>
            value.toLowerCase().includes(admittedPatientQuery),
        ),
    );
    const admittedPatientsLastPage = Math.max(
        1,
        Math.ceil(filteredAdmittedPatients.length / ADMITTED_PATIENTS_PER_PAGE),
    );
    const currentAdmittedPatientsPage = Math.min(
        admittedPatientsPage,
        admittedPatientsLastPage,
    );
    const paginatedAdmittedPatients = filteredAdmittedPatients.slice(
        (currentAdmittedPatientsPage - 1) * ADMITTED_PATIENTS_PER_PAGE,
        currentAdmittedPatientsPage * ADMITTED_PATIENTS_PER_PAGE,
    );

    function visit(next: Partial<ConsultationFilters> = {}) {
        const merged = { ...filters, ...next };

        router.get(
            index.url(teamSlug, {
                query: {
                    q: merged.q || undefined,
                    status: merged.status || undefined,
                    doctor_id: merged.doctor_id ?? undefined,
                    date: merged.date || undefined,
                },
            }),
            {},
            { preserveState: true, preserveScroll: true, replace: true },
        );
    }

    function applySearch() {
        visit({ q: search });
    }

    function applyFilters(next: Partial<ConsultationFilters>) {
        visit(next);
    }

    // New Billing state
    const [billingOpen, setBillingOpen] = useState(false);
    const [billingLines, setBillingLines] = useState<ServiceLineRow[]>([
        { price_list_id: '', unitPrice: '' },
    ]);
    const [billingProcessing, setBillingProcessing] = useState(false);
    const [billingError, setBillingError] = useState<string | null>(null);
    const [billingPatientSearchQuery, setBillingPatientSearchQuery] =
        useState('');
    const [billingPatientSearchResults, setBillingPatientSearchResults] =
        useState<BillingPatientOption[]>([]);
    const [billingPatientSearchOpen, setBillingPatientSearchOpen] =
        useState(false);
    const [
        billingPatientSearchActiveIndex,
        setBillingPatientSearchActiveIndex,
    ] = useState(0);
    const [billingPatientSearchLoading, setBillingPatientSearchLoading] =
        useState(false);
    const [billingExistingPatientId, setBillingExistingPatientId] =
        useState('');
    const [billingSelectedPatientLabel, setBillingSelectedPatientLabel] =
        useState('');
    const billingPatientSearchInputRef = useRef<HTMLInputElement>(null);
    const billingPatientSearchContainerRef = useRef<HTMLDivElement>(null);
    const billingDebounceTimerRef = useRef<ReturnType<
        typeof setTimeout
    > | null>(null);

    const billingTotal = useMemo(
        () =>
            billingLines.reduce(
                (sum, line) => sum + (Number(line.unitPrice) || 0),
                0,
            ),
        [billingLines],
    );

    // Debounced search for patients
    const searchBillingPatients = useCallback(
        (query: string) => {
            if (billingDebounceTimerRef.current) {
                clearTimeout(billingDebounceTimerRef.current);
            }

            if (!query.trim()) {
                setBillingPatientSearchResults([]);
                setBillingPatientSearchActiveIndex(0);
                return;
            }

            setBillingPatientSearchLoading(true);
            billingDebounceTimerRef.current = setTimeout(() => {
                const url = BillingController.searchPatients.url(teamSlug, {
                    query: { q: query },
                });
                fetch(url, {
                    headers: {
                        'X-Requested-With': 'XMLHttpRequest',
                    },
                })
                    .then((res) => res.json())
                    .then((results) => {
                        setBillingPatientSearchResults(results);
                        setBillingPatientSearchActiveIndex(0);
                        setBillingPatientSearchLoading(false);
                    })
                    .catch(() => {
                        setBillingPatientSearchLoading(false);
                    });
            }, 300);
        },
        [teamSlug],
    );

    // Close billing patient dropdown on outside click
    useEffect(() => {
        if (!billingPatientSearchOpen) {
            return;
        }

        const handleClick = (event: MouseEvent) => {
            if (
                billingPatientSearchContainerRef.current &&
                !billingPatientSearchContainerRef.current.contains(
                    event.target as Node,
                )
            ) {
                setBillingPatientSearchOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, [billingPatientSearchOpen]);

    // Cleanup billing debounce timer
    useEffect(() => {
        return () => {
            if (billingDebounceTimerRef.current) {
                clearTimeout(billingDebounceTimerRef.current);
            }
        };
    }, []);

    function openBilling() {
        setBillingExistingPatientId('');
        setBillingSelectedPatientLabel('');
        setBillingPatientSearchQuery('');
        setBillingPatientSearchResults([]);
        setBillingPatientSearchActiveIndex(0);
        setBillingPatientSearchOpen(false);
        setBillingLines([{ price_list_id: '', unitPrice: '' }]);
        setBillingError(null);
        setBillingOpen(true);
    }

    function chooseBillingService(index: number, value: string) {
        const service = newBillingOptions.services.find(
            (item) => String(item.id) === value,
        );

        setBillingLines((current) =>
            current.map((row, rowIndex) =>
                rowIndex === index
                    ? {
                          ...row,
                          price_list_id: value,
                          unitPrice: service ? String(service.price) : '',
                      }
                    : row,
            ),
        );
    }

    function selectBillingPatient(option: BillingPatientOption) {
        setBillingExistingPatientId(option.slug);
        setBillingSelectedPatientLabel(option.label);
        setBillingPatientSearchQuery('');
        setBillingPatientSearchResults([]);
        setBillingPatientSearchActiveIndex(0);
        setBillingPatientSearchOpen(false);
    }

    function handleBillingPatientKeyDown(
        event: KeyboardEvent<HTMLInputElement>,
    ) {
        if (billingExistingPatientId) {
            return;
        }

        if (event.key === 'ArrowDown') {
            event.preventDefault();
            setBillingPatientSearchOpen(true);
            setBillingPatientSearchActiveIndex((current) =>
                Math.min(
                    current + 1,
                    Math.max(billingPatientSearchResults.length - 1, 0),
                ),
            );
        } else if (event.key === 'ArrowUp') {
            event.preventDefault();
            setBillingPatientSearchActiveIndex((current) =>
                Math.max(current - 1, 0),
            );
        } else if (event.key === 'Enter') {
            const option =
                billingPatientSearchResults[billingPatientSearchActiveIndex];
            if (billingPatientSearchOpen && option) {
                event.preventDefault();
                selectBillingPatient(option);
            }
        } else if (event.key === 'Escape') {
            setBillingPatientSearchOpen(false);
        }
    }

    function submitBilling() {
        if (!billingExistingPatientId) {
            setBillingError('Please select an existing patient.');
            return;
        }

        const linePayload = billingLines
            .filter((line) => line.price_list_id !== '')
            .map((line) => ({
                price_list_id: Number(line.price_list_id),
                unitPrice: Number(line.unitPrice) || 0,
            }));

        if (linePayload.length === 0) {
            setBillingError('Add at least one service.');
            return;
        }

        setBillingProcessing(true);
        setBillingError(null);

        const payload = {
            source: 'new_billing',
            existing_patient_id: billingExistingPatientId,
            billings: [{ lines: linePayload, total: billingTotal }],
        };

        router.post(BillingController.newBilling.url(teamSlug), payload, {
            preserveScroll: true,
            onError: (errors: Record<string, string>) =>
                setBillingError(
                    Object.values(errors)[0] ?? 'Something went wrong.',
                ),
            onSuccess: () => setBillingOpen(false),
            onFinish: () => setBillingProcessing(false),
        });
    }

    const statCards = [
        { title: 'Scheduled', value: sidebar.monthStats.scheduled },
        { title: 'Started', value: sidebar.monthStats.started },
        { title: 'Completed', value: sidebar.monthStats.completed },
        { title: 'Open slots today', value: sidebar.availableCount },
    ];

    return (
        <>
            <Head title="Consultations" />

            <div className="flex w-full flex-col space-y-6 p-4 md:p-6 lg:p-8">
                <div className="flex flex-wrap items-center justify-between gap-2">
                    <Heading
                        variant="small"
                        title="Consultations"
                        description="Track appointments and clinical records."
                    />
                    <div className="flex items-center gap-2">
                        <Button
                            size="sm"
                            variant="default"
                            onClick={openBilling}
                        >
                            New Billing
                        </Button>
                        <SelectNative
                            value={filters.status}
                            onChange={(event) =>
                                applyFilters({ status: event.target.value })
                            }
                            className="w-40"
                            data-test="status-filter"
                        >
                            <option value="">All statuses</option>
                            {statusOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </SelectNative>
                        <SelectNative
                            value={filters.doctor_id ?? ''}
                            onChange={(event) =>
                                applyFilters({
                                    doctor_id: event.target.value
                                        ? Number(event.target.value)
                                        : null,
                                })
                            }
                            className="w-44"
                            data-test="doctor-filter"
                        >
                            <option value="">All doctors</option>
                            {doctorOptions.map((doctor) => (
                                <option key={doctor.id} value={doctor.id}>
                                    {doctor.name}
                                </option>
                            ))}
                        </SelectNative>
                    </div>
                </div>

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
                                    {sidebar.monthLabel}
                                </p>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <div className="grid gap-6 lg:grid-cols-4">
                    <Card className="min-w-0 lg:col-span-3">
                        <CardHeader>
                            <CardTitle>
                                {sidebar.calendarLabel}'s schedule
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ConsultationDayTimeline
                                events={dailyTimeline}
                                board
                            />
                        </CardContent>
                    </Card>

                    <div className="grid content-start gap-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>{sidebar.calendarLabel}</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <form
                                    className="flex items-center gap-2"
                                    onSubmit={(event) => {
                                        event.preventDefault();
                                        applySearch();
                                    }}
                                >
                                    <div className="relative flex-1">
                                        <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                        <Input
                                            className="pl-10"
                                            value={search}
                                            placeholder="Search visits..."
                                            onChange={(event) =>
                                                setSearch(event.target.value)
                                            }
                                        />
                                    </div>
                                    <Button
                                        type="submit"
                                        size="sm"
                                        className="shrink-0"
                                        variant="default"
                                        aria-label="Search visits"
                                    >
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
                                        <button
                                            key={day.date}
                                            type="button"
                                            disabled={!day.inMonth}
                                            aria-label={`${day.date}${day.isToday ? ' (today)' : ''}${day.hasAppointments ? ', has appointments' : ''}`}
                                            aria-pressed={
                                                sidebar.selectedDate ===
                                                day.date
                                            }
                                            onClick={() =>
                                                applyFilters({ date: day.date })
                                            }
                                            className={`flex h-8 items-center justify-center rounded-md ${
                                                day.isToday
                                                    ? 'bg-primary text-primary-foreground'
                                                    : day.hasAppointments
                                                      ? 'bg-muted font-medium'
                                                      : ''
                                            } ${day.inMonth ? 'cursor-pointer hover:bg-accent' : 'cursor-default opacity-40'} ${sidebar.selectedDate === day.date ? 'ring-2 ring-primary ring-offset-1' : ''}`}
                                        >
                                            {day.day}
                                        </button>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Patients on admission</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="relative">
                                    <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        aria-label="Search admitted patients"
                                        className="pl-9"
                                        value={admittedPatientSearch}
                                        placeholder="Search admitted patients..."
                                        onChange={(event) => {
                                            setAdmittedPatientSearch(
                                                event.target.value,
                                            );
                                            setAdmittedPatientsPage(1);
                                        }}
                                    />
                                </div>
                                <ul className="space-y-2">
                                    {filteredAdmittedPatients.length === 0 ? (
                                        <li className="text-sm text-muted-foreground">
                                            {admittedPatientQuery
                                                ? 'No admitted patients match your search.'
                                                : 'No patients currently on admission.'}
                                        </li>
                                    ) : (
                                        paginatedAdmittedPatients.map(
                                            (item) => (
                                                <li
                                                    key={item.id}
                                                    className="min-w-0"
                                                >
                                                    <Link
                                                        href={consultantWardRoundView.url(
                                                            {
                                                                current_team:
                                                                    teamSlug,
                                                                admission:
                                                                    item.id,
                                                            },
                                                        )}
                                                        className="block text-sm leading-snug font-medium break-words hover:underline"
                                                    >
                                                        {item.name}
                                                    </Link>
                                                    <div className="mt-1 flex flex-wrap items-center gap-1.5">
                                                        <span className="text-xs break-words text-muted-foreground">
                                                            {item.meta}
                                                        </span>
                                                        <Badge className="bg-sky-100 text-sky-800 dark:bg-sky-500/15 dark:text-sky-300">
                                                            {item.wardBed}
                                                        </Badge>
                                                    </div>
                                                </li>
                                            ),
                                        )
                                    )}
                                </ul>
                                {filteredAdmittedPatients.length > 0 && (
                                    <div className="flex items-center justify-between gap-2 pt-1">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            disabled={
                                                currentAdmittedPatientsPage <= 1
                                            }
                                            onClick={() =>
                                                setAdmittedPatientsPage(
                                                    currentAdmittedPatientsPage -
                                                        1,
                                                )
                                            }
                                        >
                                            <ChevronLeft className="size-4" />
                                            Previous
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            disabled={
                                                currentAdmittedPatientsPage >=
                                                admittedPatientsLastPage
                                            }
                                            onClick={() =>
                                                setAdmittedPatientsPage(
                                                    currentAdmittedPatientsPage +
                                                        1,
                                                )
                                            }
                                        >
                                            Next
                                            <ChevronRight className="size-4" />
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* New Billing Sheet */}
                <Sheet
                    open={billingOpen}
                    onOpenChange={(open) => {
                        if (!billingProcessing) {
                            setBillingOpen(open);
                        }
                    }}
                >
                    <SheetContent className="w-full overflow-y-auto sm:max-w-2xl">
                        <SheetHeader>
                            <SheetTitle>New Billing</SheetTitle>
                            <SheetDescription>
                                Raise invoices for a patient and add services.
                            </SheetDescription>
                        </SheetHeader>

                        <div className="space-y-4 px-4 pb-6">
                            {/* Patient Search */}
                            <div
                                className="space-y-2"
                                ref={billingPatientSearchContainerRef}
                            >
                                <Label htmlFor="billing-existing-patient">
                                    Existing patient
                                </Label>
                                <div className="relative">
                                    <Input
                                        id="billing-existing-patient"
                                        data-test="new-billing-patient"
                                        ref={billingPatientSearchInputRef}
                                        placeholder="Search patient by name, code, or phone…"
                                        role="combobox"
                                        aria-autocomplete="list"
                                        aria-expanded={
                                            billingPatientSearchOpen &&
                                            !billingExistingPatientId
                                        }
                                        aria-controls="billing-patient-listbox"
                                        aria-activedescendant={
                                            billingPatientSearchOpen &&
                                            billingPatientSearchResults.length >
                                                0
                                                ? `billing-patient-option-${billingPatientSearchActiveIndex}`
                                                : undefined
                                        }
                                        value={
                                            billingExistingPatientId
                                                ? billingSelectedPatientLabel
                                                : billingPatientSearchQuery
                                        }
                                        readOnly={!!billingExistingPatientId}
                                        onKeyDown={handleBillingPatientKeyDown}
                                        onClick={() => {
                                            if (!billingExistingPatientId) {
                                                setBillingPatientSearchOpen(
                                                    true,
                                                );
                                            }
                                        }}
                                        onChange={(event) => {
                                            const value = event.target.value;
                                            setBillingExistingPatientId('');
                                            setBillingSelectedPatientLabel('');
                                            setBillingPatientSearchQuery(value);
                                            searchBillingPatients(value);
                                            setBillingPatientSearchOpen(true);
                                        }}
                                    />
                                    {billingPatientSearchOpen &&
                                        !billingExistingPatientId && (
                                            <div
                                                id="billing-patient-listbox"
                                                role="listbox"
                                                className="absolute right-0 left-0 z-50 mt-1 max-h-60 overflow-auto rounded-md border bg-popover shadow-lg"
                                            >
                                                {billingPatientSearchLoading && (
                                                    <div className="px-3 py-2 text-xs text-muted-foreground">
                                                        Searching…
                                                    </div>
                                                )}
                                                {!billingPatientSearchLoading &&
                                                    billingPatientSearchResults.length ===
                                                        0 &&
                                                    billingPatientSearchQuery.trim() && (
                                                        <div className="px-3 py-2 text-xs text-muted-foreground">
                                                            No patients found
                                                        </div>
                                                    )}
                                                {billingPatientSearchResults.map(
                                                    (option, index) => (
                                                        <button
                                                            key={option.slug}
                                                            id={`billing-patient-option-${index}`}
                                                            type="button"
                                                            role="option"
                                                            aria-selected={
                                                                billingPatientSearchActiveIndex ===
                                                                index
                                                            }
                                                            className={`w-full px-3 py-2 text-left text-sm hover:bg-accent ${billingPatientSearchActiveIndex === index ? 'bg-accent' : ''}`}
                                                            onClick={() =>
                                                                selectBillingPatient(
                                                                    option,
                                                                )
                                                            }
                                                        >
                                                            {option.label}
                                                        </button>
                                                    ),
                                                )}
                                            </div>
                                        )}
                                </div>
                            </div>

                            {/* Services Table */}
                            <div className="space-y-3">
                                <Label>Services</Label>

                                {billingLines.length > 0 ? (
                                    <div className="rounded-lg border">
                                        <table className="w-full text-sm">
                                            <thead className="bg-muted/50">
                                                <tr>
                                                    <th
                                                        className="px-4 py-2 text-left font-medium"
                                                        style={{ width: '70%' }}
                                                    >
                                                        Service
                                                    </th>
                                                    <th
                                                        className="px-4 py-2 text-left font-medium"
                                                        style={{ width: '25%' }}
                                                    >
                                                        Price
                                                    </th>
                                                    <th
                                                        className="px-4 py-2 text-center font-medium"
                                                        style={{ width: '5%' }}
                                                    ></th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y">
                                                {billingLines.map(
                                                    (line, index) => (
                                                        <tr key={index}>
                                                            <td className="px-4 py-2">
                                                                <SelectNative
                                                                    value={
                                                                        line.price_list_id
                                                                    }
                                                                    placeholder="Select service…"
                                                                    onChange={(
                                                                        event,
                                                                    ) =>
                                                                        chooseBillingService(
                                                                            index,
                                                                            event
                                                                                .target
                                                                                .value,
                                                                        )
                                                                    }
                                                                >
                                                                    <option value="">
                                                                        Select
                                                                        service…
                                                                    </option>
                                                                    {newBillingOptions.services.map(
                                                                        (
                                                                            service,
                                                                        ) => (
                                                                            <option
                                                                                key={
                                                                                    service.id
                                                                                }
                                                                                value={String(
                                                                                    service.id,
                                                                                )}
                                                                            >
                                                                                {
                                                                                    service.name
                                                                                }
                                                                            </option>
                                                                        ),
                                                                    )}
                                                                </SelectNative>
                                                            </td>
                                                            <td className="px-4 py-2">
                                                                <Input
                                                                    aria-label={`Price for service ${index + 1}`}
                                                                    value={
                                                                        line.unitPrice
                                                                    }
                                                                    readOnly
                                                                />
                                                            </td>
                                                            <td className="px-4 py-2 text-center">
                                                                {billingLines.length >
                                                                1 ? (
                                                                    <button
                                                                        type="button"
                                                                        aria-label={`Remove service ${index + 1}`}
                                                                        disabled={
                                                                            billingProcessing
                                                                        }
                                                                        className="text-muted-foreground hover:text-red-600 disabled:opacity-50 dark:hover:text-red-400"
                                                                        onClick={() =>
                                                                            setBillingLines(
                                                                                (
                                                                                    current,
                                                                                ) =>
                                                                                    current.filter(
                                                                                        (
                                                                                            _,
                                                                                            i,
                                                                                        ) =>
                                                                                            i !==
                                                                                            index,
                                                                                    ),
                                                                            )
                                                                        }
                                                                    >
                                                                        <X className="h-4 w-4" />
                                                                    </button>
                                                                ) : null}
                                                            </td>
                                                        </tr>
                                                    ),
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : null}

                                <div className="flex items-center justify-between rounded-md border px-3 py-2">
                                    <span className="text-sm text-muted-foreground">
                                        Total
                                    </span>
                                    <span className="text-sm font-semibold tabular-nums">
                                        {currencySymbol}{' '}
                                        {billingTotal.toLocaleString()}
                                    </span>
                                </div>

                                <Button
                                    type="button"
                                    size="sm"
                                    variant="secondary"
                                    disabled={billingProcessing}
                                    onClick={() =>
                                        setBillingLines([
                                            ...billingLines,
                                            {
                                                price_list_id: '',
                                                unitPrice: '',
                                            },
                                        ])
                                    }
                                >
                                    <Plus className="mr-1 h-4 w-4" />
                                    Add service
                                </Button>
                            </div>

                            {billingError ? (
                                <AlertError errors={[billingError]} />
                            ) : null}
                        </div>

                        <SheetFooter className="flex-row gap-2">
                            <Button
                                type="button"
                                variant="secondary"
                                className="flex-1"
                                disabled={billingProcessing}
                                onClick={() => setBillingOpen(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="button"
                                className="flex-1"
                                onClick={submitBilling}
                                disabled={billingProcessing}
                                data-test="submit-new-billing"
                            >
                                {billingProcessing
                                    ? 'Saving...'
                                    : 'Create billing'}
                            </Button>
                        </SheetFooter>
                    </SheetContent>
                </Sheet>
            </div>
        </>
    );
}

ConsultationsIndex.layout = (props: {
    currentTeam?: { slug: string } | null;
}) => ({
    breadcrumbs: [
        {
            title: 'Consultations',
            href: props.currentTeam
                ? index.url(props.currentTeam.slug)
                : home.url(),
        },
    ],
});
