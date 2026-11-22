import { Head, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { FinancialReportLayout } from '@/components/financial-report-layout';
import Heading from '@/components/heading';
import { useReportPrint } from '@/hooks/use-report-print';
import { formatReportDate } from '@/hooks/use-format-report-date';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
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
import {
    exportMethod as exportReport,
    index,
} from '@/routes/reports/category-sales-summary';

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

function formatReportDateLocal(value: string | null): string {
    if (!value) {
        return formatReportDate(null);
    }

    return formatReportDate(
        /^\d{4}-\d{2}-\d{2}$/.test(value) ? `${value}T00:00:00` : value,
    );
}

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
    const [isVisiting, setIsVisiting] = useState(false);
    const [isPrinting, setIsPrinting] = useState(false);
    const hasInvalidRange = Boolean(from && to && from > to);

    const money = (value: number) =>
        `${currencySymbol}${value.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        })}`;

    const visit = (patch: Partial<Filters>) => {
        const next = { ...filters, ...patch };
        if (next.from && next.to && next.from > next.to) {
            return;
        }

        setIsVisiting(true);
        router.get(
            index.url({ current_team: team }),
            {
                from: next.from || undefined,
                to: next.to || undefined,
            },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
                onFinish: () => setIsVisiting(false),
            },
        );
    };
    const printReport = () => {
        setIsPrinting(true);
        const finishPrint = () => {
            setIsPrinting(false);
            window.removeEventListener('afterprint', finishPrint);
        };
        window.addEventListener('afterprint', finishPrint);
        handlePrint();
    };

    return (
        <>
            <Head title="Sales by category" />
            <FinancialReportLayout active="sales:category">
                <div className="flex w-full flex-col space-y-6">
                    <div className="no-print flex flex-wrap items-center justify-between gap-3">
                        <Heading
                            variant="small"
                            title="Sales by category"
                            description="Total sales grouped by category."
                        />
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                onClick={printReport}
                                disabled={isPrinting}
                            >
                                {isPrinting ? 'Printing…' : 'Print'}
                            </Button>
                            <Button variant="outline" asChild>
                                <a
                                    href={exportReport.url(
                                        { current_team: team },
                                        {
                                            query: {
                                                from: filters.from || undefined,
                                                to: filters.to || undefined,
                                            },
                                        },
                                    )}
                                >
                                    Export CSV
                                </a>
                            </Button>
                        </div>
                    </div>

                    <div className="no-print grid gap-3 sm:grid-cols-3 lg:grid-cols-3">
                        <StatCard
                            title="Categories"
                            value={summary.categories.toLocaleString()}
                        />
                        <StatCard
                            title="Quantity"
                            value={summary.totalQuantity.toLocaleString()}
                        />
                        <StatCard
                            title="Total cost"
                            value={money(summary.totalCost)}
                        />
                        <StatCard
                            title="Total price"
                            value={money(summary.totalPrice)}
                        />
                        <StatCard
                            title="Subtotal"
                            value={money(summary.totalAmount)}
                        />
                    </div>

                    <div className="no-print flex flex-wrap items-end gap-2">
                        <div className="space-y-1">
                            <Label htmlFor="category-from">From</Label>
                            <Input
                                id="category-from"
                                type="date"
                                value={from}
                                onChange={(event) =>
                                    setFrom(event.target.value)
                                }
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
                            onClick={() => visit({ from, to })}
                            disabled={isVisiting || hasInvalidRange}
                        >
                            {isVisiting ? 'Applying…' : 'Apply'}
                        </Button>
                        {hasInvalidRange && (
                            <p
                                role="alert"
                                className="w-full text-xs text-destructive"
                            >
                                From date must be on or before to date.
                            </p>
                        )}
                    </div>

                    <div ref={printRef} className="report-print-container">
                        <h2 className="mb-3 text-lg font-semibold">
                            Sales by Category Summary from{' '}
                            {formatReportDateLocal(from)} to{' '}
                            {formatReportDateLocal(to)}
                        </h2>
                        <div className="overflow-x-auto rounded-lg border bg-card">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Category</TableHead>
                                        <TableHead className="text-right">
                                            Quantity
                                        </TableHead>
                                        <TableHead className="text-right">
                                            Cost
                                        </TableHead>
                                        <TableHead className="text-right">
                                            Price
                                        </TableHead>
                                        <TableHead className="text-right">
                                            Subtotal
                                        </TableHead>
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

function StatCard({ title, value }: { title: string; value: string }) {
    return (
        <Card>
            <CardHeader className="pb-2">
                <CardDescription>{title}</CardDescription>
                <CardTitle className="text-2xl">{value}</CardTitle>
            </CardHeader>
        </Card>
    );
}
