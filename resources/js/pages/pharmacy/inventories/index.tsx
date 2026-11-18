import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    ArrowRightLeft,
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
import { useMemo, useRef, useState } from 'react';
import { Breadcrumbs } from '@/components/breadcrumbs';
import ConfirmDialog from '@/components/confirm-dialog';
import Heading from '@/components/heading';
import { usePermissions } from '@/hooks/use-permissions';
import Pagination from '@/components/pagination';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
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
import type { Team } from '@/types';
import {
    adjust as adjustRoute,
    destroy as destroyRoute,
    exportMethod as exportDrugs,
    importMethod as importDrugs,
    index as pharmacyIndex,
    show as showRoute,
    store as storeRoute,
    update as updateRoute,
} from '@/routes/pharmacy/inventories';
import { destroy as bulkDestroyRoute } from '@/routes/pharmacy/inventories/bulk';

type Medication = {
    id: number;
    sku: string;
    category: string | null;
    name: string;
    drugFormId: number;
    drugForm: string | null;
    priceListId: number;
    quantity: number;
    minQty: number;
    price: number;
    cost: number;
    value: number;
    profit: number;
    status: string;
    expiresAt: string | null;
};

type FormValues = {
    sku: string;
    price_list_id: string;
    drug_form_id: string;
    min_qty: string;
    quantity: string;
    price: string;
    cost: string;
    expires_at: string;
};

const EMPTY_FORM: FormValues = {
    sku: '',
    price_list_id: '',
    drug_form_id: '',
    min_qty: '5',
    quantity: '0',
    price: '0',
    cost: '0',
    expires_at: '',
};

export default function PharmacyIndex({
    currencySymbol,
    inventories,
    stockMovements,
    filters,
    formOptions,
    summary,
}: {
    currencySymbol: string;
    inventories: {
        data: Medication[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    stockMovements: {
        id: number;
        medication: string;
        quantity: number;
        status: string;
        user: string | null;
        createdAt: string | null;
    }[];
    filters: { q: string; status: string; sort: string; direction: string; perPage: number };
    formOptions: {
        priceLists: { id: number; name: string }[];
        drugForms: { id: number; name: string }[];
    };
    summary: {
        products: number;
        lowStock: number;
        expired: number;
        expiring: number;
    };
}) {
    const { currentTeam } = usePage<{ currentTeam?: Team | null }>().props;
    const can = usePermissions();
    const teamSlug = currentTeam?.slug ?? '';
    const [search, setSearch] = useState(filters.q);
    const [status, setStatus] = useState(filters.status);
    const [formOpen, setFormOpen] = useState(false);
    const [adjustOpen, setAdjustOpen] = useState(false);
    const [editing, setEditing] = useState<Medication | null>(null);
    const [deleting, setDeleting] = useState<Medication | null>(null);
    const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
    const [form, setForm] = useState<FormValues>(EMPTY_FORM);
    const [selected, setSelected] = useState<number[]>([]);
    const [quantities, setQuantities] = useState<Record<number, string>>({});
    const [adjustType, setAdjustType] = useState('add');
    const [reason, setReason] = useState('received');
    const [isStockCount, setIsStockCount] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [importError, setImportError] = useState<string | null>(null);
    const importInput = useRef<HTMLInputElement>(null);

    const selectedItems = useMemo(
        () => inventories.data.filter((item) => selected.includes(item.id)),
        [inventories.data, selected],
    );

    function applyFilters(next: {
        q?: string;
        status?: string;
        sort?: string;
        direction?: string;
        perPage?: number;
        page?: number;
    }) {
        router.get(
            pharmacyIndex.url(teamSlug),
            {
                q: (next.q ?? filters.q) || undefined,
                status: next.status ?? filters.status,
                sort: next.sort ?? filters.sort,
                direction: next.direction ?? filters.direction,
                perPage: next.perPage ?? filters.perPage,
                page: next.page ?? 1,
            },
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

    function openCreate() {
        setEditing(null);
        setForm(EMPTY_FORM);
        setError(null);
        setFormOpen(true);
    }

    function openAdjust(ids: number[], isStockCountMode = false) {
        setSelected(ids);
        if (isStockCountMode) {
            setIsStockCount(true);
            setAdjustType('set');
            setReason('correction');
            setQuantities(Object.fromEntries(ids.map((id) => {
                const item = inventories.data.find((i) => i.id === id);
                return [id, item ? String(item.quantity) : '0'];
            })));
        } else {
            setIsStockCount(false);
            setQuantities(Object.fromEntries(ids.map((id) => [id, ''])));
        }
        setError(null);
        setAdjustOpen(true);
    }

    function importDrugCatalog(file: File | undefined) {
        if (!file) {
            return;
        }

        setImportError(null);
        const payload = new FormData();
        payload.append('file', file);
        setProcessing(true);

        router.post(importDrugs.url(teamSlug), payload, {
            forceFormData: true,
            preserveScroll: true,
            onError: (errors) =>
                setImportError(errors.file ?? 'Drug import failed.'),
            onFinish: () => {
                setProcessing(false);
                if (importInput.current) {
                    importInput.current.value = '';
                }
            },
        });
    }

    function openEdit(item: Medication) {
        setEditing(item);
        setForm({
            sku: item.sku,
            price_list_id: String(item.priceListId),
            drug_form_id: String(item.drugFormId),
            min_qty: String(item.minQty),
            quantity: String(item.quantity),
            price: String(item.price),
            cost: String(item.cost),
            expires_at: item.expiresAt ?? '',
        });
        setError(null);
        setFormOpen(true);
    }

    function submitForm() {
        setProcessing(true);
        setError(null);
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
            onSuccess: () => setFormOpen(false),
            onError: (errors: Record<string, string>) =>
                setError(
                    Object.values(errors)[0] ?? 'Unable to save medication.',
                ),
            onFinish: () => setProcessing(false),
        };

        if (editing) {
            router.patch(
                updateRoute.url({
                    current_team: teamSlug,
                    drug_inventory: editing.id,
                }),
                payload,
                options,
            );
        } else {
            router.post(storeRoute.url(teamSlug), payload, options);
        }
    }

    function submitAdjustment() {
        setProcessing(true);
        router.post(
            adjustRoute.url(teamSlug),
            {
                type: adjustType,
                reason,
                items: selected.map((id) => ({
                    id,
                    quantity: Number(quantities[id] ?? 0),
                })),
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setAdjustOpen(false);
                    setSelected([]);
                    setQuantities({});
                },
                onError: (errors) =>
                    setError(
                        Object.values(errors)[0] ?? 'Unable to adjust stock.',
                    ),
                onFinish: () => setProcessing(false),
            },
        );
    }

    function deleteMedication() {
        if (!deleting) return;
        setProcessing(true);
        router.delete(
            destroyRoute.url({
                current_team: teamSlug,
                drug_inventory: deleting.id,
            }),
            {
                preserveScroll: true,
                onSuccess: () => setDeleting(null),
                onError: (errors) =>
                    setError(
                        Object.values(errors)[0] ??
                            'Medication could not be deleted.',
                    ),
                onFinish: () => setProcessing(false),
            },
        );
    }

    function deleteSelectedMedications() {
        setProcessing(true);
        router.delete(bulkDestroyRoute.url(teamSlug), {
            data: { ids: selected },
            preserveScroll: true,
            onSuccess: () => {
                setBulkDeleteOpen(false);
                setSelected([]);
            },
            onError: (errors) =>
                setError(
                    Object.values(errors)[0] ??
                        'Selected medications could not be deleted.',
                ),
            onFinish: () => setProcessing(false),
        });
    }

    return (
        <>
            <Head title="Pharmacy" />
            <div className="flex w-full flex-col space-y-6 p-4 md:p-6 lg:p-8">
                <div className="space-y-3">
                    <Breadcrumbs
                        breadcrumbs={[
                            {
                                title: 'Pharmacy',
                                href: pharmacyIndex(teamSlug),
                            },
                            {
                                title: 'Medication inventory',
                                href: pharmacyIndex(teamSlug),
                            },
                        ]}
                    />
                    <div className="flex flex-wrap items-start justify-between gap-4">
                        <Heading
                            title="Medication inventory"
                            description="Manage pharmacy stock, monitor expiry dates, and review stock activity."
                        />
                        <div className="flex gap-2">
                            {can.canStockCount('druginventory') && selected.length > 0 && (
                                <Button variant="outline" onClick={() => openAdjust(selected, true)}>
                                    <ClipboardCheck className="mr-2 size-4" />
                                    Stock Count ({selected.length})
                                </Button>
                            )}
                            <Button onClick={openCreate}>Add medication</Button>
                        </div>
                    </div>
                    <input
                        ref={importInput}
                        type="file"
                        accept=".csv,.txt"
                        className="hidden"
                        aria-label="Import drug catalog CSV"
                        onChange={(event) =>
                            importDrugCatalog(event.target.files?.[0])
                        }
                    />
                    {importError ? (
                        <p className="text-sm text-destructive" role="alert">
                            {importError}
                        </p>
                    ) : null}
                </div>

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {[
                        {
                            label: 'Total products',
                            value: summary.products,
                            icon: PackageSearch,
                            detail: 'Medication records',
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
                            className="max-w-sm"
                            value={search}
                            placeholder="Search medication or SKU"
                            onChange={(event) => setSearch(event.target.value)}
                        />
                        <SelectNative
                            value={status}
                            onChange={(event) => {
                                setStatus(event.target.value);
                                applyFilters({
                                    status: event.target.value,
                                });
                            }}
                        >
                            <option value="all">All stock</option>
                            <option value="low">Low stock</option>
                            <option value="stocked">Stocked</option>
                            <option value="available">Available</option>
                            <option value="expired">Expired</option>
                            <option value="expiring">Expiring soon</option>
                        </SelectNative>
                        <Button type="submit">
                            Search
                        </Button>
                    </form>
                    <Button
                        variant="outline"
                        disabled={processing}
                        onClick={() => importInput.current?.click()}
                    >
                        Import Drugs
                    </Button>
                    <Button variant="outline" asChild>
                        <a href={exportDrugs.url(teamSlug)}>
                            Export Drugs
                        </a>
                    </Button>
                </div>
                <Card>
                    <CardHeader>
                        <div className="space-y-1">
                            <CardTitle>Medication stock</CardTitle>
                            <CardDescription>
                                Inventory levels and medicine details for this
                                facility.
                            </CardDescription>
                        </div>
                    </CardHeader>
                    {selected.length > 0 && (
                        <div className="flex flex-wrap items-center justify-between gap-3 border-y bg-muted/40 px-6 py-3">
                            <p className="text-sm text-muted-foreground">
                                {selected.length} selected
                            </p>
                            <div className="flex gap-2">
                                {can.canStockCount('druginventory') && (
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
                                    Adjust selected stock
                                </Button>
                                <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => setBulkDeleteOpen(true)}
                                >
                                    Delete selected
                                </Button>
                            </div>
                        </div>
                    )}
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>
                                            <input
                                                type="checkbox"
                                                aria-label="Select all on page"
                                                checked={
                                                    inventories.data.length >
                                                        0 &&
                                                    selected.length ===
                                                        inventories.data.length
                                                }
                                                onChange={(event) =>
                                                    setSelected(
                                                        event.target.checked
                                                            ? inventories.data.map(
                                                                  (item) =>
                                                                      item.id,
                                                              )
                                                            : [],
                                                    )
                                                }
                                            />
                                        </TableHead>
                                        <TableHead>SKU</TableHead>
                                        <TableHead style={{ wordWrap: 'break-word' }}>
                                            <button
                                                type="button"
                                                className="inline-flex items-center"
                                                onClick={() => toggleSort('category')}
                                            >
                                                Category
                                                {sortIndicator('category')}
                                            </button>
                                        </TableHead>
                                        <TableHead>Product</TableHead>
                                        <TableHead>Product form</TableHead>
                                        <TableHead>Min qty</TableHead>
                                        <TableHead>
                                            <button
                                                type="button"
                                                className="inline-flex items-center"
                                                onClick={() => toggleSort('quantity')}
                                            >
                                                Qty available
                                                {sortIndicator('quantity')}
                                            </button>
                                        </TableHead>
                                        <TableHead>Cost</TableHead>
                                        <TableHead>Value</TableHead>
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
                                                colSpan={10}
                                                className="py-8 text-center text-muted-foreground"
                                            >
                                                No pharmacy stock found.
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
                                                        onChange={(event) =>
                                                            setSelected(
                                                                event.target
                                                                    .checked
                                                                    ? [
                                                                          ...selected,
                                                                          item.id,
                                                                      ]
                                                                    : selected.filter(
                                                                          (
                                                                              id,
                                                                          ) =>
                                                                              id !==
                                                                              item.id,
                                                                      ),
                                                            )
                                                        }
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    {item.sku}
                                                </TableCell>
                                                <TableCell style={{ wordWrap: 'break-word', whiteSpace: 'normal' }}>
                                                    {item.category ?? '—'}
                                                </TableCell>
                                                <TableCell className="font-medium">
                                                    {item.name}
                                                </TableCell>
                                                <TableCell>
                                                    {item.drugForm ?? '—'}
                                                </TableCell>
                                                <TableCell>
                                                    {item.minQty}
                                                </TableCell>
                                                <TableCell
                                                    className={
                                                        item.quantity <
                                                        item.minQty
                                                            ? 'font-bold text-destructive'
                                                            : 'font-bold text-emerald-600'
                                                    }
                                                >
                                                    {Math.abs(
                                                        item.quantity,
                                                    ).toLocaleString()}
                                                </TableCell>
                                                <TableCell>
                                                    {currencySymbol}{' '}
                                                    {item.cost.toLocaleString()}
                                                </TableCell>
                                                <TableCell>
                                                    {currencySymbol}{' '}
                                                    {item.value.toLocaleString()}
                                                </TableCell>
                                                <TableCell>
                                                    <span
                                                        className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium capitalize ${item.status === 'available' || item.status === 'stocked' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300' : 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300'}`}
                                                    >
                                                        {item.status}
                                                    </span>
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
                                                            <DropdownMenuItem asChild>
                                                                <Link
                                                                    href={showRoute({
                                                                        current_team:
                                                                            teamSlug,
                                                                        drug_inventory:
                                                                            item.id,
                                                                    })}
                                                                >
                                                                    <Eye className="mr-2 h-4 w-4" />
                                                                    View
                                                                </Link>
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
                                                            {can.canStockCount('druginventory') && (
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
                                                            <div className="px-1 py-0.5">
                                                                <Button
                                                                    variant="destructive"
                                                                    size="sm"
                                                                    className="w-full justify-start"
                                                                    onClick={() =>
                                                                        setDeleting(
                                                                            item,
                                                                        )
                                                                    }
                                                                >
                                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                                    Delete
                                                                </Button>
                                                            </div>
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
                                currentPage: inventories.current_page,
                                lastPage: inventories.last_page,
                                perPage: inventories.per_page,
                                total: inventories.total,
                            }}
                            onPageChange={(page) => applyFilters({ page })}
                            onPerPageChange={(perPage) =>
                                applyFilters({ perPage })
                            }
                        />
                    </div>
                </Card>

            </div>

            <Sheet open={formOpen} onOpenChange={setFormOpen}>
                <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
                    <SheetHeader>
                        <SheetTitle>
                            {editing
                                ? 'Edit medication stock'
                                : 'Add medication stock'}
                        </SheetTitle>
                        <SheetDescription>
                            Link a medication catalog item to pharmacy stock.
                        </SheetDescription>
                    </SheetHeader>
                    <div className="mt-6 grid gap-4 px-4 pb-4">
                        <div className="space-y-2">
                            <Label>Medication</Label>
                            <SelectNative
                                value={form.price_list_id}
                                onChange={(event) =>
                                    setForm({
                                        ...form,
                                        price_list_id: event.target.value,
                                    })
                                }
                            >
                                <option value="">Select medication</option>
                                {formOptions.priceLists.map((item) => (
                                    <option key={item.id} value={item.id}>
                                        {item.name}
                                    </option>
                                ))}
                            </SelectNative>
                        </div>
                        <div className="space-y-2">
                            <Label>Drug form</Label>
                            <SelectNative
                                value={form.drug_form_id}
                                onChange={(event) =>
                                    setForm({
                                        ...form,
                                        drug_form_id: event.target.value,
                                    })
                                }
                            >
                                <option value="">Select form</option>
                                {formOptions.drugForms.map((item) => (
                                    <option key={item.id} value={item.id}>
                                        {item.name}
                                    </option>
                                ))}
                            </SelectNative>
                        </div>
                        {(
                            [
                                ['sku', 'SKU'],
                                ['min_qty', 'Minimum quantity'],
                                ['quantity', 'Quantity'],
                                ['price', 'Selling price'],
                                ['cost', 'Unit cost'],
                            ] as const
                        ).map(([key, label]) => (
                            <div className="space-y-2" key={key}>
                                <Label htmlFor={key}>{label}</Label>
                                <Input
                                    id={key}
                                    type={key === 'sku' ? 'text' : 'number'}
                                    min={
                                        key === 'min_qty' ||
                                        key === 'quantity' ||
                                        key === 'price' ||
                                        key === 'cost'
                                            ? '0'
                                            : undefined
                                    }
                                    value={form[key]}
                                    onChange={(event) =>
                                        setForm({
                                            ...form,
                                            [key]: event.target.value,
                                        })
                                    }
                                />
                            </div>
                        ))}
                        <div className="space-y-2">
                            <Label htmlFor="expires_at">Expiry date</Label>
                            <Input
                                id="expires_at"
                                type="date"
                                value={form.expires_at}
                                onChange={(event) =>
                                    setForm({
                                        ...form,
                                        expires_at: event.target.value,
                                    })
                                }
                            />
                        </div>
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
                            {processing ? 'Saving…' : 'Save medication'}
                        </Button>
                    </SheetFooter>
                </SheetContent>
            </Sheet>

            <Sheet open={adjustOpen} onOpenChange={(open) => {
                if (!open) {
                    setIsStockCount(false);
                }
                setAdjustOpen(open);
            }}>
                <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
                    <SheetHeader>
                        <SheetTitle>
                            {isStockCount ? 'Stock count' : 'Adjust pharmacy stock'}
                        </SheetTitle>
                        <SheetDescription>
                            {isStockCount
                                ? 'Set the exact quantity found during physical stock count.'
                                : 'Record a received, dispensed, or corrected quantity.'}
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
                                    <Label>Adjustment</Label>
                                    <SelectNative
                                        value={adjustType}
                                        onChange={(event) =>
                                            setAdjustType(event.target.value)
                                        }
                                    >
                                        <option value="add">Add quantity</option>
                                        <option value="remove">Remove quantity</option>
                                        <option value="set">Set exact quantity</option>
                                    </SelectNative>
                                </div>
                                <div className="space-y-2">
                                    <Label>Reason</Label>
                                    <SelectNative
                                        value={reason}
                                        onChange={(event) =>
                                            setReason(event.target.value)
                                        }
                                    >
                                        <option value="received">Received</option>
                                        <option value="dispensed">Dispensed</option>
                                        <option value="damaged">
                                            Damaged / expired
                                        </option>
                                        <option value="correction">
                                            Stock correction
                                        </option>
                                        <option value="returned">Returned</option>
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
                                    {item.name} ({item.quantity} current)
                                </p>
                                <Input
                                    type="number"
                                    min="0"
                                    placeholder={isStockCount ? `Current: ${item.quantity}` : 'Quantity'}
                                    value={quantities[item.id] ?? ''}
                                    onChange={(event) =>
                                        setQuantities({
                                            ...quantities,
                                            [item.id]: event.target.value,
                                        })
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
                        {error ? (
                            <p className="text-sm text-red-600">{error}</p>
                        ) : null}
                    </div>
                    <SheetFooter className="mt-6">
                        <Button
                            variant="secondary"
                            onClick={() => setAdjustOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            disabled={processing}
                            onClick={submitAdjustment}
                        >
                            {isStockCount ? 'Save stock count' : (processing ? 'Applying…' : 'Apply adjustment')}
                        </Button>
                    </SheetFooter>
                </SheetContent>
            </Sheet>
            <ConfirmDialog
                open={deleting !== null}
                onOpenChange={(open) => {
                    if (!open) setDeleting(null);
                }}
                title="Delete medication stock?"
                description="Records with stock movement history cannot be deleted."
                confirmLabel="Delete"
                processing={processing}
                onConfirm={deleteMedication}
            />
            <ConfirmDialog
                open={bulkDeleteOpen}
                onOpenChange={setBulkDeleteOpen}
                title="Delete selected medication stock?"
                description="Medication records with stock movement history will be skipped."
                confirmLabel="Delete selected"
                processing={processing}
                onConfirm={deleteSelectedMedications}
            />
        </>
    );
}
