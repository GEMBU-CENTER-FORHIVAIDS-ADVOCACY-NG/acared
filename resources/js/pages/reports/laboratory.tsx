import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import Heading from '@/components/heading';
import Pagination from '@/components/pagination';
import { useReportPrint } from '@/hooks/use-report-print';
import { formatReportDate } from '@/hooks/use-format-report-date';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
import { exportMethod as exportReport } from '@/routes/reports/laboratory';
import type { LabReportFilters, LaboratoryPaginator, Team } from '@/types';

type LayoutProps = {
    currentTeam?: Team | null;
};

export default function LaboratoryReport({
    currencySymbol,
    teamName,
    laboratories,
    filters,
    summary,
}: {
    currencySymbol: string;
    teamName: string;
    laboratories: LaboratoryPaginator;
    filters: LabReportFilters;
    summary: { total: number; count: number };
}) {
    const { currentTeam } = usePage<LayoutProps>().props;
    const teamSlug = currentTeam?.slug ?? '';
    const { printRef, handlePrint } = useReportPrint();
    const [search, setSearch] = useState(filters.q);
    const [from, setFrom] = useState(filters.from ?? '');
    const [to, setTo] = useState(filters.to ?? '');

    function applyFilters(patch: Partial<LabReportFilters>) {
        const next = { ...filters, page: 1, ...patch };

        router.get(
            `/${teamSlug}/reports/laboratory`,
            {
                q: next.q || undefined,
                from: next.from || undefined,
                to: next.to || undefined,
                perPage: next.perPage,
                page: next.page,
            },
            { preserveState: true, preserveScroll: true, replace: true },
        );
    }

    return (
        <>
            <Head title="Laboratory investigation" />

            <div className="flex w-full flex-col space-y-6 p-4 md:p-6 lg:p-8">
                <div className="flex flex-wrap items-center justify-between gap-3 no-print">
                    <Heading
                        title={`${teamName} clinical report`}
                        description="Laboratory investigation — submitted requests only."
                    />
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={handlePrint}>
                            Print
                        </Button>
                        <Button variant="outline" asChild>
                            <a
                                href={exportReport.url(teamSlug, {
                                    query: { q: search, from: from || null, to: to || null },
                                })}
                            >
                                Export CSV
                            </a>
                        </Button>
                    </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 no-print">
                    <StatCard
                        title="Submitted"
                        value={summary.count.toLocaleString()}
                        description="Total laboratory requests"
                    />
                    <StatCard
                        title="Total revenue"
                        value={`${currencySymbol} ${summary.total.toLocaleString()}`}
                        description="Revenue from submitted requests"
                    />
                </div>

                <div className="flex flex-wrap items-end gap-2 no-print">
                    <form
                        className="flex items-center gap-2"
                        onSubmit={(event) => {
                            event.preventDefault();
                            applyFilters({ q: search });
                        }}
                    >
                        <Input
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            placeholder="Search patient, consultant..."
                            className="w-72"
                        />
                        <Button type="submit" variant="secondary">
                            Search
                        </Button>
                    </form>
                    <div className="space-y-2">
                        <Label htmlFor="report-from">From</Label>
                        <Input
                            id="report-from"
                            type="date"
                            value={from}
                            onChange={(event) => setFrom(event.target.value)}
                            className="w-40"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="report-to">To</Label>
                        <Input
                            id="report-to"
                            type="date"
                            value={to}
                            onChange={(event) => setTo(event.target.value)}
                            className="w-40"
                        />
                    </div>
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={() =>
                            applyFilters({
                                from: from || null,
                                to: to || null,
                            })
                        }
                    >
                        Apply
                    </Button>
                </div>

                <div ref={printRef} className="report-print-container">
                    <h2 className="mb-3 text-lg font-semibold">
                        Laboratory Investigation Report from {formatReportDate(from)} to {formatReportDate(to)}
                    </h2>
                    <Card>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Hosp No.</TableHead>
                                        <TableHead>Patient</TableHead>
                                        <TableHead>Consultant</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Total</TableHead>
                                        <TableHead className="text-right">
                                            View
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {laboratories.data.length === 0 ? (
                                        <TableRow>
                                            <TableCell
                                                colSpan={6}
                                                className="py-8 text-center text-muted-foreground"
                                            >
                                                No submitted laboratory requests found.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        laboratories.data.map((lab) => (
                                            <TableRow key={lab.id}>
                                                <TableCell>{lab.patientId}</TableCell>
                                                <TableCell>
                                                    {lab.patientName ?? '—'}
                                                </TableCell>
                                                <TableCell>
                                                    {lab.doctorName ?? '—'}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="secondary" className="capitalize">
                                                        {lab.status}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    {currencySymbol}{' '}
                                                    {lab.total.toLocaleString()}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Button
                                                        asChild
                                                        size="sm"
                                                        variant="secondary"
                                                    >
                                                        <Link
                                                            href={`/${teamSlug}/laboratories/${lab.id}`}
                                                        >
                                                            Open
                                                        </Link>
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>

                <div className="no-print">
                    <Pagination
                        meta={{
                            currentPage: laboratories.current_page,
                            lastPage: laboratories.last_page,
                            perPage: laboratories.per_page,
                            total: laboratories.total,
                        }}
                        onPageChange={(page) => applyFilters({ page })}
                        onPerPageChange={(perPage) => applyFilters({ perPage })}
                    />
                </div>
            </div>
        </>
    );
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
