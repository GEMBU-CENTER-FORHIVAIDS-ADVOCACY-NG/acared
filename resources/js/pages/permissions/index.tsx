import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import ConfirmDialog from '@/components/confirm-dialog';
import Heading from '@/components/heading';
import Pagination from '@/components/pagination';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import {
    index as permissionsIndex,
    store as permissionsStore,
    update as permissionsUpdate,
    destroy as permissionsDestroy,
} from '@/routes/permissions';
import permissionsBulk from '@/routes/permissions/bulk';

type Permission = {
    id: number;
    name: string;
    guardName: string;
    createdAt: string | null;
    updatedAt: string | null;
};

type Paginator = {
    data: Permission[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
};

export default function PermissionsIndex({
    permissions,
    filters,
}: {
    permissions: Paginator;
    filters: { q: string; perPage: number };
}) {
    const [query, setQuery] = useState(filters.q);
    const [name, setName] = useState('');
    const [editing, setEditing] = useState<Permission | null>(null);
    const [viewing, setViewing] = useState<Permission | null>(null);
    const [formOpen, setFormOpen] = useState(false);
    const [deleting, setDeleting] = useState<Permission | null>(null);
    const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
    const [selected, setSelected] = useState<number[]>([]);
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    function applyFilters(page = 1, perPage = filters.perPage) {
        router.get(
            permissionsIndex(),
            { q: query || undefined, page, perPage },
            { preserveState: true, preserveScroll: true, replace: true },
        );
    }

    function openCreate() {
        setEditing(null);
        setName('');
        setError(null);
        setFormOpen(true);
    }

    function openEdit(permission: Permission) {
        setEditing(permission);
        setName(permission.name);
        setError(null);
        setFormOpen(true);
    }

    function save() {
        setProcessing(true);
        setError(null);
        const options = {
            preserveScroll: true,
            onSuccess: () => setFormOpen(false),
            onError: (errors: Record<string, string>) =>
                setError(Object.values(errors)[0] ?? 'Unable to save permission.'),
            onFinish: () => setProcessing(false),
        };

        if (editing) {
            router.patch(permissionsUpdate({ permission: editing.id }), { name }, options);
        } else {
            router.post(permissionsStore(), { name }, options);
        }
    }

    function deleteOne() {
        if (!deleting) return;
        setProcessing(true);
        router.delete(permissionsDestroy({ permission: deleting.id }), {
            preserveScroll: true,
            onSuccess: () => setDeleting(null),
            onFinish: () => setProcessing(false),
        });
    }

    function deleteSelected() {
        setProcessing(true);
        router.delete(permissionsBulk.destroy(), {
            data: { ids: selected },
            preserveScroll: true,
            onSuccess: () => {
                setSelected([]);
                setBulkDeleteOpen(false);
            },
            onFinish: () => setProcessing(false),
        });
    }

    return (
        <>
            <Head title="Permissions" />
            <div className="flex w-full flex-col space-y-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <Heading
                        variant="small"
                        title="Permissions"
                        description="Manage permissions that can be assigned to roles."
                    />
                    <Button onClick={openCreate}>Create permission</Button>
                </div>
                <form
                    className="flex flex-wrap gap-2"
                    onSubmit={(event) => {
                        event.preventDefault();
                        applyFilters();
                    }}
                >
                    <Input
                        className="w-full sm:max-w-sm"
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                        placeholder="Search permissions..."
                    />
                    <Button type="submit" variant="secondary">
                        Search
                    </Button>
                </form>
                {selected.length ? (
                    <div className="flex items-center gap-3">
                        <span className="text-sm text-muted-foreground">
                            {selected.length} selected
                        </span>
                        <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => setBulkDeleteOpen(true)}
                        >
                            Delete selected
                        </Button>
                    </div>
                ) : null}
                <div className="rounded-lg border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>
                                    <input
                                        type="checkbox"
                                        aria-label="Select all permissions"
                                        checked={
                                            permissions.data.length > 0 &&
                                            permissions.data.every(
                                                (permission) =>
                                                    selected.includes(
                                                        permission.id,
                                                    ),
                                            )
                                        }
                                        onChange={(event) =>
                                            setSelected(
                                                event.target.checked
                                                    ? [
                                                          ...new Set([
                                                              ...selected,
                                                              ...permissions.data.map(
                                                                  (permission) =>
                                                                      permission.id,
                                                              ),
                                                          ]),
                                                      ]
                                                    : selected.filter(
                                                          (id) =>
                                                              !permissions.data.some(
                                                                  (permission) =>
                                                                      permission.id ===
                                                                      id,
                                                              ),
                                                      ),
                                            )
                                        }
                                    />
                                </TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Guard</TableHead>
                                <TableHead>Created</TableHead>
                                <TableHead>Updated</TableHead>
                                <TableHead className="text-right">
                                    Actions
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {permissions.data.length === 0 ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={6}
                                        className="py-10 text-center text-muted-foreground"
                                    >
                                        No permissions found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                permissions.data.map((permission) => (
                                    <TableRow key={permission.id}>
                                        <TableCell>
                                            <input
                                                type="checkbox"
                                                aria-label={`Select ${permission.name}`}
                                                checked={selected.includes(
                                                    permission.id,
                                                )}
                                                onChange={(event) =>
                                                    setSelected(
                                                        event.target.checked
                                                            ? [
                                                                  ...selected,
                                                                  permission.id,
                                                              ]
                                                            : selected.filter(
                                                                  (id) =>
                                                                      id !==
                                                                      permission.id,
                                                              ),
                                                    )
                                                }
                                            />
                                        </TableCell>
                                        <TableCell className="font-medium">
                                            {permission.name}
                                        </TableCell>
                                        <TableCell>
                                            {permission.guardName}
                                        </TableCell>
                                        <TableCell>
                                            {permission.createdAt
                                                ? new Date(
                                                      permission.createdAt,
                                                  ).toLocaleString()
                                                : '—'}
                                        </TableCell>
                                        <TableCell>
                                            {permission.updatedAt
                                                ? new Date(
                                                      permission.updatedAt,
                                                  ).toLocaleString()
                                                : '—'}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-1">
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() =>
                                                        setViewing(permission)
                                                    }
                                                >
                                                    View
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() =>
                                                        openEdit(permission)
                                                    }
                                                >
                                                    Edit
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() =>
                                                        setDeleting(permission)
                                                    }
                                                >
                                                    Delete
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
                <Pagination
                    meta={{
                        currentPage: permissions.current_page,
                        lastPage: permissions.last_page,
                        perPage: permissions.per_page,
                        total: permissions.total,
                    }}
                    onPageChange={(page) => applyFilters(page)}
                    onPerPageChange={(perPage) => applyFilters(1, perPage)}
                />
            </div>

            {/* Create/Edit Permission Sheet */}
            <Sheet open={formOpen} onOpenChange={setFormOpen}>
                <SheetContent className="sm:max-w-sm">
                    <SheetHeader>
                        <SheetTitle>
                            {editing ? 'Edit permission' : 'Create permission'}
                        </SheetTitle>
                        <SheetDescription>
                            {editing
                                ? 'Update the permission name.'
                                : 'Create a new permission that can be assigned to roles.'}
                        </SheetDescription>
                    </SheetHeader>
                    <div className="space-y-4 px-4 py-5">
                        <div className="space-y-2">
                            <Label htmlFor="permission-name">
                                Permission name
                            </Label>
                            <Input
                                id="permission-name"
                                value={name}
                                onChange={(event) =>
                                    setName(event.target.value)
                                }
                                placeholder="e.g. edit articles"
                            />
                        </div>
                        {error ? (
                            <p className="text-sm text-destructive">{error}</p>
                        ) : null}
                    </div>
                    <SheetFooter>
                        <Button
                            variant="outline"
                            onClick={() => setFormOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            disabled={processing || !name.trim()}
                            onClick={save}
                        >
                            {editing ? 'Update permission' : 'Create permission'}
                        </Button>
                    </SheetFooter>
                </SheetContent>
            </Sheet>

            {/* View Permission Sheet */}
            <Sheet
                open={viewing !== null}
                onOpenChange={(open) => !open && setViewing(null)}
            >
                <SheetContent className="sm:max-w-sm">
                    <SheetHeader>
                        <SheetTitle>Permission details</SheetTitle>
                    </SheetHeader>
                    <div className="space-y-3 px-4 py-5">
                        <p>
                            <span className="text-muted-foreground">Name:</span>{' '}
                            {viewing?.name}
                        </p>
                        <p>
                            <span className="text-muted-foreground">
                                Guard:
                            </span>{' '}
                            {viewing?.guardName}
                        </p>
                        <p>
                            <span className="text-muted-foreground">
                                Created:
                            </span>{' '}
                            {viewing?.createdAt
                                ? new Date(viewing.createdAt).toLocaleString()
                                : '—'}
                        </p>
                        <p>
                            <span className="text-muted-foreground">
                                Updated:
                            </span>{' '}
                            {viewing?.updatedAt
                                ? new Date(viewing.updatedAt).toLocaleString()
                                : '—'}
                        </p>
                    </div>
                </SheetContent>
            </Sheet>

            <ConfirmDialog
                open={deleting !== null}
                onOpenChange={(open) => !open && setDeleting(null)}
                title="Delete permission?"
                description={`Delete "${deleting?.name}"? Roles with this permission will lose it.`}
                confirmLabel="Delete"
                destructive
                processing={processing}
                onConfirm={deleteOne}
            />
            <ConfirmDialog
                open={bulkDeleteOpen}
                onOpenChange={setBulkDeleteOpen}
                title="Delete selected permissions?"
                description="Roles with these permissions will lose them."
                confirmLabel="Delete selected"
                destructive
                processing={processing}
                onConfirm={deleteSelected}
            />
        </>
    );
}
