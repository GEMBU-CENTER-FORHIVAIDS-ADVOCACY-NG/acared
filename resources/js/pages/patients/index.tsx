import { Head, Link, router, usePage } from '@inertiajs/react';
import { Eye, MoreHorizontal, Pencil, RotateCcw, Trash2 } from 'lucide-react';
import { useRef, useState } from 'react';
import PatientController from '@/actions/App/Http/Controllers/PatientController';
import AlertError from '@/components/alert-error';
import ConfirmDialog from '@/components/confirm-dialog';
import Heading from '@/components/heading';
import Pagination from '@/components/pagination';
import TabsBar from '@/components/tabs-bar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
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
import {
    create,
    edit as editUrl,
    exportMethod as exportPatients,
    importMethod as importPatients,
    index,
    show as showUrl,
} from '@/routes/patients';
import {
    patientConfirmLabels,
    type ConfirmAction,
} from '@/hooks/use-patient-actions';
import type {
    PatientFilters,
    PatientListItem,
    PatientPaginator,
    PatientStats,
    PatientTab,
    Team,
} from '@/types';

type LayoutProps = {
    currentTeam?: Team | null;
};

type ConfirmState = ConfirmAction | 'bulk-delete' | 'bulk-force-delete';

export default function PatientIndex({
    patients,
    tabs,
    stats,
    filters,
}: {
    patients: PatientPaginator;
    tabs: PatientTab[];
    stats: PatientStats;
    filters: PatientFilters;
}) {
    const { currentTeam } = usePage().props;
    const teamSlug = currentTeam?.slug;

    const [search, setSearch] = useState(filters.q);
    const [selected, setSelected] = useState<number[]>([]);
    const [confirm, setConfirm] = useState<ConfirmState | null>(null);
    const [confirmTarget, setConfirmTarget] = useState<PatientListItem | null>(
        null,
    );
    const [processing, setProcessing] = useState(false);
    const [importing, setImporting] = useState(false);
    const [importError, setImportError] = useState<string | null>(null);
    const [actionError, setActionError] = useState<string | null>(null);
    const importInput = useRef<HTMLInputElement>(null);

    function applyFilters(patch: Partial<PatientFilters>) {
        const next = { ...filters, page: 1, ...patch };

        router.get(
            index.url(teamSlug, {
                query: {
                    tab: next.tab,
                    q: next.q || undefined,
                    trashed: next.trashed,
                    sort: next.sort,
                    direction: next.direction,
                    perPage: next.perPage,
                    page: next.page,
                },
            }),
            {},
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            },
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

    function importCsv(file: File | undefined) {
        if (!file) {
            return;
        }

        setImportError(null);
        setImporting(true);
        const payload = new FormData();
        payload.append('file', file);

        router.post(importPatients.url(teamSlug ?? ''), payload, {
            forceFormData: true,
            preserveScroll: true,
            onError: (errors) =>
                setImportError(errors.file ?? 'Import failed.'),
            onFinish: () => {
                setImporting(false);
                if (importInput.current) {
                    importInput.current.value = '';
                }
            },
        });
    }

    function toggleRow(id: number) {
        setSelected((current) =>
            current.includes(id)
                ? current.filter((value) => value !== id)
                : [...current, id],
        );
    }

    function toggleAll() {
        const visibleIds = patients.data.map((patient) => patient.id);
        const allVisibleSelected =
            visibleIds.length > 0 &&
            visibleIds.every((id) => selected.includes(id));

        setSelected((current) => {
            const next = new Set(current);
            if (allVisibleSelected) {
                visibleIds.forEach((id) => next.delete(id));
            } else {
                visibleIds.forEach((id) => next.add(id));
            }
            return [...next];
        });
    }

    function openConfirm(action: ConfirmState, patient?: PatientListItem) {
        setActionError(null);
        setConfirm(action);
        setConfirmTarget(patient ?? null);
    }

    function runConfirm() {
        if (!confirm) {
            return;
        }

        setProcessing(true);
        setActionError(null);

        const clearConfirm = () => {
            setConfirm(null);
            setConfirmTarget(null);
        };

        const options = {
            preserveScroll: true,
            onSuccess: clearConfirm,
            onError: (errors: Record<string, string>) =>
                setActionError(
                    Object.values(errors)[0] ?? 'Unable to complete action.',
                ),
            onFinish: () => setProcessing(false),
        };

        if (confirm === 'bulk-delete' || confirm === 'bulk-force-delete') {
            const url =
                confirm === 'bulk-delete'
                    ? PatientController.bulkDestroy.url(teamSlug)
                    : PatientController.bulkForceDelete.url(teamSlug);

            router.delete(url, {
                ...options,
                data: { ids: selected },
                onSuccess: () => {
                    clearConfirm();
                    setSelected([]);
                },
            });
            return;
        }

        if (!confirmTarget) {
            setProcessing(false);
            return;
        }

        if (confirm === 'restore') {
            router.patch(
                PatientController.restore.url([
                    teamSlug ?? '',
                    confirmTarget.id,
                ]),
                {},
                {
                    ...options,
                    onSuccess: () => {
                        clearConfirm();
                        setSelected((current) =>
                            current.filter((id) => id !== confirmTarget.id),
                        );
                    },
                },
            );
            return;
        }

        const url =
            confirm === 'delete'
                ? PatientController.destroy.url([
                      teamSlug ?? '',
                      confirmTarget.id,
                  ])
                : PatientController.forceDelete.url([
                      teamSlug ?? '',
                      confirmTarget.id,
                  ]);

        router.delete(url, {
            ...options,
            onSuccess: () => {
                clearConfirm();
                setSelected((current) =>
                    current.filter((id) => id !== confirmTarget.id),
                );
            },
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

    const allVisibleSelected =
        patients.data.length > 0 &&
        patients.data.every((patient) => selected.includes(patient.id));

    return (
        <>
            <Head title="Patients" />

            <div className="flex w-full flex-col space-y-6 p-4 md:p-6 lg:p-8">
                <div className="flex flex-wrap items-center justify-between gap-2">
                    <Heading
                        variant="small"
                        title="Patients"
                        description="Search, filter, and manage registered patients."
                    />
                    <Button asChild data-test="new-patient">
                        <Link href={create(teamSlug)}>Register patient</Link>
                    </Button>
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Total patients
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-semibold tabular-nums">
                                {stats.total.toLocaleString()}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                All registered patients
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                New patients
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-semibold tabular-nums">
                                {stats.newLast30Days.toLocaleString()}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Registered in the last 30 days
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Revisiting patients
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-semibold tabular-nums">
                                {stats.revisiting.toLocaleString()}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                More than one appointment
                            </p>
                        </CardContent>
                    </Card>
                </div>

                <TabsBar
                    items={tabs.map((tab) => ({
                        key: tab.key,
                        label: tab.label,
                        count: tab.count,
                        badge: tab.badge,
                    }))}
                    value={filters.tab}
                    onChange={(key) =>
                        applyFilters({ tab: key, perPage: filters.perPage })
                    }
                />

                <div className="flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-center">
                    <form
                        className="flex w-full items-center gap-2 lg:w-auto"
                        onSubmit={(event) => {
                            event.preventDefault();
                            applyFilters({ q: search });
                        }}
                    >
                        <Input
                            aria-label="Search patients"
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            placeholder="Search hospital no, name, email..."
                            className="min-w-0 flex-1 lg:w-64 lg:flex-none"
                            data-test="patient-search"
                        />
                        <Button
                            type="submit"
                            disabled={processing || importing}
                        >
                            {processing || importing
                                ? 'Searching...'
                                : 'Search'}
                        </Button>
                    </form>

                    <div className="flex w-full flex-wrap items-center gap-2 lg:w-auto">
                        <SelectNative
                            aria-label="Filter by trashed status"
                            value={filters.trashed}
                            onChange={(event) =>
                                applyFilters({ trashed: event.target.value })
                            }
                            className="w-40"
                            data-test="trashed-filter"
                        >
                            <option value="without">Active</option>
                            <option value="with">All (incl. trashed)</option>
                            <option value="only">Only trashed</option>
                        </SelectNative>

                        <input
                            ref={importInput}
                            type="file"
                            accept=".csv,.txt"
                            className="hidden"
                            aria-label="Import patient CSV"
                            disabled={importing || processing}
                            onChange={(event) =>
                                importCsv(event.target.files?.[0])
                            }
                        />
                        <Button
                            type="button"
                            variant="outline"
                            disabled={importing || processing}
                            onClick={() => importInput.current?.click()}
                        >
                            {importing ? 'Importing...' : 'Import CSV'}
                        </Button>
                        <Button variant="outline" asChild>
                            <a
                                aria-label="Export patients as CSV"
                                href={exportPatients.url(teamSlug ?? '', {
                                    query: {
                                        ...filters,
                                        q: filters.q || undefined,
                                    },
                                })}
                            >
                                Export CSV
                            </a>
                        </Button>
                    </div>

                    {selected.length > 0 ? (
                        <div className="flex w-full flex-wrap items-center gap-2 lg:ml-auto lg:w-auto">
                            <span className="text-sm text-muted-foreground">
                                {selected.length} selected
                            </span>
                            <Button
                                variant="destructive"
                                size="sm"
                                disabled={processing || importing}
                                onClick={() => openConfirm('bulk-delete')}
                            >
                                Delete selected
                            </Button>
                            {filters.trashed === 'only' ? (
                                <Button
                                    variant="destructive"
                                    size="sm"
                                    disabled={processing || importing}
                                    onClick={() =>
                                        openConfirm('bulk-force-delete')
                                    }
                                >
                                    Force delete selected
                                </Button>
                            ) : null}
                        </div>
                    ) : null}
                </div>

                {importError ? (
                    <p className="text-sm text-destructive" role="alert">
                        {importError}
                    </p>
                ) : null}
                {actionError ? (
                    <AlertError errors={[actionError]} title="Action failed" />
                ) : null}

                <Card>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-10">
                                            <input
                                                type="checkbox"
                                                checked={allVisibleSelected}
                                                onChange={toggleAll}
                                                aria-label="Select all patients on this page"
                                            />
                                        </TableHead>
                                        <TableHead>Hospital No</TableHead>
                                        <TableHead>ART No</TableHead>
                                        <TableHead>NHIS/Other</TableHead>
                                        <TableHead>Category</TableHead>
                                        <TableHead>Full name</TableHead>
                                        <TableHead>Gender</TableHead>
                                        <TableHead
                                            aria-sort={
                                                filters.sort === 'birthDate'
                                                    ? filters.direction ===
                                                      'asc'
                                                        ? 'ascending'
                                                        : 'descending'
                                                    : 'none'
                                            }
                                        >
                                            <button
                                                type="button"
                                                aria-label="Sort by birth date"
                                                className="inline-flex items-center rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                                onClick={() =>
                                                    toggleSort('birthDate')
                                                }
                                            >
                                                Birth date
                                                {sortIndicator('birthDate')}
                                            </button>
                                        </TableHead>
                                        <TableHead>Email address</TableHead>
                                        <TableHead>Phone</TableHead>
                                        <TableHead
                                            aria-sort={
                                                filters.sort === 'created_at'
                                                    ? filters.direction ===
                                                      'asc'
                                                        ? 'ascending'
                                                        : 'descending'
                                                    : 'none'
                                            }
                                        >
                                            <button
                                                type="button"
                                                aria-label="Sort by registration date"
                                                className="inline-flex items-center rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                                onClick={() =>
                                                    toggleSort('created_at')
                                                }
                                            >
                                                Registered
                                                {sortIndicator('created_at')}
                                            </button>
                                        </TableHead>
                                        <TableHead className="w-12 text-right">
                                            Actions
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {patients.data.length === 0 ? (
                                        <TableRow>
                                            <TableCell
                                                colSpan={12}
                                                className="py-10 text-center text-muted-foreground"
                                            >
                                                No patients found.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        patients.data.map((patient) => (
                                            <PatientRow
                                                key={patient.id}
                                                patient={patient}
                                                selected={selected.includes(
                                                    patient.id,
                                                )}
                                                onToggle={() =>
                                                    toggleRow(patient.id)
                                                }
                                                onAction={(action) =>
                                                    openConfirm(action, patient)
                                                }
                                                disabled={
                                                    processing || importing
                                                }
                                            />
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>

                <Pagination
                    meta={{
                        currentPage: patients.current_page,
                        lastPage: patients.last_page,
                        perPage: patients.per_page,
                        total: patients.total,
                    }}
                    onPageChange={(page) => applyFilters({ page })}
                    onPerPageChange={(perPage) => applyFilters({ perPage })}
                />
            </div>

            <ConfirmDialog
                open={confirm !== null}
                onOpenChange={(open) => {
                    if (!open && !processing) {
                        setConfirm(null);
                        setConfirmTarget(null);
                    }
                }}
                processing={processing}
                destructive={confirm !== 'restore'}
                title={
                    confirm === 'bulk-delete'
                        ? `Delete ${selected.length} patients?`
                        : confirm === 'bulk-force-delete'
                          ? `Permanently delete ${selected.length} patients?`
                          : patientConfirmLabels(
                                (confirm ?? 'delete') as ConfirmAction,
                            ).title
                }
                description={
                    confirm === 'bulk-delete'
                        ? 'Selected patients will be moved to the trash.'
                        : confirm === 'bulk-force-delete'
                          ? 'Selected patients will be permanently removed. This cannot be undone.'
                          : patientConfirmLabels(
                                (confirm ?? 'delete') as ConfirmAction,
                            ).description
                }
                confirmLabel={
                    processing
                        ? 'Working...'
                        : confirm === 'bulk-delete'
                          ? 'Delete'
                          : confirm === 'bulk-force-delete'
                            ? 'Force delete'
                            : patientConfirmLabels(
                                  (confirm ?? 'delete') as ConfirmAction,
                              ).confirmLabel
                }
                onConfirm={runConfirm}
            />
        </>
    );
}

function PatientRow({
    patient,
    selected,
    onToggle,
    onAction,
    disabled,
}: {
    patient: PatientListItem;
    selected: boolean;
    onToggle: () => void;
    onAction: (action: ConfirmAction) => void;
    disabled: boolean;
}) {
    const { currentTeam } = usePage<{ currentTeam?: Team | null }>().props;
    const teamSlug = currentTeam?.slug ?? '';

    return (
        <TableRow data-state={selected ? 'selected' : undefined}>
            <TableCell>
                <input
                    type="checkbox"
                    checked={selected}
                    onChange={onToggle}
                    disabled={disabled}
                    aria-label={`Select ${patient.fullName}`}
                />
            </TableCell>
            <TableCell data-test="patient-row-slug">{patient.slug}</TableCell>
            <TableCell>{patient.art ?? '—'}</TableCell>
            <TableCell>{patient.slugOther ?? '—'}</TableCell>
            <TableCell>{patient.category?.name ?? '—'}</TableCell>
            <TableCell>
                <Link
                    href={showUrl([teamSlug, patient.id])}
                    className="font-medium underline-offset-4 hover:underline"
                >
                    {patient.fullName}
                </Link>
                {patient.deletedAt ? (
                    <Badge variant="destructive" className="ml-2">
                        Trashed
                    </Badge>
                ) : null}
            </TableCell>
            <TableCell>{patient.gender ?? '—'}</TableCell>
            <TableCell>{patient.birthDate ?? '—'}</TableCell>
            <TableCell>{patient.email ?? '—'}</TableCell>
            <TableCell>{patient.phone ?? '—'}</TableCell>
            <TableCell>
                {patient.createdAt
                    ? new Date(patient.createdAt).toLocaleDateString()
                    : '—'}
            </TableCell>
            <TableCell className="text-right">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="outline"
                            size="sm"
                            aria-label={`Actions for ${patient.fullName}`}
                            disabled={disabled}
                        >
                            <MoreHorizontal className="size-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                            <Link href={showUrl([teamSlug, patient.id])}>
                                <Eye className="mr-2 h-4 w-4" />
                                View
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <Link href={editUrl([teamSlug, patient.id])}>
                                <Pencil className="mr-2 h-4 w-4" />
                                Edit
                            </Link>
                        </DropdownMenuItem>
                        {patient.deletedAt ? (
                            <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    onClick={() => onAction('restore')}
                                >
                                    <RotateCcw className="mr-2 h-4 w-4" />
                                    Restore
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={() => onAction('force-delete')}
                                >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Force delete
                                </DropdownMenuItem>
                            </>
                        ) : (
                            <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    onClick={() => onAction('delete')}
                                >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete
                                </DropdownMenuItem>
                            </>
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>
            </TableCell>
        </TableRow>
    );
}

PatientIndex.layout = (props: LayoutProps) => ({
    breadcrumbs: [
        {
            title: 'Patients',
            href: index(props.currentTeam?.slug),
        },
    ],
});
