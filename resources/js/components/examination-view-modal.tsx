import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { parseExaminationNotes } from '@/utils/notes';
import type { ConsultationRecord } from '@/types';

export function ExaminationViewModal({
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
                    <DialogTitle>Examination Details</DialogTitle>
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
                            Examination Notes
                        </p>
                        <div className="mt-2 space-y-1 text-sm">
                            {Object.entries(parseExaminationNotes(record.notes)).map(
                                ([key, value]) => (
                                    <div key={key} className="flex justify-between gap-2">
                                        <span className="text-muted-foreground">{key}:</span>
                                        <span className="text-right">{value || '—'}</span>
                                    </div>
                                ),
                            )}
                            {Object.keys(parseExaminationNotes(record.notes)).length === 0 && (
                                <p className="text-muted-foreground">—</p>
                            )}
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
