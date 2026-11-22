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
} from '@/routes/nursing/records/present-pregnancy';
import type { Team } from '@/types';

type PresentPregnancyRecord = {
    id: number;
    date: string | null;
    bp: string | null;
    gA: string | null;
    weight: number | null;
    lmp: string | null;
    edd: string | null;
    sfh: number | null;
    lie: string | null;
    position: string | null;
    fhr: number | null;
    hb: number | null;
    oedema: boolean | null;
    nurseName: string | null;
    canEdit: number;
    createdAt: string | null;
};

type PresentPregnancyForm = {
    date: string;
    bp: string;
    gA: string;
    weight: string;
    lmp: string;
    edd: string;
    sfh: string;
    lie: string;
    position: string;
    fhr: string;
    hb: string;
    oedema: string;
};

const emptyForm: PresentPregnancyForm = {
    date: new Date().toISOString().split('T')[0],
    bp: '',
    gA: '',
    weight: '',
    lmp: '',
    edd: '',
    sfh: '',
    lie: '',
    position: '',
    fhr: '',
    hb: '',
    oedema: '',
};

const LIE_OPTIONS = ['longitudinal', 'transverse', 'oblique'];
const POSITION_OPTIONS = [
    'left anterior',
    'left posterior',
    'right anterior',
    'right posterior',
];

export default function PresentPregnancyIndex({
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
    records: PresentPregnancyRecord[];
}) {
    const { currentTeam } = usePage().props;
    const teamSlug = currentTeam?.slug;

    const [formOpen, setFormOpen] = useState(false);
    const [editId, setEditId] = useState<number | null>(null);
    const [form, setForm] = useState<PresentPregnancyForm>(emptyForm);
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [recordToDelete, setRecordToDelete] =
        useState<PresentPregnancyRecord | null>(null);
    const [deleteProcessing, setDeleteProcessing] = useState(false);
    const [deleteError, setDeleteError] = useState<string | null>(null);

    function startCreate() {
        setEditId(null);
        setForm(emptyForm);
        setError(null);
        setFormOpen(true);
    }

    function startEdit(record: PresentPregnancyRecord) {
        setEditId(record.id);
        setForm({
            date: record.date
                ? record.date.split('T')[0]
                : new Date().toISOString().split('T')[0],
            bp: record.bp ?? '',
            gA: record.gA ?? '',
            weight: record.weight?.toString() ?? '',
            lmp: record.lmp ? record.lmp.split('T')[0] : '',
            edd: record.edd ? record.edd.split('T')[0] : '',
            sfh: record.sfh?.toString() ?? '',
            lie: record.lie ?? '',
            position: record.position ?? '',
            fhr: record.fhr?.toString() ?? '',
            hb: record.hb?.toString() ?? '',
            oedema:
                record.oedema === true
                    ? 'yes'
                    : record.oedema === false
                      ? 'no'
                      : '',
        });
        setError(null);
        setFormOpen(true);
    }

    function submit(event: React.FormEvent) {
        event.preventDefault();
        setProcessing(true);
        setError(null);

        const payload = {
            date: form.date,
            bp: form.bp || null,
            g_a: form.gA || null,
            weight: form.weight ? parseFloat(form.weight) : null,
            lmp: form.lmp || null,
            edd: form.edd || null,
            sfh: form.sfh ? parseFloat(form.sfh) : null,
            lie: form.lie || null,
            position: form.position || null,
            fhr: form.fhr ? parseInt(form.fhr, 10) : null,
            hb: form.hb ? parseFloat(form.hb) : null,
            oedema:
                form.oedema === 'yes'
                    ? true
                    : form.oedema === 'no'
                      ? false
                      : null,
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
                    presentPregnancy: editId,
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

    function deleteRecord(record: PresentPregnancyRecord) {
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
                presentPregnancy: recordToDelete.id,
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

    function updateField(field: keyof PresentPregnancyForm, value: string) {
        setForm((prev) => ({ ...prev, [field]: value }));
    }

    function renderOedemaBadge(value: boolean | null) {
        if (value === null) return '—';
        if (value)
            return (
                <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300">
                    Present
                </Badge>
            );
        return <Badge className="bg-muted text-muted-foreground">Absent</Badge>;
    }

    return (
        <>
            <Head title={`${nursing.patientId} — Present Pregnancy`} />

            <div className="flex w-full flex-col space-y-6 p-4 md:p-6 lg:p-8">
                {deleteError ? <AlertError errors={[deleteError]} /> : null}

                <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                        <Heading
                            variant="small"
                            title={`${nursing.patientId} - ${nursing.patientName ?? 'Unknown patient'}`}
                            description="Present pregnancy antenatal visit records."
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
                        <CardTitle>Present pregnancy records</CardTitle>
                        <Button size="sm" onClick={startCreate}>
                            New
                        </Button>
                    </CardHeader>
                    <CardContent>
                        {records.length === 0 ? (
                            <p className="py-8 text-center text-muted-foreground">
                                No present pregnancy records yet.
                            </p>
                        ) : (
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Date</TableHead>
                                            <TableHead>BP</TableHead>
                                            <TableHead>G/A</TableHead>
                                            <TableHead>Weight</TableHead>
                                            <TableHead>LMP</TableHead>
                                            <TableHead>EDD</TableHead>
                                            <TableHead>SFH</TableHead>
                                            <TableHead>Lie</TableHead>
                                            <TableHead>Position</TableHead>
                                            <TableHead>FHR</TableHead>
                                            <TableHead>HB</TableHead>
                                            <TableHead>Oedema</TableHead>
                                            <TableHead>Nurse</TableHead>
                                            <TableHead>Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {records.map((record) => (
                                            <TableRow key={record.id}>
                                                <TableCell>
                                                    {record.date
                                                        ? new Date(
                                                              record.date,
                                                          ).toLocaleDateString()
                                                        : '—'}
                                                </TableCell>
                                                <TableCell>
                                                    {record.bp ?? '—'}
                                                </TableCell>
                                                <TableCell>
                                                    {record.gA ?? '—'}
                                                </TableCell>
                                                <TableCell>
                                                    {record.weight ?? '—'}
                                                </TableCell>
                                                <TableCell>
                                                    {record.lmp
                                                        ? new Date(
                                                              record.lmp,
                                                          ).toLocaleDateString()
                                                        : '—'}
                                                </TableCell>
                                                <TableCell>
                                                    {record.edd
                                                        ? new Date(
                                                              record.edd,
                                                          ).toLocaleDateString()
                                                        : '—'}
                                                </TableCell>
                                                <TableCell>
                                                    {record.sfh ?? '—'}
                                                </TableCell>
                                                <TableCell>
                                                    {record.lie ? (
                                                        <span className="capitalize">
                                                            {record.lie}
                                                        </span>
                                                    ) : (
                                                        '—'
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    {record.position ? (
                                                        <span className="capitalize">
                                                            {record.position}
                                                        </span>
                                                    ) : (
                                                        '—'
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    {record.fhr ?? '—'}
                                                </TableCell>
                                                <TableCell>
                                                    {record.hb ?? '—'}
                                                </TableCell>
                                                <TableCell>
                                                    {renderOedemaBadge(
                                                        record.oedema,
                                                    )}
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
                            {editId ? 'Edit' : 'New'} present pregnancy record
                        </SheetTitle>
                        <SheetDescription>
                            Record antenatal visit details for this patient.
                        </SheetDescription>
                    </SheetHeader>

                    <form onSubmit={submit}>
                        <div className="space-y-4 px-4 pb-4">
                            {error ? <AlertError errors={[error]} /> : null}

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="date">Date</Label>
                                    <Input
                                        id="date"
                                        type="date"
                                        value={form.date}
                                        onChange={(e) =>
                                            updateField('date', e.target.value)
                                        }
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="bp">BP</Label>
                                    <Input
                                        id="bp"
                                        type="text"
                                        placeholder="e.g. 120/80"
                                        value={form.bp}
                                        onChange={(e) =>
                                            updateField('bp', e.target.value)
                                        }
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="gA">G/A (weeks)</Label>
                                    <Input
                                        id="gA"
                                        type="text"
                                        placeholder="e.g. 28"
                                        value={form.gA}
                                        onChange={(e) =>
                                            updateField('gA', e.target.value)
                                        }
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="weight">Weight (kg)</Label>
                                    <Input
                                        id="weight"
                                        type="number"
                                        step="0.01"
                                        placeholder="e.g. 65.5"
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
                                    <Label htmlFor="lmp">LMP</Label>
                                    <Input
                                        id="lmp"
                                        type="date"
                                        value={form.lmp}
                                        onChange={(e) =>
                                            updateField('lmp', e.target.value)
                                        }
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="edd">EDD</Label>
                                    <Input
                                        id="edd"
                                        type="date"
                                        value={form.edd}
                                        onChange={(e) =>
                                            updateField('edd', e.target.value)
                                        }
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="sfh">SFH (cm)</Label>
                                    <Input
                                        id="sfh"
                                        type="number"
                                        step="0.1"
                                        placeholder="e.g. 28.5"
                                        value={form.sfh}
                                        onChange={(e) =>
                                            updateField('sfh', e.target.value)
                                        }
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="lie">Lie</Label>
                                    <Select
                                        value={form.lie}
                                        onValueChange={(value) =>
                                            updateField('lie', value)
                                        }
                                    >
                                        <SelectTrigger id="lie">
                                            <SelectValue placeholder="Select lie" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {LIE_OPTIONS.map((option) => (
                                                <SelectItem
                                                    key={option}
                                                    value={option}
                                                >
                                                    {option
                                                        .charAt(0)
                                                        .toUpperCase() +
                                                        option.slice(1)}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="position">Position</Label>
                                    <Select
                                        value={form.position}
                                        onValueChange={(value) =>
                                            updateField('position', value)
                                        }
                                    >
                                        <SelectTrigger id="position">
                                            <SelectValue placeholder="Select position" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {POSITION_OPTIONS.map((option) => (
                                                <SelectItem
                                                    key={option}
                                                    value={option}
                                                >
                                                    {option
                                                        .split(' ')
                                                        .map(
                                                            (w) =>
                                                                w
                                                                    .charAt(0)
                                                                    .toUpperCase() +
                                                                w.slice(1),
                                                        )
                                                        .join(' ')}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="fhr">FHR (bpm)</Label>
                                    <Input
                                        id="fhr"
                                        type="number"
                                        placeholder="e.g. 140"
                                        value={form.fhr}
                                        onChange={(e) =>
                                            updateField('fhr', e.target.value)
                                        }
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="hb">HB (g/dl)</Label>
                                    <Input
                                        id="hb"
                                        type="number"
                                        step="0.1"
                                        placeholder="e.g. 12.5"
                                        value={form.hb}
                                        onChange={(e) =>
                                            updateField('hb', e.target.value)
                                        }
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="oedema">Oedema</Label>
                                    <Select
                                        value={form.oedema}
                                        onValueChange={(value) =>
                                            updateField('oedema', value)
                                        }
                                    >
                                        <SelectTrigger id="oedema">
                                            <SelectValue placeholder="Select" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="yes">
                                                Present
                                            </SelectItem>
                                            <SelectItem value="no">
                                                Absent
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
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
                title="Delete present pregnancy record"
                description={`Delete the record dated ${recordToDelete?.date ? new Date(recordToDelete.date).toLocaleDateString() : 'this record'}? This cannot be undone.`}
                confirmLabel={deleteProcessing ? 'Deleting...' : 'Delete'}
                destructive
                processing={deleteProcessing}
                onConfirm={confirmDeleteRecord}
            />
        </>
    );
}

PresentPregnancyIndex.layout = (props: { currentTeam?: Team | null }) => ({
    breadcrumbs: [
        {
            title: 'Maternity',
            href: props.currentTeam
                ? recordsIndex.url(props.currentTeam.slug)
                : home.url(),
        },
    ],
});
