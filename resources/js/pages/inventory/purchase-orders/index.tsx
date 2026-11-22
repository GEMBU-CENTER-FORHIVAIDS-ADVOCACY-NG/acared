import { Head, router, usePage } from '@inertiajs/react';
import {
    CheckCircle,
    Eye,
    MoreHorizontal,
    PackagePlus,
    Pencil,
    Plus,
    Printer,
    Trash2,
    X,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import AlertError from '@/components/alert-error';
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
    markup_id: number;
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
    const [printOrder, setPrintOrder] = useState<PurchaseOrder | null>(null);
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
    const [formProcessing, setFormProcessing] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);
    const [formFieldErrors, setFormFieldErrors] = useState<
        Record<string, string>
    >({});
    const [deleteProcessing, setDeleteProcessing] = useState(false);
    const [deleteError, setDeleteError] = useState<string | null>(null);
    const [bulkDeleteProcessing, setBulkDeleteProcessing] = useState(false);
    const [bulkDeleteError, setBulkDeleteError] = useState<string | null>(null);
    const [approveProcessing, setApproveProcessing] = useState(false);
    const [approveError, setApproveError] = useState<string | null>(null);
    const [postProcessing, setPostProcessing] = useState(false);
    const [postError, setPostError] = useState<string | null>(null);
    const [approving, setApproving] = useState<PurchaseOrder | null>(null);
    const [posting, setPosting] = useState<PurchaseOrder | null>(null);
    const [receivedBy, setReceivedBy] = useState<string>('');
    const [expiryDates, setExpiryDates] = useState<Record<number, string>>({});
    const { auth } = usePage<{ auth: { user: { id: number; name: string } } }>()
        .props;

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
        setFormError(null);
        setFormFieldErrors({});
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
            markup_id: String(item.markup_id ?? ''),
            quantity: String(item.quantity),
            unitCost: String(item.unitCost),
            unitPrice: String(item.unitPrice),
        }));
        setItems(formItems.length ? formItems : [createEmptyItem()]);
        setFormError(null);
        setFormFieldErrors({});
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
                    const markupId =
                        parseInt(
                            field === 'markup_id' ? value : item.markup_id,
                        ) || 0;
                    const cost =
                        parseFloat(
                            field === 'unitCost' ? value : item.unitCost,
                        ) || 0;
                    const markup = markups.find((m) => m.id === markupId);
                    if (markup && cost > 0) {
                        updated.unitPrice = String(
                            cost + (cost * markup.value) / 100,
                        );
                    }
                }

                return updated;
            }),
        );
    }

    function submit() {
        setFormProcessing(true);
        setFormError(null);
        setFormFieldErrors({});

        // Filter out empty items
        const validItems = items
            .filter((item) => item.inventory_id && item.quantity)
            .map((item) => ({
                inventory_id: parseInt(item.inventory_id),
                markup_id: parseInt(item.markup_id),
                quantity: parseFloat(item.quantity),
                unitPrice: parseFloat(item.unitPrice) || 0,
                unitCost: parseFloat(item.unitCost) || 0,
            }));

        // Validate that all items have a markup selected
        const missingMarkup = validItems.find((item) => !item.markup_id);
        if (missingMarkup) {
            setFormError('Please select a markup for all order items.');
            setFormFieldErrors({
                items: 'Select a markup for every order item.',
            });
            setFormProcessing(false);
            return;
        }

        const payload = {
            slug,
            vendor_id: Number(vendorId),
            discount: parseFloat(discount) || 0,
            status: editing ? editing.status : 'pending',
            items: validItems,
        };

        const options = {
            preserveScroll: true,
            onSuccess: () => setFormOpen(false),
            onError: (errors: Record<string, string>) => {
                setFormFieldErrors(errors);
                setFormError(
                    Object.values(errors)[0] ??
                        'Unable to save purchase order.',
                );
            },
            onFinish: () => setFormProcessing(false),
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
            router.post(
                purchaseOrderRoutes.store.url(teamSlug),
                payload,
                options,
            );
        }
    }

    function destroy() {
        if (!deleting || deleteProcessing) return;
        setDeleteProcessing(true);
        setDeleteError(null);
        router.delete(
            purchaseOrderRoutes.destroy.url({
                current_team: teamSlug,
                purchaseOrder: deleting.id,
            }),
            {
                preserveScroll: true,
                onSuccess: () => setDeleting(null),
                onError: (errors: Record<string, string>) =>
                    setDeleteError(
                        Object.values(errors)[0] ??
                            'Unable to delete purchase order.',
                    ),
                onFinish: () => setDeleteProcessing(false),
            },
        );
    }

    function destroySelected() {
        if (selectedIds.length === 0 || bulkDeleteProcessing) return;
        setBulkDeleteProcessing(true);
        setBulkDeleteError(null);
        router.delete(purchaseOrderRoutes.bulk.destroy.url(teamSlug), {
            data: { ids: selectedIds },
            preserveScroll: true,
            onSuccess: () => {
                setSelectedIds([]);
                setBulkDeleteOpen(false);
            },
            onError: (errors: Record<string, string>) =>
                setBulkDeleteError(
                    Object.values(errors)[0] ??
                        'Unable to delete purchase orders.',
                ),
            onFinish: () => setBulkDeleteProcessing(false),
        });
    }

    function confirmApprove() {
        if (!approving || approveProcessing) return;
        setApproveProcessing(true);
        setApproveError(null);
        router.patch(
            purchaseOrderRoutes.approve.url({
                current_team: teamSlug,
                purchaseOrder: approving.id,
            }),
            {},
            {
                preserveScroll: true,
                onSuccess: () => setApproving(null),
                onError: (errors: Record<string, string>) =>
                    setApproveError(
                        Object.values(errors)[0] ??
                            'Unable to approve purchase order.',
                    ),
                onFinish: () => setApproveProcessing(false),
            },
        );
    }

    function openPostInventory(po: PurchaseOrder) {
        setPosting(po);
        setPostError(null);
        setReceivedBy(String(auth.user.id));
        const dates: Record<number, string> = {};
        po.items.forEach((item) => {
            dates[item.id] = item.expires_at ?? '';
        });
        setExpiryDates(dates);
    }

    function postInventory() {
        if (!posting || postProcessing) return;
        setPostProcessing(true);
        setPostError(null);
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
                onError: (errors: Record<string, string>) =>
                    setPostError(
                        Object.values(errors)[0] ?? 'Unable to post inventory.',
                    ),
                onFinish: () => setPostProcessing(false),
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
            pending:
                'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
            approved:
                'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
            confirmed:
                'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
            posted: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
            received:
                'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
            cancelled:
                'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
        };
        return (
            classes[status] ??
            'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
        );
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
                        className="flex flex-1 flex-wrap items-center gap-2"
                        onSubmit={(event) => {
                            event.preventDefault();
                            applySearch();
                        }}
                    >
                        <Label
                            htmlFor="purchase-order-search"
                            className="sr-only"
                        >
                            Search purchase orders
                        </Label>
                        <Input
                            id="purchase-order-search"
                            className="max-w-sm"
                            value={query}
                            onChange={(event) => setQuery(event.target.value)}
                            placeholder="Search purchase orders..."
                        />
                        <Button type="submit">Search</Button>
                    </form>
                    {selectedIds.length > 0 ? (
                        <>
                            <span className="text-sm text-muted-foreground">
                                {selectedIds.length} selected
                            </span>
                            <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => {
                                    setBulkDeleteError(null);
                                    setBulkDeleteOpen(true);
                                }}
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
                                                                      (po) =>
                                                                          po.id,
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
                                                                event.target
                                                                    .checked
                                                                    ? [
                                                                          ...selectedIds,
                                                                          po.id,
                                                                      ]
                                                                    : selectedIds.filter(
                                                                          (
                                                                              id,
                                                                          ) =>
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
                                                    {po.status
                                                        .charAt(0)
                                                        .toUpperCase() +
                                                        po.status.slice(1)}
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
                                                    <DropdownMenuTrigger
                                                        asChild
                                                    >
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            aria-label={`Actions for purchase order ${po.slug}`}
                                                        >
                                                            <MoreHorizontal className="size-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        {po.status ===
                                                        'pending' ? (
                                                            <DropdownMenuItem
                                                                onClick={() =>
                                                                    setApproving(
                                                                        po,
                                                                    )
                                                                }
                                                            >
                                                                <CheckCircle className="mr-2 h-4 w-4" />
                                                                Approve
                                                            </DropdownMenuItem>
                                                        ) : null}
                                                        {po.status ===
                                                        'approved' ? (
                                                            <DropdownMenuItem
                                                                onClick={() =>
                                                                    openPostInventory(
                                                                        po,
                                                                    )
                                                                }
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
                                                        {po.status ===
                                                        'pending' ? (
                                                            <DropdownMenuItem
                                                                onClick={() =>
                                                                    openEdit(po)
                                                                }
                                                            >
                                                                <Pencil className="mr-2 h-4 w-4" />
                                                                Edit
                                                            </DropdownMenuItem>
                                                        ) : null}
                                                        {po.status ===
                                                        'pending' ? (
                                                            <>
                                                                <DropdownMenuSeparator />
                                                                <DropdownMenuItem
                                                                    variant="destructive"
                                                                    onClick={() => {
                                                                        setDeleteError(
                                                                            null,
                                                                        );
                                                                        setDeleting(
                                                                            po,
                                                                        );
                                                                    }}
                                                                >
                                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                                    Delete
                                                                </DropdownMenuItem>
                                                            </>
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
                <SheetContent className="w-full overflow-y-auto sm:max-w-5xl">
                    <SheetHeader>
                        <SheetTitle>
                            {editing
                                ? 'Edit purchase order'
                                : 'Create purchase order'}
                        </SheetTitle>
                        <SheetDescription>
                            {editing
                                ? 'Update the purchase order details and items.'
                                : 'Add a new purchase order with items from a vendor.'}
                        </SheetDescription>
                    </SheetHeader>
                    <div className="flex flex-col gap-4 px-4 py-5">
                        {/* Vendor */}
                        <div className="space-y-2">
                            <Label htmlFor="po-vendor">Vendor</Label>
                            <Select
                                value={vendorId}
                                onValueChange={setVendorId}
                            >
                                <SelectTrigger
                                    id="po-vendor"
                                    aria-invalid={!!formFieldErrors.vendor_id}
                                >
                                    <SelectValue placeholder="Select a vendor" />
                                </SelectTrigger>
                                <SelectContent>
                                    {vendors.map((v) => (
                                        <SelectItem
                                            key={v.id}
                                            value={String(v.id)}
                                        >
                                            {v.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <InputError message={formFieldErrors.vendor_id} />
                        </div>

                        {/* Items Table */}
                        <div className="space-y-2">
                            <Label>Items</Label>
                            <div className="overflow-hidden rounded-lg border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-12">
                                                #
                                            </TableHead>
                                            <TableHead className="min-w-[280px]">
                                                Item
                                            </TableHead>
                                            <TableHead className="min-w-[160px]">
                                                Markup{' '}
                                                <span className="text-destructive">
                                                    *
                                                </span>
                                            </TableHead>
                                            <TableHead className="w-20 text-right">
                                                Qty
                                            </TableHead>
                                            <TableHead className="w-28 text-right">
                                                Unit Cost
                                            </TableHead>
                                            <TableHead className="w-28 text-right">
                                                Unit Price
                                            </TableHead>
                                            <TableHead className="w-12"></TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {items.map((item, index) => (
                                            <TableRow key={item.id}>
                                                <TableCell className="text-muted-foreground">
                                                    {index + 1}
                                                </TableCell>
                                                <TableCell>
                                                    <Select
                                                        value={
                                                            item.inventory_id
                                                        }
                                                        onValueChange={(
                                                            value,
                                                        ) =>
                                                            updateItem(
                                                                item.id,
                                                                'inventory_id',
                                                                value,
                                                            )
                                                        }
                                                    >
                                                        <SelectTrigger
                                                            className="h-8 w-full"
                                                            aria-label={`Inventory item ${index + 1}`}
                                                        >
                                                            <SelectValue placeholder="Select item" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {inventories.map(
                                                                (inv) => (
                                                                    <SelectItem
                                                                        key={
                                                                            inv.id
                                                                        }
                                                                        value={String(
                                                                            inv.id,
                                                                        )}
                                                                    >
                                                                        {
                                                                            inv.label
                                                                        }
                                                                    </SelectItem>
                                                                ),
                                                            )}
                                                        </SelectContent>
                                                    </Select>
                                                </TableCell>
                                                <TableCell>
                                                    <Select
                                                        required
                                                        value={item.markup_id}
                                                        onValueChange={(
                                                            value,
                                                        ) =>
                                                            updateItem(
                                                                item.id,
                                                                'markup_id',
                                                                value,
                                                            )
                                                        }
                                                    >
                                                        <SelectTrigger
                                                            className="h-8 w-full"
                                                            aria-label={`Markup for item ${index + 1}`}
                                                            aria-invalid={
                                                                !!formFieldErrors.items
                                                            }
                                                        >
                                                            <SelectValue placeholder="Markup" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {markups.map(
                                                                (m) => (
                                                                    <SelectItem
                                                                        key={
                                                                            m.id
                                                                        }
                                                                        value={String(
                                                                            m.id,
                                                                        )}
                                                                    >
                                                                        {m.name}{' '}
                                                                        (
                                                                        {
                                                                            m.value
                                                                        }
                                                                        %)
                                                                    </SelectItem>
                                                                ),
                                                            )}
                                                        </SelectContent>
                                                    </Select>
                                                </TableCell>
                                                <TableCell>
                                                    <Input
                                                        id={`po-quantity-${index}`}
                                                        type="number"
                                                        min="1"
                                                        aria-label={`Quantity for item ${index + 1}`}
                                                        value={item.quantity}
                                                        onChange={(e) =>
                                                            updateItem(
                                                                item.id,
                                                                'quantity',
                                                                e.target.value,
                                                            )
                                                        }
                                                        className="h-8 w-full text-right"
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <Input
                                                        id={`po-unit-cost-${index}`}
                                                        type="number"
                                                        min="0"
                                                        step="0.01"
                                                        aria-label={`Unit cost for item ${index + 1}`}
                                                        value={item.unitCost}
                                                        onChange={(e) =>
                                                            updateItem(
                                                                item.id,
                                                                'unitCost',
                                                                e.target.value,
                                                            )
                                                        }
                                                        className="h-8 w-full text-right"
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <Input
                                                        id={`po-unit-price-${index}`}
                                                        type="number"
                                                        min="0"
                                                        step="0.01"
                                                        aria-label={`Unit price for item ${index + 1}`}
                                                        value={item.unitPrice}
                                                        onChange={(e) =>
                                                            updateItem(
                                                                item.id,
                                                                'unitPrice',
                                                                e.target.value,
                                                            )
                                                        }
                                                        className="h-8 w-full text-right"
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    {items.length > 1 && (
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="sm"
                                                            aria-label={`Remove item ${index + 1}`}
                                                            onClick={() =>
                                                                removeItem(
                                                                    item.id,
                                                                )
                                                            }
                                                            className="h-8 w-8 p-0"
                                                        >
                                                            <X className="h-4 w-4" />
                                                        </Button>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                            <InputError message={formFieldErrors.items} />
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={addItem}
                                className="w-full"
                            >
                                <Plus className="mr-1 h-4 w-4" /> Add item
                            </Button>
                        </div>

                        {/* Summary */}
                        <div className="space-y-2 rounded-lg border p-3">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">
                                    Subtotal (Cost)
                                </span>
                                <span className="font-medium">
                                    {formatCurrency(subCost)}
                                </span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">
                                    Subtotal (Price)
                                </span>
                                <span className="font-medium">
                                    {formatCurrency(subPrice)}
                                </span>
                            </div>
                            <div className="flex items-center justify-between gap-2 text-sm">
                                <Label
                                    htmlFor="po-discount"
                                    className="text-muted-foreground"
                                >
                                    Discount
                                </Label>
                                <Input
                                    id="po-discount"
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={discount}
                                    onChange={(e) =>
                                        setDiscount(e.target.value)
                                    }
                                    className="h-8 w-24 text-right"
                                />
                            </div>
                            <div className="flex justify-between border-t pt-2 font-semibold">
                                <span>Total</span>
                                <span>{formatCurrency(total)}</span>
                            </div>
                        </div>

                        <InputError message={formFieldErrors.discount} />
                        {formError ? (
                            <AlertError
                                errors={[formError]}
                                title="Unable to save purchase order"
                            />
                        ) : null}
                    </div>
                    <SheetFooter className="flex flex-row items-center gap-2">
                        <Button
                            variant="outline"
                            disabled={formProcessing}
                            onClick={() => setFormOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            disabled={formProcessing || !vendorId}
                            onClick={submit}
                        >
                            {formProcessing
                                ? 'Saving...'
                                : 'Save purchase order'}
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
                                <dd>
                                    {viewing.status.charAt(0).toUpperCase() +
                                        viewing.status.slice(1)}
                                </dd>
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
                <DialogContent className="max-w-5xl">
                    <DialogHeader>
                        <DialogTitle>
                            {printing?.slug ?? 'Purchase order'}
                        </DialogTitle>
                        <DialogDescription>
                            Print this purchase order.
                        </DialogDescription>
                    </DialogHeader>
                    {printing ? (
                        <div className="max-h-[70vh] space-y-4 overflow-y-auto">
                            <div className="flex justify-between">
                                <div>
                                    <p className="text-sm font-semibold">
                                        {printing.vendor?.name ?? '—'}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {printing.status
                                            .charAt(0)
                                            .toUpperCase() +
                                            printing.status.slice(1)}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-muted-foreground">
                                        {printing.createdAt
                                            ? new Date(
                                                  printing.createdAt,
                                              ).toLocaleDateString()
                                            : '—'}
                                    </p>
                                </div>
                            </div>
                            <div className="rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Item</TableHead>
                                            <TableHead className="text-right">
                                                Qty
                                            </TableHead>
                                            <TableHead className="text-right">
                                                Unit Cost
                                            </TableHead>
                                            <TableHead className="text-right">
                                                Unit Price
                                            </TableHead>
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
                                                    {formatCurrency(
                                                        item.unitCost,
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    {formatCurrency(
                                                        item.unitPrice,
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                            <div className="space-y-1 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">
                                        Sub Price
                                    </span>
                                    <span>
                                        {formatCurrency(printing.subPrice)}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">
                                        Sub Cost
                                    </span>
                                    <span>
                                        {formatCurrency(printing.subCost)}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">
                                        Discount
                                    </span>
                                    <span>
                                        {formatCurrency(printing.discount)}
                                    </span>
                                </div>
                                <div className="flex justify-between font-semibold">
                                    <span>Total</span>
                                    <span>
                                        {formatCurrency(printing.total)}
                                    </span>
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

                                        setPrintOrder(printing);
                                        setPrinting(null);
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
            {deleteError ? (
                <div className="px-4 pb-4">
                    <AlertError
                        errors={[deleteError]}
                        title="Unable to delete purchase order"
                    />
                </div>
            ) : null}
            {bulkDeleteError ? (
                <div className="px-4 pb-4">
                    <AlertError
                        errors={[bulkDeleteError]}
                        title="Unable to delete purchase orders"
                    />
                </div>
            ) : null}
            {approveError ? (
                <div className="px-4 pb-4">
                    <AlertError
                        errors={[approveError]}
                        title="Unable to approve purchase order"
                    />
                </div>
            ) : null}
            <ConfirmDialog
                open={deleting !== null}
                onOpenChange={(open) => {
                    if (!open && !deleteProcessing) {
                        setDeleting(null);
                        setDeleteError(null);
                    }
                }}
                title="Delete purchase order?"
                description={`Delete ${deleting?.slug ?? 'this purchase order'}? This cannot be undone.`}
                confirmLabel={deleteProcessing ? 'Deleting...' : 'Delete'}
                processing={deleteProcessing}
                destructive
                onConfirm={destroy}
            />
            <ConfirmDialog
                open={bulkDeleteOpen}
                onOpenChange={(open) => {
                    if (!open && !bulkDeleteProcessing) {
                        setBulkDeleteOpen(false);
                        setBulkDeleteError(null);
                    }
                }}
                title="Delete selected purchase orders?"
                description={`This deletes ${selectedIds.length} selected purchase order records. This cannot be undone.`}
                confirmLabel={
                    bulkDeleteProcessing ? 'Deleting...' : 'Delete selected'
                }
                processing={bulkDeleteProcessing}
                destructive
                onConfirm={destroySelected}
            />
            <ConfirmDialog
                open={approving !== null}
                onOpenChange={(open) => {
                    if (!open && !approveProcessing) {
                        setApproving(null);
                        setApproveError(null);
                    }
                }}
                title="Approve purchase order?"
                description={`Approve ${approving?.slug ?? 'this purchase order'}? It will be ready to post to inventory.`}
                confirmLabel={approveProcessing ? 'Approving...' : 'Approve'}
                processing={approveProcessing}
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
                                This will add the items to inventory stock and
                                update prices.
                            </SheetDescription>
                        </SheetHeader>
                        {posting ? (
                            <div className="flex-1 overflow-y-auto px-4 py-4">
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="received_by">
                                            Received by
                                        </Label>
                                        <Select
                                            value={receivedBy}
                                            onValueChange={setReceivedBy}
                                        >
                                            <SelectTrigger id="received_by">
                                                <SelectValue placeholder="Select who received the items" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {users.map((u) => (
                                                    <SelectItem
                                                        key={u.id}
                                                        value={String(u.id)}
                                                    >
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
                                                        <TableHead>
                                                            Item
                                                        </TableHead>
                                                        <TableHead className="text-right">
                                                            Qty
                                                        </TableHead>
                                                        <TableHead className="text-right">
                                                            Unit Price
                                                        </TableHead>
                                                        <TableHead>
                                                            Expiry Date
                                                        </TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {posting.items.map(
                                                        (item) => (
                                                            <TableRow
                                                                key={item.id}
                                                            >
                                                                <TableCell className="font-medium">
                                                                    {
                                                                        item.inventory_name
                                                                    }
                                                                </TableCell>
                                                                <TableCell className="text-right">
                                                                    {
                                                                        item.quantity
                                                                    }
                                                                </TableCell>
                                                                <TableCell className="text-right">
                                                                    {formatCurrency(
                                                                        item.unitPrice,
                                                                    )}
                                                                </TableCell>
                                                                <TableCell>
                                                                    <Input
                                                                        type="date"
                                                                        aria-label={`Expiry date for ${item.inventory_name}`}
                                                                        value={
                                                                            expiryDates[
                                                                                item
                                                                                    .id
                                                                            ] ??
                                                                            ''
                                                                        }
                                                                        onChange={(
                                                                            e,
                                                                        ) =>
                                                                            setExpiryDates(
                                                                                {
                                                                                    ...expiryDates,
                                                                                    [item.id]:
                                                                                        e
                                                                                            .target
                                                                                            .value,
                                                                                },
                                                                            )
                                                                        }
                                                                    />
                                                                </TableCell>
                                                            </TableRow>
                                                        ),
                                                    )}
                                                </TableBody>
                                            </Table>
                                        </div>
                                    </div>
                                    {postError ? (
                                        <AlertError
                                            errors={[postError]}
                                            title="Unable to post inventory"
                                        />
                                    ) : null}
                                </div>
                            </div>
                        ) : null}
                        <SheetFooter>
                            <Button
                                variant="outline"
                                disabled={postProcessing}
                                onClick={() => setPosting(null)}
                            >
                                Cancel
                            </Button>
                            <Button
                                disabled={postProcessing || !receivedBy}
                                onClick={postInventory}
                            >
                                {postProcessing
                                    ? 'Posting...'
                                    : 'Post to inventory'}
                            </Button>
                        </SheetFooter>
                    </div>
                </SheetContent>
            </Sheet>

            {printOrder ? (
                <div className="fixed inset-0 z-[100000] overflow-y-auto bg-background">
                    <div className="no-print sticky top-0 z-10 flex items-center justify-between border-b border-border bg-background px-6 py-3">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPrintOrder(null)}
                        >
                            ← Back to purchase orders
                        </Button>
                        <Button size="sm" onClick={() => window.print()}>
                            <Printer className="mr-2 h-4 w-4" />
                            Print order
                        </Button>
                    </div>
                    <div
                        id="purchase-order-print-area"
                        className="mx-auto max-w-4xl space-y-6 p-8 text-sm"
                    >
                        <div className="space-y-1 border-b-2 border-foreground pb-4">
                            <p className="text-base font-bold">
                                {currentTeam?.name ?? ''}
                            </p>
                            {currentTeam?.address ? (
                                <p className="text-xs">{currentTeam.address}</p>
                            ) : null}
                            <p className="text-xs">
                                {[currentTeam?.phone, currentTeam?.mobile]
                                    .filter(Boolean)
                                    .join(' | ')}
                            </p>
                            {currentTeam?.email ? (
                                <p className="text-xs">{currentTeam.email}</p>
                            ) : null}
                        </div>
                        <div className="text-center">
                            <h2 className="text-base font-semibold">
                                Purchase Order
                            </h2>
                            <p className="text-xs">{printOrder.slug}</p>
                        </div>
                        <div className="flex justify-between">
                            <div>
                                <p className="text-xs">Vendor</p>
                                <p className="font-semibold">
                                    {printOrder.vendor?.name ?? '—'}
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="text-xs">Date</p>
                                <p>
                                    {printOrder.createdAt
                                        ? new Date(
                                              printOrder.createdAt,
                                          ).toLocaleDateString()
                                        : '—'}
                                </p>
                                <p className="text-xs">
                                    {printOrder.status.charAt(0).toUpperCase() +
                                        printOrder.status.slice(1)}
                                </p>
                            </div>
                        </div>
                        <table className="w-full border-collapse text-sm">
                            <thead>
                                <tr className="border-b-2 border-muted">
                                    <th className="px-2 py-2 text-left">#</th>
                                    <th className="px-2 py-2 text-left">
                                        Item
                                    </th>
                                    <th className="px-2 py-2 text-right">
                                        Qty
                                    </th>
                                    <th className="px-2 py-2 text-right">
                                        Unit Cost
                                    </th>
                                    <th className="px-2 py-2 text-right">
                                        Unit Price
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {printOrder.items.map((item, index) => (
                                    <tr key={item.id} className="border-b">
                                        <td className="px-2 py-2">
                                            {index + 1}
                                        </td>
                                        <td className="px-2 py-2 font-medium">
                                            {item.inventory_name}
                                        </td>
                                        <td className="px-2 py-2 text-right">
                                            {item.quantity}
                                        </td>
                                        <td className="px-2 py-2 text-right">
                                            {formatCurrency(item.unitCost)}
                                        </td>
                                        <td className="px-2 py-2 text-right">
                                            {formatCurrency(item.unitPrice)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <div className="ml-auto w-64 space-y-1">
                            <div className="flex justify-between">
                                <span>Sub Price</span>
                                <span>
                                    {formatCurrency(printOrder.subPrice)}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span>Sub Cost</span>
                                <span>
                                    {formatCurrency(printOrder.subCost)}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span>Discount</span>
                                <span>
                                    {formatCurrency(printOrder.discount)}
                                </span>
                            </div>
                            <div className="flex justify-between font-semibold">
                                <span>Total</span>
                                <span>{formatCurrency(printOrder.total)}</span>
                            </div>
                        </div>
                        <p className="text-sm">
                            <strong>Requested by:</strong>{' '}
                            {printOrder.user?.name ?? '—'}
                        </p>
                        <div className="grid grid-cols-2 gap-8 pt-10">
                            <div>
                                <p className="border-t border-foreground/40 pt-2 text-xs">
                                    Company Stamp / Signature
                                </p>
                            </div>
                            <div>
                                <p className="border-t border-foreground/40 pt-2 text-xs">
                                    Requested By
                                </p>
                            </div>
                        </div>
                    </div>
                    <style>{`
                        @media print {
                            body * {
                                visibility: hidden !important;
                            }
                            #purchase-order-print-area,
                            #purchase-order-print-area * {
                                visibility: visible !important;
                            }
                            #purchase-order-print-area {
                                position: absolute !important;
                                top: 0 !important;
                                left: 0 !important;
                                width: 100% !important;
                                max-width: none !important;
                                padding: 0 !important;
                                color: #000 !important;
                            }
                            #purchase-order-print-area tr {
                                break-inside: avoid !important;
                            }
                        }
                    `}</style>
                </div>
            ) : null}
        </>
    );
}
