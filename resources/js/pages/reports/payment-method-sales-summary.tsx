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
} from '@/routes/reports/payment-method-sales-summary';

type Group = {
    method: string;
    transactions: number;
    amount: number;
    discount: number;
    wallet: number;
    mercyFund: number;
    infantFormula: number;
};

type Filters = {
    from: string;
    to: string;
    perPage: number;
};

type Summary = {
    methods: number;
    totalTransactions: number;
    totalAmount: number;
    totalDiscount: number;
    totalWallet: number;
    totalMercyFund: number;
    totalInfantFormula: number;
    totalGrandTotal: number;
};

function formatReportDateLocal(value: string | null): string {
    if (!value) {
        return formatReportDate(null);
    }

    return formatReportDate(
        /^\d{4}-\d{2}-\d{2}$/.test(value) ? `${value}T00:00:00` : value,
    );
}

export default function PaymentMethodSalesSummary({
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
            <Head title="Sales by payment method summary" />
            <FinancialReportLayout active="sales:method-summary">
                <div className="flex w-full flex-col space-y-6">
                    <div className="no-print flex flex-wrap items-center justify-between gap-3">
                        <Heading
                            variant="small"
                            title="Sales by payment method summary"
                            description="Total sales grouped by payment method."
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
                            title="Grand total"
                            value={money(summary.totalGrandTotal)}
                        />
                        <StatCard
                            title="Payment methods"
                            value={summary.methods.toLocaleString()}
                        />
                        <StatCard
                            title="Transactions"
                            value={summary.totalTransactions.toLocaleString()}
                        />
                        <StatCard
                            title="Total amount"
                            value={money(summary.totalAmount)}
                        />
                        <StatCard
                            title="Total discount"
                            value={money(summary.totalDiscount)}
                        />
                        <StatCard
                            title="Total wallet"
                            value={money(summary.totalWallet)}
                        />
                        <StatCard
                            title="Total mercy fund"
                            value={money(summary.totalMercyFund)}
                        />
                        <StatCard
                            title="Total infant formula"
                            value={money(summary.totalInfantFormula)}
                        />
                    </div>

                    <div className="no-print flex flex-wrap items-end gap-2">
                        <div className="space-y-1">
                            <Label htmlFor="method-from">From</Label>
                            <Input
                                id="method-from"
                                type="date"
                                value={from}
                                onChange={(event) =>
                                    setFrom(event.target.value)
                                }
                            />
                        </div>
                        <div className="space-y-1">
                            <Label htmlFor="method-to">To</Label>
                            <Input
                                id="method-to"
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
                            Sales by Payment Method Summary from{' '}
                            {formatReportDateLocal(from)} to{' '}
                            {formatReportDateLocal(to)}
                        </h2>
                        <div className="overflow-x-auto rounded-lg border bg-card">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Payment Method</TableHead>
                                        <TableHead className="text-right">
                                            Transactions
                                        </TableHead>
                                        <TableHead className="text-right">
                                            Amount
                                        </TableHead>
                                        <TableHead className="text-right">
                                            Discount
                                        </TableHead>
                                        <TableHead className="text-right">
                                            Wallet
                                        </TableHead>
                                        <TableHead className="text-right">
                                            Mercy Fund
                                        </TableHead>
                                        <TableHead className="text-right">
                                            Infant Formula
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {groups.length ? (
                                        groups.map((group) => (
                                            <TableRow key={group.method}>
                                                <TableCell className="font-medium">
                                                    {group.method}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    {group.transactions.toLocaleString()}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    {money(group.amount)}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    {money(group.discount)}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    {money(group.wallet)}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    {money(group.mercyFund)}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    {money(group.infantFormula)}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell
                                                colSpan={7}
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
                                            {summary.totalTransactions.toLocaleString()}
                                        </TableCell>
                                        <TableCell className="text-right font-medium">
                                            {money(summary.totalAmount)}
                                        </TableCell>
                                        <TableCell className="text-right font-medium">
                                            {money(summary.totalDiscount)}
                                        </TableCell>
                                        <TableCell className="text-right font-medium">
                                            {money(summary.totalWallet)}
                                        </TableCell>
                                        <TableCell className="text-right font-medium">
                                            {money(summary.totalMercyFund)}
                                        </TableCell>
                                        <TableCell className="text-right font-medium">
                                            {money(summary.totalInfantFormula)}
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
