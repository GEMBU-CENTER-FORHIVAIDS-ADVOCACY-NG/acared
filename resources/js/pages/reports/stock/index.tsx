import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { StockReportLayout, type StockReportKey } from '@/components/stock-report-layout';
import Heading from '@/components/heading';
import Pagination from '@/components/pagination';
import { useReportPrint } from '@/hooks/use-report-print';
import { formatReportDate } from '@/hooks/use-format-report-date';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
    group: string;
    page?: number;
};
type Paginator = {
    data: StockRow[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
};
type DashboardData = {
    totalMovements: number;
    totalQuantity: number;
    perReport: Record<string, { movements: number; quantity: number }>;
    recentMovements: StockRow[];
};

export default function StockReportIndex({
    report,
    rows,
    summary,
    filters,
    reports,
    dashboard,
}: {
    report: { key: string; title: string } | null;
    rows?: Paginator;
    summary?: { movements: number; quantity: number };
    filters: Filters;
    reports: Record<string, string>;
    dashboard?: DashboardData;
}) {
    const team = usePage().props.currentTeam?.slug ?? '';

    if (!report && dashboard) {
        return (
            <>
                <Head title="Stock overview" />
                <StockReportLayout active="dashboard">
                    <StockDashboard
                        dashboard={dashboard}
                        reports={reports}
                        filters={filters}
                        team={team}
                    />
                </StockReportLayout>
            </>
        );
    }

    if (!report || !rows || !summary) {
        return null;
    }

    return (
        <>
            <Head title={report.title} />
            <StockReport active={report.key as StockReportKey}
                report={report}
                rows={rows}
                summary={summary}
                filters={filters}
                reports={reports}
                team={team}
            />
        </>
    );
}

function StockDashboard({
    dashboard,
    reports,
    filters,
    team,
}: {
    dashboard: DashboardData;
    reports: Record<string, string>;
    filters: Filters;
    team: string;
}) {
    const [from, setFrom] = useState(filters.from ?? '');
    const [to, setTo] = useState(filters.to ?? '');

    const applyDateFilter = () => {
        router.get(
            index.url({ current_team: team }),
            {
                from: from || undefined,
                to: to || undefined,
            },
            { preserveState: true, preserveScroll: true, replace: true },
        );
    };

    return (
        <div className="flex w-full flex-col space-y-6">
            <Heading
                variant="small"
                title="Stock overview"
                description="Summary of all stock movements and recent activity."
            />

            <div className="flex flex-wrap items-end gap-2">
                <div className="space-y-1">
                    <Label>From</Label>
                    <Input
                        type="date"
                        value={from}
                        onChange={(event) => setFrom(event.target.value)}
                    />
                </div>
                <div className="space-y-1">
                    <Label>To</Label>
                    <Input
                        type="date"
                        value={to}
                        onChange={(event) => setTo(event.target.value)}
                    />
                </div>
                <Button variant="secondary" onClick={applyDateFilter}>
                    Apply
                </Button>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    title="Total movements"
                    value={dashboard.totalMovements.toLocaleString()}
                    description="All stock movements recorded"
                />
                <StatCard
                    title="Net quantity"
                    value={dashboard.totalQuantity.toLocaleString()}
                    description="Sum of all stock quantities"
                />
                {Object.entries(dashboard.perReport)
                    .filter(([key]) => !['dashboard'].includes(key))
                    .slice(0, 4)
                    .map(([key, stat]) => (
                        <Link
                            key={key}
                            href={index.url({ current_team: team, report: key })}
                        >
                            <StatCard
                                title={reports[key] ?? key}
                                value={stat.movements.toLocaleString()}
                                description={`${stat.quantity.toLocaleString()} qty`}
                                clickable
                            />
                        </Link>
                    ))}
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Recent movements</CardTitle>
                    <CardDescription>
                        Latest stock movements across all report types.
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Item</TableHead>
                                <TableHead>Quantity</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>User</TableHead>
                                <TableHead>Received by</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {dashboard.recentMovements.length ? (
                                dashboard.recentMovements.map((row) => (
                                    <TableRow key={row.id}>
                                        <TableCell className="font-medium">
                                            {row.item}
                                        </TableCell>
                                        <TableCell
                                            className={
                                                row.quantity < 0
                                                    ? 'text-destructive'
                                                    : 'text-emerald-600 dark:text-emerald-400'
                                            }
                                        >
                                            {Math.abs(row.quantity).toLocaleString()}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="secondary" className="capitalize">
                                                {row.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>{row.user ?? '—'}</TableCell>
                                        <TableCell>{row.receivedBy ?? '—'}</TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell
                                        colSpan={5}
                                        className="py-10 text-center text-muted-foreground"
                                    >
                                        No stock movements found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}

function StockReport({
    active,
    report,
    rows,
    summary,
    filters,
    team,
}: {
    active: StockReportKey;
    report: { key: string; title: string };
    rows: Paginator;
    summary: { movements: number; quantity: number };
    filters: Filters;
    reports: Record<string, string>;
    team: string;
}) {
    const { printRef, handlePrint } = useReportPrint();
    const [search, setSearch] = useState(filters.q);
    const visit = (patch: Partial<Filters>) => {
        const next = { ...filters, ...patch };
        router.get(
            index.url({ current_team: team, report: report.key }),
            {
                q: next.q || undefined,
                from: next.from || undefined,
                to: next.to || undefined,
                perPage: next.perPage,
                group: next.group || undefined,
                page: next.page || undefined,
            },
            { preserveState: true, preserveScroll: true, replace: true },
        );
    }

    return (
        <StockReportLayout active={active}>
            <div className="flex w-full flex-col space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-3 no-print">
                    <Heading
                        variant="small"
                        title={report.title}
                        description="Stock movement details and quantities."
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
                    <StatCard
                        title="Movements"
                        value={summary.movements.toLocaleString()}
                        description="Total records in this report"
                    />
                    <StatCard
                        title="Net quantity"
                        value={summary.quantity.toLocaleString()}
                        description="Sum of quantities"
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
                    {report.key === 'correction' && (
                        <div className="space-y-1">
                            <Label>Quantity</Label>
                            <select
                                className="h-10 rounded-md border border-input bg-background px-3 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                value={filters.group ?? 'all'}
                                onChange={(event) =>
                                    visit({
                                        group: event.target.value,
                                        page: 1,
                                    })
                                }
                            >
                                <option value="all">All</option>
                                <option value="positive">Positive only</option>
                                <option value="negative">Negative only</option>
                            </select>
                        </div>
                    )}
                </div>
                <div ref={printRef} className="report-print-container">
                    <h2 className="mb-3 text-lg font-semibold">
                        {report.title} from {formatReportDate(filters.from)} to {formatReportDate(filters.to)}
                    </h2>
                    <Card>
                        <CardContent className="p-0">
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
                                        report.key === 'correction' ? (
                                            <>
                                                {(() => {
                                                    const positiveRows = rows.data.filter((r) => r.quantity > 0);
                                                    const negativeRows = rows.data.filter((r) => r.quantity <= 0);
                                                    return (
                                                        <>
                                                            {positiveRows.length > 0 && (
                                                                <TableRow className="bg-muted/50">
                                                                    <TableCell colSpan={6} className="font-semibold text-foreground">
                                                                        Positive Stock
                                                                    </TableCell>
                                                                </TableRow>
                                                            )}
                                                            {positiveRows.map((row) => (
                                                                <TableRow key={row.id}>
                                                                    <TableCell className="font-medium">
                                                                        {row.item}
                                                                    </TableCell>
                                                                    <TableCell className="text-emerald-600 dark:text-emerald-400">
                                                                        {Math.abs(row.quantity).toLocaleString()}
                                                                    </TableCell>
                                                                    <TableCell>{row.stockType}</TableCell>
                                                                    <TableCell>{row.receivedBy ?? '—'}</TableCell>
                                                                    <TableCell>{row.user ?? '—'}</TableCell>
                                                                    <TableCell>
                                                                        <Badge variant="secondary" className="capitalize">
                                                                            {row.status}
                                                                        </Badge>
                                                                    </TableCell>
                                                                </TableRow>
                                                            ))}
                                                            {negativeRows.length > 0 && (
                                                                <TableRow className="bg-muted/50">
                                                                    <TableCell colSpan={6} className="font-semibold text-foreground">
                                                                        Negative Stock
                                                                    </TableCell>
                                                                </TableRow>
                                                            )}
                                                            {negativeRows.map((row) => (
                                                                <TableRow key={row.id}>
                                                                    <TableCell className="font-medium">
                                                                        {row.item}
                                                                    </TableCell>
                                                                    <TableCell className="text-destructive">
                                                                        {'-'}{Math.abs(row.quantity).toLocaleString()}
                                                                    </TableCell>
                                                                    <TableCell>{row.stockType}</TableCell>
                                                                    <TableCell>{row.receivedBy ?? '—'}</TableCell>
                                                                    <TableCell>{row.user ?? '—'}</TableCell>
                                                                    <TableCell>
                                                                        <Badge variant="secondary" className="capitalize">
                                                                            {row.status}
                                                                        </Badge>
                                                                    </TableCell>
                                                                </TableRow>
                                                            ))}
                                                        </>
                                                    );
                                                })()}
                                            </>
                                        ) : (
                                            rows.data.map((row) => (
                                                <TableRow key={row.id}>
                                                    <TableCell className="font-medium">
                                                        {row.item}
                                                    </TableCell>
                                                    <TableCell
                                                        className={
                                                            row.quantity < 0
                                                                ? 'text-destructive'
                                                                : 'text-emerald-600 dark:text-emerald-400'
                                                        }
                                                    >
                                                        {Math.abs(row.quantity).toLocaleString()}
                                                    </TableCell>
                                                    <TableCell>{row.stockType}</TableCell>
                                                    <TableCell>
                                                        {row.receivedBy ?? '—'}
                                                    </TableCell>
                                                    <TableCell>{row.user ?? '—'}</TableCell>
                                                    <TableCell>
                                                        <Badge variant="secondary" className="capitalize">
                                                            {row.status}
                                                        </Badge>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )
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
                        </CardContent>
                    </Card>
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
        </StockReportLayout>
    );
}

function StatCard({
    title,
    value,
    description,
    clickable,
}: {
    title: string;
    value: string;
    description: string;
    clickable?: boolean;
}) {
    return (
        <Card
            className={clickable ? 'cursor-pointer hover:border-primary/50' : ''}
        >
            <CardHeader className="pb-2">
                <CardDescription>{title}</CardDescription>
                <CardTitle className="text-2xl">{value}</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-xs text-muted-foreground">{description}</p>
            </CardContent>
        </Card>
    );
}
