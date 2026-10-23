import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
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
import type { Team } from '@/types';
import {
    index as inventoriesIndex,
    show as showRoute,
    update as updateRoute,
} from '@/routes/pharmacy/inventories';

type Inventory = {
    id: number;
    sku: string;
    priceListId: number;
    drugFormId: number;
    minQty: number;
    quantity: number;
    price: number;
    cost: number;
    expiresAt: string | null;
};

export default function DrugInventoryEdit({
    inventory,
    formOptions,
}: {
    inventory: Inventory;
    formOptions: {
        priceLists: { id: number; name: string }[];
        drugForms: { id: number; name: string }[];
    };
}) {
    const { currentTeam } = usePage<{ currentTeam?: Team | null }>().props;
    const teamSlug = currentTeam?.slug ?? '';
    const [form, setForm] = useState({
        sku: inventory.sku,
        price_list_id: String(inventory.priceListId),
        drug_form_id: String(inventory.drugFormId),
        min_qty: String(inventory.minQty),
        quantity: String(inventory.quantity),
        price: String(inventory.price),
        cost: String(inventory.cost),
        expires_at: inventory.expiresAt ?? '',
    });
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    function submit() {
        setProcessing(true);
        setError(null);
        router.patch(
            updateRoute.url({
                current_team: teamSlug,
                drug_inventory: inventory.id,
            }),
            {
                ...form,
                price_list_id: Number(form.price_list_id),
                drug_form_id: Number(form.drug_form_id),
                min_qty: Number(form.min_qty),
                quantity: Number(form.quantity),
                price: Number(form.price),
                cost: Number(form.cost),
                expires_at: form.expires_at || null,
            },
            {
                preserveScroll: true,
                onSuccess: () =>
                    router.visit(
                        showRoute.url({
                            current_team: teamSlug,
                            drug_inventory: inventory.id,
                        }),
                    ),
                onError: (errors) =>
                    setError(
                        Object.values(errors)[0] ??
                            'Unable to save medication.',
                    ),
                onFinish: () => setProcessing(false),
            },
        );
    }

    return (
        <>
            <Head title="Edit medication stock" />
            <div className="flex w-full flex-col space-y-6 p-4 md:p-6 lg:p-8">
                <div className="space-y-3">
                    <Breadcrumbs
                        breadcrumbs={[
                            {
                                title: 'Pharmacy',
                                href: inventoriesIndex(teamSlug),
                            },
                            {
                                title: 'Medication inventory',
                                href: inventoriesIndex(teamSlug),
                            },
                            {
                                title: 'Edit',
                                href: showRoute.url({
                                    current_team: teamSlug,
                                    drug_inventory: inventory.id,
                                }),
                            },
                        ]}
                    />
                    <Heading
                        title="Edit medication stock"
                        description="Update pricing, thresholds, and expiry details."
                    />
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Stock record</CardTitle>
                        <CardDescription>
                            Hover over a linked medication catalog item to
                            change it.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-4">
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
                                    min={key === 'sku' ? undefined : '0'}
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
                    </CardContent>
                </Card>

                <div className="flex gap-2">
                    <Button variant="secondary" asChild>
                        <Link
                            href={showRoute.url({
                                current_team: teamSlug,
                                drug_inventory: inventory.id,
                            })}
                        >
                            Cancel
                        </Link>
                    </Button>
                    <Button disabled={processing} onClick={submit}>
                        {processing ? 'Saving…' : 'Save medication'}
                    </Button>
                </div>
            </div>
        </>
    );
}
