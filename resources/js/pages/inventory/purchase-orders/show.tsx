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
import purchaseOrderRoutes from '@/routes/purchase-orders';
import type { Team } from '@/types';

type OrderLine = {
    id: number;
    itemName: string;
    markupName: string | null;
    quantity: number;
    unitCost: number;
    unitPrice: number;
    totalCost: number;
    totalPrice: number;
    expiresAt: string;
};
type Order = {
    id: number;
    slug: string;
    vendorName: string | null;
    userName: string | null;
    subPrice: number;
    subCost: number;
    discount: number;
    total: number;
    status: string;
    createdAt: string | null;
    items: OrderLine[];
};

export default function PurchaseOrderShow({
    currencySymbol,
    order,
}: {
    currencySymbol: string;
    order: Order;
}) {
    const { currentTeam } = usePage<{ currentTeam?: Team | null }>().props;
    const teamSlug = currentTeam?.slug ?? '';
    return (
        <>
            <Head title={order.slug} />
            <div className="flex w-full flex-col space-y-6 p-4 md:p-6 lg:p-8">
                <Breadcrumbs
                    breadcrumbs={[
                        {
                            title: 'Inventory',
                            href: purchaseOrderRoutes.index.url(teamSlug),
                        },
                        {
                            title: 'Purchase orders',
                            href: purchaseOrderRoutes.index.url(teamSlug),
                        },
                        {
                            title: order.slug,
                            href: purchaseOrderRoutes.show.url({
                                current_team: teamSlug,
                                purchase_order: order.id,
                            }),
                        },
                    ]}
                />
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <Heading
                        title={order.slug}
                        description={`${order.vendorName ?? 'Unknown vendor'} · Created by ${order.userName ?? 'Unknown user'}`}
                    />
                    <Button variant="outline" asChild>
                        <Link href={purchaseOrderRoutes.index.url(teamSlug)}>
                            <ArrowLeft className="mr-2 size-4" />
                            Back to purchase orders
                        </Link>
                    </Button>
                </div>
                <Card>
                    <CardHeader>
                        <CardTitle>Purchase order details</CardTitle>
                        <CardDescription>
                            Order status:{' '}
                            <span className="capitalize">{order.status}</span>
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        {[
                            ['Vendor', order.vendorName ?? '—'],
                            ['Created by', order.userName ?? '—'],
                            [
                                'Created',
                                order.createdAt
                                    ? new Date(order.createdAt).toLocaleString()
                                    : '—',
                            ],
                            [
                                'Subtotal price',
                                `${currencySymbol}${order.subPrice.toLocaleString()}`,
                            ],
                            [
                                'Subtotal cost',
                                `${currencySymbol}${order.subCost.toLocaleString()}`,
                            ],
                            [
                                'Discount',
                                `${currencySymbol}${order.discount.toLocaleString()}`,
                            ],
                            [
                                'Total',
                                `${currencySymbol}${order.total.toLocaleString()}`,
                            ],
                        ].map(([label, value]) => (
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
                        <CardTitle>Items</CardTitle>
                        <CardDescription>
                            Ordered quantity, unit cost, markup price, and
                            expiry.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="px-0 sm:px-6">
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Item</TableHead>
                                        <TableHead>Markup</TableHead>
                                        <TableHead>Quantity</TableHead>
                                        <TableHead>Unit cost</TableHead>
                                        <TableHead>Unit price</TableHead>
                                        <TableHead>Total cost</TableHead>
                                        <TableHead>Total price</TableHead>
                                        <TableHead>Expiry</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {order.items.length === 0 ? (
                                        <TableRow>
                                            <TableCell
                                                colSpan={8}
                                                className="py-8 text-center text-muted-foreground"
                                            >
                                                This order has no items.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        order.items.map((item) => (
                                            <TableRow key={item.id}>
                                                <TableCell className="font-medium">
                                                    {item.itemName}
                                                </TableCell>
                                                <TableCell>
                                                    {item.markupName ?? '—'}
                                                </TableCell>
                                                <TableCell>
                                                    {item.quantity}
                                                </TableCell>
                                                <TableCell>
                                                    {currencySymbol}
                                                    {item.unitCost.toLocaleString()}
                                                </TableCell>
                                                <TableCell>
                                                    {currencySymbol}
                                                    {item.unitPrice.toLocaleString()}
                                                </TableCell>
                                                <TableCell>
                                                    {currencySymbol}
                                                    {item.totalCost.toLocaleString()}
                                                </TableCell>
                                                <TableCell>
                                                    {currencySymbol}
                                                    {item.totalPrice.toLocaleString()}
                                                </TableCell>
                                                <TableCell>
                                                    {item.expiresAt}
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
