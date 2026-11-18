import { Head, Link, router, usePage } from '@inertiajs/react';
import { Banknote, Eye, MoreHorizontal, Trash2 } from 'lucide-react';
import { useCallback, useState } from 'react';
import BillingController from '@/actions/App/Http/Controllers/BillingController';
import ConfirmDialog from '@/components/confirm-dialog';
import Heading from '@/components/heading';
import Pagination from '@/components/pagination';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import { history, index } from '@/routes/billings';
import type {
    BillingFilters,
    BillingListItem,
    BillingPaginator,
    BillingSummary,
    Team,
} from '@/types';

type LayoutProps = {
    currentTeam?: Team | null;
};

const today = new Date().toISOString().split('T')[0];

const STATUS_BADGE: Record<string, string> = {
    paid: 'bg-emerald-100 text-emerald-800',
    billed: 'bg-amber-100 text-amber-800',
    scheduled: 'bg-sky-100 text-sky-800',
    started: 'bg-amber-100 text-amber-800',
    completed: 'bg-emerald-100 text-emerald-800',
};

export default function BillingHistory({
    currencySymbol,
    billings,
    filters,
    summary,
}: {
    currencySymbol: string;
    billings: BillingPaginator;
    filters: BillingFilters;
    summary: BillingSummary;
}) {
    const { currentTeam } = usePage().props;
    const teamSlug = currentTeam?.slug;

    const [search, setSearch] = useState(filters.q);
    const [from, setFrom] = useState(filters.from ?? today);
    const [to, setTo] = useState(filters.to ?? today);
    const [processing, setProcessing] = useState(false);
    const [toDelete, setToDelete] = useState<BillingListItem | null>(null);

    const applyFilters = useCallback(
        (patch: Partial<BillingFilters>) => {
            const next = { ...filters, page: 1, ...patch };

            router.get(
                history.url(teamSlug, {
                    query: {
                        q: next.q || undefined,
                        sort: next.sort,
                        direction: next.direction,
                        perPage: next.perPage,
                        from: next.from || undefined,
                        to: next.to || undefined,
                        page: next.page,
                    },
                }),
                {},
                { preserveState: true, preserveScroll: true, replace: true },
            );
        },
        [filters, teamSlug],
    );

    function toggleSort(column: string) {
        applyFilters({
            sort: column,
            direction:
                filters.sort === column && filters.direction === 'asc'
                    ? 'desc'
                    : 'asc',
        });
    }

    function deleteBilling() {
        if (!toDelete) {
            return;
        }

        setProcessing(true);

        router.delete(
            BillingController.destroy.url([teamSlug ?? '', toDelete.id]),
            {
                preserveScroll: true,
                onFinish: () => {
                    setProcessing(false);
                    setToDelete(null);
                },
            },
        );
    }

    function sortIndicator(column: string) {
        if (filters.sort !== column) {
            return null;
        }

        return (
            <span className="ml-1 text-xs">
                {filters.direction === 'asc' ? '▲' : '▼'}
            </span>
        );
    }

    return (
        <>
            <Head title="Billing history" />

            <div className="flex w-full flex-col space-y-6 p-4 md:p-6 lg:p-8">
                <div className="space-y-3">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                        <Heading
                            variant="small"
                            title="Billing history"
                            description="Paid billings and collected revenue."
                        />
                        <Button asChild data-test="record-payment">
                            <Link href={index(teamSlug).url}>Record payment</Link>
                        </Button>
                    </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                    <Card>
                        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Collections
                            </CardTitle>
                            <Banknote className="size-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-semibold tabular-nums">
                                {currencySymbol} {summary.total.toLocaleString()}
                            </div>
                            <p className="mt-1 text-xs text-muted-foreground">
                                {summary.count} billing{summary.count !== 1 ? 's' : ''}
                            </p>
                        </CardContent>
                    </Card>
                </div>

                <div className="flex flex-wrap items-end gap-2">
                    <form
                        className="flex flex-1 items-center gap-2"
                        onSubmit={(event) => {
                            event.preventDefault();
                            setFrom(today);
                            setTo(today);
                            applyFilters({ q: search, from: null, to: null });
                        }}
                    >
                        <Input
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            placeholder="Search patient, cashier..."
                            className="max-w-sm"
                            data-test="billing-search"
                        />
                        <Button type="submit">
                            Search
                        </Button>
                    </form>

                    <div className="flex items-end gap-2">
                        <div className="space-y-2">
                            <Label htmlFor="billing-from">From</Label>
                            <Input
                                id="billing-from"
                                type="date"
                                value={from}
                                onChange={(event) =>
                                    setFrom(event.target.value)
                                }
                                className="w-40"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="billing-to">To</Label>
                            <Input
                                id="billing-to"
                                type="date"
                                value={to}
                                onChange={(event) => setTo(event.target.value)}
                                className="w-40"
                            />
                        </div>
                        <Button
                            type="button"
                            onClick={() =>
                                applyFilters({
                                    from: from || null,
                                    to: to || null,
                                })
                            }
                        >
                            Apply
                        </Button>
                        <Button
                            type="button"
                            onClick={() => {
                                setFrom(today);
                                setTo(today);
                                applyFilters({
                                    from: null,
                                    to: null,
                                });
                            }}
                        >
                            Clear
                        </Button>
                    </div>
                </div>

                <Card>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>
                                        <button
                                            type="button"
                                            className="inline-flex items-center"
                                            onClick={() => toggleSort('patient_id')}
                                        >
                                            Patient ID
                                            {sortIndicator('patient_id')}
                                        </button>
                                    </TableHead>
                                    <TableHead>Patient</TableHead>
                                    <TableHead>Cashier</TableHead>
                                    <TableHead>Billable Type</TableHead>
                                    <TableHead>
                                        <button
                                            type="button"
                                            className="inline-flex items-center"
                                            onClick={() => toggleSort('total')}
                                        >
                                            Total
                                            {sortIndicator('total')}
                                        </button>
                                    </TableHead>
                                    <TableHead>
                                        <button
                                            type="button"
                                            className="inline-flex items-center"
                                            onClick={() => toggleSort('status')}
                                        >
                                            Status
                                            {sortIndicator('status')}
                                        </button>
                                    </TableHead>
                                    <TableHead>
                                        <button
                                            type="button"
                                            className="inline-flex items-center"
                                            onClick={() => toggleSort('created_at')}
                                        >
                                            Date
                                            {sortIndicator('created_at')}
                                        </button>
                                    </TableHead>
                                    <TableHead className="w-32 text-right">
                                        Actions
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {billings.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={8}
                                            className="py-10 text-center text-muted-foreground"
                                        >
                                            No billings found.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    billings.data.map((billing) => (
                                        <TableRow
                                            key={billing.id}
                                            data-test="billing-row"
                                        >
                                            <TableCell className="font-medium">
                                                {billing.patientId}
                                            </TableCell>
                                            <TableCell>
                                                {billing.patientName ?? '—'}
                                            </TableCell>
                                            <TableCell>
                                                {billing.cashierName ?? '—'}
                                            </TableCell>
                                            <TableCell>
                                                {billing.billableType ?? '—'}
                                            </TableCell>
                                            <TableCell>
                                                {billing.total.toLocaleString()}
                                            </TableCell>
                                            <TableCell>
                                                <Badge className={`${STATUS_BADGE[billing.status] ?? 'bg-muted text-muted-foreground'} capitalize`}>
                                                    {billing.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                {billing.createdAt
                                                    ? new Date(
                                                          billing.createdAt,
                                                      ).toLocaleString()
                                                    : '—'}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                        >
                                                            <MoreHorizontal className="size-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem asChild>
                                                            <Link
                                                                href={BillingController.show.url(
                                                                    [
                                                                        teamSlug ?? '',
                                                                        billing.id,
                                                                    ],
                                                                )}
                                                            >
                                                                <Eye className="mr-2 h-4 w-4" />
                                                                Receipt
                                                            </Link>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            disabled={billing.status === 'paid'}
                                                            onClick={() =>
                                                                setToDelete(billing)
                                                            }
                                                        >
                                                            <Trash2 className="mr-2 h-4 w-4" />
                                                            Delete
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                <Pagination
                    meta={{
                        currentPage: billings.current_page,
                        lastPage: billings.last_page,
                        perPage: billings.per_page,
                        total: billings.total,
                    }}
                    onPageChange={(page) => applyFilters({ page })}
                    onPerPageChange={(perPage) => applyFilters({ perPage })}
                />
            </div>

            <ConfirmDialog
                open={toDelete !== null}
                onOpenChange={(open) => {
                    if (!open) {
                        setToDelete(null);
                    }
                }}
                processing={processing}
                title={`Delete billing #${toDelete?.id ?? ''}?`}
                description="This removes the recorded payment. This cannot be undone."
                confirmLabel="Delete"
                onConfirm={deleteBilling}
            />
        </>
    );
}

BillingHistory.layout = (props: LayoutProps) => ({
    breadcrumbs: [
        {
            title: 'Billings',
            href: index(props.currentTeam?.slug),
        },
        {
            title: 'History',
            href: history(props.currentTeam?.slug).url,
        },
    ],
});
