import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import type { ConsultationRecord } from '@/types';

export function ComplaintViewModal({
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
                    <DialogTitle>Complaint Details</DialogTitle>
                    <DialogDescription>
                        Recorded by {recordedBy} on{' '}
                        {record.recordedAt
                            ? new Date(record.recordedAt).toLocaleString()
                            : '—'}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">
                            Complaint
                        </p>
                        <p className="mt-1 text-sm whitespace-pre-line">
                            {record.notes_en
                                ?? (typeof record.notes === 'string'
                                    ? record.notes
                                    : '')
                                ?? '—'}
                        </p>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
