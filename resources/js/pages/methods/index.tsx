import { Head, router, usePage } from '@inertiajs/react';
import { Eye, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';
import ConfirmDialog from '@/components/confirm-dialog';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import Pagination from '@/components/pagination';
import { Button } from '@/components/ui/button';
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
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
    const [deleteError, setDeleteError] = useState<string | null>(null);

    function applyFilters(page = 1, perPage = filters.perPage, search = query) {
        router.get(
            methodRoutes.index.url(teamSlug, {
                query: { q: search || undefined, page, perPage },
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
        setFieldErrors({});
        setFormOpen(true);
    }
    function openEdit(method: Method) {
        setEditing(method);
        setName(method.name);
        setDescription(method.description ?? '');
        setError(null);
        setFieldErrors({});
        setFormOpen(true);
    }
    function save() {
        setProcessing(true);
        setError(null);
        setFieldErrors({});
        const options = {
            preserveScroll: true,
            onSuccess: () => setFormOpen(false),
            onError: (errors: Record<string, string>) => {
                setFieldErrors(errors);
                setError(
                    Object.values(errors)[0] ??
                        'Unable to save payment method.',
                );
            },
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
        setDeleteError(null);
        router.delete(
            methodRoutes.destroy.url({
                current_team: teamSlug,
                method: deleting.id,
            }),
            {
                preserveScroll: true,
                onSuccess: () => setDeleting(null),
                onError: (errors: Record<string, string>) =>
                    setDeleteError(
                        Object.values(errors)[0] ??
                            'Unable to delete payment method.',
                    ),
                onFinish: () => setProcessing(false),
            },
        );
    }
    function deleteSelected() {
        setProcessing(true);
        setDeleteError(null);
        router.delete(methodRoutes.bulk.destroy.url(teamSlug), {
            data: { ids: selected },
            preserveScroll: true,
            onSuccess: () => {
                setSelected([]);
                setBulkDeleteOpen(false);
            },
            onError: (errors: Record<string, string>) =>
                setDeleteError(
                    Object.values(errors)[0] ??
                        'Unable to delete payment methods.',
                ),
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
                    <Button onClick={openCreate} disabled={processing}>
                        Create method
                    </Button>
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
                            aria-label="Search payment methods"
                            className="min-w-0 flex-1 sm:max-w-sm"
                            value={query}
                            onChange={(event) => setQuery(event.target.value)}
                            placeholder="Search payment methods..."
                        />
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Searching...' : 'Search'}
                        </Button>
                    </form>
                    {selected.length ? (
                        <>
                            <span className="text-sm text-muted-foreground">
                                {selected.length} selected
                            </span>
                            <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => {
                                    setDeleteError(null);
                                    setBulkDeleteOpen(true);
                                }}
                                disabled={processing}
                            >
                                Delete selected
                            </Button>
                        </>
                    ) : null}
                </div>
                <Card>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>
                                            <input
                                                type="checkbox"
                                                aria-label="Select all payment methods"
                                                checked={
                                                    methods.data.length > 0 &&
                                                    methods.data.every(
                                                        (method) =>
                                                            selected.includes(
                                                                method.id,
                                                            ),
                                                    )
                                                }
                                                onChange={(event) =>
                                                    setSelected(
                                                        event.target.checked
                                                            ? [
                                                                  ...new Set([
                                                                      ...selected,
                                                                      ...methods.data.map(
                                                                          (
                                                                              method,
                                                                          ) =>
                                                                              method.id,
                                                                      ),
                                                                  ]),
                                                              ]
                                                            : selected.filter(
                                                                  (id) =>
                                                                      !methods.data.some(
                                                                          (
                                                                              method,
                                                                          ) =>
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
                                                <div className="flex flex-col items-center gap-2">
                                                    <span>
                                                        No payment methods
                                                        found.
                                                    </span>
                                                    {filters.q ? (
                                                        <Button
                                                            type="button"
                                                            variant="link"
                                                            size="sm"
                                                            disabled={
                                                                processing
                                                            }
                                                            onClick={() => {
                                                                setQuery('');
                                                                applyFilters(
                                                                    1,
                                                                    filters.perPage,
                                                                    '',
                                                                );
                                                            }}
                                                        >
                                                            Clear filters
                                                        </Button>
                                                    ) : null}
                                                </div>
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
                                                                event.target
                                                                    .checked
                                                                    ? [
                                                                          ...selected,
                                                                          method.id,
                                                                      ]
                                                                    : selected.filter(
                                                                          (
                                                                              id,
                                                                          ) =>
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
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger
                                                            asChild
                                                        >
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                aria-label={`Actions for ${method.name}`}
                                                                disabled={
                                                                    processing
                                                                }
                                                            >
                                                                <MoreHorizontal className="size-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuItem
                                                                onClick={() =>
                                                                    setViewing(
                                                                        method,
                                                                    )
                                                                }
                                                            >
                                                                <Eye className="mr-2 h-4 w-4" />
                                                                View
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem
                                                                onClick={() =>
                                                                    openEdit(
                                                                        method,
                                                                    )
                                                                }
                                                            >
                                                                <Pencil className="mr-2 h-4 w-4" />
                                                                Edit
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem
                                                                onClick={() => {
                                                                    setDeleteError(
                                                                        null,
                                                                    );
                                                                    setDeleting(
                                                                        method,
                                                                    );
                                                                }}
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
                        </div>
                    </CardContent>
                </Card>
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
            <Sheet
                open={formOpen}
                onOpenChange={(open) => {
                    if (!open && !processing) {
                        setFormOpen(false);
                    }
                }}
            >
                <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
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
                    <form
                        id="method-form"
                        className="space-y-4 px-4 py-5"
                        onSubmit={(event) => {
                            event.preventDefault();
                            save();
                        }}
                    >
                        <div className="space-y-2">
                            <Label htmlFor="method-name">Name</Label>
                            <Input
                                id="method-name"
                                value={name}
                                onChange={(event) =>
                                    setName(event.target.value)
                                }
                                aria-invalid={Boolean(fieldErrors.name)}
                            />
                            <InputError message={fieldErrors.name} />
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
                                aria-invalid={Boolean(fieldErrors.description)}
                            />
                            <InputError message={fieldErrors.description} />
                        </div>
                        {error ? (
                            <p
                                className="text-sm text-destructive"
                                role="alert"
                            >
                                {error}
                            </p>
                        ) : null}
                    </form>
                    <SheetFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setFormOpen(false)}
                            disabled={processing}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            form="method-form"
                            disabled={processing}
                        >
                            {processing ? 'Saving...' : 'Save method'}
                        </Button>
                    </SheetFooter>
                </SheetContent>
            </Sheet>
            <Sheet
                open={viewing !== null}
                onOpenChange={(open) => !open && setViewing(null)}
            >
                <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
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
                onOpenChange={(open) => {
                    if (!open && !processing) {
                        setDeleting(null);
                    }
                }}
                destructive
                title="Delete payment method?"
                description={`Delete ${deleting?.name ?? 'this payment method'}?`}
                confirmLabel={processing ? 'Deleting...' : 'Delete'}
                processing={processing}
                onConfirm={deleteOne}
            />
            <ConfirmDialog
                open={bulkDeleteOpen}
                onOpenChange={(open) => {
                    if (!open && !processing) {
                        setBulkDeleteOpen(false);
                    }
                }}
                destructive
                title="Delete selected payment methods?"
                description="This removes the selected methods from settings."
                confirmLabel={processing ? 'Deleting...' : 'Delete selected'}
                processing={processing}
                onConfirm={deleteSelected}
            />
            {deleteError ? (
                <p className="text-sm text-destructive" role="alert">
                    {deleteError}
                </p>
            ) : null}
        </>
    );
}
