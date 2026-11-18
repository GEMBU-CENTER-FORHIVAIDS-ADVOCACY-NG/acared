import { Head, Link, router, usePage } from '@inertiajs/react';
import { Eye, FileText, MoreHorizontal, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import ConfirmDialog from '@/components/confirm-dialog';
import Heading from '@/components/heading';
import Pagination from '@/components/pagination';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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

                <div className="grid gap-4 sm:grid-cols-2">
                    <Card>
                        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Requests
                            </CardTitle>
                            <FileText className="size-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-semibold tabular-nums">
                                {currencySymbol} {summary.total.toLocaleString()}
                            </div>
                            <p className="mt-1 text-xs text-muted-foreground">
                                {summary.count} request{summary.count !== 1 ? 's' : ''}
                            </p>
                        </CardContent>
                    </Card>
                </div>

                <div className="flex flex-wrap items-end gap-2">
                    <form
                        className="flex flex-1 items-center gap-2"
                        onSubmit={(event) => {
                            event.preventDefault();
                            setFrom('');
                            setTo('');
                            applyFilters({ q: search, from: null, to: null });
                        }}
                    >
                        <Input
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            placeholder="Search patient, doctor..."
                            className="max-w-sm"
                        />
                        <Button type="submit">
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

                <Card>
                    <CardContent className="p-0">
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
                                        <TableCell>
                                            <Badge variant="secondary" className="capitalize">
                                                {lab.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {lab.createdAt
                                                ? new Date(
                                                      lab.createdAt,
                                                  ).toLocaleString()
                                                : '—'}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                    >
                                                        <MoreHorizontal className="size-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem asChild>
                                                        <Link
                                                            href={baseUrl(
                                                                `/${lab.id}`,
                                                            )}
                                                        >
                                                            <Eye className="mr-2 h-4 w-4" />
                                                            View
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        disabled={lab.status ? ['paid', 'submitted', 'dispensed', 'completed', 'cancelled'].includes(lab.status) : false}
                                                        onClick={() =>
                                                            setToDelete(lab)
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
