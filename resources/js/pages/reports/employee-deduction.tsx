import { Head, router, usePage } from '@inertiajs/react';
import { useRef, useState } from 'react';
import { FinancialReportLayout } from '@/components/financial-report-layout';
import Heading from '@/components/heading';
import Pagination from '@/components/pagination';
import { useReportPrint } from '@/hooks/use-report-print';
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
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { employeeDeduction } from '@/routes/reports';
import {
    exportMethod as exportReport,
    importMethod as importEmployeeDeductions,
} from '@/routes/reports/employee-deduction';

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
    const [isVisiting, setIsVisiting] = useState(false);
    const [isPrinting, setIsPrinting] = useState(false);
    const [isImporting, setIsImporting] = useState(false);
    const [importError, setImportError] = useState<string | null>(null);
    const importInput = useRef<HTMLInputElement>(null);
    const visit = (patch: Partial<Filters>) => {
        const next = { ...filters, ...patch };
        setIsVisiting(true);
        router.get(
            employeeDeduction.url({ current_team: team }),
            {
                q: next.q || undefined,
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
    const importDeductions = (file: File | undefined) => {
        if (!file) {
            return;
        }

        setImportError(null);
        setIsImporting(true);
        const payload = new FormData();
        payload.append('file', file);

        router.post(importEmployeeDeductions.url(team), payload, {
            forceFormData: true,
            preserveScroll: true,
            onError: (errors) =>
                setImportError(errors.file ?? 'Import failed.'),
            onFinish: () => {
                setIsImporting(false);
                if (importInput.current) {
                    importInput.current.value = '';
                }
            },
        });
    };

    return (
        <>
            <Head title="Employee deduction report" />
            <FinancialReportLayout active="employee-deduction">
                <div className="flex w-full flex-col space-y-6">
                    <div className="no-print flex flex-wrap items-center justify-between gap-3">
                        <Heading
                            variant="small"
                            title="Employee deduction report"
                            description="Wallet deductions for all employees with negative balances."
                        />
                        <div className="flex flex-wrap justify-end gap-2">
                            <Button
                                variant="outline"
                                onClick={printReport}
                                disabled={isPrinting}
                            >
                                {isPrinting ? 'Printing…' : 'Print'}
                            </Button>
                            <Button variant="outline" asChild>
                                <a
                                    href={exportReport.url(team, {
                                        query: {
                                            q: filters.q || undefined,
                                            perPage: filters.perPage,
                                        },
                                    })}
                                >
                                    Export CSV
                                </a>
                            </Button>
                            <input
                                ref={importInput}
                                type="file"
                                accept=".csv,.txt,.xlsx,.xls"
                                className="hidden"
                                aria-label="Import employee deduction CSV or Excel"
                                disabled={isImporting}
                                onChange={(event) =>
                                    importDeductions(event.target.files?.[0])
                                }
                            />
                            <Button
                                variant="outline"
                                onClick={() => importInput.current?.click()}
                                disabled={isImporting}
                            >
                                {isImporting
                                    ? 'Importing…'
                                    : 'Import CSV/Excel'}
                            </Button>
                            {importError && (
                                <p
                                    className="w-full text-xs text-destructive"
                                    role="alert"
                                >
                                    {importError}
                                </p>
                            )}
                        </div>
                    </div>
                    <div className="no-print grid gap-3 sm:grid-cols-3">
                        <StatCard
                            title="Employees with deductions"
                            value={summary.patients.toLocaleString()}
                        />
                        <StatCard
                            title="Net deduction balance"
                            value={`${currencySymbol} ${summary.walletBalance.toLocaleString()}`}
                        />
                        <StatCard
                            title="Total deduction amount"
                            value={`${currencySymbol} ${summary.walletTotal.toLocaleString()}`}
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
                                <Label htmlFor="employee-deduction-search">
                                    Search
                                </Label>
                                <Input
                                    id="employee-deduction-search"
                                    value={search}
                                    onChange={(event) =>
                                        setSearch(event.target.value)
                                    }
                                    placeholder="Search employees"
                                />
                            </div>
                            <Button type="submit" disabled={isVisiting}>
                                {isVisiting ? 'Searching…' : 'Search'}
                            </Button>
                        </form>
                    </div>
                    <div ref={printRef} className="report-print-container">
                        <h2 className="mb-3 text-lg font-semibold">
                            Employee Deduction Report
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
                                                No employee deductions found.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                                <tfoot className="border-t bg-muted/50 font-semibold">
                                    <TableRow className="hover:bg-muted/50">
                                        <TableCell colSpan={3}>
                                            Total Deduction
                                        </TableCell>
                                        <TableCell>
                                            {currencySymbol}{' '}
                                            {summary.walletTotal.toLocaleString()}
                                        </TableCell>
                                    </TableRow>
                                </tfoot>
                            </Table>
                        </div>
                    </div>
                    <div
                        className={`no-print ${isVisiting ? 'pointer-events-none opacity-60' : ''}`}
                        aria-busy={isVisiting}
                    >
                        <Pagination
                            meta={{
                                currentPage: patients.current_page,
                                lastPage: patients.last_page,
                                perPage: patients.per_page,
                                total: patients.total,
                            }}
                            onPageChange={(page) => visit({ page })}
                            onPerPageChange={(perPage) =>
                                visit({ perPage, page: 1 })
                            }
                        />
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
