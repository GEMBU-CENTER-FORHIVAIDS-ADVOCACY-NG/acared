import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import {
    ClinicalReportLayout,
    type ClinicalReportKey,
} from '@/components/clinical-report-layout';
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
import { exportMethod as exportReport, index } from '@/routes/reports/clinical';
import { index as laboratoryTestsIndex } from '@/routes/reports/laboratory-tests';

type RecordRow = {
    id: number;
    patientId: string;
    patientName: string | null;
    doctor: string | null;
    notes: string;
    createdAt: string | null;
    type?: string;
};
type Filters = {
    q: string;
    from: string;
    to: string;
    perPage: number;
    page?: number;
};
type Paginator = {
    data: RecordRow[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
};
type DashboardData = {
    totalRecords: number;
    perReport: Record<string, { records: number }>;
    recentRecords: RecordRow[];
};

function formatReportDateLocal(value: string | null): string {
    if (!value) {
        return formatReportDate(null);
    }

    return formatReportDate(
        /^\d{4}-\d{2}-\d{2}$/.test(value) ? `${value}T00:00:00` : value,
    );
}

export default function ClinicalReportIndex({
    report,
    records,
    summary,
    filters,
    reports,
    dashboard,
}: {
    report: { key: string; title: string; label: string } | null;
    records?: Paginator;
    summary?: { records: number };
    filters: Filters;
    reports: Record<string, string>;
    dashboard?: DashboardData;
}) {
    const team = usePage().props.currentTeam?.slug ?? '';

    if (!report && dashboard) {
        return (
            <>
                <Head title="Clinical overview" />
                <ClinicalReportLayout active="dashboard">
                    <ClinicalDashboard
                        dashboard={dashboard}
                        reports={reports}
                        filters={filters}
                        team={team}
                    />
                </ClinicalReportLayout>
            </>
        );
    }

    // Redirect to standalone laboratory tests report
    if (report?.key === 'laboratory-tests') {
        router.get(
            laboratoryTestsIndex.url({ current_team: team }),
            {},
            { preserveState: true },
        );
        return null;
    }

    if (!report || !records || !summary) {
        return null;
    }

    return (
        <>
            <Head title={report.title} />
            <ClinicalReport
                active={report.key as ClinicalReportKey}
                report={report}
                records={records}
                summary={summary}
                filters={filters}
                reports={reports}
                team={team}
            />
        </>
    );
}

function ClinicalDashboard({
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
    const [isVisiting, setIsVisiting] = useState(false);
    const hasInvalidRange = Boolean(from && to && from > to);

    const applyDateFilter = () => {
        if (hasInvalidRange || isVisiting) {
            return;
        }

        setIsVisiting(true);
        router.get(
            index.url({ current_team: team }),
            {
                from: from || undefined,
                to: to || undefined,
            },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
                onFinish: () => setIsVisiting(false),
            },
        );
    };

    return (
        <div className="flex w-full flex-col space-y-6">
            <Heading
                variant="small"
                title="Clinical overview"
                description="Summary of all clinical records and recent activity."
            />

            <div className="flex flex-wrap items-end gap-2">
                <div className="space-y-1">
                    <Label htmlFor="clinical-dashboard-from">From</Label>
                    <Input
                        id="clinical-dashboard-from"
                        type="date"
                        value={from}
                        onChange={(event) => setFrom(event.target.value)}
                    />
                </div>
                <div className="space-y-1">
                    <Label htmlFor="clinical-dashboard-to">To</Label>
                    <Input
                        id="clinical-dashboard-to"
                        type="date"
                        value={to}
                        onChange={(event) => setTo(event.target.value)}
                    />
                </div>
                <Button
                    onClick={applyDateFilter}
                    disabled={isVisiting || hasInvalidRange}
                >
                    {isVisiting ? 'Applying…' : 'Apply'}
                </Button>
                {hasInvalidRange && (
                    <p role="alert" className="w-full text-xs text-destructive">
                        From date must be on or before to date.
                    </p>
                )}
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    title="Total records"
                    value={dashboard.totalRecords.toLocaleString()}
                    description="All clinical records"
                />
                {Object.entries(dashboard.perReport)
                    .filter(([key]) => !['dashboard'].includes(key))
                    .slice(0, 3)
                    .map(([key, stat]) => (
                        <Link
                            key={key}
                            href={index.url({
                                current_team: team,
                                report: key,
                            })}
                        >
                            <StatCard
                                title={reports[key] ?? key}
                                value={stat.records.toLocaleString()}
                                description={`${stat.records.toLocaleString()} records`}
                                clickable
                            />
                        </Link>
                    ))}
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Recent records</CardTitle>
                    <CardDescription>
                        Latest clinical records across all report types.
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Patient</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Doctor</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {dashboard.recentRecords.length ? (
                                    dashboard.recentRecords.map((row) => (
                                        <TableRow key={`${row.type}-${row.id}`}>
                                            <TableCell className="font-medium">
                                                {row.patientName ??
                                                    row.patientId}
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant="secondary"
                                                    className="capitalize"
                                                >
                                                    {row.type}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                {row.doctor ?? '—'}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell
                                            colSpan={3}
                                            className="py-10 text-center text-muted-foreground"
                                        >
                                            No clinical records found.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

function ClinicalReport({
    active,
    report,
    records,
    summary,
    filters,
    team,
}: {
    active: ClinicalReportKey;
    report: { key: string; title: string; label: string };
    records: Paginator;
    summary: { records: number };
    filters: Filters;
    reports: Record<string, string>;
    team: string;
}) {
    const { printRef, handlePrint } = useReportPrint();
    const [search, setSearch] = useState(filters.q);
    const [isVisiting, setIsVisiting] = useState(false);
    const [isPrinting, setIsPrinting] = useState(false);
    const hasInvalidRange = Boolean(
        filters.from && filters.to && filters.from > filters.to,
    );
    const visit = (patch: Partial<Filters>) => {
        const next = { ...filters, ...patch };
        if (next.from && next.to && next.from > next.to) {
            return;
        }

        setIsVisiting(true);
        router.get(
            index.url({ current_team: team, report: report.key }),
            {
                q: next.q || undefined,
                from: next.from || undefined,
                to: next.to || undefined,
                perPage: next.perPage,
                page: next.page || undefined,
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
        <ClinicalReportLayout active={active}>
            <div className="flex w-full flex-col space-y-6">
                <div className="no-print flex flex-wrap items-center justify-between gap-3">
                    <Heading
                        variant="small"
                        title={report.title}
                        description={`Clinical ${report.label.toLowerCase()} records for this team.`}
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
                                    { current_team: team, report: report.key },
                                    { query: { ...filters } },
                                )}
                            >
                                Export CSV
                            </a>
                        </Button>
                    </div>
                </div>
                <div className="no-print grid gap-3 sm:grid-cols-2">
                    <StatCard
                        title="Records"
                        value={summary.records.toLocaleString()}
                        description="Total records in this report"
                    />
                    <StatCard
                        title="Showing"
                        value={records.data.length.toLocaleString()}
                        description="Records on this page"
                    />
                </div>
                <div className="no-print flex flex-wrap items-end gap-2">
                    <form
                        className="flex items-end gap-2"
                        onSubmit={(event) => {
                            event.preventDefault();
                            visit({ q: search, page: 1 });
                        }}
                    >
                        <div className="space-y-1">
                            <Label htmlFor="clinical-report-patient">
                                Patient
                            </Label>
                            <Input
                                id="clinical-report-patient"
                                value={search}
                                onChange={(event) =>
                                    setSearch(event.target.value)
                                }
                                placeholder="Name or hospital number"
                            />
                        </div>
                        <Button
                            variant="secondary"
                            type="submit"
                            disabled={isVisiting}
                        >
                            {isVisiting ? 'Searching…' : 'Search'}
                        </Button>
                    </form>
                    <div className="space-y-1">
                        <Label htmlFor="clinical-report-from">From</Label>
                        <Input
                            id="clinical-report-from"
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
                        <Label htmlFor="clinical-report-to">To</Label>
                        <Input
                            id="clinical-report-to"
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
                        {report.title} from{' '}
                        {formatReportDateLocal(filters.from)} to{' '}
                        {formatReportDateLocal(filters.to)}
                    </h2>
                    <Card>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Patient</TableHead>
                                            <TableHead>Doctor</TableHead>
                                            <TableHead>
                                                {report.label}
                                            </TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {records.data.length ? (
                                            records.data.map((record) => (
                                                <TableRow key={record.id}>
                                                    <TableCell>
                                                        <div className="font-medium">
                                                            {record.patientName ??
                                                                record.patientId}
                                                        </div>
                                                        <div className="text-xs text-muted-foreground">
                                                            {record.patientId}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        {record.doctor ?? '—'}
                                                    </TableCell>
                                                    <TableCell className="max-w-2xl whitespace-pre-wrap">
                                                        {record.notes || '—'}
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell
                                                    colSpan={3}
                                                    className="py-10 text-center text-muted-foreground"
                                                >
                                                    No clinical records found
                                                    for this period.
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                </div>
                <div
                    className={`no-print ${isVisiting ? 'pointer-events-none opacity-60' : ''}`}
                    aria-busy={isVisiting}
                >
                    <Pagination
                        meta={{
                            currentPage: records.current_page,
                            lastPage: records.last_page,
                            perPage: records.per_page,
                            total: records.total,
                        }}
                        onPageChange={(page) => visit({ page })}
                        onPerPageChange={(perPage) =>
                            visit({ perPage, page: 1 })
                        }
                    />
                </div>
            </div>
        </ClinicalReportLayout>
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
            className={
                clickable ? 'cursor-pointer hover:border-primary/50' : ''
            }
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
