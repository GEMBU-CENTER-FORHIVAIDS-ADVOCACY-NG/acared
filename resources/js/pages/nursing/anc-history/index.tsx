import { Head, Link, router, usePage } from '@inertiajs/react';
import { Eye, MoreHorizontal } from 'lucide-react';
import Heading from '@/components/heading';
import Pagination from '@/components/pagination';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SelectNative } from '@/components/ui/select-native';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { view } from '@/routes/nursing/records';
import type { NursingStatusOption, DoctorOption } from '@/types';

type RecordItem = {
    id: number;
    patientId: string;
    patientName: string | null;
    nurseId: number | null;
    nurseName: string | null;
    billingId: number;
    billingStatus: string | null;
    purpose: string | null;
    status: string;
    statusColor: string;
    createdAt: string | null;
};

type Paginator = {
    data: RecordItem[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
};

type Filters = {
    status: string;
    nurse_id: number | null;
    perPage: number;
    page: number;
};

const STATUS_BADGE: Record<string, string> = {
    warning: 'bg-amber-100 text-amber-800',
    info: 'bg-sky-100 text-sky-800',
    success: 'bg-emerald-100 text-emerald-800',
    danger: 'bg-rose-100 text-rose-800',
    gray: 'bg-muted text-muted-foreground',
};

export default function AncHistoryIndex({
    records,
    filters,
    statusOptions,
    nurseOptions,
}: {
    records: Paginator;
    filters: Filters;
    statusOptions: NursingStatusOption[];
    nurseOptions: DoctorOption[];
}) {
    const { currentTeam } = usePage().props;
    const teamSlug = currentTeam?.slug ?? '';

    function applyFilters(next: Partial<Filters>) {
        const merged = { ...filters, page: 1, ...next };

        const historyRoute = `/nursing/records/history`;

        router.get(
            historyRoute,
            {
                status: merged.status || undefined,
                nurse_id: merged.nurse_id ?? undefined,
                perPage: merged.perPage,
                page: merged.page,
            },
            { preserveState: true, preserveScroll: true, replace: true },
        );
    }

    return (
        <>
            <Head title="ANC History" />

            <div className="flex w-full flex-col space-y-6 p-4 md:p-6 lg:p-8">
                <div className="flex flex-wrap items-center justify-between gap-2">
                    <Heading
                        variant="small"
                        title="ANC History"
                        description="View past maternity nursing records."
                    />
                    <div className="flex items-center gap-2">
                        <SelectNative
                            value={filters.status}
                            onChange={(event) =>
                                applyFilters({ status: event.target.value })
                            }
                            className="w-40"
                            data-test="status-filter"
                        >
                            <option value="">All statuses</option>
                            {statusOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </SelectNative>
                        <SelectNative
                            value={filters.nurse_id ?? ''}
                            onChange={(event) =>
                                applyFilters({
                                    nurse_id: event.target.value
                                        ? Number(event.target.value)
                                        : null,
                                })
                            }
                            className="w-44"
                            data-test="nurse-filter"
                        >
                            <option value="">All nurses</option>
                            {nurseOptions.map((nurse) => (
                                <option key={nurse.id} value={nurse.id}>
                                    {nurse.name}
                                </option>
                            ))}
                        </SelectNative>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>All ANC records</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Patient</TableHead>
                                    <TableHead>Nurse</TableHead>
                                    <TableHead>Billing</TableHead>
                                    <TableHead>Purpose</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Created</TableHead>
                                    <TableHead className="text-right">
                                        Actions
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {records.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={7}
                                            className="py-10 text-center text-muted-foreground"
                                        >
                                            No ANC records found.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    records.data.map((row) => (
                                        <TableRow key={row.id}>
                                            <TableCell>
                                                <div className="font-medium">
                                                    {row.patientName ??
                                                        row.patientId}
                                                </div>
                                                <div className="text-xs text-muted-foreground">
                                                    {row.patientId}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {row.nurseName ?? '—'}
                                            </TableCell>
                                            <TableCell>
                                                #{row.billingId}{' '}
                                                {row.billingStatus &&
                                                    `· ${row.billingStatus}`}
                                            </TableCell>
                                            <TableCell className="max-w-64 truncate">
                                                {row.purpose ?? '—'}
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    className={
                                                        STATUS_BADGE[
                                                            row.statusColor
                                                        ] ?? STATUS_BADGE.gray
                                                    }
                                                >
                                                    {row.status.replace(
                                                        '_',
                                                        ' ',
                                                    )}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                {row.createdAt
                                                    ? new Date(
                                                          row.createdAt,
                                                      ).toLocaleDateString()
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
                                                                href={view.url({
                                                                    current_team: teamSlug,
                                                                    nursing: row.id,
                                                                })}
                                                            >
                                                                <Eye className="mr-2 h-4 w-4" />
                                                                View
                                                            </Link>
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
                        currentPage: records.current_page,
                        lastPage: records.last_page,
                        perPage: records.per_page,
                        total: records.total,
                    }}
                    onPageChange={(page) => applyFilters({ page })}
                    onPerPageChange={(perPage) => applyFilters({ perPage })}
                />
            </div>
        </>
    );
}

AncHistoryIndex.layout = (props: {
    currentTeam?: { slug: string } | null;
}) => ({
    breadcrumbs: [
        {
            title: 'ANC History',
            href: props.currentTeam
                ? `${props.currentTeam.slug}/nursing/records/history`
                : '/nursing/records/history',
        },
    ],
});
