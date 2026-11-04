import { Badge } from '@/components/ui/badge';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import type { ConsultationRecord } from '@/types';

const FREQUENCY_LABELS: Record<string, string> = {
    '1': 'OD',
    '2': 'BID',
    '3': 'TID',
    '4': 'QID',
    '5': '5x D',
    '1.00': 'OD',
    '2.00': 'BID',
    '3.00': 'TID',
    '4.00': 'QID',
    '5.00': '5x D',
    '1.0': 'OD',
    '2.0': 'BID',
    '3.0': 'TID',
    '4.0': 'QID',
    '5.0': '5x D',
};

function frequencyLabel(value: string | number | null | undefined): string {
    if (value == null || value === '') return '—';
    const num = typeof value === 'string' ? parseFloat(value) : Number(value);
    if (num == null || isNaN(num)) return String(value);
    const str = String(Math.round(num));
    return FREQUENCY_LABELS[str] ?? str;
}

export function PrescriptionViewModal({
    record,
    open,
    onOpenChange,
    currencySymbol,
}: {
    record: ConsultationRecord | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    currencySymbol: string;
}) {
    if (!record) {
        return null;
    }

    const recordedBy = record.recordedByName ?? '—';

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-5xl">
                <DialogHeader>
                    <DialogTitle>Prescription Details</DialogTitle>
                    <DialogDescription>
                        Recorded by {recordedBy} on{' '}
                        {record.recordedAt
                            ? new Date(record.recordedAt).toLocaleString()
                            : '—'}
                    </DialogDescription>
                </DialogHeader>

                {record.status ? (
                    <div className="mb-4">
                        <Badge className="bg-muted text-muted-foreground">
                            {record.status}
                        </Badge>
                    </div>
                ) : null}

                {record.lines && record.lines.length > 0 ? (
                    <div className="rounded-lg border">
                        <table className="w-full text-sm">
                            <thead className="bg-muted/50">
                                <tr>
                                    <th className="px-3 py-2 text-left font-medium min-w-[300px]">
                                        Drug
                                    </th>
                                    <th className="px-3 py-2 text-left font-medium">
                                        Frequency
                                    </th>
                                    <th className="px-3 py-2 text-left font-medium">
                                        Duration
                                    </th>
                                    <th className="px-3 py-2 text-left font-medium">
                                        Dosage
                                    </th>
                                    <th className="px-3 py-2 text-left font-medium">
                                        Comment
                                    </th>
                                    <th className="px-3 py-2 text-left font-medium">
                                        Price
                                    </th>
                                    <th className="px-3 py-2 text-left font-medium">
                                        Qty
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {record.lines.map((line) => (
                                    <tr key={line.id}>
                                        <td className="px-3 py-2 min-w-[300px]">
                                            {line.price_list?.name ?? '—'}
                                        </td>
                                        <td className="px-3 py-2">
                                            {frequencyLabel(line.frequency)}
                                        </td>
                                        <td className="px-3 py-2">
                                            {line.duration != null && line.duration !== ''
                                                ? Number(line.duration).toLocaleString()
                                                : '—'}
                                        </td>
                                        <td className="px-3 py-2">
                                            {line.dosage != null && line.dosage !== ''
                                                ? Number(line.dosage).toLocaleString()
                                                : '—'}
                                        </td>
                                        <td className="px-3 py-2">
                                            {line.comment ?? '—'}
                                        </td>
                                        <td className="px-3 py-2 tabular-nums">
                                            {line.unitPrice
                                                ? currencySymbol +
                                                  Number(line.unitPrice).toLocaleString()
                                                : '—'}
                                        </td>
                                        <td className="px-3 py-2 tabular-nums">
                                            {line.quantity ?? '—'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                            {record.total !== undefined && record.total !== null ? (
                                <tfoot className="bg-muted/50 font-semibold">
                                    <tr>
                                        <td
                                            className="px-3 py-2 text-right text-sm"
                                            colSpan={5}
                                        >
                                            Total:
                                        </td>
                                        <td className="px-3 py-2 text-sm tabular-nums">
                                            {currencySymbol}
                                            {Number(record.total).toLocaleString()}
                                        </td>
                                        <td className="px-3 py-2"></td>
                                    </tr>
                                </tfoot>
                            ) : null}
                        </table>
                    </div>
                ) : (
                    <p className="py-4 text-center text-muted-foreground">
                        No prescription data available.
                    </p>
                )}
            </DialogContent>
        </Dialog>
    );
}
