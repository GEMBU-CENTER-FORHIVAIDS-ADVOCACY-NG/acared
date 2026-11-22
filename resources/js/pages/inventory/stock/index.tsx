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
    Printer,
    Trash2,
    TriangleAlert,
    TrendingUp,
    Upload,
} from 'lucide-react';
import { useRef, useState } from 'react';
import AlertError from '@/components/alert-error';
import ConfirmDialog from '@/components/confirm-dialog';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { usePermissions } from '@/hooks/use-permissions';
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
import stockRoutes from '@/routes/inventory/stock';
import type { Team } from '@/types';

type InventoryTarget = 'stock' | 'lab' | 'drug';

type ColumnMapping = {
    sku: string;
    name: string;
    drug_form: string;
    quantity: string;
    price: string;
    cost: string;
    min_qty: string;
    status: string;
    expires_at: string;
};

const EMPTY_MAPPING: ColumnMapping = {
    sku: '',
    name: '',
    drug_form: '',
    quantity: '',
    price: '',
    cost: '',
    min_qty: '',
    status: '',
    expires_at: '',
};

const MAPPABLE_FIELDS = [
    { key: 'sku', label: 'SKU' },
    { key: 'name', label: 'Product name' },
    { key: 'drug_form', label: 'Product form' },
    { key: 'quantity', label: 'Quantity' },
    { key: 'price', label: 'Price' },
    { key: 'cost', label: 'Cost' },
    { key: 'min_qty', label: 'Minimum quantity' },
    { key: 'status', label: 'Status' },
    { key: 'expires_at', label: 'Expiry date' },
] as const;

const TARGET_LABELS: Record<InventoryTarget, string> = {
    stock: 'Stock (General inventory)',
    lab: 'Lab inventory',
    drug: 'Drug inventory (Pharmacy)',
};

type Inventory = {
    id: number;
    sku: string;
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
    subCategory: string | null;
};
type Paginator = {
    data: Inventory[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
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
const emptyForm: FormValues = {
    sku: '',
    price_list_id: '',
    drug_form_id: '',
    min_qty: '5',
    quantity: '0',
    price: '0',
    cost: '0',
    expires_at: '',
};

export default function InventoryStockIndex({
    currencySymbol,
    inventories,
    filters,
    formOptions,
    summary,
}: {
    currencySymbol: string;
    inventories: Paginator;
    filters: {
        q: string;
        status: string;
        categoryId: number | null;
        subcategoryId: number | null;
        sort: string;
        perPage: number;
    };
    formOptions: {
        priceLists: { id: number; name: string }[];
        drugForms: { id: number; name: string }[];
        users: { id: number; name: string }[];
        categories: { id: number; name: string }[];
        subcategories: { id: number; name: string }[];
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
    const [query, setQuery] = useState(filters.q);
    const [status, setStatus] = useState(filters.status);
    const [categoryId, setCategoryId] = useState(
        filters.categoryId?.toString() ?? '',
    );
    const [subcategoryId, setSubcategoryId] = useState(
        filters.subcategoryId?.toString() ?? '',
    );
    const [editing, setEditing] = useState<Inventory | null>(null);
    const [formOpen, setFormOpen] = useState(false);
    const [form, setForm] = useState<FormValues>(emptyForm);
    const [formProcessing, setFormProcessing] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);
    const [formFieldErrors, setFormFieldErrors] = useState<
        Record<string, string>
    >({});
    const [adjustmentProcessing, setAdjustmentProcessing] = useState(false);
    const [adjustmentError, setAdjustmentError] = useState<string | null>(null);
    const [adjustmentFieldErrors, setAdjustmentFieldErrors] = useState<
        Record<string, string>
    >({});
    const [transferProcessing, setTransferProcessing] = useState(false);
    const [transferError, setTransferError] = useState<string | null>(null);
    const [transferFieldErrors, setTransferFieldErrors] = useState<
        Record<string, string>
    >({});
    const [deleteProcessing, setDeleteProcessing] = useState(false);
    const [deleteError, setDeleteError] = useState<string | null>(null);
    const [bulkDeleteProcessing, setBulkDeleteProcessing] = useState(false);
    const [bulkDeleteError, setBulkDeleteError] = useState<string | null>(null);
    const [selected, setSelected] = useState<number[]>([]);
    const [adjustOpen, setAdjustOpen] = useState(false);
    const [transferOpen, setTransferOpen] = useState(false);
    const [operation, setOperation] = useState<'add' | 'remove' | 'set'>('add');
    const [reason, setReason] = useState('correction');
    const [isStockCount, setIsStockCount] = useState(false);
    const [location, setLocation] = useState<'lab' | 'pharmacy'>('lab');
    const [receiver, setReceiver] = useState('');
    const [quantities, setQuantities] = useState<Record<number, string>>({});
    const [deleting, setDeleting] = useState<Inventory | null>(null);
    const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
    const [importOpen, setImportOpen] = useState(false);
    const [importTarget, setImportTarget] = useState<InventoryTarget>('stock');
    const [importHeaders, setImportHeaders] = useState<string[]>([]);
    const [importMapping, setImportMapping] =
        useState<ColumnMapping>(EMPTY_MAPPING);
    const [importError, setImportError] = useState<string | null>(null);
    const [importProcessing, setImportProcessing] = useState(false);
    const importFileInput = useRef<HTMLInputElement>(null);

    function applyFilters(
        page = 1,
        perPage = filters.perPage,
        sort = filters.sort,
    ) {
        router.get(
            stockRoutes.index.url(teamSlug, {
                query: {
                    q: query || undefined,
                    status: status === 'all' ? undefined : status,
                    category_id: categoryId || undefined,
                    subcategory_id: subcategoryId || undefined,
                    sort: sort === 'price_list_id' ? undefined : sort,
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
        setForm(emptyForm);
        setFormError(null);
        setFormFieldErrors({});
        setFormOpen(true);
    }

    function openEdit(item: Inventory) {
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
        setFormError(null);
        setFormFieldErrors({});
        setFormOpen(true);
    }

    function submitForm() {
        setFormProcessing(true);
        setFormError(null);
        setFormFieldErrors({});
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
            onError: (errors: Record<string, string>) => {
                setFormFieldErrors(errors);
                setFormError(
                    Object.values(errors)[0] ??
                        'Unable to save inventory item.',
                );
            },
            onFinish: () => setFormProcessing(false),
        };
        if (editing) {
            router.patch(
                stockRoutes.update.url({
                    current_team: teamSlug,
                    inventory: editing.id,
                }),
                payload,
                options,
            );
        } else {
            router.post(stockRoutes.store.url(teamSlug), payload, options);
        }
    }

    function openOperation(
        kind: 'adjust' | 'transfer',
        ids: number[],
        isStockCountMode = false,
    ) {
        setSelected(ids);
        setAdjustmentError(null);
        setAdjustmentFieldErrors({});
        setTransferError(null);
        setTransferFieldErrors({});
        if (isStockCountMode) {
            setIsStockCount(true);
            setOperation('set');
            setReason('correction');
            setQuantities(
                Object.fromEntries(
                    ids.map((id) => {
                        const item = inventories.data.find((i) => i.id === id);
                        return [id, item ? String(item.quantity) : '0'];
                    }),
                ),
            );
        } else {
            setIsStockCount(false);
            setQuantities(Object.fromEntries(ids.map((id) => [id, '1'])));
        }
        if (kind === 'adjust') setAdjustOpen(true);
        else setTransferOpen(true);
    }

    function submitAdjustment() {
        setAdjustmentProcessing(true);
        setAdjustmentError(null);
        setAdjustmentFieldErrors({});

        const items = selected
            .map((id) => ({
                id,
                quantity: Number(quantities[id]) || 0,
            }))
            .filter((item) => item.quantity > 0);

        if (items.length === 0) {
            setAdjustmentError(
                'Please enter a quantity greater than zero for at least one item.',
            );
            setAdjustmentFieldErrors(
                Object.fromEntries(
                    selected.map((id) => [
                        String(id),
                        'Enter a quantity greater than zero.',
                    ]),
                ),
            );
            setAdjustmentProcessing(false);
            return;
        }

        router.post(
            stockRoutes.adjust.url(teamSlug),
            {
                type: operation,
                reason,
                items,
            },
            {
                preserveScroll: true,
                onSuccess: () => setAdjustOpen(false),
                onError: (errors: Record<string, string>) => {
                    setAdjustmentFieldErrors(errors);
                    setAdjustmentError(
                        Object.values(errors)[0] ?? 'Unable to adjust stock.',
                    );
                },
                onFinish: () => setAdjustmentProcessing(false),
            },
        );
    }

    function submitTransfer() {
        setTransferProcessing(true);
        setTransferError(null);
        setTransferFieldErrors({});

        const items = selected
            .map((id) => ({
                id,
                quantity: Number(quantities[id]) || 0,
            }))
            .filter((item) => item.quantity > 0);

        if (items.length === 0) {
            setTransferError(
                'Please enter a quantity greater than zero for at least one item.',
            );
            setTransferFieldErrors(
                Object.fromEntries(
                    selected.map((id) => [
                        String(id),
                        'Enter a quantity greater than zero.',
                    ]),
                ),
            );
            setTransferProcessing(false);
            return;
        }

        router.post(
            stockRoutes.transfer.url(teamSlug),
            {
                location,
                receiver: Number(receiver),
                items,
            },
            {
                preserveScroll: true,
                onSuccess: () => setTransferOpen(false),
                onError: (errors: Record<string, string>) => {
                    setTransferFieldErrors(errors);
                    setTransferError(
                        Object.values(errors)[0] ?? 'Unable to transfer stock.',
                    );
                },
                onFinish: () => setTransferProcessing(false),
            },
        );
    }

    function deleteOne() {
        if (!deleting || deleteProcessing) return;
        setDeleteProcessing(true);
        setDeleteError(null);
        router.delete(
            stockRoutes.destroy.url({
                current_team: teamSlug,
                inventory: deleting.id,
            }),
            {
                preserveScroll: true,
                onSuccess: () => setDeleting(null),
                onError: (errors: Record<string, string>) =>
                    setDeleteError(
                        Object.values(errors)[0] ??
                            'Unable to delete inventory item.',
                    ),
                onFinish: () => setDeleteProcessing(false),
            },
        );
    }

    function deleteSelected() {
        if (bulkDeleteProcessing) return;
        setBulkDeleteProcessing(true);
        setBulkDeleteError(null);
        router.delete(stockRoutes.bulk.destroy.url(teamSlug), {
            data: { ids: selected },
            preserveScroll: true,
            onSuccess: () => {
                setSelected([]);
                setBulkDeleteOpen(false);
            },
            onError: (errors: Record<string, string>) =>
                setBulkDeleteError(
                    Object.values(errors)[0] ??
                        'Unable to delete inventory items.',
                ),
            onFinish: () => setBulkDeleteProcessing(false),
        });
    }

    const selectedItems = inventories.data.filter((item) =>
        selected.includes(item.id),
    );

    function getStatusBadgeClass(status: string) {
        const classes: Record<string, string> = {
            low: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
            expiring:
                'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
            expired:
                'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
            stocked:
                'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300',
            available:
                'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300',
        };
        return classes[status] ?? 'bg-muted text-muted-foreground';
    }

    function handleImportFileChange(
        event: React.ChangeEvent<HTMLInputElement>,
    ) {
        const file = event.target.files?.[0];
        if (!file) {
            return;
        }

        setImportError(null);
        const reader = new FileReader();
        reader.onload = (e) => {
            const text = e.target?.result;
            if (typeof text !== 'string') {
                return;
            }
            const lines = text.split(/\r?\n/).filter((line) => line.trim());
            if (lines.length === 0) {
                setImportError('The CSV file is empty.');
                return;
            }
            const headers = lines[0]
                .split(',')
                .map((h) => h.trim().replace(/^"|"$/g, ''));
            setImportHeaders(headers);

            // Auto-map headers
            const autoMapping: ColumnMapping = { ...EMPTY_MAPPING };
            const aliases: Record<string, string> = {
                sku: 'sku',
                item_code: 'sku',
                'item code': 'sku',
                code: 'sku',
                product: 'name',
                name: 'name',
                description: 'name',
                item: 'name',
                'product form': 'drug_form',
                form: 'drug_form',
                drug_form: 'drug_form',
                'minimum quantity': 'min_qty',
                min_qty: 'min_qty',
                'min quantity': 'min_qty',
                minimum: 'min_qty',
                quantity: 'quantity',
                qty: 'quantity',
                stock: 'quantity',
                price: 'price',
                'selling price': 'price',
                'sell price': 'price',
                cost: 'cost',
                'cost price': 'cost',
                'buy price': 'cost',
                'unit cost': 'cost',
                status: 'status',
                expires_at: 'expires_at',
                expiry: 'expires_at',
                expiry_date: 'expires_at',
                expiration: 'expires_at',
                expiration_date: 'expires_at',
            };
            for (const header of headers) {
                const lower = header.toLowerCase();
                const mapped = aliases[lower];
                if (mapped && !autoMapping[mapped as keyof ColumnMapping]) {
                    autoMapping[mapped as keyof ColumnMapping] = header;
                }
            }
            setImportMapping(autoMapping);
        };
        reader.readAsText(file);
    }

    function submitImport() {
        const file = importFileInput.current?.files?.[0];
        if (!file) {
            setImportError('Please select a CSV file.');
            return;
        }

        // Validate required mappings
        const required = ['name', 'drug_form', 'quantity', 'price', 'cost'];
        const missing = required.filter(
            (field) => !importMapping[field as keyof ColumnMapping],
        );
        if (missing.length > 0) {
            setImportError(
                'Please map all required fields: ' + missing.join(', '),
            );
            return;
        }

        setImportError(null);
        setImportProcessing(true);

        const payload = new FormData();
        payload.append('file', file);
        payload.append('target', importTarget);
        payload.append('mapping', JSON.stringify(importMapping));

        router.post(stockRoutes.import.url(teamSlug), payload, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                setImportOpen(false);
                setImportHeaders([]);
                setImportMapping(EMPTY_MAPPING);
                if (importFileInput.current) {
                    importFileInput.current.value = '';
                }
            },
            onError: (errors) =>
                setImportError(
                    errors.file ?? errors.mapping ?? 'Import failed.',
                ),
            onFinish: () => setImportProcessing(false),
        });
    }

    function resetImport() {
        setImportHeaders([]);
        setImportMapping(EMPTY_MAPPING);
        setImportError(null);
        if (importFileInput.current) {
            importFileInput.current.value = '';
        }
    }

    return (
        <>
            <Head title="Inventory" />
            <div className="flex w-full flex-col space-y-6 p-4 md:p-6 lg:p-8">
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <Heading
                        title="Inventory"
                        description="Track stock levels, expiry, value, and stock movement."
                    />
                    <div className="flex gap-2">
                        <Button variant="outline" asChild>
                            <Link href={stockRoutes.export.url(teamSlug)}>
                                Export CSV
                            </Link>
                        </Button>
                        <Button variant="outline" asChild>
                            <Link
                                href={stockRoutes.exportStockTaking.url(
                                    teamSlug,
                                )}
                            >
                                Export stock taking
                            </Link>
                        </Button>
                        <Button variant="outline" asChild>
                            <Link href={stockRoutes.print.url(teamSlug)}>
                                <Printer className="mr-2 size-4" />
                                Print stock taking
                            </Link>
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => setImportOpen(true)}
                        >
                            <Upload className="mr-2 size-4" />
                            Import CSV
                        </Button>
                        {can.canStockCount('inventory') &&
                            selected.length > 0 && (
                                <Button
                                    variant="outline"
                                    onClick={() =>
                                        openOperation('adjust', selected, true)
                                    }
                                >
                                    <ClipboardCheck className="mr-2 size-4" />
                                    Stock Count ({selected.length})
                                </Button>
                            )}
                        <Button onClick={openCreate}>Add inventory item</Button>
                    </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {[
                        {
                            label: 'Total products',
                            value: summary.products,
                            icon: PackageSearch,
                            detail: 'Inventory records',
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
                        className="flex flex-1 flex-wrap items-center gap-2"
                        onSubmit={(event) => {
                            event.preventDefault();
                            applyFilters();
                        }}
                    >
                        <Label htmlFor="inventory-search" className="sr-only">
                            Search inventory
                        </Label>
                        <Input
                            id="inventory-search"
                            className="max-w-sm"
                            value={query}
                            onChange={(event) => setQuery(event.target.value)}
                            placeholder="Search product, form, or SKU..."
                        />
                        <SelectNative
                            aria-label="Filter inventory status"
                            value={status}
                            onChange={(event) => setStatus(event.target.value)}
                        >
                            <option value="all">All statuses</option>
                            <option value="low">Low</option>
                            <option value="stocked">Stocked</option>
                            <option value="available">Available</option>
                            <option value="expired">Expired</option>
                            <option value="expiring">Expiring soon</option>
                        </SelectNative>
                        <SelectNative
                            aria-label="Filter by category"
                            value={categoryId}
                            onChange={(event) =>
                                setCategoryId(event.target.value)
                            }
                        >
                            <option value="">All categories</option>
                            {formOptions.categories.map((category) => (
                                <option key={category.id} value={category.id}>
                                    {category.name}
                                </option>
                            ))}
                        </SelectNative>
                        <SelectNative
                            aria-label="Filter by subcategory"
                            value={subcategoryId}
                            onChange={(event) =>
                                setSubcategoryId(event.target.value)
                            }
                        >
                            <option value="">All subcategories</option>
                            {formOptions.subcategories.map((subcategory) => (
                                <option
                                    key={subcategory.id}
                                    value={subcategory.id}
                                >
                                    {subcategory.name}
                                </option>
                            ))}
                        </SelectNative>
                        <Button type="submit">Filter</Button>
                    </form>
                    {selected.length > 0 ? (
                        <>
                            <span className="text-sm text-muted-foreground">
                                {selected.length} selected
                            </span>
                            {can.canStockCount('inventory') && (
                                <Button
                                    size="sm"
                                    variant="secondary"
                                    onClick={() =>
                                        openOperation('adjust', selected, true)
                                    }
                                >
                                    Stock count
                                </Button>
                            )}
                            <Button
                                size="sm"
                                variant="secondary"
                                onClick={() =>
                                    openOperation('adjust', selected)
                                }
                            >
                                Adjust stock
                            </Button>
                            <Button
                                size="sm"
                                variant="secondary"
                                onClick={() =>
                                    openOperation('transfer', selected)
                                }
                            >
                                Transfer stock
                            </Button>
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
                                            aria-label="Select all inventory items"
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
                                    <TableHead>SKU</TableHead>
                                    <TableHead
                                        aria-sort={
                                            filters.sort === 'category_asc'
                                                ? 'ascending'
                                                : filters.sort ===
                                                    'category_desc'
                                                  ? 'descending'
                                                  : 'none'
                                        }
                                    >
                                        <button
                                            type="button"
                                            className="inline-flex items-center hover:underline"
                                            onClick={() => {
                                                const nextSort =
                                                    filters.sort ===
                                                    'category_asc'
                                                        ? 'category_desc'
                                                        : 'category_asc';
                                                applyFilters(
                                                    1,
                                                    filters.perPage,
                                                    nextSort,
                                                );
                                            }}
                                        >
                                            Category{' '}
                                            {filters.sort === 'category_asc'
                                                ? '↑'
                                                : filters.sort ===
                                                    'category_desc'
                                                  ? '↓'
                                                  : ''}
                                        </button>
                                    </TableHead>
                                    <TableHead>Product</TableHead>
                                    <TableHead>Form</TableHead>
                                    <TableHead>Minimum</TableHead>
                                    <TableHead
                                        aria-sort={
                                            filters.sort === 'quantity_asc'
                                                ? 'ascending'
                                                : filters.sort ===
                                                    'quantity_desc'
                                                  ? 'descending'
                                                  : 'none'
                                        }
                                    >
                                        <button
                                            type="button"
                                            className="inline-flex items-center hover:underline"
                                            onClick={() => {
                                                const nextSort =
                                                    filters.sort ===
                                                    'quantity_asc'
                                                        ? 'quantity_desc'
                                                        : 'quantity_asc';
                                                applyFilters(
                                                    1,
                                                    filters.perPage,
                                                    nextSort,
                                                );
                                            }}
                                        >
                                            Quantity{' '}
                                            {filters.sort === 'quantity_asc'
                                                ? '↑'
                                                : filters.sort ===
                                                    'quantity_desc'
                                                  ? '↓'
                                                  : ''}
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
                                            className="py-10 text-center text-muted-foreground"
                                        >
                                            No inventory items found.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    inventories.data.map((item) => (
                                        <TableRow key={item.id}>
                                            <TableCell>
                                                <input
                                                    type="checkbox"
                                                    aria-label={`Select ${item.name}`}
                                                    checked={selected.includes(
                                                        item.id,
                                                    )}
                                                    onChange={(event) =>
                                                        setSelected(
                                                            event.target.checked
                                                                ? [
                                                                      ...selected,
                                                                      item.id,
                                                                  ]
                                                                : selected.filter(
                                                                      (id) =>
                                                                          id !==
                                                                          item.id,
                                                                  ),
                                                        )
                                                    }
                                                />
                                            </TableCell>
                                            <TableCell>{item.sku}</TableCell>
                                            <TableCell className="break-words whitespace-normal">
                                                {item.subCategory ?? '—'}
                                            </TableCell>
                                            <TableCell className="font-medium">
                                                {item.name}
                                            </TableCell>
                                            <TableCell>
                                                {item.drugForm ?? '—'}
                                            </TableCell>
                                            <TableCell>{item.minQty}</TableCell>
                                            <TableCell
                                                className={
                                                    item.quantity <= item.minQty
                                                        ? 'font-semibold text-destructive'
                                                        : ''
                                                }
                                            >
                                                {item.quantity.toLocaleString()}
                                            </TableCell>
                                            <TableCell>
                                                {currencySymbol}
                                                {item.cost.toLocaleString()}
                                            </TableCell>
                                            <TableCell>
                                                {currencySymbol}
                                                {item.value.toLocaleString()}
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant="secondary"
                                                    className={`capitalize ${getStatusBadgeClass(item.status)}`}
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
                                                            aria-label={`Actions for ${item.name}`}
                                                        >
                                                            <MoreHorizontal className="size-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem
                                                            asChild
                                                        >
                                                            <Link
                                                                href={stockRoutes.show.url(
                                                                    {
                                                                        current_team:
                                                                            teamSlug,
                                                                        inventory:
                                                                            item.id,
                                                                    },
                                                                )}
                                                            >
                                                                <Eye className="mr-2 h-4 w-4" />
                                                                View
                                                            </Link>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            onClick={() =>
                                                                openEdit(item)
                                                            }
                                                        >
                                                            <Pencil className="mr-2 h-4 w-4" />
                                                            Edit
                                                        </DropdownMenuItem>
                                                        {can.canStockCount(
                                                            'inventory',
                                                        ) && (
                                                            <DropdownMenuItem
                                                                onClick={() =>
                                                                    openOperation(
                                                                        'adjust',
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
                                                                openOperation(
                                                                    'adjust',
                                                                    [item.id],
                                                                )
                                                            }
                                                        >
                                                            <TrendingUp className="mr-2 h-4 w-4" />
                                                            Adjust
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            onClick={() =>
                                                                openOperation(
                                                                    'transfer',
                                                                    [item.id],
                                                                )
                                                            }
                                                        >
                                                            <ArrowRightLeft className="mr-2 h-4 w-4" />
                                                            Transfer
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem
                                                            variant="destructive"
                                                            onClick={() => {
                                                                setDeleteError(
                                                                    null,
                                                                );
                                                                setDeleting(
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
                    </CardContent>
                </Card>
                <Pagination
                    meta={{
                        currentPage: inventories.current_page,
                        lastPage: inventories.last_page,
                        perPage: inventories.per_page,
                        total: inventories.total,
                    }}
                    onPageChange={(page) => applyFilters(page)}
                    onPerPageChange={(perPage) => applyFilters(1, perPage)}
                />
            </div>

            <Sheet open={formOpen} onOpenChange={setFormOpen}>
                <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
                    <SheetHeader>
                        <SheetTitle>
                            {editing
                                ? 'Edit inventory item'
                                : 'Add inventory item'}
                        </SheetTitle>
                        <SheetDescription>
                            Product details and stock thresholds.
                        </SheetDescription>
                    </SheetHeader>
                    <div className="grid gap-4 px-4 py-5 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="inventory-product">Product</Label>
                            <SelectNative
                                id="inventory-product"
                                aria-invalid={!!formFieldErrors.price_list_id}
                                value={form.price_list_id}
                                onChange={(event) =>
                                    setForm({
                                        ...form,
                                        price_list_id: event.target.value,
                                    })
                                }
                            >
                                <option value="">Select a product</option>
                                {formOptions.priceLists.map((option) => (
                                    <option key={option.id} value={option.id}>
                                        {option.name}
                                    </option>
                                ))}
                            </SelectNative>
                            <InputError
                                message={formFieldErrors.price_list_id}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="inventory-product-form">
                                Product form
                            </Label>
                            <SelectNative
                                id="inventory-product-form"
                                aria-invalid={!!formFieldErrors.drug_form_id}
                                value={form.drug_form_id}
                                onChange={(event) =>
                                    setForm({
                                        ...form,
                                        drug_form_id: event.target.value,
                                    })
                                }
                            >
                                <option value="">Select a form</option>
                                {formOptions.drugForms.map((option) => (
                                    <option key={option.id} value={option.id}>
                                        {option.name}
                                    </option>
                                ))}
                            </SelectNative>
                            <InputError
                                message={formFieldErrors.drug_form_id}
                            />
                        </div>
                        {(
                            [
                                'sku',
                                'min_qty',
                                'quantity',
                                'price',
                                'cost',
                                'expires_at',
                            ] as const
                        ).map((field) => (
                            <div key={field} className="space-y-2">
                                <Label htmlFor={`inventory-${field}`}>
                                    {field === 'min_qty'
                                        ? 'Minimum quantity'
                                        : field
                                              .replace('_', ' ')
                                              .replace(/\b\w/g, (letter) =>
                                                  letter.toUpperCase(),
                                              )}
                                </Label>
                                <Input
                                    id={`inventory-${field}`}
                                    aria-invalid={!!formFieldErrors[field]}
                                    type={
                                        field === 'expires_at'
                                            ? 'date'
                                            : field === 'sku'
                                              ? 'text'
                                              : 'number'
                                    }
                                    min={
                                        field === 'min_qty' ||
                                        field === 'quantity' ||
                                        field === 'price' ||
                                        field === 'cost'
                                            ? 0
                                            : undefined
                                    }
                                    step={
                                        field === 'quantity' ||
                                        field === 'price' ||
                                        field === 'cost'
                                            ? 'any'
                                            : undefined
                                    }
                                    value={form[field]}
                                    onChange={(event) =>
                                        setForm({
                                            ...form,
                                            [field]: event.target.value,
                                        })
                                    }
                                />
                                <InputError message={formFieldErrors[field]} />
                            </div>
                        ))}
                        {formError ? (
                            <div className="sm:col-span-2">
                                <AlertError
                                    errors={[formError]}
                                    title="Unable to save inventory item"
                                />
                            </div>
                        ) : null}
                    </div>
                    <SheetFooter>
                        <Button
                            variant="outline"
                            disabled={formProcessing}
                            onClick={() => setFormOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button disabled={formProcessing} onClick={submitForm}>
                            {formProcessing ? 'Saving...' : 'Save item'}
                        </Button>
                    </SheetFooter>
                </SheetContent>
            </Sheet>

            <Sheet
                open={adjustOpen}
                onOpenChange={(open) => {
                    if (!open) {
                        setIsStockCount(false);
                    }
                    setAdjustOpen(open);
                }}
            >
                <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
                    <SheetHeader>
                        <SheetTitle>
                            {isStockCount ? 'Stock count' : 'Stock adjustment'}
                        </SheetTitle>
                        <SheetDescription>
                            {isStockCount
                                ? 'Set the exact quantity found during physical stock count.'
                                : 'Adjust quantity and record the reason for each stock movement.'}
                        </SheetDescription>
                    </SheetHeader>
                    <div className="space-y-4 px-4 py-5">
                        {isStockCount ? (
                            <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-300">
                                <p className="font-medium">Stock count mode</p>
                                <p className="text-xs">
                                    Enter the exact quantity found for each
                                    item. The reason is set to "Stock count
                                    correction".
                                </p>
                            </div>
                        ) : (
                            <div className="grid gap-3 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="stock-adjustment">
                                        Adjustment
                                    </Label>
                                    <SelectNative
                                        id="stock-adjustment"
                                        value={operation}
                                        onChange={(event) =>
                                            setOperation(
                                                event.target.value as
                                                    | 'add'
                                                    | 'remove'
                                                    | 'set',
                                            )
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
                                    <Label htmlFor="stock-reason">Reason</Label>
                                    <SelectNative
                                        id="stock-reason"
                                        value={reason}
                                        onChange={(event) =>
                                            setReason(event.target.value)
                                        }
                                    >
                                        <option value="damaged">
                                            Damaged / expired
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
                            </div>
                        )}
                        {selectedItems.length > 0 ? (
                            selectedItems.map((item) => (
                                <div
                                    key={item.id}
                                    className="grid grid-cols-[1fr_120px] items-center gap-3"
                                >
                                    <Label
                                        htmlFor={`adjust-quantity-${item.id}`}
                                    >
                                        {item.name} ({item.quantity} current)
                                    </Label>
                                    <Input
                                        id={`adjust-quantity-${item.id}`}
                                        type="number"
                                        min="0"
                                        step="any"
                                        aria-invalid={
                                            !!adjustmentFieldErrors[
                                                String(item.id)
                                            ]
                                        }
                                        value={quantities[item.id] ?? ''}
                                        onChange={(event) =>
                                            setQuantities({
                                                ...quantities,
                                                [item.id]: event.target.value,
                                            })
                                        }
                                        placeholder={
                                            isStockCount
                                                ? `Current: ${item.quantity}`
                                                : 'Quantity'
                                        }
                                    />
                                    <InputError
                                        className="col-span-2"
                                        message={
                                            adjustmentFieldErrors[
                                                String(item.id)
                                            ]
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
                        {adjustmentError ? (
                            <AlertError
                                errors={[adjustmentError]}
                                title={
                                    isStockCount
                                        ? 'Unable to save stock count'
                                        : 'Unable to adjust stock'
                                }
                            />
                        ) : null}
                    </div>
                    <SheetFooter>
                        <Button
                            variant="outline"
                            disabled={adjustmentProcessing}
                            onClick={() => setAdjustOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            disabled={adjustmentProcessing}
                            onClick={submitAdjustment}
                        >
                            {adjustmentProcessing
                                ? 'Saving...'
                                : isStockCount
                                  ? 'Save stock count'
                                  : 'Apply adjustment'}
                        </Button>
                    </SheetFooter>
                </SheetContent>
            </Sheet>

            <Sheet open={transferOpen} onOpenChange={setTransferOpen}>
                <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
                    <SheetHeader>
                        <SheetTitle>Stock transfer</SheetTitle>
                        <SheetDescription>
                            Transfer available stock into Lab or Pharmacy
                            inventory.
                        </SheetDescription>
                    </SheetHeader>
                    <div className="space-y-4 px-4 py-5">
                        <div className="grid gap-3 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="transfer-location">
                                    Transfer to
                                </Label>
                                <SelectNative
                                    id="transfer-location"
                                    value={location}
                                    onChange={(event) =>
                                        setLocation(
                                            event.target.value as
                                                | 'lab'
                                                | 'pharmacy',
                                        )
                                    }
                                >
                                    <option value="lab">Lab inventory</option>
                                    <option value="pharmacy">
                                        Pharmacy inventory
                                    </option>
                                </SelectNative>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="transfer-receiver">
                                    Received by
                                </Label>
                                <SelectNative
                                    id="transfer-receiver"
                                    aria-invalid={
                                        !!transferFieldErrors.receiver
                                    }
                                    value={receiver}
                                    onChange={(event) =>
                                        setReceiver(event.target.value)
                                    }
                                >
                                    <option value="">
                                        Select a team member
                                    </option>
                                    {formOptions.users.map((user) => (
                                        <option key={user.id} value={user.id}>
                                            {user.name}
                                        </option>
                                    ))}
                                </SelectNative>
                                <InputError
                                    message={transferFieldErrors.receiver}
                                />
                            </div>
                        </div>
                        {selectedItems.map((item) => (
                            <div
                                key={item.id}
                                className="grid grid-cols-[1fr_120px] items-center gap-3"
                            >
                                <Label htmlFor={`transfer-quantity-${item.id}`}>
                                    {item.name} ({item.quantity} available)
                                </Label>
                                <Input
                                    id={`transfer-quantity-${item.id}`}
                                    type="number"
                                    min="0.01"
                                    max={item.quantity}
                                    step="any"
                                    aria-invalid={
                                        !!transferFieldErrors[String(item.id)]
                                    }
                                    value={quantities[item.id] ?? ''}
                                    onChange={(event) =>
                                        setQuantities({
                                            ...quantities,
                                            [item.id]: event.target.value,
                                        })
                                    }
                                />
                                <InputError
                                    className="col-span-2"
                                    message={
                                        transferFieldErrors[String(item.id)]
                                    }
                                />
                            </div>
                        ))}
                        {transferError ? (
                            <AlertError
                                errors={[transferError]}
                                title="Unable to transfer stock"
                            />
                        ) : null}
                    </div>
                    <SheetFooter>
                        <Button
                            variant="outline"
                            disabled={transferProcessing}
                            onClick={() => setTransferOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            disabled={transferProcessing || receiver === ''}
                            onClick={submitTransfer}
                        >
                            {transferProcessing
                                ? 'Transferring...'
                                : 'Transfer stock'}
                        </Button>
                    </SheetFooter>
                </SheetContent>
            </Sheet>
            {deleteError ? (
                <div className="px-4 pb-4">
                    <AlertError
                        errors={[deleteError]}
                        title="Unable to delete inventory item"
                    />
                </div>
            ) : null}
            {bulkDeleteError ? (
                <div className="px-4 pb-4">
                    <AlertError
                        errors={[bulkDeleteError]}
                        title="Unable to delete inventory items"
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
                title="Delete inventory item?"
                description="Inventory records with movement history cannot be deleted. This cannot be undone."
                confirmLabel={deleteProcessing ? 'Deleting...' : 'Delete'}
                processing={deleteProcessing}
                destructive
                onConfirm={deleteOne}
            />
            <ConfirmDialog
                open={bulkDeleteOpen}
                onOpenChange={(open) => {
                    if (!open && !bulkDeleteProcessing) {
                        setBulkDeleteOpen(false);
                        setBulkDeleteError(null);
                    }
                }}
                title="Delete selected inventory items?"
                description="Items with stock movement history will be skipped. This cannot be undone."
                confirmLabel={
                    bulkDeleteProcessing ? 'Deleting...' : 'Delete selected'
                }
                processing={bulkDeleteProcessing}
                destructive
                onConfirm={deleteSelected}
            />

            {/* Import CSV Sheet */}
            <Sheet
                open={importOpen}
                onOpenChange={(open) => {
                    if (!open) {
                        resetImport();
                    }
                    setImportOpen(open);
                }}
            >
                <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
                    <SheetHeader>
                        <SheetTitle>Import inventory from CSV</SheetTitle>
                        <SheetDescription>
                            Upload a CSV file and map its columns to inventory
                            fields. Choose whether to import into stock, lab, or
                            drug inventory.
                        </SheetDescription>
                    </SheetHeader>
                    <div className="space-y-4 px-4 py-5">
                        {/* Target selection */}
                        <div className="space-y-2">
                            <Label htmlFor="import-target">Import into</Label>
                            <SelectNative
                                id="import-target"
                                value={importTarget}
                                onChange={(event) =>
                                    setImportTarget(
                                        event.target.value as InventoryTarget,
                                    )
                                }
                            >
                                <option value="stock">
                                    {TARGET_LABELS.stock}
                                </option>
                                <option value="lab">{TARGET_LABELS.lab}</option>
                                <option value="drug">
                                    {TARGET_LABELS.drug}
                                </option>
                            </SelectNative>
                        </div>

                        {/* File upload */}
                        <div className="space-y-2">
                            <Label htmlFor="import-csv-file">CSV file</Label>
                            <div className="flex gap-2">
                                <Input
                                    id="import-csv-file"
                                    type="file"
                                    accept=".csv,.txt"
                                    className="flex-1"
                                    onChange={handleImportFileChange}
                                />
                            </div>
                        </div>

                        {/* Column mapping */}
                        {importHeaders.length > 0 && (
                            <div className="space-y-3">
                                <Label className="text-sm font-medium">
                                    Column mapping
                                </Label>
                                <p className="text-xs text-muted-foreground">
                                    Map each CSV column header to the
                                    corresponding inventory field. Required
                                    fields are marked with *.
                                </p>
                                {MAPPABLE_FIELDS.map(({ key, label }) => {
                                    const isRequired = [
                                        'name',
                                        'drug_form',
                                        'quantity',
                                        'price',
                                        'cost',
                                    ].includes(key);
                                    return (
                                        <div
                                            key={key}
                                            className="grid grid-cols-[1fr_auto] items-center gap-3"
                                        >
                                            <Label
                                                htmlFor={`import-mapping-${key}`}
                                                className="text-sm"
                                            >
                                                {label}
                                                {isRequired ? ' *' : ''}
                                            </Label>
                                            <SelectNative
                                                id={`import-mapping-${key}`}
                                                value={importMapping[key]}
                                                onChange={(event) =>
                                                    setImportMapping({
                                                        ...importMapping,
                                                        [key]: event.target
                                                            .value,
                                                    })
                                                }
                                                className="w-full"
                                            >
                                                <option value="">
                                                    — Skip —
                                                </option>
                                                {importHeaders.map((header) => (
                                                    <option
                                                        key={header}
                                                        value={header}
                                                    >
                                                        {header}
                                                    </option>
                                                ))}
                                            </SelectNative>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {importError ? (
                            <AlertError
                                errors={[importError]}
                                title="Unable to import inventory"
                            />
                        ) : null}
                    </div>
                    <SheetFooter>
                        <Button
                            variant="outline"
                            onClick={() => {
                                resetImport();
                                setImportOpen(false);
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            disabled={
                                importProcessing || importHeaders.length === 0
                            }
                            onClick={submitImport}
                        >
                            {importProcessing ? 'Importing...' : 'Import'}
                        </Button>
                    </SheetFooter>
                </SheetContent>
            </Sheet>
        </>
    );
}
