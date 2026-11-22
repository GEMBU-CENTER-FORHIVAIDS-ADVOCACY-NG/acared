import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import AlertError from '@/components/alert-error';
import ConfirmDialog from '@/components/confirm-dialog';
import Heading from '@/components/heading';
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
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { home } from '@/routes';
import { index as recordsIndex } from '@/routes/nursing/records';
import {
    destroy,
    store,
    update,
} from '@/routes/nursing/records/previous-pregnancy';
import type { Team } from '@/types';

type PreviousPregnancyRecord = {
    id: number;
    year: number | null;
    ga: string | null;
    durationOfPregnancy: string | null;
    durationOfLabour: string | null;
    abortion: boolean | null;
    iufd: boolean | null;
    aph: boolean | null;
    pph: boolean | null;
    sex: string | null;
    weight: number | null;
    modeOfDelivery: string | null;
    ageLife: string | null;
    ageDeath: string | null;
    nurseName: string | null;
    canEdit: number;
    createdAt: string | null;
};

type PreviousPregnancyForm = {
    year: string;
    ga: string;
    durationOfPregnancy: string;
    durationOfLabour: string;
    abortion: string;
    iufd: string;
    aph: string;
    pph: string;
    sex: string;
    weight: string;
    modeOfDelivery: string;
    ageLife: string;
    ageDeath: string;
};

const emptyForm: PreviousPregnancyForm = {
    year: '',
    ga: '',
    durationOfPregnancy: '',
    durationOfLabour: '',
    abortion: '',
    iufd: '',
    aph: '',
    pph: '',
    sex: '',
    weight: '',
    modeOfDelivery: '',
    ageLife: '',
    ageDeath: '',
};

export default function PreviousPregnancyIndex({
    nursing,
    records,
}: {
    nursing: {
        id: number;
        patientId: string;
        patientName: string | null;
        purpose: string | null;
        status: string;
    };
    records: PreviousPregnancyRecord[];
}) {
    const { currentTeam } = usePage().props;
    const teamSlug = currentTeam?.slug;

    const [formOpen, setFormOpen] = useState(false);
    const [editId, setEditId] = useState<number | null>(null);
    const [form, setForm] = useState<PreviousPregnancyForm>(emptyForm);
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [recordToDelete, setRecordToDelete] =
        useState<PreviousPregnancyRecord | null>(null);
    const [deleteProcessing, setDeleteProcessing] = useState(false);
    const [deleteError, setDeleteError] = useState<string | null>(null);

    function startCreate() {
        setEditId(null);
        setForm(emptyForm);
        setError(null);
        setFormOpen(true);
    }

    function startEdit(record: PreviousPregnancyRecord) {
        setEditId(record.id);
        setForm({
            year: record.year?.toString() ?? '',
            ga: record.ga ?? '',
            durationOfPregnancy: record.durationOfPregnancy ?? '',
            durationOfLabour: record.durationOfLabour ?? '',
            abortion:
                record.abortion === true
                    ? 'yes'
                    : record.abortion === false
                      ? 'no'
                      : '',
            iufd:
                record.iufd === true
                    ? 'yes'
                    : record.iufd === false
                      ? 'no'
                      : '',
            aph: record.aph === true ? 'yes' : record.aph === false ? 'no' : '',
            pph: record.pph === true ? 'yes' : record.pph === false ? 'no' : '',
            sex: record.sex ?? '',
            weight: record.weight?.toString() ?? '',
            modeOfDelivery: record.modeOfDelivery ?? '',
            ageLife: record.ageLife ?? '',
            ageDeath: record.ageDeath ?? '',
        });
        setError(null);
        setFormOpen(true);
    }

    function submit(event: React.FormEvent) {
        event.preventDefault();
        setProcessing(true);
        setError(null);

        const payload = {
            year: form.year ? parseInt(form.year, 10) : null,
            ga: form.ga || null,
            duration_of_pregnancy: form.durationOfPregnancy || null,
            duration_of_labour: form.durationOfLabour || null,
            abortion:
                form.abortion === 'yes'
                    ? true
                    : form.abortion === 'no'
                      ? false
                      : null,
            iufd:
                form.iufd === 'yes' ? true : form.iufd === 'no' ? false : null,
            aph: form.aph === 'yes' ? true : form.aph === 'no' ? false : null,
            pph: form.pph === 'yes' ? true : form.pph === 'no' ? false : null,
            sex: form.sex || null,
            weight: form.weight ? parseFloat(form.weight) : null,
            mode_of_delivery: form.modeOfDelivery || null,
            age_life: form.ageLife || null,
            age_death: form.ageDeath || null,
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
                    previousPregnancy: editId,
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
    }

    function deleteRecord(record: PreviousPregnancyRecord) {
        setDeleteError(null);
        setRecordToDelete(record);
    }

    function confirmDeleteRecord() {
        if (!recordToDelete) {
            return;
        }

        setDeleteProcessing(true);
        setDeleteError(null);

        router.delete(
            destroy.url({
                current_team: teamSlug,
                nursing: nursing.id,
                previousPregnancy: recordToDelete.id,
            }),
            {
                preserveScroll: true,
                onError: (errors: Record<string, string>) =>
                    setDeleteError(
                        Object.values(errors)[0] ?? 'Something went wrong.',
                    ),
                onSuccess: () => setRecordToDelete(null),
                onFinish: () => setDeleteProcessing(false),
            },
        );
    }

    function updateField(field: keyof PreviousPregnancyForm, value: string) {
        setForm((prev) => ({ ...prev, [field]: value }));
    }

    function renderYesNoBadge(value: boolean | null) {
        if (value === null) return '—';
        if (value)
            return (
                <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300">
                    Yes
                </Badge>
            );
        return <Badge className="bg-muted text-muted-foreground">No</Badge>;
    }

    return (
        <>
            <Head title={`${nursing.patientId} — Previous Pregnancy`} />

            <div className="flex w-full flex-col space-y-6 p-4 md:p-6 lg:p-8">
                {deleteError ? <AlertError errors={[deleteError]} /> : null}

                <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                        <Heading
                            variant="small"
                            title={`${nursing.patientId} - ${nursing.patientName ?? 'Unknown patient'}`}
                            description="Previous pregnancy history records."
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" asChild>
                            <Link href={recordsIndex.url(teamSlug)}>
                                Back to maternity
                            </Link>
                        </Button>
                    </div>
                </div>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Previous pregnancy records</CardTitle>
                        <Button size="sm" onClick={startCreate}>
                            New
                        </Button>
                    </CardHeader>
                    <CardContent>
                        {records.length === 0 ? (
                            <p className="py-8 text-center text-muted-foreground">
                                No previous pregnancy records yet.
                            </p>
                        ) : (
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Year</TableHead>
                                            <TableHead>GA</TableHead>
                                            <TableHead>
                                                Duration of Pregnancy
                                            </TableHead>
                                            <TableHead>
                                                Duration of Labour
                                            </TableHead>
                                            <TableHead>Abortion</TableHead>
                                            <TableHead>IUFD</TableHead>
                                            <TableHead>APH</TableHead>
                                            <TableHead>PPH</TableHead>
                                            <TableHead>Sex</TableHead>
                                            <TableHead>Weight</TableHead>
                                            <TableHead>
                                                Mode of Delivery
                                            </TableHead>
                                            <TableHead>Age (Life)</TableHead>
                                            <TableHead>Age (Death)</TableHead>
                                            <TableHead>Nurse</TableHead>
                                            <TableHead>Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {records.map((record) => (
                                            <TableRow key={record.id}>
                                                <TableCell>
                                                    {record.year ?? '—'}
                                                </TableCell>
                                                <TableCell>
                                                    {record.ga ?? '—'}
                                                </TableCell>
                                                <TableCell>
                                                    {record.durationOfPregnancy ??
                                                        '—'}
                                                </TableCell>
                                                <TableCell>
                                                    {record.durationOfLabour ??
                                                        '—'}
                                                </TableCell>
                                                <TableCell>
                                                    {renderYesNoBadge(
                                                        record.abortion,
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    {renderYesNoBadge(
                                                        record.iufd,
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    {renderYesNoBadge(
                                                        record.aph,
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    {renderYesNoBadge(
                                                        record.pph,
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    {record.sex ? (
                                                        <span className="capitalize">
                                                            {record.sex}
                                                        </span>
                                                    ) : (
                                                        '—'
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    {record.weight ?? '—'}
                                                </TableCell>
                                                <TableCell>
                                                    {record.modeOfDelivery ??
                                                        '—'}
                                                </TableCell>
                                                <TableCell>
                                                    {record.ageLife ?? '—'}
                                                </TableCell>
                                                <TableCell>
                                                    {record.ageDeath ?? '—'}
                                                </TableCell>
                                                <TableCell>
                                                    {record.nurseName ?? '—'}
                                                </TableCell>
                                                <TableCell>
                                                    {record.canEdit ? (
                                                        <div className="flex items-center gap-2">
                                                            <Button
                                                                size="sm"
                                                                variant="secondary"
                                                                onClick={() =>
                                                                    startEdit(
                                                                        record,
                                                                    )
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
                                                                    deleteRecord(
                                                                        record,
                                                                    )
                                                                }
                                                            >
                                                                Delete
                                                            </Button>
                                                        </div>
                                                    ) : null}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            <Sheet
                open={formOpen}
                onOpenChange={(open) => {
                    if (!open && !processing) {
                        setFormOpen(false);
                        setEditId(null);
                    }
                }}
            >
                <SheetContent className="w-full overflow-y-auto sm:max-w-2xl">
                    <SheetHeader>
                        <SheetTitle>
                            {editId ? 'Edit' : 'New'} previous pregnancy record
                        </SheetTitle>
                        <SheetDescription>
                            Record previous pregnancy details for this patient.
                        </SheetDescription>
                    </SheetHeader>

                    <form onSubmit={submit}>
                        <div className="space-y-4 px-4 pb-4">
                            {error ? <AlertError errors={[error]} /> : null}

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="year">Year</Label>
                                    <Input
                                        id="year"
                                        type="number"
                                        placeholder="e.g. 2020"
                                        value={form.year}
                                        onChange={(e) =>
                                            updateField('year', e.target.value)
                                        }
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="ga">GA</Label>
                                    <Input
                                        id="ga"
                                        type="text"
                                        placeholder="e.g. 40 weeks"
                                        value={form.ga}
                                        onChange={(e) =>
                                            updateField('ga', e.target.value)
                                        }
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="durationOfPregnancy">
                                        Duration of Pregnancy
                                    </Label>
                                    <Input
                                        id="durationOfPregnancy"
                                        type="text"
                                        placeholder="e.g. 9 months"
                                        value={form.durationOfPregnancy}
                                        onChange={(e) =>
                                            updateField(
                                                'durationOfPregnancy',
                                                e.target.value,
                                            )
                                        }
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="durationOfLabour">
                                        Duration of Labour
                                    </Label>
                                    <Input
                                        id="durationOfLabour"
                                        type="text"
                                        placeholder="e.g. 12 hours"
                                        value={form.durationOfLabour}
                                        onChange={(e) =>
                                            updateField(
                                                'durationOfLabour',
                                                e.target.value,
                                            )
                                        }
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="abortion">Abortion</Label>
                                    <Select
                                        value={form.abortion}
                                        onValueChange={(value) =>
                                            updateField('abortion', value)
                                        }
                                    >
                                        <SelectTrigger id="abortion">
                                            <SelectValue placeholder="Select" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="yes">
                                                Yes
                                            </SelectItem>
                                            <SelectItem value="no">
                                                No
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="iufd">IUFD</Label>
                                    <Select
                                        value={form.iufd}
                                        onValueChange={(value) =>
                                            updateField('iufd', value)
                                        }
                                    >
                                        <SelectTrigger id="iufd">
                                            <SelectValue placeholder="Select" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="yes">
                                                Yes
                                            </SelectItem>
                                            <SelectItem value="no">
                                                No
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="aph">APH</Label>
                                    <Select
                                        value={form.aph}
                                        onValueChange={(value) =>
                                            updateField('aph', value)
                                        }
                                    >
                                        <SelectTrigger id="aph">
                                            <SelectValue placeholder="Select" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="yes">
                                                Yes
                                            </SelectItem>
                                            <SelectItem value="no">
                                                No
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="pph">PPH</Label>
                                    <Select
                                        value={form.pph}
                                        onValueChange={(value) =>
                                            updateField('pph', value)
                                        }
                                    >
                                        <SelectTrigger id="pph">
                                            <SelectValue placeholder="Select" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="yes">
                                                Yes
                                            </SelectItem>
                                            <SelectItem value="no">
                                                No
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="sex">Sex</Label>
                                    <Select
                                        value={form.sex}
                                        onValueChange={(value) =>
                                            updateField('sex', value)
                                        }
                                    >
                                        <SelectTrigger id="sex">
                                            <SelectValue placeholder="Select" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="male">
                                                Male
                                            </SelectItem>
                                            <SelectItem value="female">
                                                Female
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="weight">Weight (kg)</Label>
                                    <Input
                                        id="weight"
                                        type="number"
                                        step="0.01"
                                        placeholder="e.g. 3.2"
                                        value={form.weight}
                                        onChange={(e) =>
                                            updateField(
                                                'weight',
                                                e.target.value,
                                            )
                                        }
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="modeOfDelivery">
                                        Mode of Delivery
                                    </Label>
                                    <Input
                                        id="modeOfDelivery"
                                        type="text"
                                        placeholder="e.g. Normal, C-section"
                                        value={form.modeOfDelivery}
                                        onChange={(e) =>
                                            updateField(
                                                'modeOfDelivery',
                                                e.target.value,
                                            )
                                        }
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="ageLife">Age (Life)</Label>
                                    <Input
                                        id="ageLife"
                                        type="text"
                                        placeholder="e.g. 2 years"
                                        value={form.ageLife}
                                        onChange={(e) =>
                                            updateField(
                                                'ageLife',
                                                e.target.value,
                                            )
                                        }
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="ageDeath">
                                        Age (Death)
                                    </Label>
                                    <Input
                                        id="ageDeath"
                                        type="text"
                                        placeholder="e.g. 5 days"
                                        value={form.ageDeath}
                                        onChange={(e) =>
                                            updateField(
                                                'ageDeath',
                                                e.target.value,
                                            )
                                        }
                                    />
                                </div>
                            </div>
                        </div>

                        <SheetFooter>
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
                                {processing ? 'Saving...' : 'Save record'}
                            </Button>
                        </SheetFooter>
                    </form>
                </SheetContent>
            </Sheet>

            <ConfirmDialog
                open={recordToDelete !== null}
                onOpenChange={(open) => {
                    if (!open && !deleteProcessing) {
                        setRecordToDelete(null);
                    }
                }}
                title="Delete previous pregnancy record"
                description={`Delete the record from ${recordToDelete?.year ?? 'an unknown year'}? This cannot be undone.`}
                confirmLabel={deleteProcessing ? 'Deleting...' : 'Delete'}
                destructive
                processing={deleteProcessing}
                onConfirm={confirmDeleteRecord}
            />
        </>
    );
}

PreviousPregnancyIndex.layout = (props: { currentTeam?: Team | null }) => ({
    breadcrumbs: [
        {
            title: 'Maternity',
            href: props.currentTeam
                ? recordsIndex.url(props.currentTeam.slug)
                : home.url(),
        },
    ],
});
