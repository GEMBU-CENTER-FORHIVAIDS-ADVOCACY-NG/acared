import { Head, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import Heading from '@/components/heading';
import Pagination from '@/components/pagination';
import { useReportPrint } from '@/hooks/use-report-print';
import { formatReportDate } from '@/hooks/use-format-report-date';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
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
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { index as activityLogsIndex } from '@/routes/reports/activity-logs';

type Activity = {
    id: number;
    description: string;
    event: string;
    subjectType: string;
    subjectId: number | null;
    causerName: string | null;
    causerId: number | null;
    properties: Record<string, unknown> | null;
    createdAt: string | null;
};

type Filters = {
    q: string;
    event: string;
    from: string;
    to: string;
    perPage: number;
};

type Paginator = {
    data: Activity[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
};

type Summary = {
    total: number;
    perEvent: Record<string, number>;
    perSubject: Record<string, number>;
    perUser: Record<string, number>;
};

function formatEvent(event: string): string {
    const map: Record<string, string> = {
        created: 'Created',
        updated: 'Updated',
        deleted: 'Deleted',
        logged_in: 'Logged in',
        logged_out: 'Logged out',
        registered: 'Registered',
        password_reset: 'Password reset',
    };
    return map[event] ?? event;
}

function eventBadgeClass(event: string): string {
    const map: Record<string, string> = {
        created: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
        updated: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400',
        deleted: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
        logged_in: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
        logged_out: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
        registered: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
        password_reset: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    };
    return map[event] ?? 'bg-muted text-muted-foreground';
}

export default function ActivityLogsReport({
    activities,
    summary,
    filters,
    availableEvents,
    isAdmin,
}: {
    activities: Paginator;
    summary: Summary;
    filters: Filters;
    availableEvents: string[];
    isAdmin: boolean;
}) {
    const team = usePage().props.currentTeam?.slug ?? '';
    const { printRef, handlePrint } = useReportPrint();
    const [search, setSearch] = useState(filters.q);
    const [event, setEvent] = useState(filters.event);
    const [from, setFrom] = useState(filters.from);
    const [to, setTo] = useState(filters.to);

    const visit = (patch: Partial<Filters> & { page?: number }) => {
        const next = { ...filters, ...patch };
        router.get(
            activityLogsIndex.url({ current_team: team }),
            {
                q: next.q || undefined,
                event: next.event || undefined,
                from: next.from || undefined,
                to: next.to || undefined,
                perPage: next.perPage,
                page: next.page || undefined,
            },
            { preserveState: true, preserveScroll: true, replace: true },
        );
    };

    return (
        <>
            <Head title="Activity logs" />
            <div className="flex w-full flex-col space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-3 no-print">
                    <Heading
                        variant="small"
                        title="Activity logs"
                        description="Audit trail of all model changes across the application."
                    />
                    <Button variant="outline" onClick={handlePrint}>
                        Print
                    </Button>
                </div>

                {/* Metrics cards */}
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 no-print">
                    <StatCard
                        title="Total activities"
                        value={summary.total.toLocaleString()}
                        description="All recorded model changes"
                    />
                    <StatCard
                        title="Creates"
                        value={(summary.perEvent['created'] ?? 0).toLocaleString()}
                        description="New records created"
                    />
                    <StatCard
                        title="Updates"
                        value={(summary.perEvent['updated'] ?? 0).toLocaleString()}
                        description="Records modified"
                    />
                    <StatCard
                        title="Deletes"
                        value={(summary.perEvent['deleted'] ?? 0).toLocaleString()}
                        description="Records removed"
                    />
                </div>

                {/* Breakdown cards */}
                {(Object.keys(summary.perSubject).length > 0 || (isAdmin && Object.keys(summary.perUser).length > 0)) && (
                    <div className={`grid gap-3 ${isAdmin ? 'md:grid-cols-2' : 'md:grid-cols-1'} no-print`}>
                        {Object.keys(summary.perSubject).length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>By subject</CardTitle>
                                    <CardDescription>
                                        Activities grouped by the affected model type.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <SubjectBarChart data={summary.perSubject} />
                                </CardContent>
                            </Card>
                        )}
                        {isAdmin && Object.keys(summary.perUser).length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Top users</CardTitle>
                                    <CardDescription>
                                        Users with the most activity in this period.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    {Object.entries(summary.perUser).map(([name, count]) => (
                                        <div
                                            key={name}
                                            className="flex items-center justify-between text-sm"
                                        >
                                            <span>{name}</span>
                                            <span className="font-medium">{count.toLocaleString()}</span>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        )}
                    </div>
                )}

                {/* Filters */}
                <div className="flex flex-wrap items-end gap-2 no-print">
                    <form
                        className="flex items-end gap-2"
                        onSubmit={(e) => {
                            e.preventDefault();
                            visit({ q: search, page: 1 });
                        }}
                    >
                        <div className="space-y-1">
                            <Label htmlFor="activity-search">Search</Label>
                            <Input
                                id="activity-search"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search description…"
                            />
                        </div>
                        <Button type="submit" variant="secondary">
                            Search
                        </Button>
                    </form>

                    <div className="space-y-1">
                        <Label htmlFor="activity-event">Event</Label>
                        <SelectNative
                            id="activity-event"
                            value={event}
                            onChange={(e) => setEvent(e.target.value)}
                        >
                            <option value="">All events</option>
                            {availableEvents.map((ev) => (
                                <option key={ev} value={ev}>
                                    {formatEvent(ev)}
                                </option>
                            ))}
                        </SelectNative>
                    </div>

                    <Button
                        variant="secondary"
                        onClick={() => visit({ event, page: 1 })}
                    >
                        Filter
                    </Button>

                    <div className="space-y-1">
                        <Label htmlFor="activity-from">From</Label>
                        <Input
                            id="activity-from"
                            type="date"
                            value={from}
                            onChange={(e) => setFrom(e.target.value)}
                        />
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="activity-to">To</Label>
                        <Input
                            id="activity-to"
                            type="date"
                            value={to}
                            onChange={(e) => setTo(e.target.value)}
                        />
                    </div>
                    <Button
                        variant="secondary"
                        onClick={() => visit({ from, to, page: 1 })}
                    >
                        Apply
                    </Button>
                </div>

                {/* Table */}
                <div ref={printRef} className="report-print-container">
                    <h2 className="mb-3 text-lg font-semibold">
                        Activity Logs from {formatReportDate(from)} to {formatReportDate(to)}
                    </h2>
                    <Card>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Event</TableHead>
                                        <TableHead>Description</TableHead>
                                        <TableHead>Subject</TableHead>
                                        <TableHead>User</TableHead>
                                        <TableHead>Date</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {activities.data.length ? (
                                        activities.data.map((activity) => (
                                            <TableRow key={activity.id}>
                                                <TableCell>
                                                    <Badge variant="secondary" className={eventBadgeClass(activity.event)}>
                                                        {formatEvent(activity.event)}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="max-w-xs truncate text-sm">
                                                    {activity.description}
                                                </TableCell>
                                                <TableCell className="text-sm">
                                                    {activity.subjectType}
                                                    {activity.subjectId != null
                                                        ? ` #${activity.subjectId}`
                                                        : ''}
                                                </TableCell>
                                                <TableCell className="text-sm">
                                                    {activity.causerName ?? '—'}
                                                </TableCell>
                                                <TableCell className="text-sm text-muted-foreground">
                                                    {activity.createdAt
                                                        ? new Date(activity.createdAt).toLocaleString()
                                                        : '—'}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell
                                                colSpan={5}
                                                className="py-10 text-center text-muted-foreground"
                                            >
                                                No activities found for this period.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>

                {/* Pagination */}
                <div className="no-print">
                    <Pagination
                        meta={{
                            currentPage: activities.current_page,
                            lastPage: activities.last_page,
                            perPage: activities.per_page,
                            total: activities.total,
                        }}
                        onPageChange={(page) => visit({ page })}
                        onPerPageChange={(perPage) => visit({ perPage, page: 1 })}
                    />
                </div>
            </div>
        </>
    );
}

function StatCard({
    title,
    value,
    description,
}: {
    title: string;
    value: string;
    description: string;
}) {
    return (
        <Card>
            <CardHeader className="pb-2">
                <CardDescription>{title}</CardDescription>
                <CardTitle className="text-2xl">{value}</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-xs text-muted-foreground">{description}</p>
            </CardContent>
        </Card>
    );
}

const subjectColors = [
    '#6366f1',
    '#10b981',
    '#f59e0b',
    '#ef4444',
    '#8b5cf6',
    '#06b6d4',
    '#ec4899',
    '#84cc16',
    '#f97316',
    '#14b8a6',
    '#a855f7',
    '#e11d48',
    '#0ea5e9',
    '#22c55e',
    '#eab308',
];

function SubjectBarChart({ data }: { data: Record<string, number> }) {
    const entries = Object.entries(data);

    if (entries.length === 0) {
        return (
            <p className="text-sm text-muted-foreground">
                No subject data available.
            </p>
        );
    }

    const max = Math.max(1, ...entries.map(([, count]) => count));

    return (
        <div className="space-y-3">
            {entries.map(([label, count], index) => (
                <div key={label} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                        <span>{label}</span>
                        <span className="text-muted-foreground">
                            {count.toLocaleString()}
                        </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-muted">
                        <div
                            className="h-2 rounded-full"
                            style={{
                                width: `${(count / max) * 100}%`,
                                backgroundColor: subjectColors[index % subjectColors.length],
                            }}
                        />
                    </div>
                </div>
            ))}
        </div>
    );
}
