import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import LabResultInfolist from '@/components/lab-result-infolist';
import type { LaboratoryShow, LabResultForm } from '@/types';

const EMPTY_FORM: LabResultForm = {
    steps: [],
    hasPending: false,
    inventoryItems: [],
};

export function LaboratoryViewModal({
    laboratoryId,
    teamSlug,
    open,
    onOpenChange,
}: {
    laboratoryId: number | null;
    teamSlug: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}) {
    const [laboratory, setLaboratory] = useState<LaboratoryShow | null>(null);
    const [resultForm, setResultForm] = useState<LabResultForm>(EMPTY_FORM);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!open || !laboratoryId) {
            setLaboratory(null);
            setResultForm(EMPTY_FORM);
            setError(null);
            return;
        }

        setLoading(true);
        setError(null);

        fetch(`/${teamSlug}/laboratories/${laboratoryId}/json`, {
            headers: {
                'X-Requested-With': 'XMLHttpRequest',
            },
        })
            .then((res) => {
                if (!res.ok) throw new Error('Failed to load laboratory results.');
                return res.json();
            })
            .then((data) => {
                setLaboratory(data.laboratory);
                setResultForm(data.resultForm);
            })
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false));
    }, [open, laboratoryId]);

    if (!open) {
        return null;
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-4xl">
                <DialogHeader>
                    <DialogTitle>Laboratory Result</DialogTitle>
                    {laboratory ? (
                        <DialogDescription>
                            {laboratory.patientName ?? '—'} · Lab #{laboratory.id}
                        </DialogDescription>
                    ) : null}
                </DialogHeader>

                {error ? (
                    <p className="py-6 text-center text-sm text-destructive">{error}</p>
                ) : loading ? (
                    <p className="py-6 text-center text-sm text-muted-foreground">
                        Loading results...
                    </p>
                ) : laboratory ? (
                    <div className="space-y-4">
                        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                            {[
                                ['Hospital No.', laboratory.patientId],
                                ['Patient', laboratory.patientName ?? '—'],
                                ['Doctor', laboratory.doctorName ?? '—'],
                                [
                                    'Created',
                                    laboratory.createdAt
                                        ? new Date(laboratory.createdAt).toLocaleString()
                                        : '—',
                                ],
                            ].map(([label, value]) => (
                                <div key={String(label)}>
                                    <p className="text-xs text-muted-foreground">
                                        {label}
                                    </p>
                                    <p className="text-sm font-medium">{value}</p>
                                </div>
                            ))}
                        </div>

                        <div className="flex items-center justify-between">
                            <h3 className="text-base font-semibold">Results</h3>
                            <Badge variant="secondary" className="capitalize">
                                {laboratory.status}
                            </Badge>
                        </div>

                        <LabResultInfolist form={resultForm} />
                    </div>
                ) : null}
            </DialogContent>
        </Dialog>
    );
}
