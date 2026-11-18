import { Head, Link, router, usePage } from '@inertiajs/react';
import { Plus, Trash2 } from 'lucide-react';
import { useCallback, useMemo, useRef, useState } from 'react';
import { Breadcrumbs } from '@/components/breadcrumbs';
import Heading from '@/components/heading';
import PrescriptionController from '@/actions/App/Http/Controllers/Pharmacy/PrescriptionController';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SelectNative } from '@/components/ui/select-native';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import type { Team } from '@/types';
import {
    index as prescriptionsIndex,
    show as showRoute,
    update as updateRoute,
} from '@/routes/pharmacy/prescriptions';

type PriceListOption = {
    id: number;
    name: string;
    price: number;
    drugForm: string | null;
};

type LineForm = {
    id: number | null;
    price_list_id: string;
    frequency: string;
    duration: string;
    dosage: string;
    comment: string;
    quantity: string;
    paid: boolean;
    dispenseStatus: string;
};

type Prescription = {
    id: number;
    patientSlug: string;
    patientName: string | null;
    patientGender: string | null;
    patientAge: string | null;
    patientBirthDate: string | null;
    lines: {
        id: number;
        priceListId: number;
        frequency: number | null;
        duration: number | null;
        dosage: number | null;
        comment: string | null;
        quantity: number;
        paid: boolean;
        dispenseStatus: string;
    }[];
};

const FREQUENCIES = [
    { value: '1', label: 'OD' },
    { value: '2', label: 'BID' },
    { value: '3', label: 'TID' },
    { value: '4', label: 'QID' },
    { value: '5', label: '5x D' },
];

export default function PrescriptionEdit({
    currencySymbol,
    prescription,
    isAdmitted,
    formOptions,
}: {
    currencySymbol: string;
    prescription: Prescription;
    isAdmitted: boolean;
    formOptions: {
        patients: { id: string; name: string }[];
        priceLists: PriceListOption[];
    };
}) {
    const { currentTeam } = usePage<{ currentTeam?: Team | null }>().props;
    const teamSlug = currentTeam?.slug ?? '';
    const [patientId, setPatientId] = useState(prescription.patientSlug);
    const [lines, setLines] = useState<LineForm[]>(
        prescription.lines.map((line) => ({
            id: line.id,
            price_list_id: String(line.priceListId),
            frequency: line.frequency !== null ? String(line.frequency) : '1',
            duration: line.duration !== null ? String(line.duration) : '1',
            dosage: line.dosage !== null ? String(line.dosage) : '1',
            comment: line.comment ?? '',
            quantity: String(line.quantity),
            paid: line.paid,
            dispenseStatus: line.dispenseStatus ?? 'pending',
        })),
    );
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Server-side patient search state
    const [patientSearchQuery, setPatientSearchQuery] = useState('');
    const [patientSearchResults, setPatientSearchResults] = useState<
        { slug: string; label: string }[]
    >([]);
    const [patientSearchOpen, setPatientSearchOpen] = useState(false);
    const [patientSearchLoading, setPatientSearchLoading] = useState(false);
    const patientSearchInputRef = useRef<HTMLInputElement>(null);
    const patientSearchContainerRef = useRef<HTMLDivElement>(null);
    const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const searchPatients = useCallback((query: string) => {
        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
        }

        if (!query.trim()) {
            setPatientSearchResults([]);
            return;
        }

        setPatientSearchLoading(true);
        debounceTimerRef.current = setTimeout(() => {
            const url = PrescriptionController.searchPatients.url(teamSlug, { query: { q: query } });
            fetch(url, {
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                },
            })
                .then((res) => res.json())
                .then((results) => {
                    setPatientSearchResults(results);
                    setPatientSearchLoading(false);
                })
                .catch(() => {
                    setPatientSearchLoading(false);
                });
        }, 300);
    }, [teamSlug]);

    const selectedPatientLabel = (() => {
        if (!patientId) {
            return '';
        }
        const found = patientSearchResults.find((p) => p.slug === patientId);
        return found?.label ?? patientId;
    })();

    const priceById = useMemo(
        () => new Map(formOptions.priceLists.map((item) => [item.id, item])),
        [formOptions.priceLists],
    );

    const total = lines.reduce((sum, line) => {
        const price = priceById.get(Number(line.price_list_id))?.price ?? 0;
        return sum + (Number(line.quantity) || 0) * price;
    }, 0);

    const totalPaid = lines.reduce((sum, line) => {
        if (!line.paid) {
            return sum;
        }
        const price = priceById.get(Number(line.price_list_id))?.price ?? 0;
        return sum + (Number(line.quantity) || 0) * price;
    }, 0);

    const totalNew = lines.reduce((sum, line) => {
        if (line.paid) {
            return sum;
        }
        const price = priceById.get(Number(line.price_list_id))?.price ?? 0;
        return sum + (Number(line.quantity) || 0) * price;
    }, 0);

    function updateLine(index: number, patch: Partial<LineForm>) {
        setLines((current) =>
            current.map((line, i) => {
                if (i !== index) {
                    return line;
                }

                const updated = { ...line, ...patch };
                if ('frequency' in patch || 'duration' in patch || 'dosage' in patch) {
                    const freq = Number(updated.frequency) || 0;
                    const dur = Number(updated.duration) || 0;
                    const dose = Number(updated.dosage) || 0;
                    const quantity = freq * dur * dose;
                    if (quantity > 0) {
                        updated.quantity = String(quantity);
                    }
                }

                return updated;
            }),
        );
    }

    function setLinePriceList(index: number, priceListId: string) {
        const line = lines[index];
        const frequency = Number(line.frequency) || 0;
        const duration = Number(line.duration) || 0;
        const dosage = Number(line.dosage) || 0;
        const quantity = frequency * duration * dosage;
        updateLine(index, {
            price_list_id: priceListId,
            quantity: quantity > 0 ? String(quantity) : line.quantity,
        });
    }

    function submit() {
        setProcessing(true);
        setError(null);
        router.patch(
            updateRoute.url({
                current_team: teamSlug,
                prescription: prescription.id,
            }),
            {
                patient_id: patientId,
                lines: lines.map((line) => ({
                    id: line.id,
                    price_list_id: Number(line.price_list_id),
                    frequency: line.frequency ? Number(line.frequency) : null,
                    duration: line.duration ? Number(line.duration) : null,
                    dosage: line.dosage ? Number(line.dosage) : null,
                    comment: line.comment || null,
                    quantity: Number(line.quantity) || 0,
                })),
            },
            {
                preserveScroll: true,
                onSuccess: () =>
                    router.visit(
                        showRoute.url({
                            current_team: teamSlug,
                            prescription: prescription.id,
                        }),
                    ),
                onError: (errors) =>
                    setError(
                        Object.values(errors)[0] ??
                            'Unable to save prescription.',
                    ),
                onFinish: () => setProcessing(false),
            },
        );
    }

    return (
        <>
            <Head title="Edit prescription" />
            <div className="flex w-full flex-col space-y-6 p-4 md:p-6 lg:p-8">
                <div className="space-y-3">
                    <Breadcrumbs
                        breadcrumbs={[
                            {
                                title: 'Pharmacy',
                                href: prescriptionsIndex(teamSlug),
                            },
                            {
                                title: 'Prescriptions',
                                href: prescriptionsIndex(teamSlug),
                            },
                            {
                                title: prescription.patientSlug,
                                href: showRoute.url({
                                    current_team: teamSlug,
                                    prescription: prescription.id,
                                }),
                            },
                            {
                                title: 'Edit',
                                href: showRoute.url({
                                    current_team: teamSlug,
                                    prescription: prescription.id,
                                }),
                            },
                        ]}
                    />
                    <Heading
                        title="Edit prescription"
                        description="Adjust dosage schedule, drugs, and quantities."
                    />
                    {prescription.patientName ? (
                        <Card>
                            <CardContent className="p-2">
                                <dl className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                                    <div>
                                        <dt className="text-xs text-muted-foreground">Patient</dt>
                                        <dd className="text-sm font-medium">{prescription.patientName}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-xs text-muted-foreground">Gender</dt>
                                        <dd className="text-sm font-medium">{prescription.patientGender ?? '—'}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-xs text-muted-foreground">Age</dt>
                                        <dd className="text-sm font-medium">{prescription.patientAge ?? '—'}</dd>
                                    </div>
                                </dl>
                            </CardContent>
                        </Card>
                    ) : null}
                </div>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0">
                        <div>
                            <CardTitle>Prescription details</CardTitle>
                            <CardDescription>
                                Quantity is prefilled from frequency × duration ×
                                dosage.
                            </CardDescription>
                        </div>
                        <Badge variant={isAdmitted ? 'default' : 'secondary'}>
                            {isAdmitted ? 'On Admission' : 'OPD'}
                        </Badge>
                    </CardHeader>
                    <CardContent className="overflow-visible space-y-6">
                        <div className="max-w-md space-y-2" ref={patientSearchContainerRef}>
                            <Label htmlFor="patient_id">
                                Patient
                            </Label>
                            <div className="relative">
                                <Input
                                    id="patient_id"
                                    ref={patientSearchInputRef}
                                    placeholder="Search patient by name, code, or phone…"
                                    value={patientId ? selectedPatientLabel : patientSearchQuery}
                                    onClick={() => {
                                        setPatientSearchOpen(true);
                                    }}
                                    onChange={(event) => {
                                        const value = event.target.value;
                                        setPatientId('');
                                        setPatientSearchQuery(value);
                                        searchPatients(value);
                                        setPatientSearchOpen(true);
                                    }}
                                />
                                {patientSearchOpen && !patientId && (
                                    <div className="absolute left-0 right-0 z-50 mt-1 max-h-60 overflow-auto rounded-md border bg-popover shadow-lg">
                                        {patientSearchLoading && (
                                            <div className="px-3 py-2 text-xs text-muted-foreground">
                                                Searching…
                                            </div>
                                        )}
                                        {!patientSearchLoading && patientSearchResults.length === 0 && patientSearchQuery.trim() && (
                                            <div className="px-3 py-2 text-xs text-muted-foreground">
                                                No patients found
                                            </div>
                                        )}
                                        {patientSearchResults.map((option) => (
                                            <button
                                                key={option.slug}
                                                type="button"
                                                className="w-full px-3 py-2 text-left text-sm hover:bg-accent"
                                                onClick={() => {
                                                    setPatientId(option.slug);
                                                    setPatientSearchQuery('');
                                                    setPatientSearchResults([]);
                                                    setPatientSearchOpen(false);
                                                }}
                                            >
                                                {option.label}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        <Table overflow="overflow-visible">
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="min-w-[400px]">Drug</TableHead>
                                    <TableHead>Frequency</TableHead>
                                    <TableHead className="w-[80px]">Duration</TableHead>
                                    <TableHead className="w-[80px]">Dosage</TableHead>
                                    <TableHead className="min-w-[150px]">Comment</TableHead>
                                    <TableHead className="w-[80px]">Qty</TableHead>
                                    <TableHead className="text-right">
                                        Line total
                                    </TableHead>
                                    <TableHead>Billing</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead />
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {lines.map((line, index) => {
                                    const price =
                                        priceById.get(
                                            Number(line.price_list_id),
                                        )?.price ?? 0;
                                    const lineTotal =
                                        (Number(line.quantity) || 0) *
                                        price;
                                    return (
                                        <TableRow key={line.id ?? index}>
                                            <TableCell className="min-w-[400px] align-top">
                                                <SelectNative
                                                    className="h-auto py-1.5"
                                                    disabled={line.paid}
                                                    value={
                                                        line.price_list_id
                                                    }
                                                    onChange={(event) =>
                                                        setLinePriceList(
                                                            index,
                                                            event.target
                                                                .value,
                                                        )
                                                    }
                                                >
                                                    <option value="">
                                                        Select drug
                                                    </option>
                                                    {formOptions.priceLists.map(
                                                        (option) => (
                                                            <option
                                                                key={
                                                                    option.id
                                                                }
                                                                value={
                                                                    option.id
                                                                }
                                                            >
                                                                {
                                                                    option.name
                                                                }
                                                                {option.drugForm
                                                                    ? ` - ${option.drugForm}`
                                                                    : ''}
                                                            </option>
                                                        ),
                                                    )}
                                                </SelectNative>
                                            </TableCell>
                                            <TableCell>
                                                <SelectNative
                                                    disabled={line.paid}
                                                    value={line.frequency}
                                                    onChange={(event) =>
                                                        updateLine(index, {
                                                            frequency:
                                                                event.target
                                                                    .value,
                                                        })
                                                    }
                                                >
                                                    {FREQUENCIES.map(
                                                        (frequency) => (
                                                            <option
                                                                key={
                                                                    frequency.value
                                                                }
                                                                value={
                                                                    frequency.value
                                                                }
                                                            >
                                                                {
                                                                    frequency.label
                                                                }
                                                            </option>
                                                        ),
                                                    )}
                                                </SelectNative>
                                            </TableCell>
                                            <TableCell className="w-[80px]">
                                                <Input
                                                    type="number"
                                                    min="0"
                                                    disabled={line.paid}
                                                    value={line.duration}
                                                    onChange={(event) =>
                                                        updateLine(index, {
                                                            duration:
                                                                event.target
                                                                    .value,
                                                        })
                                                    }
                                                />
                                            </TableCell>
                                            <TableCell className="w-[80px]">
                                                <Input
                                                    type="number"
                                                    min="0"
                                                    disabled={line.paid}
                                                    value={line.dosage}
                                                    onChange={(event) =>
                                                        updateLine(index, {
                                                            dosage: event
                                                                .target
                                                                    .value,
                                                        })
                                                    }
                                                />
                                            </TableCell>
                                            <TableCell className="min-w-[150px]">
                                                <Input
                                                    disabled={line.paid}
                                                    value={line.comment}
                                                    onChange={(event) =>
                                                        updateLine(index, {
                                                            comment: event
                                                                .target
                                                                    .value,
                                                        })
                                                    }
                                                    placeholder="Doctor's note…"
                                                />
                                            </TableCell>
                                            <TableCell className="w-[80px]">
                                                <Input
                                                    type="number"
                                                    min="0"
                                                    disabled={line.paid}
                                                    value={line.quantity}
                                                    onChange={(event) =>
                                                        updateLine(index, {
                                                            quantity:
                                                                event.target
                                                                    .value,
                                                        })
                                                    }
                                                />
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {currencySymbol}{' '}
                                                {lineTotal.toLocaleString()}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={line.paid ? 'default' : 'secondary'}>
                                                    {line.paid ? 'Paid' : 'Unpaid'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={line.dispenseStatus === 'dispensed' ? 'default' : 'destructive'}>
                                                    {line.dispenseStatus === 'dispensed' ? 'Dispensed' : 'Pending'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    disabled={
                                                        lines.length === 1 || line.paid
                                                    }
                                                    onClick={() =>
                                                        setLines(
                                                            (current) =>
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
                                                    <Trash2 className="size-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>

                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <Button
                                variant="outline"
                                onClick={() =>
                                    setLines((current) => [
                                        ...current,
                                        {
                                            id: null,
                                            price_list_id: '',
                                            frequency: '1',
                                            duration: '1',
                                            dosage: '1',
                                            comment: '',
                                            quantity: '1',
                                            paid: false,
                                            dispenseStatus: 'pending',
                                        },
                                    ])
                                }
                            >
                                <Plus className="mr-2 size-4" />
                                Add drug
                            </Button>
                            <div className="text-right">
                                <p className="text-sm text-muted-foreground">
                                    Total paid: {currencySymbol}{' '}
                                    {totalPaid.toLocaleString()}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    Total billing for new lines:{' '}
                                    {currencySymbol}{' '}
                                    {totalNew.toLocaleString()}
                                </p>
                                <p className="text-lg font-semibold">
                                    Total: {currencySymbol}{' '}
                                    {total.toLocaleString()}
                                </p>
                            </div>
                        </div>

                        {error ? (
                            <p className="text-sm text-red-600">{error}</p>
                        ) : null}

                        <div className="flex gap-2">
                            <Button variant="secondary" asChild>
                                <Link
                                    href={showRoute.url({
                                        current_team: teamSlug,
                                        prescription: prescription.id,
                                    })}
                                >
                                    Cancel
                                </Link>
                            </Button>
                            <Button disabled={processing} onClick={submit}>
                                {processing ? 'Saving…' : 'Save prescription'}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
