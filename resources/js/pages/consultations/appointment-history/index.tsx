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
import { home } from '@/routes';
import { history, view } from '@/routes/consultations';
import type {
    ConsultationFilters,
    ConsultationPaginator,
    ConsultationStatusOption,
    DoctorOption,
} from '@/types';

type Props = {
    consultations: ConsultationPaginator;
    filters: ConsultationFilters;
    statusOptions: ConsultationStatusOption[];
    doctorOptions: DoctorOption[];
};

const STATUS_BADGE: Record<string, string> = {
    warning:
        'bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300',
    info: 'bg-sky-100 text-sky-800 dark:bg-sky-500/15 dark:text-sky-300',
    success:
        'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300',
    danger: 'bg-rose-100 text-rose-800 dark:bg-rose-500/15 dark:text-rose-300',
    gray: 'bg-muted text-muted-foreground',
};

export default function AppointmentHistoryIndex({
    consultations,
    filters,
    statusOptions,
    doctorOptions,
}: Props) {
    const { currentTeam } = usePage().props;
    const teamSlug = currentTeam?.slug;

    function applyFilters(next: Partial<ConsultationFilters>) {
        const merged = { ...filters, page: 1, ...next };

        router.get(
            history.url(teamSlug, {
                query: {
                    q: merged.q || undefined,
                    status: merged.status || undefined,
                    doctor_id: merged.doctor_id ?? undefined,
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
            <Head title="Appointment History" />

            <div className="flex w-full flex-col space-y-6 p-4 md:p-6 lg:p-8">
                <div className="flex flex-wrap items-center justify-between gap-2">
                    <Heading
                        variant="small"
                        title="Appointment History"
                        description="View past consultation records."
                    />
                    <div className="flex items-center gap-2">
                        <SelectNative
                            aria-label="Filter by status"
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
                            aria-label="Filter by doctor"
                            value={filters.doctor_id ?? ''}
                            onChange={(event) =>
                                applyFilters({
                                    doctor_id: event.target.value
                                        ? Number(event.target.value)
                                        : null,
                                })
                            }
                            className="w-44"
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

                <Card>
                    <CardHeader>
                        <CardTitle>All consultations</CardTitle>
                    </CardHeader>
                    <CardContent className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Hospital No.</TableHead>
                                    <TableHead>Patient</TableHead>
                                    <TableHead>Doctor</TableHead>
                                    <TableHead>Starts At</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Purpose</TableHead>
                                    <TableHead className="text-right">
                                        Action
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {consultations.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={7}
                                            className="py-10 text-center text-muted-foreground"
                                        >
                                            No consultations found.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    consultations.data.map((consultation) => (
                                        <TableRow key={consultation.id}>
                                            <TableCell className="font-medium">
                                                {consultation.patientId}
                                            </TableCell>
                                            <TableCell>
                                                {consultation.patientName ??
                                                    'Unknown patient'}
                                            </TableCell>
                                            <TableCell>
                                                {consultation.doctorName ?? '—'}
                                            </TableCell>
                                            <TableCell>
                                                {consultation.startsAt
                                                    ? new Date(
                                                          consultation.startsAt,
                                                      ).toLocaleString()
                                                    : '—'}
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    className={
                                                        STATUS_BADGE[
                                                            consultation
                                                                .statusColor
                                                        ] ?? STATUS_BADGE.gray
                                                    }
                                                >
                                                    {consultation.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="max-w-[12rem] truncate">
                                                {consultation.purpose ?? '—'}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger
                                                        asChild
                                                    >
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            aria-label={`Actions for ${consultation.patientId}`}
                                                        >
                                                            <MoreHorizontal className="size-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem
                                                            asChild
                                                        >
                                                            <Link
                                                                href={view.url({
                                                                    current_team:
                                                                        teamSlug,
                                                                    consultation:
                                                                        consultation.id,
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
                        currentPage: consultations.current_page,
                        lastPage: consultations.last_page,
                        perPage: consultations.per_page,
                        total: consultations.total,
                    }}
                    onPageChange={(page) => applyFilters({ page })}
                    onPerPageChange={(perPage) => applyFilters({ perPage })}
                />
            </div>
        </>
    );
}

AppointmentHistoryIndex.layout = (props: {
    currentTeam?: { slug: string } | null;
}) => ({
    breadcrumbs: [
        {
            title: 'Appointment History',
            href: props.currentTeam ? history.url(props.currentTeam.slug) : home.url(),
        },
    ],
});
