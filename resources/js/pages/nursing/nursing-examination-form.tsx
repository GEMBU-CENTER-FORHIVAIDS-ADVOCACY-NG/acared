import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import { Textarea } from '@/components/ui/textarea';
import { EXAMINATION_FIELDS } from '@/utils/notes';
import type { ExaminationNotesData } from '@/utils/notes';
import type { ConsultationRecord } from '@/types';

type Props = {
    open: boolean;
    record: ConsultationRecord | null;
    processing: boolean;
    error: string | null;
    onClose: () => void;
    onSubmit: (notes: ExaminationNotesData) => void;
};

const EMPTY_NOTES: ExaminationNotesData = {};
EXAMINATION_FIELDS.forEach((field) => {
    EMPTY_NOTES[field] = '';
});

function parseNotes(
    notes: string | Record<string, unknown>[] | Record<string, unknown> | null | undefined,
): ExaminationNotesData {
    if (typeof notes === 'string') {
        try {
            const parsed = JSON.parse(notes);
            if (typeof parsed === 'object' && parsed !== null) {
                const result: ExaminationNotesData = {};
                EXAMINATION_FIELDS.forEach((field) => {
                    result[field] = String(parsed[field] ?? '');
                });
                return result;
            }
        } catch {
            // Plain string, return empty
        }
    }
    if (typeof notes === 'object' && notes !== null && !Array.isArray(notes)) {
        const result: ExaminationNotesData = {};
        EXAMINATION_FIELDS.forEach((field) => {
            result[field] = String(notes[field] ?? '');
        });
        return result;
    }
    const result: ExaminationNotesData = {};
    EXAMINATION_FIELDS.forEach((field) => {
        result[field] = '';
    });
    return result;
}

function initialValues(record: ConsultationRecord | null): ExaminationNotesData {
    if (!record) {
        return { ...EMPTY_NOTES };
    }
    return parseNotes(record.notes);
}

export function NursingExaminationForm({
    open,
    record,
    processing,
    error,
    onClose,
    onSubmit,
}: Props) {
    const [values, setValues] = useState<ExaminationNotesData>(() =>
        initialValues(record),
    );

    function handleSubmit() {
        onSubmit(values);
    }

    return (
        <Sheet open={open} onOpenChange={(next) => !next && onClose()}>
            <SheetContent className="w-full overflow-y-auto sm:max-w-4xl">
                <SheetHeader>
                    <SheetTitle>
                        {record ? 'Edit' : 'New'} Examination
                    </SheetTitle>
                    <SheetDescription>
                        Records are attached to this maternity visit&apos;s
                        patient.
                    </SheetDescription>
                </SheetHeader>

                <div className="space-y-4 px-4 pb-4">
                    {error ? (
                        <p className="rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700">
                            {error}
                        </p>
                    ) : null}

                    <div className="space-y-3">
                        <Label>General Examination</Label>
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            {EXAMINATION_FIELDS.map((field) => (
                                <div key={field}>
                                    <Label htmlFor={`exam-${field}`}>
                                        {field}
                                    </Label>
                                    <Textarea
                                        id={`exam-${field}`}
                                        rows={2}
                                        value={values[field] ?? ''}
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
                    </div>
                </div>

                <SheetFooter>
                    <Button variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} disabled={processing}>
                        {processing
                            ? 'Saving...'
                            : record
                                ? 'Update'
                                : 'Create'}
                    </Button>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
}
