import { Head, router, usePage } from '@inertiajs/react';
import {
    ClipboardCheck,
    Eye,
    MoreHorizontal,
    PackageCheck,
    PackageMinus,
    PackageSearch,
    Pencil,
    TriangleAlert,
    TrendingUp,
    Trash2,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import AlertError from '@/components/alert-error';
import ConfirmDialog from '@/components/confirm-dialog';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { usePermissions } from '@/hooks/use-permissions';
import {
    adjust as adjustLabInventory,
    destroy as destroyLabInventory,
    index as labInventoriesIndex,
    store as storeLabInventory,
    update as updateLabInventory,
} from '@/routes/lab-inventories';
import Pagination from '@/components/pagination';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SelectNative } from '@/components/ui/select-native';
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
import type {
    LabInventoryFilters,
    LabInventoryListItem,
    LabInventoryPaginator,
    Team,
} from '@/types';

type LayoutProps = {
    currentTeam?: Team | null;
};

type FormValues = {
    price_list_id: string;
    drug_form_id: string;
    sku: string;
    min_qty: string;
    quantity: string;
    price: string;
    cost: string;
    expires_at: string;
};

const EMPTY_FORM: FormValues = {
    price_list_id: '',
    drug_form_id: '',
    sku: '',
    min_qty: '5',
    quantity: '0',
    price: '0',
    cost: '0',
    expires_at: '',
};

export default function LabInventoriesIndex({
    currencySymbol,
    inventories,
    filters,
    summary,
    formOptions,
}: {
    currencySymbol: string;
    inventories: LabInventoryPaginator;
    filters: LabInventoryFilters;
    summary: {
        products: number;
        lowStock: number;
        expired: number;
        expiring: number;
    };
    formOptions: {
        priceLists: { id: number; name: string }[];
        drugForms: { id: number; name: string }[];
    };
}) {
    const { currentTeam } = usePage<LayoutProps>().props;
    const can = usePermissions();
    const teamSlug = currentTeam?.slug ?? '';
    const [search, setSearch] = useState(filters.q);
    const [formOpen, setFormOpen] = useState(false);
    const [adjustOpen, setAdjustOpen] = useState(false);
    const [editing, setEditing] = useState<LabInventoryListItem | null>(null);
    const [form, setForm] = useState<FormValues>(EMPTY_FORM);
    const [selected, setSelected] = useState<number[]>([]);
    const [adjustType, setAdjustType] = useState('add');
    const [adjustReason, setAdjustReason] = useState('correction');
    const [adjustQty, setAdjustQty] = useState<Record<number, string>>({});
    const [isStockCount, setIsStockCount] = useState(false);
    const [toDelete, setToDelete] = useState<LabInventoryListItem | null>(null);
    const [viewing, setViewing] = useState<LabInventoryListItem | null>(null);
    const [formProcessing, setFormProcessing] = useState(false);
    const [adjustProcessing, setAdjustProcessing] = useState(false);
    const [deleteProcessing, setDeleteProcessing] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);
    const [adjustError, setAdjustError] = useState<string | null>(null);
    const [deleteError, setDeleteError] = useState<string | null>(null);

    function applyFilters(patch: Partial<LabInventoryFilters>) {
        const next = { ...filters, page: 1, ...patch };

        router.get(
            labInventoriesIndex.url(teamSlug),
            {
                q: next.q || undefined,
                sort: next.sort,
                direction: next.direction,
                perPage: next.perPage,
                page: next.page,
            },
            { preserveState: true, preserveScroll: true, replace: true },
        );
    }

    function openCreate() {
        setEditing(null);
        setForm(EMPTY_FORM);
        setFormError(null);
        setFormOpen(true);
    }

    function openEdit(item: LabInventoryListItem) {
        setEditing(item);
        setForm({
            price_list_id: String(item.priceListId),
            drug_form_id: String(item.drugFormId),
            sku: item.sku,
            min_qty: String(item.minQty),
            quantity: String(item.quantity),
            price: String(item.price),
            cost: String(item.cost),
            expires_at: item.expiresAt ? item.expiresAt.slice(0, 16) : '',
        });
        setFormError(null);
        setFormOpen(true);
    }

    function submitForm() {
        if (formProcessing) {
            return;
        }

        setFormProcessing(true);
        setFormError(null);

        const payload = {
            ...form,
            price_list_id: Number(form.price_list_id),
            drug_form_id: Number(form.drug_form_id),
            min_qty: Number(form.min_qty),
            quantity: Number(form.quantity),
            price: Number(form.price),
            cost: Number(form.cost),
            expires_at: form.expires_at || null,
        };

        const options = {
            preserveScroll: true,
            onSuccess: () => {
                setFormOpen(false);
                setForm(EMPTY_FORM);
                setEditing(null);
            },
            onError: (errors: Record<string, string>) =>
                setFormError(
                    Object.values(errors)[0] ?? 'Something went wrong.',
                ),
            onFinish: () => setFormProcessing(false),
        };

        if (editing) {
            router.patch(
                updateLabInventory.url({
                    current_team: teamSlug,
                    lab_inventory: editing.id,
                }),
                payload,
                options,
            );
        } else {
            router.post(storeLabInventory.url(teamSlug), payload, options);
        }
    }

    function submitAdjust() {
        if (adjustProcessing || selected.length === 0) {
            return;
        }

        const invalidItem = selectedItems.find((item) => {
            const raw = adjustQty[item.id];
            if (raw === undefined || raw.trim() === '') {
                return true;
            }
            const quantity = Number(raw);
            return !Number.isFinite(quantity) || quantity < 0;
        });

        if (invalidItem) {
            setAdjustError(
                `Enter a valid quantity for ${invalidItem.priceListName}.`,
            );
            return;
        }

        setAdjustProcessing(true);
        setAdjustError(null);
        router.post(
            adjustLabInventory.url(teamSlug),
            {
                type: adjustType,
                reason: adjustReason,
                items: selected.map((id) => ({
                    id,
                    quantity: Number(adjustQty[id]),
                })),
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setAdjustOpen(false);
                    setSelected([]);
                    setAdjustQty({});
                },
                onError: (errors: Record<string, string>) =>
                    setAdjustError(
                        Object.values(errors)[0] ?? 'Unable to adjust stock.',
                    ),
                onFinish: () => setAdjustProcessing(false),
            },
        );
    }

    function deleteItem() {
        if (!toDelete || deleteProcessing) {
            return;
        }

        setDeleteProcessing(true);
        setDeleteError(null);
        router.delete(
            destroyLabInventory.url({
                current_team: teamSlug,
                lab_inventory: toDelete.id,
            }),
            {
                preserveScroll: true,
                onSuccess: () => setToDelete(null),
                onError: (errors: Record<string, string>) =>
                    setDeleteError(
                        Object.values(errors)[0] ??
                            'Unable to delete inventory.',
                    ),
                onFinish: () => setDeleteProcessing(false),
            },
        );
    }

    function toggleSelect(id: number) {
        setSelected((current) =>
            current.includes(id)
                ? current.filter((item) => item !== id)
                : [...current, id],
        );
    }

    const selectedItems = useMemo(
        () => inventories.data.filter((item) => selected.includes(item.id)),
        [inventories.data, selected],
    );

    function openAdjust(ids: number[], isStockCountMode = false) {
        setAdjustError(null);
        setSelected(ids);
        if (isStockCountMode) {
            setIsStockCount(true);
            setAdjustType('set');
            setAdjustReason('correction');
            setAdjustQty(
                Object.fromEntries(
                    ids.map((id) => {
                        const item = inventories.data.find((i) => i.id === id);
                        return [id, item ? String(item.quantity) : '0'];
                    }),
                ),
            );
        } else {
            setIsStockCount(false);
            setAdjustQty(Object.fromEntries(ids.map((id) => [id, ''])));
        }
        setAdjustOpen(true);
    }

    return (
        <>
            <Head title="Lab inventory" />

            <div className="flex w-full flex-col space-y-6 p-4 md:p-6 lg:p-8">
                <div className="space-y-3">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                        <Heading
                            title="Lab inventory"
                            description="Stock levels for laboratory reagents and kits."
                        />
                        <div className="flex flex-wrap gap-2">
                            {can.canStockCount('labinventory') &&
                                selected.length > 0 && (
                                    <Button
                                        variant="outline"
                                        onClick={() =>
                                            openAdjust(selected, true)
                                        }
                                    >
                                        <ClipboardCheck className="mr-2 size-4" />
                                        Stock Count ({selected.length})
                                    </Button>
                                )}
                            <Button onClick={openCreate}>Add inventory</Button>
                        </div>
                    </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {[
                        {
                            label: 'Total products',
                            value: summary.products,
                            icon: PackageSearch,
                            detail: 'Lab inventory records',
                        },
                        {
                            label: 'Low stock',
                            value: summary.lowStock,
                            icon: PackageMinus,
                            detail: 'At or below minimum',
                        },
                        {
                            label: 'Expired',
                            value: summary.expired,
                            icon: TriangleAlert,
                            detail: 'Past expiry date',
                        },
                        {
                            label: 'Expiring soon',
                            value: summary.expiring,
                            icon: PackageCheck,
                            detail: 'Within the next 30 days',
                        },
                    ].map(({ label, value, icon: Icon, detail }) => (
                        <Card key={label}>
                            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">
                                    {label}
                                </CardTitle>
                                <Icon className="size-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-semibold tabular-nums">
                                    {value}
                                </div>
                                <p className="mt-1 text-xs text-muted-foreground">
                                    {detail}
                                </p>
                            </CardContent>
                        </Card>
                    ))}
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
                            aria-label="Search lab inventory"
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            placeholder="Search product, form, SKU..."
                            className="max-w-sm"
                        />
                        <Button type="submit">Search</Button>
                    </form>
                </div>

                {selected.length > 0 && (
                    <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-muted/40 px-6 py-3">
                        <p className="text-sm text-muted-foreground">
                            {selected.length} selected
                        </p>
                        <div className="flex gap-2">
                            {can.canStockCount('labinventory') && (
                                <Button
                                    size="sm"
                                    variant="secondary"
                                    onClick={() => openAdjust(selected, true)}
                                >
                                    Stock count
                                </Button>
                            )}
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => openAdjust(selected)}
                            >
                                Adjust stock
                            </Button>
                        </div>
                    </div>
                )}
                <Card>
                    <CardContent className="p-0">
                        <div className="w-full overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-10">
                                            <input
                                                type="checkbox"
                                                aria-label="Select all lab inventory items"
                                                checked={
                                                    inventories.data.length >
                                                        0 &&
                                                    inventories.data.every(
                                                        (item) =>
                                                            selected.includes(
                                                                item.id,
                                                            ),
                                                    )
                                                }
                                                onChange={(event) =>
                                                    setSelected(
                                                        event.target.checked
                                                            ? [
                                                                  ...new Set([
                                                                      ...selected,
                                                                      ...inventories.data.map(
                                                                          (
                                                                              item,
                                                                          ) =>
                                                                              item.id,
                                                                      ),
                                                                  ]),
                                                              ]
                                                            : selected.filter(
                                                                  (id) =>
                                                                      !inventories.data.some(
                                                                          (
                                                                              item,
                                                                          ) =>
                                                                              item.id ===
                                                                              id,
                                                                      ),
                                                              ),
                                                    )
                                                }
                                            />
                                        </TableHead>
                                        <TableHead>Product</TableHead>
                                        <TableHead>Form</TableHead>
                                        <TableHead>Min</TableHead>
                                        <TableHead>Qty</TableHead>
                                        <TableHead>Price</TableHead>
                                        <TableHead>Cost</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">
                                            Actions
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {inventories.data.length === 0 ? (
                                        <TableRow>
                                            <TableCell
                                                colSpan={9}
                                                className="py-8 text-center text-muted-foreground"
                                            >
                                                No lab inventory found.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        inventories.data.map((item) => (
                                            <TableRow key={item.id}>
                                                <TableCell>
                                                    <input
                                                        type="checkbox"
                                                        aria-label={`Select ${item.priceListName}`}
                                                        checked={selected.includes(
                                                            item.id,
                                                        )}
                                                        onChange={() =>
                                                            toggleSelect(
                                                                item.id,
                                                            )
                                                        }
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    {item.priceListName}
                                                </TableCell>
                                                <TableCell>
                                                    {item.drugFormName}
                                                </TableCell>
                                                <TableCell>
                                                    {item.minQty}
                                                </TableCell>
                                                <TableCell
                                                    className={
                                                        item.isLow
                                                            ? 'font-semibold text-red-600 dark:text-red-400'
                                                            : 'font-semibold text-emerald-600 dark:text-emerald-400'
                                                    }
                                                >
                                                    {Math.abs(
                                                        item.quantity,
                                                    ).toLocaleString()}
                                                </TableCell>
                                                <TableCell>
                                                    {currencySymbol}{' '}
                                                    {item.price.toLocaleString()}
                                                </TableCell>
                                                <TableCell>
                                                    {currencySymbol}{' '}
                                                    {item.cost.toLocaleString()}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge
                                                        variant="secondary"
                                                        className="capitalize"
                                                    >
                                                        {item.status}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger
                                                            asChild
                                                        >
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                aria-label={`Actions for ${item.priceListName}`}
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
                                                                    openEdit(
                                                                        item,
                                                                    )
                                                                }
                                                            >
                                                                <Pencil className="mr-2 h-4 w-4" />
                                                                Edit
                                                            </DropdownMenuItem>
                                                            {can.canStockCount(
                                                                'labinventory',
                                                            ) && (
                                                                <DropdownMenuItem
                                                                    onClick={() =>
                                                                        openAdjust(
                                                                            [
                                                                                item.id,
                                                                            ],
                                                                            true,
                                                                        )
                                                                    }
                                                                >
                                                                    <ClipboardCheck className="mr-2 h-4 w-4" />
                                                                    Stock Count
                                                                </DropdownMenuItem>
                                                            )}
                                                            <DropdownMenuItem
                                                                onClick={() =>
                                                                    openAdjust([
                                                                        item.id,
                                                                    ])
                                                                }
                                                            >
                                                                <TrendingUp className="mr-2 h-4 w-4" />
                                                                Adjust
                                                            </DropdownMenuItem>
                                                            <DropdownMenuSeparator />
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
                        currentPage: inventories.current_page,
                        lastPage: inventories.last_page,
                        perPage: inventories.per_page,
                        total: inventories.total,
                    }}
                    onPageChange={(page) => applyFilters({ page })}
                    onPerPageChange={(perPage) => applyFilters({ perPage })}
                />
            </div>

            <Sheet
                open={formOpen}
                onOpenChange={(open) => {
                    if (formProcessing) {
                        return;
                    }
                    setFormOpen(open);
                }}
            >
                <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
                    <SheetHeader>
                        <SheetTitle>
                            {editing ? 'Edit inventory' : 'Add inventory'}
                        </SheetTitle>
                        <SheetDescription>
                            Link a catalog item to stock quantities and costing.
                        </SheetDescription>
                    </SheetHeader>
                    <div className="mt-6 grid gap-4 px-4 pb-4">
                        <div className="space-y-2">
                            <Label htmlFor="lab-inventory-product">
                                Product
                            </Label>
                            <SelectNative
                                id="lab-inventory-product"
                                value={form.price_list_id}
                                onChange={(event) =>
                                    setForm((current) => ({
                                        ...current,
                                        price_list_id: event.target.value,
                                    }))
                                }
                            >
                                <option value="">Select…</option>
                                {formOptions.priceLists.map((item) => (
                                    <option key={item.id} value={item.id}>
                                        {item.name}
                                    </option>
                                ))}
                            </SelectNative>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="lab-inventory-form">
                                Product form
                            </Label>
                            <SelectNative
                                id="lab-inventory-form"
                                value={form.drug_form_id}
                                onChange={(event) =>
                                    setForm((current) => ({
                                        ...current,
                                        drug_form_id: event.target.value,
                                    }))
                                }
                            >
                                <option value="">Select…</option>
                                {formOptions.drugForms.map((item) => (
                                    <option key={item.id} value={item.id}>
                                        {item.name}
                                    </option>
                                ))}
                            </SelectNative>
                        </div>
                        {(
                            [
                                ['sku', 'Reference'],
                                ['min_qty', 'Min qty'],
                                ['quantity', 'Quantity'],
                                ['price', 'Price'],
                                ['cost', 'Cost'],
                            ] as const
                        ).map(([key, label]) => (
                            <div key={key} className="space-y-2">
                                <Label htmlFor={key}>{label}</Label>
                                <Input
                                    id={key}
                                    type={key === 'sku' ? 'text' : 'number'}
                                    min={key === 'sku' ? undefined : '0'}
                                    step={
                                        key === 'sku'
                                            ? undefined
                                            : key === 'min_qty' ||
                                                key === 'quantity'
                                              ? '1'
                                              : '0.01'
                                    }
                                    value={form[key]}
                                    onChange={(event) =>
                                        setForm((current) => ({
                                            ...current,
                                            [key]: event.target.value,
                                        }))
                                    }
                                />
                            </div>
                        ))}
                        <div className="space-y-2">
                            <Label htmlFor="expires_at">Expires at</Label>
                            <Input
                                id="expires_at"
                                type="datetime-local"
                                value={form.expires_at}
                                onChange={(event) =>
                                    setForm((current) => ({
                                        ...current,
                                        expires_at: event.target.value,
                                    }))
                                }
                            />
                        </div>
                        <AlertError errors={formError ? [formError] : []} />
                    </div>
                    <SheetFooter className="mt-6">
                        <Button
                            variant="secondary"
                            onClick={() => setFormOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button disabled={formProcessing} onClick={submitForm}>
                            {formProcessing ? 'Saving…' : 'Save'}
                        </Button>
                    </SheetFooter>
                </SheetContent>
            </Sheet>

            <Dialog
                open={viewing !== null}
                onOpenChange={(open) => {
                    if (!open) setViewing(null);
                }}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {viewing?.priceListName ?? 'Lab inventory item'}
                        </DialogTitle>
                        <DialogDescription>
                            Laboratory inventory details.
                        </DialogDescription>
                    </DialogHeader>
                    {viewing ? (
                        <dl className="grid gap-3 sm:grid-cols-2">
                            <Detail
                                label="Drug form"
                                value={viewing.drugFormName}
                            />
                            <Detail label="SKU" value={viewing.sku} />
                            <Detail
                                label="Minimum quantity"
                                value={viewing.minQty.toLocaleString()}
                            />
                            <Detail
                                label="Quantity"
                                value={viewing.quantity.toLocaleString()}
                            />
                            <Detail
                                label="Price"
                                value={`${currencySymbol} ${viewing.price.toLocaleString()}`}
                            />
                            <Detail
                                label="Cost"
                                value={`${currencySymbol} ${viewing.cost.toLocaleString()}`}
                            />
                            <Detail
                                label="Value"
                                value={`${currencySymbol} ${viewing.value.toLocaleString()}`}
                            />
                            <Detail
                                label="Profit"
                                value={`${currencySymbol} ${viewing.profit.toLocaleString()}`}
                            />
                            <Detail label="Status" value={viewing.status} />
                            <Detail
                                label="Expiry"
                                value={
                                    viewing.expiresAt
                                        ? new Date(
                                              viewing.expiresAt,
                                          ).toLocaleString()
                                        : null
                                }
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
                        </dl>
                    ) : null}
                </DialogContent>
            </Dialog>

            <Sheet
                open={adjustOpen}
                onOpenChange={(open) => {
                    if (adjustProcessing) {
                        return;
                    }
                    if (!open) {
                        setIsStockCount(false);
                        setAdjustError(null);
                    }
                    setAdjustOpen(open);
                }}
            >
                <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
                    <SheetHeader>
                        <SheetTitle>
                            {isStockCount ? 'Stock count' : 'Stock adjustment'}
                        </SheetTitle>
                        <SheetDescription>
                            {isStockCount
                                ? 'Set the exact quantity found during physical stock count.'
                                : 'Add, remove, or set quantities for selected products.'}
                        </SheetDescription>
                    </SheetHeader>
                    <div className="mt-6 space-y-4 px-4 pb-4">
                        {isStockCount ? (
                            <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200">
                                <p className="font-medium">Stock count mode</p>
                                <p className="text-xs">
                                    Enter the exact quantity found for each
                                    item. The reason is set to "Stock count
                                    correction".
                                </p>
                            </div>
                        ) : (
                            <>
                                <div className="space-y-2">
                                    <Label htmlFor="lab-adjust-type">
                                        Type
                                    </Label>
                                    <SelectNative
                                        id="lab-adjust-type"
                                        value={adjustType}
                                        onChange={(event) =>
                                            setAdjustType(event.target.value)
                                        }
                                    >
                                        <option value="add">Add stock</option>
                                        <option value="remove">
                                            Remove stock
                                        </option>
                                        <option value="set">
                                            Set exact quantity
                                        </option>
                                    </SelectNative>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="lab-adjust-reason">
                                        Reason
                                    </Label>
                                    <SelectNative
                                        id="lab-adjust-reason"
                                        value={adjustReason}
                                        onChange={(event) =>
                                            setAdjustReason(event.target.value)
                                        }
                                    >
                                        <option value="damaged">
                                            Damaged / Expired
                                        </option>
                                        <option value="correction">
                                            Stock count correction
                                        </option>
                                        <option value="returned">
                                            Returned to supplier
                                        </option>
                                        <option value="donated">Donated</option>
                                        <option value="other">Other</option>
                                    </SelectNative>
                                </div>
                            </>
                        )}
                        {selectedItems.length > 0 ? (
                            selectedItems.map((item) => (
                                <div
                                    key={item.id}
                                    className="space-y-2 rounded-lg border p-3"
                                >
                                    <p className="text-sm font-medium">
                                        {item.priceListName} ({item.quantity}{' '}
                                        current)
                                    </p>
                                    <Input
                                        aria-label={`${isStockCount ? 'Stock count' : 'Adjustment'} quantity for ${item.priceListName}`}
                                        type="number"
                                        min="0"
                                        step="1"
                                        placeholder={
                                            isStockCount
                                                ? `Current: ${item.quantity}`
                                                : 'Adjustment qty'
                                        }
                                        value={adjustQty[item.id] ?? ''}
                                        onChange={(event) =>
                                            setAdjustQty((current) => ({
                                                ...current,
                                                [item.id]: event.target.value,
                                            }))
                                        }
                                    />
                                </div>
                            ))
                        ) : (
                            <p className="text-sm text-muted-foreground">
                                {isStockCount
                                    ? 'Select items from the table to count their stock, or use the checkbox to select multiple items.'
                                    : 'Select items to adjust.'}
                            </p>
                        )}
                        <InputError message={adjustError ?? undefined} />
                    </div>
                    <SheetFooter className="mt-6">
                        <Button
                            variant="secondary"
                            onClick={() => setAdjustOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            disabled={adjustProcessing}
                            onClick={submitAdjust}
                        >
                            {isStockCount
                                ? adjustProcessing
                                    ? 'Saving…'
                                    : 'Save stock count'
                                : adjustProcessing
                                  ? 'Applying…'
                                  : 'Apply adjustment'}
                        </Button>
                    </SheetFooter>
                </SheetContent>
            </Sheet>

            <ConfirmDialog
                open={toDelete !== null}
                onOpenChange={(open) => {
                    if (deleteProcessing) {
                        return;
                    }
                    if (!open) {
                        setToDelete(null);
                        setDeleteError(null);
                    }
                }}
                title="Delete inventory?"
                description={
                    deleteError ?? 'This removes the lab inventory row.'
                }
                confirmLabel={deleteProcessing ? 'Deleting…' : 'Delete'}
                destructive
                processing={deleteProcessing}
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
