import { Head, router, usePage } from '@inertiajs/react';
import { Fragment, useState } from 'react';
import { FinancialReportLayout } from '@/components/financial-report-layout';
import Heading from '@/components/heading';
import Pagination from '@/components/pagination';
import { useReportPrint } from '@/hooks/use-report-print';
import { formatReportDate } from '@/hooks/use-format-report-date';
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
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { exportMethod as exportReport, index } from '@/routes/reports/sales';

type ItemRow = {
    id: number;
    group: string;
    patientId: string;
    patientName: string | null;
    item?: string;
    quantity: number;
    unitCost: number;
    unitPrice: number;
    totalPrice: number;
    createdAt: string | null;
};

type PaymentRow = {
    id: number;
    group: string;
    patientId: string;
    patientName: string | null;
    receivedBy: string | null;
    department?: string;
    method: string | null;
    amount: number;
    discountAmount: number;
    wallet: number;
    mercyFund: number;
    infantFormula: number;
    createdAt: string | null;
};

type AggregatedPatientRow = {
    id: string;
    group: string;
    patientId: string;
    patientName: string | null;
    amount: number;
    discountAmount: number;
    wallet: number;
    mercyFund: number;
    infantFormula: number;
    transactions: number;
};

type AggregatedPaymentMethodRow = {
    id: string;
    group: string;
    methodName: string | null;
    amount: number;
    discountAmount: number;
    wallet: number;
    mercyFund: number;
    infantFormula: number;
    transactions: number;
};

type SalesRow = ItemRow | PaymentRow | AggregatedPatientRow | AggregatedPaymentMethodRow;
type Filters = {
    q: string;
    from: string;
    to: string;
    perPage: number;
    page?: number;
};
type Paginator = {
    data: SalesRow[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
};
type Summary = {
    transactions: number;
    amount: number;
    items?: number;
    quantity?: number;
    cost?: number;
    price?: number;
    discount?: number;
    wallet?: number;
    mercyFund?: number;
    infantFormula?: number;
};
type ItemGroupTotal = {
    quantity: number;
    cost: number;
    price: number;
    amount: number;
};
type PaymentGroupTotal = {
    amount: number;
    discount: number;
    wallet: number;
    mercyFund: number;
    infantFormula: number;
};
type GroupTotals = Record<string, Partial<ItemGroupTotal & PaymentGroupTotal>>;

export default function SalesReport({
    report,
    rows,
    summary,
    groupTotals,
    filters,
    currencySymbol,
}: {
    report: { key: string; title: string };
    rows: Paginator;
    summary: Summary;
    groupTotals: GroupTotals;
    filters: Filters;
    currencySymbol: string;
}) {
    const team = usePage().props.currentTeam?.slug ?? '';
    const { printRef, handlePrint } = useReportPrint();
    const [search, setSearch] = useState(filters.q);
    const [from, setFrom] = useState(filters.from);
    const [to, setTo] = useState(filters.to);
    const isItemReport = report.key === 'item';
    const isPatientReport = report.key === 'patient';
    const isPaymentMethodReport = report.key === 'method';
    const isDepartmentReport = report.key === 'department';

    const money = (value: number) =>
        `${currencySymbol}${value.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        })}`;
    const date = (value: string | null) =>
        value ? new Date(value).toLocaleString() : '-';
    const groupTotal = (label: string) => groupTotals[label] ?? {};

    const visit = (patch: Partial<Filters>) => {
        const next = { ...filters, ...patch };
        router.get(
            index.url({ current_team: team, dimension: report.key }),
            {
                q: next.q || undefined,
                from: next.from || undefined,
                to: next.to || undefined,
                perPage: next.perPage,
                page: next.page || undefined,
            },
            { preserveState: true, preserveScroll: true, replace: true },
        );
    }

    const cards: [string, string | number][] = isItemReport
        ? [
              ['Lines', summary.transactions.toLocaleString()],
              ['Items', (summary.items ?? 0).toLocaleString()],
              ['Quantity', (summary.quantity ?? 0).toLocaleString()],
              ['Total cost', money(summary.cost ?? 0)],
              ['Total price', money(summary.price ?? 0)],
              ['Subtotal', money(summary.amount)],
          ]
        : [
              ['Transactions', summary.transactions.toLocaleString()],
              ['Amount', money(summary.amount)],
              ['Discount', money(summary.discount ?? 0)],
              ['Wallet', money(summary.wallet ?? 0)],
              ['Mercy fund', money(summary.mercyFund ?? 0)],
              ['Infant formula', money(summary.infantFormula ?? 0)],
          ];

    const columnCount = isItemReport ? 5 : (isDepartmentReport ? 9 : (isPatientReport ? 8 : (isPaymentMethodReport ? 7 : 8)));

    return (
        <>
            <Head title={report.title} />
            <FinancialReportLayout active={`sales:${report.key}`}>
                <div className="flex w-full flex-col space-y-6">
                    <div className="flex flex-wrap items-center justify-between gap-3 no-print">
                        <Heading
                            variant="small"
                            title={report.title}
                            description="Detailed sales transactions grouped by the selected dimension."
                        />
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                onClick={handlePrint}
                            >
                                Print
                            </Button>
                            <Button variant="outline" asChild>
                                <a
                                    href={exportReport.url(
                                        {
                                            current_team: team,
                                            dimension: report.key,
                                        },
                                        {
                                            query: {
                                                q: search,
                                                from,
                                                to,
                                                perPage: filters.perPage,
                                            },
                                        },
                                    )}
                                >
                                    Export CSV
                                </a>
                            </Button>
                        </div>
                    </div>
                <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-3 no-print">
                    {cards.map(([label, value]) => (
                        <StatCard
                            key={label}
                            title={label}
                            value={String(value)}
                        />
                    ))}
                </div>
                <div className="flex flex-wrap items-end gap-2 no-print">
                    <form
                        className="flex items-end gap-2"
                        onSubmit={(event) => {
                            event.preventDefault();
                            visit({ q: search, from, to, page: 1 });
                        }}
                    >
                        <div className="space-y-1">
                            <Label htmlFor="sales-search">
                                {isItemReport
                                    ? 'Hospital no., patient or item'
                                    : (isPatientReport
                                        ? 'Hospital no. or patient'
                                        : (isPaymentMethodReport
                                            ? 'Method or patient'
                                            : 'Hospital no., patient, method or department'))}
                            </Label>
                            <Input
                                id="sales-search"
                                value={search}
                                onChange={(event) =>
                                    setSearch(event.target.value)
                                }
                                placeholder="Search"
                            />
                        </div>
                        <Button type="submit" variant="secondary">
                            Search
                        </Button>
                    </form>
                    <div className="space-y-1">
                        <Label htmlFor="sales-from">From</Label>
                        <Input
                            id="sales-from"
                            type="date"
                            value={from}
                            onChange={(event) => setFrom(event.target.value)}
                        />
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="sales-to">To</Label>
                        <Input
                            id="sales-to"
                            type="date"
                            value={to}
                            onChange={(event) => setTo(event.target.value)}
                        />
                    </div>
                    <Button
                        variant="secondary"
                        onClick={() => visit({ q: search, from, to, page: 1 })}
                    >
                        Apply
                    </Button>
                </div>
                <div ref={printRef} className="report-print-container">
                    <h2 className="mb-3 text-lg font-semibold">
                        {report.title} from {formatReportDate(from)} to {formatReportDate(to)}
                    </h2>
                    <div className="overflow-x-auto rounded-lg border bg-card">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                {isItemReport ? (
                                    <>
                                        {isItemReport && <TableHead>Item</TableHead>}
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
                                    </>
                                ) : (
                                    <>
                                        {(!isPatientReport && !isPaymentMethodReport) && <TableHead>Hospital No.</TableHead>}
                                        {!isPaymentMethodReport && <TableHead>Patient name</TableHead>}
                                        {isDepartmentReport && <TableHead>Department</TableHead>}
                                        {!isPatientReport && <TableHead>Method</TableHead>}
                                        {(isPatientReport || isPaymentMethodReport) && <TableHead className="text-right">Count</TableHead>}
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
                                            Mercy fund
                                        </TableHead>
                                        <TableHead className="text-right">
                                            Infant formula
                                        </TableHead>
                                    </>
                                )}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {rows.data.length ? (
                                rows.data.map((row, index) => {
                                    if (isItemReport) {
                                        return (
                                            <TableRow key={row.id}>
                                                <TableCell className="font-medium">
                                                    {(row as ItemRow).item}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    {(
                                                        row as ItemRow
                                                    ).quantity.toLocaleString()}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    {money(
                                                        (row as ItemRow)
                                                            .unitCost,
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    {money(
                                                        (row as ItemRow)
                                                            .unitPrice,
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    {money(
                                                        (row as ItemRow)
                                                            .totalPrice,
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        );
                                    }

                                    if (isPatientReport) {
                                        const patientRow = row as AggregatedPatientRow;
                                        const displayName = patientRow.patientName
                                            ? `${patientRow.patientId} - ${patientRow.patientName}`
                                            : patientRow.patientId;
                                        return (
                                            <TableRow key={patientRow.id}>
                                                <TableCell className="font-medium">
                                                    {displayName}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    {patientRow.transactions.toLocaleString()}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    {money(patientRow.amount)}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    {money(patientRow.discountAmount)}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    {money(patientRow.wallet)}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    {money(patientRow.mercyFund)}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    {money(patientRow.infantFormula)}
                                                </TableCell>
                                            </TableRow>
                                        );
                                    }

                                    if (isPaymentMethodReport) {
                                        const methodRow = row as AggregatedPaymentMethodRow;
                                        return (
                                            <TableRow key={methodRow.id}>
                                                <TableCell className="font-medium">
                                                    {methodRow.methodName ?? '-'}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    {methodRow.transactions.toLocaleString()}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    {money(methodRow.amount)}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    {money(methodRow.discountAmount)}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    {money(methodRow.wallet)}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    {money(methodRow.mercyFund)}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    {money(methodRow.infantFormula)}
                                                </TableCell>
                                            </TableRow>
                                        );
                                    }

                                    return (
                                        <Fragment key={row.id}>
                                            {(index === 0 ||
                                                rows.data[index - 1].group !==
                                                    row.group) && (
                                                <TableRow className="bg-muted/50 font-semibold hover:bg-muted/50">
                                                    {isItemReport ? (
                                                        <>
                                                            <TableCell colSpan={1}>
                                                                {row.group}
                                                            </TableCell>
                                                            <TableCell className="text-right">
                                                                {(
                                                                    groupTotal(
                                                                        row.group,
                                                                    ).quantity ?? 0
                                                                ).toLocaleString()}
                                                            </TableCell>
                                                            <TableCell className="text-right">
                                                                {money(
                                                                    groupTotal(
                                                                        row.group,
                                                                    ).cost ?? 0,
                                                                )}
                                                            </TableCell>
                                                            <TableCell className="text-right">
                                                                {money(
                                                                    groupTotal(
                                                                        row.group,
                                                                    ).price ?? 0,
                                                                )}
                                                            </TableCell>
                                                            <TableCell className="text-right">
                                                                {money(
                                                                    groupTotal(
                                                                        row.group,
                                                                    ).amount ?? 0,
                                                                )}
                                                            </TableCell>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <TableCell colSpan={isPaymentMethodReport ? 1 : (isDepartmentReport ? 4 : 3)}>
                                                                {row.group}
                                                            </TableCell>
                                                            <TableCell className="text-right">
                                                                {money(
                                                                    groupTotal(
                                                                        row.group,
                                                                    ).amount ?? 0,
                                                                )}
                                                            </TableCell>
                                                            <TableCell className="text-right">
                                                                {money(
                                                                    groupTotal(
                                                                        row.group,
                                                                    ).discount ?? 0,
                                                                )}
                                                            </TableCell>
                                                            <TableCell className="text-right">
                                                                {money(
                                                                    groupTotal(
                                                                        row.group,
                                                                    ).wallet ?? 0,
                                                                )}
                                                            </TableCell>
                                                            <TableCell className="text-right">
                                                                {money(
                                                                    groupTotal(
                                                                        row.group,
                                                                    ).mercyFund ??
                                                                        0,
                                                                )}
                                                            </TableCell>
                                                            <TableCell className="text-right">
                                                                {money(
                                                                    groupTotal(
                                                                        row.group,
                                                                    )
                                                                        .infantFormula ??
                                                                        0,
                                                                )}
                                                            </TableCell>
                                                        </>
                                                    )}
                                                </TableRow>
                                            )}
                                            {isItemReport ? (
                                                <TableRow>
                                                    {isItemReport && (
                                                        <TableCell className="font-medium">
                                                            {(row as ItemRow).item}
                                                        </TableCell>
                                                    )}
                                                    <TableCell className="text-right">
                                                        {(
                                                            row as ItemRow
                                                        ).quantity.toLocaleString()}
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        {money(
                                                            (row as ItemRow)
                                                                .unitCost,
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        {money(
                                                            (row as ItemRow)
                                                                .unitPrice,
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        {money(
                                                            (row as ItemRow)
                                                                .totalPrice,
                                                        )}
                                                    </TableCell>
                                                </TableRow>
                                            ) : (
                                                <TableRow>
                                                    <TableCell>
                                                        {
                                                            (row as PaymentRow)
                                                                .patientId
                                                        }
                                                    </TableCell>
                                                    <TableCell>
                                                        {(row as PaymentRow)
                                                            .patientName ?? '-'}
                                                    </TableCell>
                                                    {isDepartmentReport && (
                                                        <TableCell>
                                                            {(row as PaymentRow)
                                                                .department ?? '-'}
                                                        </TableCell>
                                                    )}
                                                    <TableCell>
                                                        {(row as PaymentRow)
                                                            .method ?? '-'}
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        {money(
                                                            (row as PaymentRow)
                                                                .amount,
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        {money(
                                                            (row as PaymentRow)
                                                                .discountAmount,
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        {money(
                                                            (row as PaymentRow)
                                                                .wallet,
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        {money(
                                                            (row as PaymentRow)
                                                                .mercyFund,
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        {money(
                                                            (row as PaymentRow)
                                                                .infantFormula,
                                                        )}
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </Fragment>
                                    );
                                })
                            ) : (
                                <TableRow>
                                    <TableCell
                                        colSpan={columnCount}
                                        className="py-10 text-center text-muted-foreground"
                                    >
                                        No sales found for this period.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                        <tfoot className="border-t bg-muted/50 font-semibold">
                            <TableRow className="hover:bg-muted/50">
                                {isItemReport ? (
                                    <>
                                        <TableCell colSpan={1}>
                                            Totals
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {(
                                                summary.quantity ?? 0
                                            ).toLocaleString()}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {money(summary.cost ?? 0)}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {money(summary.price ?? 0)}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {money(summary.amount)}
                                        </TableCell>
                                    </>
                                ) : (
                                    <>
                                        <TableCell colSpan={isPaymentMethodReport ? 2 : (isPatientReport ? 2 : (isDepartmentReport ? 4 : 3))}>
                                            Totals
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {money(summary.amount)}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {money(summary.discount ?? 0)}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {money(summary.wallet ?? 0)}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {money(summary.mercyFund ?? 0)}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {money(summary.infantFormula ?? 0)}
                                        </TableCell>
                                    </>
                                )}
                            </TableRow>
                        </tfoot>
                    </Table>
                    </div>
                </div>
                <div className="no-print">
                    <Pagination
                        meta={{
                            currentPage: rows.current_page,
                            lastPage: rows.last_page,
                            perPage: rows.per_page,
                            total: rows.total,
                        }}
                        onPageChange={(page) => visit({ page })}
                        onPerPageChange={(perPage) => visit({ perPage, page: 1 })}
                    />
                </div>
                </div>
            </FinancialReportLayout>
        </>
    );
}

function StatCard({
    title,
    value,
}: {
    title: string;
    value: string;
}) {
    return (
        <Card>
            <CardHeader className="pb-2">
                <CardDescription>{title}</CardDescription>
                <CardTitle className="text-2xl">{value}</CardTitle>
            </CardHeader>
        </Card>
    );
}
