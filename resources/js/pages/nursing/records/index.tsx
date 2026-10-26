import { Head, Link, router, usePage } from '@inertiajs/react';
import { Eye, MoreHorizontal } from 'lucide-react';
import { useState } from 'react';
import Heading from '@/components/heading';
import Pagination from '@/components/pagination';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { index, store, view } from '@/routes/nursing/records';
import { destroy as bulkDestroy } from '@/routes/nursing/records/bulk';

type Patient = { slug: string; fullName: string };
type Nurse = { id: number; name: string };
type Billing = {
    id: number;
    patientId: string;
    patientName: string | null;
    status: string;
};
type RecordItem = {
    id: number;
    patientId: string;
    patientName: string | null;
    nurseId: number | null;
    nurseName: string | null;
    billingId: number;
    billingStatus: string | null;
    createdBy: string | null;
    purpose: string | null;
    status: string;
    createdAt: string | null;
};
type Paginator = {
    data: RecordItem[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
};
type Filters = { q: string; perPage: number; page?: number };
type Form = {
    patient_id: string;
    nurse_id: string;
    billing_id: string;
    purpose: string;
    status: string;
};
const empty: Form = {
    patient_id: '',
    nurse_id: '',
    billing_id: '',
    purpose: '',
    status: 'scheduled',
};

export default function NursingRecordsIndex({
    records,
    patients,
    nurses,
    billings,
    filters,
}: {
    records: Paginator;
    patients: Patient[];
    nurses: Nurse[];
    billings: Billing[];
    filters: Filters;
}) {
    const team = usePage().props.currentTeam?.slug ?? '';
    const [search, setSearch] = useState(filters.q);
    const [form, setForm] = useState<Form>(empty);
    const [selected, setSelected] = useState<number[]>([]);
    const [open, setOpen] = useState(false);
    const visit = (patch: Partial<Filters>) =>
        router.get(
            index.url(team, { query: { ...filters, ...patch } }),
            {},
            { preserveState: true, preserveScroll: true, replace: true },
        );
    const availableBillings = billings.filter(
        (billing) => billing.patientId === form.patient_id,
    );
    const startCreate = () => {
        setForm(empty);
        setOpen(true);
    };
    const submit = (event: React.FormEvent) => {
        event.preventDefault();
        const payload = { ...form, nurse_id: form.nurse_id || null };
        router.post(store.url(team), payload, {
            preserveScroll: true,
            onSuccess: () => setOpen(false),
        });
    };
    const removeSelected = () =>
        router.delete(bulkDestroy.url(team), {
            data: { ids: selected },
            preserveScroll: true,
            onSuccess: () => setSelected([]),
        });
    return (
        <>
            <Head title="Maternity" />
            <div className="flex w-full flex-col space-y-6 p-4 md:p-6 lg:p-8">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <Heading
                        variant="small"
                        title="Maternity"
                        description="Manage maternity nursing visits and their billing records."
                    />
                    <Button onClick={startCreate}>New maternity visit</Button>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <form
                        className="flex flex-1 items-center gap-2"
                        onSubmit={(event) => {
                            event.preventDefault();
                            visit({ q: search, page: 1 });
                        }}
                    >
                        <Input
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            placeholder="Search patient or hospital number"
                            className="max-w-sm"
                        />
                        <Button type="submit" variant="secondary">
                            Search
                        </Button>
                    </form>
                    {selected.length > 0 && (
                        <Button variant="destructive" onClick={removeSelected}>
                            Delete selected ({selected.length})
                        </Button>
                    )}
                </div>
                <Card>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                            <TableRow>
                                <TableHead>
                                    <input
                                        aria-label="Select all"
                                        type="checkbox"
                                        checked={
                                            records.data.length > 0 &&
                                            records.data.every((row) =>
                                                selected.includes(row.id),
                                            )
                                        }
                                        onChange={(event) =>
                                            setSelected(
                                                event.target.checked
                                                    ? records.data.map(
                                                          (row) => row.id,
                                                      )
                                                    : [],
                                            )
                                        }
                                    />
                                </TableHead>
                                <TableHead>Patient</TableHead>
                                <TableHead>Nurse</TableHead>
                                <TableHead>Billing</TableHead>
                                <TableHead>Purpose</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Created</TableHead>
                                <TableHead className="text-right">
                                    Actions
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {records.data.length ? (
                                records.data.map((row) => (
                                    <TableRow key={row.id}>
                                        <TableCell>
                                            <input
                                                aria-label={`Select visit ${row.id}`}
                                                type="checkbox"
                                                checked={selected.includes(
                                                    row.id,
                                                )}
                                                onChange={(event) =>
                                                    setSelected(
                                                        event.target.checked
                                                            ? [
                                                                  ...selected,
                                                                  row.id,
                                                              ]
                                                            : selected.filter(
                                                                  (id) =>
                                                                      id !==
                                                                      row.id,
                                                              ),
                                                    )
                                                }
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <div className="font-medium">
                                                {row.patientName ??
                                                    row.patientId}
                                            </div>
                                            <div className="text-xs text-muted-foreground">
                                                {row.patientId}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {row.nurseName ?? '—'}
                                        </TableCell>
                                        <TableCell>
                                            #{row.billingId}{' '}
                                            {row.billingStatus &&
                                                `· ${row.billingStatus}`}
                                        </TableCell>
                                        <TableCell className="max-w-64 truncate">
                                            {row.purpose ?? '—'}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="secondary" className="capitalize">
                                                {row.status.replace('_', ' ')}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {row.createdAt
                                                ? new Date(
                                                      row.createdAt,
                                                  ).toLocaleDateString()
                                                : '—'}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                    >
                                                        <MoreHorizontal className="size-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem asChild>
                                                        <Link
                                                            href={view.url({
                                                                current_team: team,
                                                                nursing: row.id,
                                                            })}
                                                        >
                                                            <Eye className="mr-2 h-4 w-4" />
                                                            View
                                                        </Link>
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell
                                        colSpan={8}
                                        className="py-10 text-center text-muted-foreground"
                                    >
                                        No maternity visits found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                    </CardContent>
                </Card>
                <Pagination
                    meta={{
                        currentPage: records.current_page,
                        lastPage: records.last_page,
                        perPage: records.per_page,
                        total: records.total,
                    }}
                    onPageChange={(page) => visit({ page })}
                    onPerPageChange={(perPage) => visit({ perPage, page: 1 })}
                />
            </div>
            {open && (
                <div
                    className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4"
                    role="dialog"
                    aria-modal="true"
                >
                    <form
                        onSubmit={submit}
                        className="max-h-[90vh] w-full max-w-xl space-y-4 overflow-y-auto rounded-lg bg-background p-6 shadow-xl"
                    >
                        <div>
                            <h2 className="text-lg font-semibold">
                                {editing
                                    ? 'Edit maternity visit'
                                    : 'New maternity visit'}
                            </h2>
                            <p className="text-sm text-muted-foreground">
                                Choose a billing record associated with this
                                patient.
                            </p>
                        </div>
                        <div className="space-y-1">
                            <Label>Patient</Label>
                            <Select
                                value={form.patient_id}
                                onValueChange={(patient_id) =>
                                    setForm({
                                        ...form,
                                        patient_id,
                                        billing_id: '',
                                    })
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select patient" />
                                </SelectTrigger>
                                <SelectContent>
                                    {patients.map((patient) => (
                                        <SelectItem
                                            key={patient.slug}
                                            value={patient.slug}
                                        >
                                            {patient.slug} — {patient.fullName}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-1">
                            <Label>Billing record</Label>
                            <Select
                                value={form.billing_id}
                                onValueChange={(billing_id) =>
                                    setForm({ ...form, billing_id })
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select billing" />
                                </SelectTrigger>
                                <SelectContent>
                                    {availableBillings.map((billing) => (
                                        <SelectItem
                                            key={billing.id}
                                            value={String(billing.id)}
                                        >
                                            #{billing.id} · {billing.status} ·{' '}
                                            {billing.patientName}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-1">
                            <Label>Nurse</Label>
                            <Select
                                value={form.nurse_id}
                                onValueChange={(nurse_id) =>
                                    setForm({ ...form, nurse_id })
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Unassigned" />
                                </SelectTrigger>
                                <SelectContent>
                                    {nurses.map((nurse) => (
                                        <SelectItem
                                            key={nurse.id}
                                            value={String(nurse.id)}
                                        >
                                            {nurse.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-1">
                            <Label>Purpose</Label>
                            <Textarea
                                value={form.purpose}
                                onChange={(event) =>
                                    setForm({
                                        ...form,
                                        purpose: event.target.value,
                                    })
                                }
                            />
                        </div>
                        <div className="space-y-1">
                            <Label>Status</Label>
                            <Select
                                value={form.status}
                                onValueChange={(status) =>
                                    setForm({ ...form, status })
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="scheduled">
                                        Scheduled
                                    </SelectItem>
                                    <SelectItem value="in_progress">
                                        In progress
                                    </SelectItem>
                                    <SelectItem value="completed">
                                        Completed
                                    </SelectItem>
                                    <SelectItem value="cancelled">
                                        Cancelled
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex justify-end gap-2">
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={() => setOpen(false)}
                            >
                                Cancel
                            </Button>
                            <Button type="submit">Save visit</Button>
                        </div>
                    </form>
                </div>
            )}
        </>
    );
}
