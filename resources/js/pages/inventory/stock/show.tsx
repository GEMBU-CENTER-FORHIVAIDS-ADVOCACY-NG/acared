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
import stockRoutes from '@/routes/inventory/stock';
import type { Team } from '@/types';

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
type Movement = {
    id: number;
    quantity: number;
    status: string | null;
    user: string | null;
    createdAt: string | null;
};

export default function InventoryStockShow({
    currencySymbol,
    inventory,
    movements,
}: {
    currencySymbol: string;
    inventory: Inventory;
    movements: Movement[];
}) {
    const { currentTeam } = usePage<{ currentTeam?: Team | null }>().props;
    const teamSlug = currentTeam?.slug ?? '';
    const values = [
        ['Product', inventory.name],
        ['Product form', inventory.drugForm ?? '—'],
        ['SKU', inventory.sku],
        ['Minimum quantity', String(inventory.minQty)],
        ['Quantity available', inventory.quantity.toLocaleString()],
        ['Price', `${currencySymbol}${inventory.price.toLocaleString()}`],
        ['Cost', `${currencySymbol}${inventory.cost.toLocaleString()}`],
        ['Stock value', `${currencySymbol}${inventory.value.toLocaleString()}`],
        ['Profit', `${currencySymbol}${inventory.profit.toLocaleString()}`],
        ['Status', inventory.status],
        ['Expires', inventory.expiresAt ?? '—'],
    ];

    return (
        <>
            <Head title={`${inventory.name} inventory`} />
            <div className="flex w-full flex-col space-y-6 p-4 md:p-6 lg:p-8">
                <Breadcrumbs
                    breadcrumbs={[
                        {
                            title: 'Inventory',
                            href: stockRoutes.index.url(teamSlug),
                        },
                        {
                            title: inventory.name,
                            href: stockRoutes.show.url({
                                current_team: teamSlug,
                                inventory: inventory.id,
                            }),
                        },
                    ]}
                />
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <Heading
                        title={inventory.name}
                        description="Inventory record and recent stock movements."
                    />
                    <Button variant="outline" asChild>
                        <Link href={stockRoutes.index.url(teamSlug)}>
                            <ArrowLeft className="mr-2 size-4" />
                            Back to inventory
                        </Link>
                    </Button>
                </div>
                <Card>
                    <CardHeader>
                        <CardTitle>Item details</CardTitle>
                        <CardDescription>
                            Current quantity, pricing, and expiry information.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {values.map(([label, value]) => (
                            <div key={label} className="space-y-1">
                                <p className="text-sm text-muted-foreground">
                                    {label}
                                </p>
                                <p className="font-medium">{value}</p>
                            </div>
                        ))}
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Stock movements</CardTitle>
                        <CardDescription>
                            Recent adjustments and transfers recorded for this
                            item.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="px-0 sm:px-6">
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Change</TableHead>
                                        <TableHead>Reason</TableHead>
                                        <TableHead>User</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {movements.length === 0 ? (
                                        <TableRow>
                                            <TableCell
                                                colSpan={4}
                                                className="py-8 text-center text-muted-foreground"
                                            >
                                                No stock movements recorded.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        movements.map((movement) => (
                                            <TableRow key={movement.id}>
                                                <TableCell>
                                                    {movement.createdAt
                                                        ? new Date(
                                                              movement.createdAt,
                                                          ).toLocaleString()
                                                        : '—'}
                                                </TableCell>
                                                <TableCell
                                                    className={
                                                        movement.quantity < 0
                                                            ? 'text-destructive'
                                                            : 'text-emerald-600'
                                                    }
                                                >
                                                    {movement.quantity > 0
                                                        ? '+'
                                                        : ''}
                                                    {movement.quantity}
                                                </TableCell>
                                                <TableCell>
                                                    {movement.status ?? '—'}
                                                </TableCell>
                                                <TableCell>
                                                    {movement.user ?? '—'}
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
