import { Head, router, usePage } from '@inertiajs/react';
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
import { Textarea } from '@/components/ui/textarea';
import methodRoutes from '@/routes/methods';
import type { Team } from '@/types';

type Method = {
    id: number;
    name: string;
    description: string | null;
    createdAt: string | null;
    updatedAt: string | null;
};
type Paginator = {
    data: Method[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
};

export default function MethodsIndex({
    methods,
    filters,
}: {
    methods: Paginator;
    filters: { q: string; perPage: number };
}) {
    const { currentTeam } = usePage<{ currentTeam?: Team | null }>().props;
    const teamSlug = currentTeam?.slug ?? '';
    const [query, setQuery] = useState(filters.q);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [editing, setEditing] = useState<Method | null>(null);
    const [viewing, setViewing] = useState<Method | null>(null);
    const [formOpen, setFormOpen] = useState(false);
    const [deleting, setDeleting] = useState<Method | null>(null);
    const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
    const [selected, setSelected] = useState<number[]>([]);
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    function applyFilters(page = 1, perPage = filters.perPage) {
        router.get(
            methodRoutes.index.url(teamSlug, {
                query: { q: query || undefined, page, perPage },
            }),
            {},
            { preserveState: true, preserveScroll: true, replace: true },
        );
    }
    function openCreate() {
        setEditing(null);
        setName('');
        setDescription('');
        setError(null);
        setFormOpen(true);
    }
    function openEdit(method: Method) {
        setEditing(method);
        setName(method.name);
        setDescription(method.description ?? '');
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
                setError(
                    Object.values(errors)[0] ??
                        'Unable to save payment method.',
                ),
            onFinish: () => setProcessing(false),
        };
        if (editing)
            router.patch(
                methodRoutes.update.url({
                    current_team: teamSlug,
                    method: editing.id,
                }),
                { name, description: description || null },
                options,
            );
        else
            router.post(
                methodRoutes.store.url(teamSlug),
                { name, description: description || null },
                options,
            );
    }
    function deleteOne() {
        if (!deleting) return;
        setProcessing(true);
        router.delete(
            methodRoutes.destroy.url({
                current_team: teamSlug,
                method: deleting.id,
            }),
            {
                preserveScroll: true,
                onSuccess: () => setDeleting(null),
                onFinish: () => setProcessing(false),
            },
        );
    }
    function deleteSelected() {
        setProcessing(true);
        router.delete(methodRoutes.bulk.destroy.url(teamSlug), {
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
            <Head title="Payment methods" />
            <div className="flex w-full flex-col space-y-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <Heading
                        variant="small"
                        title="Payment methods"
                        description="Manage the payment methods available for billing and wallet transactions."
                    />
                    <Button onClick={openCreate}>Create method</Button>
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
                        placeholder="Search payment methods..."
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
                                        aria-label="Select all payment methods"
                                        checked={
                                            methods.data.length > 0 &&
                                            methods.data.every((method) =>
                                                selected.includes(method.id),
                                            )
                                        }
                                        onChange={(event) =>
                                            setSelected(
                                                event.target.checked
                                                    ? [
                                                          ...new Set([
                                                              ...selected,
                                                              ...methods.data.map(
                                                                  (method) =>
                                                                      method.id,
                                                              ),
                                                          ]),
                                                      ]
                                                    : selected.filter(
                                                          (id) =>
                                                              !methods.data.some(
                                                                  (method) =>
                                                                      method.id ===
                                                                      id,
                                                              ),
                                                      ),
                                            )
                                        }
                                    />
                                </TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead>Created</TableHead>
                                <TableHead>Updated</TableHead>
                                <TableHead className="text-right">
                                    Actions
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {methods.data.length === 0 ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={6}
                                        className="py-10 text-center text-muted-foreground"
                                    >
                                        No payment methods found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                methods.data.map((method) => (
                                    <TableRow key={method.id}>
                                        <TableCell>
                                            <input
                                                type="checkbox"
                                                aria-label={`Select ${method.name}`}
                                                checked={selected.includes(
                                                    method.id,
                                                )}
                                                onChange={(event) =>
                                                    setSelected(
                                                        event.target.checked
                                                            ? [
                                                                  ...selected,
                                                                  method.id,
                                                              ]
                                                            : selected.filter(
                                                                  (id) =>
                                                                      id !==
                                                                      method.id,
                                                              ),
                                                    )
                                                }
                                            />
                                        </TableCell>
                                        <TableCell className="font-medium">
                                            {method.name}
                                        </TableCell>
                                        <TableCell className="max-w-md truncate text-muted-foreground">
                                            {method.description ?? '—'}
                                        </TableCell>
                                        <TableCell>
                                            {method.createdAt
                                                ? new Date(
                                                      method.createdAt,
                                                  ).toLocaleString()
                                                : '—'}
                                        </TableCell>
                                        <TableCell>
                                            {method.updatedAt
                                                ? new Date(
                                                      method.updatedAt,
                                                  ).toLocaleString()
                                                : '—'}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-1">
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() =>
                                                        setViewing(method)
                                                    }
                                                >
                                                    View
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() =>
                                                        openEdit(method)
                                                    }
                                                >
                                                    Edit
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() =>
                                                        setDeleting(method)
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
                        currentPage: methods.current_page,
                        lastPage: methods.last_page,
                        perPage: methods.per_page,
                        total: methods.total,
                    }}
                    onPageChange={(page) => applyFilters(page)}
                    onPerPageChange={(perPage) => applyFilters(1, perPage)}
                />
            </div>
            <Sheet open={formOpen} onOpenChange={setFormOpen}>
                <SheetContent className="sm:max-w-lg">
                    <SheetHeader>
                        <SheetTitle>
                            {editing
                                ? 'Edit payment method'
                                : 'Create payment method'}
                        </SheetTitle>
                        <SheetDescription>
                            Names must be unique across the workspace.
                        </SheetDescription>
                    </SheetHeader>
                    <div className="space-y-4 px-4 py-5">
                        <div className="space-y-2">
                            <Label htmlFor="method-name">Name</Label>
                            <Input
                                id="method-name"
                                value={name}
                                onChange={(event) =>
                                    setName(event.target.value)
                                }
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="method-description">
                                Description
                            </Label>
                            <Textarea
                                id="method-description"
                                value={description}
                                onChange={(event) =>
                                    setDescription(event.target.value)
                                }
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
                        <Button disabled={processing} onClick={save}>
                            Save method
                        </Button>
                    </SheetFooter>
                </SheetContent>
            </Sheet>
            <Sheet
                open={viewing !== null}
                onOpenChange={(open) => !open && setViewing(null)}
            >
                <SheetContent className="sm:max-w-lg">
                    <SheetHeader>
                        <SheetTitle>{viewing?.name}</SheetTitle>
                        <SheetDescription>
                            Payment method details
                        </SheetDescription>
                    </SheetHeader>
                    <div className="space-y-3 px-4 py-5">
                        <p>{viewing?.description ?? 'No description.'}</p>
                        <p className="text-sm text-muted-foreground">
                            Created:{' '}
                            {viewing?.createdAt
                                ? new Date(viewing.createdAt).toLocaleString()
                                : '—'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                            Updated:{' '}
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
                title="Delete payment method?"
                description={`Delete ${deleting?.name ?? 'this payment method'}?`}
                confirmLabel="Delete"
                destructive
                processing={processing}
                onConfirm={deleteOne}
            />
            <ConfirmDialog
                open={bulkDeleteOpen}
                onOpenChange={setBulkDeleteOpen}
                title="Delete selected payment methods?"
                description="This removes the selected methods from settings."
                confirmLabel="Delete selected"
                destructive
                processing={processing}
                onConfirm={deleteSelected}
            />
        </>
    );
}
