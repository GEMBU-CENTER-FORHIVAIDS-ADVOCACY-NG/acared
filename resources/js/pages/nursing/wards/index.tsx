import { Head, router, usePage } from '@inertiajs/react';
import { ArchiveRestore, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';
import AlertError from '@/components/alert-error';
import ConfirmDialog from '@/components/confirm-dialog';
import Heading from '@/components/heading';
import Pagination from '@/components/pagination';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    destroy,
    forceDestroy,
    index,
    restore,
    store,
    update,
} from '@/routes/nursing/wards';
import { destroy as bulkDestroy } from '@/routes/nursing/wards/bulk';

type Bed = {
    id: number;
    name: string;
    status: string;
    deletedAt: string | null;
};
type Ward = {
    id: number;
    name: string;
    description: string | null;
    capacity: number;
    status: string;
    isWard: boolean;
    wardName: string | null;
    beds: Bed[];
    activeAdmissionsCount: number;
    deletedAt: string | null;
    updatedAt: string | null;
};
type Paginator = {
    data: Ward[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
};
type Filters = { q: string; trashed: boolean; perPage: number; page?: number };
type Form = {
    name: string;
    description: string;
    capacity: string;
    beds: { id?: number; name: string }[];
};
const blank: Form = { name: '', description: '', capacity: '0', beds: [] };

export default function WardsIndex({
    wards,
    filters,
}: {
    wards: Paginator;
    filters: Filters;
}) {
    const team = usePage().props.currentTeam?.slug ?? '';
    const [search, setSearch] = useState(filters.q);
    const [form, setForm] = useState<Form>(blank);
    const [editing, setEditing] = useState<Ward | null>(null);
    const [deleting, setDeleting] = useState<Ward | null>(null);
    const [forceDeleting, setForceDeleting] = useState<Ward | null>(null);
    const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
    const [selected, setSelected] = useState<number[]>([]);
    const [open, setOpen] = useState(false);
    const [deleteProcessing, setDeleteProcessing] = useState(false);
    const [forceDeleteProcessing, setForceDeleteProcessing] = useState(false);
    const [bulkDeleteProcessing, setBulkDeleteProcessing] = useState(false);
    const [restoreProcessing, setRestoreProcessing] = useState(false);
    const [actionError, setActionError] = useState<string | null>(null);
    const visit = (patch: Partial<Filters>) =>
        router.get(
            index.url(team, { query: { ...filters, ...patch } }),
            {},
            { preserveState: true, preserveScroll: true, replace: true },
        );
    const startCreate = () => {
        setEditing(null);
        setForm(blank);
        setOpen(true);
    };
    const startEdit = (ward: Ward) => {
        setEditing(ward);
        setForm({
            name: ward.name,
            description: ward.description ?? '',
            capacity: String(ward.capacity),
            beds: ward.beds
                .filter((bed) => !bed.deletedAt)
                .map((bed) => ({ id: bed.id, name: bed.name })),
        });
        setOpen(true);
    };
    const submit = (event: React.FormEvent) => {
        event.preventDefault();
        const options = {
            preserveScroll: true,
            onSuccess: () => setOpen(false),
        };
        if (editing) {
            router.patch(
                update.url({ current_team: team, ward: editing.id }),
                form,
                options,
            );
        } else {
            router.post(store.url(team), form, options);
        }
    };
    const remove = () => {
        if (!deleting) {
            return;
        }

        setDeleteProcessing(true);
        setActionError(null);

        router.delete(destroy.url({ current_team: team, ward: deleting.id }), {
            preserveScroll: true,
            onError: (errors: Record<string, string>) =>
                setActionError(
                    Object.values(errors)[0] ?? 'Something went wrong.',
                ),
            onSuccess: () => setDeleting(null),
            onFinish: () => setDeleteProcessing(false),
        });
    };
    const forceRemove = () => {
        if (!forceDeleting) {
            return;
        }

        setForceDeleteProcessing(true);
        setActionError(null);

        router.delete(
            forceDestroy.url({
                current_team: team,
                ward: forceDeleting.id,
            }),
            {
                preserveScroll: true,
                onError: (errors: Record<string, string>) =>
                    setActionError(
                        Object.values(errors)[0] ?? 'Something went wrong.',
                    ),
                onSuccess: () => setForceDeleting(null),
                onFinish: () => setForceDeleteProcessing(false),
            },
        );
    };
    const removeSelected = () => {
        if (selected.length === 0) {
            return;
        }

        setBulkDeleteProcessing(true);
        setActionError(null);

        router.delete(bulkDestroy.url(team), {
            data: { ids: selected },
            preserveScroll: true,
            onError: (errors: Record<string, string>) =>
                setActionError(
                    Object.values(errors)[0] ?? 'Something went wrong.',
                ),
            onSuccess: () => {
                setSelected([]);
                setBulkDeleteOpen(false);
            },
            onFinish: () => setBulkDeleteProcessing(false),
        });
    };
    const restoreWard = (ward: Ward) => {
        setRestoreProcessing(true);
        setActionError(null);

        router.patch(
            restore.url({ current_team: team, ward: ward.id }),
            {},
            {
                preserveScroll: true,
                onError: (errors: Record<string, string>) =>
                    setActionError(
                        Object.values(errors)[0] ?? 'Something went wrong.',
                    ),
                onFinish: () => setRestoreProcessing(false),
            },
        );
    };
    const changeBed = (index: number, name: string) =>
        setForm((current) => ({
            ...current,
            beds: current.beds.map((bed, bedIndex) =>
                bedIndex === index ? { ...bed, name } : bed,
            ),
        }));
    return (
        <>
            <Head title="Wards and beds" />
            <div className="flex w-full flex-col space-y-6 p-4 md:p-6 lg:p-8">
                {actionError ? <AlertError errors={[actionError]} /> : null}

                <div className="flex flex-wrap items-center justify-between gap-3">
                    <Heading
                        variant="small"
                        title="Wards and beds"
                        description="Manage inpatient wards, capacity, and their beds."
                    />
                    {!filters.trashed && (
                        <Button onClick={startCreate}>New ward</Button>
                    )}
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
                            aria-label="Search wards and beds"
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            placeholder="Search wards and beds"
                            className="max-w-sm"
                        />
                        <Button type="submit">Search</Button>
                    </form>
                    <Button
                        variant="outline"
                        onClick={() =>
                            visit({ trashed: !filters.trashed, page: 1 })
                        }
                    >
                        {filters.trashed ? 'Show active' : 'Show deleted'}
                    </Button>
                    {selected.length > 0 && !filters.trashed && (
                        <Button
                            variant="destructive"
                            disabled={bulkDeleteProcessing}
                            onClick={() => setBulkDeleteOpen(true)}
                        >
                            Delete selected ({selected.length})
                        </Button>
                    )}
                </div>
                <Card>
                    <CardContent className="overflow-x-auto p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>
                                        <input
                                            aria-label="Select all"
                                            type="checkbox"
                                            checked={
                                                wards.data.length > 0 &&
                                                wards.data.every((ward) =>
                                                    selected.includes(ward.id),
                                                )
                                            }
                                            onChange={(event) =>
                                                setSelected(
                                                    event.target.checked
                                                        ? wards.data.map(
                                                              (ward) => ward.id,
                                                          )
                                                        : [],
                                                )
                                            }
                                        />
                                    </TableHead>
                                    <TableHead>Ward / parent</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Capacity</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Active admissions</TableHead>
                                    <TableHead className="text-right">
                                        Actions
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {wards.data.length ? (
                                    wards.data.map((ward) => (
                                        <TableRow key={ward.id}>
                                            <TableCell>
                                                <input
                                                    aria-label={`Select ${ward.name}`}
                                                    type="checkbox"
                                                    checked={selected.includes(
                                                        ward.id,
                                                    )}
                                                    onChange={(event) =>
                                                        setSelected(
                                                            event.target.checked
                                                                ? [
                                                                      ...selected,
                                                                      ward.id,
                                                                  ]
                                                                : selected.filter(
                                                                      (id) =>
                                                                          id !==
                                                                          ward.id,
                                                                  ),
                                                        )
                                                    }
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <div className="font-medium">
                                                    {ward.name}
                                                </div>
                                                {ward.wardName && (
                                                    <div className="text-xs text-muted-foreground">
                                                        in {ward.wardName}
                                                    </div>
                                                )}
                                                {ward.isWard &&
                                                    ward.beds.length > 0 && (
                                                        <div className="mt-1 text-xs text-muted-foreground">
                                                            Beds:{' '}
                                                            {ward.beds
                                                                .map(
                                                                    (bed) =>
                                                                        bed.name,
                                                                )
                                                                .join(', ')}
                                                        </div>
                                                    )}
                                            </TableCell>
                                            <TableCell>
                                                {ward.isWard ? 'Ward' : 'Bed'}
                                            </TableCell>
                                            <TableCell>
                                                {ward.isWard
                                                    ? `${ward.beds.length} beds / ${ward.capacity}`
                                                    : '—'}
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant="secondary"
                                                    className="capitalize"
                                                >
                                                    {ward.deletedAt
                                                        ? 'Deleted'
                                                        : ward.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                {ward.activeAdmissionsCount}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger
                                                        asChild
                                                    >
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            aria-label={`Actions for ${ward.name}`}
                                                        >
                                                            <MoreHorizontal className="size-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        {ward.deletedAt ? (
                                                            <>
                                                                <DropdownMenuItem
                                                                    disabled={
                                                                        restoreProcessing
                                                                    }
                                                                    onClick={() =>
                                                                        restoreWard(
                                                                            ward,
                                                                        )
                                                                    }
                                                                >
                                                                    <ArchiveRestore className="mr-2 h-4 w-4" />
                                                                    Restore
                                                                </DropdownMenuItem>
                                                                <DropdownMenuSeparator />
                                                                <DropdownMenuItem
                                                                    variant="destructive"
                                                                    disabled={
                                                                        forceDeleteProcessing
                                                                    }
                                                                    onClick={() =>
                                                                        setForceDeleting(
                                                                            ward,
                                                                        )
                                                                    }
                                                                >
                                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                                    Delete
                                                                    permanently
                                                                </DropdownMenuItem>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <DropdownMenuItem
                                                                    onClick={() =>
                                                                        startEdit(
                                                                            ward,
                                                                        )
                                                                    }
                                                                    disabled={
                                                                        !ward.isWard
                                                                    }
                                                                >
                                                                    <Pencil className="mr-2 h-4 w-4" />
                                                                    Edit
                                                                </DropdownMenuItem>
                                                                <DropdownMenuSeparator />
                                                                <DropdownMenuItem
                                                                    variant="destructive"
                                                                    onClick={() =>
                                                                        setDeleting(
                                                                            ward,
                                                                        )
                                                                    }
                                                                >
                                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                                    Delete
                                                                </DropdownMenuItem>
                                                            </>
                                                        )}
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell
                                            colSpan={7}
                                            className="py-10 text-center text-muted-foreground"
                                        >
                                            No wards or beds found.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
                <Pagination
                    meta={{
                        currentPage: wards.current_page,
                        lastPage: wards.last_page,
                        perPage: wards.per_page,
                        total: wards.total,
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
                                {editing ? 'Edit ward' : 'New ward'}
                            </h2>
                            <p className="text-sm text-muted-foreground">
                                Add beds up to the ward capacity.
                            </p>
                        </div>
                        <div className="space-y-1">
                            <Label>Ward name</Label>
                            <Input
                                required
                                value={form.name}
                                onChange={(event) =>
                                    setForm({
                                        ...form,
                                        name: event.target.value,
                                    })
                                }
                            />
                        </div>
                        <div className="space-y-1">
                            <Label>Capacity</Label>
                            <Input
                                required
                                type="number"
                                min="0"
                                value={form.capacity}
                                onChange={(event) =>
                                    setForm({
                                        ...form,
                                        capacity: event.target.value,
                                    })
                                }
                            />
                        </div>
                        <div className="space-y-1">
                            <Label>Description</Label>
                            <Textarea
                                value={form.description}
                                onChange={(event) =>
                                    setForm({
                                        ...form,
                                        description: event.target.value,
                                    })
                                }
                            />
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label>Beds ({form.beds.length})</Label>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    disabled={
                                        form.beds.length >=
                                        Number(form.capacity)
                                    }
                                    onClick={() =>
                                        setForm((current) => ({
                                            ...current,
                                            beds: [
                                                ...current.beds,
                                                { name: '' },
                                            ],
                                        }))
                                    }
                                >
                                    Add bed
                                </Button>
                            </div>
                            {form.beds.map((bed, bedIndex) => (
                                <div
                                    key={bed.id ?? `new-${bedIndex}`}
                                    className="flex gap-2"
                                >
                                    <Input
                                        required
                                        value={bed.name}
                                        aria-label={`Bed ${bedIndex + 1}`}
                                        onChange={(event) =>
                                            changeBed(
                                                bedIndex,
                                                event.target.value,
                                            )
                                        }
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        onClick={() =>
                                            setForm((current) => ({
                                                ...current,
                                                beds: current.beds.filter(
                                                    (_, index) =>
                                                        index !== bedIndex,
                                                ),
                                            }))
                                        }
                                    >
                                        Remove
                                    </Button>
                                </div>
                            ))}
                        </div>
                        <div className="flex justify-end gap-2">
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={() => setOpen(false)}
                            >
                                Cancel
                            </Button>
                            <Button type="submit">Save ward</Button>
                        </div>
                    </form>
                </div>
            )}
            <ConfirmDialog
                open={deleting !== null}
                onOpenChange={(open) => {
                    if (!open && !deleteProcessing) {
                        setDeleting(null);
                    }
                }}
                title={`Delete ${deleting?.name ?? 'ward'}?`}
                description="This moves the ward or bed to deleted records."
                confirmLabel={deleteProcessing ? 'Deleting...' : 'Delete'}
                destructive
                processing={deleteProcessing}
                onConfirm={remove}
            />

            <ConfirmDialog
                open={forceDeleting !== null}
                onOpenChange={(open) => {
                    if (!open && !forceDeleteProcessing) {
                        setForceDeleting(null);
                    }
                }}
                title={`Delete ${forceDeleting?.name ?? 'ward'} permanently?`}
                description="This permanently removes the ward or bed and cannot be undone."
                confirmLabel={
                    forceDeleteProcessing ? 'Deleting...' : 'Delete permanently'
                }
                destructive
                processing={forceDeleteProcessing}
                onConfirm={forceRemove}
            />

            <ConfirmDialog
                open={bulkDeleteOpen}
                onOpenChange={(open) => {
                    if (!open && !bulkDeleteProcessing) {
                        setBulkDeleteOpen(false);
                    }
                }}
                title={`Delete ${selected.length} selected item${selected.length === 1 ? '' : 's'}?`}
                description="This moves the selected wards or beds to deleted records."
                confirmLabel={bulkDeleteProcessing ? 'Deleting...' : 'Delete'}
                destructive
                processing={bulkDeleteProcessing}
                onConfirm={removeSelected}
            />
        </>
    );
}
