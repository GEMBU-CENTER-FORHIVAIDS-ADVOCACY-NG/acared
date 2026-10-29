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
import ConfirmDialog from '@/components/confirm-dialog';
import Heading from '@/components/heading';
import { usePermissions } from '@/hooks/use-permissions';
import Pagination from '@/components/pagination';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
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
    const [processing, setProcessing] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);

    function baseUrl(path = '') {
        return `/${teamSlug}/lab-inventories${path}`;
    }

    function applyFilters(patch: Partial<LabInventoryFilters>) {
        const next = { ...filters, page: 1, ...patch };

        router.get(
            baseUrl(),
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
        setProcessing(true);
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
            onFinish: () => setProcessing(false),
        };

        if (editing) {
            router.patch(baseUrl(`/${editing.id}`), payload, options);
        } else {
            router.post(baseUrl(), payload, options);
        }
    }

    function submitAdjust() {
        setProcessing(true);
        router.post(
            baseUrl('/adjust'),
            {
                type: adjustType,
                reason: adjustReason,
                items: selected.map((id) => ({
                    id,
                    quantity: Number(adjustQty[id] || 0),
                })),
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setAdjustOpen(false);
                    setSelected([]);
                    setAdjustQty({});
                },
                onFinish: () => setProcessing(false),
            },
        );
    }

    function deleteItem() {
        if (!toDelete) {
            return;
        }

        setProcessing(true);
        router.delete(baseUrl(`/${toDelete.id}`), {
            preserveScroll: true,
            onFinish: () => {
                setProcessing(false);
                setToDelete(null);
            },
        });
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
        setSelected(ids);
        if (isStockCountMode) {
            setIsStockCount(true);
            setAdjustType('set');
            setAdjustReason('correction');
            setAdjustQty(Object.fromEntries(ids.map((id) => {
                const item = inventories.data.find((i) => i.id === id);
                return [id, item ? String(item.quantity) : '0'];
            })));
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
                            {can.canStockCount('labinventory') && selected.length > 0 && (
                                <Button variant="outline" onClick={() => openAdjust(selected, true)}>
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
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            placeholder="Search product, form, SKU..."
                            className="max-w-sm"
                        />
                        <Button type="submit" variant="secondary">
                            Search
                        </Button>
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
                        <Table>
                            <TableHeader>
                            <TableRow>
                                <TableHead className="w-10">
                                    <input
                                        type="checkbox"
                                        aria-label="Select all lab inventory items"
                                        checked={
                                            inventories.data.length > 0 &&
                                            inventories.data.every((item) =>
                                                selected.includes(item.id),
                                            )
                                        }
                                        onChange={(event) =>
                                            setSelected(
                                                event.target.checked
                                                    ? [
                                                          ...new Set([
                                                              ...selected,
                                                              ...inventories.data.map(
                                                                  (item) =>
                                                                      item.id,
                                                              ),
                                                          ]),
                                                      ]
                                                    : selected.filter(
                                                          (id) =>
                                                              !inventories.data.some(
                                                                  (item) =>
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
                                                checked={selected.includes(
                                                    item.id,
                                                )}
                                                onChange={() =>
                                                    toggleSelect(item.id)
                                                }
                                            />
                                        </TableCell>
                                        <TableCell>
                                            {item.priceListName}
                                        </TableCell>
                                        <TableCell>
                                            {item.drugFormName}
                                        </TableCell>
                                        <TableCell>{item.minQty}</TableCell>
                                        <TableCell
                                            className={
                                                item.isLow
                                                    ? 'font-semibold text-red-600'
                                                    : 'font-semibold text-emerald-600'
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
                                            <Badge variant="secondary" className="capitalize">
                                                {item.status}
                                            </Badge>
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
                                                            setViewing(item)
                                                        }
                                                    >
                                                        <Eye className="mr-2 h-4 w-4" />
                                                        View
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={() =>
                                                            openEdit(item)
                                                        }
                                                    >
                                                        <Pencil className="mr-2 h-4 w-4" />
                                                        Edit
                                                    </DropdownMenuItem>
                                                    {can.canStockCount('labinventory') && (
                                                        <DropdownMenuItem
                                                            onClick={() =>
                                                                openAdjust(
                                                                    [item.id],
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
                                                            openAdjust(
                                                                [item.id],
                                                            )
                                                        }
                                                    >
                                                        <TrendingUp className="mr-2 h-4 w-4" />
                                                        Adjust
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem
                                                        onClick={() =>
                                                            setToDelete(item)
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
                        currentPage: inventories.current_page,
                        lastPage: inventories.last_page,
                        perPage: inventories.per_page,
                        total: inventories.total,
                    }}
                    onPageChange={(page) => applyFilters({ page })}
                    onPerPageChange={(perPage) => applyFilters({ perPage })}
                />
            </div>

            <Sheet open={formOpen} onOpenChange={setFormOpen}>
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
                            <Label>Product</Label>
                            <SelectNative
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
                            <Label>Product form</Label>
                            <SelectNative
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
                        {formError ? (
                            <p className="text-sm text-red-600">{formError}</p>
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
                            {processing ? 'Saving…' : 'Save'}
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

            <Sheet open={adjustOpen} onOpenChange={(open) => {
                if (!open) {
                    setIsStockCount(false);
                }
                setAdjustOpen(open);
            }}>
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
                            <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                                <p className="font-medium">Stock count mode</p>
                                <p className="text-xs">Enter the exact quantity found for each item. The reason is set to "Stock count correction".</p>
                            </div>
                        ) : (
                            <>
                                <div className="space-y-2">
                                    <Label>Type</Label>
                                    <SelectNative
                                        value={adjustType}
                                        onChange={(event) =>
                                            setAdjustType(event.target.value)
                                        }
                                    >
                                        <option value="add">Add stock</option>
                                        <option value="remove">Remove stock</option>
                                        <option value="set">Set exact quantity</option>
                                    </SelectNative>
                                </div>
                                <div className="space-y-2">
                                    <Label>Reason</Label>
                                    <SelectNative
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
                        {selectedItems.length > 0 ? selectedItems.map((item) => (
                            <div
                                key={item.id}
                                className="space-y-2 rounded-lg border p-3"
                            >
                                <p className="text-sm font-medium">
                                    {item.priceListName} ({item.quantity} current)
                                </p>
                                <Input
                                    type="number"
                                    min="0"
                                    placeholder={isStockCount ? `Current: ${item.quantity}` : 'Adjustment qty'}
                                    value={adjustQty[item.id] ?? ''}
                                    onChange={(event) =>
                                        setAdjustQty((current) => ({
                                            ...current,
                                            [item.id]: event.target.value,
                                        }))
                                    }
                                />
                            </div>
                        )) : (
                            <p className="text-sm text-muted-foreground">
                                {isStockCount
                                    ? 'Select items from the table to count their stock, or use the checkbox to select multiple items.'
                                    : 'Select items to adjust.'}
                            </p>
                        )}
                    </div>
                    <SheetFooter className="mt-6">
                        <Button
                            variant="secondary"
                            onClick={() => setAdjustOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button disabled={processing} onClick={submitAdjust}>
                            {isStockCount ? 'Save stock count' : (processing ? 'Applying…' : 'Apply adjustment')}
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
                title="Delete inventory?"
                description="This removes the lab inventory row."
                confirmLabel="Delete"
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
