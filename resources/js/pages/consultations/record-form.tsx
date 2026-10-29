import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SelectNative } from '@/components/ui/select-native';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import { Textarea } from '@/components/ui/textarea';
import type {
    ConsultationFormValues,
    ConsultationLine,
    ConsultationRecord,
    ConsultationRecordOptions,
    ConsultationRecordType,
} from '@/types';

type Props = {
    open: boolean;
    type: ConsultationRecordType;
    record: ConsultationRecord | null;
    options: ConsultationRecordOptions;
    processing: boolean;
    error: string | null;
    onClose: () => void;
    onSubmit: (values: ConsultationFormValues) => void;
};

const EMPTY_LINE = {
    price_list_id: '',
    unitPrice: '',
    quantity: '1',
    results: '',
    frequency: '',
    duration: '',
    dosage: '',
};

const EMPTY: ConsultationFormValues = {
    lines: [{ ...EMPTY_LINE }],
    total: '',
    status: 'pending',
    notes: '',
    notes_en: '',
    notes_ha: '',
    notes_ff: '',
    ward_id: '',
    duration: '0',
    bed_id: '',
};

const LINE_TYPES: ConsultationRecordType[] = [
    'vital-signs',
    'treatments',
    'laboratories',
    'prescriptions',
];

const NOTIFY_TYPES: ConsultationRecordType[] = [
    'vital-signs',
    'treatments',
    'laboratories',
];

function initialValues(
    type: ConsultationRecordType,
    record: ConsultationRecord | null,
): ConsultationFormValues {
    if (!record) {
        return { ...EMPTY, lines: [{ ...EMPTY_LINE }] };
    }

    return {
        ...EMPTY,
        notes: record.notes ?? '',
        notes_en: record.notes_en ?? '',
        notes_ha: record.notes_ha ?? '',
        notes_ff: record.notes_ff ?? '',
        status: record.status ?? 'pending',
        total: String(record.total ?? ''),
        ward_id: record.ward_id ? String(record.ward_id) : '',
        bed_id: record.bed_id ? String(record.bed_id) : '',
        duration: String(record.duration ?? '0'),
        lines:
            record.lines && record.lines.length > 0
                ? record.lines.map((line: ConsultationLine) => ({
                      price_list_id: String(line.price_list_id),
                      unitPrice: String(line.unitPrice ?? ''),
                      quantity: String(line.quantity ?? '1'),
                      results: line.results ?? '',
                      frequency: line.frequency ?? '',
                      duration: line.duration ?? '',
                      dosage: line.dosage ?? '',
                  }))
                : [{ ...EMPTY_LINE }],
    };
}

const TITLES: Record<ConsultationRecordType, string> = {
    'vital-signs': 'Vital signs',
    complaints: 'Complaint',
    examinations: 'Examination',
    diagnoses: 'Diagnosis',
    admissions: 'Admission request',
    treatments: 'Treatment',
    laboratories: 'Laboratory request',
    prescriptions: 'Prescription',
};

export function ConsultationRecordForm({
    open,
    type,
    record,
    options,
    processing,
    error,
    onClose,
    onSubmit,
}: Props) {
    const [values, setValues] = useState<ConsultationFormValues>(() =>
        initialValues(type, record),
    );

    const hasLines = LINE_TYPES.includes(type);
    const pharmacy = type === 'prescriptions';

    const linePriceLists = pharmacy
        ? options.drugs
        : type === 'laboratories'
          ? options.laboratoryTests
          : type === 'treatments'
            ? options.services
            : options.vitalPriceLists;

    function setLine(
        index: number,
        key: keyof typeof EMPTY_LINE,
        value: string,
    ) {
        setValues((current) => {
            const lines = [...current.lines];
            lines[index] = { ...lines[index], [key]: value };

            if (key === 'price_list_id') {
                const price = linePriceLists.find(
                    (item) => String(item.id) === lines[index].price_list_id,
                );
                lines[index].unitPrice = String(price?.price ?? '');
            }

            if (pharmacy) {
                const freq = Number(lines[index].frequency || 0);
                const dur = Number(lines[index].duration || 0);
                const dose = Number(lines[index].dosage || 0);
                if (freq > 0 && dur > 0 && dose > 0) {
                    lines[index].quantity = String(freq * dur * dose);
                }
            }

            const total = lines.reduce(
                (sum, line) =>
                    sum +
                    Number(line.quantity || 0) * Number(line.unitPrice || 0),
                0,
            );

            return { ...current, lines, total: String(total) };
        });
    }

    return (
        <Sheet open={open} onOpenChange={(next) => !next && onClose()}>
            <SheetContent className="w-full overflow-y-auto sm:max-w-2xl">
                <SheetHeader>
                    <SheetTitle>
                        {record ? 'Edit' : 'New'} {TITLES[type]}
                    </SheetTitle>
                    <SheetDescription>
                        Records are attached to this consultation&apos;s
                        patient.
                    </SheetDescription>
                </SheetHeader>

                <div className="space-y-4 px-4 pb-4">
                    {error ? (
                        <p className="rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700">
                            {error}
                        </p>
                    ) : null}

                    {type === 'complaints' ? (
                        <div className="space-y-3">
                            {(
                                ['notes_en', 'notes_ha', 'notes_ff'] as const
                            ).map((field) => (
                                <div key={field}>
                                    <Label htmlFor={field}>
                                        {field === 'notes_en'
                                            ? 'Complaint (English)'
                                            : field === 'notes_ha'
                                              ? 'Complaint (Hausa)'
                                              : 'Complaint (Fulfulde)'}
                                    </Label>
                                    <Textarea
                                        id={field}
                                        rows={4}
                                        value={values[field]}
                                        onChange={(event) =>
                                            setValues((current) => ({
                                                ...current,
                                                [field]: event.target.value,
                                            }))
                                        }
                                    />
                                </div>
                            ))}
                        </div>
                    ) : null}

                    {type === 'examinations' || type === 'diagnoses' ? (
                        <div>
                            <Label htmlFor="notes">
                                {type === 'examinations' ? 'Examination Notes' : 'Diagnosis'}
                            </Label>
                            <Textarea
                                id="notes"
                                rows={6}
                                value={values.notes}
                                onChange={(event) =>
                                    setValues((current) => ({
                                        ...current,
                                        notes: event.target.value,
                                    }))
                                }
                            />
                        </div>
                    ) : null}

                    {type === 'admissions' ? (
                        <div className="space-y-3">
                            <div>
                                <Label>Ward</Label>
                                <Select
                                    value={values.ward_id}
                                    onValueChange={(value) =>
                                        setValues((current) => ({
                                            ...current,
                                            ward_id: value,
                                        }))
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select ward" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {options.wards.map((ward) => (
                                            <SelectItem
                                                key={ward.id}
                                                value={String(ward.id)}
                                            >
                                                {ward.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label htmlFor="duration">
                                    Duration (days)
                                </Label>
                                <Input
                                    id="duration"
                                    type="number"
                                    value={values.duration}
                                    onChange={(event) =>
                                        setValues((current) => ({
                                            ...current,
                                            duration: event.target.value,
                                        }))
                                    }
                                />
                            </div>
                            <div>
                                <Label htmlFor="admission-notes">Notes</Label>
                                <Textarea
                                    id="admission-notes"
                                    rows={4}
                                    value={values.notes}
                                    onChange={(event) =>
                                        setValues((current) => ({
                                            ...current,
                                            notes: event.target.value,
                                        }))
                                    }
                                />
                            </div>
                        </div>
                    ) : null}

                    {type === 'laboratories' ? (
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <Label>Tests</Label>
                                <Button
                                    type="button"
                                    size="sm"
                                    variant="secondary"
                                    onClick={() =>
                                        setValues((current) => ({
                                            ...current,
                                            lines: [
                                                ...current.lines,
                                                { ...EMPTY_LINE },
                                            ],
                                        }))
                                    }
                                >
                                    Add test
                                </Button>
                            </div>

                            {values.lines.length > 0 ? (
                                <div className="rounded-lg border">
                                    <table className="w-full text-sm">
                                        <thead className="bg-muted/50">
                                            <tr>
                                                <th className="px-4 py-2 text-left font-medium" style={{ width: '70%' }}>
                                                    Test
                                                </th>
                                                <th className="px-4 py-2 text-left font-medium" style={{ width: '30%' }}>
                                                    Price
                                                </th>
                                                <th className="px-4 py-2 text-center font-medium" style={{ width: '5%' }}></th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y">
                                            {values.lines.map((line, index) => (
                                                <tr key={index}>
                                                    <td className="px-4 py-2">
                                                        <SelectNative
                                                            value={line.price_list_id}
                                                            placeholder="Select test…"
                                                            onChange={(event) =>
                                                                setLine(
                                                                    index,
                                                                    'price_list_id',
                                                                    event.target.value,
                                                                )
                                                            }
                                                        >
                                                            {linePriceLists.map((item) => (
                                                                <option
                                                                    key={item.id}
                                                                    value={String(item.id)}
                                                                >
                                                                    {item.name}
                                                                </option>
                                                            ))}
                                                        </SelectNative>
                                                    </td>
                                                    <td className="px-4 py-2">
                                                        <Input
                                                            value={line.unitPrice}
                                                            readOnly
                                                        />
                                                    </td>
                                                    <td className="px-4 py-2 text-center">
                                                        <button
                                                            type="button"
                                                            className="text-muted-foreground hover:text-red-600"
                                                            onClick={() =>
                                                                setValues((current) => ({
                                                                    ...current,
                                                                    lines: current.lines.filter(
                                                                        (_, i) => i !== index,
                                                                    ),
                                                                }))
                                                            }
                                                        >
                                                            ×
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : null}
                        </div>
                    ) : type === 'treatments' ? (
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <Label>Services</Label>
                                <Button
                                    type="button"
                                    size="sm"
                                    variant="secondary"
                                    onClick={() =>
                                        setValues((current) => ({
                                            ...current,
                                            lines: [
                                                ...current.lines,
                                                { ...EMPTY_LINE },
                                            ],
                                        }))
                                    }
                                >
                                    Add service
                                </Button>
                            </div>

                            {values.lines.length > 0 ? (
                                <div className="rounded-lg border">
                                    <table className="w-full text-sm">
                                        <thead className="bg-muted/50">
                                            <tr>
                                                <th className="px-4 py-2 text-left font-medium" style={{ width: '70%' }}>
                                                    Service
                                                </th>
                                                <th className="px-4 py-2 text-left font-medium" style={{ width: '30%' }}>
                                                    Price
                                                </th>
                                                <th className="px-4 py-2 text-center font-medium" style={{ width: '5%' }}></th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y">
                                            {values.lines.map((line, index) => (
                                                <tr key={index}>
                                                    <td className="px-4 py-2">
                                                        <Select
                                                            value={line.price_list_id}
                                                            onValueChange={(value) =>
                                                                setLine(
                                                                    index,
                                                                    'price_list_id',
                                                                    value,
                                                                )
                                                            }
                                                        >
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Select service…" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {linePriceLists.map((item) => (
                                                                    <SelectItem
                                                                        key={item.id}
                                                                        value={String(item.id)}
                                                                    >
                                                                        {item.name}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    </td>
                                                    <td className="px-4 py-2">
                                                        <Input
                                                            value={line.unitPrice}
                                                            readOnly
                                                        />
                                                    </td>
                                                    <td className="px-4 py-2 text-center">
                                                        <button
                                                            type="button"
                                                            className="text-muted-foreground hover:text-red-600"
                                                            onClick={() =>
                                                                setValues((current) => ({
                                                                    ...current,
                                                                    lines: current.lines.filter(
                                                                        (_, i) => i !== index,
                                                                    ),
                                                                }))
                                                            }
                                                        >
                                                            ×
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : null}
                        </div>
                    ) : hasLines ? (
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <Label>
                                    {pharmacy
                                        ? 'Drugs'
                                        : 'Vitals'}
                                </Label>
                                <Button
                                    type="button"
                                    size="sm"
                                    variant="secondary"
                                    onClick={() =>
                                        setValues((current) => ({
                                            ...current,
                                            lines: [
                                                ...current.lines,
                                                { ...EMPTY_LINE },
                                            ],
                                        }))
                                    }
                                >
                                    Add line
                                </Button>
                            </div>

                            {values.lines.map((line, index) => (
                                <div
                                    key={index}
                                    className="space-y-3 rounded-md border p-3"
                                >
                                    <SelectNative
                                        value={line.price_list_id}
                                        placeholder="Select drug…"
                                        onChange={(event) =>
                                            setLine(
                                                index,
                                                'price_list_id',
                                                event.target.value,
                                            )
                                        }
                                    >
                                        {linePriceLists.map((item) => (
                                            <option
                                                key={item.id}
                                                value={String(item.id)}
                                            >
                                                {item.name}
                                            </option>
                                        ))}
                                    </SelectNative>

                                    <div className="grid grid-cols-2 gap-3">
                                        {type === 'vital-signs' ? (
                                            <div>
                                                <Label>Results</Label>
                                                <Input
                                                    value={line.results}
                                                    onChange={(event) =>
                                                        setLine(
                                                            index,
                                                            'results',
                                                            event.target.value,
                                                        )
                                                    }
                                                />
                                            </div>
                                        ) : null}

                                        {pharmacy ? (
                                            <>
                                                <div>
                                                    <Label>Frequency</Label>
                                                    <SelectNative
                                                        value={line.frequency}
                                                        onChange={(event) =>
                                                            setLine(
                                                                index,
                                                                'frequency',
                                                                event.target.value,
                                                            )
                                                        }
                                                    >
                                                        <option value="1.00">OD</option>
                                                        <option value="2.00">BID</option>
                                                        <option value="3.00">TID</option>
                                                        <option value="4.00">QID</option>
                                                        <option value="5.00">5x D</option>
                                                    </SelectNative>
                                                </div>
                                                <div>
                                                    <Label>Duration (days)</Label>
                                                    <Input
                                                        type="number"
                                                        value={line.duration}
                                                        onChange={(event) =>
                                                            setLine(
                                                                index,
                                                                'duration',
                                                                event.target
                                                                    .value,
                                                            )
                                                        }
                                                    />
                                                </div>
                                                <div>
                                                    <Label>Dosage (units)</Label>
                                                    <Input
                                                        type="number"
                                                        value={line.dosage}
                                                        onChange={(event) =>
                                                            setLine(
                                                                index,
                                                                'dosage',
                                                                event.target
                                                                    .value,
                                                            )
                                                        }
                                                    />
                                                </div>
                                            </>
                                        ) : null}

                                        <div>
                                            <Label>Price</Label>
                                            <Input
                                                value={line.unitPrice}
                                                readOnly
                                            />
                                        </div>

                                        <div>
                                            <Label>Quantity</Label>
                                            <Input
                                                type="number"
                                                value={line.quantity}
                                                readOnly={pharmacy}
                                                onChange={(event) =>
                                                    setLine(
                                                        index,
                                                        'quantity',
                                                        event.target.value,
                                                    )
                                                }
                                            />
                                        </div>
                                    </div>

                                    {values.lines.length > 1 ? (
                                        <Button
                                            type="button"
                                            size="sm"
                                            variant="outline"
                                            onClick={() =>
                                                setValues((current) => ({
                                                    ...current,
                                                    lines: current.lines.filter(
                                                        (_, i) => i !== index,
                                                    ),
                                                }))
                                            }
                                        >
                                            Remove line
                                        </Button>
                                    ) : null}
                                </div>
                            ))}
                        </div>
                    ) : null}

                    {NOTIFY_TYPES.includes(type) ? (
                        <div className="flex items-center justify-between rounded-md border px-3 py-2">
                            <span className="text-sm text-muted-foreground">
                                Total
                            </span>
                            <span className="text-sm font-semibold tabular-nums">
                                {values.total || '0'}
                            </span>
                        </div>
                    ) : null}
                </div>

                <SheetFooter>
                    <Button
                        variant="secondary"
                        onClick={onClose}
                        disabled={processing}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={() => onSubmit(values)}
                        disabled={processing}
                    >
                        {record ? 'Save changes' : 'Submit'}
                    </Button>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
}
