import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    ArchiveX,
    CircleCheck,
    Clock,
    PackageX,
    RotateCcw,
    Search,
} from 'lucide-react';
import { useState } from 'react';
import { Breadcrumbs } from '@/components/breadcrumbs';
import ConfirmDialog from '@/components/confirm-dialog';
import Heading from '@/components/heading';
import Pagination from '@/components/pagination';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
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
import type { Team } from '@/types';
import {
    create as createRoute,
    destroy as destroyRoute,
    index as prescriptionsIndex,
    show as showRoute,
} from '@/routes/pharmacy/prescriptions';
import { destroy as bulkDestroyRoute } from '@/routes/pharmacy/prescriptions/bulk';

type Prescription = {
    id: number;
    patientSlug: string;
    patientName: string | null;
    doctorName: string | null;
    total: number;
    status: string;
    linesCount: number;
    createdAt: string | null;
};

const STATUS_STYLES: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-700',
    paid: 'bg-sky-100 text-sky-700',
    billed: 'bg-orange-100 text-orange-700',
    dispensed: 'bg-emerald-100 text-emerald-700',
    refunded: 'bg-red-100 text-red-700',
    cancelled: 'bg-slate-100 text-slate-600',
};

export default function PrescriptionsIndex({
    currencySymbol,
    prescriptions,
    filters,
    summary,
    periodOptions,
}: {
    currencySymbol: string;
    prescriptions: {
        data: Prescription[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    filters: { q: string; status: string; perPage: number; period: string };
    periodOptions: { value: string; label: string }[];
    summary: {
        total: number;
        pending: number;
        billed: number;
        paid: number;
        dispensed: number;
        refunded: number;
    };
}) {
    const { currentTeam } = usePage<{ currentTeam?: Team | null }>().props;
    const teamSlug = currentTeam?.slug ?? '';
    const [search, setSearch] = useState(filters.q);
    const [status, setStatus] = useState(filters.status);
    const [period, setPeriod] = useState(filters.period);
    const [deleting, setDeleting] = useState<Prescription | null>(null);
    const [selected, setSelected] = useState<number[]>([]);
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    function applyFilters(next: {
        q?: string;
        status?: string;
        period?: string;
        perPage?: number;
        page?: number;
    }) {
        router.get(
            prescriptionsIndex.url(teamSlug),
            {
                q: (next.q ?? filters.q) || undefined,
                status: next.status ?? filters.status,
                period: next.period ?? filters.period,
                perPage: next.perPage ?? filters.perPage,
                page: next.page ?? 1,
            },
            { preserveState: true, preserveScroll: true, replace: true },
        );
    }

    function deletePrescription() {
        if (!deleting) {
            return;
        }
        setProcessing(true);
        router.delete(
            destroyRoute.url({
                current_team: teamSlug,
                prescription: deleting.id,
            }),
            {
                preserveScroll: true,
                onSuccess: () => setDeleting(null),
                onError: (errors) =>
                    setError(
                        Object.values(errors)[0] ??
                            'Prescription could not be deleted.',
                    ),
                onFinish: () => setProcessing(false),
            },
        );
    }

    const cards = [
        { label: 'Total', value: summary.total, icon: ArchiveX },
        { label: 'Pending', value: summary.pending, icon: Clock },
        { label: 'Billed', value: summary.billed, icon: CircleCheck },
        { label: 'Paid', value: summary.paid, icon: CircleCheck },
        { label: 'Dispensed', value: summary.dispensed, icon: PackageX },
        { label: 'Refunded', value: summary.refunded, icon: RotateCcw },
    ];

    return (
        <>
            <Head title="Prescriptions" />
            <div className="flex w-full flex-col space-y-6 p-4 md:p-6 lg:p-8">
                <div className="space-y-3">
                    <Breadcrumbs
                        breadcrumbs={[
                            {
                                title: 'Pharmacy',
                                href: prescriptionsIndex(teamSlug),
                            },
                            {
                                title: 'Prescriptions',
                                href: prescriptionsIndex(teamSlug),
                            },
                        ]}
                    />
                    <div className="flex flex-wrap items-start justify-between gap-4">
                        <Heading
                            title="Prescriptions"
                            description="Review, create, dispense, and refund patient prescriptions."
                        />
                        <Button asChild>
                            <Link href={createRoute.url(teamSlug)}>
                                Create prescription
                            </Link>
                        </Button>
                    </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
                    {cards.map(({ label, value, icon: Icon }) => (
                        <Card key={label}>
                            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">
                                    {label}
                                </CardTitle>
                                <Icon className="size-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-semibold tabular-nums">
                                    {value}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>



                <Card>
                    <CardHeader className="gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="space-y-1">
                            <CardTitle>Prescription records</CardTitle>
                            <CardDescription>
                                Search by hospital number, patient name, or
                                prescriber.
                            </CardDescription>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <Input
                                className="w-full sm:w-64"
                                value={search}
                                placeholder="Search prescriptions"
                                onChange={(event) =>
                                    setSearch(event.target.value)
                                }
                                onKeyDown={(event) => {
                                    if (event.key === 'Enter') {
                                        applyFilters({ q: search });
                                    }
                                }}
                            />
                            <SelectNative
                                className="w-full sm:w-44"
                                value={status}
                                onChange={(event) => {
                                    setStatus(event.target.value);
                                    applyFilters({
                                        status: event.target.value,
                                    });
                                }}
                            >
                                <option value="all">All statuses</option>
                                <option value="pending">Pending</option>
                                <option value="billed">Billed</option>
                                <option value="paid">Paid</option>
                                <option value="dispensed">Dispensed</option>
                                <option value="refunded">Refunded</option>
                            </SelectNative>
                            <Button
                                variant="secondary"
                                onClick={() => applyFilters({ q: search })}
                            >
                                <Search className="mr-2 size-4" />
                                Search
                            </Button>
                        </div>
                    </CardHeader>
                    {selected.length > 0 ? (
                        <div className="flex flex-wrap items-center justify-between gap-3 border-y bg-muted/40 px-6 py-3">
                            <p className="text-sm text-muted-foreground">
                                {selected.length} selected
                            </p>
                            <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => {
                                    setProcessing(true);
                                    router.delete(
                                        bulkDestroyRoute.url(teamSlug),
                                        {
                                            data: { ids: selected },
                                            preserveScroll: true,
                                            onSuccess: () => setSelected([]),
                                            onError: (errors) =>
                                                setError(
                                                    Object.values(errors)[0] ??
                                                        'Records could not be deleted.',
                                                ),
                                            onFinish: () =>
                                                setProcessing(false),
                                        },
                                    );
                                }}
                            >
                                Delete selected
                            </Button>
                        </div>
                    ) : null}
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>
                                            <input
                                                type="checkbox"
                                                aria-label="Select all on page"
                                                checked={
                                                    prescriptions.data.length >
                                                        0 &&
                                                    selected.length ===
                                                        prescriptions.data
                                                            .length
                                                }
                                                onChange={(event) =>
                                                    setSelected(
                                                        event.target.checked
                                                            ? prescriptions.data.map(
                                                                  (item) =>
                                                                      item.id,
                                                              )
                                                            : [],
                                                    )
                                                }
                                            />
                                        </TableHead>
                                        <TableHead>Hospital No.</TableHead>
                                        <TableHead>Patient</TableHead>
                                        <TableHead>Prescribed By</TableHead>
                                        <TableHead>Items</TableHead>
                                        <TableHead>Total</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Date</TableHead>
                                        <TableHead className="text-right">
                                            Actions
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {prescriptions.data.length === 0 ? (
                                        <TableRow>
                                            <TableCell
                                                colSpan={9}
                                                className="py-8 text-center text-muted-foreground"
                                            >
                                                No prescriptions found.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        prescriptions.data.map((item) => (
                                            <TableRow key={item.id}>
                                                <TableCell>
                                                    <input
                                                        type="checkbox"
                                                        checked={selected.includes(
                                                            item.id,
                                                        )}
                                                        onChange={(event) =>
                                                            setSelected(
                                                                event.target
                                                                    .checked
                                                                    ? [
                                                                          ...selected,
                                                                          item.id,
                                                                      ]
                                                                    : selected.filter(
                                                                          (
                                                                              id,
                                                                          ) =>
                                                                              id !==
                                                                              item.id,
                                                                      ),
                                                            )
                                                        }
                                                    />
                                                </TableCell>
                                                <TableCell className="font-medium">
                                                    {item.patientSlug}
                                                </TableCell>
                                                <TableCell>
                                                    {item.patientName ?? '—'}
                                                </TableCell>
                                                <TableCell>
                                                    {item.doctorName ?? '—'}
                                                </TableCell>
                                                <TableCell>
                                                    {item.linesCount}
                                                </TableCell>
                                                <TableCell>
                                                    {currencySymbol}{' '}
                                                    {item.total.toLocaleString()}
                                                </TableCell>
                                                <TableCell>
                                                    <span
                                                        className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium capitalize ${STATUS_STYLES[item.status] ?? 'bg-slate-100 text-slate-600'}`}
                                                    >
                                                        {item.status}
                                                    </span>
                                                </TableCell>
                                                <TableCell>
                                                    {item.createdAt
                                                        ? new Date(
                                                              item.createdAt,
                                                          ).toLocaleDateString()
                                                        : '—'}
                                                </TableCell>
                                                <TableCell className="space-x-2 text-right">
                                                    <Button
                                                        size="sm"
                                                        variant="secondary"
                                                        asChild
                                                    >
                                                        <Link
                                                            href={showRoute.url(
                                                                {
                                                                    current_team:
                                                                        teamSlug,
                                                                    prescription:
                                                                        item.id,
                                                                },
                                                            )}
                                                        >
                                                            View
                                                        </Link>
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="destructive"
                                                        disabled={[
                                                            'paid',
                                                            'dispensed',
                                                            'refunded',
                                                        ].includes(item.status)}
                                                        onClick={() => {
                                                            setError(null);
                                                            setDeleting(item);
                                                        }}
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
                    </CardContent>
                    <div className="border-t px-4 py-3">
                        <Pagination
                            meta={{
                                currentPage: prescriptions.current_page,
                                lastPage: prescriptions.last_page,
                                perPage: prescriptions.per_page,
                                total: prescriptions.total,
                            }}
                            onPageChange={(page) => applyFilters({ page })}
                            onPerPageChange={(perPage) =>
                                applyFilters({ perPage })
                            }
                        />
                    </div>
                </Card>
            </div>

            <ConfirmDialog
                open={deleting !== null}
                onOpenChange={(open) => {
                    if (!open) {
                        setDeleting(null);
                    }
                }}
                title="Delete prescription?"
                description="Lines and billing attached to this prescription will also be removed."
                confirmLabel="Delete"
                processing={processing}
                onConfirm={deletePrescription}
            />
            {error ? (
                <div className="flex w-full flex-col px-4 pb-6 md:px-6 lg:px-8">
                    <p className="text-sm text-red-600">{error}</p>
                </div>
            ) : null}
        </>
    );
}
