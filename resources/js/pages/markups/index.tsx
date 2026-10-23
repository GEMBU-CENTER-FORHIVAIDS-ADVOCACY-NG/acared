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
import markupRoutes from '@/routes/markups';
import type { Team } from '@/types';

type Markup = {
    id: number;
    name: string;
    value: number;
    createdAt: string | null;
    updatedAt: string | null;
};
type Paginator = {
    data: Markup[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
};

export default function MarkupsIndex({
    markups,
    filters,
}: {
    markups: Paginator;
    filters: { q: string; perPage: number };
}) {
    const { currentTeam } = usePage<{ currentTeam?: Team | null }>().props;
    const teamSlug = currentTeam?.slug ?? '';
    const [query, setQuery] = useState(filters.q);
    const [value, setValue] = useState('5');
    const [editing, setEditing] = useState<Markup | null>(null);
    const [viewing, setViewing] = useState<Markup | null>(null);
    const [formOpen, setFormOpen] = useState(false);
    const [deleting, setDeleting] = useState<Markup | null>(null);
    const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
    const [selected, setSelected] = useState<number[]>([]);
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    function applyFilters(page = 1, perPage = filters.perPage) {
        router.get(
            markupRoutes.index.url(teamSlug, {
                query: { q: query || undefined, page, perPage },
            }),
            {},
            { preserveState: true, preserveScroll: true, replace: true },
        );
    }
    function openCreate() {
        setEditing(null);
        setValue('5');
        setError(null);
        setFormOpen(true);
    }
    function openEdit(markup: Markup) {
        setEditing(markup);
        setValue(String(markup.value));
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
                setError(Object.values(errors)[0] ?? 'Unable to save markup.'),
            onFinish: () => setProcessing(false),
        };
        if (editing)
            router.patch(
                markupRoutes.update.url({
                    current_team: teamSlug,
                    markup: editing.id,
                }),
                { value: Number(value) },
                options,
            );
        else
            router.post(
                markupRoutes.store.url(teamSlug),
                { value: Number(value) },
                options,
            );
    }
    function deleteOne() {
        if (!deleting) return;
        setProcessing(true);
        router.delete(
            markupRoutes.destroy.url({
                current_team: teamSlug,
                markup: deleting.id,
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
        router.delete(markupRoutes.bulk.destroy.url(teamSlug), {
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
            <Head title="Markups" />
            <div className="flex w-full flex-col space-y-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <Heading
                        variant="small"
                        title="Markups"
                        description="Set the percentage increases used when receiving inventory."
                    />
                    <Button onClick={openCreate}>Create markup</Button>
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
                        placeholder="Search markups..."
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
                                        aria-label="Select all markups"
                                        checked={
                                            markups.data.length > 0 &&
                                            markups.data.every((markup) =>
                                                selected.includes(markup.id),
                                            )
                                        }
                                        onChange={(event) =>
                                            setSelected(
                                                event.target.checked
                                                    ? [
                                                          ...new Set([
                                                              ...selected,
                                                              ...markups.data.map(
                                                                  (markup) =>
                                                                      markup.id,
                                                              ),
                                                          ]),
                                                      ]
                                                    : selected.filter(
                                                          (id) =>
                                                              !markups.data.some(
                                                                  (markup) =>
                                                                      markup.id ===
                                                                      id,
                                                              ),
                                                      ),
                                            )
                                        }
                                    />
                                </TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Value</TableHead>
                                <TableHead>Created</TableHead>
                                <TableHead>Updated</TableHead>
                                <TableHead className="text-right">
                                    Actions
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {markups.data.length === 0 ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={6}
                                        className="py-10 text-center text-muted-foreground"
                                    >
                                        No markups found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                markups.data.map((markup) => (
                                    <TableRow key={markup.id}>
                                        <TableCell>
                                            <input
                                                type="checkbox"
                                                aria-label={`Select ${markup.name}`}
                                                checked={selected.includes(
                                                    markup.id,
                                                )}
                                                onChange={(event) =>
                                                    setSelected(
                                                        event.target.checked
                                                            ? [
                                                                  ...selected,
                                                                  markup.id,
                                                              ]
                                                            : selected.filter(
                                                                  (id) =>
                                                                      id !==
                                                                      markup.id,
                                                              ),
                                                    )
                                                }
                                            />
                                        </TableCell>
                                        <TableCell className="font-medium">
                                            {markup.name}
                                        </TableCell>
                                        <TableCell>{markup.value}%</TableCell>
                                        <TableCell>
                                            {markup.createdAt
                                                ? new Date(
                                                      markup.createdAt,
                                                  ).toLocaleString()
                                                : '—'}
                                        </TableCell>
                                        <TableCell>
                                            {markup.updatedAt
                                                ? new Date(
                                                      markup.updatedAt,
                                                  ).toLocaleString()
                                                : '—'}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-1">
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() =>
                                                        setViewing(markup)
                                                    }
                                                >
                                                    View
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() =>
                                                        openEdit(markup)
                                                    }
                                                >
                                                    Edit
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() =>
                                                        setDeleting(markup)
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
                        currentPage: markups.current_page,
                        lastPage: markups.last_page,
                        perPage: markups.per_page,
                        total: markups.total,
                    }}
                    onPageChange={(page) => applyFilters(page)}
                    onPerPageChange={(perPage) => applyFilters(1, perPage)}
                />
            </div>
            <Sheet open={formOpen} onOpenChange={setFormOpen}>
                <SheetContent className="sm:max-w-sm">
                    <SheetHeader>
                        <SheetTitle>
                            {editing ? 'Edit markup' : 'Create markup'}
                        </SheetTitle>
                        <SheetDescription>
                            Select a five point increment. The name is generated
                            from its percentage.
                        </SheetDescription>
                    </SheetHeader>
                    <div className="space-y-4 px-4 py-5">
                        <div className="space-y-2">
                            <Label htmlFor="markup-value">
                                Increase: {value}%
                            </Label>
                            <Input
                                id="markup-value"
                                type="range"
                                min="0"
                                max="100"
                                step="5"
                                value={value}
                                onChange={(event) =>
                                    setValue(event.target.value)
                                }
                            />
                        </div>
                        <p className="text-sm text-muted-foreground">
                            {value}% Increase
                        </p>
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
                            Save markup
                        </Button>
                    </SheetFooter>
                </SheetContent>
            </Sheet>
            <Sheet
                open={viewing !== null}
                onOpenChange={(open) => !open && setViewing(null)}
            >
                <SheetContent className="sm:max-w-sm">
                    <SheetHeader>
                        <SheetTitle>Markup details</SheetTitle>
                    </SheetHeader>
                    <div className="space-y-3 px-4 py-5">
                        <p>
                            <span className="text-muted-foreground">Name:</span>{' '}
                            {viewing?.name}
                        </p>
                        <p>
                            <span className="text-muted-foreground">
                                Value:
                            </span>{' '}
                            {viewing?.value}%
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
                title="Delete markup?"
                description={`Delete ${deleting?.name ?? 'this markup'}? Purchase order items using it may also be removed.`}
                confirmLabel="Delete"
                destructive
                processing={processing}
                onConfirm={deleteOne}
            />
            <ConfirmDialog
                open={bulkDeleteOpen}
                onOpenChange={setBulkDeleteOpen}
                title="Delete selected markups?"
                description="Purchase order items using these markups may also be affected."
                confirmLabel="Delete selected"
                destructive
                processing={processing}
                onConfirm={deleteSelected}
            />
        </>
    );
}
