import { Head, Link, router, usePage } from '@inertiajs/react';
import { Plus, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Breadcrumbs } from '@/components/breadcrumbs';
import Heading from '@/components/heading';
import PatientSelect from '@/components/patient-select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
    const [lines, setLines] = useState<PrescriptionLine[]>([newLine()]);
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);
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

    function searchPatients(term: string) {
        return router.get(
            createRoute.url(teamSlug),
            { patient_id: selectedPatientId || undefined, q: term },
            {
                only: ['formOptions.patients'],
                preserveScroll: true,
                preserveState: true,
                replace: true,
            },
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
                <div className="rounded-xl border bg-card p-4 md:p-6">
                    <div className="mb-6 max-w-lg space-y-2">
                        <PatientSelect
                            id="patient_id"
                            label="Patient"
                            value={patientId}
                            options={formOptions.patients}
                            onChange={setPatientId}
                            onSearch={searchPatients}
                            disabled={selectedPatientId !== ''}
                        />
                    </div>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Drug</TableHead>
                                    <TableHead>Frequency</TableHead>
                                    <TableHead>Duration</TableHead>
                                    <TableHead>Dosage</TableHead>
                                    <TableHead>Qty</TableHead>
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
                                            <TableCell className="min-w-[280px] align-top">
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
                                            <TableCell>
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
                                            <TableCell>
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
                                            <TableCell>{quantity}</TableCell>
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
                    </div>
                    <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
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
                        <p className="mt-4 text-sm text-destructive">{error}</p>
                    ) : null}
                    <div className="mt-6 flex gap-2">
                        <Button variant="secondary" asChild>
                            <Link href={prescriptionsIndex.url(teamSlug)}>
                                Cancel
                            </Link>
                        </Button>
                        <Button disabled={processing} onClick={submit}>
                            {processing ? 'Creating...' : 'Create prescription'}
                        </Button>
                    </div>
                </div>
            </div>
        </>
    );
}
