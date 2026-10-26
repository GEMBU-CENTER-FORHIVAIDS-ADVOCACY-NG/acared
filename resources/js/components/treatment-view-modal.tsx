import { Badge } from '@/components/ui/badge';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { notesToString } from '@/utils/notes';
import type { ConsultationRecord } from '@/types';

export function TreatmentViewModal({
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
                    <DialogTitle>Treatment Details</DialogTitle>
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

                <div className="space-y-4">
                    {record.notes ? (
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">
                                Notes
                            </p>
                            <p className="mt-1 text-sm whitespace-pre-line">
                                {notesToString(record.notes) || '—'}
                            </p>
                        </div>
                    ) : null}

                    <div>
                        <p className="text-sm font-medium text-muted-foreground">
                            Requested Items
                        </p>
                        <div className="mt-2 space-y-3">
                            {(record.lines ?? []).map((line) => (
                                <div
                                    key={line.id}
                                    className="rounded-md border p-3"
                                >
                                    <p className="text-sm font-medium">
                                        {line.price_list?.name ?? '—'}
                                    </p>
                                    <div className="mt-1 flex flex-wrap gap-3 text-sm text-muted-foreground">
                                        {line.quantity ? (
                                            <span>Qty: {line.quantity}</span>
                                        ) : null}
                                        {line.frequency ? (
                                            <span>Frequency: {line.frequency}</span>
                                        ) : null}
                                        {line.duration ? (
                                            <span>Duration: {line.duration}</span>
                                        ) : null}
                                        {line.dosage ? (
                                            <span>Dosage: {line.dosage}</span>
                                        ) : null}
                                    </div>
                                </div>
                            ))}

                            {record.lines?.length === 0 ? (
                                <p className="py-4 text-center text-muted-foreground">
                                    No treatment items requested.
                                </p>
                            ) : null}
                        </div>
                    </div>

                    {record.total !== undefined && record.total !== null ? (
                        <p className="text-sm font-semibold">
                            Total: {Number(record.total).toLocaleString()}
                        </p>
                    ) : null}
                </div>
            </DialogContent>
        </Dialog>
    );
}
