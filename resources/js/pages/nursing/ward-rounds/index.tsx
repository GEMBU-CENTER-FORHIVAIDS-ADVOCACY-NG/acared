import { Head, Link, router, setLayoutProps, usePage } from '@inertiajs/react';
import { ArrowRightLeft, Plus, Search, X } from 'lucide-react';
import {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
    type KeyboardEvent,
} from 'react';
import {
    billing as newBilling,
    transfer as transferPatient,
} from '@/routes/nursing/ward-rounds';
import { search as searchBillingPatientsRoute } from '@/routes/nursing/ward-rounds/billing/patients';
import AlertError from '@/components/alert-error';
import ConfirmDialog from '@/components/confirm-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import {
    admit,
    cancelAdmission,
    index as wardRoundsIndex,
    show,
    view,
} from '@/routes/nursing/ward-rounds';
import { searchAdmission } from '@/actions/App/Http/Controllers/WardRoundController';
import type { BillingPatientOption } from '@/types/finance';

type Bed = {
    id: number;
    name: string;
    status: string;
    admissionId: number | null;
    patientId: string | null;
    patientRecordId: number | null;
    patientName: string | null;
    doctorName: string | null;
    admissionStatus: string | null;
    admittedAt: string | null;
};

type Ward = {
    id: number;
    name: string;
    description: string | null;
    bedsCount: number;
    occupiedBedsCount: number;
    patientsCount: number;
    status: string;
    beds: Bed[];
};

type PendingAdmission = {
    id: number;
    patientId: string;
    patientName: string | null;
    requestedWardId: number;
    requestedWardName: string | null;
    notes: string | null;
};

type WardWithBeds = {
    id: number;
    name: string;
    beds: { id: number; name: string }[];
};

type ServiceLineRow = {
    price_list_id: string;
    unitPrice: string;
};

export default function WardRoundsIndex({
    counts,
    filters,
    wards,
    pendingAdmissions,
    allWards,
    billingOptions,
}: {
    counts: {
        total: number;
        discharged: number;
        admitted: number;
        pending: number;
    };
    filters: { dateFilter: string };
    wards: Ward[];
    pendingAdmissions: PendingAdmission[];
    allWards: WardWithBeds[];
    billingOptions: { services: { id: number; name: string; price: number }[] };
}) {
    const { currentTeam } = usePage().props;
    const teamSlug = currentTeam?.slug ?? '';

    const [selectedWardId, setSelectedWardId] = useState('');
    const [bedId, setBedId] = useState('');
    const [admissionId, setAdmissionId] = useState('');
    const [notes, setNotes] = useState('');
    const [dateFilter, setDateFilter] = useState(filters.dateFilter);
    const [searchQuery, setSearchQuery] = useState('');
    const [searching, setSearching] = useState(false);
    const [confirmCancel, setConfirmCancel] = useState(false);
    const [admissionProcessing, setAdmissionProcessing] = useState(false);
    const [cancelProcessing, setCancelProcessing] = useState(false);
    const [actionError, setActionError] = useState<string | null>(null);

    // New Billing state
    const [billingOpen, setBillingOpen] = useState(false);
    const [billingLines, setBillingLines] = useState<ServiceLineRow[]>([
        { price_list_id: '', unitPrice: '' },
    ]);
    const [billingProcessing, setBillingProcessing] = useState(false);
    const [billingError, setBillingError] = useState<string | null>(null);

    // Transfer state
    const [transferOpen, setTransferOpen] = useState(false);
    const [showTransferConfirm, setShowTransferConfirm] = useState(false);
    const [transferAdmissionId, setTransferAdmissionId] = useState('');
    const [transferWardId, setTransferWardId] = useState('');
    const [transferBedId, setTransferBedId] = useState('');
    const [transferNotes, setTransferNotes] = useState('');
    const [transferProcessing, setTransferProcessing] = useState(false);
    const [transferError, setTransferError] = useState<string | null>(null);
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

    const currencySymbolProps = usePage().props.currencySymbol;
    const currencySymbol =
        typeof currencySymbolProps === 'string' ? currencySymbolProps : '₦';

    // Collect all occupied beds across wards for transfer patient selection
    const occupiedBedsForTransfer = useMemo(() => {
        const beds: {
            admissionId: number;
            patientId: string | null;
            patientName: string | null;
            wardName: string;
            bedName: string;
        }[] = [];
        wards.forEach((ward) => {
            ward.beds.forEach((bed) => {
                if (bed.admissionId != null) {
                    beds.push({
                        admissionId: bed.admissionId,
                        patientId: bed.patientId,
                        patientName: bed.patientName,
                        wardName: ward.name,
                        bedName: bed.name,
                    });
                }
            });
        });
        return beds;
    }, [wards]);

    // Collect all available beds across all wards for transfer target selection
    const availableBedsForTransfer = useMemo(() => {
        const beds: {
            id: number;
            name: string;
            wardId: number;
            wardName: string;
        }[] = [];
        allWards.forEach((w) => {
            w.beds.forEach((bed) => {
                beds.push({
                    id: bed.id,
                    name: bed.name,
                    wardId: w.id,
                    wardName: w.name,
                });
            });
        });
        return beds;
    }, [allWards]);

    const selectedTransferPatient = occupiedBedsForTransfer.find(
        (b) => String(b.admissionId) === transferAdmissionId,
    );

    const filteredAvailableBeds = transferWardId
        ? availableBedsForTransfer.filter(
              (b) => String(b.wardId) === transferWardId,
          )
        : availableBedsForTransfer;

    const canTransfer =
        transferAdmissionId !== '' &&
        transferWardId !== '' &&
        transferBedId !== '';

    const transferTargetLabel = selectedTransferPatient
        ? `${selectedTransferPatient.wardName}, bed ${selectedTransferPatient.bedName}`
        : 'the selected patient';

    function openTransfer() {
        setTransferAdmissionId('');
        setTransferWardId('');
        setTransferBedId('');
        setTransferNotes('');
        setTransferError(null);
        setShowTransferConfirm(false);
        setTransferOpen(true);
    }

    function openTransferConfirm() {
        if (!canTransfer) {
            setTransferError('Select a patient, target ward, and target bed.');
            return;
        }

        setTransferError(null);
        setShowTransferConfirm(true);
    }

    function submitTransfer() {
        if (!canTransfer) return;

        setTransferProcessing(true);
        setTransferError(null);

        router.patch(
            transferPatient.url({
                current_team: teamSlug,
                admission: Number(transferAdmissionId),
            }),
            {
                ward_id: Number(transferWardId),
                bed_id: Number(transferBedId),
                notes: transferNotes || null,
            },
            {
                preserveScroll: true,
                onError: (errors: Record<string, string>) =>
                    setTransferError(
                        Object.values(errors)[0] ?? 'Something went wrong.',
                    ),
                onSuccess: () => {
                    setShowTransferConfirm(false);
                    setTransferOpen(false);
                    setTransferAdmissionId('');
                    setTransferWardId('');
                    setTransferBedId('');
                    setTransferNotes('');
                },
                onFinish: () => setTransferProcessing(false),
            },
        );
    }

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
                const url = searchBillingPatientsRoute.url(teamSlug, {
                    query: { q: query },
                });
                fetch(url, {
                    headers: { 'X-Requested-With': 'XMLHttpRequest' },
                })
                    .then((res) => res.json())
                    .then((results) => {
                        setBillingPatientSearchResults(results);
                        setBillingPatientSearchActiveIndex(0);
                        setBillingPatientSearchLoading(false);
                    })
                    .catch(() => setBillingPatientSearchLoading(false));
            }, 300);
        },
        [teamSlug],
    );

    useEffect(() => {
        if (!billingPatientSearchOpen) return;
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

    useEffect(() => {
        return () => {
            if (billingDebounceTimerRef.current)
                clearTimeout(billingDebounceTimerRef.current);
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
        const service = billingOptions.services.find(
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

        router.post(newBilling.url(teamSlug), payload, {
            preserveScroll: true,
            onError: (errors: Record<string, string>) =>
                setBillingError(
                    Object.values(errors)[0] ?? 'Something went wrong.',
                ),
            onSuccess: () => setBillingOpen(false),
            onFinish: () => setBillingProcessing(false),
        });
    }

    // When a patient is selected, default to the requested ward
    const selectedAdmission = pendingAdmissions.find(
        (a) => String(a.id) === admissionId,
    );
    const defaultWardId = selectedAdmission?.requestedWardId ?? '';

    // Always a string - same pattern as show page
    const currentWardId = selectedWardId || String(defaultWardId);
    const selectedWardData = allWards.find(
        (w) => String(w.id) === currentWardId,
    );
    const bedsAvailable = selectedWardData?.beds ?? [];

    const canAdmit =
        pendingAdmissions.some(
            (admission) => String(admission.id) === admissionId,
        ) &&
        !!currentWardId &&
        bedsAvailable.some((bed) => String(bed.id) === bedId);

    // Reset bed when ward changes
    const handleWardChange = (value: string) => {
        setSelectedWardId(value);
        setBedId('');
    };

    // Reset ward, bed, and notes when admission changes
    const handleAdmissionChange = (value: string) => {
        setAdmissionId(value);
        const admission = pendingAdmissions.find((a) => String(a.id) === value);
        setSelectedWardId(String(admission?.requestedWardId ?? ''));
        setBedId('');
        setNotes(admission?.notes ?? '');
    };

    const submitAdmission = () => {
        if (!canAdmit) return;
        setAdmissionProcessing(true);
        setActionError(null);

        router.post(
            admit.url({ current_team: teamSlug, ward: Number(currentWardId) }),
            {
                admission_id: admissionId,
                ward_id: currentWardId,
                bed_id: bedId,
                notes,
            },
            {
                preserveScroll: true,
                onError: (errors: Record<string, string>) =>
                    setActionError(
                        Object.values(errors)[0] ?? 'Something went wrong.',
                    ),
                onSuccess: () => {
                    setAdmissionId('');
                    setSelectedWardId('');
                    setBedId('');
                    setNotes('');
                },
                onFinish: () => setAdmissionProcessing(false),
            },
        );
    };

    const cancelSelectedAdmission = () => {
        if (!admissionId) return;
        setConfirmCancel(true);
    };

    const confirmCancelAdmission = () => {
        setCancelProcessing(true);
        setActionError(null);

        router.patch(
            cancelAdmission.url({
                current_team: teamSlug,
                admission: Number(admissionId),
            }),
            {},
            {
                preserveScroll: true,
                onError: (errors: Record<string, string>) =>
                    setActionError(
                        Object.values(errors)[0] ?? 'Something went wrong.',
                    ),
                onSuccess: () => {
                    setConfirmCancel(false);
                    setAdmissionId('');
                    setSelectedWardId('');
                    setBedId('');
                    setNotes('');
                },
                onFinish: () => setCancelProcessing(false),
            },
        );
    };

    const cards = [
        {
            title: 'Awaiting admission',
            value: counts.pending,
            description: 'Pending admission requests',
            tone: 'text-rose-600 dark:text-rose-400',
        },
        {
            title: 'Admitted patients',
            value: counts.admitted,
            description: 'Admitted patients',
            tone: 'text-emerald-600 dark:text-emerald-400',
        },
        {
            title: 'Total requests',
            value: counts.total,
            description: 'Total requests',
            tone: 'text-indigo-600 dark:text-indigo-400',
        },
        {
            title: 'Discharged patients',
            value: counts.discharged,
            description: 'Discharged patients',
            tone: 'text-sky-600 dark:text-sky-400',
        },
    ];

    const handleSearch = () => {
        if (!searchQuery.trim()) return;

        const searchUrl = searchAdmission.url(teamSlug, {
            query: { q: searchQuery.trim() },
        });

        setSearching(true);
        fetch(searchUrl, {
            headers: {
                'X-Requested-With': 'XMLHttpRequest',
            },
        })
            .then((res) => res.json())
            .then((result) => {
                setSearching(false);
                if (result && result.id) {
                    router.get(
                        view.url({
                            current_team: teamSlug,
                            admission: result.id,
                        }),
                    );
                }
            })
            .catch(() => {
                setSearching(false);
            });
    };

    const filteredWards = wards;

    const dateFilterOptions = [
        { label: 'Today', value: 'today' },
        { label: 'Yesterday', value: 'yesterday' },
        { label: 'This week', value: 'this_week' },
        { label: 'Last week', value: 'last_week' },
        { label: 'This month', value: 'this_month' },
        { label: 'Last month', value: 'last_month' },
        { label: 'This year', value: 'this_year' },
        { label: 'Last year', value: 'last_year' },
    ];

    setLayoutProps({
        headerActions: (
            <div className="flex items-center gap-3">
                <div className="min-w-[150px] space-y-0">
                    <select
                        aria-label="Filter by date"
                        value={dateFilter}
                        onChange={(event) => {
                            setDateFilter(event.target.value);
                            router.get(
                                wardRoundsIndex.url(teamSlug, {
                                    query: {
                                        date_filter: event.target.value,
                                    },
                                }),
                                {},
                                {
                                    preserveState: true,
                                    preserveScroll: true,
                                    replace: true,
                                },
                            );
                        }}
                        className="h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors hover:border-ring focus:border-ring focus:ring-2 focus:ring-ring/20 focus:outline-none"
                    >
                        {dateFilterOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="h-6 w-px bg-border" />
                <Button variant="default" onClick={openBilling}>
                    New Billing
                </Button>
                <Button variant="default" onClick={openTransfer}>
                    <ArrowRightLeft className="mr-1 h-4 w-4" />
                    Transfer Patient
                </Button>
            </div>
        ),
    });

    return (
        <>
            <Head title="Ward rounds" />
            <div className="flex w-full flex-col space-y-6 p-4 md:p-6 lg:p-8">
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <h2 className="mb-0.5 text-base font-medium">
                            Ward rounds
                        </h2>
                        <p className="text-sm text-muted-foreground">
                            Admission requests, admitted patients, and
                            discharges.
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Input
                            id="ward-search"
                            type="search"
                            placeholder="Search by hospital no or name..."
                            value={searchQuery}
                            onChange={(event) =>
                                setSearchQuery(event.target.value)
                            }
                            onKeyDown={(event) => {
                                if (event.key === 'Enter') {
                                    handleSearch();
                                }
                            }}
                            className="w-64"
                        />
                        <Button
                            type="button"
                            size="icon"
                            aria-label="Search ward rounds"
                            onClick={handleSearch}
                            disabled={searching || !searchQuery.trim()}
                        >
                            <Search className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                {actionError ? <AlertError errors={[actionError]} /> : null}

                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    {cards.map((card) => (
                        <Card key={card.title}>
                            <CardHeader className="pb-2">
                                <CardTitle className={`text-2xl ${card.tone}`}>
                                    {card.value.toLocaleString()}
                                </CardTitle>
                                <p className="text-sm text-muted-foreground">
                                    {card.title}
                                </p>
                            </CardHeader>
                            <CardContent>
                                <p className="text-xs text-muted-foreground">
                                    {card.description}
                                </p>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Two column layout: 60% wards | 40% admission */}
                <div className="grid gap-6 lg:grid-cols-10">
                    {/* LEFT — 60%: Wards grid */}
                    <div className="lg:col-span-6">
                        {filteredWards.length ? (
                            <div className="grid gap-4 md:grid-cols-2">
                                {filteredWards.map((ward) => (
                                    <Card key={ward.id}>
                                        <CardHeader>
                                            <CardTitle className="flex items-center justify-between gap-2">
                                                <span>{ward.name}</span>
                                                <span
                                                    className={`rounded-full px-2 py-1 text-xs ${ward.status === 'Occupied' ? 'bg-destructive/10 text-destructive' : ward.status === 'Partially occupied' ? 'bg-amber-500/10 text-amber-700 dark:text-amber-300' : 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'}`}
                                                >
                                                    {ward.status}
                                                </span>
                                            </CardTitle>
                                            <p className="text-sm text-muted-foreground">
                                                {ward.description ??
                                                    'No description'}
                                            </p>
                                        </CardHeader>
                                        <CardContent className="space-y-3">
                                            <div className="flex justify-between text-sm">
                                                <span>Beds occupied</span>
                                                <span className="font-medium">
                                                    {ward.occupiedBedsCount} /{' '}
                                                    {ward.bedsCount}
                                                </span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span>Active patients</span>
                                                <span className="font-medium">
                                                    {ward.patientsCount}
                                                </span>
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                {ward.beds
                                                    .slice(0, 8)
                                                    .map((bed) => {
                                                        const patientSuffix =
                                                            bed.patientId &&
                                                            bed.patientName
                                                                ? ` (${bed.patientId} - ${bed.patientName})`
                                                                : '';
                                                        return bed.admissionId ? (
                                                            <Link
                                                                key={bed.id}
                                                                href={view.url({
                                                                    current_team:
                                                                        teamSlug,
                                                                    admission:
                                                                        bed.admissionId,
                                                                })}
                                                                title={
                                                                    bed.patientName ??
                                                                    bed.status
                                                                }
                                                                className={`rounded border px-2 py-1 text-xs transition-colors hover:bg-accent ${bed.status === 'occupied' ? 'border-destructive/40 bg-destructive/5' : ''}`}
                                                            >
                                                                {bed.name}
                                                                {patientSuffix}
                                                            </Link>
                                                        ) : (
                                                            <span
                                                                key={bed.id}
                                                                title={
                                                                    bed.patientName ??
                                                                    bed.status
                                                                }
                                                                className={`rounded border px-2 py-1 text-xs ${bed.status === 'occupied' ? 'border-destructive/40 bg-destructive/5' : ''}`}
                                                            >
                                                                {bed.name}
                                                                {patientSuffix}
                                                            </span>
                                                        );
                                                    })}
                                                {ward.beds.length > 8 && (
                                                    <span className="px-2 py-1 text-xs text-muted-foreground">
                                                        +{ward.beds.length - 8}{' '}
                                                        more
                                                    </span>
                                                )}
                                            </div>
                                            <Button variant="outline" asChild>
                                                <Link
                                                    href={show.url({
                                                        current_team: teamSlug,
                                                        ward: ward.id,
                                                    })}
                                                >
                                                    Open ward
                                                </Link>
                                            </Button>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        ) : (
                            <p className="rounded-lg border py-10 text-center text-muted-foreground">
                                No wards have been set up yet.
                            </p>
                        )}
                    </div>

                    {/* RIGHT — 40%: Admission requests sidebar + form */}
                    <div className="lg:col-span-4">
                        <Card className="sticky top-6">
                            <CardHeader>
                                <CardTitle className="flex items-center justify-between">
                                    <span>Admissions</span>
                                    {pendingAdmissions.length > 0 && (
                                        <Badge variant="secondary">
                                            {pendingAdmissions.length} pending
                                        </Badge>
                                    )}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {pendingAdmissions.length > 0 ? (
                                    <>
                                        {/* Admission requests list */}
                                        <div className="space-y-2">
                                            <Label>Waiting patients</Label>
                                            <div className="max-h-60 space-y-2 overflow-y-auto">
                                                {pendingAdmissions.map(
                                                    (admission) => (
                                                        <button
                                                            key={admission.id}
                                                            type="button"
                                                            className={`w-full rounded-lg border p-3 text-left text-sm transition-colors hover:bg-accent ${String(admission.id) === admissionId ? 'border-primary bg-accent' : ''}`}
                                                            onClick={() =>
                                                                handleAdmissionChange(
                                                                    String(
                                                                        admission.id,
                                                                    ),
                                                                )
                                                            }
                                                        >
                                                            <p className="font-medium">
                                                                {
                                                                    admission.patientId
                                                                }{' '}
                                                                —{' '}
                                                                {
                                                                    admission.patientName
                                                                }
                                                            </p>
                                                            {admission.requestedWardName && (
                                                                <p className="text-xs text-muted-foreground">
                                                                    Requested:{' '}
                                                                    {
                                                                        admission.requestedWardName
                                                                    }
                                                                </p>
                                                            )}
                                                            {admission.notes && (
                                                                <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                                                                    {
                                                                        admission.notes
                                                                    }
                                                                </p>
                                                            )}
                                                        </button>
                                                    ),
                                                )}
                                            </div>
                                        </div>

                                        <div className="border-t pt-4">
                                            {/* Admission form */}
                                            <div className="space-y-3">
                                                <div className="space-y-1">
                                                    <Label>Ward</Label>
                                                    <select
                                                        aria-label="Ward"
                                                        value={currentWardId}
                                                        onChange={(event) =>
                                                            handleWardChange(
                                                                event.target
                                                                    .value,
                                                            )
                                                        }
                                                        className="flex h-9 w-full items-center rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none"
                                                    >
                                                        <option value="">
                                                            Select ward
                                                        </option>
                                                        {allWards.map((w) => (
                                                            <option
                                                                key={w.id}
                                                                value={String(
                                                                    w.id,
                                                                )}
                                                            >
                                                                {w.name} (
                                                                {w.beds.length}{' '}
                                                                beds available)
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <div className="space-y-1">
                                                    <Label>Available bed</Label>
                                                    <select
                                                        aria-label="Available bed"
                                                        value={bedId}
                                                        onChange={(event) =>
                                                            setBedId(
                                                                event.target
                                                                    .value,
                                                            )
                                                        }
                                                        disabled={
                                                            !currentWardId
                                                        }
                                                        className="flex h-9 w-full items-center rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                                                    >
                                                        <option value="">
                                                            {currentWardId
                                                                ? 'Select bed'
                                                                : 'Select a ward first'}
                                                        </option>
                                                        {bedsAvailable.map(
                                                            (bed) => (
                                                                <option
                                                                    key={bed.id}
                                                                    value={String(
                                                                        bed.id,
                                                                    )}
                                                                >
                                                                    {bed.name}
                                                                </option>
                                                            ),
                                                        )}
                                                    </select>
                                                </div>
                                                <div className="space-y-1">
                                                    <Label>
                                                        Admission notes
                                                    </Label>
                                                    <Textarea
                                                        aria-label="Admission notes"
                                                        value={notes}
                                                        onChange={(event) =>
                                                            setNotes(
                                                                event.target
                                                                    .value,
                                                            )
                                                        }
                                                    />
                                                </div>
                                                <div className="flex gap-2">
                                                    <Button
                                                        className="flex-1"
                                                        disabled={
                                                            !canAdmit ||
                                                            admissionProcessing
                                                        }
                                                        onClick={
                                                            submitAdmission
                                                        }
                                                    >
                                                        {admissionProcessing
                                                            ? 'Admitting...'
                                                            : 'Admit patient'}
                                                    </Button>
                                                    <Button
                                                        className="flex-1"
                                                        variant="destructive"
                                                        disabled={
                                                            !admissionId ||
                                                            cancelProcessing ||
                                                            admissionProcessing
                                                        }
                                                        onClick={
                                                            cancelSelectedAdmission
                                                        }
                                                    >
                                                        {cancelProcessing
                                                            ? 'Cancelling...'
                                                            : 'Cancel'}
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <p className="py-6 text-center text-sm text-muted-foreground">
                                        No pending admission requests.
                                    </p>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>

            {/* Transfer Patient Sheet */}
            <Sheet
                open={transferOpen}
                onOpenChange={(open) => {
                    if (!transferProcessing) {
                        setTransferOpen(open);
                    }
                }}
            >
                <SheetContent className="w-full overflow-y-auto sm:max-w-2xl">
                    <SheetHeader>
                        <SheetTitle>Transfer Patient</SheetTitle>
                        <SheetDescription>
                            Move an admitted patient from their current ward/bed
                            to another available bed.
                        </SheetDescription>
                    </SheetHeader>

                    <div className="space-y-4 px-4 pb-6">
                        <div className="space-y-1">
                            <Label>Select patient to transfer</Label>
                            <SelectNative
                                aria-label="Patient to transfer"
                                value={transferAdmissionId}
                                placeholder="Select a patient…"
                                onChange={(event) => {
                                    setTransferAdmissionId(event.target.value);
                                    setTransferWardId('');
                                    setTransferBedId('');
                                }}
                            >
                                <option value="">Select a patient…</option>
                                {occupiedBedsForTransfer.map((bed) => (
                                    <option
                                        key={bed.admissionId}
                                        value={String(bed.admissionId)}
                                    >
                                        {bed.patientName} ({bed.patientId}) —{' '}
                                        {bed.wardName}, {bed.bedName}
                                    </option>
                                ))}
                            </SelectNative>
                            {selectedTransferPatient && (
                                <p className="text-xs text-muted-foreground">
                                    Currently in{' '}
                                    <strong>
                                        {selectedTransferPatient.wardName}
                                    </strong>
                                    , bed{' '}
                                    <strong>
                                        {selectedTransferPatient.bedName}
                                    </strong>
                                </p>
                            )}
                        </div>

                        <div className="space-y-1">
                            <Label>Target ward</Label>
                            <SelectNative
                                aria-label="Target ward"
                                value={transferWardId}
                                placeholder="Select target ward…"
                                onChange={(event) => {
                                    setTransferWardId(event.target.value);
                                    setTransferBedId('');
                                }}
                                disabled={transferAdmissionId === ''}
                            >
                                <option value="">Select target ward…</option>
                                {allWards.map((w) => (
                                    <option key={w.id} value={String(w.id)}>
                                        {w.name} ({w.beds.length} beds
                                        available)
                                    </option>
                                ))}
                            </SelectNative>
                        </div>

                        <div className="space-y-1">
                            <Label>Target bed</Label>
                            <SelectNative
                                aria-label="Target bed"
                                value={transferBedId}
                                placeholder="Select target bed…"
                                onChange={(event) =>
                                    setTransferBedId(event.target.value)
                                }
                                disabled={
                                    transferWardId === '' ||
                                    transferAdmissionId === ''
                                }
                            >
                                <option value="">
                                    {transferWardId
                                        ? 'Select target bed…'
                                        : 'Select a ward first'}
                                </option>
                                {filteredAvailableBeds.map((bed) => (
                                    <option key={bed.id} value={String(bed.id)}>
                                        {bed.name}
                                    </option>
                                ))}
                            </SelectNative>
                        </div>

                        <div className="space-y-1">
                            <Label>Transfer notes (optional)</Label>
                            <Textarea
                                aria-label="Transfer notes"
                                value={transferNotes}
                                onChange={(event) =>
                                    setTransferNotes(event.target.value)
                                }
                                placeholder="Reason for transfer…"
                            />
                        </div>

                        {transferError && (
                            <AlertError errors={[transferError]} />
                        )}
                    </div>

                    <SheetFooter className="flex-row gap-2">
                        <Button
                            type="button"
                            variant="secondary"
                            className="flex-1"
                            disabled={transferProcessing}
                            onClick={() => setTransferOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            className="flex-1"
                            onClick={openTransferConfirm}
                            disabled={!canTransfer || transferProcessing}
                        >
                            Review transfer
                        </Button>
                    </SheetFooter>
                </SheetContent>
            </Sheet>

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
                                        billingPatientSearchResults.length > 0
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
                                            setBillingPatientSearchOpen(true);
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
                                            {billingLines.map((line, index) => (
                                                <tr key={index}>
                                                    <td className="px-4 py-2">
                                                        <SelectNative
                                                            aria-label={`Service ${index + 1}`}
                                                            value={
                                                                line.price_list_id
                                                            }
                                                            placeholder="Select service…"
                                                            onChange={(event) =>
                                                                chooseBillingService(
                                                                    index,
                                                                    event.target
                                                                        .value,
                                                                )
                                                            }
                                                        >
                                                            <option value="">
                                                                Select service…
                                                            </option>
                                                            {billingOptions.services.map(
                                                                (service) => (
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
                                                            aria-label={`Price ${index + 1}`}
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
                                                                className="text-muted-foreground hover:text-red-600 dark:hover:text-red-400 disabled:opacity-50"
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
                                            ))}
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
                                        { price_list_id: '', unitPrice: '' },
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
                        >
                            {billingProcessing ? 'Saving...' : 'Create billing'}
                        </Button>
                    </SheetFooter>
                </SheetContent>
            </Sheet>

            <ConfirmDialog
                open={confirmCancel}
                onOpenChange={(open) => {
                    if (!open && !cancelProcessing) {
                        setConfirmCancel(false);
                    }
                }}
                title="Cancel admission"
                description="Are you sure you want to cancel this admission request? This action cannot be undone."
                confirmLabel={
                    cancelProcessing ? 'Cancelling...' : 'Cancel admission'
                }
                cancelLabel="Keep admission"
                destructive
                processing={cancelProcessing}
                onConfirm={confirmCancelAdmission}
            />

            <ConfirmDialog
                open={showTransferConfirm}
                onOpenChange={(open) => {
                    if (!open && !transferProcessing) {
                        setShowTransferConfirm(false);
                    }
                }}
                title="Transfer patient"
                description={`Transfer ${selectedTransferPatient?.patientName ?? selectedTransferPatient?.patientId ?? 'this patient'} to ${transferTargetLabel}?`}
                confirmLabel={
                    transferProcessing ? 'Transferring...' : 'Transfer patient'
                }
                destructive
                processing={transferProcessing}
                onConfirm={submitTransfer}
            />
        </>
    );
}
