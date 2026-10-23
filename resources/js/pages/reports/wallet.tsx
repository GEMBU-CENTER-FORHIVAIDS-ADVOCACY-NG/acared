import { Head, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { FinancialReportSwitcher } from '@/components/financial-report-switcher';
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
import { wallet } from '@/routes/reports';
import { exportMethod as exportReport } from '@/routes/reports/wallet';

type PatientBalance = {
    id: number;
    patientId: string;
    name: string;
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
    data: PatientBalance[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
};

export default function WalletReport({
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
    const visit = (patch: Partial<Filters>) =>
        router.get(
            wallet.url(team, { query: { ...filters, ...patch } }),
            {},
            { preserveState: true, preserveScroll: true, replace: true },
        );

    return (
        <>
            <Head title="Wallet report" />
            <div className="flex w-full flex-col space-y-6 p-4 md:p-6 lg:p-8">
                <div className="flex flex-wrap items-center justify-between gap-3 no-print">
                    <Heading
                        variant="small"
                        title="Wallet report"
                        description="Current patient wallet balances for patients updated in the selected period."
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
                <div className="no-print">
                    <FinancialReportSwitcher active="wallet" />
                </div>
                <div className="grid gap-3 sm:grid-cols-2 no-print">
                    <Summary
                        label="Patients with balances"
                        value={summary.patients.toLocaleString()}
                    />
                    <Summary
                        label="Net wallet balance"
                        value={`${currencySymbol} ${summary.walletBalance.toLocaleString()}`}
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
                            <Label htmlFor="wallet-report-search">
                                Hospital No. or patient
                            </Label>
                            <Input
                                id="wallet-report-search"
                                value={search}
                                onChange={(event) =>
                                    setSearch(event.target.value)
                                }
                                placeholder="Search patients"
                            />
                        </div>
                        <Button type="submit" variant="secondary">
                            Search
                        </Button>
                    </form>
                    <div className="space-y-1">
                        <Label htmlFor="wallet-report-from">From</Label>
                        <Input
                            id="wallet-report-from"
                            type="date"
                            value={from}
                            onChange={(event) => setFrom(event.target.value)}
                        />
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="wallet-report-to">To</Label>
                        <Input
                            id="wallet-report-to"
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
                        Wallet Report from {formatReportDate(from)} to {formatReportDate(to)}
                    </h2>
                    <div className="rounded-lg border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Hospital No.</TableHead>
                                <TableHead>Patient</TableHead>
                                <TableHead>Wallet</TableHead>
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
                                        <TableCell
                                            className={
                                                patient.wallet < 0
                                                    ? 'font-semibold text-destructive'
                                                    : 'font-semibold text-emerald-700'
                                            }
                                        >
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
                                        colSpan={3}
                                        className="py-10 text-center text-muted-foreground"
                                    >
                                        No patient wallet balances found for
                                        this period.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                        <tfoot className="border-t bg-muted/50 font-semibold">
                            <TableRow className="hover:bg-muted/50">
                                <TableCell colSpan={2}>Total</TableCell>
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
