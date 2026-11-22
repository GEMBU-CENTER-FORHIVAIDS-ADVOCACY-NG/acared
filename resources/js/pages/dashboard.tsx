import { Head, router, usePage } from '@inertiajs/react';
import {
    Activity,
    Banknote,
    BedDouble,
    CalendarDays,
    ClipboardList,
    Users,
} from 'lucide-react';
import { useState } from 'react';
import PendingInvitationsModal from '@/components/pending-invitations-modal';
import Heading from '@/components/heading';
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
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { dashboard } from '@/routes';
import type { DashboardInvitation, Team } from '@/types';

type Series = {
    labels: string[];
    datasets: { key: string; label: string; color: string; data: number[] }[];
};

type TopItem = { id: number; name: string; count: number; value: number };

type Props = {
    currentTeam?: Team | null;
    pendingInvitations?: DashboardInvitation[];
    currencySymbol: string;
    filters: { from: string; to: string };
    rangeLabel: string;
    kpis: {
        patientsRegistered: number;
        totalPatients: number;
        paymentsCollected: number;
        outstandingBills: number;
        openBills: number;
        activeAdmissions: number;
    };
    kpiSeries: {
        patientsRegistered: number[];
        totalPatients: number[];
        paymentsCollected: number[];
        outstandingAmount: number[];
        openBills: number[];
        activeAdmissions: number[];
    };
    appointments: {
        total: number;
        open: number;
        completed: number;
        series: { appointments: number[]; open: number[]; completed: number[] };
    };
    patientsByGender: Record<string, number>;
    patientsByAge: { label: string; value: number }[];
    revenue: Series;
    stockMovements: { labels: string[]; data: number[] };
    topDrugs: TopItem[];
    topLaboratoryTests: TopItem[];
    lowStockItems: {
        id: number;
        sku: string | null;
        product: string;
        minQty: number;
        quantity: number;
        cost: number;
    }[];
    expiringDrugs: {
        id: number;
        sku: string | null;
        product: string;
        expiresAt: string;
        daysRemaining: number;
        quantity: number;
    }[];
};

function formatMoney(symbol: string, value: number): string {
    return `${symbol} ${Math.round(value).toLocaleString()}`;
}

function formatExpirationDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
    });
}

function formatDaysRemaining(days: number): string {
    if (days === 0) {
        return 'Expiring today';
    }

    const daysFormatted = days % 1 !== 0 ? days.toFixed(2) : days.toString();

    if (days === 1) {
        return '1 day left';
    }
    if (days <= 7) {
        return `${daysFormatted} days left`;
    }
    if (days <= 14) {
        return `${Math.floor(days / 7)} week${Math.floor(days / 7) > 1 ? 's' : ''} left`;
    }
    if (days <= 30) {
        return `${Math.floor(days / 7)} weeks left`;
    }
    return `${daysFormatted} days left`;
}

function Sparkline({ values, color }: { values: number[]; color: string }) {
    if (values.length < 2) {
        return null;
    }

    const width = 120;
    const height = 36;
    const min = Math.min(0, ...values);
    const max = Math.max(1, ...values);
    const points = values
        .map((value, index) => {
            const x = (index / (values.length - 1)) * width;
            const y = height - ((value - min) / (max - min || 1)) * height;

            return `${x},${y}`;
        })
        .join(' ');

    return (
        <svg
            viewBox={`0 0 ${width} ${height}`}
            className="h-9 w-30"
            aria-hidden="true"
        >
            <polyline
                points={points}
                fill="none"
                stroke={color}
                strokeWidth="2"
            />
        </svg>
    );
}

function SeriesChart({ series, label }: { series: Series; label: string }) {
    if (series.labels.length === 0) {
        return (
            <p className="text-sm text-muted-foreground">
                No activity in this period.
            </p>
        );
    }

    const width = 900;
    const height = 260;
    const padding = { top: 16, right: 16, bottom: 30, left: 16 };
    const allValues = series.datasets.flatMap((dataset) => dataset.data);
    const minimum = Math.min(0, ...allValues);
    const maximum = Math.max(1, ...allValues);
    const point = (index: number, value: number) => ({
        x:
            padding.left +
            (series.labels.length === 1
                ? (width - padding.left - padding.right) / 2
                : (index / (series.labels.length - 1)) *
                  (width - padding.left - padding.right)),
        y:
            padding.top +
            ((maximum - value) / (maximum - minimum || 1)) *
                (height - padding.top - padding.bottom),
    });
    const axisY = point(0, 0).y;

    return (
        <div className="space-y-3">
            <p className="sr-only">
                {`${label}: ${series.datasets
                    .map(
                        (dataset) =>
                            `${dataset.label} from ${series.labels[0]} to ${series.labels[series.labels.length - 1]}`,
                    )
                    .join('; ')}.`}
            </p>
            <div className="overflow-x-auto">
                <svg
                    viewBox={`0 0 ${width} ${height}`}
                    className="h-64 w-full min-w-160"
                    role="img"
                    aria-label={label}
                >
                    <line
                        x1={padding.left}
                        x2={width - padding.right}
                        y1={axisY}
                        y2={axisY}
                        className="stroke-border"
                        strokeDasharray="4 4"
                    />
                    {series.datasets.map((dataset) => (
                        <polyline
                            key={dataset.key}
                            points={dataset.data
                                .map((value, index) => {
                                    const position = point(index, value);

                                    return `${position.x},${position.y}`;
                                })
                                .join(' ')}
                            fill="none"
                            stroke={dataset.color}
                            strokeWidth="2.5"
                            strokeLinejoin="round"
                            strokeLinecap="round"
                        />
                    ))}
                    {[
                        0,
                        Math.floor((series.labels.length - 1) / 2),
                        series.labels.length - 1,
                    ]
                        .filter(
                            (index, position, indexes) =>
                                indexes.indexOf(index) === position,
                        )
                        .map((index) => {
                            const x = point(index, 0).x;

                            return (
                                <text
                                    key={index}
                                    x={x}
                                    y={height - 8}
                                    textAnchor="middle"
                                    className="fill-muted-foreground"
                                    fontSize="11"
                                >
                                    {series.labels[index]}
                                </text>
                            );
                        })}
                </svg>
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs">
                {series.datasets.map((dataset) => (
                    <span
                        key={dataset.key}
                        className="inline-flex items-center gap-2"
                    >
                        <span
                            className="size-2 rounded-full"
                            style={{ backgroundColor: dataset.color }}
                        />
                        {dataset.label}
                    </span>
                ))}
            </div>
        </div>
    );
}

function Distribution({
    items,
}: {
    items: { label: string; value: number; color: string }[];
}) {
    const maximum = Math.max(1, ...items.map((item) => item.value));

    return (
        <div className="space-y-4">
            {items.map((item) => (
                <div key={item.label} className="space-y-1.5">
                    <div className="flex items-center justify-between gap-3 text-sm">
                        <span>{item.label}</span>
                        <span className="font-medium tabular-nums">
                            {item.value.toLocaleString()}
                        </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-muted">
                        <div
                            className="h-full rounded-full"
                            style={{
                                width: `${(item.value / maximum) * 100}%`,
                                backgroundColor: item.color,
                            }}
                        />
                    </div>
                </div>
            ))}
        </div>
    );
}

function RankingTable({
    title,
    description,
    rows,
    countLabel,
    currencySymbol,
}: {
    title: string;
    description: string;
    rows: TopItem[];
    countLabel: string;
    currencySymbol: string;
}) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Item</TableHead>
                                <TableHead>{countLabel}</TableHead>
                                <TableHead className="text-right">
                                    Value
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {rows.length === 0 ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={3}
                                        className="py-8 text-center text-muted-foreground"
                                    >
                                        No activity in this period.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                rows.map((row) => (
                                    <TableRow key={row.id}>
                                        <TableCell className="max-w-64 truncate font-medium">
                                            {row.name}
                                        </TableCell>
                                        <TableCell>
                                            {row.count.toLocaleString()}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {formatMoney(
                                                currencySymbol,
                                                row.value,
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
}

export default function Dashboard({
    pendingInvitations = [],
    currencySymbol,
    filters,
    rangeLabel,
    kpis,
    kpiSeries,
    appointments,
    patientsByGender,
    patientsByAge,
    revenue,
    stockMovements,
    topDrugs,
    topLaboratoryTests,
    lowStockItems,
    expiringDrugs,
}: Props) {
    const { currentTeam } = usePage<{ currentTeam?: Team | null }>().props;
    const teamSlug = currentTeam?.slug ?? '';
    const [from, setFrom] = useState(filters.from);
    const [to, setTo] = useState(filters.to);
    const [showInvitations, setShowInvitations] = useState(
        pendingInvitations.length > 0,
    );
    const [isApplying, setIsApplying] = useState(false);
    const hasInvalidRange = Boolean(from && to && from > to);
    const stats = [
        {
            label: 'Patients registered',
            value: kpis.patientsRegistered.toLocaleString(),
            description: `Registered from ${rangeLabel}`,
            icon: Users,
            color: '#6366f1',
            series: kpiSeries.patientsRegistered,
        },
        {
            label: 'Total patients',
            value: kpis.totalPatients.toLocaleString(),
            description: 'All registered patients',
            icon: Users,
            color: '#64748b',
            series: kpiSeries.totalPatients,
        },
        {
            label: 'Payments collected',
            value: formatMoney(currencySymbol, kpis.paymentsCollected),
            description: `Payments collected from ${rangeLabel}`,
            icon: Banknote,
            color: '#10b981',
            series: kpiSeries.paymentsCollected,
        },
        {
            label: 'Outstanding bills',
            value: formatMoney(currencySymbol, kpis.outstandingBills),
            description: 'Current unpaid balance across bills',
            icon: ClipboardList,
            color: '#f59e0b',
            series: kpiSeries.outstandingAmount,
        },
        {
            label: 'Open bills',
            value: kpis.openBills.toLocaleString(),
            description: 'Bills still awaiting payment',
            icon: ClipboardList,
            color: '#0ea5e9',
            series: kpiSeries.openBills,
        },
        {
            label: 'Active admissions',
            value: kpis.activeAdmissions.toLocaleString(),
            description: 'Patients currently occupying a bed',
            icon: BedDouble,
            color: '#ef4444',
            series: kpiSeries.activeAdmissions,
        },
    ];
    const genderColors: Record<string, string> = {
        Male: '#3b82f6',
        Female: '#ec4899',
        'Other / not recorded': '#94a3b8',
    };

    function applyDateRange() {
        if (!from || !to || hasInvalidRange || isApplying) {
            return;
        }

        setIsApplying(true);
        router.get(
            dashboard.url(teamSlug),
            { from, to },
            {
                preserveScroll: true,
                preserveState: true,
                replace: true,
                onFinish: () => setIsApplying(false),
            },
        );
    }

    return (
        <>
            <Head title="Dashboard" />
            <PendingInvitationsModal
                invitations={pendingInvitations}
                open={pendingInvitations.length > 0 && showInvitations}
                onOpenChange={setShowInvitations}
            />
            <div className="flex w-full flex-col space-y-6 p-4 md:p-6 lg:p-8">
                <div className="flex flex-wrap items-end justify-between gap-4">
                    <Heading
                        title="Operational overview"
                        description={`Activity and current financial position for ${rangeLabel}.`}
                    />
                    <div className="flex flex-wrap items-end gap-2">
                        <div className="grid gap-1.5">
                            <Label htmlFor="dashboard-from" className="text-xs">
                                From
                            </Label>
                            <Input
                                id="dashboard-from"
                                type="date"
                                value={from}
                                max={to}
                                onChange={(event) =>
                                    setFrom(event.target.value)
                                }
                            />
                        </div>
                        <div className="grid gap-1.5">
                            <Label htmlFor="dashboard-to" className="text-xs">
                                To
                            </Label>
                            <Input
                                id="dashboard-to"
                                type="date"
                                value={to}
                                min={from}
                                onChange={(event) => setTo(event.target.value)}
                            />
                        </div>
                        <Button
                            onClick={applyDateRange}
                            disabled={
                                !from || !to || hasInvalidRange || isApplying
                            }
                        >
                            {isApplying ? 'Applying…' : 'Apply range'}
                        </Button>
                    </div>
                    {hasInvalidRange && (
                        <p
                            role="alert"
                            className="w-full text-xs text-destructive"
                        >
                            From date must be on or before to date.
                        </p>
                    )}
                </div>

                <section
                    className="space-y-3"
                    aria-labelledby="operational-kpis"
                >
                    <div className="flex items-center gap-2">
                        <Activity className="size-4 text-muted-foreground" />
                        <h2
                            id="operational-kpis"
                            className="text-sm font-medium text-muted-foreground"
                        >
                            Operational overview
                        </h2>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                        {stats.map(
                            ({
                                label,
                                value,
                                description,
                                icon: Icon,
                                color,
                                series,
                            }) => (
                                <Card key={label}>
                                    <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                                        <div className="space-y-1">
                                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                                {label}
                                            </CardTitle>
                                            <div className="text-2xl font-semibold tabular-nums">
                                                {value}
                                            </div>
                                        </div>
                                        <Icon
                                            className="size-4"
                                            style={{ color }}
                                        />
                                    </CardHeader>
                                    <CardContent className="flex items-end justify-between gap-3">
                                        <p className="text-xs text-muted-foreground">
                                            {description}
                                        </p>
                                        <Sparkline
                                            values={series}
                                            color={color}
                                        />
                                    </CardContent>
                                </Card>
                            ),
                        )}
                    </div>
                </section>

                <section
                    className="space-y-3"
                    aria-labelledby="appointment-activity"
                >
                    <div className="flex items-center gap-2">
                        <CalendarDays className="size-4 text-muted-foreground" />
                        <h2
                            id="appointment-activity"
                            className="text-sm font-medium text-muted-foreground"
                        >
                            Appointment activity · {rangeLabel}
                        </h2>
                    </div>
                    <div className="grid gap-4 md:grid-cols-3">
                        {[
                            {
                                label: 'Appointments',
                                value: appointments.total,
                                description: 'Recorded in the selected period',
                                color: '#0ea5e9',
                                values: appointments.series.appointments,
                            },
                            {
                                label: 'Open',
                                value: appointments.open,
                                description: 'Scheduled or currently started',
                                color: '#f59e0b',
                                values: appointments.series.open,
                            },
                            {
                                label: 'Completed',
                                value: appointments.completed,
                                description: 'Completed in the selected period',
                                color: '#10b981',
                                values: appointments.series.completed,
                            },
                        ].map((item) => (
                            <Card key={item.label}>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium text-muted-foreground">
                                        {item.label}
                                    </CardTitle>
                                    <CalendarDays
                                        className="size-4"
                                        style={{ color: item.color }}
                                    />
                                </CardHeader>
                                <CardContent className="flex items-end justify-between gap-3">
                                    <div>
                                        <div className="text-2xl font-semibold tabular-nums">
                                            {item.value.toLocaleString()}
                                        </div>
                                        <p className="mt-1 text-xs text-muted-foreground">
                                            {item.description}
                                        </p>
                                    </div>
                                    <Sparkline
                                        values={item.values}
                                        color={item.color}
                                    />
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </section>

                <div className="grid gap-4 lg:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Patients by gender</CardTitle>
                            <CardDescription>
                                Gender distribution for patients registered in
                                the selected period.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Distribution
                                items={Object.entries(patientsByGender).map(
                                    ([label, value]) => ({
                                        label,
                                        value,
                                        color: genderColors[label] ?? '#94a3b8',
                                    }),
                                )}
                            />
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>Patients by age</CardTitle>
                            <CardDescription>
                                Adult, child, and unknown-age patients
                                registered in the selected period.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Distribution
                                items={patientsByAge.map((item, index) => ({
                                    ...item,
                                    color:
                                        ['#3b82f6', '#ec4899', '#94a3b8'][
                                            index
                                        ] ?? '#94a3b8',
                                }))}
                            />
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-4 xl:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Revenue overview</CardTitle>
                            <CardDescription>
                                Payment components collected over time.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <SeriesChart
                                series={revenue}
                                label="Revenue collected over the selected period"
                            />
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>Stock movements</CardTitle>
                            <CardDescription>
                                Net inventory movement recorded over time.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <SeriesChart
                                label="Net inventory movement over the selected period"
                                series={{
                                    labels: stockMovements.labels,
                                    datasets: [
                                        {
                                            key: 'net-movement',
                                            label: 'Net movement',
                                            color: '#a8872a',
                                            data: stockMovements.data,
                                        },
                                    ],
                                }}
                            />
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-4 xl:grid-cols-2">
                    <RankingTable
                        title="Top ten prescriptions"
                        description="Most prescribed items in the selected period."
                        rows={topDrugs}
                        countLabel="Prescriptions"
                        currencySymbol={currencySymbol}
                    />
                    <RankingTable
                        title="Top ten laboratory tests"
                        description="Most requested tests in the selected period."
                        rows={topLaboratoryTests}
                        countLabel="Requests"
                        currencySymbol={currencySymbol}
                    />
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Central low-stock items</CardTitle>
                        <CardDescription>
                            Current inventory snapshot; selected range:{' '}
                            {rangeLabel}.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>SKU</TableHead>
                                        <TableHead>Product</TableHead>
                                        <TableHead>Minimum quantity</TableHead>
                                        <TableHead>
                                            Available quantity
                                        </TableHead>
                                        <TableHead className="text-right">
                                            Unit cost
                                        </TableHead>
                                        <TableHead>Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {lowStockItems.length === 0 ? (
                                        <TableRow>
                                            <TableCell
                                                colSpan={6}
                                                className="py-8 text-center text-muted-foreground"
                                            >
                                                All products are currently above
                                                their minimum quantity.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        lowStockItems.map((item) => (
                                            <TableRow key={item.id}>
                                                <TableCell>
                                                    {item.sku ?? '—'}
                                                </TableCell>
                                                <TableCell className="font-medium">
                                                    {item.product}
                                                </TableCell>
                                                <TableCell>
                                                    {item.minQty.toLocaleString()}
                                                </TableCell>
                                                <TableCell className="font-semibold text-destructive">
                                                    {item.quantity.toLocaleString()}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    {formatMoney(
                                                        currencySymbol,
                                                        item.cost,
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <span className="inline-flex rounded-full bg-destructive/10 px-2 py-0.5 text-xs font-medium text-destructive">
                                                        Low
                                                    </span>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Drugs expiring within 60 days</CardTitle>
                        <CardDescription>
                            Items approaching their expiration date, sorted by
                            urgency.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>SKU</TableHead>
                                        <TableHead>Product</TableHead>
                                        <TableHead>Expiration date</TableHead>
                                        <TableHead>Days remaining</TableHead>
                                        <TableHead>Quantity</TableHead>
                                        <TableHead>Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {expiringDrugs.length === 0 ? (
                                        <TableRow>
                                            <TableCell
                                                colSpan={6}
                                                className="py-8 text-center text-muted-foreground"
                                            >
                                                No drugs are expiring within the
                                                next 60 days.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        expiringDrugs.map((item) => {
                                            const statusColor =
                                                item.daysRemaining <= 7
                                                    ? 'destructive'
                                                    : item.daysRemaining <= 30
                                                      ? 'warning'
                                                      : 'info';

                                            const statusLabel =
                                                item.daysRemaining <= 7
                                                    ? 'Critical'
                                                    : item.daysRemaining <= 30
                                                      ? 'Urgent'
                                                      : 'Expiring soon';

                                            return (
                                                <TableRow key={item.id}>
                                                    <TableCell>
                                                        {item.sku ?? '—'}
                                                    </TableCell>
                                                    <TableCell className="font-medium">
                                                        {item.product}
                                                    </TableCell>
                                                    <TableCell>
                                                        {formatExpirationDate(
                                                            item.expiresAt,
                                                        )}
                                                    </TableCell>
                                                    <TableCell
                                                        className={`font-semibold ${
                                                            statusColor ===
                                                            'destructive'
                                                                ? 'text-destructive'
                                                                : statusColor ===
                                                                    'warning'
                                                                  ? 'text-amber-600 dark:text-amber-400'
                                                                  : 'text-muted-foreground'
                                                        }`}
                                                    >
                                                        {formatDaysRemaining(
                                                            item.daysRemaining,
                                                        )}
                                                    </TableCell>
                                                    <TableCell>
                                                        {item.quantity.toLocaleString()}
                                                    </TableCell>
                                                    <TableCell>
                                                        <span
                                                            className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                                                                statusColor ===
                                                                'destructive'
                                                                    ? 'bg-destructive/10 text-destructive'
                                                                    : statusColor ===
                                                                        'warning'
                                                                      ? 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400'
                                                                      : 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                                                            }`}
                                                        >
                                                            {statusLabel}
                                                        </span>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

Dashboard.layout = (props: { currentTeam?: Team | null }) => ({
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: props.currentTeam
                ? dashboard.url(props.currentTeam.slug)
                : '/',
        },
    ],
});
