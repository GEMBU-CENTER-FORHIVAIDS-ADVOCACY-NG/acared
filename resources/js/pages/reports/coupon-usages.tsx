import { Head, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { FinancialReportLayout } from '@/components/financial-report-layout';
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
import { exportMethod as exportReport, index } from '@/routes/reports/coupon-usages';

type Usage = {
    id: number;
    code: string | null;
    patientHospitalNo: string | null;
    patient: string | null;
    paymentMethod: string | null;
    user: string | null;
    discountAmount: number;
    createdAt: string | null;
};
type Filters = { from: string; to: string; perPage: number; page?: number };
type Paginator = {
    data: Usage[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
};

export default function CouponUsages({
    usages,
    summary,
    filters,
}: {
    usages: Paginator;
    summary: { usages: number; discounts: number };
    filters: Filters;
}) {
    const team = usePage().props.currentTeam?.slug ?? '';
    const { printRef, handlePrint } = useReportPrint();
    const [from, setFrom] = useState(filters.from);
    const [to, setTo] = useState(filters.to);
    const visit = (patch: Partial<Filters>) => {
        const next = { ...filters, ...patch };
        router.get(
            index.url(),
            {
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
            <Head title="Coupon usage report" />
            <FinancialReportLayout active="coupon-usages">
                <div className="flex w-full flex-col space-y-6">
                    <div className="flex flex-wrap items-center justify-between gap-3 no-print">
                        <Heading
                            variant="small"
                            title="Coupon usage report"
                            description="Coupon redemptions and discounts applied to patient payments."
                        />
                        <div className="flex gap-2">
                            <Button variant="outline" onClick={handlePrint}>
                                Print
                            </Button>
                            <Button variant="outline" asChild>
                                <a
                                    href={exportReport.url(team, {
                                        query: { ...filters, from, to },
                                    })}
                                >
                                    Export CSV
                                </a>
                            </Button>
                        </div>
                    </div>
                <div className="grid gap-3 sm:grid-cols-2 no-print">
                    <StatCard
                        title="Coupon uses"
                        value={summary.usages.toLocaleString()}
                    />
                    <StatCard
                        title="Discounts applied"
                        value={summary.discounts.toLocaleString()}
                    />
                </div>
                <div className="flex flex-wrap items-end gap-2 no-print">
                    <div className="space-y-1">
                        <Label htmlFor="coupon-from">From</Label>
                        <Input
                            id="coupon-from"
                            type="date"
                            value={from}
                            onChange={(event) => setFrom(event.target.value)}
                        />
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="coupon-to">To</Label>
                        <Input
                            id="coupon-to"
                            type="date"
                            value={to}
                            onChange={(event) => setTo(event.target.value)}
                        />
                    </div>
                    <Button
                        variant="secondary"
                        onClick={() => visit({ from, to, page: 1 })}
                    >
                        Apply
                    </Button>
                </div>
                <div ref={printRef} className="report-print-container">
                    <h2 className="mb-3 text-lg font-semibold">
                        Coupon Usage Report from {formatReportDate(from)} to {formatReportDate(to)}
                    </h2>
                    <div className="rounded-lg border bg-card">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Coupon</TableHead>
                                <TableHead>Hospital No.</TableHead>
                                <TableHead>Patient</TableHead>
                                <TableHead>Method</TableHead>
                                <TableHead>User</TableHead>
                                <TableHead>Discount</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {usages.data.length ? (
                                usages.data.map((usage) => (
                                    <TableRow key={usage.id}>
                                        <TableCell className="font-medium">
                                            {usage.code ?? 'Deleted coupon'}
                                        </TableCell>
                                        <TableCell>
                                            {usage.patientHospitalNo ?? '—'}
                                        </TableCell>
                                        <TableCell>
                                            {usage.patient ?? '—'}
                                        </TableCell>
                                        <TableCell>
                                            {usage.paymentMethod ?? '—'}
                                        </TableCell>
                                        <TableCell>
                                            {usage.user ?? '—'}
                                        </TableCell>
                                        <TableCell>
                                            {usage.discountAmount.toLocaleString()}
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell
                                        colSpan={6}
                                        className="py-10 text-center text-muted-foreground"
                                    >
                                        No coupon uses found for this period.
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
                            currentPage: usages.current_page,
                            lastPage: usages.last_page,
                            perPage: usages.per_page,
                            total: usages.total,
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
