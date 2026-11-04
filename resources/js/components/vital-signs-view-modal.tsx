import { Badge } from '@/components/ui/badge';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import type { ConsultationRecord } from '@/types';

export function VitalSignsViewModal({
    record,
    open,
    onOpenChange,
}: {
    record: ConsultationRecord | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}) {
    if (!record) {
        return null;
    }

    const recordedBy = record.recordedByName ?? '—';

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-xl">
                <DialogHeader>
                    <DialogTitle>Vital Signs Details</DialogTitle>
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

                {record.lines?.length === 0 ? (
                    <p className="py-4 text-center text-muted-foreground">
                        No vital sign data available.
                    </p>
                ) : (
                    <div className="max-h-96 overflow-y-auto rounded-md border">
                        <table className="w-full text-sm">
                            <thead className="sticky top-0 bg-muted/50">
                                <tr>
                                    <th className="px-4 py-2 text-left font-medium">
                                        Vital Sign
                                    </th>
                                    <th className="px-4 py-2 text-left font-medium">
                                        Result
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {(record.lines ?? []).map((line) => (
                                    <tr
                                        key={line.id}
                                        className="border-t border-border"
                                    >
                                        <td className="px-4 py-2">
                                            {line.price_list?.name ?? line.price_list_id ?? '—'}
                                        </td>
                                        <td className="px-4 py-2 text-muted-foreground">
                                            {line.results ?? '—'}
                                            {line.price_list?.uom
                                                ? ` ${line.price_list.uom}`
                                                : ''}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
