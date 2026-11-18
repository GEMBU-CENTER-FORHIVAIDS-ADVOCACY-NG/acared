import { Head, router, usePage } from '@inertiajs/react';
import { MoreHorizontal, Pencil, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Breadcrumbs } from '@/components/breadcrumbs';
import ConfirmDialog from '@/components/confirm-dialog';
import Heading from '@/components/heading';
import Pagination from '@/components/pagination';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
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
import type { Team } from '@/types';
import {
    destroy as destroyRoute,
    index as drugFormsIndex,
    store as storeRoute,
    update as updateRoute,
} from '@/routes/pharmacy/drug-forms';

type DrugForm = {
    id: number;
    name: string;
    inventoriesCount: number;
    createdAt: string | null;
    updatedAt: string | null;
};

export default function DrugFormsIndex({
    drugForms,
    filters,
}: {
    drugForms: {
        data: DrugForm[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    filters: { q: string; perPage: number };
}) {
    const { currentTeam } = usePage<{ currentTeam?: Team | null }>().props;
    const teamSlug = currentTeam?.slug ?? '';
    const [search, setSearch] = useState(filters.q);
    const [formOpen, setFormOpen] = useState(false);
    const [editing, setEditing] = useState<DrugForm | null>(null);
    const [deleting, setDeleting] = useState<DrugForm | null>(null);
    const [name, setName] = useState('');
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    function applyFilters(next: {
        q?: string;
        perPage?: number;
        page?: number;
    }) {
        router.get(
            drugFormsIndex.url(teamSlug),
            {
                q: (next.q ?? filters.q) || undefined,
                perPage: next.perPage ?? filters.perPage,
                page: next.page ?? 1,
            },
            { preserveState: true, preserveScroll: true, replace: true },
        );
    }

    function openCreate() {
        setEditing(null);
        setName('');
        setError(null);
        setFormOpen(true);
    }

    function openEdit(drugForm: DrugForm) {
        setEditing(drugForm);
        setName(drugForm.name);
        setError(null);
        setFormOpen(true);
    }

    function submitForm() {
        setProcessing(true);
        setError(null);
        const options = {
            preserveScroll: true,
            onSuccess: () => setFormOpen(false),
            onError: (errors: Record<string, string>) =>
                setError(
                    Object.values(errors)[0] ?? 'Unable to save drug form.',
                ),
            onFinish: () => setProcessing(false),
        };

        if (editing) {
            router.patch(
                updateRoute.url({
                    current_team: teamSlug,
                    drug_form: editing.id,
                }),
                { name },
                options,
            );
        } else {
            router.post(storeRoute.url(teamSlug), { name }, options);
        }
    }

    function deleteDrugForm() {
        if (!deleting) {
            return;
        }
        setProcessing(true);
        router.delete(
            destroyRoute.url({
                current_team: teamSlug,
                drug_form: deleting.id,
            }),
            {
                preserveScroll: true,
                onSuccess: () => setDeleting(null),
                onError: (errors) =>
                    setError(
                        Object.values(errors)[0] ??
                            'Drug form could not be deleted.',
                    ),
                onFinish: () => setProcessing(false),
            },
        );
    }

    return (
        <>
            <Head title="Drug forms" />
            <div className="flex w-full flex-col space-y-6 p-4 md:p-6 lg:p-8">
                <div className="space-y-3">
                    <Breadcrumbs
                        breadcrumbs={[
                            {
                                title: 'Pharmacy',
                                href: drugFormsIndex(teamSlug),
                            },
                            {
                                title: 'Drug forms',
                                href: drugFormsIndex(teamSlug),
                            },
                        ]}
                    />
                    <div className="flex flex-wrap items-start justify-between gap-4">
                        <Heading
                            title="Drug forms"
                            description="Manage medication dosage forms used across pharmacy and lab stock."
                        />
                        <Button onClick={openCreate}>
                            <Plus className="mr-2 size-4" />
                            Add drug form
                        </Button>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <form
                        className="flex flex-1 items-center gap-2"
                        onSubmit={(event) => {
                            event.preventDefault();
                            applyFilters({ q: search });
                        }}
                    >
                        <Input
                            className="max-w-sm"
                            value={search}
                            placeholder="Search drug forms"
                            onChange={(event) => setSearch(event.target.value)}
                        />
                        <Button type="submit">
                            Search
                        </Button>
                    </form>
                </div>
                <Card>
                    <CardHeader>
                        <div className="space-y-1">
                            <CardTitle>Dosage forms</CardTitle>
                            <CardDescription>
                                Each form can be linked to medication inventory
                                records.
                            </CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Inventories</TableHead>
                                        <TableHead>Created</TableHead>
                                        <TableHead>Updated</TableHead>
                                        <TableHead className="text-right">
                                            Actions
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {drugForms.data.length === 0 ? (
                                        <TableRow>
                                            <TableCell
                                                colSpan={5}
                                                className="py-8 text-center text-muted-foreground"
                                            >
                                                No drug forms found.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        drugForms.data.map((drugForm) => (
                                            <TableRow key={drugForm.id}>
                                                <TableCell className="font-medium">
                                                    {drugForm.name}
                                                </TableCell>
                                                <TableCell>
                                                    {drugForm.inventoriesCount}
                                                </TableCell>
                                                <TableCell>
                                                    {drugForm.createdAt
                                                        ? new Date(
                                                              drugForm.createdAt,
                                                          ).toLocaleDateString()
                                                        : '—'}
                                                </TableCell>
                                                <TableCell>
                                                    {drugForm.updatedAt
                                                        ? new Date(
                                                              drugForm.updatedAt,
                                                          ).toLocaleDateString()
                                                        : '—'}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
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
                                                                    openEdit(
                                                                        drugForm,
                                                                    )
                                                                }
                                                            >
                                                                <Pencil className="mr-2 h-4 w-4" />
                                                                Edit
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem
                                                                variant="destructive"
                                                                disabled={
                                                                    drugForm.inventoriesCount >
                                                                    0
                                                                }
                                                                onClick={() => {
                                                                    setError(null);
                                                                    setDeleting(
                                                                        drugForm,
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
                    <div className="border-t px-4 py-3">
                        <Pagination
                            meta={{
                                currentPage: drugForms.current_page,
                                lastPage: drugForms.last_page,
                                perPage: drugForms.per_page,
                                total: drugForms.total,
                            }}
                            onPageChange={(page) => applyFilters({ page })}
                            onPerPageChange={(perPage) =>
                                applyFilters({ perPage })
                            }
                        />
                    </div>
                </Card>

                {error ? <p className="text-sm text-red-600">{error}</p> : null}
            </div>

            <Sheet open={formOpen} onOpenChange={setFormOpen}>
                <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
                    <SheetHeader>
                        <SheetTitle>
                            {editing ? 'Edit drug form' : 'Add drug form'}
                        </SheetTitle>
                        <SheetDescription>
                            Dosage forms group medication stock records.
                        </SheetDescription>
                    </SheetHeader>
                    <div className="mt-6 space-y-2 px-4 pb-4">
                        <Label htmlFor="name">Name</Label>
                        <Input
                            id="name"
                            value={name}
                            onChange={(event) => setName(event.target.value)}
                        />
                        {error ? (
                            <p className="text-sm text-red-600">{error}</p>
                        ) : null}
                    </div>
                    <SheetFooter className="mt-6">
                        <Button
                            variant="secondary"
                            onClick={() => setFormOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button disabled={processing} onClick={submitForm}>
                            {processing ? 'Saving…' : 'Save drug form'}
                        </Button>
                    </SheetFooter>
                </SheetContent>
            </Sheet>

            <ConfirmDialog
                open={deleting !== null}
                onOpenChange={(open) => {
                    if (!open) {
                        setDeleting(null);
                    }
                }}
                title="Delete drug form?"
                description="Drug forms linked to inventory records cannot be deleted."
                confirmLabel="Delete"
                processing={processing}
                onConfirm={deleteDrugForm}
            />
        </>
    );
}
