import { Head, router, usePage } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import { useMemo, useState } from 'react';
import AlertError from '@/components/alert-error';
import { Breadcrumbs } from '@/components/breadcrumbs';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
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
import { Textarea } from '@/components/ui/textarea';
import {
    index as labIntakeIndex,
    create as labIntakeCreate,
    edit as labIntakeEdit,
    store as labIntakeStore,
    update as labIntakeUpdate,
} from '@/routes/lab-intake';
import {
    create as priceListCreate,
    edit as priceListEdit,
    index as priceListIndex,
    store as priceListStore,
    update as priceListUpdate,
} from '@/routes/price-lists';
import type { LabIntakeListItem, Team } from '@/types';

type LayoutProps = {
    currentTeam?: Team | null;
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
    parameter_id: string;
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

function generateRandomSku(): string {
    return String(Math.floor(10000 + Math.random() * 90000));
}

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
    parameter_id: '',
    uom: '',
    description: '',
    parameters: [],
    inventory_sku: generateRandomSku(),
    inventory_min_qty: '5',
    inventory_drug_form_id: '',
    inventory_expires_at: '',
};

function optionsToText(
    options: { label: string }[] | string[] | null | undefined,
): string {
    if (!options || !Array.isArray(options)) {
        return '';
    }

    return options
        .map((option) => (typeof option === 'string' ? option : option?.label))
        .filter(Boolean)
        .join('\n');
}

export default function LabIntakeEdit({
    item,
    formOptions,
    isPriceList = false,
}: {
    item: LabIntakeListItem | null;
    formOptions: {
        categories: { id: number; name: string }[];
        subcategories: { id: number; name: string; categoryId: number }[];
        parentTests: { id: number; name: string }[];
        drugForms: { id: number; name: string }[];
        resultTypes: { value: string; label: string }[];
    };
    isPriceList?: boolean;
}) {
    const { currentTeam } = usePage<LayoutProps>().props;
    const teamSlug = currentTeam?.slug ?? '';
    const isEditing = item !== null;

    const initialForm = useMemo((): FormValues => {
        if (!item) {
            return EMPTY_FORM;
        }

        return {
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
            parameter_id: item.parameterId ? String(item.parameterId) : '',
            uom: item.uom ?? '',
            description: item.description ?? '',
            parameters: (item.parameters || []).map((parameter) => ({
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
        };
    }, [item]);

    const [form, setForm] = useState<FormValues>(initialForm);
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const filteredSubcategories = useMemo(
        () =>
            formOptions.subcategories.filter(
                (sc) =>
                    !form.category_id ||
                    String(sc.categoryId) === form.category_id,
            ),
        [form.category_id, formOptions.subcategories],
    );

    function indexUrl() {
        return isPriceList
            ? priceListIndex.url(teamSlug)
            : labIntakeIndex.url(teamSlug);
    }

    function formUrl() {
        if (isEditing && item) {
            return isPriceList
                ? priceListEdit.url({
                      current_team: teamSlug,
                      price_list: item.id,
                  })
                : labIntakeEdit.url({
                      current_team: teamSlug,
                      price_list: item.id,
                  });
        }

        return isPriceList
            ? priceListCreate.url(teamSlug)
            : labIntakeCreate.url(teamSlug);
    }

    function submit() {
        if (processing) {
            return;
        }

        setProcessing(true);
        setError(null);

        const payload = {
            name: form.name,
            is_category: form.is_category,
            is_inventory: form.is_inventory,
            ranges: form.ranges || null,
            price: Number(form.price || 0),
            result_type: form.result_type,
            options:
                form.result_type === 'select'
                    ? form.options
                          .split('\n')
                          .map((label) => label.trim())
                          .filter(Boolean)
                          .map((label) => ({ label }))
                    : [],
            category_id: form.category_id ? Number(form.category_id) : null,
            subcategory_id: form.subcategory_id
                ? Number(form.subcategory_id)
                : null,
            parameter_id: form.parameter_id ? Number(form.parameter_id) : null,
            uom: form.uom || null,
            description: form.description || null,
            parameters: form.parameters.map((parameter) => ({
                name: parameter.name,
                ranges: parameter.ranges || null,
                uom: parameter.uom || null,
                result_type: parameter.result_type,
                options:
                    parameter.result_type === 'select'
                        ? parameter.options
                              .split('\n')
                              .map((label) => label.trim())
                              .filter(Boolean)
                              .map((label) => ({ label }))
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

        const url = isEditing
            ? isPriceList
                ? priceListUpdate.url({
                      current_team: teamSlug,
                      price_list: item.id,
                  })
                : labIntakeUpdate.url({
                      current_team: teamSlug,
                      price_list: item.id,
                  })
            : isPriceList
              ? priceListStore.url(teamSlug)
              : labIntakeStore.url(teamSlug);

        const method = isEditing ? 'patch' : 'post';

        router[method](url, payload, {
            preserveScroll: true,
            onSuccess: () => router.visit(indexUrl()),
            onError: (errors) =>
                setError(Object.values(errors)[0] ?? 'Something went wrong.'),
            onFinish: () => setProcessing(false),
        });
    }

    const title = isEditing
        ? isPriceList
            ? 'Edit price list item'
            : 'Edit catalog item'
        : isPriceList
          ? 'Add price list item'
          : 'Add catalog item';

    const description = isEditing
        ? 'Update the details of this catalog item.'
        : 'Create a new product, item, or service for the laboratory catalog.';

    return (
        <>
            <Head title={title} />
            <div className="flex w-full flex-col space-y-6 p-4 md:p-6 lg:p-8">
                <div className="space-y-3">
                    <Breadcrumbs
                        breadcrumbs={[
                            {
                                title: isPriceList
                                    ? 'Price lists'
                                    : 'Lab intake',
                                href: indexUrl(),
                            },
                            {
                                title: isEditing ? 'Edit' : 'Add',
                                href: formUrl(),
                            },
                        ]}
                    />
                    <div className="flex items-center justify-between">
                        <Heading title={title} description={description} />
                        <Button
                            variant="outline"
                            onClick={() => router.visit(indexUrl())}
                        >
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back
                        </Button>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>
                            {isEditing ? 'Item details' : 'New item'}
                        </CardTitle>
                        <CardDescription>
                            {isPriceList
                                ? 'Configure the price list entry, including category, pricing, and inventory.'
                                : 'Configure the laboratory catalog entry, including category, pricing, and inventory.'}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
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
                                        <Label htmlFor="lab-intake-ranges">
                                            Ranges
                                        </Label>
                                        <Input
                                            id="lab-intake-ranges"
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
                                        <Label htmlFor="lab-intake-price">
                                            Price
                                        </Label>
                                        <Input
                                            id="lab-intake-price"
                                            type="number"
                                            min="0"
                                            step="0.01"
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
                                    <Label htmlFor="lab-intake-result-type">
                                        Result input type
                                    </Label>
                                    <SelectNative
                                        id="lab-intake-result-type"
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
                                        <Label htmlFor="lab-intake-options">
                                            Dropdown options (one per line)
                                        </Label>
                                        <Textarea
                                            id="lab-intake-options"
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
                                        <Label htmlFor="lab-intake-category">
                                            Category
                                        </Label>
                                        <SelectNative
                                            id="lab-intake-category"
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
                                                (cat) => (
                                                    <option
                                                        key={cat.id}
                                                        value={cat.id}
                                                    >
                                                        {cat.name}
                                                    </option>
                                                ),
                                            )}
                                        </SelectNative>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="lab-intake-subcategory">
                                            Subcategory
                                        </Label>
                                        <SelectNative
                                            id="lab-intake-subcategory"
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
                                            {filteredSubcategories.map((sc) => (
                                                <option
                                                    key={sc.id}
                                                    value={sc.id}
                                                >
                                                    {sc.name}
                                                </option>
                                            ))}
                                        </SelectNative>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="lab-intake-parent-test">
                                        Parent test (parameter of)
                                    </Label>
                                    <SelectNative
                                        id="lab-intake-parent-test"
                                        value={form.parameter_id}
                                        onChange={(event) =>
                                            setForm((current) => ({
                                                ...current,
                                                parameter_id:
                                                    event.target.value,
                                            }))
                                        }
                                    >
                                        <option value="">
                                            Not a parameter of any test
                                        </option>
                                        {formOptions.parentTests.map((test) => (
                                            <option
                                                key={test.id}
                                                value={test.id}
                                            >
                                                {test.name}
                                            </option>
                                        ))}
                                    </SelectNative>
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
                                            <Label htmlFor="lab-intake-sku">
                                                Reference
                                            </Label>
                                            <Input
                                                id="lab-intake-sku"
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
                                            <Label htmlFor="lab-intake-min-qty">
                                                Min qty
                                            </Label>
                                            <Input
                                                id="lab-intake-min-qty"
                                                type="number"
                                                min="0"
                                                step="1"
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
                                            <Label htmlFor="lab-intake-drug-form">
                                                Product form
                                            </Label>
                                            <SelectNative
                                                id="lab-intake-drug-form"
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
                                                    (df) => (
                                                        <option
                                                            key={df.id}
                                                            value={df.id}
                                                        >
                                                            {df.name}
                                                        </option>
                                                    ),
                                                )}
                                            </SelectNative>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="lab-intake-expires-at">
                                                Expires at
                                            </Label>
                                            <Input
                                                id="lab-intake-expires-at"
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
                                    <Label htmlFor="lab-intake-uom">UOM</Label>
                                    <Input
                                        id="lab-intake-uom"
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
                                    <Label htmlFor="lab-intake-description">
                                        Description
                                    </Label>
                                    <Textarea
                                        id="lab-intake-description"
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
                                    <Label>Parameters</Label>
                                    {form.parameters.length > 0 ? (
                                        <div className="overflow-x-auto rounded-lg border">
                                            <table className="w-full text-sm">
                                                <thead className="bg-muted/50">
                                                    <tr>
                                                        <th className="px-3 py-2 text-left font-medium">
                                                            #
                                                        </th>
                                                        <th className="px-3 py-2 text-left font-medium">
                                                            Name
                                                        </th>
                                                        <th className="px-3 py-2 text-left font-medium">
                                                            Ranges
                                                        </th>
                                                        <th className="px-3 py-2 text-left font-medium">
                                                            UOM
                                                        </th>
                                                        <th className="px-3 py-2 text-left font-medium">
                                                            Result Type
                                                        </th>
                                                        <th className="w-20 px-3 py-2 text-left font-medium">
                                                            Actions
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y">
                                                    {form.parameters.map(
                                                        (parameter, index) => (
                                                            <tr key={index}>
                                                                <td className="px-3 py-2">
                                                                    {index + 1}
                                                                </td>
                                                                <td className="px-3 py-2">
                                                                    <Input
                                                                        aria-label={`Parameter ${index + 1} name`}
                                                                        placeholder="Parameter name"
                                                                        value={
                                                                            parameter.name
                                                                        }
                                                                        onChange={(
                                                                            event,
                                                                        ) =>
                                                                            setForm(
                                                                                (
                                                                                    current,
                                                                                ) => ({
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
                                                                                }),
                                                                            )
                                                                        }
                                                                    />
                                                                </td>
                                                                <td className="px-3 py-2">
                                                                    <Input
                                                                        aria-label={`Parameter ${index + 1} ranges`}
                                                                        placeholder="Ranges"
                                                                        value={
                                                                            parameter.ranges
                                                                        }
                                                                        onChange={(
                                                                            event,
                                                                        ) =>
                                                                            setForm(
                                                                                (
                                                                                    current,
                                                                                ) => ({
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
                                                                                }),
                                                                            )
                                                                        }
                                                                    />
                                                                </td>
                                                                <td className="px-3 py-2">
                                                                    <Input
                                                                        aria-label={`Parameter ${index + 1} UOM`}
                                                                        placeholder="UOM"
                                                                        value={
                                                                            parameter.uom
                                                                        }
                                                                        onChange={(
                                                                            event,
                                                                        ) =>
                                                                            setForm(
                                                                                (
                                                                                    current,
                                                                                ) => ({
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
                                                                                                          uom: event
                                                                                                              .target
                                                                                                              .value,
                                                                                                      }
                                                                                                    : row,
                                                                                        ),
                                                                                }),
                                                                            )
                                                                        }
                                                                    />
                                                                </td>
                                                                <td className="px-3 py-2">
                                                                    <SelectNative
                                                                        aria-label={`Parameter ${index + 1} result type`}
                                                                        value={
                                                                            parameter.result_type
                                                                        }
                                                                        onChange={(
                                                                            event,
                                                                        ) =>
                                                                            setForm(
                                                                                (
                                                                                    current,
                                                                                ) => ({
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
                                                                                }),
                                                                            )
                                                                        }
                                                                    >
                                                                        {formOptions.resultTypes.map(
                                                                            (
                                                                                type,
                                                                            ) => (
                                                                                <option
                                                                                    key={
                                                                                        type.value
                                                                                    }
                                                                                    value={
                                                                                        type.value
                                                                                    }
                                                                                >
                                                                                    {
                                                                                        type.label
                                                                                    }
                                                                                </option>
                                                                            ),
                                                                        )}
                                                                    </SelectNative>
                                                                </td>
                                                                <td className="px-3 py-2">
                                                                    <Button
                                                                        type="button"
                                                                        size="sm"
                                                                        variant="ghost"
                                                                        aria-label={`Remove parameter ${index + 1}`}
                                                                        onClick={() =>
                                                                            setForm(
                                                                                (
                                                                                    current,
                                                                                ) => ({
                                                                                    ...current,
                                                                                    parameters:
                                                                                        current.parameters.filter(
                                                                                            (
                                                                                                _,
                                                                                                i,
                                                                                            ) =>
                                                                                                i !==
                                                                                                index,
                                                                                        ),
                                                                                }),
                                                                            )
                                                                        }
                                                                    >
                                                                        Remove
                                                                    </Button>
                                                                </td>
                                                            </tr>
                                                        ),
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    ) : null}
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
                            </>
                        ) : null}

                        <AlertError errors={error ? [error] : []} />

                        <div className="flex items-center gap-2 pt-2">
                            <Button onClick={submit} disabled={processing}>
                                {processing ? 'Saving…' : 'Save'}
                            </Button>
                            <Button
                                variant="secondary"
                                onClick={() => router.visit(indexUrl())}
                            >
                                Cancel
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
