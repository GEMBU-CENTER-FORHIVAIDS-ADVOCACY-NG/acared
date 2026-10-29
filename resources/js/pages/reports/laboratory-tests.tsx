import { Head, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { ClinicalReportLayout } from '@/components/clinical-report-layout';
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
    TableFooter,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { exportMethod as exportReport, index } from '@/routes/reports/laboratory-tests';

type TestRow = {
    id: number;
    category: string;
    name: string;
    count: number;
    revenue: number;
    cost: number;
};

type Filters = {
    q: string;
    from: string;
    to: string;
    perPage: number;
};

type Summary = {
    testTypes: number;
    totalTests: number;
    totalRevenue: number;
    totalCost: number;
};

type Paginator = {
    data: TestRow[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
};

export default function LaboratoryTests({
    tests,
    summary,
    filters,
    currencySymbol,
}: {
    tests: Paginator;
    summary: Summary;
    filters: Filters;
    currencySymbol: string;
}) {
    const team = usePage().props.currentTeam?.slug ?? '';
    const { printRef, handlePrint } = useReportPrint();
    const [search, setSearch] = useState(filters.q);

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
                q: next.q || undefined,
                from: next.from || undefined,
                to: next.to || undefined,
                perPage: next.perPage,
                page: next.page || undefined,
            },
            { preserveState: true, preserveScroll: true, replace: true },
        );
    };

    return (
        <>
            <Head title="Laboratory tests report" />
            <ClinicalReportLayout active="laboratory-tests">
                <div className="flex w-full flex-col space-y-6">
                    <div className="flex flex-wrap items-center justify-between gap-3 no-print">
                        <Heading
                            variant="small"
                            title="Laboratory tests report"
                            description="Individual test items with their categories — submitted laboratory requests only."
                        />
                        <div className="flex gap-2">
                            <Button variant="outline" onClick={handlePrint}>
                                Print
                            </Button>
                            <Button variant="outline" asChild>
                                <a
                                    href={exportReport.url(
                                        { current_team: team },
                                        { query: { ...filters, q: search } },
                                    )}
                                >
                                    Export CSV
                                </a>
                            </Button>
                        </div>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 no-print">
                        <StatCard
                            title="Test types"
                            value={summary.testTypes.toLocaleString()}
                            description="Distinct tests performed"
                        />
                        <StatCard
                            title="Total tests"
                            value={summary.totalTests.toLocaleString()}
                            description="All tests performed"
                        />
                        <StatCard
                            title="Revenue"
                            value={money(summary.totalRevenue)}
                            description="Total revenue from tests"
                        />
                        <StatCard
                            title="Cost"
                            value={money(summary.totalCost)}
                            description="Total cost of tests"
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
                                <Label>Search</Label>
                                <Input
                                    value={search}
                                    onChange={(event) => setSearch(event.target.value)}
                                    placeholder="Search item or category..."
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
                                        from: event.target.value || '',
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
                                        to: event.target.value || '',
                                        page: 1,
                                    })
                                }
                            />
                        </div>
                    </div>

                    <div ref={printRef} className="report-print-container">
                        <h2 className="mb-3 text-lg font-semibold">
                            {reportTitle()} from {formatReportDate(filters.from)} to {formatReportDate(filters.to)}
                        </h2>
                        <Card>
                            <CardContent className="p-0">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>#</TableHead>
                                            <TableHead>Category</TableHead>
                                            <TableHead>Item</TableHead>
                                            <TableHead className="text-right">Times Performed</TableHead>
                                            <TableHead className="text-right">Revenue</TableHead>
                                            <TableHead className="text-right">Cost</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {tests.data.length === 0 ? (
                                            <TableRow>
                                                <TableCell
                                                    colSpan={6}
                                                    className="py-10 text-center text-muted-foreground"
                                                >
                                                    No laboratory tests found for this period.
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            tests.data.map((row, index) => (
                                                <TableRow key={row.id}>
                                                    <TableCell>
                                                        {(tests.current_page - 1) * tests.per_page + index + 1}
                                                    </TableCell>
                                                    <TableCell>
                                                        {row.category}
                                                    </TableCell>
                                                    <TableCell className="font-medium">
                                                        {row.name}
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        {row.count.toLocaleString()}
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        {money(row.revenue)}
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        {money(row.cost)}
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                    {tests.data.length > 0 && (
                                        <TableFooter>
                                            <TableRow className="font-semibold">
                                                <TableCell colSpan={3}>
                                                    TOTAL
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    {summary.totalTests.toLocaleString()}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    {money(summary.totalRevenue)}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    {money(summary.totalCost)}
                                                </TableCell>
                                            </TableRow>
                                        </TableFooter>
                                    )}
                                </Table>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="no-print">
                        <Pagination
                            meta={{
                                currentPage: tests.current_page,
                                lastPage: tests.last_page,
                                perPage: tests.per_page,
                                total: tests.total,
                            }}
                            onPageChange={(page) => visit({ page })}
                            onPerPageChange={(perPage) => visit({ perPage, page: 1 })}
                        />
                    </div>
                </div>
            </ClinicalReportLayout>
        </>
    );
}

function reportTitle(): string {
    return 'Laboratory tests report';
}

function StatCard({
    title,
    value,
    description,
}: {
    title: string;
    value: string;
    description: string;
}) {
    return (
        <Card>
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
