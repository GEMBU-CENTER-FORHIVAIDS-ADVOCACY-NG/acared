import { Head, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import Heading from '@/components/heading';
import Pagination from '@/components/pagination';
import { useReportPrint } from '@/hooks/use-report-print';
import { formatReportDate } from '@/hooks/use-format-report-date';
import { Button } from '@/components/ui/button';
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
import { exportMethod as exportReport, index } from '@/routes/reports/stock';

type StockRow = {
    id: number;
    item: string;
    user: string | null;
    quantity: number;
    stockType: string;
    receivedBy: string | null;
    status: string;
    createdAt: string | null;
};
type Filters = {
    q: string;
    from: string | null;
    to: string | null;
    perPage: number;
    page?: number;
};
type Paginator = {
    data: StockRow[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
};
export default function StockReportIndex({
    report,
    rows,
    summary,
    filters,
    reports,
}: {
    report: { key: string; title: string };
    rows: Paginator;
    summary: { movements: number; quantity: number };
    filters: Filters;
    reports: Record<string, string>;
}) {
    const team = usePage().props.currentTeam?.slug ?? '';
    const { printRef, handlePrint } = useReportPrint();
    const [search, setSearch] = useState(filters.q);
    const visit = (patch: Partial<Filters>) =>
        router.get(
            index.url(
                { current_team: team, report: report.key },
                { query: { ...filters, ...patch } },
            ),
            {},
            { preserveState: true, preserveScroll: true, replace: true },
        );
    return (
        <>
            <Head title={report.title} />
            <div className="flex w-full flex-col space-y-6 p-4 md:p-6 lg:p-8">
                <div className="flex flex-wrap items-center justify-between gap-3 no-print">
                    <div>
                        <Heading
                            variant="small"
                            title={report.title}
                            description="Stock movement details and quantities."
                        />
                        <div className="mt-2 flex flex-wrap gap-2">
                            {Object.entries(reports).map(([key, title]) => (
                                <Button
                                    key={key}
                                    variant={
                                        key === report.key
                                            ? 'default'
                                            : 'outline'
                                    }
                                    size="sm"
                                    onClick={() =>
                                        router.get(
                                            index.url({
                                                current_team: team,
                                                report: key,
                                            }),
                                            {},
                                            { preserveState: true },
                                        )
                                    }
                                >
                                    {title}
                                </Button>
                            ))}
                        </div>
                    </div>
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
                                    { current_team: team, report: report.key },
                                    { query: { ...filters, q: search } },
                                )}
                            >
                                Export CSV
                            </a>
                        </Button>
                    </div>
                </div>
                <div className="grid gap-3 sm:grid-cols-2 no-print">
                    <Summary
                        label="Movements"
                        value={summary.movements.toLocaleString()}
                    />
                    <Summary
                        label="Net quantity"
                        value={summary.quantity.toLocaleString()}
                    />
                </div>
                <div className="flex flex-wrap items-end gap-2 no-print">
                    <form
                        className="flex items-end gap-2"
                        onSubmit={(event) => {
                            event.preventDefault();
                            visit({ q: search, page: 1 });
                        }}
                    >
                        <div className="space-y-1">
                            <Label>Item</Label>
                            <Input
                                value={search}
                                onChange={(event) =>
                                    setSearch(event.target.value)
                                }
                                placeholder="Search inventory items"
                            />
                        </div>
                        <Button variant="secondary" type="submit">
                            Search
                        </Button>
                    </form>
                    <div className="space-y-1">
                        <Label>From</Label>
                        <Input
                            type="date"
                            value={filters.from ?? ''}
                            onChange={(event) =>
                                visit({
                                    from: event.target.value || null,
                                    page: 1,
                                })
                            }
                        />
                    </div>
                    <div className="space-y-1">
                        <Label>To</Label>
                        <Input
                            type="date"
                            value={filters.to ?? ''}
                            onChange={(event) =>
                                visit({
                                    to: event.target.value || null,
                                    page: 1,
                                })
                            }
                        />
                    </div>
                </div>
                <div ref={printRef} className="report-print-container">
                    <h2 className="mb-3 text-lg font-semibold">
                        {report.title} from {formatReportDate(filters.from)} to {formatReportDate(filters.to)}
                    </h2>
                    <div className="rounded-lg border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Item</TableHead>
                                <TableHead>Quantity</TableHead>
                                <TableHead>Stock type</TableHead>
                                <TableHead>Received by</TableHead>
                                <TableHead>User</TableHead>
                                <TableHead>Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {rows.data.length ? (
                                rows.data.map((row) => (
                                    <TableRow key={row.id}>
                                        <TableCell className="font-medium">
                                            {row.item}
                                        </TableCell>
                                        <TableCell
                                            className={
                                                row.quantity < 0
                                                    ? 'text-destructive'
                                                    : 'text-emerald-700'
                                            }
                                        >
                                            {Math.abs(
                                                row.quantity,
                                            ).toLocaleString()}
                                        </TableCell>
                                        <TableCell>{row.stockType}</TableCell>
                                        <TableCell>
                                            {row.receivedBy ?? '—'}
                                        </TableCell>
                                        <TableCell>{row.user ?? '—'}</TableCell>
                                        <TableCell className="capitalize">
                                            {row.status}
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell
                                        colSpan={6}
                                        className="py-10 text-center text-muted-foreground"
                                    >
                                        No stock movements found for this
                                        period.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
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
        </>
    );
}
function Summary({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-lg border p-4">
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="mt-1 text-2xl font-semibold">{value}</p>
        </div>
    );
}
