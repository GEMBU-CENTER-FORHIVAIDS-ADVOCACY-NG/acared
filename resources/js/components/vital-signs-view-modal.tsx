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

                <div className="space-y-3">
                    {(record.lines ?? []).map((line) => (
                        <div
                            key={line.id}
                            className="rounded-md border p-3"
                        >
                            <p className="text-sm font-medium">
                                {line.price_list?.name ?? line.price_list_id ?? '—'}
                            </p>
                            <p className="text-sm text-muted-foreground">
                                Result: {line.results ?? '—'}
                            </p>
                        </div>
                    ))}

                    {record.lines?.length === 0 ? (
                        <p className="py-4 text-center text-muted-foreground">
                            No vital sign data available.
                        </p>
                    ) : null}
                </div>
            </DialogContent>
        </Dialog>
    );
}
