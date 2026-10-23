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
import { SelectNative } from '@/components/ui/select-native';
import {
    Table,
    TableBody,
    TableCell,
    TableFooter,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { exportMethod as exportReport, index } from '@/routes/reports/discounts';

type Payment = {
    id: number;
    discountPercent: number;
    patientHospitalNo: string | null;
    patient: string | null;
    patientCategory: string | null;
    user: string | null;
    discountAmount: number;
    createdAt: string | null;
};
type Filters = {
    from: string;
    to: string;
    perPage: number;
    discountType: string;
    page?: number;
};
type Paginator = {
    data: Payment[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
};

export default function Discounts({
    payments,
    summary,
    filters,
}: {
    payments: Paginator;
    summary: { count: number; discounts: number; discount100: number; discount50: number };
    filters: Filters;
}) {
    const team = usePage().props.currentTeam?.slug ?? '';
    const { printRef, handlePrint } = useReportPrint();
    const [from, setFrom] = useState(filters.from);
    const [to, setTo] = useState(filters.to);
    const [discountType, setDiscountType] = useState(filters.discountType);
    const visit = (patch: Partial<Filters>) =>
        router.get(
            index.url(team, { query: { ...filters, ...patch } }),
            {},
            { preserveState: true, preserveScroll: true, replace: true },
        );

    return (
        <>
            <Head title="Discount report" />
            <div className="flex w-full flex-col space-y-6 p-4 md:p-6 lg:p-8">
                <div className="flex flex-wrap items-center justify-between gap-3 no-print">
                    <Heading
                        variant="small"
                        title="Discount report"
                        description="Discounts applied to patient payments filtered by discount percentage."
                    />
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={handlePrint}>
                            Print
                        </Button>
                        <Button variant="outline" asChild>
                            <a
                                href={exportReport.url(team, {
                                    query: { ...filters, from, to, discountType },
                                })}
                            >
                                Export CSV
                            </a>
                        </Button>
                    </div>
                </div>
                <div className="no-print">
                    <FinancialReportSwitcher active="discounts" />
                </div>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 no-print">
                    <Summary
                        label="Total payments"
                        value={summary.count.toLocaleString()}
                    />
                    <Summary
                        label="Total discounts"
                        value={summary.discounts.toLocaleString()}
                    />
                    <Summary
                        label="100% discounts"
                        value={summary.discount100.toLocaleString()}
                    />
                    <Summary
                        label="50% discounts"
                        value={summary.discount50.toLocaleString()}
                    />
                </div>
                <div className="flex flex-wrap items-end gap-2 no-print">
                    <div className="space-y-1">
                        <Label htmlFor="discount-from">From</Label>
                        <Input
                            id="discount-from"
                            type="date"
                            value={from}
                            onChange={(event) => setFrom(event.target.value)}
                        />
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="discount-to">To</Label>
                        <Input
                            id="discount-to"
                            type="date"
                            value={to}
                            onChange={(event) => setTo(event.target.value)}
                        />
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="discount-type">Discount type</Label>
                        <SelectNative
                            id="discount-type"
                            value={discountType}
                            onChange={(event) => setDiscountType(event.target.value)}
                        >
                            <option value="all">All</option>
                            <option value="100">100%</option>
                            <option value="50">50%</option>
                        </SelectNative>
                    </div>
                    <Button
                        variant="secondary"
                        onClick={() => visit({ from, to, discountType, page: 1 })}
                    >
                        Apply
                    </Button>
                </div>
                <div ref={printRef} className="report-print-container">
                    <h2 className="mb-3 text-lg font-semibold">
                        Discount Report from {formatReportDate(from)} to {formatReportDate(to)}
                    </h2>
                    <div className="rounded-lg border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Hospital No.</TableHead>
                                <TableHead>Patient</TableHead>
                                <TableHead>Category</TableHead>
                                <TableHead>Discount</TableHead>
                                <TableHead>User</TableHead>
                                <TableHead>Discount Amount</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {payments.data.length ? (
                                payments.data.map((payment) => (
                                    <TableRow key={payment.id}>
                                        <TableCell>
                                            {payment.patientHospitalNo ?? '—'}
                                        </TableCell>
                                        <TableCell>
                                            {payment.patient ?? '—'}
                                        </TableCell>
                                        <TableCell>
                                            {payment.patientCategory ?? '—'}
                                        </TableCell>
                                        <TableCell>
                                            {payment.discountPercent
                                                ? `${payment.discountPercent}%`
                                                : '—'}
                                        </TableCell>
                                        <TableCell>
                                            {payment.user ?? '—'}
                                        </TableCell>
                                        <TableCell>
                                            {payment.discountAmount.toLocaleString()}
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell
                                        colSpan={6}
                                        className="py-10 text-center text-muted-foreground"
                                    >
                                        No discounts found for this period.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                        <TableFooter>
                            <TableRow>
                                <TableCell colSpan={4} className="font-medium">
                                    Total
                                </TableCell>
                                <TableCell className="font-medium">
                                    {summary.discounts.toLocaleString()}
                                </TableCell>
                            </TableRow>
                        </TableFooter>
                    </Table>
                    </div>
                </div>
                <div className="no-print">
                    <Pagination
                        meta={{
                            currentPage: payments.current_page,
                            lastPage: payments.last_page,
                            perPage: payments.per_page,
                            total: payments.total,
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
