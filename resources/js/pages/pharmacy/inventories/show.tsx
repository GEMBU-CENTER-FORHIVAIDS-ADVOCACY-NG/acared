import { Head, Link, usePage } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
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
    edit as editRoute,
    index as inventoriesIndex,
    show as showRoute,
} from '@/routes/pharmacy/inventories';

type Inventory = {
    id: number;
    sku: string;
    name: string;
    drugForm: string | null;
    quantity: number;
    minQty: number;
    price: number;
    cost: number;
    value: number;
    profit: number;
    status: string;
    expiresAt: string | null;
};

export default function DrugInventoryShow({
    currencySymbol,
    inventory,
    movements,
}: {
    currencySymbol: string;
    inventory: Inventory;
    movements: {
        id: number;
        quantity: number;
        status: string;
        user: string | null;
        createdAt: string | null;
    }[];
}) {
    const { currentTeam } = usePage<{ currentTeam?: Team | null }>().props;
    const teamSlug = currentTeam?.slug ?? '';

    const facts = [
        { label: 'Product', value: inventory.name },
        { label: 'Form', value: inventory.drugForm ?? '—' },
        { label: 'SKU', value: inventory.sku },
        { label: 'Quantity', value: inventory.quantity.toLocaleString() },
        { label: 'Minimum', value: String(inventory.minQty) },
        {
            label: 'Price',
            value: `${currencySymbol} ${inventory.price.toLocaleString()}`,
        },
        {
            label: 'Cost',
            value: `${currencySymbol} ${inventory.cost.toLocaleString()}`,
        },
        {
            label: 'Value',
            value: `${currencySymbol} ${inventory.value.toLocaleString()}`,
        },
        {
            label: 'Profit',
            value: `${currencySymbol} ${inventory.profit.toLocaleString()}`,
        },
        { label: 'Status', value: inventory.status },
        { label: 'Expires', value: inventory.expiresAt ?? '—' },
    ];

    return (
        <>
            <Head title={`${inventory.name} stock`} />
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
                                title: inventory.name,
                                href: showRoute.url({
                                    current_team: teamSlug,
                                    drug_inventory: inventory.id,
                                }),
                            },
                        ]}
                    />
                    <div className="flex flex-wrap items-start justify-between gap-4">
                        <Heading
                            title={inventory.name}
                            description={`${inventory.drugForm ?? 'Medication'} · ${inventory.sku}`}
                        />
                        <div className="flex flex-wrap gap-2">
                            <Button variant="outline" asChild>
                                <Link href={inventoriesIndex(teamSlug)}>
                                    <ArrowLeft className="mr-2 size-4" />
                                    Back
                                </Link>
                            </Button>
                            <Button asChild>
                                <Link
                                    href={editRoute.url({
                                        current_team: teamSlug,
                                        drug_inventory: inventory.id,
                                    })}
                                >
                                    Edit
                                </Link>
                            </Button>
                        </div>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Stock details</CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {facts.map((fact) => (
                            <div key={fact.label}>
                                <p className="text-sm text-muted-foreground">
                                    {fact.label}
                                </p>
                                <p className="font-medium">{fact.value}</p>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Movement history</CardTitle>
                        <CardDescription>
                            Latest adjustments recorded against this stock
                            record.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Change</TableHead>
                                        <TableHead>Reason</TableHead>
                                        <TableHead>Recorded by</TableHead>
                                        <TableHead>Date</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {movements.length === 0 ? (
                                        <TableRow>
                                            <TableCell
                                                colSpan={4}
                                                className="py-6 text-center text-muted-foreground"
                                            >
                                                No stock movements yet.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        movements.map((movement) => (
                                            <TableRow key={movement.id}>
                                                <TableCell
                                                    className={
                                                        movement.quantity < 0
                                                            ? 'text-red-600'
                                                            : 'text-emerald-600'
                                                    }
                                                >
                                                    {movement.quantity > 0
                                                        ? '+'
                                                        : ''}
                                                    {movement.quantity}
                                                </TableCell>
                                                <TableCell className="capitalize">
                                                    {movement.status}
                                                </TableCell>
                                                <TableCell>
                                                    {movement.user ?? '—'}
                                                </TableCell>
                                                <TableCell>
                                                    {movement.createdAt
                                                        ? new Date(
                                                              movement.createdAt,
                                                          ).toLocaleString()
                                                        : '—'}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
