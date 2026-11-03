import { Head, Link, router, usePage } from '@inertiajs/react';
import { Plus, Trash2 } from 'lucide-react';
import { useCallback, useMemo, useRef, useState } from 'react';
import { Breadcrumbs } from '@/components/breadcrumbs';
import Heading from '@/components/heading';
import PrescriptionController from '@/actions/App/Http/Controllers/Pharmacy/PrescriptionController';
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
import {
    create as createRoute,
    index as prescriptionsIndex,
    store as storeRoute,
} from '@/routes/pharmacy/prescriptions';
import type { Team } from '@/types';

type PriceListOption = {
    id: number;
    name: string;
    price: number;
    drugForm: string | null;
};
type PrescriptionLine = {
    price_list_id: string;
    frequency: string;
    duration: string;
    dosage: string;
};
const newLine = (): PrescriptionLine => ({
    price_list_id: '',
    frequency: '1',
    duration: '1',
    dosage: '1',
});
const frequencies = [
    { value: '1', label: 'OD' },
    { value: '2', label: 'BID' },
    { value: '3', label: 'TID' },
    { value: '4', label: 'QID' },
    { value: '5', label: '5x D' },
];

export default function PrescriptionCreate({
    currencySymbol,
    formOptions,
    selectedPatientId = '',
}: {
    currencySymbol: string;
    selectedPatientId?: string;
    formOptions: {
        patients: { id: string; name: string }[];
        priceLists: PriceListOption[];
    };
}) {
    const { currentTeam } = usePage<{ currentTeam?: Team | null }>().props;
    const teamSlug = currentTeam?.slug ?? '';
    const [patientId, setPatientId] = useState(selectedPatientId);
    const [selectedPatientLabel, setSelectedPatientLabel] = useState('');
    const [selectedPatientGender, setSelectedPatientGender] = useState<string | null>(null);
    const [selectedPatientAge, setSelectedPatientAge] = useState<string | null>(null);
    const [selectedPatientCategory, setSelectedPatientCategory] = useState<string | null>(null);
    const [lines, setLines] = useState<PrescriptionLine[]>([newLine()]);
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Server-side patient search state
    const [patientSearchQuery, setPatientSearchQuery] = useState('');
    const [patientSearchResults, setPatientSearchResults] = useState<
        { slug: string; label: string; gender: string | null; age: string | null; category: string | null }[]
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

    const displayPatientLabel = patientId ? selectedPatientLabel : '';
    const priceById = useMemo(
        () => new Map(formOptions.priceLists.map((item) => [item.id, item])),
        [formOptions.priceLists],
    );
    const total = lines.reduce((sum, line) => {
        const price = priceById.get(Number(line.price_list_id))?.price ?? 0;
        const quantity =
            (Number(line.frequency) || 0) *
            (Number(line.duration) || 0) *
            (Number(line.dosage) || 0);
        return sum + quantity * price;
    }, 0);

    function updateLine(index: number, patch: Partial<PrescriptionLine>) {
        setLines((current) =>
            current.map((line, lineIndex) => {
                if (lineIndex !== index) {
                    return line;
                }

                const updated = { ...line, ...patch };
                const freq = Number(updated.frequency) || 0;
                const dur = Number(updated.duration) || 0;
                const dose = Number(updated.dosage) || 0;
                if (freq > 0 && dur > 0 && dose > 0) {
                    // quantity is calculated but not stored separately in this form
                }

                return updated;
            }),
        );
    }

    function submit() {
        setProcessing(true);
        setError(null);
        router.post(
            storeRoute.url(teamSlug),
            {
                patient_id: patientId,
                lines: lines.map((line) => ({
                    price_list_id: Number(line.price_list_id),
                    frequency: Number(line.frequency),
                    duration: Number(line.duration),
                    dosage: Number(line.dosage),
                })),
            },
            {
                preserveScroll: true,
                onError: (errors) =>
                    setError(
                        Object.values(errors)[0] ??
                            'Unable to create prescription.',
                    ),
                onFinish: () => setProcessing(false),
            },
        );
    }

    return (
        <>
            <Head title="Create prescription" />
            <div className="flex w-full flex-col space-y-6 p-4 md:p-6 lg:p-8">
                <div className="space-y-3">
                    <Breadcrumbs
                        breadcrumbs={[
                            {
                                title: 'Pharmacy',
                                href: prescriptionsIndex.url(teamSlug),
                            },
                            {
                                title: 'Prescriptions',
                                href: prescriptionsIndex.url(teamSlug),
                            },
                            {
                                title: 'Create',
                                href: createRoute.url(teamSlug),
                            },
                        ]}
                    />
                    <Heading
                        title="Create prescription"
                        description="Select a patient and add medications with a dosage schedule."
                    />
                </div>
                <Card>
                    <CardHeader>
                        <CardTitle>Prescription details</CardTitle>
                        <CardDescription>
                            Select a patient and add medications with a dosage schedule.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="overflow-visible space-y-6">
                        <div className="space-y-2" ref={patientSearchContainerRef}>
                            <Label htmlFor="patient_id">
                                Patient
                            </Label>
                            <div className="flex gap-4 items-center">
                                <div className="relative flex-1 max-w-lg">
                                    <Input
                                        id="patient_id"
                                        ref={patientSearchInputRef}
                                        placeholder="Search patient by name, code, or phone…"
                                        value={displayPatientLabel || patientSearchQuery}
                                        readOnly={!!patientId && selectedPatientId !== ''}
                                        onClick={() => {
                                            if (!patientId || selectedPatientId === '') {
                                                setPatientSearchOpen(true);
                                            }
                                        }}
                                        onChange={(event) => {
                                            const value = event.target.value;
                                            setPatientId('');
                                            setSelectedPatientLabel('');
                                            setSelectedPatientGender(null);
                                            setSelectedPatientAge(null);
                                            setSelectedPatientCategory(null);
                                            setPatientSearchQuery(value);
                                            searchPatients(value);
                                            setPatientSearchOpen(true);
                                        }}
                                    />
                                    {patientSearchOpen && !patientId && (
                                        <div className="absolute left-0 right-0 z-50 mt-1 max-h-60 overflow-auto rounded-md border bg-white shadow-lg">
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
                                                        setSelectedPatientLabel(option.label);
                                                        setSelectedPatientGender(option.gender);
                                                        setSelectedPatientAge(option.age);
                                                        setSelectedPatientCategory(option.category);
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
                                {patientId && (
                                    <span className="text-sm text-muted-foreground whitespace-nowrap">
                                        {selectedPatientGender ?? '—'} · {selectedPatientAge ?? '—'} · {selectedPatientCategory ?? '—'}
                                    </span>
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
                                    <TableHead className="w-[80px]">Qty</TableHead>
                                    <TableHead className="text-right">
                                        Line total
                                    </TableHead>
                                    <TableHead />
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {lines.map((line, index) => {
                                    const medication = priceById.get(
                                        Number(line.price_list_id),
                                    );
                                    const quantity =
                                        (Number(line.frequency) || 0) *
                                        (Number(line.duration) || 0) *
                                        (Number(line.dosage) || 0);
                                    return (
                                        <TableRow key={index}>
                                            <TableCell className="min-w-[400px] align-top">
                                                <SelectNative
                                                    className="h-auto py-1.5"
                                                    value={line.price_list_id}
                                                    onChange={(event) =>
                                                        updateLine(index, {
                                                            price_list_id:
                                                                event.target
                                                                    .value,
                                                        })
                                                    }
                                                >
                                                    <option value="">
                                                        Select drug
                                                    </option>
                                                    {formOptions.priceLists.map(
                                                        (option) => (
                                                            <option
                                                                key={option.id}
                                                                value={
                                                                    option.id
                                                                }
                                                            >
                                                                {option.name}
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
                                                    value={line.frequency}
                                                    onChange={(event) =>
                                                        updateLine(index, {
                                                            frequency:
                                                                event.target
                                                                    .value,
                                                        })
                                                    }
                                                >
                                                    {frequencies.map(
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
                                                    min="1"
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
                                                    min="1"
                                                    value={line.dosage}
                                                    onChange={(event) =>
                                                        updateLine(index, {
                                                            dosage: event.target
                                                                .value,
                                                        })
                                                    }
                                                />
                                            </TableCell>
                                            <TableCell className="w-[80px]">{quantity}</TableCell>
                                            <TableCell className="text-right">
                                                {currencySymbol}{' '}
                                                {(
                                                    (medication?.price ?? 0) *
                                                    quantity
                                                ).toLocaleString()}
                                            </TableCell>
                                            <TableCell>
                                                <Button
                                                    type="button"
                                                    size="sm"
                                                    variant="ghost"
                                                    disabled={
                                                        lines.length === 1
                                                    }
                                                    onClick={() =>
                                                        setLines((current) =>
                                                            current.filter(
                                                                (
                                                                    _,
                                                                    lineIndex,
                                                                ) =>
                                                                    lineIndex !==
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
                                    setLines((current) => [...current, newLine()])
                                }
                            >
                                <Plus className="mr-2 size-4" />
                                Add drug
                            </Button>
                            <p className="text-lg font-semibold">
                                Total: {currencySymbol} {total.toLocaleString()}
                            </p>
                        </div>
                        {error ? (
                            <p className="text-sm text-destructive">{error}</p>
                        ) : null}
                        <div className="flex gap-2">
                            <Button variant="secondary" asChild>
                                <Link href={prescriptionsIndex.url(teamSlug)}>
                                    Cancel
                                </Link>
                            </Button>
                            <Button disabled={processing} onClick={submit}>
                                {processing ? 'Creating...' : 'Create prescription'}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
