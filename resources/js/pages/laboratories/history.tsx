import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import ConfirmDialog from '@/components/confirm-dialog';
import Heading from '@/components/heading';
import Pagination from '@/components/pagination';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SelectNative } from '@/components/ui/select-native';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import type {
    LaboratoryFilters,
    LaboratoryListItem,
    LaboratoryPaginator,
    Team,
} from '@/types';

type LayoutProps = {
    currentTeam?: Team | null;
};

export default function LaboratoryHistory({
    currencySymbol,
    laboratories,
    filters,
    summary,
    statusOptions,
}: {
    currencySymbol: string;
    laboratories: LaboratoryPaginator;
    filters: LaboratoryFilters;
    summary: { total: number; count: number };
    statusOptions: { value: string; label: string }[];
}) {
    const { currentTeam } = usePage<LayoutProps>().props;
    const teamSlug = currentTeam?.slug ?? '';
    const [search, setSearch] = useState(filters.q);
    const [from, setFrom] = useState(filters.from ?? '');
    const [to, setTo] = useState(filters.to ?? '');
    const [toDelete, setToDelete] = useState<LaboratoryListItem | null>(null);
    const [processing, setProcessing] = useState(false);

    function baseUrl(path = '') {
        return `/${teamSlug}/laboratories${path}`;
    }

    function applyFilters(patch: Partial<LaboratoryFilters>) {
        const next = { ...filters, page: 1, ...patch };

        router.get(
            baseUrl('/history'),
            {
                q: next.q || undefined,
                patient_id: next.patientId || undefined,
                sort: next.sort,
                direction: next.direction,
                perPage: next.perPage,
                from: next.from || undefined,
                to: next.to || undefined,
                status: next.status || undefined,
                page: next.page,
            },
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

    function deleteLaboratory() {
        if (!toDelete) {
            return;
        }

        setProcessing(true);
        router.delete(baseUrl(`/${toDelete.id}`), {
            preserveScroll: true,
            onFinish: () => {
                setProcessing(false);
                setToDelete(null);
            },
        });
    }

    return (
        <>
            <Head title="Laboratory history" />

            <div className="flex w-full flex-col space-y-6 p-4 md:p-6 lg:p-8">
                <div className="flex flex-wrap items-center justify-between gap-2">
                    <Heading
                        variant="small"
                        title={
                            filters.patientId
                                ? `Laboratory history · ${filters.patientId}`
                                : 'Laboratory history'
                        }
                        description={
                            filters.patientId
                                ? 'Laboratory requests for this patient.'
                                : 'All laboratory requests for this facility.'
                        }
                    />
                    <Button asChild>
                        <Link href={baseUrl()}>Result entry</Link>
                    </Button>
                </div>

                <div className="rounded-lg border p-4">
                    <p className="text-sm text-muted-foreground">
                        Requests ({summary.count})
                    </p>
                    <p className="text-2xl font-semibold">
                        {currencySymbol} {summary.total.toLocaleString()}
                    </p>
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
                            placeholder="Search patient, doctor..."
                            className="w-72"
                        />
                        <Button type="submit" variant="secondary">
                            Search
                        </Button>
                    </form>

                    <div className="space-y-2">
                        <Label htmlFor="lab-status">Status</Label>
                        <SelectNative
                            id="lab-status"
                            value={filters.status}
                            onChange={(event) =>
                                applyFilters({ status: event.target.value })
                            }
                        >
                            {statusOptions.map((option) => (
                                <option
                                    key={option.value || 'all'}
                                    value={option.value}
                                >
                                    {option.label}
                                </option>
                            ))}
                        </SelectNative>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="lab-from">From</Label>
                        <Input
                            id="lab-from"
                            type="date"
                            value={from}
                            onChange={(event) => setFrom(event.target.value)}
                            className="w-40"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="lab-to">To</Label>
                        <Input
                            id="lab-to"
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

                <div className="rounded-lg border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>
                                    <button
                                        type="button"
                                        onClick={() => toggleSort('patient_id')}
                                    >
                                        Hosp No.
                                        {sortIndicator('patient_id')}
                                    </button>
                                </TableHead>
                                <TableHead>Patient</TableHead>
                                <TableHead>Request by</TableHead>
                                <TableHead>
                                    <button
                                        type="button"
                                        onClick={() => toggleSort('total')}
                                    >
                                        Total
                                        {sortIndicator('total')}
                                    </button>
                                </TableHead>
                                <TableHead>
                                    <button
                                        type="button"
                                        onClick={() => toggleSort('status')}
                                    >
                                        Status
                                        {sortIndicator('status')}
                                    </button>
                                </TableHead>
                                <TableHead>
                                    <button
                                        type="button"
                                        onClick={() => toggleSort('created_at')}
                                    >
                                        Created
                                        {sortIndicator('created_at')}
                                    </button>
                                </TableHead>
                                <TableHead className="text-right">
                                    Actions
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {laboratories.data.length === 0 ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={7}
                                        className="py-8 text-center text-muted-foreground"
                                    >
                                        No laboratory requests found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                laboratories.data.map((lab) => (
                                    <TableRow key={lab.id}>
                                        <TableCell>{lab.patientId}</TableCell>
                                        <TableCell>
                                            {lab.patientName ?? '—'}
                                        </TableCell>
                                        <TableCell>
                                            {lab.doctorName ?? '—'}
                                        </TableCell>
                                        <TableCell>
                                            {currencySymbol}{' '}
                                            {lab.total.toLocaleString()}
                                        </TableCell>
                                        <TableCell className="capitalize">
                                            {lab.status}
                                        </TableCell>
                                        <TableCell>
                                            {lab.createdAt
                                                ? new Date(
                                                      lab.createdAt,
                                                  ).toLocaleString()
                                                : '—'}
                                        </TableCell>
                                        <TableCell className="space-x-2 text-right">
                                            <Button
                                                asChild
                                                size="sm"
                                                variant="secondary"
                                            >
                                                <Link
                                                    href={baseUrl(`/${lab.id}`)}
                                                >
                                                    View
                                                </Link>
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="destructive"
                                                onClick={() => setToDelete(lab)}
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
                        currentPage: laboratories.current_page,
                        lastPage: laboratories.last_page,
                        perPage: laboratories.per_page,
                        total: laboratories.total,
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
                title="Delete laboratory request?"
                description="This removes the request, its lines, and linked billings."
                confirmLabel="Delete"
                processing={processing}
                onConfirm={deleteLaboratory}
            />
        </>
    );
}
