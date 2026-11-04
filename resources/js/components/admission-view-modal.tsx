import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { notesToString } from '@/utils/notes';
import type { ConsultationRecord } from '@/types';

export function AdmissionViewModal({
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
                    <DialogTitle>Admission Details</DialogTitle>
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
                            Notes
                        </p>
                        <p className="mt-1 text-sm whitespace-pre-line">
                            {notesToString(record.notes) || '—'}
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <p className="text-muted-foreground">Ward</p>
                            <p className="mt-1 font-medium">
                                {record.ward?.name ?? '—'}
                            </p>
                        </div>
                        <div>
                            <p className="text-muted-foreground">Duration</p>
                            <p className="mt-1 font-medium">
                                {record.duration ?? 0} day(s)
                            </p>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
