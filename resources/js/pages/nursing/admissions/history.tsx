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
import { Input } from '@/components/ui/input';
import { SelectNative } from '@/components/ui/select-native';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { history as admissionsHistory } from '@/routes/nursing/admissions';
import { view } from '@/routes/nursing/ward-rounds';
import type { DoctorOption } from '@/types';

type AdmissionItem = {
    id: number;
    patientId: string;
    patientName: string | null;
    doctorName: string | null;
    wardName: string | null;
    bedName: string | null;
    status: string;
    admittedAt: string | null;
    dischargedAt: string | null;
    notes: string | null;
};

type AdmissionPaginator = {
    data: AdmissionItem[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
};

type AdmissionFilters = {
    status: string;
    doctor_id: number | null;
    ward_id: number | null;
    search: string;
    page?: number;
    perPage?: number;
};

type StatusOption = {
    value: string;
    label: string;
};

const STATUS_BADGE: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-800',
    admitted: 'bg-sky-100 text-sky-800',
    discharged: 'bg-emerald-100 text-emerald-800',
};

export default function AdmissionHistory({
    admissions,
    filters,
    statusOptions,
    doctorOptions,
    wardOptions,
}: {
    admissions: AdmissionPaginator;
    filters: AdmissionFilters;
    statusOptions: StatusOption[];
    doctorOptions: DoctorOption[];
    wardOptions: { id: number; name: string }[];
}) {
    const { currentTeam } = usePage().props;
    const teamSlug = currentTeam?.slug ?? '';

    function applyFilters(next: Partial<AdmissionFilters>) {
        const merged = { ...filters, page: 1, ...next };

        router.get(
            admissionsHistory.url(teamSlug, {
                query: {
                    status: merged.status || undefined,
                    doctor_id: merged.doctor_id ?? undefined,
                    ward_id: merged.ward_id ?? undefined,
                    search: merged.search || undefined,
                    perPage: merged.perPage,
                    page: merged.page,
                },
            }),
            {},
            { preserveState: true, preserveScroll: true, replace: true },
        );
    }

    return (
        <>
            <Head title="Admission History" />

            <div className="flex w-full flex-col space-y-6 p-4 md:p-6 lg:p-8">
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <Heading
                            variant="small"
                            title="Admission History"
                            description="View past admissions."
                        />
                    </div>
                    <div className="flex items-center justify-between gap-2">
                        <Input
                            type="text"
                            placeholder="Search hospital no or name..."
                            value={filters.search}
                            onChange={(event) =>
                                applyFilters({ search: event.target.value })
                            }
                            className="w-56"
                            data-test="search"
                        />
                        <div className="flex items-center gap-2">
                            <SelectNative
                                value={filters.ward_id ?? ''}
                                onChange={(event) =>
                                    applyFilters({
                                        ward_id: event.target.value
                                            ? Number(event.target.value)
                                            : null,
                                    })
                                }
                                className="w-36"
                                data-test="ward-filter"
                            >
                                <option value="">All wards</option>
                                {wardOptions.map((ward) => (
                                    <option key={ward.id} value={ward.id}>
                                        {ward.name}
                                    </option>
                                ))}
                            </SelectNative>
                            <SelectNative
                                value={filters.status}
                                onChange={(event) =>
                                    applyFilters({ status: event.target.value })
                                }
                                className="w-36"
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
                                value={filters.doctor_id ?? ''}
                                onChange={(event) =>
                                    applyFilters({
                                        doctor_id: event.target.value
                                            ? Number(event.target.value)
                                            : null,
                                    })
                                }
                                className="w-40"
                                data-test="doctor-filter"
                            >
                                <option value="">All doctors</option>
                                {doctorOptions.map((doctor) => (
                                    <option key={doctor.id} value={doctor.id}>
                                        {doctor.name}
                                    </option>
                                ))}
                            </SelectNative>
                        </div>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>All admissions</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Hospital No.</TableHead>
                                    <TableHead>Patient</TableHead>
                                    <TableHead>Doctor</TableHead>
                                    <TableHead>Ward</TableHead>
                                    <TableHead>Bed</TableHead>
                                    <TableHead>Admitted At</TableHead>
                                    <TableHead>Discharged At</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">
                                        Action
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {admissions.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={9}
                                            className="py-10 text-center text-muted-foreground"
                                        >
                                            No admissions found.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    admissions.data.map((admission) => (
                                        <TableRow key={admission.id}>
                                            <TableCell className="font-medium">
                                                {admission.patientId}
                                            </TableCell>
                                            <TableCell>
                                                {admission.patientName ??
                                                    'Unknown patient'}
                                            </TableCell>
                                            <TableCell>
                                                {admission.doctorName ?? '—'}
                                            </TableCell>
                                            <TableCell>
                                                {admission.wardName ?? '—'}
                                            </TableCell>
                                            <TableCell>
                                                {admission.bedName ?? '—'}
                                            </TableCell>
                                            <TableCell>
                                                {admission.admittedAt
                                                    ? new Date(
                                                          admission.admittedAt,
                                                      ).toLocaleString()
                                                    : '—'}
                                            </TableCell>
                                            <TableCell>
                                                {admission.dischargedAt
                                                    ? new Date(
                                                          admission.dischargedAt,
                                                      ).toLocaleString()
                                                    : '—'}
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    className={
                                                        STATUS_BADGE[
                                                            admission.status
                                                        ] ??
                                                        'bg-muted text-muted-foreground'
                                                    }
                                                >
                                                    {admission.status}
                                                </Badge>
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
                                                                href={view.url({
                                                                    current_team:
                                                                        teamSlug,
                                                                    admission:
                                                                        admission.id,
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
                        currentPage: admissions.current_page,
                        lastPage: admissions.last_page,
                        perPage: admissions.per_page,
                        total: admissions.total,
                    }}
                    onPageChange={(page) => applyFilters({ page })}
                    onPerPageChange={(perPage) => applyFilters({ perPage })}
                />
            </div>
        </>
    );
}

AdmissionHistory.layout = (props: {
    currentTeam?: { slug: string } | null;
}) => ({
    breadcrumbs: [
        {
            title: 'Admission History',
            href: props.currentTeam
                ? admissionsHistory.url(props.currentTeam.slug)
                : '/',
        },
    ],
});
