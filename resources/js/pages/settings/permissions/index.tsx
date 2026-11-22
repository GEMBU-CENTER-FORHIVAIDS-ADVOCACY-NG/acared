import { Head, router } from '@inertiajs/react';
import { Eye, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';
import AlertError from '@/components/alert-error';
import ConfirmDialog from '@/components/confirm-dialog';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import Pagination from '@/components/pagination';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
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
    const [saving, setSaving] = useState(false);
    const [deletingProcessing, setDeletingProcessing] = useState(false);
    const [deleteError, setDeleteError] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const visiblePermissionIds = permissions.data.map(
        (permission) => permission.id,
    );
    const allVisiblePermissionsSelected =
        visiblePermissionIds.length > 0 &&
        visiblePermissionIds.every((id) => selected.includes(id));
    const someVisiblePermissionsSelected = visiblePermissionIds.some((id) =>
        selected.includes(id),
    );

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
        setSaving(true);
        setError(null);
        const options = {
            preserveScroll: true,
            onSuccess: () => setFormOpen(false),
            onError: (errors: Record<string, string>) =>
                setError(
                    Object.values(errors)[0] ?? 'Unable to save permission.',
                ),
            onFinish: () => setSaving(false),
        };

        if (editing) {
            router.patch(
                permissionsUpdate({ permission: editing.id }),
                { name },
                options,
            );
        } else {
            router.post(permissionsStore(), { name }, options);
        }
    }

    function deleteOne() {
        if (!deleting) return;
        setDeletingProcessing(true);
        setDeleteError(null);
        router.delete(permissionsDestroy({ permission: deleting.id }), {
            preserveScroll: true,
            onSuccess: () => {
                setSelected((prev) => prev.filter((id) => id !== deleting.id));
                setDeleting(null);
            },
            onError: (errors: Record<string, string>) =>
                setDeleteError(
                    Object.values(errors)[0] ?? 'Unable to delete permission.',
                ),
            onFinish: () => setDeletingProcessing(false),
        });
    }

    function deleteSelected() {
        setDeletingProcessing(true);
        setDeleteError(null);
        router.delete(permissionsBulk.destroy(), {
            data: { ids: selected },
            preserveScroll: true,
            onSuccess: () => {
                setSelected([]);
                setBulkDeleteOpen(false);
            },
            onError: (errors: Record<string, string>) =>
                setDeleteError(
                    Object.values(errors)[0] ?? 'Unable to delete permissions.',
                ),
            onFinish: () => setDeletingProcessing(false),
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
                <div className="flex flex-wrap items-center gap-2">
                    <form
                        className="flex flex-1 items-center gap-2"
                        onSubmit={(event) => {
                            event.preventDefault();
                            applyFilters();
                        }}
                    >
                        <Input
                            aria-label="Search permissions"
                            className="max-w-sm"
                            value={query}
                            onChange={(event) => setQuery(event.target.value)}
                            placeholder="Search permissions..."
                        />
                        <Button type="submit">Search</Button>
                    </form>
                    {selected.length ? (
                        <>
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
                        </>
                    ) : null}
                </div>
                {deleteError ? (
                    <AlertError
                        errors={[deleteError]}
                        title="Unable to delete permission."
                    />
                ) : null}
                <Card>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>
                                        <Checkbox
                                            aria-label="Select all permissions"
                                            checked={
                                                allVisiblePermissionsSelected
                                                    ? true
                                                    : someVisiblePermissionsSelected
                                                      ? 'indeterminate'
                                                      : false
                                            }
                                            onCheckedChange={(checked) =>
                                                setSelected((prev) =>
                                                    checked === true
                                                        ? [
                                                              ...new Set([
                                                                  ...prev,
                                                                  ...visiblePermissionIds,
                                                              ]),
                                                          ]
                                                        : prev.filter(
                                                              (id) =>
                                                                  !visiblePermissionIds.includes(
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
                                                <Checkbox
                                                    aria-label={`Select ${permission.name}`}
                                                    checked={selected.includes(
                                                        permission.id,
                                                    )}
                                                    onCheckedChange={(
                                                        checked,
                                                    ) =>
                                                        setSelected((prev) =>
                                                            checked === true
                                                                ? [
                                                                      ...new Set(
                                                                          [
                                                                              ...prev,
                                                                              permission.id,
                                                                          ],
                                                                      ),
                                                                  ]
                                                                : prev.filter(
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
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger
                                                        asChild
                                                    >
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                        >
                                                            <MoreHorizontal className="size-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem
                                                            onClick={() =>
                                                                setViewing(
                                                                    permission,
                                                                )
                                                            }
                                                        >
                                                            <Eye className="mr-2 h-4 w-4" />
                                                            View
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            onClick={() =>
                                                                openEdit(
                                                                    permission,
                                                                )
                                                            }
                                                        >
                                                            <Pencil className="mr-2 h-4 w-4" />
                                                            Edit
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            onClick={() =>
                                                                setDeleting(
                                                                    permission,
                                                                )
                                                            }
                                                        >
                                                            <Trash2 className="mr-2 h-4 w-4" />
                                                            Delete
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
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
                <SheetContent className="w-full overflow-y-auto sm:max-w-sm">
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
                                required
                            />
                        </div>
                        <InputError message={error ?? undefined} />
                    </div>
                    <SheetFooter>
                        <Button
                            type="button"
                            variant="outline"
                            disabled={saving}
                            onClick={() => setFormOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            disabled={saving || !name.trim()}
                            onClick={save}
                        >
                            {saving && <Spinner />}
                            {saving
                                ? 'Saving...'
                                : editing
                                  ? 'Update permission'
                                  : 'Create permission'}
                        </Button>
                    </SheetFooter>
                </SheetContent>
            </Sheet>

            {/* View Permission Sheet */}
            <Sheet
                open={viewing !== null}
                onOpenChange={(open) => !open && setViewing(null)}
            >
                <SheetContent className="w-full overflow-y-auto sm:max-w-sm">
                    <SheetHeader>
                        <SheetTitle>Permission details</SheetTitle>
                        <SheetDescription>
                            Review this permission and where it is used.
                        </SheetDescription>
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
                confirmLabel={deletingProcessing ? 'Deleting...' : 'Delete'}
                destructive
                processing={deletingProcessing}
                onConfirm={deleteOne}
            />
            <ConfirmDialog
                open={bulkDeleteOpen}
                onOpenChange={setBulkDeleteOpen}
                title="Delete selected permissions?"
                description="Roles with these permissions will lose them."
                confirmLabel={
                    deletingProcessing ? 'Deleting...' : 'Delete selected'
                }
                destructive
                processing={deletingProcessing}
                onConfirm={deleteSelected}
            />
        </>
    );
}
