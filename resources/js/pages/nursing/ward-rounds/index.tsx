import { Head, Link, router, setLayoutProps, usePage } from '@inertiajs/react';
import { Plus, Search, X } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { billing as newBilling } from '@/routes/nursing/ward-rounds';
import { searchPatients } from '@/actions/App/Http/Controllers/WardRoundController';
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
import { admit, index as wardRoundsIndex, show, view } from '@/routes/nursing/ward-rounds';
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

    // New Billing state
    const [billingOpen, setBillingOpen] = useState(false);
    const [billingLines, setBillingLines] = useState<ServiceLineRow[]>([
        { price_list_id: '', unitPrice: '' },
    ]);
    const [billingProcessing, setBillingProcessing] = useState(false);
    const [billingError, setBillingError] = useState<string | null>(null);
    const [billingPatientSearchQuery, setBillingPatientSearchQuery] = useState('');
    const [billingPatientSearchResults, setBillingPatientSearchResults] = useState<BillingPatientOption[]>([]);
    const [billingPatientSearchOpen, setBillingPatientSearchOpen] = useState(false);
    const [billingPatientSearchLoading, setBillingPatientSearchLoading] = useState(false);
    const [billingExistingPatientId, setBillingExistingPatientId] = useState('');
    const [billingSelectedPatientLabel, setBillingSelectedPatientLabel] = useState('');
    const billingPatientSearchInputRef = useRef<HTMLInputElement>(null);
    const billingPatientSearchContainerRef = useRef<HTMLDivElement>(null);
    const billingDebounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const billingTotal = useMemo(
        () => billingLines.reduce((sum, line) => sum + (Number(line.unitPrice) || 0), 0),
        [billingLines],
    );

    const currencySymbol = usePage().props.currencySymbol ?? '₦';

    const searchBillingPatients = useCallback((query: string) => {
        if (billingDebounceTimerRef.current) {
            clearTimeout(billingDebounceTimerRef.current);
        }

        if (!query.trim()) {
            setBillingPatientSearchResults([]);
            return;
        }

        setBillingPatientSearchLoading(true);
        billingDebounceTimerRef.current = setTimeout(() => {
            const url = searchPatients.url(teamSlug, { query: { q: query } });
            fetch(url, {
                headers: { 'X-Requested-With': 'XMLHttpRequest' },
            })
                .then((res) => res.json())
                .then((results) => {
                    setBillingPatientSearchResults(results);
                    setBillingPatientSearchLoading(false);
                })
                .catch(() => setBillingPatientSearchLoading(false));
        }, 300);
    }, [teamSlug]);

    useEffect(() => {
        if (!billingPatientSearchOpen) return;
        const handleClick = (event: MouseEvent) => {
            if (billingPatientSearchContainerRef.current && !billingPatientSearchContainerRef.current.contains(event.target as Node)) {
                setBillingPatientSearchOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, [billingPatientSearchOpen]);

    useEffect(() => {
        return () => {
            if (billingDebounceTimerRef.current) clearTimeout(billingDebounceTimerRef.current);
        };
    }, []);

    function openBilling() {
        setBillingExistingPatientId('');
        setBillingSelectedPatientLabel('');
        setBillingPatientSearchQuery('');
        setBillingPatientSearchResults([]);
        setBillingPatientSearchOpen(false);
        setBillingLines([{ price_list_id: '', unitPrice: '' }]);
        setBillingError(null);
        setBillingOpen(true);
    }

    function chooseBillingService(index: number, value: string) {
        const service = billingOptions.services.find((item) => String(item.id) === value);
        setBillingLines((current) =>
            current.map((row, rowIndex) =>
                rowIndex === index
                    ? { ...row, price_list_id: value, unitPrice: service ? String(service.price) : '' }
                    : row,
            ),
        );
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
                setBillingError(Object.values(errors)[0] ?? 'Something went wrong.'),
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
        ) && !!currentWardId && bedsAvailable.some((bed) => String(bed.id) === bedId);

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
        router.post(
            admit.url({ current_team: teamSlug, ward: allWards[0]?.id ?? 1 }),
            {
                admission_id: admissionId,
                ward_id: currentWardId,
                bed_id: bedId,
                notes,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setAdmissionId('');
                    setSelectedWardId('');
                    setBedId('');
                    setNotes('');
                },
            },
        );
    };

    const cards = [
        {
            title: 'Awaiting admission',
            value: counts.pending,
            description: 'Pending admission requests',
            tone: 'text-rose-600',
        },
        {
            title: 'Admitted patients',
            value: counts.admitted,
            description: 'Admitted patients',
            tone: 'text-emerald-600',
        },
        {
            title: 'Total requests',
            value: counts.total,
            description: 'Total requests',
            tone: 'text-indigo-600',
        },
        {
            title: 'Discharged patients',
            value: counts.discharged,
            description: 'Discharged patients',
            tone: 'text-sky-600',
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
                    router.get(view.url({
                        current_team: teamSlug,
                        admission: result.id,
                    }));
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
                        className="h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors hover:border-ring focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
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
            </div>
        ),
    });

    return (
        <>
            <Head title="Ward rounds" />
            <div className="flex w-full flex-col space-y-6 p-4 md:p-6 lg:p-8">
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <h2 className="mb-0.5 text-base font-medium">Ward rounds</h2>
                        <p className="text-sm text-muted-foreground">
                            Admission requests, admitted patients, and discharges.
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Input
                            id="ward-search"
                            type="search"
                            placeholder="Search by hospital no or name..."
                            value={searchQuery}
                            onChange={(event) => setSearchQuery(event.target.value)}
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
                            onClick={handleSearch}
                            disabled={searching || !searchQuery.trim()}
                        >
                            <Search className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

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
                                                    className={`rounded-full px-2 py-1 text-xs ${ward.status === 'Occupied' ? 'bg-destructive/10 text-destructive' : ward.status === 'Partially occupied' ? 'bg-amber-500/10 text-amber-700' : 'bg-emerald-500/10 text-emerald-700'}`}
                                                >
                                                    {ward.status}
                                                </span>
                                            </CardTitle>
                                            <p className="text-sm text-muted-foreground">
                                                {ward.description ?? 'No description'}
                                            </p>
                                        </CardHeader>
                                        <CardContent className="space-y-3">
                                            <div className="flex justify-between text-sm">
                                                <span>Beds occupied</span>
                                                <span className="font-medium">
                                                    {ward.occupiedBedsCount} / {ward.bedsCount}
                                                </span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span>Active patients</span>
                                                <span className="font-medium">
                                                    {ward.patientsCount}
                                                </span>
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                {ward.beds.slice(0, 8).map((bed) => {
                                                    const patientSuffix = bed.patientId && bed.patientName ? ` (${bed.patientId} - ${bed.patientName})` : '';
                                                    return bed.admissionId ? (
                                                        <Link
                                                            key={bed.id}
                                                            href={view.url({
                                                                current_team: teamSlug,
                                                                admission: bed.admissionId,
                                                            })}
                                                            title={bed.patientName ?? bed.status}
                                                            className={`rounded border px-2 py-1 text-xs transition-colors hover:bg-accent ${bed.status === 'occupied' ? 'border-destructive/40 bg-destructive/5' : ''}`}
                                                        >
                                                            {bed.name}{patientSuffix}
                                                        </Link>
                                                    ) : (
                                                        <span
                                                            key={bed.id}
                                                            title={bed.patientName ?? bed.status}
                                                            className={`rounded border px-2 py-1 text-xs ${bed.status === 'occupied' ? 'border-destructive/40 bg-destructive/5' : ''}`}
                                                        >
                                                            {bed.name}{patientSuffix}
                                                        </span>
                                                    );
                                                })}
                                                {ward.beds.length > 8 && (
                                                    <span className="px-2 py-1 text-xs text-muted-foreground">
                                                        +{ward.beds.length - 8} more
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
                                                {pendingAdmissions.map((admission) => (
                                                    <button
                                                        key={admission.id}
                                                        type="button"
                                                        className={`w-full rounded-lg border p-3 text-left text-sm transition-colors hover:bg-accent ${String(admission.id) === admissionId ? 'border-primary bg-accent' : ''}`}
                                                        onClick={() =>
                                                            handleAdmissionChange(
                                                                String(admission.id),
                                                            )
                                                        }
                                                    >
                                                        <p className="font-medium">
                                                            {admission.patientId} —{' '}
                                                            {admission.patientName}
                                                        </p>
                                                        {admission.requestedWardName && (
                                                            <p className="text-xs text-muted-foreground">
                                                                Requested:{' '}
                                                                {admission.requestedWardName}
                                                            </p>
                                                        )}
                                                        {admission.notes && (
                                                            <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                                                                {admission.notes}
                                                            </p>
                                                        )}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="border-t pt-4">
                                            {/* Admission form */}
                                            <div className="space-y-3">
                                                <div className="space-y-1">
                                                    <Label>Ward</Label>
                                                    <select
                                                        value={currentWardId}
                                                        onChange={(event) =>
                                                            handleWardChange(
                                                                event.target
                                                                    .value,
                                                            )
                                                        }
                                                        className="flex h-9 w-full items-center rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
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
                                                                {w.name} ({w.beds.length} beds available)
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <div className="space-y-1">
                                                    <Label>Available bed</Label>
                                                    <select
                                                        value={bedId}
                                                        onChange={(event) =>
                                                            setBedId(
                                                                event.target
                                                                    .value,
                                                            )
                                                        }
                                                        disabled={!currentWardId}
                                                        className="flex h-9 w-full items-center rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                                    >
                                                        <option value="">
                                                            {currentWardId
                                                                ? 'Select bed'
                                                                : 'Select a ward first'}
                                                        </option>
                                                        {bedsAvailable.map(
                                                            (bed) => (
                                                                <option
                                                                    key={
                                                                        bed.id
                                                                    }
                                                                    value={String(
                                                                        bed.id,
                                                                    )}
                                                                >
                                                                    {
                                                                        bed.name
                                                                    }
                                                                </option>
                                                            ),
                                                        )}
                                                    </select>
                                                </div>
                                                <div className="space-y-1">
                                                    <Label>Admission notes</Label>
                                                    <Textarea
                                                        value={notes}
                                                        onChange={(event) =>
                                                            setNotes(
                                                                event.target
                                                                    .value,
                                                            )
                                                        }
                                                    />
                                                </div>
                                                <Button
                                                    className="w-full"
                                                    disabled={!canAdmit}
                                                    onClick={submitAdmission}
                                                >
                                                    Admit patient
                                                </Button>
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

            {/* New Billing Sheet */}
            <Sheet open={billingOpen} onOpenChange={setBillingOpen}>
                <SheetContent className="w-full overflow-y-auto sm:max-w-2xl">
                    <SheetHeader>
                        <SheetTitle>New Billing</SheetTitle>
                        <SheetDescription>
                            Raise invoices for a patient and add services.
                        </SheetDescription>
                    </SheetHeader>

                    <div className="space-y-4 px-4 pb-6">
                        <div className="space-y-2" ref={billingPatientSearchContainerRef}>
                            <Label htmlFor="billing-existing-patient">
                                Existing patient
                            </Label>
                            <div className="relative">
                                <Input
                                    id="billing-existing-patient"
                                    ref={billingPatientSearchInputRef}
                                    placeholder="Search patient by name, code, or phone…"
                                    value={billingExistingPatientId ? billingSelectedPatientLabel : billingPatientSearchQuery}
                                    readOnly={!!billingExistingPatientId}
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
                                {billingPatientSearchOpen && !billingExistingPatientId && (
                                    <div className="absolute left-0 right-0 z-50 mt-1 max-h-60 overflow-auto rounded-md border bg-popover shadow-lg">
                                        {billingPatientSearchLoading && (
                                            <div className="px-3 py-2 text-xs text-muted-foreground">
                                                Searching…
                                            </div>
                                        )}
                                        {!billingPatientSearchLoading && billingPatientSearchResults.length === 0 && billingPatientSearchQuery.trim() && (
                                            <div className="px-3 py-2 text-xs text-muted-foreground">
                                                No patients found
                                            </div>
                                        )}
                                        {billingPatientSearchResults.map((option) => (
                                            <button
                                                key={option.slug}
                                                type="button"
                                                className="w-full px-3 py-2 text-left text-sm hover:bg-accent"
                                                onClick={() => {
                                                    setBillingExistingPatientId(option.slug);
                                                    setBillingSelectedPatientLabel(option.label);
                                                    setBillingPatientSearchQuery('');
                                                    setBillingPatientSearchResults([]);
                                                    setBillingPatientSearchOpen(false);
                                                }}
                                            >
                                                {option.label}
                                            </button>
                                        ))}
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
                                                <th className="px-4 py-2 text-left font-medium" style={{ width: '70%' }}>
                                                    Service
                                                </th>
                                                <th className="px-4 py-2 text-left font-medium" style={{ width: '25%' }}>
                                                    Price
                                                </th>
                                                <th className="px-4 py-2 text-center font-medium" style={{ width: '5%' }}></th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y">
                                            {billingLines.map((line, index) => (
                                                <tr key={index}>
                                                    <td className="px-4 py-2">
                                                        <SelectNative
                                                            value={line.price_list_id}
                                                            placeholder="Select service…"
                                                            onChange={(event) =>
                                                                chooseBillingService(
                                                                    index,
                                                                    event.target.value,
                                                                )
                                                            }
                                                        >
                                                            <option value="">Select service…</option>
                                                            {billingOptions.services.map(
                                                                (service) => (
                                                                    <option
                                                                        key={service.id}
                                                                        value={String(service.id)}
                                                                    >
                                                                        {service.name}
                                                                    </option>
                                                                ),
                                                            )}
                                                        </SelectNative>
                                                    </td>
                                                    <td className="px-4 py-2">
                                                        <Input value={line.unitPrice} readOnly />
                                                    </td>
                                                    <td className="px-4 py-2 text-center">
                                                        {billingLines.length > 1 ? (
                                                            <button
                                                                type="button"
                                                                className="text-muted-foreground hover:text-red-600"
                                                                onClick={() =>
                                                                    setBillingLines((current) =>
                                                                        current.filter(
                                                                            (_, i) => i !== index,
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
                                    {currencySymbol} {billingTotal.toLocaleString()}
                                </span>
                            </div>

                            <Button
                                type="button"
                                size="sm"
                                variant="secondary"
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
                            <p className="text-sm text-destructive">
                                {billingError}
                            </p>
                        ) : null}
                    </div>

                    <SheetFooter className="flex-row gap-2">
                        <Button
                            type="button"
                            variant="secondary"
                            className="flex-1"
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
        </>
    );
}
