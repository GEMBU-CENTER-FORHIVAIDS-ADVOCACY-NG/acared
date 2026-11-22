import { Head, router, usePage } from '@inertiajs/react';
import {
    ArrowDown,
    ArrowUp,
    ArrowUpDown,
    Eye,
    FolderPlus,
    MoreHorizontal,
    Pencil,
    Plus,
    Trash2,
} from 'lucide-react';
import { useState } from 'react';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import ConfirmDialog from '@/components/confirm-dialog';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import Pagination from '@/components/pagination';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SelectNative } from '@/components/ui/select-native';
import { store as labIntakeSubcategoryStore } from '@/routes/lab-intake/subcategories';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { index as labIntakeRoute } from '@/routes/lab-intake';
import type {
    LabIntakeFilters,
    LabIntakeListItem,
    LabIntakePaginator,
    Team,
} from '@/types';

type LayoutProps = {
    currentTeam?: Team | null;
};

export type LabIntakePageProps = {
    currencySymbol: string;
    items: LabIntakePaginator;
    filters: LabIntakeFilters;
    formOptions: {
        categories: { id: number; name: string }[];
        subcategories: { id: number; name: string; categoryId: number }[];
        parentTests: { id: number; name: string }[];
        drugForms: { id: number; name: string }[];
        resultTypes: { value: string; label: string }[];
    };
    summary?: {
        categories: number;
        subcategories: number;
        items: number;
        inventoryLinked: number;
    };
    title?: string;
    description?: string;
    itemLabel?: string;
    routeBuilder?: (teamSlug: string, suffix?: string) => string;
};

export default function LabIntakeIndex({
    currencySymbol,
    items,
    filters,
    formOptions,
    summary,
    title = 'Lab intake',
    description = 'Manage laboratory catalog tests, parameters, and inventory links.',
    itemLabel = 'catalog item',
    routeBuilder,
    padded = true,
    subcategoryStoreUrl,
    showSkuInsteadOfCategory = false,
    sortableSubcategory = false,
    hideParameters = false,
}: LabIntakePageProps & {
    padded?: boolean;
    subcategoryStoreUrl?: (teamSlug: string) => string;
    showSkuInsteadOfCategory?: boolean;
    sortableSubcategory?: boolean;
    hideParameters?: boolean;
}) {
    const { currentTeam } = usePage<LayoutProps>().props;
    const teamSlug = currentTeam?.slug ?? '';
    const [search, setSearch] = useState(filters.q);
    const [filterCategoryId, setFilterCategoryId] = useState(
        filters.categoryId,
    );
    const [filterSubcategoryId, setFilterSubcategoryId] = useState(
        filters.subcategoryId,
    );
    const [viewing, setViewing] = useState<LabIntakeListItem | null>(null);
    const [toDelete, setToDelete] = useState<LabIntakeListItem | null>(null);
    const [deleteError, setDeleteError] = useState<string | null>(null);
    const [processing, setProcessing] = useState(false);
    const [showSubcategoryModal, setShowSubcategoryModal] = useState(false);
    const [subcategoryForm, setSubcategoryForm] = useState({
        category_id: '',
        name: '',
    });
    const [subcategoryProcessing, setSubcategoryProcessing] = useState(false);
    const [subcategoryError, setSubcategoryError] = useState<string | null>(
        null,
    );

    function baseUrl(path = '') {
        return routeBuilder
            ? routeBuilder(teamSlug, path)
            : `${labIntakeRoute.url(teamSlug)}${path}`;
    }

    function applyFilters(patch: Partial<LabIntakeFilters>) {
        const next = { ...filters, page: 1, ...patch };

        router.get(
            baseUrl(),
            {
                q: next.q || undefined,
                category_id: next.categoryId || undefined,
                subcategory_id: next.subcategoryId || undefined,
                sort: next.sort,
                direction: next.direction,
                perPage: next.perPage,
                page: next.page,
            },
            { preserveState: true, preserveScroll: true, replace: true },
        );
    }

    function deleteItem() {
        if (!toDelete || processing) {
            return;
        }

        setProcessing(true);
        setDeleteError(null);
        router.delete(baseUrl(`/${toDelete.id}`), {
            preserveScroll: true,
            onSuccess: () => setToDelete(null),
            onError: (errors) =>
                setDeleteError(
                    Object.values(errors)[0] ??
                        'Unable to delete catalog item.',
                ),
            onFinish: () => setProcessing(false),
        });
    }

    function createSubcategory() {
        if (subcategoryProcessing) {
            return;
        }

        setSubcategoryProcessing(true);
        setSubcategoryError(null);
        const url = subcategoryStoreUrl
            ? subcategoryStoreUrl(teamSlug)
            : labIntakeSubcategoryStore.url(teamSlug);
        router.post(url, subcategoryForm, {
            preserveScroll: true,
            onSuccess: () => {
                setShowSubcategoryModal(false);
                setSubcategoryForm({ category_id: '', name: '' });
                setSubcategoryError(null);
            },
            onError: (errors) => {
                setSubcategoryError(
                    Object.values(errors)[0] ?? 'Something went wrong.',
                );
            },
            onFinish: () => {
                setSubcategoryProcessing(false);
            },
        });
    }

    return (
        <>
            <Head title={title} />

            <div
                className={`flex w-full flex-col space-y-6 ${padded ? 'p-4 md:p-6 lg:p-8' : ''}`}
            >
                <div className="flex flex-wrap items-center justify-between gap-2">
                    <Heading title={title} description={description} />
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            onClick={() => {
                                setSubcategoryError(null);
                                setShowSubcategoryModal(true);
                            }}
                        >
                            <FolderPlus className="mr-2 h-4 w-4" />
                            New Subcategory
                        </Button>
                        <Button
                            onClick={() => router.visit(baseUrl('/create'))}
                        >
                            <Plus className="mr-2 h-4 w-4" />
                            Add {itemLabel}
                        </Button>
                    </div>
                </div>

                {summary && (
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                        <StatCard
                            title="Categories"
                            value={summary.categories.toLocaleString()}
                            description="Top-level categories"
                        />
                        <StatCard
                            title="Subcategories"
                            value={summary.subcategories.toLocaleString()}
                            description="Items with a subcategory"
                        />
                        <StatCard
                            title="Items"
                            value={summary.items.toLocaleString()}
                            description="Billable services and products"
                        />
                        <StatCard
                            title="Inventory linked"
                            value={summary.inventoryLinked.toLocaleString()}
                            description="Items linked to inventory"
                        />
                    </div>
                )}

                <div className="flex flex-wrap items-center gap-2">
                    <form
                        className="flex flex-1 items-center gap-2"
                        onSubmit={(event) => {
                            event.preventDefault();
                            applyFilters({
                                q: search,
                                categoryId: filterCategoryId,
                                subcategoryId: filterSubcategoryId,
                            });
                        }}
                    >
                        <Input
                            aria-label="Search catalog"
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            placeholder="Search catalog..."
                            className="max-w-sm"
                        />
                        <SelectNative
                            aria-label="Filter by category"
                            value={filterCategoryId}
                            onChange={(event) => {
                                const categoryId = event.target.value;
                                setFilterCategoryId(categoryId);
                                setFilterSubcategoryId('');
                                applyFilters({
                                    categoryId,
                                    subcategoryId: '',
                                    q: search,
                                });
                            }}
                        >
                            <option value="">All categories</option>
                            {formOptions.categories.map((category) => (
                                <option
                                    key={category.id}
                                    value={String(category.id)}
                                >
                                    {category.name}
                                </option>
                            ))}
                        </SelectNative>
                        <SelectNative
                            aria-label="Filter by subcategory"
                            value={filterSubcategoryId}
                            onChange={(event) => {
                                const subcategoryId = event.target.value;
                                setFilterSubcategoryId(subcategoryId);
                                applyFilters({
                                    categoryId: filterCategoryId,
                                    subcategoryId,
                                    q: search,
                                });
                            }}
                        >
                            <option value="">All subcategories</option>
                            {(filterCategoryId
                                ? formOptions.subcategories.filter(
                                      (sc) =>
                                          String(sc.categoryId) ===
                                          filterCategoryId,
                                  )
                                : formOptions.subcategories
                            ).map((sub) => (
                                <option key={sub.id} value={String(sub.id)}>
                                    {sub.name}
                                </option>
                            ))}
                        </SelectNative>
                        <Button type="submit">Search</Button>
                    </form>
                </div>

                <Card>
                    <CardContent className="p-0">
                        <div className="w-full overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>
                                            {showSkuInsteadOfCategory
                                                ? 'SKU'
                                                : 'Category'}
                                        </TableHead>
                                        <TableHead
                                            aria-sort={
                                                filters.sort ===
                                                'subcategory_name'
                                                    ? filters.direction ===
                                                      'asc'
                                                        ? 'ascending'
                                                        : 'descending'
                                                    : 'none'
                                            }
                                        >
                                            {sortableSubcategory ? (
                                                <button
                                                    type="button"
                                                    className="group flex items-center gap-1 rounded-sm font-normal focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                                                    onClick={() => {
                                                        const nextSort =
                                                            filters.sort ===
                                                            'subcategory_name'
                                                                ? filters.direction ===
                                                                  'asc'
                                                                    ? 'subcategory_name'
                                                                    : 'subcategory_name'
                                                                : 'subcategory_name';
                                                        const nextDirection =
                                                            filters.sort ===
                                                                'subcategory_name' &&
                                                            filters.direction ===
                                                                'asc'
                                                                ? 'desc'
                                                                : 'asc';
                                                        applyFilters({
                                                            sort: nextSort,
                                                            direction:
                                                                nextDirection,
                                                        });
                                                    }}
                                                >
                                                    Subcategory
                                                    {filters.sort ===
                                                    'subcategory_name' ? (
                                                        filters.direction ===
                                                        'asc' ? (
                                                            <ArrowUp className="h-4 w-4" />
                                                        ) : (
                                                            <ArrowDown className="h-4 w-4" />
                                                        )
                                                    ) : (
                                                        <ArrowUpDown className="h-4 w-4 opacity-40 group-hover:opacity-70" />
                                                    )}
                                                </button>
                                            ) : (
                                                'Subcategory'
                                            )}
                                        </TableHead>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Price</TableHead>
                                        <TableHead>Category?</TableHead>
                                        <TableHead>Inventory?</TableHead>
                                        <TableHead className="text-right">
                                            Actions
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {items.data.length === 0 ? (
                                        <TableRow>
                                            <TableCell
                                                colSpan={7}
                                                className="py-8 text-center text-muted-foreground"
                                            >
                                                No {itemLabel}s found.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        items.data.map((item) => (
                                            <TableRow key={item.id}>
                                                <TableCell>
                                                    {showSkuInsteadOfCategory
                                                        ? (item.sku ?? '—')
                                                        : (item.categoryName ??
                                                          '—')}
                                                </TableCell>
                                                <TableCell className="max-w-[200px] break-words whitespace-normal">
                                                    {item.subcategoryName ??
                                                        '—'}
                                                </TableCell>
                                                <TableCell>
                                                    {item.name}
                                                </TableCell>
                                                <TableCell>
                                                    {currencySymbol}{' '}
                                                    {item.price.toLocaleString()}
                                                </TableCell>
                                                <TableCell>
                                                    {item.isCategory
                                                        ? 'Yes'
                                                        : 'No'}
                                                </TableCell>
                                                <TableCell>
                                                    {item.isInventory
                                                        ? 'Yes'
                                                        : 'No'}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger
                                                            asChild
                                                        >
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                aria-label={`Actions for ${item.name}`}
                                                            >
                                                                <MoreHorizontal className="size-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuItem
                                                                onClick={() =>
                                                                    setViewing(
                                                                        item,
                                                                    )
                                                                }
                                                            >
                                                                <Eye className="mr-2 h-4 w-4" />
                                                                View
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem
                                                                onClick={() =>
                                                                    router.visit(
                                                                        baseUrl(
                                                                            '/' +
                                                                                item.id +
                                                                                '/edit',
                                                                        ),
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
                                                                    setToDelete(
                                                                        item,
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
                        currentPage: items.current_page,
                        lastPage: items.last_page,
                        perPage: items.per_page,
                        total: items.total,
                    }}
                    onPageChange={(page) => applyFilters({ page })}
                    onPerPageChange={(perPage) => applyFilters({ perPage })}
                />
            </div>

            <Dialog
                open={viewing !== null}
                onOpenChange={(open) => {
                    if (!open) setViewing(null);
                }}
            >
                <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
                    <DialogHeader>
                        <DialogTitle>{viewing?.name ?? itemLabel}</DialogTitle>
                        <DialogDescription>
                            Catalog record details.
                        </DialogDescription>
                    </DialogHeader>
                    {viewing ? (
                        <div className="space-y-5">
                            <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                <Detail
                                    label="Category"
                                    value={viewing.categoryName}
                                />
                                <Detail
                                    label="Subcategory"
                                    value={viewing.subcategoryName}
                                />
                                <Detail
                                    label="Parameter"
                                    value={viewing.parameterName}
                                />
                                <Detail
                                    label="Price"
                                    value={`${currencySymbol} ${viewing.price.toLocaleString()}`}
                                />
                                <Detail
                                    label="Unit of measure"
                                    value={viewing.uom}
                                />
                                <Detail
                                    label="Result type"
                                    value={viewing.resultType}
                                />
                                <Detail
                                    label="Category node"
                                    value={viewing.isCategory ? 'Yes' : 'No'}
                                />
                                <Detail
                                    label="Inventory item"
                                    value={viewing.isInventory ? 'Yes' : 'No'}
                                />
                                <Detail
                                    label="Created"
                                    value={
                                        viewing.createdAt
                                            ? new Date(
                                                  viewing.createdAt,
                                              ).toLocaleString()
                                            : null
                                    }
                                />
                                <Detail
                                    label="Updated"
                                    value={
                                        viewing.updatedAt
                                            ? new Date(
                                                  viewing.updatedAt,
                                              ).toLocaleString()
                                            : null
                                    }
                                />
                                {viewing.inventory ? (
                                    <>
                                        <Detail
                                            label="SKU"
                                            value={viewing.inventory.sku}
                                        />
                                        <Detail
                                            label="Minimum quantity"
                                            value={viewing.inventory.minQty.toLocaleString()}
                                        />
                                        <Detail
                                            label="Expiry"
                                            value={
                                                viewing.inventory.expiresAt
                                                    ? new Date(
                                                          viewing.inventory
                                                              .expiresAt,
                                                      ).toLocaleDateString()
                                                    : null
                                            }
                                        />
                                    </>
                                ) : null}
                            </dl>
                            <section className="space-y-1">
                                <h3 className="text-sm font-semibold">
                                    Description
                                </h3>
                                <p className="text-sm whitespace-pre-wrap text-muted-foreground">
                                    {viewing.description || 'Not provided'}
                                </p>
                            </section>
                            <section className="space-y-1">
                                <h3 className="text-sm font-semibold">
                                    Reference ranges
                                </h3>
                                <p className="text-sm whitespace-pre-wrap text-muted-foreground">
                                    {viewing.ranges || 'Not provided'}
                                </p>
                            </section>
                            {!hideParameters &&
                            viewing.parameters.length > 0 ? (
                                <section className="space-y-2">
                                    <h3 className="text-sm font-semibold">
                                        Parameters
                                    </h3>
                                    <div className="space-y-2">
                                        {viewing.parameters.map((parameter) => (
                                            <div
                                                key={parameter.id}
                                                className="rounded-md border p-3 text-sm"
                                            >
                                                <p className="font-medium">
                                                    {parameter.name}
                                                </p>
                                                <p className="text-muted-foreground">
                                                    {[
                                                        parameter.ranges,
                                                        parameter.uom,
                                                        parameter.resultType,
                                                    ]
                                                        .filter(Boolean)
                                                        .join(' · ') ||
                                                        'No additional details'}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            ) : null}
                        </div>
                    ) : null}
                </DialogContent>
            </Dialog>

            <Dialog
                open={showSubcategoryModal}
                onOpenChange={(open) => {
                    if (!open) {
                        setShowSubcategoryModal(false);
                        setSubcategoryForm({ category_id: '', name: '' });
                        setSubcategoryError(null);
                    }
                }}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Create subcategory</DialogTitle>
                        <DialogDescription>
                            Add a new subcategory under an existing category.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="subcategory-category">
                                Category <span className="text-red-500">*</span>
                            </Label>
                            <SelectNative
                                id="subcategory-category"
                                value={subcategoryForm.category_id}
                                onChange={(e) =>
                                    setSubcategoryForm((prev) => ({
                                        ...prev,
                                        category_id: e.target.value,
                                    }))
                                }
                            >
                                <option value="">Select a category</option>
                                {formOptions.categories.map((category) => (
                                    <option
                                        key={category.id}
                                        value={String(category.id)}
                                    >
                                        {category.name}
                                    </option>
                                ))}
                            </SelectNative>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="subcategory-name">
                                Name <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="subcategory-name"
                                type="text"
                                placeholder="Enter subcategory name"
                                value={subcategoryForm.name}
                                onChange={(e) =>
                                    setSubcategoryForm((prev) => ({
                                        ...prev,
                                        name: e.target.value,
                                    }))
                                }
                            />
                            <InputError
                                message={subcategoryError ?? undefined}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setShowSubcategoryModal(false);
                                setSubcategoryForm({
                                    category_id: '',
                                    name: '',
                                });
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={createSubcategory}
                            disabled={
                                !subcategoryForm.category_id ||
                                !subcategoryForm.name ||
                                subcategoryProcessing
                            }
                        >
                            {subcategoryProcessing ? 'Creating...' : 'Create'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <ConfirmDialog
                open={toDelete !== null}
                onOpenChange={(open) => {
                    if (processing) {
                        return;
                    }
                    if (!open) {
                        setToDelete(null);
                        setDeleteError(null);
                    }
                }}
                title="Delete catalog item?"
                description={
                    deleteError ??
                    'This removes the laboratory catalog entry and its parameters.'
                }
                confirmLabel={processing ? 'Deleting…' : 'Delete'}
                destructive
                processing={processing}
                onConfirm={deleteItem}
            />
        </>
    );
}

function Detail({
    label,
    value,
}: {
    label: string;
    value: string | null | undefined;
}) {
    return (
        <div>
            <dt className="text-sm text-muted-foreground">{label}</dt>
            <dd className="break-words">{value || '—'}</dd>
        </div>
    );
}

function StatCard({
    title,
    value,
    description,
}: {
    title: string;
    value: string;
    description: string;
}) {
    return (
        <Card>
            <CardHeader className="pb-2">
                <CardDescription>{title}</CardDescription>
                <CardTitle className="text-2xl">{value}</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-xs text-muted-foreground">{description}</p>
            </CardContent>
        </Card>
    );
}
