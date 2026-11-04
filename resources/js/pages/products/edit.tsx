import { Head, router, usePage } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import { useMemo, useState } from 'react';
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
    index as productIndex,
    store as productStore,
    update as productUpdate,
} from '@/routes/products';
import type { Team } from '@/types';

type LayoutProps = {
    currentTeam?: Team | null;
};

type ProductListItem = {
    id: number;
    name: string;
    categoryName: string | null;
    subcategoryName: string | null;
    isCategory: boolean;
    isInventory: boolean;
    price: number;
    uom: string | null;
    description: string | null;
    categoryId: number | null;
    subcategoryId: number | null;
    inventory: {
        sku: string;
        minQty: number;
        quantity: number;
        price: number;
        cost: number;
        drugFormId: number;
        expiresAt: string | null;
    } | null;
    createdAt: string | null;
    updatedAt: string | null;
};

type FormValues = {
    name: string;
    is_category: boolean;
    is_inventory: boolean;
    price: string;
    category_id: string;
    subcategory_id: string;
    uom: string;
    description: string;
    inventory_sku: string;
    inventory_min_qty: string;
    inventory_quantity: string;
    inventory_price: string;
    inventory_cost: string;
    inventory_drug_form_id: string;
    inventory_expires_at: string;
};

function generateRandomSku(): string {
    return String(Math.floor(10000 + Math.random() * 90000));
}

const EMPTY_FORM: FormValues = {
    name: '',
    is_category: false,
    is_inventory: false,
    price: '0',
    category_id: '',
    subcategory_id: '',
    uom: '',
    description: '',
    inventory_sku: generateRandomSku(),
    inventory_min_qty: '5',
    inventory_quantity: '0',
    inventory_price: '0',
    inventory_cost: '0',
    inventory_drug_form_id: '',
    inventory_expires_at: '',
};

export default function ProductEdit({
    item,
    formOptions,
}: {
    item: ProductListItem | null;
    formOptions: {
        categories: { id: number; name: string }[];
        subcategories: { id: number; name: string; categoryId: number }[];
        drugForms: { id: number; name: string }[];
    };
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
            price: String(item.price ?? 0),
            category_id: item.categoryId ? String(item.categoryId) : '',
            subcategory_id: item.subcategoryId ? String(item.subcategoryId) : '',
            uom: item.uom ?? '',
            description: item.description ?? '',
            inventory_sku: item.inventory?.sku ?? '',
            inventory_min_qty: String(item.inventory?.minQty ?? 5),
            inventory_quantity: String(item.inventory?.quantity ?? 0),
            inventory_price: String(item.inventory?.price ?? 0),
            inventory_cost: String(item.inventory?.cost ?? 0),
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
        return productIndex.url(teamSlug);
    }

    function submit() {
        setProcessing(true);
        setError(null);

        const payload = {
            name: form.name,
            is_category: form.is_category,
            is_inventory: form.is_inventory,
            price: Number(form.price || 0),
            category_id: form.category_id ? Number(form.category_id) : null,
            subcategory_id: form.subcategory_id
                ? Number(form.subcategory_id)
                : null,
            uom: form.uom || null,
            description: form.description || null,
            inventory: form.is_inventory
                ? {
                      sku: form.inventory_sku || null,
                      min_qty: Number(form.inventory_min_qty || 0),
                      quantity: Number(form.inventory_quantity || 0),
                      price: Number(form.inventory_price || 0),
                      cost: Number(form.inventory_cost || 0),
                      drug_form_id: form.inventory_drug_form_id
                          ? Number(form.inventory_drug_form_id)
                          : null,
                      expires_at: form.inventory_expires_at || null,
                  }
                : null,
        };

        const url = isEditing
            ? productUpdate.url({
                  current_team: teamSlug,
                  price_list: item.id,
              })
            : productStore.url(teamSlug);

        const method = isEditing ? 'patch' : 'post';

        router[method](url, payload, {
            preserveScroll: true,
            onSuccess: () => router.visit(indexUrl()),
            onError: (errors) =>
                setError(
                    Object.values(errors)[0] ?? 'Something went wrong.',
                ),
            onFinish: () => setProcessing(false),
        });
    }

    const title = isEditing
        ? 'Edit product'
        : 'Add product';

    const description = isEditing
        ? 'Update the details of this product.'
        : 'Create a new pharmacy product with pricing and inventory tracking.';

    return (
        <>
            <Head title={title} />
            <div className="flex w-full flex-col space-y-6 p-4 md:p-6 lg:p-8">
                <div className="space-y-3">
                    <Breadcrumbs
                        breadcrumbs={[
                            {
                                title: 'Products',
                                href: indexUrl(),
                            },
                            {
                                title: isEditing ? 'Edit' : 'Add',
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
                            {isEditing ? 'Product details' : 'New product'}
                        </CardTitle>
                        <CardDescription>
                            {isEditing
                                ? 'Update the product information, pricing, and inventory details.'
                                : 'Configure the pharmacy product, including category, pricing, and inventory.'}
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
                                        <Label>Price</Label>
                                        <Input
                                            type="number"
                                            value={form.price}
                                            onChange={(event) =>
                                                setForm((current) => ({
                                                    ...current,
                                                    price: event.target.value,
                                                    inventory_price: current.is_inventory
                                                        ? event.target.value
                                                        : current.inventory_price,
                                                }))
                                            }
                                        />
                                    </div>
                                </div>

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
                                                (sc) => (
                                                    <option
                                                        key={sc.id}
                                                        value={sc.id}
                                                    >
                                                        {sc.name}
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
                                            <Label>SKU</Label>
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
                                            <Label>Quantity</Label>
                                            <Input
                                                type="number"
                                                value={form.inventory_quantity}
                                                onChange={(event) =>
                                                    setForm((current) => ({
                                                        ...current,
                                                        inventory_quantity:
                                                            event.target.value,
                                                    }))
                                                }
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Cost</Label>
                                            <Input
                                                type="number"
                                                value={form.inventory_cost}
                                                onChange={(event) =>
                                                    setForm((current) => ({
                                                        ...current,
                                                        inventory_cost:
                                                            event.target.value,
                                                    }))
                                                }
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Price</Label>
                                            <Input
                                                type="number"
                                                value={form.inventory_price}
                                                onChange={(event) =>
                                                    setForm((current) => ({
                                                        ...current,
                                                        inventory_price:
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
                                            <Label>Expires at</Label>
                                            <Input
                                                type="datetime-local"
                                                value={form.inventory_expires_at}
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
                            </>
                        ) : null}

                        {error ? (
                            <p className="text-sm text-red-600">{error}</p>
                        ) : null}

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
