import { Head, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { FinancialReportLayout } from '@/components/financial-report-layout';
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
import { employeeDeduction } from '@/routes/reports';
import { exportMethod as exportReport } from '@/routes/reports/employee-deduction';

type PatientDeduction = {
    id: number;
    patientId: string;
    name: string;
    category: string | null;
    wallet: number;
    createdAt: string | null;
    updatedAt: string | null;
};
type Filters = {
    q: string;
    from: string;
    to: string;
    perPage: number;
    page?: number;
};
type Paginator = {
    data: PatientDeduction[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
};

export default function EmployeeDeductionReport({
    patients,
    summary,
    filters,
    currencySymbol,
}: {
    patients: Paginator;
    summary: { patients: number; walletBalance: number; walletTotal: number };
    filters: Filters;
    currencySymbol: string;
}) {
    const team = usePage().props.currentTeam?.slug ?? '';
    const { printRef, handlePrint } = useReportPrint();
    const [search, setSearch] = useState(filters.q);
    const [from, setFrom] = useState(filters.from);
    const [to, setTo] = useState(filters.to);
    const visit = (patch: Partial<Filters>) => {
        const next = { ...filters, ...patch };
        router.get(
            employeeDeduction.url(),
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

    return (
        <>
            <Head title="Employee deduction report" />
            <FinancialReportLayout active="employee-deduction">
                <div className="flex w-full flex-col space-y-6">
                    <div className="flex flex-wrap items-center justify-between gap-3 no-print">
                        <Heading
                            variant="small"
                            title="Employee deduction report"
                            description="Wallet deductions for employees with negative balances updated in the selected period."
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
                                    href={exportReport.url(team, {
                                        query: { ...filters, q: search },
                                    })}
                                >
                                    Export CSV
                                </a>
                            </Button>
                        </div>
                    </div>
                <div className="grid gap-3 sm:grid-cols-3 no-print">
                    <Summary
                        label="Employees with deductions"
                        value={summary.patients.toLocaleString()}
                    />
                    <Summary
                        label="Net deduction balance"
                        value={`${currencySymbol} ${summary.walletBalance.toLocaleString()}`}
                    />
                    <Summary
                        label="Total deduction amount"
                        value={`${currencySymbol} ${summary.walletTotal.toLocaleString()}`}
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
                            <Label htmlFor="employee-deduction-search">Search</Label>
                            <Input
                                id="employee-deduction-search"
                                value={search}
                                onChange={(event) =>
                                    setSearch(event.target.value)
                                }
                                placeholder="Search employees"
                            />
                        </div>
                        <Button type="submit" variant="secondary">
                            Search
                        </Button>
                    </form>
                    <div className="space-y-1">
                        <Label htmlFor="employee-deduction-from">From</Label>
                        <Input
                            id="employee-deduction-from"
                            type="date"
                            value={from}
                            onChange={(event) => setFrom(event.target.value)}
                        />
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="employee-deduction-to">To</Label>
                        <Input
                            id="employee-deduction-to"
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
                        Employee Deduction Report from {formatReportDate(from)} to {formatReportDate(to)}
                    </h2>
                    <div className="rounded-lg border bg-card">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Hospital No.</TableHead>
                                <TableHead>Employee</TableHead>
                                <TableHead>Category</TableHead>
                                <TableHead>Deduction</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {patients.data.length ? (
                                patients.data.map((patient) => (
                                    <TableRow key={patient.id}>
                                        <TableCell>
                                            {patient.patientId}
                                        </TableCell>
                                        <TableCell className="font-medium">
                                            {patient.name}
                                        </TableCell>
                                        <TableCell>
                                            {patient.category ?? '-'}
                                        </TableCell>
                                        <TableCell className="font-semibold text-destructive">
                                            {currencySymbol}{' '}
                                            {Math.abs(
                                                patient.wallet,
                                            ).toLocaleString()}
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell
                                        colSpan={4}
                                        className="py-10 text-center text-muted-foreground"
                                    >
                                        No employee deductions found for this period.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                        <tfoot className="border-t bg-muted/50 font-semibold">
                            <TableRow className="hover:bg-muted/50">
                                <TableCell colSpan={3}>Total Deduction</TableCell>
                                <TableCell>
                                    {currencySymbol}{' '}
                                    {summary.walletTotal.toLocaleString()}
                                </TableCell>
                            </TableRow>
                        </tfoot>
                    </Table>
                    </div>
                </div>
                <div className="no-print">
                    <Pagination
                        meta={{
                            currentPage: patients.current_page,
                            lastPage: patients.last_page,
                            perPage: patients.per_page,
                            total: patients.total,
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

function Summary({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-lg border bg-card p-4">
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="mt-1 text-2xl font-semibold">{value}</p>
        </div>
    );
}
