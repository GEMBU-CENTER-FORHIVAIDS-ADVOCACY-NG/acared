import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import BillingController from '@/actions/App/Http/Controllers/BillingController';
import ConfirmDialog from '@/components/confirm-dialog';
import Heading from '@/components/heading';
import Pagination from '@/components/pagination';
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
    const [from, setFrom] = useState(filters.from ?? '');
    const [to, setTo] = useState(filters.to ?? '');
    const [processing, setProcessing] = useState(false);
    const [toDelete, setToDelete] = useState<BillingListItem | null>(null);

    function applyFilters(patch: Partial<BillingFilters>) {
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
    }

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
                <div className="flex flex-wrap items-center justify-between gap-2">
                    <Heading
                        variant="small"
                        title="Billing history"
                        description="Paid billings and collected revenue."
                    />
                    <Button asChild data-test="record-payment">
                        <Link href={index(teamSlug).url}>Record payment</Link>
                    </Button>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-lg border p-4">
                        <p className="text-sm text-muted-foreground">
                            Collections ({summary.count})
                        </p>
                        <p className="text-2xl font-semibold">
                            {currencySymbol} {summary.total.toLocaleString()}
                        </p>
                    </div>
                </div>

                <div className="flex flex-wrap items-end gap-2">
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
                            placeholder="Search patient, cashier..."
                            className="w-72"
                            data-test="billing-search"
                        />
                        <Button type="submit" variant="secondary">
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
                </div>

                <div className="rounded-lg border">
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
                                        <TableCell className="capitalize">
                                            {billing.status}
                                        </TableCell>
                                        <TableCell>
                                            {billing.createdAt
                                                ? new Date(
                                                      billing.createdAt,
                                                  ).toLocaleString()
                                                : '—'}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                asChild
                                            >
                                                <Link
                                                    href={BillingController.show.url(
                                                        [
                                                            teamSlug ?? '',
                                                            billing.id,
                                                        ],
                                                    )}
                                                >
                                                    Receipt
                                                </Link>
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() =>
                                                    setToDelete(billing)
                                                }
                                            >
                                                Delete
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>

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
                destructive
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
