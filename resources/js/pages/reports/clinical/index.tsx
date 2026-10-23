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
import { exportMethod as exportReport, index } from '@/routes/reports/clinical';

type RecordRow = {
    id: number;
    patientId: string;
    patientName: string | null;
    doctor: string | null;
    notes: string;
    createdAt: string | null;
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

export default function ClinicalReport({
    report,
    records,
    filters,
    reports,
}: {
    report: { key: string; title: string; label: string };
    records: Paginator;
    filters: Filters;
    reports: Record<string, string>;
}) {
    const team = usePage().props.currentTeam?.slug ?? '';
    const { printRef, handlePrint } = useReportPrint();
    const [search, setSearch] = useState(filters.q);
    const [from, setFrom] = useState(filters.from);
    const [to, setTo] = useState(filters.to);
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
                    <Heading
                        variant="small"
                        title={report.title}
                        description={`Clinical ${report.label.toLowerCase()} records for this team.`}
                    />
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={handlePrint}>
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
                <div className="flex flex-wrap gap-2 no-print">
                    {Object.entries(reports).map(([key, title]) => (
                        <Button
                            key={key}
                            size="sm"
                            variant={key === report.key ? 'default' : 'outline'}
                            onClick={() =>
                                router.get(
                                    index.url({
                                        current_team: team,
                                        report: key,
                                    }),
                                    {},
                                    { preserveState: false },
                                )
                            }
                        >
                            {title}
                        </Button>
                    ))}
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
                            <Label htmlFor="clinical-search">Patient</Label>
                            <Input
                                id="clinical-search"
                                value={search}
                                onChange={(event) =>
                                    setSearch(event.target.value)
                                }
                                placeholder="Name or hospital number"
                            />
                        </div>
                        <Button type="submit" variant="secondary">
                            Search
                        </Button>
                    </form>
                    <div className="space-y-1">
                        <Label htmlFor="clinical-from">From</Label>
                        <Input
                            id="clinical-from"
                            type="date"
                            value={from}
                            onChange={(event) => setFrom(event.target.value)}
                        />
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="clinical-to">To</Label>
                        <Input
                            id="clinical-to"
                            type="date"
                            value={to}
                            onChange={(event) => setTo(event.target.value)}
                        />
                    </div>
                    <Button
                        variant="secondary"
                        onClick={() => visit({ from, to, page: 1 })}
                    >
                        Apply dates
                    </Button>
                </div>
                <div ref={printRef} className="report-print-container">
                    <h2 className="mb-3 text-lg font-semibold">
                        {report.title} from {formatReportDate(from)} to {formatReportDate(to)}
                    </h2>
                    <div className="rounded-lg border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Patient</TableHead>
                                <TableHead>Doctor</TableHead>
                                <TableHead>{report.label}</TableHead>
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
                                        No clinical records found for this
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
                            currentPage: records.current_page,
                            lastPage: records.last_page,
                            perPage: records.per_page,
                            total: records.total,
                        }}
                        onPageChange={(page) => visit({ page })}
                        onPerPageChange={(perPage) => visit({ perPage, page: 1 })}
                    />
                </div>
            </div>
        </>
    );
}
