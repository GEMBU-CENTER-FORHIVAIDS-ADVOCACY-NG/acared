import { Head, router, usePage } from '@inertiajs/react';
import { CheckCircle, Eye, MoreHorizontal, PackagePlus, Pencil, Plus, Printer, Trash2, X } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import ConfirmDialog from '@/components/confirm-dialog';
import Heading from '@/components/heading';
import Pagination from '@/components/pagination';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
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
import purchaseOrderRoutes from '@/routes/purchase-orders';
import type { Team } from '@/types';

type OrderItemData = {
    id: number;
    inventory_id: number;
    inventory_name: string;
    quantity: number;
    unitPrice: number;
    unitCost: number;
    expires_at: string | null;
};

type FormItem = {
    id: string;
    inventory_id: string;
    markup_id: string;
    quantity: string;
    unitCost: string;
    unitPrice: string;
};

type PurchaseOrder = {
    id: number;
    slug: string;
    vendor: { id: number; name: string } | null;
    user: { id: number; name: string } | null;
    subPrice: number;
    subCost: number;
    discount: number;
    total: number;
    items_count: number;
    status: string;
    items: OrderItemData[];
    createdAt: string | null;
    updatedAt: string | null;
};

type Vendor = {
    id: number;
    name: string;
};

type User = {
    id: number;
    name: string;
};

type Markup = {
    id: number;
    name: string;
    value: number;
};

type InventoryOption = {
    id: number;
    label: string;
    priceListName: string;
    drugFormName: string;
};

type Paginator<T> = {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
};


function generateId() {
    return Math.random().toString(36).slice(2, 9);
}

function createEmptyItem(): FormItem {
    return {
        id: generateId(),
        inventory_id: '',
        markup_id: '',
        quantity: '',
        unitCost: '',
        unitPrice: '',
    };
}

export default function PurchaseOrdersIndex({
    currencySymbol,
    nextSlug,
    purchaseOrders,
    vendors,
    users,
    markups,
    inventories,
    filters,
}: {
    currencySymbol: string;
    nextSlug: string;
    purchaseOrders: Paginator<PurchaseOrder>;
    vendors: Vendor[];
    users: User[];
    markups: Markup[];
    inventories: InventoryOption[];
    filters: { q: string; perPage: number };
}) {
    const { currentTeam } = usePage<{ currentTeam?: Team | null }>().props;
    const teamSlug = currentTeam?.slug ?? '';
    const [query, setQuery] = useState(filters.q);
    const [slug, setSlug] = useState('');
    const [vendorId, setVendorId] = useState('');
    const [discount, setDiscount] = useState('0');
    const [items, setItems] = useState<FormItem[]>([createEmptyItem()]);
    const [editing, setEditing] = useState<PurchaseOrder | null>(null);
    const [formOpen, setFormOpen] = useState(false);
    const [deleting, setDeleting] = useState<PurchaseOrder | null>(null);
    const [viewing, setViewing] = useState<PurchaseOrder | null>(null);
    const [printing, setPrinting] = useState<PurchaseOrder | null>(null);
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [approving, setApproving] = useState<PurchaseOrder | null>(null);
    const [posting, setPosting] = useState<PurchaseOrder | null>(null);
    const [receivedBy, setReceivedBy] = useState<string>('');
    const [expiryDates, setExpiryDates] = useState<Record<number, string>>({});
    const [inventorySearch, setInventorySearch] = useState<Record<string, string>>({});
    const { auth } = usePage<{ auth: { user: { id: number; name: string } } }>().props;

    // Filter inventories based on search per item
    const getFilteredInventories = useCallback(
        (itemId: string) => {
            const search = (inventorySearch[itemId] ?? '').toLowerCase();
            if (!search) return inventories;
            return inventories.filter((inv) => inv.label.toLowerCase().includes(search));
        },
        [inventories, inventorySearch],
    );

    // Calculate totals from items
    const { subPrice, subCost } = useMemo(() => {
        let sp = 0;
        let sc = 0;
        items.forEach((item) => {
            const qty = parseFloat(item.quantity) || 0;
            const price = parseFloat(item.unitPrice) || 0;
            const cost = parseFloat(item.unitCost) || 0;
            sp += qty * price;
            sc += qty * cost;
        });
        return { subPrice: sp, subCost: sc };
    }, [items]);

    const total = useMemo(() => {
        const disc = parseFloat(discount) || 0;
        return Math.max(0, subCost - disc);
    }, [subCost, discount]);

    function openCreate() {
        setEditing(null);
        setSlug(nextSlug);
        setVendorId('');
        setDiscount('0');
        setItems([createEmptyItem()]);
        setError(null);
        setInventorySearch({});
        setFormOpen(true);
    }

    function openEdit(po: PurchaseOrder) {
        setEditing(po);
        setSlug(po.slug);
        setVendorId(String(po.vendor?.id ?? ''));
        setDiscount(String(po.discount));
        const formItems: FormItem[] = po.items.map((item) => ({
            id: String(item.id),
            inventory_id: String(item.inventory_id),
            markup_id: '',
            quantity: String(item.quantity),
            unitCost: String(item.unitCost),
            unitPrice: String(item.unitPrice),
        }));
        setItems(formItems.length ? formItems : [createEmptyItem()]);
        setError(null);
        setInventorySearch({});
        setFormOpen(true);
    }

    function addItem() {
        setItems([...items, createEmptyItem()]);
    }

    function removeItem(id: string) {
        setItems(items.filter((item) => item.id !== id));
    }

    function updateItem(id: string, field: keyof FormItem, value: string) {
        setItems(
            items.map((item) => {
                if (item.id !== id) return item;

                const updated = { ...item, [field]: value };

                // Auto-calculate unitPrice when markup changes
                if (field === 'markup_id' || field === 'unitCost') {
                    const markupId = parseInt(field === 'markup_id' ? value : item.markup_id) || 0;
                    const cost = parseFloat(field === 'unitCost' ? value : item.unitCost) || 0;
                    const markup = markups.find((m) => m.id === markupId);
                    if (markup && cost > 0) {
                        updated.unitPrice = String(cost + (cost * markup.value) / 100);
                    }
                }

                return updated;
            }),
        );
    }

    function submit() {
        setProcessing(true);
        setError(null);

        // Filter out empty items
        const validItems = items
            .filter((item) => item.inventory_id && item.quantity)
            .map((item) => ({
                inventory_id: parseInt(item.inventory_id),
                markup_id: item.markup_id ? parseInt(item.markup_id) : null,
                quantity: parseFloat(item.quantity),
                unitPrice: parseFloat(item.unitPrice) || 0,
                unitCost: parseFloat(item.unitCost) || 0,
            }));

        const payload = {
            slug,
            vendor_id: Number(vendorId),
            user_id: auth.user.id,
            subPrice,
            subCost,
            discount: parseFloat(discount) || 0,
            total,
            status: editing ? editing.status : 'pending',
            items: validItems,
        };

        const options = {
            preserveScroll: true,
            onSuccess: () => setFormOpen(false),
            onError: (errors: Record<string, string>) =>
                setError(Object.values(errors)[0] ?? 'Unable to save purchase order.'),
            onFinish: () => setProcessing(false),
        };

        if (editing) {
            router.patch(
                purchaseOrderRoutes.update.url({
                    current_team: teamSlug,
                    purchaseOrder: editing.id,
                }),
                payload,
                options,
            );
        } else {
            router.post(purchaseOrderRoutes.store.url(teamSlug), payload, options);
        }
    }

    function destroy() {
        if (!deleting) return;
        setProcessing(true);
        router.delete(
            purchaseOrderRoutes.destroy.url({
                current_team: teamSlug,
                purchaseOrder: deleting.id,
            }),
            {
                preserveScroll: true,
                onSuccess: () => setDeleting(null),
                onFinish: () => setProcessing(false),
            },
        );
    }

    function destroySelected() {
        if (selectedIds.length === 0) return;
        setProcessing(true);
        router.delete(purchaseOrderRoutes.bulk.destroy.url(teamSlug), {
            data: { ids: selectedIds },
            preserveScroll: true,
            onSuccess: () => {
                setSelectedIds([]);
                setBulkDeleteOpen(false);
            },
            onFinish: () => setProcessing(false),
        });
    }

    function confirmApprove() {
        if (!approving) return;
        setProcessing(true);
        router.patch(
            purchaseOrderRoutes.approve.url({
                current_team: teamSlug,
                purchaseOrder: approving.id,
            }),
            {},
            {
                preserveScroll: true,
                onSuccess: () => setApproving(null),
                onFinish: () => setProcessing(false),
            },
        );
    }

    function openPostInventory(po: PurchaseOrder) {
        setPosting(po);
        setReceivedBy(String(auth.user.id));
        const dates: Record<number, string> = {};
        po.items.forEach((item) => {
            dates[item.id] = item.expires_at ?? '';
        });
        setExpiryDates(dates);
    }

    function postInventory() {
        if (!posting) return;
        setProcessing(true);
        router.post(
            purchaseOrderRoutes.postInventory.url({
                current_team: teamSlug,
                purchaseOrder: posting.id,
            }),
            {
                received_by: Number(receivedBy),
                expiry_dates: expiryDates,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setPosting(null);
                    setReceivedBy('');
                    setExpiryDates({});
                },
                onFinish: () => setProcessing(false),
            },
        );
    }

    function applySearch() {
        router.get(
            purchaseOrderRoutes.index.url(teamSlug, {
                query: {
                    q: query || undefined,
                    perPage: filters.perPage,
                    page: 1,
                },
            }),
            {},
            { preserveState: true, preserveScroll: true, replace: true },
        );
    }

    function changePage(page: number) {
        router.get(
            purchaseOrderRoutes.index.url(teamSlug, {
                query: {
                    q: filters.q || undefined,
                    perPage: filters.perPage,
                    page,
                },
            }),
            {},
            { preserveState: true, preserveScroll: true, replace: true },
        );
    }

    function changePerPage(perPage: number) {
        router.get(
            purchaseOrderRoutes.index.url(teamSlug, {
                query: { q: filters.q || undefined, perPage, page: 1 },
            }),
            {},
            { preserveState: true, preserveScroll: true, replace: true },
        );
    }

    const selectableOrders = purchaseOrders.data.filter(
        (po) => po.status === 'pending',
    );

    function formatCurrency(value: number) {
        return `${currencySymbol}${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }

    function getStatusBadgeClass(status: string) {
        const classes: Record<string, string> = {
            pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
            approved: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
            confirmed: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
            posted: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
            received: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
            cancelled: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
        };
        return classes[status] ?? 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }

    return (
        <>
            <Head title="Purchase Orders" />
            <div className="flex w-full flex-col space-y-6 p-4 md:p-6 lg:p-8">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <Heading
                        variant="small"
                        title="Purchase Orders"
                        description="Manage purchase orders from vendors."
                    />
                    <Button onClick={openCreate}>Create purchase order</Button>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <form
                        className="flex flex-1 items-center gap-2"
                        onSubmit={(event) => {
                            event.preventDefault();
                            applySearch();
                        }}
                    >
                        <Input
                            className="max-w-sm"
                            value={query}
                            onChange={(event) => setQuery(event.target.value)}
                            placeholder="Search purchase orders..."
                        />
                        <Button type="submit" variant="secondary">
                            Search
                        </Button>
                    </form>
                    {selectedIds.length > 0 ? (
                        <>
                            <span className="text-sm text-muted-foreground">
                                {selectedIds.length} selected
                            </span>
                            <Button
                                size="sm"
                                onClick={() => setBulkDeleteOpen(true)}
                            >
                                Delete selected
                            </Button>
                        </>
                    ) : null}
                </div>
                <Card>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>
                                        <input
                                            type="checkbox"
                                            aria-label="Select all purchase orders on this page"
                                            checked={
                                                selectableOrders.length > 0 &&
                                                selectableOrders.every((po) =>
                                                    selectedIds.includes(po.id),
                                                )
                                            }
                                            onChange={(event) =>
                                                setSelectedIds(
                                                    event.target.checked
                                                        ? [
                                                              ...new Set([
                                                                  ...selectedIds,
                                                                  ...selectableOrders.map(
                                                                      (po) => po.id,
                                                                  ),
                                                              ]),
                                                          ]
                                                        : selectedIds.filter(
                                                              (id) =>
                                                                  !selectableOrders.some(
                                                                      (po) =>
                                                                          po.id ===
                                                                          id,
                                                                  ),
                                                          ),
                                                )
                                            }
                                        />
                                    </TableHead>
                                    <TableHead>Order No</TableHead>
                                    <TableHead>Vendor</TableHead>
                                    <TableHead>Items</TableHead>
                                    <TableHead>Total</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Created</TableHead>
                                    <TableHead className="text-right">
                                        Actions
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {purchaseOrders.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={8}
                                            className="py-10 text-center text-muted-foreground"
                                        >
                                            No purchase orders found.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    purchaseOrders.data.map((po) => (
                                        <TableRow key={po.id}>
                                            <TableCell>
                                                {po.status === 'pending' ? (
                                                    <input
                                                        type="checkbox"
                                                        aria-label={`Select ${po.slug}`}
                                                        checked={selectedIds.includes(
                                                            po.id,
                                                        )}
                                                        onChange={(event) =>
                                                            setSelectedIds(
                                                                event.target.checked
                                                                    ? [
                                                                          ...selectedIds,
                                                                          po.id,
                                                                      ]
                                                                    : selectedIds.filter(
                                                                          (id) =>
                                                                              id !==
                                                                              po.id,
                                                                      ),
                                                            )
                                                        }
                                                    />
                                                ) : (
                                                    <span />
                                                )}
                                            </TableCell>
                                            <TableCell className="font-medium">
                                                {po.slug}
                                            </TableCell>
                                            <TableCell>
                                                {po.vendor?.name ?? '—'}
                                            </TableCell>
                                            <TableCell>
                                                {po.items_count}
                                            </TableCell>
                                            <TableCell>
                                                {formatCurrency(po.total)}
                                            </TableCell>
                                            <TableCell>
                                                <span
                                                    className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${getStatusBadgeClass(po.status)}`}
                                                >
                                                    {po.status.charAt(0).toUpperCase() + po.status.slice(1)}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                {po.createdAt
                                                    ? new Date(
                                                          po.createdAt,
                                                      ).toLocaleDateString()
                                                    : '—'}
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
                                                        {po.status === 'pending' ? (
                                                            <DropdownMenuItem
                                                                onClick={() => setApproving(po)}
                                                            >
                                                                <CheckCircle className="mr-2 h-4 w-4" />
                                                                Approve
                                                            </DropdownMenuItem>
                                                        ) : null}
                                                        {po.status === 'approved' ? (
                                                            <DropdownMenuItem
                                                                onClick={() => openPostInventory(po)}
                                                            >
                                                                <PackagePlus className="mr-2 h-4 w-4" />
                                                                Post Inventory
                                                            </DropdownMenuItem>
                                                        ) : null}
                                                        <DropdownMenuItem
                                                            onClick={() =>
                                                                setViewing(po)
                                                            }
                                                        >
                                                            <Eye className="mr-2 h-4 w-4" />
                                                            View
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            onClick={() =>
                                                                setPrinting(po)
                                                            }
                                                        >
                                                            <Printer className="mr-2 h-4 w-4" />
                                                            Print
                                                        </DropdownMenuItem>
                                                        {po.status === 'pending' ? (
                                                            <DropdownMenuItem
                                                                onClick={() =>
                                                                    openEdit(po)
                                                                }
                                                            >
                                                                <Pencil className="mr-2 h-4 w-4" />
                                                                Edit
                                                            </DropdownMenuItem>
                                                        ) : null}
                                                        {po.status === 'pending' ? (
                                                            <DropdownMenuItem
                                                                onClick={() =>
                                                                    setDeleting(po)
                                                                }
                                                            >
                                                                <Trash2 className="mr-2 h-4 w-4" />
                                                                Delete
                                                            </DropdownMenuItem>
                                                        ) : null}
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
                        currentPage: purchaseOrders.current_page,
                        lastPage: purchaseOrders.last_page,
                        perPage: purchaseOrders.per_page,
                        total: purchaseOrders.total,
                    }}
                    onPageChange={changePage}
                    onPerPageChange={changePerPage}
                />
            </div>

            {/* Create/Edit Sheet */}
            <Sheet open={formOpen} onOpenChange={setFormOpen}>
                <SheetContent className="w-full overflow-y-auto sm:max-w-3xl">
                    <SheetHeader>
                        <SheetTitle>
                            {editing ? 'Edit purchase order' : 'Create purchase order'}
                        </SheetTitle>
                        <SheetDescription>
                            {editing ? 'Update the purchase order details and items.' : 'Add a new purchase order with items from a vendor.'}
                        </SheetDescription>
                    </SheetHeader>
                    <div className="flex flex-col gap-4 px-4 py-5">
                        {/* Vendor */}
                        <div className="space-y-2">
                            <Label htmlFor="vendor_id">Vendor</Label>
                            <Select
                                value={vendorId}
                                onValueChange={setVendorId}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a vendor" />
                                </SelectTrigger>
                                <SelectContent>
                                    {vendors.map((v) => (
                                        <SelectItem key={v.id} value={String(v.id)}>
                                            {v.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Items Repeater */}
                        <div className="space-y-2">
                            <Label>Items</Label>
                            <div className="space-y-3">
                                {items.map((item, index) => (
                                    <div key={item.id} className="rounded-lg border p-3 space-y-3">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-medium text-muted-foreground">
                                                Item {index + 1}
                                            </span>
                                            {items.length > 1 && (
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => removeItem(item.id)}
                                                >
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </div>

                                        {/* Inventory search + select */}
                                        <div className="space-y-2">
                                            <Label>Item</Label>
                                            <Input
                                                placeholder="Search inventory..."
                                                value={inventorySearch[item.id] ?? ''}
                                                onChange={(e) =>
                                                    setInventorySearch({
                                                        ...inventorySearch,
                                                        [item.id]: e.target.value,
                                                    })
                                                }
                                            />
                                            <Select
                                                value={item.inventory_id}
                                                onValueChange={(value) =>
                                                    updateItem(item.id, 'inventory_id', value)
                                                }
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select inventory item" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {getFilteredInventories(item.id).map((inv) => (
                                                        <SelectItem key={inv.id} value={String(inv.id)}>
                                                            {inv.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        {/* Markup, Quantity, Cost, Price, Expiry */}
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="space-y-2">
                                                <Label>Markup</Label>
                                                <Select
                                                    value={item.markup_id}
                                                    onValueChange={(value) =>
                                                        updateItem(item.id, 'markup_id', value)
                                                    }
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select markup" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {markups.map((m) => (
                                                            <SelectItem key={m.id} value={String(m.id)}>
                                                                {m.name} ({m.value}%)
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Quantity</Label>
                                                <Input
                                                    type="number"
                                                    min="1"
                                                    placeholder="Qty"
                                                    value={item.quantity}
                                                    onChange={(e) =>
                                                        updateItem(item.id, 'quantity', e.target.value)
                                                    }
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Unit Cost</Label>
                                                <Input
                                                    type="number"
                                                    min="0"
                                                    step="0.01"
                                                    placeholder="Cost"
                                                    value={item.unitCost}
                                                    onChange={(e) =>
                                                        updateItem(item.id, 'unitCost', e.target.value)
                                                    }
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Unit Price</Label>
                                                <Input
                                                    type="number"
                                                    min="0"
                                                    step="0.01"
                                                    placeholder="Price"
                                                    value={item.unitPrice}
                                                    onChange={(e) =>
                                                        updateItem(item.id, 'unitPrice', e.target.value)
                                                    }
                                                />
                                            </div>
                                        </div>

                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Summary */}
                        <div className="rounded-lg border p-3 space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Subtotal (Cost)</span>
                                <span className="font-medium">{formatCurrency(subCost)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Subtotal (Price)</span>
                                <span className="font-medium">{formatCurrency(subPrice)}</span>
                            </div>
                            <div className="flex items-center justify-between gap-2 text-sm">
                                <span className="text-muted-foreground">Discount</span>
                                <Input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={discount}
                                    onChange={(e) => setDiscount(e.target.value)}
                                    className="h-8 w-24 text-right"
                                />
                            </div>
                            <div className="flex justify-between border-t pt-2 font-semibold">
                                <span>Total</span>
                                <span>{formatCurrency(total)}</span>
                            </div>
                        </div>

                        {error ? (
                            <p className="text-sm text-destructive">{error}</p>
                        ) : null}
                    </div>
                    <SheetFooter className="flex flex-row items-center gap-2">
                        <Button
                            variant="outline"
                            onClick={() => setFormOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button type="button" variant="outline" onClick={addItem}>
                            <Plus className="mr-1 h-4 w-4" /> Add item
                        </Button>
                        <Button disabled={processing || !vendorId} onClick={submit}>
                            {processing ? 'Saving...' : 'Save purchase order'}
                        </Button>
                    </SheetFooter>
                </SheetContent>
            </Sheet>

            {/* View Dialog */}
            <Dialog
                open={viewing !== null}
                onOpenChange={(open) => {
                    if (!open) setViewing(null);
                }}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {viewing?.slug ?? 'Purchase order details'}
                        </DialogTitle>
                        <DialogDescription>
                            Purchase order record and details.
                        </DialogDescription>
                    </DialogHeader>
                    {viewing ? (
                        <dl className="grid gap-3 sm:grid-cols-2">
                            <div>
                                <dt className="text-sm text-muted-foreground">
                                    Vendor
                                </dt>
                                <dd>{viewing.vendor?.name ?? '—'}</dd>
                            </div>
                            <div>
                                <dt className="text-sm text-muted-foreground">
                                    Status
                                </dt>
                                <dd>{viewing.status.charAt(0).toUpperCase() + viewing.status.slice(1)}</dd>
                            </div>
                            <div>
                                <dt className="text-sm text-muted-foreground">
                                    Sub Price
                                </dt>
                                <dd>{formatCurrency(viewing.subPrice)}</dd>
                            </div>
                            <div>
                                <dt className="text-sm text-muted-foreground">
                                    Sub Cost
                                </dt>
                                <dd>{formatCurrency(viewing.subCost)}</dd>
                            </div>
                            <div>
                                <dt className="text-sm text-muted-foreground">
                                    Discount
                                </dt>
                                <dd>{formatCurrency(viewing.discount)}</dd>
                            </div>
                            <div>
                                <dt className="text-sm text-muted-foreground">
                                    Total
                                </dt>
                                <dd>{formatCurrency(viewing.total)}</dd>
                            </div>
                            <div>
                                <dt className="text-sm text-muted-foreground">
                                    Created
                                </dt>
                                <dd>
                                    {viewing.createdAt
                                        ? new Date(
                                              viewing.createdAt,
                                          ).toLocaleString()
                                        : '—'}
                                </dd>
                            </div>
                            <div>
                                <dt className="text-sm text-muted-foreground">
                                    Updated
                                </dt>
                                <dd>
                                    {viewing.updatedAt
                                        ? new Date(
                                              viewing.updatedAt,
                                          ).toLocaleString()
                                        : '—'}
                                </dd>
                            </div>
                        </dl>
                    ) : null}
                </DialogContent>
            </Dialog>

            {/* Print Dialog */}
            <Dialog
                open={printing !== null}
                onOpenChange={(open) => {
                    if (!open) setPrinting(null);
                }}
            >
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>
                            {printing?.slug ?? 'Purchase order'}
                        </DialogTitle>
                        <DialogDescription>
                            Print this purchase order.
                        </DialogDescription>
                    </DialogHeader>
                    {printing ? (
                        <div className="space-y-4">
                            <div className="flex justify-between">
                                <div>
                                    <p className="text-sm font-semibold">
                                        {printing.vendor?.name ?? '—'}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {printing.status.charAt(0).toUpperCase() + printing.status.slice(1)}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-muted-foreground">
                                        {printing.createdAt
                                            ? new Date(printing.createdAt).toLocaleDateString()
                                            : '—'}
                                    </p>
                                </div>
                            </div>
                            <div className="rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Item</TableHead>
                                            <TableHead className="text-right">Qty</TableHead>
                                            <TableHead className="text-right">Unit Cost</TableHead>
                                            <TableHead className="text-right">Unit Price</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {printing.items.map((item) => (
                                            <TableRow key={item.id}>
                                                <TableCell className="font-medium">
                                                    {item.inventory_name}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    {item.quantity}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    {formatCurrency(item.unitCost)}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    {formatCurrency(item.unitPrice)}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                            <div className="space-y-1 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Sub Price</span>
                                    <span>{formatCurrency(printing.subPrice)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Sub Cost</span>
                                    <span>{formatCurrency(printing.subCost)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Discount</span>
                                    <span>{formatCurrency(printing.discount)}</span>
                                </div>
                                <div className="flex justify-between font-semibold">
                                    <span>Total</span>
                                    <span>{formatCurrency(printing.total)}</span>
                                </div>
                            </div>
                            <div className="flex justify-end gap-2">
                                <Button
                                    variant="outline"
                                    onClick={() => setPrinting(null)}
                                >
                                    Close
                                </Button>
                                <Button
                                    onClick={() => {
                                        if (!printing) return;

                                        const printWindow = window.open('', '_blank', 'width=800,height=600');

                                        if (!printWindow) return;

                                        printWindow.document.write(`
                                            <!DOCTYPE html>
                                            <html>
                                            <head>
                                                <title>Purchase Order ${printing.slug}</title>
                                                <style>
                                                    body { font-family: Arial, sans-serif; padding: 20px; font-size: 12px; }
                                                    h1 { font-size: 18px; margin-bottom: 5px; }
                                                    .company-header { margin-bottom: 20px; padding-bottom: 15px; border-bottom: 2px solid #333; }
                                                    .company-name { font-size: 16px; font-weight: bold; margin: 0; }
                                                    .company-details { color: #555; font-size: 11px; margin: 3px 0 0 0; }
                                                    .po-title { text-align: center; margin: 15px 0 10px 0; }
                                                    .po-title h2 { font-size: 16px; margin: 0; }
                                                    .header { display: flex; justify-content: space-between; margin-bottom: 20px; }
                                                    .status { color: #666; font-size: 11px; }
                                                    table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
                                                    th { background: #f3f4f6; padding: 8px; text-align: left; border-bottom: 2px solid #ddd; }
                                                    td { padding: 8px; border-bottom: 1px solid #ddd; }
                                                    .summary { display: flex; flex-direction: column; align-items: flex-end; gap: 5px; margin-bottom: 40px; }
                                                    .summary-row { display: flex; justify-content: space-between; width: 200px; }
                                                    .total { font-weight: bold; font-size: 14px; }
                                                    .requested-by { margin-bottom: 40px; font-size: 12px; }
                                                    .signatures { display: flex; justify-content: space-between; margin-top: 40px; }
                                                    .signature-block { width: 45%; text-align: center; }
                                                    .signature-line { border-top: 1px solid #333; margin-top: 50px; padding-top: 5px; }
                                                    @media print { body { padding: 0; } }
                                                </style>
                                            </head>
                                            <body>
                                                <div class="company-header">
                                                    <p class="company-name">${currentTeam?.name ?? ''}</p>
                                                    ${currentTeam?.address ? `<p class="company-details">${currentTeam.address}</p>` : ''}
                                                    <p class="company-details">${[currentTeam?.phone, currentTeam?.mobile].filter(Boolean).join(' | ')}</p>
                                                    ${currentTeam?.email ? `<p class="company-details">${currentTeam.email}</p>` : ''}
                                                </div>
                                                <div class="po-title">
                                                    <h2>Purchase Order</h2>
                                                    <p style="text-align:center;color:#666;margin:2px 0">${printing.slug}</p>
                                                </div>
                                                <div class="header">
                                                    <div>
                                                        <p style="font-size:11px;color:#666;margin:0">Vendor</p>
                                                        <p style="font-weight:600;margin:2px 0 0 0">${printing.vendor?.name ?? '—'}</p>
                                                    </div>
                                                    <div style="text-align:right">
                                                        <p style="font-size:11px;color:#666;margin:0">Date</p>
                                                        <p style="margin:2px 0 0 0">${printing.createdAt ? new Date(printing.createdAt).toLocaleDateString() : '—'}</p>
                                                        <p class="status">${printing.status.charAt(0).toUpperCase() + printing.status.slice(1)}</p>
                                                    </div>
                                                </div>
                                                <table>
                                                    <thead>
                                                        <tr>
                                                            <th>#</th>
                                                            <th>Item</th>
                                                            <th style="text-align:right">Qty</th>
                                                            <th style="text-align:right">Unit Cost</th>
                                                            <th style="text-align:right">Unit Price</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        ${printing.items.map((item, i) => `
                                                        <tr>
                                                            <td style="padding:8px;border-bottom:1px solid #ddd">${i + 1}</td>
                                                            <td style="padding:8px;border-bottom:1px solid #ddd;font-weight:500">${item.inventory_name}</td>
                                                            <td style="padding:8px;border-bottom:1px solid #ddd;text-align:right">${item.quantity}</td>
                                                            <td style="padding:8px;border-bottom:1px solid #ddd;text-align:right">${formatCurrency(item.unitCost)}</td>
                                                            <td style="padding:8px;border-bottom:1px solid #ddd;text-align:right">${formatCurrency(item.unitPrice)}</td>
                                                        </tr>`).join('')}
                                                    </tbody>
                                                </table>
                                                <div class="summary">
                                                    <div class="summary-row"><span>Sub Price</span><span>${formatCurrency(printing.subPrice)}</span></div>
                                                    <div class="summary-row"><span>Sub Cost</span><span>${formatCurrency(printing.subCost)}</span></div>
                                                    <div class="summary-row"><span>Discount</span><span>${formatCurrency(printing.discount)}</span></div>
                                                    <div class="summary-row total"><span>Total</span><span>${formatCurrency(printing.total)}</span></div>
                                                </div>
                                                <div class="requested-by">
                                                    <strong>Requested by:</strong> ${printing.user?.name ?? '—'}
                                                </div>
                                                <div class="signatures">
                                                    <div class="signature-block">
                                                        <div class="signature-line">
                                                            <p style="margin:0;font-size:11px;color:#666">Company Stamp / Signature</p>
                                                        </div>
                                                    </div>
                                                    <div class="signature-block">
                                                        <div class="signature-line">
                                                            <p style="margin:0;font-size:11px;color:#666">Requested By</p>
                                                        </div>
                                                    </div>
                                                </div>
                                                <script>
                                                    window.onload = function() { window.print(); window.close(); };
                                                </script>
                                            </body>
                                            </html>
                                        `);

                                        printWindow.document.close();
                                    }}
                                >
                                    <Printer className="mr-2 h-4 w-4" />
                                    Print
                                </Button>
                            </div>
                        </div>
                    ) : null}
                </DialogContent>
            </Dialog>
            <ConfirmDialog
                open={deleting !== null}
                onOpenChange={(open) => !open && setDeleting(null)}
                title="Delete purchase order?"
                description={`Delete ${deleting?.slug ?? 'this purchase order'}?`}
                confirmLabel="Delete"
                processing={processing}
                onConfirm={destroy}
            />
            <ConfirmDialog
                open={bulkDeleteOpen}
                onOpenChange={setBulkDeleteOpen}
                title="Delete selected purchase orders?"
                description={`This deletes ${selectedIds.length} selected purchase order records.`}
                confirmLabel="Delete selected"
                processing={processing}
                onConfirm={destroySelected}
            />
            <ConfirmDialog
                open={approving !== null}
                onOpenChange={(open) => !open && setApproving(null)}
                title="Approve purchase order?"
                description={`Approve ${approving?.slug ?? 'this purchase order'}? It will be ready to post to inventory.`}
                confirmLabel="Approve"
                processing={processing}
                onConfirm={confirmApprove}
            />
            <Sheet
                open={posting !== null}
                onOpenChange={(open) => {
                    if (!open) setPosting(null);
                }}
            >
                <SheetContent className="w-full sm:max-w-3xl">
                    <div className="flex h-full flex-col">
                        <SheetHeader>
                            <SheetTitle>Post to inventory</SheetTitle>
                            <SheetDescription>
                                This will add the items to inventory stock and update prices.
                            </SheetDescription>
                        </SheetHeader>
                        {posting ? (
                            <div className="flex-1 overflow-y-auto px-4 py-4">
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="received_by">Received by</Label>
                                        <Select
                                            value={receivedBy}
                                            onValueChange={setReceivedBy}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select who received the items" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {users.map((u) => (
                                                    <SelectItem key={u.id} value={String(u.id)}>
                                                        {u.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Ordered Items</Label>
                                        <div className="rounded-md border">
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead>Item</TableHead>
                                                        <TableHead className="text-right">Qty</TableHead>
                                                        <TableHead className="text-right">Unit Price</TableHead>
                                                        <TableHead>Expiry Date</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {posting.items.map((item) => (
                                                        <TableRow key={item.id}>
                                                            <TableCell className="font-medium">
                                                                {item.inventory_name}
                                                            </TableCell>
                                                            <TableCell className="text-right">
                                                                {item.quantity}
                                                            </TableCell>
                                                            <TableCell className="text-right">
                                                                {formatCurrency(item.unitPrice)}
                                                            </TableCell>
                                                            <TableCell>
                                                                <Input
                                                                    type="date"
                                                                    value={expiryDates[item.id] ?? ''}
                                                                    onChange={(e) =>
                                                                        setExpiryDates({
                                                                            ...expiryDates,
                                                                            [item.id]: e.target.value,
                                                                        })
                                                                    }
                                                                />
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : null}
                        <SheetFooter>
                            <Button
                                variant="outline"
                                onClick={() => setPosting(null)}
                            >
                                Cancel
                            </Button>
                            <Button disabled={processing || !receivedBy} onClick={postInventory}>
                                {processing ? 'Posting...' : 'Post to inventory'}
                            </Button>
                        </SheetFooter>
                    </div>
                </SheetContent>
            </Sheet>
        </>
    );
}
