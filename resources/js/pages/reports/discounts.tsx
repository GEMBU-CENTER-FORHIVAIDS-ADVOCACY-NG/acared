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
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
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
import {
    exportMethod as exportReport,
    index,
} from '@/routes/reports/discounts';

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

function formatReportDateLocal(value: string | null): string {
    if (!value) {
        return formatReportDate(null);
    }

    return formatReportDate(
        /^\d{4}-\d{2}-\d{2}$/.test(value) ? `${value}T00:00:00` : value,
    );
}

export default function Discounts({
    payments,
    summary,
    filters,
}: {
    payments: Paginator;
    summary: {
        count: number;
        discounts: number;
        discount100: number;
        discount50: number;
    };
    filters: Filters;
}) {
    const team = usePage().props.currentTeam?.slug ?? '';
    const { printRef, handlePrint } = useReportPrint();
    const [from, setFrom] = useState(filters.from);
    const [to, setTo] = useState(filters.to);
    const [discountType, setDiscountType] = useState(filters.discountType);
    const [isVisiting, setIsVisiting] = useState(false);
    const [isPrinting, setIsPrinting] = useState(false);
    const hasInvalidRange = Boolean(from && to && from > to);
    const visit = (patch: Partial<Filters>) => {
        const next = { ...filters, ...patch };
        if (next.from && next.to && next.from > next.to) {
            return;
        }

        setIsVisiting(true);
        router.get(
            index.url({ current_team: team }),
            {
                from: next.from || undefined,
                to: next.to || undefined,
                discountType: next.discountType || undefined,
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
        <>
            <Head title="Discount report" />
            <FinancialReportLayout active="discounts">
                <div className="flex w-full flex-col space-y-6">
                    <div className="no-print flex flex-wrap items-center justify-between gap-3">
                        <Heading
                            variant="small"
                            title="Discount report"
                            description="Discounts applied to patient payments filtered by discount percentage."
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
                                    href={exportReport.url(team, {
                                        query: {
                                            from: filters.from || undefined,
                                            to: filters.to || undefined,
                                            discountType:
                                                filters.discountType ||
                                                undefined,
                                            perPage: filters.perPage,
                                        },
                                    })}
                                >
                                    Export CSV
                                </a>
                            </Button>
                        </div>
                    </div>
                    <div className="no-print grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                        <StatCard
                            title="Total payments"
                            value={summary.count.toLocaleString()}
                        />
                        <StatCard
                            title="Total discounts"
                            value={summary.discounts.toLocaleString()}
                        />
                        <StatCard
                            title="100% discounts"
                            value={summary.discount100.toLocaleString()}
                        />
                        <StatCard
                            title="50% discounts"
                            value={summary.discount50.toLocaleString()}
                        />
                    </div>
                    <div className="no-print flex flex-wrap items-end gap-2">
                        <div className="space-y-1">
                            <Label htmlFor="discount-from">From</Label>
                            <Input
                                id="discount-from"
                                type="date"
                                value={from}
                                onChange={(event) =>
                                    setFrom(event.target.value)
                                }
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
                                onChange={(event) =>
                                    setDiscountType(event.target.value)
                                }
                            >
                                <option value="all">All</option>
                                <option value="100">100%</option>
                                <option value="50">50%</option>
                            </SelectNative>
                        </div>
                        <Button
                            onClick={() =>
                                visit({ from, to, discountType, page: 1 })
                            }
                            disabled={isVisiting || hasInvalidRange}
                        >
                            {isVisiting ? 'Applying…' : 'Apply'}
                        </Button>
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
                            Discount Report from {formatReportDateLocal(from)}{' '}
                            to {formatReportDateLocal(to)}
                        </h2>
                        <div className="rounded-lg border bg-card">
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
                                                    {payment.patientHospitalNo ??
                                                        '—'}
                                                </TableCell>
                                                <TableCell>
                                                    {payment.patient ?? '—'}
                                                </TableCell>
                                                <TableCell>
                                                    {payment.patientCategory ??
                                                        '—'}
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
                                                No discounts found for this
                                                period.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                                <TableFooter>
                                    <TableRow>
                                        <TableCell
                                            colSpan={5}
                                            className="font-medium"
                                        >
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
                    <div
                        className={`no-print ${isVisiting ? 'pointer-events-none opacity-60' : ''}`}
                        aria-busy={isVisiting}
                    >
                        <Pagination
                            meta={{
                                currentPage: payments.current_page,
                                lastPage: payments.last_page,
                                perPage: payments.per_page,
                                total: payments.total,
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
