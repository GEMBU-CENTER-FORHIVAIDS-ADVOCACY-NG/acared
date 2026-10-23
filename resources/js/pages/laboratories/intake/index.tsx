import { Head, router, usePage } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import ConfirmDialog from '@/components/confirm-dialog';
import Heading from '@/components/heading';
import Pagination from '@/components/pagination';
import { Button } from '@/components/ui/button';
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
import { Textarea } from '@/components/ui/textarea';
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
        drugForms: { id: number; name: string }[];
        resultTypes: { value: string; label: string }[];
    };
    title?: string;
    description?: string;
    itemLabel?: string;
    routeBuilder?: (teamSlug: string, suffix?: string) => string;
};

type ParameterForm = {
    name: string;
    ranges: string;
    uom: string;
    result_type: string;
    options: string;
};

type FormValues = {
    name: string;
    is_category: boolean;
    is_inventory: boolean;
    ranges: string;
    price: string;
    result_type: string;
    options: string;
    category_id: string;
    subcategory_id: string;
    uom: string;
    description: string;
    parameters: ParameterForm[];
    inventory_sku: string;
    inventory_min_qty: string;
    inventory_drug_form_id: string;
    inventory_expires_at: string;
};

const EMPTY_PARAMETER: ParameterForm = {
    name: '',
    ranges: '',
    uom: '',
    result_type: 'text',
    options: '',
};

const EMPTY_FORM: FormValues = {
    name: '',
    is_category: false,
    is_inventory: false,
    ranges: '',
    price: '0',
    result_type: 'text',
    options: '',
    category_id: '',
    subcategory_id: '',
    uom: '',
    description: '',
    parameters: [],
    inventory_sku: '',
    inventory_min_qty: '5',
    inventory_drug_form_id: '',
    inventory_expires_at: '',
};

function optionsToText(
    options: { label: string }[] | string[] | null | undefined,
): string {
    if (!options) {
        return '';
    }

    return options
        .map((option) => (typeof option === 'string' ? option : option.label))
        .filter(Boolean)
        .join('\n');
}

export default function LabIntakeIndex({
    currencySymbol,
    items,
    filters,
    formOptions,
    title = 'Lab intake',
    description = 'Manage laboratory catalog tests, parameters, and inventory links.',
    itemLabel = 'catalog item',
    routeBuilder,
    padded = true,
}: LabIntakePageProps & { padded?: boolean }) {
    const { currentTeam } = usePage<LayoutProps>().props;
    const teamSlug = currentTeam?.slug ?? '';
    const [search, setSearch] = useState(filters.q);
    const [formOpen, setFormOpen] = useState(false);
    const [editing, setEditing] = useState<LabIntakeListItem | null>(null);
    const [viewing, setViewing] = useState<LabIntakeListItem | null>(null);
    const [form, setForm] = useState<FormValues>(EMPTY_FORM);
    const [toDelete, setToDelete] = useState<LabIntakeListItem | null>(null);
    const [processing, setProcessing] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);

    const filteredSubcategories = useMemo(
        () =>
            formOptions.subcategories.filter(
                (item) =>
                    !form.category_id ||
                    String(item.categoryId) === form.category_id,
            ),
        [form.category_id, formOptions.subcategories],
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

    function openEdit(item: LabIntakeListItem) {
        setEditing(item);
        setForm({
            name: item.name,
            is_category: item.isCategory,
            is_inventory: item.isInventory,
            ranges: item.ranges ?? '',
            price: String(item.price ?? 0),
            result_type: item.resultType ?? 'text',
            options: optionsToText(item.options),
            category_id: item.categoryId ? String(item.categoryId) : '',
            subcategory_id: item.subcategoryId
                ? String(item.subcategoryId)
                : '',
            uom: item.uom ?? '',
            description: item.description ?? '',
            parameters: item.parameters.map((parameter) => ({
                name: parameter.name,
                ranges: parameter.ranges ?? '',
                uom: parameter.uom ?? '',
                result_type: parameter.resultType ?? 'text',
                options: optionsToText(parameter.options),
            })),
            inventory_sku: item.inventory?.sku ?? '',
            inventory_min_qty: String(item.inventory?.minQty ?? 5),
            inventory_drug_form_id: item.inventory?.drugFormId
                ? String(item.inventory.drugFormId)
                : '',
            inventory_expires_at: item.inventory?.expiresAt
                ? item.inventory.expiresAt.slice(0, 16)
                : '',
        });
        setFormError(null);
        setFormOpen(true);
    }

    function parseOptions(text: string) {
        return text
            .split('\n')
            .map((label) => label.trim())
            .filter(Boolean)
            .map((label) => ({ label }));
    }

    function submitForm() {
        setProcessing(true);
        setFormError(null);

        const payload = {
            name: form.name,
            is_category: form.is_category,
            is_inventory: form.is_inventory,
            ranges: form.ranges || null,
            price: Number(form.price || 0),
            result_type: form.result_type,
            options:
                form.result_type === 'select' ? parseOptions(form.options) : [],
            category_id: form.category_id ? Number(form.category_id) : null,
            subcategory_id: form.subcategory_id
                ? Number(form.subcategory_id)
                : null,
            uom: form.uom || null,
            description: form.description || null,
            parameters: form.parameters.map((parameter) => ({
                name: parameter.name,
                ranges: parameter.ranges || null,
                uom: parameter.uom || null,
                result_type: parameter.result_type,
                options:
                    parameter.result_type === 'select'
                        ? parseOptions(parameter.options)
                        : [],
            })),
            inventory: form.is_inventory
                ? {
                      sku: form.inventory_sku || null,
                      min_qty: Number(form.inventory_min_qty || 0),
                      drug_form_id: form.inventory_drug_form_id
                          ? Number(form.inventory_drug_form_id)
                          : null,
                      expires_at: form.inventory_expires_at || null,
                  }
                : null,
        };

        const options = {
            preserveScroll: true,
            onSuccess: () => {
                setFormOpen(false);
                setEditing(null);
                setForm(EMPTY_FORM);
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

    return (
        <>
            <Head title={title} />

            <div
                className={`flex w-full flex-col space-y-6 ${padded ? 'p-4 md:p-6 lg:p-8' : ''}`}
            >
                <div className="flex flex-wrap items-center justify-between gap-2">
                    <Heading title={title} description={description} />
                    <Button onClick={openCreate}>Add {itemLabel}</Button>
                </div>

                <form
                    className="flex items-center gap-2"
                    onSubmit={(event) => {
                        event.preventDefault();
                        applyFilters({ q: search });
                    }}
                >
                    <Input
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder="Search catalog..."
                        className="w-72"
                    />
                    <Button type="submit" variant="secondary">
                        Search
                    </Button>
                </form>

                <div className="rounded-lg border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Category</TableHead>
                                <TableHead>Subcategory</TableHead>
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
                                            {item.categoryName ?? '—'}
                                        </TableCell>
                                        <TableCell>
                                            {item.subcategoryName ?? '—'}
                                        </TableCell>
                                        <TableCell>{item.name}</TableCell>
                                        <TableCell>
                                            {currencySymbol}{' '}
                                            {item.price.toLocaleString()}
                                        </TableCell>
                                        <TableCell>
                                            {item.isCategory ? 'Yes' : 'No'}
                                        </TableCell>
                                        <TableCell>
                                            {item.isInventory ? 'Yes' : 'No'}
                                        </TableCell>
                                        <TableCell className="space-x-2 text-right">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => setViewing(item)}
                                            >
                                                View
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="secondary"
                                                onClick={() => openEdit(item)}
                                            >
                                                Edit
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="destructive"
                                                onClick={() =>
                                                    setToDelete(item)
                                                }
                                            >
                                                Delete
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>

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

            <Sheet open={formOpen} onOpenChange={setFormOpen}>
                <SheetContent className="overflow-y-auto sm:max-w-xl">
                    <SheetHeader>
                        <SheetTitle>
                            {editing ? `Edit ${itemLabel}` : `Add ${itemLabel}`}
                        </SheetTitle>
                        <SheetDescription>
                            Product / item / service for the laboratory catalog.
                        </SheetDescription>
                    </SheetHeader>

                    <div className="mt-6 space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Name</Label>
                            <Input
                                id="name"
                                value={form.name}
                                onChange={(event) =>
                                    setForm((current) => ({
                                        ...current,
                                        name: event.target.value,
                                    }))
                                }
                            />
                        </div>

                        <label className="flex items-center gap-2 text-sm">
                            <input
                                type="checkbox"
                                checked={form.is_category}
                                onChange={(event) =>
                                    setForm((current) => ({
                                        ...current,
                                        is_category: event.target.checked,
                                    }))
                                }
                            />
                            Is category / grouping node
                        </label>

                        {!form.is_category ? (
                            <>
                                <div className="grid gap-3 sm:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label>Ranges</Label>
                                        <Input
                                            value={form.ranges}
                                            onChange={(event) =>
                                                setForm((current) => ({
                                                    ...current,
                                                    ranges: event.target.value,
                                                }))
                                            }
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Price</Label>
                                        <Input
                                            type="number"
                                            value={form.price}
                                            onChange={(event) =>
                                                setForm((current) => ({
                                                    ...current,
                                                    price: event.target.value,
                                                }))
                                            }
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label>Result input type</Label>
                                    <SelectNative
                                        value={form.result_type}
                                        onChange={(event) =>
                                            setForm((current) => ({
                                                ...current,
                                                result_type: event.target.value,
                                            }))
                                        }
                                    >
                                        {formOptions.resultTypes.map((type) => (
                                            <option
                                                key={type.value}
                                                value={type.value}
                                            >
                                                {type.label}
                                            </option>
                                        ))}
                                    </SelectNative>
                                </div>

                                {form.result_type === 'select' ? (
                                    <div className="space-y-2">
                                        <Label>
                                            Dropdown options (one per line)
                                        </Label>
                                        <Textarea
                                            value={form.options}
                                            onChange={(event) =>
                                                setForm((current) => ({
                                                    ...current,
                                                    options: event.target.value,
                                                }))
                                            }
                                        />
                                    </div>
                                ) : null}

                                <div className="grid gap-3 sm:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label>Category</Label>
                                        <SelectNative
                                            value={form.category_id}
                                            onChange={(event) =>
                                                setForm((current) => ({
                                                    ...current,
                                                    category_id:
                                                        event.target.value,
                                                    subcategory_id: '',
                                                }))
                                            }
                                        >
                                            <option value="">Select…</option>
                                            {formOptions.categories.map(
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
                                        <Label>Subcategory</Label>
                                        <SelectNative
                                            value={form.subcategory_id}
                                            onChange={(event) =>
                                                setForm((current) => ({
                                                    ...current,
                                                    subcategory_id:
                                                        event.target.value,
                                                }))
                                            }
                                        >
                                            <option value="">Select…</option>
                                            {filteredSubcategories.map(
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
                                </div>

                                <label className="flex items-center gap-2 text-sm">
                                    <input
                                        type="checkbox"
                                        checked={form.is_inventory}
                                        onChange={(event) =>
                                            setForm((current) => ({
                                                ...current,
                                                is_inventory:
                                                    event.target.checked,
                                            }))
                                        }
                                    />
                                    Track inventory
                                </label>

                                {form.is_inventory ? (
                                    <div className="grid gap-3 rounded-lg border p-3 sm:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label>Reference</Label>
                                            <Input
                                                value={form.inventory_sku}
                                                onChange={(event) =>
                                                    setForm((current) => ({
                                                        ...current,
                                                        inventory_sku:
                                                            event.target.value,
                                                    }))
                                                }
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Min qty</Label>
                                            <Input
                                                type="number"
                                                value={form.inventory_min_qty}
                                                onChange={(event) =>
                                                    setForm((current) => ({
                                                        ...current,
                                                        inventory_min_qty:
                                                            event.target.value,
                                                    }))
                                                }
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Product form</Label>
                                            <SelectNative
                                                value={
                                                    form.inventory_drug_form_id
                                                }
                                                onChange={(event) =>
                                                    setForm((current) => ({
                                                        ...current,
                                                        inventory_drug_form_id:
                                                            event.target.value,
                                                    }))
                                                }
                                            >
                                                <option value="">
                                                    Select…
                                                </option>
                                                {formOptions.drugForms.map(
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
                                            <Label>Expires at</Label>
                                            <Input
                                                type="datetime-local"
                                                value={
                                                    form.inventory_expires_at
                                                }
                                                onChange={(event) =>
                                                    setForm((current) => ({
                                                        ...current,
                                                        inventory_expires_at:
                                                            event.target.value,
                                                    }))
                                                }
                                            />
                                        </div>
                                    </div>
                                ) : null}

                                <div className="space-y-2">
                                    <Label>UOM</Label>
                                    <Input
                                        value={form.uom}
                                        onChange={(event) =>
                                            setForm((current) => ({
                                                ...current,
                                                uom: event.target.value,
                                            }))
                                        }
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Description</Label>
                                    <Textarea
                                        value={form.description}
                                        onChange={(event) =>
                                            setForm((current) => ({
                                                ...current,
                                                description: event.target.value,
                                            }))
                                        }
                                    />
                                </div>

                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <Label>Parameters</Label>
                                        <Button
                                            type="button"
                                            size="sm"
                                            variant="secondary"
                                            onClick={() =>
                                                setForm((current) => ({
                                                    ...current,
                                                    parameters: [
                                                        ...current.parameters,
                                                        { ...EMPTY_PARAMETER },
                                                    ],
                                                }))
                                            }
                                        >
                                            Add parameter
                                        </Button>
                                    </div>
                                    {form.parameters.map((parameter, index) => (
                                        <div
                                            key={index}
                                            className="space-y-2 rounded-lg border p-3"
                                        >
                                            <Input
                                                placeholder="Parameter name"
                                                value={parameter.name}
                                                onChange={(event) =>
                                                    setForm((current) => ({
                                                        ...current,
                                                        parameters:
                                                            current.parameters.map(
                                                                (
                                                                    row,
                                                                    rowIndex,
                                                                ) =>
                                                                    rowIndex ===
                                                                    index
                                                                        ? {
                                                                              ...row,
                                                                              name: event
                                                                                  .target
                                                                                  .value,
                                                                          }
                                                                        : row,
                                                            ),
                                                    }))
                                                }
                                            />
                                            <Input
                                                placeholder="Ranges"
                                                value={parameter.ranges}
                                                onChange={(event) =>
                                                    setForm((current) => ({
                                                        ...current,
                                                        parameters:
                                                            current.parameters.map(
                                                                (
                                                                    row,
                                                                    rowIndex,
                                                                ) =>
                                                                    rowIndex ===
                                                                    index
                                                                        ? {
                                                                              ...row,
                                                                              ranges: event
                                                                                  .target
                                                                                  .value,
                                                                          }
                                                                        : row,
                                                            ),
                                                    }))
                                                }
                                            />
                                            <SelectNative
                                                value={parameter.result_type}
                                                onChange={(event) =>
                                                    setForm((current) => ({
                                                        ...current,
                                                        parameters:
                                                            current.parameters.map(
                                                                (
                                                                    row,
                                                                    rowIndex,
                                                                ) =>
                                                                    rowIndex ===
                                                                    index
                                                                        ? {
                                                                              ...row,
                                                                              result_type:
                                                                                  event
                                                                                      .target
                                                                                      .value,
                                                                          }
                                                                        : row,
                                                            ),
                                                    }))
                                                }
                                            >
                                                {formOptions.resultTypes.map(
                                                    (type) => (
                                                        <option
                                                            key={type.value}
                                                            value={type.value}
                                                        >
                                                            {type.label}
                                                        </option>
                                                    ),
                                                )}
                                            </SelectNative>
                                        </div>
                                    ))}
                                </div>
                            </>
                        ) : null}

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
                            {viewing.parameters.length > 0 ? (
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

            <ConfirmDialog
                open={toDelete !== null}
                onOpenChange={(open) => {
                    if (!open) {
                        setToDelete(null);
                    }
                }}
                title="Delete catalog item?"
                description="This removes the laboratory catalog entry and its parameters."
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
