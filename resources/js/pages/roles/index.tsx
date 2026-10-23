import { Head, router, usePage } from '@inertiajs/react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import ConfirmDialog from '@/components/confirm-dialog';
import Heading from '@/components/heading';
import Pagination from '@/components/pagination';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
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
    index as rolesIndex,
    store as rolesStore,
    update as rolesUpdate,
    destroy as rolesDestroy,
} from '@/routes/roles';
import rolesBulk from '@/routes/roles/bulk';
import type { Team } from '@/types';

type Permission = {
    id: number;
    name: string;
    guardName: string;
};

type PermissionGroup = {
    resource: string;
    label: string;
    permissions: Permission[];
};

type Role = {
    id: number;
    name: string;
    guardName: string;
    permissions: Permission[];
    createdAt: string | null;
    updatedAt: string | null;
};

type Paginator = {
    data: Role[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
};

export default function RolesIndex({
    roles,
    permissions,
    groupedPermissions,
    filters,
}: {
    roles: Paginator;
    permissions: Permission[];
    groupedPermissions: PermissionGroup[];
    filters: { q: string; perPage: number };
}) {
    const { currentTeam } = usePage<{ currentTeam?: Team | null }>().props;

    const [query, setQuery] = useState(filters.q);
    const [name, setName] = useState('');
    const [selectedPermissions, setSelectedPermissions] = useState<number[]>([]);
    const [editing, setEditing] = useState<Role | null>(null);
    const [viewing, setViewing] = useState<Role | null>(null);
    const [formOpen, setFormOpen] = useState(false);
    const [deleting, setDeleting] = useState<Role | null>(null);
    const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
    const [selected, setSelected] = useState<number[]>([]);
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());

    function applyFilters(page = 1, perPage = filters.perPage) {
        router.get(
            rolesIndex(),
            { q: query || undefined, page, perPage },
            { preserveState: true, preserveScroll: true, replace: true },
        );
    }

    function openCreate() {
        setEditing(null);
        setName('');
        setSelectedPermissions([]);
        setError(null);
        setFormOpen(true);
    }

    function openEdit(role: Role) {
        setEditing(role);
        setName(role.name);
        setSelectedPermissions(role.permissions.map((p) => p.id));
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
                setError(Object.values(errors)[0] ?? 'Unable to save role.'),
            onFinish: () => setProcessing(false),
        };

        if (editing) {
            router.patch(rolesUpdate({ role: editing.id }), {
                name,
                permissions: selectedPermissions,
            }, options);
        } else {
            router.post(rolesStore(), {
                name,
                permissions: selectedPermissions,
            }, options);
        }
    }

    function deleteOne() {
        if (!deleting) return;
        setProcessing(true);
        router.delete(rolesDestroy({ role: deleting.id }), {
            preserveScroll: true,
            onSuccess: () => setDeleting(null),
            onFinish: () => setProcessing(false),
        });
    }

    function deleteSelected() {
        setProcessing(true);
        router.delete(rolesBulk.destroy(), {
            data: { ids: selected },
            preserveScroll: true,
            onSuccess: () => {
                setSelected([]);
                setBulkDeleteOpen(false);
            },
            onFinish: () => setProcessing(false),
        });
    }

    function togglePermission(permissionId: number) {
        setSelectedPermissions((prev) =>
            prev.includes(permissionId)
                ? prev.filter((id) => id !== permissionId)
                : [...prev, permissionId],
        );
    }

    function selectAllPermissions() {
        if (selectedPermissions.length === permissions.length) {
            setSelectedPermissions([]);
        } else {
            setSelectedPermissions(permissions.map((p) => p.id));
        }
    }

    function toggleGroup(resource: string) {
        setCollapsedGroups((prev) => {
            const next = new Set(prev);
            if (next.has(resource)) {
                next.delete(resource);
            } else {
                next.add(resource);
            }
            return next;
        });
    }

    function expandAllGroups() {
        setCollapsedGroups(new Set());
    }

    function collapseAllGroups() {
        setCollapsedGroups(new Set(groupedPermissions.map((g) => g.resource)));
    }

    function selectGroupPermissions(resource: string, groupPermissions: Permission[]) {
        const groupIds = groupPermissions.map((p) => p.id);
        const allSelected = groupIds.every((id) => selectedPermissions.includes(id));

        if (allSelected) {
            setSelectedPermissions((prev) => prev.filter((id) => !groupIds.includes(id)));
        } else {
            setSelectedPermissions((prev) => {
                const next = [...prev];
                groupIds.forEach((id) => {
                    if (!next.includes(id)) next.push(id);
                });
                return next;
            });
        }
    }

    function getGroupSelectedCount(resource: string, groupPermissions: Permission[]): number {
        return groupPermissions.filter((p) => selectedPermissions.includes(p.id)).length;
    }

    function formatPermissionLabel(name: string): string {
        // Convert "view patients" to "View patients", "view_any" to "View any"
        return name
            .replace(/_/g, ' ')
            .replace(/^./, (c) => c.toUpperCase());
    }

    return (
        <>
            <Head title="Roles" />
            <div className="flex w-full flex-col space-y-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <Heading
                        variant="small"
                        title="Roles"
                        description="Manage roles and assign permissions to control user access."
                    />
                    <Button onClick={openCreate}>Create role</Button>
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
                        placeholder="Search roles..."
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
                                        aria-label="Select all roles"
                                        checked={
                                            roles.data.length > 0 &&
                                            roles.data.every((role) =>
                                                selected.includes(role.id),
                                            )
                                        }
                                        onChange={(event) =>
                                            setSelected(
                                                event.target.checked
                                                    ? [
                                                          ...new Set([
                                                              ...selected,
                                                              ...roles.data.map(
                                                                  (role) =>
                                                                      role.id,
                                                              ),
                                                          ]),
                                                      ]
                                                    : selected.filter(
                                                          (id) =>
                                                              !roles.data.some(
                                                                  (role) =>
                                                                      role.id ===
                                                                      id,
                                                              ),
                                                      ),
                                            )
                                        }
                                    />
                                </TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Guard</TableHead>
                                <TableHead>Permissions</TableHead>
                                <TableHead>Created</TableHead>
                                <TableHead className="text-right">
                                    Actions
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {roles.data.length === 0 ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={6}
                                        className="py-10 text-center text-muted-foreground"
                                    >
                                        No roles found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                roles.data.map((role) => (
                                    <TableRow key={role.id}>
                                        <TableCell>
                                            <input
                                                type="checkbox"
                                                aria-label={`Select ${role.name}`}
                                                checked={selected.includes(
                                                    role.id,
                                                )}
                                                onChange={(event) =>
                                                    setSelected(
                                                        event.target.checked
                                                            ? [
                                                                  ...selected,
                                                                  role.id,
                                                              ]
                                                            : selected.filter(
                                                                  (id) =>
                                                                      id !==
                                                                      role.id,
                                                              ),
                                                    )
                                                }
                                            />
                                        </TableCell>
                                        <TableCell className="font-medium">
                                            {role.name}
                                        </TableCell>
                                        <TableCell>
                                            {role.guardName}
                                        </TableCell>
                                        <TableCell>
                                            {role.permissions.length} assigned
                                        </TableCell>
                                        <TableCell>
                                            {role.createdAt
                                                ? new Date(
                                                      role.createdAt,
                                                  ).toLocaleString()
                                                : '—'}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-1">
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() =>
                                                        setViewing(role)
                                                    }
                                                >
                                                    View
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() =>
                                                        openEdit(role)
                                                    }
                                                >
                                                    Edit
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() =>
                                                        setDeleting(role)
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
                        currentPage: roles.current_page,
                        lastPage: roles.last_page,
                        perPage: roles.per_page,
                        total: roles.total,
                    }}
                    onPageChange={(page) => applyFilters(page)}
                    onPerPageChange={(perPage) => applyFilters(1, perPage)}
                />
            </div>

            {/* Create/Edit Role Sheet */}
            <Sheet open={formOpen} onOpenChange={setFormOpen}>
                <SheetContent className="sm:max-w-lg overflow-y-auto">
                    <SheetHeader>
                        <SheetTitle>
                            {editing ? 'Edit role' : 'Create role'}
                        </SheetTitle>
                        <SheetDescription>
                            {editing
                                ? 'Update the role name and its assigned permissions.'
                                : 'Create a new role and assign permissions to it.'}
                        </SheetDescription>
                    </SheetHeader>
                    <div className="space-y-4 px-4 py-5">
                        <div className="space-y-2">
                            <Label htmlFor="role-name">Role name</Label>
                            <Input
                                id="role-name"
                                value={name}
                                onChange={(event) =>
                                    setName(event.target.value)
                                }
                                placeholder="e.g. Administrator"
                            />
                        </div>

                        {groupedPermissions.length > 0 && (
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <Label>Permissions</Label>
                                    <div className="flex items-center gap-1">
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={expandAllGroups}
                                            className="text-xs"
                                        >
                                            Expand all
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={collapseAllGroups}
                                            className="text-xs"
                                        >
                                            Collapse all
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={selectAllPermissions}
                                        >
                                            {selectedPermissions.length ===
                                            permissions.length
                                                ? 'Deselect all'
                                                : 'Select all'}
                                        </Button>
                                    </div>
                                </div>
                                <div className="max-h-80 space-y-2 overflow-y-auto rounded-lg border p-3">
                                    {groupedPermissions.map((group) => {
                                        const isCollapsed = collapsedGroups.has(group.resource);
                                        const selectedCount = getGroupSelectedCount(group.resource, group.permissions);
                                        const totalCount = group.permissions.length;
                                        const allSelected = selectedCount === totalCount && totalCount > 0;

                                        return (
                                            <div
                                                key={group.resource}
                                                className="rounded-md border"
                                            >
                                                <button
                                                    type="button"
                                                    className="flex w-full items-center justify-between px-3 py-2 text-left hover:bg-muted/50"
                                                    onClick={() => toggleGroup(group.resource)}
                                                >
                                                    <div className="flex items-center gap-2">
                                                        {isCollapsed ? (
                                                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                                        ) : (
                                                            <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                                        )}
                                                        <span className="text-sm font-medium">
                                                            {group.label}
                                                        </span>
                                                        <Badge variant="secondary" className="ml-1">
                                                            {totalCount}
                                                        </Badge>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        {selectedCount > 0 && (
                                                            <Badge variant="default" className="text-xs">
                                                                {selectedCount}/{totalCount}
                                                            </Badge>
                                                        )}
                                                        <Checkbox
                                                            checked={allSelected}
                                                            onCheckedChange={() =>
                                                                selectGroupPermissions(group.resource, group.permissions)
                                                            }
                                                        />
                                                    </div>
                                                </button>
                                                {!isCollapsed && (
                                                    <div className="px-3 pb-2 space-y-1">
                                                        {group.permissions.map((permission) => (
                                                            <div
                                                                key={permission.id}
                                                                className="flex items-center space-x-2 pl-6"
                                                            >
                                                                <Checkbox
                                                                    id={`perm-${group.resource}-${permission.id}`}
                                                                    checked={selectedPermissions.includes(
                                                                        permission.id,
                                                                    )}
                                                                    onCheckedChange={() =>
                                                                        togglePermission(
                                                                            permission.id,
                                                                        )
                                                                    }
                                                                />
                                                                <Label
                                                                    htmlFor={`perm-${group.resource}-${permission.id}`}
                                                                    className="text-sm font-normal flex-1 cursor-pointer"
                                                                >
                                                                    {formatPermissionLabel(permission.name)}
                                                                </Label>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    {selectedPermissions.length} of{' '}
                                    {permissions.length} permissions selected
                                </p>
                            </div>
                        )}

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
                        <Button disabled={processing || !name.trim()} onClick={save}>
                            {editing ? 'Update role' : 'Create role'}
                        </Button>
                    </SheetFooter>
                </SheetContent>
            </Sheet>

            {/* View Role Sheet */}
            <Sheet
                open={viewing !== null}
                onOpenChange={(open) => !open && setViewing(null)}
            >
                <SheetContent className="sm:max-w-lg overflow-y-auto">
                    <SheetHeader>
                        <SheetTitle>Role details</SheetTitle>
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
                        {viewing?.permissions.length ? (
                            <div className="space-y-2">
                                <span className="text-muted-foreground">
                                    Permissions:
                                </span>
                                <div className="flex flex-wrap gap-2">
                                    {viewing.permissions.map((p) => (
                                        <span
                                            key={p.id}
                                            className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium"
                                        >
                                            {p.name}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        ) : null}
                    </div>
                </SheetContent>
            </Sheet>

            <ConfirmDialog
                open={deleting !== null}
                onOpenChange={(open) => !open && setDeleting(null)}
                title="Delete role?"
                description={`Delete "${deleting?.name}"? Users with this role will lose those permissions.`}
                confirmLabel="Delete"
                destructive
                processing={processing}
                onConfirm={deleteOne}
            />
            <ConfirmDialog
                open={bulkDeleteOpen}
                onOpenChange={setBulkDeleteOpen}
                title="Delete selected roles?"
                description="Users with these roles will lose those permissions."
                confirmLabel="Delete selected"
                destructive
                processing={processing}
                onConfirm={deleteSelected}
            />
        </>
    );
}
