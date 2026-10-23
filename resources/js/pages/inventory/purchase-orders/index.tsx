import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import ConfirmDialog from '@/components/confirm-dialog';
import Heading from '@/components/heading';
import Pagination from '@/components/pagination';
import { Button } from '@/components/ui/button';
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
import purchaseOrderRoutes from '@/routes/purchase-orders';
import type { Team } from '@/types';

type OrderLine = {
    id?: number;
    inventoryId: number;
    itemName?: string;
    markupId: number;
    markupName?: string;
    quantity: number;
    unitCost: number;
    unitPrice?: number;
    totalCost?: number;
    totalPrice?: number;
    expiresAt: string;
};
type Order = {
    id: number;
    slug: string;
    vendorId: number;
    vendorName: string | null;
    userName: string | null;
    subPrice: number;
    subCost: number;
    discount: number;
    total: number;
    status: string;
    itemsCount: number;
    createdAt: string | null;
    items?: OrderLine[];
};
type Paginator = {
    data: Order[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
};
type FormLine = {
    inventory_id: string;
    markup_id: string;
    quantity: string;
    unitCost: string;
    expires_at: string;
};
const emptyLine = (): FormLine => ({
    inventory_id: '',
    markup_id: '',
    quantity: '1',
    unitCost: '0',
    expires_at: '',
});

export default function PurchaseOrdersIndex({
    currencySymbol,
    orders,
    filters,
    summary,
    formOptions,
}: {
    currencySymbol: string;
    orders: Paginator;
    filters: { q: string; status: string; perPage: number };
    summary: { pending: number; approved: number; posted: number };
    formOptions: {
        vendors: { id: number; name: string }[];
        inventories: { id: number; name: string }[];
        markups: { id: number; name: string; value: number }[];
        users: { id: number; name: string }[];
    };
}) {
    const { currentTeam } = usePage<{ currentTeam?: Team | null }>().props;
    const teamSlug = currentTeam?.slug ?? '';
    const [query, setQuery] = useState(filters.q);
    const [status, setStatus] = useState(filters.status);
    const [formOpen, setFormOpen] = useState(false);
    const [editing, setEditing] = useState<Order | null>(null);
    const [vendorId, setVendorId] = useState('');
    const [discount, setDiscount] = useState('0');
    const [lines, setLines] = useState<FormLine[]>([emptyLine()]);
    const [error, setError] = useState<string | null>(null);
    const [processing, setProcessing] = useState(false);
    const [selected, setSelected] = useState<number[]>([]);
    const [deleting, setDeleting] = useState<Order | null>(null);
    const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
    const [approving, setApproving] = useState<Order | null>(null);
    const [posting, setPosting] = useState<Order | null>(null);
    const [receiver, setReceiver] = useState('');

    function applyFilters(
        page = 1,
        perPage = filters.perPage,
        nextStatus = status,
    ) {
        router.get(
            purchaseOrderRoutes.index.url(teamSlug, {
                query: {
                    q: query || undefined,
                    status: nextStatus === 'all' ? undefined : nextStatus,
                    page,
                    perPage,
                },
            }),
            {},
            { preserveState: true, preserveScroll: true, replace: true },
        );
    }

    function openCreate() {
        setEditing(null);
        setVendorId('');
        setDiscount('0');
        setLines([emptyLine()]);
        setError(null);
        setFormOpen(true);
    }

    function openEdit(order: Order) {
        setEditing(order);
        setVendorId(String(order.vendorId));
        setDiscount(String(order.discount));
        setLines(
            (order.items ?? []).map((line) => ({
                inventory_id: String(line.inventoryId),
                markup_id: String(line.markupId),
                quantity: String(line.quantity),
                unitCost: String(line.unitCost),
                expires_at: line.expiresAt,
            })),
        );
        setError(null);
        setFormOpen(true);
    }

    function updateLine(index: number, patch: Partial<FormLine>) {
        setLines(
            lines.map((line, lineIndex) =>
                lineIndex === index ? { ...line, ...patch } : line,
            ),
        );
    }

    function submit() {
        setProcessing(true);
        setError(null);
        const payload = {
            vendor_id: Number(vendorId),
            discount: Number(discount),
            items: lines.map((line) => ({
                inventory_id: Number(line.inventory_id),
                markup_id: Number(line.markup_id),
                quantity: Number(line.quantity),
                unitCost: Number(line.unitCost),
                expires_at: line.expires_at,
            })),
        };
        const options = {
            preserveScroll: true,
            onSuccess: () => setFormOpen(false),
            onError: (errors: Record<string, string>) =>
                setError(
                    Object.values(errors)[0] ??
                        'Unable to save purchase order.',
                ),
            onFinish: () => setProcessing(false),
        };
        if (editing) {
            router.patch(
                purchaseOrderRoutes.update.url({
                    current_team: teamSlug,
                    purchase_order: editing.id,
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

    function deleteOne() {
        if (!deleting) return;
        setProcessing(true);
        router.delete(
            purchaseOrderRoutes.destroy.url({
                current_team: teamSlug,
                purchase_order: deleting.id,
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
        router.delete(purchaseOrderRoutes.bulk.destroy.url(teamSlug), {
            data: { ids: selected },
            preserveScroll: true,
            onSuccess: () => {
                setSelected([]);
                setBulkDeleteOpen(false);
            },
            onFinish: () => setProcessing(false),
        });
    }

    function approveOrder() {
        if (!approving) return;
        setProcessing(true);
        router.post(
            purchaseOrderRoutes.approve.url({
                current_team: teamSlug,
                purchase_order: approving.id,
            }),
            {},
            {
                preserveScroll: true,
                onSuccess: () => setApproving(null),
                onFinish: () => setProcessing(false),
            },
        );
    }

    function postOrder() {
        if (!posting) return;
        setProcessing(true);
        router.post(
            purchaseOrderRoutes.post.url({
                current_team: teamSlug,
                purchase_order: posting.id,
            }),
            { received_by: Number(receiver) },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setPosting(null);
                    setReceiver('');
                },
                onFinish: () => setProcessing(false),
            },
        );
    }

    const totals = lines.reduce(
        (result, line) => {
            const qty = Number(line.quantity) || 0;
            const cost = Number(line.unitCost) || 0;
            const markup =
                formOptions.markups.find(
                    (option) => option.id === Number(line.markup_id),
                )?.value ?? 0;
            result.cost += qty * cost;
            result.price += qty * cost * (1 + markup / 100);
            return result;
        },
        { cost: 0, price: 0 },
    );

    return (
        <>
            <Head title="Purchase orders" />
            <div className="flex w-full flex-col space-y-6 p-4 md:p-6 lg:p-8">
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <Heading
                        title="Purchase orders"
                        description="Create orders, approve them, then post received stock into inventory."
                    />
                    <Button onClick={openCreate}>Create purchase order</Button>
                </div>
                <div className="grid gap-4 sm:grid-cols-3">
                    {[
                        ['Pending', summary.pending],
                        ['Approved', summary.approved],
                        ['Posted', summary.posted],
                    ].map(([label, value]) => (
                        <button
                            key={label}
                            type="button"
                            onClick={() => {
                                const next = String(label).toLowerCase();
                                setStatus(next);
                                applyFilters(1, filters.perPage, next);
                            }}
                            className={`rounded-lg border p-4 text-left ${status === String(label).toLowerCase() ? 'border-primary' : ''}`}
                        >
                            <p className="text-sm text-muted-foreground">
                                {label}
                            </p>
                            <p className="mt-1 text-2xl font-semibold">
                                {value}
                            </p>
                        </button>
                    ))}
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
                        placeholder="Search order, vendor, or user..."
                    />
                    <SelectNative
                        aria-label="Purchase order status"
                        value={status}
                        onChange={(event) => {
                            setStatus(event.target.value);
                            applyFilters(
                                1,
                                filters.perPage,
                                event.target.value,
                            );
                        }}
                    >
                        <option value="all">All statuses</option>
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="posted">Posted</option>
                    </SelectNative>
                    <Button type="submit" variant="secondary">
                        Search
                    </Button>
                </form>
                {selected.length > 0 ? (
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
                <div className="overflow-x-auto rounded-lg border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>
                                    <input
                                        type="checkbox"
                                        aria-label="Select all purchase orders"
                                        checked={
                                            orders.data.length > 0 &&
                                            orders.data.every((order) =>
                                                selected.includes(order.id),
                                            )
                                        }
                                        onChange={(event) =>
                                            setSelected(
                                                event.target.checked
                                                    ? [
                                                          ...new Set([
                                                              ...selected,
                                                              ...orders.data.map(
                                                                  (order) =>
                                                                      order.id,
                                                              ),
                                                          ]),
                                                      ]
                                                    : selected.filter(
                                                          (id) =>
                                                              !orders.data.some(
                                                                  (order) =>
                                                                      order.id ===
                                                                      id,
                                                              ),
                                                      ),
                                            )
                                        }
                                    />
                                </TableHead>
                                <TableHead>Order</TableHead>
                                <TableHead>Vendor</TableHead>
                                <TableHead>Created by</TableHead>
                                <TableHead>Price</TableHead>
                                <TableHead>Cost</TableHead>
                                <TableHead>Discount</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Created</TableHead>
                                <TableHead className="text-right">
                                    Actions
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {orders.data.length === 0 ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={10}
                                        className="py-10 text-center text-muted-foreground"
                                    >
                                        No purchase orders found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                orders.data.map((order) => (
                                    <TableRow key={order.id}>
                                        <TableCell>
                                            <input
                                                type="checkbox"
                                                aria-label={`Select ${order.slug}`}
                                                checked={selected.includes(
                                                    order.id,
                                                )}
                                                onChange={(event) =>
                                                    setSelected(
                                                        event.target.checked
                                                            ? [
                                                                  ...selected,
                                                                  order.id,
                                                              ]
                                                            : selected.filter(
                                                                  (id) =>
                                                                      id !==
                                                                      order.id,
                                                              ),
                                                    )
                                                }
                                            />
                                        </TableCell>
                                        <TableCell className="font-medium">
                                            {order.slug}
                                            <span className="block text-xs text-muted-foreground">
                                                {order.itemsCount} items
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            {order.vendorName ?? '—'}
                                        </TableCell>
                                        <TableCell>
                                            {order.userName ?? '—'}
                                        </TableCell>
                                        <TableCell>
                                            {currencySymbol}
                                            {order.subPrice.toLocaleString()}
                                        </TableCell>
                                        <TableCell>
                                            {currencySymbol}
                                            {order.subCost.toLocaleString()}
                                        </TableCell>
                                        <TableCell>
                                            {currencySymbol}
                                            {order.discount.toLocaleString()}
                                        </TableCell>
                                        <TableCell>
                                            <span className="rounded-full bg-muted px-2 py-1 text-xs capitalize">
                                                {order.status}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            {order.createdAt
                                                ? new Date(
                                                      order.createdAt,
                                                  ).toLocaleDateString()
                                                : '—'}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-1">
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    asChild
                                                >
                                                    <Link
                                                        href={purchaseOrderRoutes.show.url(
                                                            {
                                                                current_team:
                                                                    teamSlug,
                                                                purchase_order:
                                                                    order.id,
                                                            },
                                                        )}
                                                    >
                                                        View
                                                    </Link>
                                                </Button>
                                                {order.status !== 'posted' ? (
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() =>
                                                            openEdit(order)
                                                        }
                                                    >
                                                        Edit
                                                    </Button>
                                                ) : null}
                                                {order.status === 'pending' ? (
                                                    <Button
                                                        size="sm"
                                                        variant="secondary"
                                                        onClick={() =>
                                                            setApproving(order)
                                                        }
                                                    >
                                                        Approve
                                                    </Button>
                                                ) : null}
                                                {order.status === 'approved' ? (
                                                    <Button
                                                        size="sm"
                                                        variant="secondary"
                                                        onClick={() => {
                                                            setPosting(order);
                                                            setReceiver('');
                                                        }}
                                                    >
                                                        Post
                                                    </Button>
                                                ) : null}
                                                {order.status !== 'posted' ? (
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() =>
                                                            setDeleting(order)
                                                        }
                                                    >
                                                        Delete
                                                    </Button>
                                                ) : null}
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
                        currentPage: orders.current_page,
                        lastPage: orders.last_page,
                        perPage: orders.per_page,
                        total: orders.total,
                    }}
                    onPageChange={(page) => applyFilters(page)}
                    onPerPageChange={(perPage) => applyFilters(1, perPage)}
                />
            </div>

            <Sheet open={formOpen} onOpenChange={setFormOpen}>
                <SheetContent className="overflow-y-auto sm:max-w-3xl">
                    <SheetHeader>
                        <SheetTitle>
                            {editing
                                ? `Edit ${editing.slug}`
                                : 'Create purchase order'}
                        </SheetTitle>
                        <SheetDescription>
                            Add vendor and order lines. Unit price is calculated
                            from the selected markup.
                        </SheetDescription>
                    </SheetHeader>
                    <div className="space-y-5 px-4 py-5">
                        <div className="space-y-2">
                            <Label>Vendor</Label>
                            <SelectNative
                                value={vendorId}
                                onChange={(event) =>
                                    setVendorId(event.target.value)
                                }
                            >
                                <option value="">Select a vendor</option>
                                {formOptions.vendors.map((vendor) => (
                                    <option key={vendor.id} value={vendor.id}>
                                        {vendor.name}
                                    </option>
                                ))}
                            </SelectNative>
                        </div>
                        <div className="space-y-3">
                            {lines.map((line, index) => (
                                <div
                                    key={index}
                                    className="rounded-lg border p-3"
                                >
                                    <div className="mb-3 flex items-center justify-between">
                                        <p className="font-medium">
                                            Item {index + 1}
                                        </p>
                                        {lines.length > 1 ? (
                                            <Button
                                                type="button"
                                                size="sm"
                                                variant="ghost"
                                                onClick={() =>
                                                    setLines(
                                                        lines.filter(
                                                            (_, lineIndex) =>
                                                                lineIndex !==
                                                                index,
                                                        ),
                                                    )
                                                }
                                            >
                                                Remove
                                            </Button>
                                        ) : null}
                                    </div>
                                    <div className="grid gap-3 sm:grid-cols-2">
                                        <div className="space-y-2 sm:col-span-2">
                                            <Label>Inventory item</Label>
                                            <SelectNative
                                                value={line.inventory_id}
                                                onChange={(event) =>
                                                    updateLine(index, {
                                                        inventory_id:
                                                            event.target.value,
                                                    })
                                                }
                                            >
                                                <option value="">
                                                    Select an item
                                                </option>
                                                {formOptions.inventories.map(
                                                    (item) => (
                                                        <option
                                                            key={item.id}
                                                            value={item.id}
                                                        >
                                                            {item.name}
                                                        </option>
                                                    ),
                                                )}
                                            </SelectNative>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Markup</Label>
                                            <SelectNative
                                                value={line.markup_id}
                                                onChange={(event) =>
                                                    updateLine(index, {
                                                        markup_id:
                                                            event.target.value,
                                                    })
                                                }
                                            >
                                                <option value="">
                                                    Select markup
                                                </option>
                                                {formOptions.markups.map(
                                                    (markup) => (
                                                        <option
                                                            key={markup.id}
                                                            value={markup.id}
                                                        >
                                                            {markup.name} (
                                                            {markup.value}%)
                                                        </option>
                                                    ),
                                                )}
                                            </SelectNative>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Expiry date</Label>
                                            <Input
                                                type="date"
                                                value={line.expires_at}
                                                onChange={(event) =>
                                                    updateLine(index, {
                                                        expires_at:
                                                            event.target.value,
                                                    })
                                                }
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Quantity</Label>
                                            <Input
                                                type="number"
                                                min="1"
                                                step="1"
                                                value={line.quantity}
                                                onChange={(event) =>
                                                    updateLine(index, {
                                                        quantity:
                                                            event.target.value,
                                                    })
                                                }
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Unit cost</Label>
                                            <Input
                                                type="number"
                                                min="0"
                                                step="any"
                                                value={line.unitCost}
                                                onChange={(event) =>
                                                    updateLine(index, {
                                                        unitCost:
                                                            event.target.value,
                                                    })
                                                }
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() =>
                                    setLines([...lines, emptyLine()])
                                }
                            >
                                Add another item
                            </Button>
                        </div>
                        <div className="grid gap-3 sm:grid-cols-3">
                            <div className="space-y-2">
                                <Label>Subtotal price</Label>
                                <Input
                                    value={`${currencySymbol}${totals.price.toFixed(2)}`}
                                    readOnly
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Subtotal cost</Label>
                                <Input
                                    value={`${currencySymbol}${totals.cost.toFixed(2)}`}
                                    readOnly
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Discount</Label>
                                <Input
                                    type="number"
                                    min="0"
                                    step="any"
                                    value={discount}
                                    onChange={(event) =>
                                        setDiscount(event.target.value)
                                    }
                                />
                            </div>
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
                        <Button disabled={processing} onClick={submit}>
                            {editing ? 'Save changes' : 'Create purchase order'}
                        </Button>
                    </SheetFooter>
                </SheetContent>
            </Sheet>

            <ConfirmDialog
                open={approving !== null}
                onOpenChange={(open) => !open && setApproving(null)}
                title="Approve purchase order?"
                description={`Approve ${approving?.slug ?? 'this order'} for inventory posting.`}
                confirmLabel="Approve"
                processing={processing}
                onConfirm={approveOrder}
            />
            <Sheet
                open={posting !== null}
                onOpenChange={(open) => !open && setPosting(null)}
            >
                <SheetContent>
                    <SheetHeader>
                        <SheetTitle>Post {posting?.slug}</SheetTitle>
                        <SheetDescription>
                            Received quantities will be added to inventory and
                            stock movement history.
                        </SheetDescription>
                    </SheetHeader>
                    <div className="space-y-2 px-4 py-5">
                        <Label>Received by</Label>
                        <SelectNative
                            value={receiver}
                            onChange={(event) =>
                                setReceiver(event.target.value)
                            }
                        >
                            <option value="">Select team member</option>
                            {formOptions.users.map((user) => (
                                <option key={user.id} value={user.id}>
                                    {user.name}
                                </option>
                            ))}
                        </SelectNative>
                    </div>
                    <SheetFooter>
                        <Button
                            variant="outline"
                            onClick={() => setPosting(null)}
                        >
                            Cancel
                        </Button>
                        <Button
                            disabled={processing || !receiver}
                            onClick={postOrder}
                        >
                            Post inventory
                        </Button>
                    </SheetFooter>
                </SheetContent>
            </Sheet>
            <ConfirmDialog
                open={deleting !== null}
                onOpenChange={(open) => !open && setDeleting(null)}
                title="Delete purchase order?"
                description={`Delete ${deleting?.slug ?? 'this order'}? Posted orders cannot be deleted.`}
                confirmLabel="Delete"
                destructive
                processing={processing}
                onConfirm={deleteOne}
            />
            <ConfirmDialog
                open={bulkDeleteOpen}
                onOpenChange={setBulkDeleteOpen}
                title="Delete selected purchase orders?"
                description="Posted purchase orders will be skipped."
                confirmLabel="Delete selected"
                destructive
                processing={processing}
                onConfirm={deleteSelected}
            />
        </>
    );
}
