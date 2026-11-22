import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import AlertError from '@/components/alert-error';
import ConfirmDialog from '@/components/confirm-dialog';
import Heading from '@/components/heading';
import Pagination from '@/components/pagination';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { home } from '@/routes';
import { history, index as recordsIndex, view } from '@/routes/nursing/records';
import { destroy, store, update } from '@/routes/nursing/records/histories';
import type { Team } from '@/types';

type FamilyHistoryItem = {
    status: 'yes' | 'no' | 'others' | null;
    others: string | null;
};

type HistoryItem = {
    id: number;
    familyHistory: Record<string, FamilyHistoryItem>;
    socialHistory: string | null;
    surgicalHistory: Record<string, FamilyHistoryItem>;
    nurseName: string | null;
    canEdit: number;
    createdAt: string | null;
};

type Paginator = {
    data: HistoryItem[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
};

type Nursing = {
    id: number;
    patientId: string;
    patientName: string | null;
    purpose: string | null;
    status: string;
};

const FAMILY_HISTORY_FIELDS = [
    { key: 'hypertension', label: 'Hypertension' },
    { key: 'sickle_cell', label: 'Sickle Cell' },
    { key: 'tuberculosis', label: 'Tuberculosis' },
    { key: 'diabetes', label: 'Diabetes' },
    { key: 'pud', label: 'PUD' },
];

const SURGICAL_HISTORY_FIELDS = [
    { key: 'myomectomy', label: 'Myomectomy' },
    { key: 'cs', label: 'Caesarean Section' },
    { key: 'mastectomy', label: 'Mastectomy' },
    { key: 'hysterectomy', label: 'Hysterectomy' },
    { key: 'blood_transfusion', label: 'Blood Transfusion' },
];

function emptyFamilyHistory(): Record<string, FamilyHistoryItem> {
    const result: Record<string, FamilyHistoryItem> = {};
    FAMILY_HISTORY_FIELDS.forEach((field) => {
        result[field.key] = { status: null, others: null };
    });
    return result;
}

function emptySurgicalHistory(): Record<string, FamilyHistoryItem> {
    const result: Record<string, FamilyHistoryItem> = {};
    SURGICAL_HISTORY_FIELDS.forEach((field) => {
        result[field.key] = { status: null, others: null };
    });
    return result;
}

type Form = {
    familyHistory: Record<string, FamilyHistoryItem>;
    socialHistory: string;
    surgicalHistory: Record<string, FamilyHistoryItem>;
};

const emptyForm: Form = {
    familyHistory: emptyFamilyHistory(),
    socialHistory: '',
    surgicalHistory: emptySurgicalHistory(),
};

export default function NursingRecordsHistory({
    nursing,
    histories,
}: {
    nursing: Nursing;
    histories: Paginator;
}) {
    const { currentTeam } = usePage().props;
    const teamSlug = currentTeam?.slug ?? '';

    const [formOpen, setFormOpen] = useState(false);
    const [editId, setEditId] = useState<number | null>(null);
    const [form, setForm] = useState<Form>(emptyForm);
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [historyToDelete, setHistoryToDelete] = useState<HistoryItem | null>(
        null,
    );
    const [deleteProcessing, setDeleteProcessing] = useState(false);
    const [deleteError, setDeleteError] = useState<string | null>(null);

    const startCreate = () => {
        setEditId(null);
        setForm(emptyForm);
        setError(null);
        setFormOpen(true);
    };

    const startEdit = (item: HistoryItem) => {
        setEditId(item.id);
        setForm({
            familyHistory: JSON.parse(JSON.stringify(item.familyHistory)),
            socialHistory: item.socialHistory ?? '',
            surgicalHistory: JSON.parse(JSON.stringify(item.surgicalHistory)),
        });
        setError(null);
        setFormOpen(true);
    };

    const submit = (event: React.FormEvent) => {
        event.preventDefault();
        setProcessing(true);
        setError(null);

        const payload = {
            family_history: form.familyHistory,
            social_history: form.socialHistory || null,
            surgical_history: form.surgicalHistory,
        };

        const opts = {
            preserveScroll: true,
            onError: (errors: Record<string, string>) =>
                setError(Object.values(errors)[0] ?? 'Something went wrong.'),
            onSuccess: () => {
                setFormOpen(false);
                setEditId(null);
            },
            onFinish: () => setProcessing(false),
        };

        if (editId) {
            router.patch(
                update.url({
                    current_team: teamSlug,
                    nursing: nursing.id,
                    history: editId,
                }),
                payload,
                opts,
            );
        } else {
            router.post(
                store.url({
                    current_team: teamSlug,
                    nursing: nursing.id,
                }),
                payload,
                opts,
            );
        }
    };

    const deleteHistory = (item: HistoryItem) => {
        setDeleteError(null);
        setHistoryToDelete(item);
    };

    const confirmDeleteHistory = () => {
        if (!historyToDelete) {
            return;
        }

        setDeleteProcessing(true);
        setDeleteError(null);

        router.delete(
            destroy.url({
                current_team: teamSlug,
                nursing: nursing.id,
                history: historyToDelete.id,
            }),
            {
                preserveScroll: true,
                onError: (errors: Record<string, string>) =>
                    setDeleteError(
                        Object.values(errors)[0] ?? 'Something went wrong.',
                    ),
                onSuccess: () => setHistoryToDelete(null),
                onFinish: () => setDeleteProcessing(false),
            },
        );
    };

    const updateFamilyHistory = (
        key: string,
        field: 'status' | 'others',
        value: string | null,
    ) => {
        setForm((prev) => ({
            ...prev,
            familyHistory: {
                ...prev.familyHistory,
                [key]: { ...prev.familyHistory[key], [field]: value },
            },
        }));
    };

    const updateSurgicalHistory = (
        key: string,
        field: 'status' | 'others',
        value: string | null,
    ) => {
        setForm((prev) => ({
            ...prev,
            surgicalHistory: {
                ...prev.surgicalHistory,
                [key]: { ...prev.surgicalHistory[key], [field]: value },
            },
        }));
    };

    const renderStatusBadge = (status: string | null) => {
        if (!status) return '—';
        if (status === 'yes')
            return (
                <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300">
                    Yes
                </Badge>
            );
        if (status === 'no')
            return <Badge className="bg-muted text-muted-foreground">No</Badge>;
        return (
            <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300">
                Others
            </Badge>
        );
    };

    return (
        <>
            <Head title={`${nursing.patientId} — History`} />

            <div className="flex w-full flex-col space-y-6 p-4 md:p-6 lg:p-8">
                {deleteError ? <AlertError errors={[deleteError]} /> : null}

                <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                        <Heading
                            variant="small"
                            title={`${nursing.patientId} - ${nursing.patientName ?? 'Unknown patient'}`}
                            description="Maternity history records including family, social, and surgical history."
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" asChild>
                            <Link
                                href={view.url({
                                    current_team: teamSlug,
                                    nursing: nursing.id,
                                })}
                            >
                                Back to visit
                            </Link>
                        </Button>
                        <Button onClick={startCreate}>New history</Button>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>History records</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {histories.data.length === 0 ? (
                            <p className="py-8 text-center text-muted-foreground">
                                No history records yet.
                            </p>
                        ) : (
                            <div className="space-y-6">
                                {histories.data.map((item) => (
                                    <div
                                        key={item.id}
                                        className="space-y-4 rounded-lg border p-4"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-medium">
                                                    {item.nurseName ??
                                                        'Unknown nurse'}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {item.createdAt
                                                        ? new Date(
                                                              item.createdAt,
                                                          ).toLocaleString()
                                                        : ''}
                                                </p>
                                            </div>
                                            {item.canEdit ? (
                                                <div className="flex items-center gap-2">
                                                    <Button
                                                        size="sm"
                                                        variant="secondary"
                                                        onClick={() =>
                                                            startEdit(item)
                                                        }
                                                    >
                                                        Edit
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="destructive"
                                                        disabled={
                                                            deleteProcessing
                                                        }
                                                        onClick={() =>
                                                            deleteHistory(item)
                                                        }
                                                    >
                                                        Delete
                                                    </Button>
                                                </div>
                                            ) : null}
                                        </div>

                                        <div className="grid gap-4 md:grid-cols-2">
                                            <div>
                                                <h4 className="mb-2 text-sm font-semibold">
                                                    Family History
                                                </h4>
                                                <div className="space-y-1">
                                                    {FAMILY_HISTORY_FIELDS.map(
                                                        (field) => {
                                                            const value =
                                                                item
                                                                    .familyHistory[
                                                                    field.key
                                                                ];
                                                            return (
                                                                <div
                                                                    key={
                                                                        field.key
                                                                    }
                                                                    className="flex items-center justify-between text-sm"
                                                                >
                                                                    <span className="text-muted-foreground">
                                                                        {
                                                                            field.label
                                                                        }
                                                                    </span>
                                                                    <div className="flex items-center gap-2">
                                                                        {renderStatusBadge(
                                                                            value?.status ??
                                                                                null,
                                                                        )}
                                                                        {value?.status ===
                                                                            'others' &&
                                                                            value.others && (
                                                                                <span className="text-xs text-muted-foreground">
                                                                                    (
                                                                                    {
                                                                                        value.others
                                                                                    }
                                                                                    )
                                                                                </span>
                                                                            )}
                                                                    </div>
                                                                </div>
                                                            );
                                                        },
                                                    )}
                                                </div>
                                            </div>

                                            <div>
                                                <h4 className="mb-2 text-sm font-semibold">
                                                    Surgical History
                                                </h4>
                                                <div className="space-y-1">
                                                    {SURGICAL_HISTORY_FIELDS.map(
                                                        (field) => {
                                                            const value =
                                                                item
                                                                    .surgicalHistory[
                                                                    field.key
                                                                ];
                                                            return (
                                                                <div
                                                                    key={
                                                                        field.key
                                                                    }
                                                                    className="flex items-center justify-between text-sm"
                                                                >
                                                                    <span className="text-muted-foreground">
                                                                        {
                                                                            field.label
                                                                        }
                                                                    </span>
                                                                    {renderStatusBadge(
                                                                        value?.status ??
                                                                            null,
                                                                    )}
                                                                </div>
                                                            );
                                                        },
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {item.socialHistory && (
                                            <div>
                                                <h4 className="mb-1 text-sm font-semibold">
                                                    Social History
                                                </h4>
                                                <p className="text-sm whitespace-pre-line">
                                                    {item.socialHistory}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Pagination
                    meta={{
                        currentPage: histories.current_page,
                        lastPage: histories.last_page,
                        perPage: histories.per_page,
                        total: histories.total,
                    }}
                    onPageChange={(page) => {
                        router.get(
                            '',
                            { page },
                            {
                                preserveState: true,
                                preserveScroll: true,
                                replace: true,
                            },
                        );
                    }}
                    onPerPageChange={(perPage) => {
                        router.get(
                            '',
                            { page: 1, perPage },
                            {
                                preserveState: true,
                                preserveScroll: true,
                                replace: true,
                            },
                        );
                    }}
                />
            </div>

            {formOpen && (
                <div
                    className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4"
                    role="dialog"
                    aria-modal="true"
                    onClick={(event) => {
                        if (
                            event.target === event.currentTarget &&
                            !processing
                        ) {
                            setFormOpen(false);
                            setEditId(null);
                        }
                    }}
                >
                    <form
                        onSubmit={submit}
                        className="max-h-[90vh] w-full max-w-2xl space-y-4 overflow-y-auto rounded-lg bg-background p-6 shadow-xl"
                    >
                        <div>
                            <h2 className="text-lg font-semibold">
                                {editId ? 'Edit' : 'New'} history record
                            </h2>
                            <p className="text-sm text-muted-foreground">
                                Record family, social, and surgical history for
                                this patient.
                            </p>
                        </div>

                        {error ? <AlertError errors={[error]} /> : null}

                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-base">
                                    Family History
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {FAMILY_HISTORY_FIELDS.map((field) => (
                                    <div
                                        key={field.key}
                                        className="flex flex-col gap-2 rounded-md border p-3"
                                    >
                                        <Label className="text-sm font-medium">
                                            {field.label}
                                        </Label>
                                        <div className="flex flex-wrap items-center gap-2">
                                            <Select
                                                value={
                                                    form.familyHistory[
                                                        field.key
                                                    ]?.status ?? ''
                                                }
                                                onValueChange={(value) =>
                                                    updateFamilyHistory(
                                                        field.key,
                                                        'status',
                                                        value as
                                                            | 'yes'
                                                            | 'no'
                                                            | 'others',
                                                    )
                                                }
                                            >
                                                <SelectTrigger
                                                    aria-label={`${field.label} status`}
                                                    className="w-32"
                                                >
                                                    <SelectValue placeholder="Select" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="yes">
                                                        Yes
                                                    </SelectItem>
                                                    <SelectItem value="no">
                                                        No
                                                    </SelectItem>
                                                    <SelectItem value="others">
                                                        Others
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                            {form.familyHistory[field.key]
                                                ?.status === 'others' && (
                                                <input
                                                    type="text"
                                                    aria-label={`Specify ${field.label}`}
                                                    className="flex h-9 w-48 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
                                                    placeholder="Specify"
                                                    value={
                                                        form.familyHistory[
                                                            field.key
                                                        ]?.others ?? ''
                                                    }
                                                    onChange={(e) =>
                                                        updateFamilyHistory(
                                                            field.key,
                                                            'others',
                                                            e.target.value ||
                                                                null,
                                                        )
                                                    }
                                                />
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-base">
                                    Surgical History
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {SURGICAL_HISTORY_FIELDS.map((field) => (
                                    <div
                                        key={field.key}
                                        className="flex flex-col gap-2 rounded-md border p-3"
                                    >
                                        <Label className="text-sm font-medium">
                                            {field.label}
                                        </Label>
                                        <Select
                                            value={
                                                form.surgicalHistory[field.key]
                                                    ?.status ?? ''
                                            }
                                            onValueChange={(value) =>
                                                updateSurgicalHistory(
                                                    field.key,
                                                    'status',
                                                    value as
                                                        | 'yes'
                                                        | 'no'
                                                        | 'others',
                                                )
                                            }
                                        >
                                            <SelectTrigger
                                                aria-label={`${field.label} status`}
                                                className="w-32"
                                            >
                                                <SelectValue placeholder="Select" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="yes">
                                                    Yes
                                                </SelectItem>
                                                <SelectItem value="no">
                                                    No
                                                </SelectItem>
                                                <SelectItem value="others">
                                                    Others
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-base">
                                    Social History
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Textarea
                                    aria-label="Social history notes"
                                    value={form.socialHistory}
                                    onChange={(e) =>
                                        setForm((prev) => ({
                                            ...prev,
                                            socialHistory: e.target.value,
                                        }))
                                    }
                                    placeholder="Enter social history notes..."
                                    rows={4}
                                />
                            </CardContent>
                        </Card>

                        <div className="flex justify-end gap-2">
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={() => {
                                    setFormOpen(false);
                                    setEditId(null);
                                }}
                                disabled={processing}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={processing}>
                                {processing ? 'Saving...' : 'Save history'}
                            </Button>
                        </div>
                    </form>
                </div>
            )}

            <ConfirmDialog
                open={historyToDelete !== null}
                onOpenChange={(open) => {
                    if (!open && !deleteProcessing) {
                        setHistoryToDelete(null);
                    }
                }}
                title="Delete history record"
                description={`Delete the history record created by ${historyToDelete?.nurseName ?? 'this nurse'}? This cannot be undone.`}
                confirmLabel={deleteProcessing ? 'Deleting...' : 'Delete'}
                destructive
                processing={deleteProcessing}
                onConfirm={confirmDeleteHistory}
            />
        </>
    );
}

NursingRecordsHistory.layout = (props: { currentTeam?: Team | null }) => ({
    breadcrumbs: [
        {
            title: 'Maternity',
            href: props.currentTeam
                ? recordsIndex.url(props.currentTeam.slug)
                : home.url(),
        },
        {
            title: 'History',
            href: props.currentTeam
                ? history.url(props.currentTeam.slug)
                : history.url(''),
        },
    ],
});
