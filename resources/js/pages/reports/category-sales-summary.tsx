import { Head, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { FinancialReportLayout } from '@/components/financial-report-layout';
import Heading from '@/components/heading';
import { useReportPrint } from '@/hooks/use-report-print';
import { formatReportDate } from '@/hooks/use-format-report-date';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Table,
    TableBody,
    TableCell,
    TableFooter,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { exportMethod as exportReport, index } from '@/routes/reports/category-sales-summary';

type Group = {
    category: string;
    quantity: number;
    cost: number;
    price: number;
    amount: number;
};

type Filters = {
    from: string;
    to: string;
    perPage: number;
};

type Summary = {
    categories: number;
    totalQuantity: number;
    totalCost: number;
    totalPrice: number;
    totalAmount: number;
};

export default function CategorySalesSummary({
    groups,
    summary,
    filters,
    currencySymbol,
}: {
    groups: Group[];
    summary: Summary;
    filters: Filters;
    currencySymbol: string;
}) {
    const team = usePage().props.currentTeam?.slug ?? '';
    const { printRef, handlePrint } = useReportPrint();
    const [from, setFrom] = useState(filters.from);
    const [to, setTo] = useState(filters.to);

    const money = (value: number) =>
        `${currencySymbol}${value.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        })}`;

    const visit = (patch: Partial<Filters>) => {
        const next = { ...filters, ...patch };
        router.get(
            index.url({ current_team: team }),
            {
                from: next.from || undefined,
                to: next.to || undefined,
            },
            { preserveState: true, preserveScroll: true, replace: true },
        );
    };

    return (
        <>
            <Head title="Sales by category summary" />
            <FinancialReportLayout active="sales:category-summary">
                <div className="flex w-full flex-col space-y-6">
                    <div className="flex flex-wrap items-center justify-between gap-3 no-print">
                        <Heading
                            variant="small"
                            title="Sales by category summary"
                            description="Total sales grouped by category."
                        />
                        <div className="flex gap-2">
                            <Button variant="outline" onClick={handlePrint}>
                                Print
                            </Button>
                            <Button variant="outline" asChild>
                                <a
                                    href={exportReport.url(
                                        { current_team: team },
                                        { query: { from, to } },
                                    )}
                                >
                                    Export CSV
                                </a>
                            </Button>
                        </div>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-3 no-print">
                        <SummaryCard
                            label="Categories"
                            value={summary.categories.toLocaleString()}
                        />
                        <SummaryCard
                            label="Quantity"
                            value={summary.totalQuantity.toLocaleString()}
                        />
                        <SummaryCard
                            label="Total cost"
                            value={money(summary.totalCost)}
                        />
                        <SummaryCard
                            label="Total price"
                            value={money(summary.totalPrice)}
                        />
                        <SummaryCard
                            label="Subtotal"
                            value={money(summary.totalAmount)}
                        />
                    </div>

                    <div className="flex flex-wrap items-end gap-2 no-print">
                        <div className="space-y-1">
                            <Label htmlFor="category-from">From</Label>
                            <Input
                                id="category-from"
                                type="date"
                                value={from}
                                onChange={(event) => setFrom(event.target.value)}
                            />
                        </div>
                        <div className="space-y-1">
                            <Label htmlFor="category-to">To</Label>
                            <Input
                                id="category-to"
                                type="date"
                                value={to}
                                onChange={(event) => setTo(event.target.value)}
                            />
                        </div>
                        <Button
                            variant="secondary"
                            onClick={() => visit({ from, to })}
                        >
                            Apply
                        </Button>
                    </div>

                    <div ref={printRef} className="report-print-container">
                        <h2 className="mb-3 text-lg font-semibold">
                            Sales by Category Summary from {formatReportDate(from)} to {formatReportDate(to)}
                        </h2>
                        <div className="rounded-lg border bg-card">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Category</TableHead>
                                        <TableHead className="text-right">Quantity</TableHead>
                                        <TableHead className="text-right">Cost</TableHead>
                                        <TableHead className="text-right">Price</TableHead>
                                        <TableHead className="text-right">Subtotal</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {groups.length ? (
                                        groups.map((group) => (
                                            <TableRow key={group.category}>
                                                <TableCell className="font-medium">
                                                    {group.category}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    {group.quantity.toLocaleString()}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    {money(group.cost)}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    {money(group.price)}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    {money(group.amount)}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell
                                                colSpan={5}
                                                className="py-10 text-center text-muted-foreground"
                                            >
                                                No sales found for this period.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                                <TableFooter>
                                    <TableRow>
                                        <TableCell className="font-medium">
                                            Totals
                                        </TableCell>
                                        <TableCell className="text-right font-medium">
                                            {summary.totalQuantity.toLocaleString()}
                                        </TableCell>
                                        <TableCell className="text-right font-medium">
                                            {money(summary.totalCost)}
                                        </TableCell>
                                        <TableCell className="text-right font-medium">
                                            {money(summary.totalPrice)}
                                        </TableCell>
                                        <TableCell className="text-right font-medium">
                                            {money(summary.totalAmount)}
                                        </TableCell>
                                    </TableRow>
                                </TableFooter>
                            </Table>
                        </div>
                    </div>
                </div>
            </FinancialReportLayout>
        </>
    );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-lg border bg-card p-4">
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="mt-1 text-xl font-semibold">{value}</p>
        </div>
    );
}
