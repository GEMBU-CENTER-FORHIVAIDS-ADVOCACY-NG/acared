import { Head, router, usePage } from '@inertiajs/react';
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';
import CategoryController from '@/actions/App/Http/Controllers/CategoryController';
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
    Card,
    CardContent,
} from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { index } from '@/routes/categories';
import type {
    CategoryFilters,
    CategoryFormValues,
    CategoryListItem,
    CategoryPaginator,
    Team,
} from '@/types';

type LayoutProps = {
    currentTeam?: Team | null;
};

const EMPTY_FORM: CategoryFormValues = {
    name: '',
    discount_percentage: '0',
    description: '',
};

export default function CategoryIndex({
    categories,
    filters,
}: {
    categories: CategoryPaginator;
    filters: CategoryFilters;
}) {
    const { currentTeam } = usePage().props;
    const teamSlug = currentTeam?.slug;

    const [search, setSearch] = useState(filters.q);
    const [editing, setEditing] = useState<CategoryListItem | null>(null);
    const [formOpen, setFormOpen] = useState(false);
    const [form, setForm] = useState<CategoryFormValues>(EMPTY_FORM);
    const [formError, setFormError] = useState<string | null>(null);
    const [processing, setProcessing] = useState(false);
    const [toDelete, setToDelete] = useState<CategoryListItem | null>(null);

    function applyFilters(patch: Partial<CategoryFilters>) {
        const next = { ...filters, page: 1, ...patch };

        router.get(
            index.url(teamSlug, {
                query: {
                    q: next.q || undefined,
                    sort: next.sort,
                    direction: next.direction,
                    perPage: next.perPage,
                    page: next.page,
                },
            }),
            {},
            { preserveState: true, preserveScroll: true, replace: true },
        );
    }

    function toggleSort(column: string) {
        applyFilters({
            sort: column,
            direction:
                filters.sort === column && filters.direction === 'asc'
                    ? 'desc'
                    : 'asc',
        });
    }

    function openCreate() {
        setEditing(null);
        setForm(EMPTY_FORM);
        setFormError(null);
        setFormOpen(true);
    }

    function openEdit(category: CategoryListItem) {
        setEditing(category);
        setForm({
            name: category.name,
            discount_percentage: String(category.discountPercentage),
            description: category.description ?? '',
        });
        setFormError(null);
        setFormOpen(true);
    }

    function submitForm() {
        setProcessing(true);
        setFormError(null);

        const options = {
            preserveScroll: true,
            onError: (errors: Record<string, string>) =>
                setFormError(
                    Object.values(errors)[0] ?? 'Something went wrong.',
                ),
            onSuccess: () => {
                setFormOpen(false);
                setForm(EMPTY_FORM);
                setEditing(null);
            },
            onFinish: () => setProcessing(false),
        };

        const payload = {
            name: form.name,
            discount_percentage: form.discount_percentage,
            description: form.description,
        };

        if (editing) {
            router.patch(
                CategoryController.update.url([teamSlug ?? '', editing.id]),
                payload,
                options,
            );
        } else {
            router.post(
                CategoryController.store.url(teamSlug),
                payload,
                options,
            );
        }
    }

    function deleteCategory() {
        if (!toDelete) {
            return;
        }

        setProcessing(true);

        router.delete(
            CategoryController.destroy.url([teamSlug ?? '', toDelete.id]),
            {
                preserveScroll: true,
                onFinish: () => {
                    setProcessing(false);
                    setToDelete(null);
                },
            },
        );
    }

    function sortIndicator(column: string) {
        if (filters.sort !== column) {
            return null;
        }

        return (
            <span className="ml-1 text-xs">
                {filters.direction === 'asc' ? '▲' : '▼'}
            </span>
        );
    }

    return (
        <>
            <Head title="Categories" />

            <div className="flex w-full flex-col space-y-6 p-4 md:p-6 lg:p-8">
                <div className="flex flex-wrap items-center justify-between gap-2">
                    <Heading
                        variant="small"
                        title="Categories"
                        description="Manage the patient categories used across reception."
                    />
                    <Button onClick={openCreate} data-test="new-category">
                        New category
                    </Button>
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
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            placeholder="Search categories..."
                            className="max-w-sm"
                            data-test="category-search"
                        />
                        <Button type="submit" variant="secondary">
                            Search
                        </Button>
                    </form>
                </div>

                <Card>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>
                                        <button
                                            type="button"
                                            className="inline-flex items-center"
                                            onClick={() => toggleSort('name')}
                                        >
                                            Name
                                            {sortIndicator('name')}
                                        </button>
                                    </TableHead>
                                    <TableHead>
                                        <button
                                            type="button"
                                            className="inline-flex items-center"
                                            onClick={() =>
                                                toggleSort('discount_percentage')
                                            }
                                        >
                                            Discount
                                            {sortIndicator('discount_percentage')}
                                        </button>
                                    </TableHead>
                                    <TableHead>Patients</TableHead>
                                    <TableHead>Description</TableHead>
                                    <TableHead className="w-12 text-right">
                                        Actions
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {categories.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={5}
                                            className="py-10 text-center text-muted-foreground"
                                        >
                                            No categories found.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    categories.data.map((category) => (
                                        <TableRow
                                            key={category.id}
                                            data-test="category-row"
                                        >
                                            <TableCell className="font-medium">
                                                {category.name}
                                            </TableCell>
                                            <TableCell>
                                                {category.discountPercentage}%
                                            </TableCell>
                                            <TableCell>
                                                {category.patientsCount}
                                            </TableCell>
                                            <TableCell className="max-w-md truncate text-muted-foreground">
                                                {category.description ?? '—'}
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
                                                        <DropdownMenuItem
                                                            onClick={() =>
                                                                openEdit(category)
                                                            }
                                                        >
                                                            <Pencil className="mr-2 h-4 w-4" />
                                                            Edit
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            onClick={() =>
                                                                setToDelete(category)
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
                        currentPage: categories.current_page,
                        lastPage: categories.last_page,
                        perPage: categories.per_page,
                        total: categories.total,
                    }}
                    onPageChange={(page) => applyFilters({ page })}
                    onPerPageChange={(perPage) => applyFilters({ perPage })}
                />
            </div>

            <Sheet open={formOpen} onOpenChange={setFormOpen}>
                <SheetContent className="w-full overflow-y-auto">
                    <SheetHeader>
                        <SheetTitle>
                            {editing ? 'Edit category' : 'New category'}
                        </SheetTitle>
                        <SheetDescription>
                            Categories group patients and may carry a discount.
                        </SheetDescription>
                    </SheetHeader>

                    <div className="flex flex-1 flex-col gap-4 px-4 pb-4">
                        <div className="space-y-2">
                            <Label htmlFor="category-name">Name</Label>
                            <Input
                                id="category-name"
                                value={form.name}
                                onChange={(event) =>
                                    setForm((current) => ({
                                        ...current,
                                        name: event.target.value,
                                    }))
                                }
                                data-test="category-name"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="category-discount">
                                Discount percentage
                            </Label>
                            <Input
                                id="category-discount"
                                type="number"
                                min={0}
                                max={100}
                                value={form.discount_percentage}
                                onChange={(event) =>
                                    setForm((current) => ({
                                        ...current,
                                        discount_percentage: event.target.value,
                                    }))
                                }
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="category-description">
                                Description
                            </Label>
                            <Textarea
                                id="category-description"
                                value={form.description}
                                onChange={(event) =>
                                    setForm((current) => ({
                                        ...current,
                                        description: event.target.value,
                                    }))
                                }
                            />
                        </div>

                        {formError ? (
                            <p className="text-sm text-destructive">
                                {formError}
                            </p>
                        ) : null}
                    </div>

                    <SheetFooter>
                        <Button
                            type="button"
                            onClick={submitForm}
                            disabled={processing}
                            data-test="submit-category"
                        >
                            {processing ? 'Saving...' : 'Save category'}
                        </Button>
                    </SheetFooter>
                </SheetContent>
            </Sheet>

            <ConfirmDialog
                open={toDelete !== null}
                onOpenChange={(open) => {
                    if (!open) {
                        setToDelete(null);
                    }
                }}
                processing={processing}
                title={`Delete "${toDelete?.name ?? ''}"?`}
                description="Patients keep their record but lose this category. This cannot be undone."
                confirmLabel="Delete"
                onConfirm={deleteCategory}
            />
        </>
    );
}

CategoryIndex.layout = (props: LayoutProps) => ({
    breadcrumbs: [
        {
            title: 'Categories',
            href: index(props.currentTeam?.slug),
        },
    ],
});
