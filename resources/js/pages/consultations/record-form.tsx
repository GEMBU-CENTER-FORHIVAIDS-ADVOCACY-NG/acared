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
    comment: '',
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
                ? record.lines.map((line: ConsultationLine) => {
                      const freq = line.frequency ?? '';
                      return {
                          price_list_id: String(line.price_list_id),
                          unitPrice: String(line.unitPrice ?? ''),
                          quantity: String(line.quantity ?? '1'),
                          results: line.results ?? '',
                          frequency: freq !== '' ? Number(freq).toFixed(2) : '',
                          duration: line.duration ?? '',
                          dosage: line.dosage ?? '',
                          comment: line.comment ?? '',
                      };
                  })
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
                const freq = Number(lines[index].frequency || 1);
                const dur = Number(lines[index].duration || 0);
                const dose = Number(lines[index].dosage || 0);
                if (dur > 0 && dose > 0) {
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
            <SheetContent className="w-full overflow-y-auto sm:max-w-4xl">
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
                            <Label>Tests</Label>

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
                    ) : type === 'treatments' ? (
                        <div className="space-y-3">
                            {values.lines.length > 0 ? (
                                <>
                                    <div className="rounded-lg border">
                                        <table className="w-full text-sm">
                                            <thead className="bg-muted/50">
                                                <tr>
                                                    <th className="px-4 py-2 text-left font-medium" style={{ width: '50%' }}>
                                                        Service
                                                    </th>
                                                    <th className="px-4 py-2 text-left font-medium" style={{ width: '15%' }}>
                                                        Price
                                                    </th>
                                                    <th className="px-4 py-2 text-left font-medium" style={{ width: '15%' }}>
                                                        Qty
                                                    </th>
                                                    <th className="px-4 py-2 text-left font-medium" style={{ width: '15%' }}>
                                                        Total
                                                    </th>
                                                    <th className="px-4 py-2 text-center font-medium" style={{ width: '5%' }}></th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y">
                                                {values.lines.map((line, index) => {
                                                    const lineTotal = Number(line.quantity || 0) * Number(line.unitPrice || 0);
                                                    return (
                                                        <tr key={index}>
                                                            <td className="px-4 py-2">
                                                                <SelectNative
                                                                    value={line.price_list_id}
                                                                    placeholder="Select service…"
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
                                                            <td className="px-4 py-2">
                                                                <Input
                                                                    type="number"
                                                                    min="1"
                                                                    value={line.quantity}
                                                                    onChange={(event) =>
                                                                        setLine(
                                                                            index,
                                                                            'quantity',
                                                                            event.target.value,
                                                                        )
                                                                    }
                                                                />
                                                            </td>
                                                            <td className="px-4 py-2">
                                                                <span className="text-sm">
                                                                    {lineTotal.toLocaleString()}
                                                                </span>
                                                            </td>
                                                            <td className="px-4 py-2 text-center">
                                                                {values.lines.length > 1 ? (
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
                                                                ) : null}
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>

                                    <div className="flex items-center justify-between">
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
                                        <div className="text-right">
                                            <p className="text-sm font-medium text-muted-foreground">
                                                Total
                                            </p>
                                            <p className="text-lg font-bold">
                                                {Number(values.total).toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                </>
                            ) : (
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
                            )}
                        </div>
                    ) : hasLines ? (
                        <div className="space-y-3">
                            {values.lines.length > 0 ? (
                                <div className="rounded-lg border">
                                    <table className="w-full text-sm">
                                        <thead className="bg-muted/50">
                                            <tr>
                                                <th className="px-3 py-2 text-left font-medium min-w-[300px]">
                                                    {pharmacy ? 'Drug' : 'Vital'}
                                                </th>
                                                {pharmacy ? (
                                                    <>
                                                        <th className="px-3 py-2 text-left font-medium">
                                                            Frequency
                                                        </th>
                                                        <th className="px-3 py-2 text-left font-medium">
                                                            Duration
                                                        </th>
                                                        <th className="px-3 py-2 text-left font-medium">
                                                            Dosage
                                                        </th>
                                                    </>
                                                ) : null}
                                                {type === 'vital-signs' ? (
                                                    <th className="px-3 py-2 text-left font-medium">
                                                        Results
                                                    </th>
                                                ) : null}
                                                <th className="px-3 py-2 text-left font-medium">
                                                    Price
                                                </th>
                                                <th className="px-3 py-2 text-left font-medium">
                                                    Quantity
                                                </th>
                                                <th className="px-3 py-2 text-center font-medium"></th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y">
                                            {values.lines.map((line, index) => (
                                                <>
                                                    <tr key={index}>
                                                        <td className="px-3 py-2 min-w-[300px]">
                                                            <SelectNative
                                                                value={line.price_list_id}
                                                                placeholder={pharmacy ? 'Select drug…' : 'Select vital…'}
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
                                                        {pharmacy ? (
                                                            <>
                                                                <td className="px-3 py-2">
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
                                                                </td>
                                                                <td className="px-3 py-2">
                                                                    <Input
                                                                        type="number"
                                                                        value={line.duration}
                                                                        onChange={(event) =>
                                                                            setLine(
                                                                                index,
                                                                                'duration',
                                                                                event.target.value,
                                                                            )
                                                                        }
                                                                    />
                                                                </td>
                                                                <td className="px-3 py-2">
                                                                    <Input
                                                                        type="number"
                                                                        value={line.dosage}
                                                                        onChange={(event) =>
                                                                            setLine(
                                                                                index,
                                                                                'dosage',
                                                                                event.target.value,
                                                                            )
                                                                        }
                                                                    />
                                                                </td>
                                                            </>
                                                        ) : null}
                                                        {type === 'vital-signs' ? (
                                                            <td className="px-3 py-2">
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
                                                            </td>
                                                        ) : null}
                                                        <td className="px-3 py-2">
                                                            <Input
                                                                value={line.unitPrice}
                                                                readOnly
                                                            />
                                                        </td>
                                                        <td className="px-3 py-2">
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
                                                        </td>
                                                        <td className="px-3 py-2 text-center">
                                                            {values.lines.length > 1 ? (
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
                                                            ) : null}
                                                        </td>
                                                    </tr>
                                                    {pharmacy ? (
                                                        <tr key={`${index}-comment`}>
                                                            <td colSpan={8} className="px-3 py-2">
                                                                <Input
                                                                    value={line.comment}
                                                                    onChange={(event) =>
                                                                        setLine(
                                                                            index,
                                                                            'comment',
                                                                            event.target.value,
                                                                        )
                                                                    }
                                                                    placeholder="Doctor's note…"
                                                                />
                                                            </td>
                                                        </tr>
                                                    ) : null}
                                                </>
                                            ))}
                                        </tbody>
                                        <tfoot className="bg-muted/50 font-semibold">
                                            <tr>
                                                <td
                                                    className="px-3 py-2 text-right text-sm"
                                                    colSpan={pharmacy ? 4 : (type === 'vital-signs' ? 2 : 1)}
                                                >
                                                    Total:
                                                </td>
                                                <td className="px-3 py-2 text-sm tabular-nums">
                                                    {Number(values.total || 0).toLocaleString()}
                                                </td>
                                                <td colSpan={2}></td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>
                            ) : null}

                            <div className="flex items-center justify-between gap-2">
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
                                    {pharmacy ? 'Add Drugs' : 'Add line'}
                                </Button>
                            </div>
                        </div>
                    ) : null}
                </div>

                <SheetFooter className="flex-row gap-2">
                    <Button
                        className="flex-1"
                        variant="secondary"
                        onClick={onClose}
                        disabled={processing}
                    >
                        Cancel
                    </Button>
                    <Button
                        className="flex-1"
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
