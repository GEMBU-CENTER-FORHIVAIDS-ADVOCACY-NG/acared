import { Badge } from '@/components/ui/badge';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Table,
    TableBody,
    TableCell,
    TableFooter,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
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
                        <div className="mt-2 max-h-96 overflow-y-auto rounded-md border">
                            <Table>
                                <TableHeader className="sticky top-0 bg-muted/50">
                                    <TableRow>
                                        <TableHead>Treatment</TableHead>
                                        <TableHead>Qty</TableHead>
                                        <TableHead>Price</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {(record.lines ?? []).map((line) => (
                                        <TableRow key={line.id}>
                                            <TableCell className="text-sm font-medium">
                                                {line.price_list?.name ?? '—'}
                                            </TableCell>
                                            <TableCell className="text-sm">
                                                {line.quantity ?? '—'}
                                            </TableCell>
                                            <TableCell className="text-sm">
                                                {line.price_list?.price !== undefined && line.price_list?.price !== null
                                                    ? Number(line.price_list.price).toLocaleString()
                                                    : '—'}
                                            </TableCell>
                                        </TableRow>
                                    ))}

                                    {record.lines?.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={3} className="text-center text-muted-foreground">
                                                No treatment items requested.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>

                                {(record.lines ?? []).length > 0 && (
                                    <TableFooter>
                                        <TableRow>
                                            <TableCell colSpan={2} className="text-right font-medium">
                                                Total
                                            </TableCell>
                                            <TableCell className="font-semibold">
                                                {(record.lines ?? []).reduce(
                                                    (sum, line) =>
                                                        sum +
                                                        (Number(line.price_list?.price || 0) *
                                                            Number(line.quantity || 0)),
                                                    0,
                                                ).toLocaleString()}
                                            </TableCell>
                                        </TableRow>
                                    </TableFooter>
                                )}
                            </Table>
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
