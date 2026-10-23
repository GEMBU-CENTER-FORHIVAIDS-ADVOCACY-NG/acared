import { Head, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { FinancialReportSwitcher } from '@/components/financial-report-switcher';
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
import { SelectNative } from '@/components/ui/select-native';
import { finance } from '@/routes/reports';
import type {
    FinanceFilters,
    FinancePaymentByMethod,
    FinancePeriodOption,
    FinanceRevenue,
    FinanceStats,
    Team,
} from '@/types';

type LayoutProps = {
    currentTeam?: Team | null;
};

type StatCard = {
    title: string;
    value: string;
    description: string;
    tone: 'success' | 'primary' | 'info' | 'warning' | 'danger';
};

const TONE_CLASSES: Record<StatCard['tone'], string> = {
    success: 'text-emerald-600',
    primary: 'text-indigo-600',
    info: 'text-sky-600',
    warning: 'text-amber-600',
    danger: 'text-red-600',
};

function formatMoney(symbol: string, value: number): string {
    return `${symbol} ${Math.round(value).toLocaleString()}`;
}

function buildStatCards(
    symbol: string,
    stats: FinanceStats,
    rangeLabel: string,
): StatCard[] {
    return [
        {
            title: 'Payments collected',
            value: formatMoney(symbol, stats.payments_in_period),
            description: `Payments collected from ${rangeLabel}`,
            tone: 'success',
        },
        {
            title: 'Charges billed',
            value: formatMoney(symbol, stats.billed_in_period),
            description: `Bills raised from ${rangeLabel}`,
            tone: 'primary',
        },
        {
            title: 'Collection rate',
            value:
                stats.collection_rate === null
                    ? 'N/A'
                    : `${Math.round(stats.collection_rate)}%`,
            description:
                stats.collection_rate === null
                    ? 'No charges billed in this period'
                    : 'Collected share of billed charges',
            tone: 'success',
        },
        {
            title: 'Average payment',
            value: formatMoney(symbol, stats.average_payment),
            description: 'Average value per recorded payment',
            tone: 'info',
        },
        {
            title: 'Discounts given',
            value: formatMoney(symbol, stats.discounts_in_period),
            description: `Discounts applied to collections from ${rangeLabel}`,
            tone: 'warning',
        },
        {
            title: 'Mercy fund used',
            value: formatMoney(symbol, stats.mercy_fund_in_period),
            description: `Mercy fund support applied from ${rangeLabel}`,
            tone: 'danger',
        },
        {
            title: 'Infant formula used',
            value: formatMoney(symbol, stats.infant_formula_in_period),
            description: `Infant formula support applied from ${rangeLabel}`,
            tone: 'info',
        },
        {
            title: 'Payments recorded',
            value: stats.payments_count.toLocaleString(),
            description: `Transactions captured from ${rangeLabel}`,
            tone: 'info',
        },
        {
            title: 'Outstanding balance',
            value: formatMoney(symbol, stats.outstanding_balance),
            description: 'Current unpaid balance across bills',
            tone: 'warning',
        },
        {
            title: 'Open bills',
            value: stats.open_bills.toLocaleString(),
            description: 'Current bills still awaiting payment',
            tone: 'info',
        },
        {
            title: 'Patient wallet balance',
            value: formatMoney(symbol, stats.wallet_balance),
            description: 'Current net balance held by patients',
            tone: 'primary',
        },
    ];
}

function LineChart({ revenue }: { revenue: FinanceRevenue }) {
    const width = 720;
    const height = 240;
    const padding = 32;
    const labels = revenue.labels;

    if (labels.length === 0) {
        return <p className="text-sm text-muted-foreground">No data.</p>;
    }

    const max = Math.max(
        1,
        ...revenue.datasets.flatMap((dataset) => dataset.data),
    );

    const pointFor = (index: number, value: number) => {
        const x =
            padding +
            (labels.length === 1
                ? (width - padding * 2) / 2
                : (index / (labels.length - 1)) * (width - padding * 2));
        const y = height - padding - (value / max) * (height - padding * 2);

        return { x, y };
    };

    return (
        <div className="overflow-x-auto">
            <svg
                viewBox={`0 0 ${width} ${height}`}
                className="h-64 w-full min-w-160"
                role="img"
            >
                {revenue.datasets.map((dataset) => {
                    const points = dataset.data
                        .map((value, index) => {
                            const { x, y } = pointFor(index, value);

                            return `${x},${y}`;
                        })
                        .join(' ');

                    return (
                        <polyline
                            key={dataset.key}
                            points={points}
                            fill="none"
                            stroke={dataset.color}
                            strokeWidth={2}
                        />
                    );
                })}
            </svg>
            <div className="mt-2 flex flex-wrap gap-3 text-xs">
                {revenue.datasets.map((dataset) => (
                    <span
                        key={dataset.key}
                        className="inline-flex items-center gap-1"
                    >
                        <span
                            className="inline-block h-2 w-2 rounded-full"
                            style={{ backgroundColor: dataset.color }}
                        />
                        {dataset.label}
                    </span>
                ))}
            </div>
        </div>
    );
}

function BarChart({ data }: { data: FinancePaymentByMethod }) {
    if (data.labels.length === 0) {
        return (
            <p className="text-sm text-muted-foreground">No payment methods.</p>
        );
    }

    const max = Math.max(1, ...data.data);

    return (
        <div className="space-y-3">
            {data.labels.map((label, index) => (
                <div key={label} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                        <span>{label}</span>
                        <span className="text-muted-foreground">
                            {data.data[index].toLocaleString()}
                        </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-muted">
                        <div
                            className="h-2 rounded-full"
                            style={{
                                width: `${(data.data[index] / max) * 100}%`,
                                backgroundColor: data.colors[index],
                            }}
                        />
                    </div>
                </div>
            ))}
        </div>
    );
}

export default function FinanceReport({
    currencySymbol,
    filters,
    rangeLabel,
    stats,
    revenue,
    paymentByMethod,
    periodOptions,
}: {
    currencySymbol: string;
    filters: FinanceFilters;
    rangeLabel: string;
    stats: FinanceStats;
    revenue: FinanceRevenue;
    paymentByMethod: FinancePaymentByMethod;
    periodOptions: FinancePeriodOption[];
}) {
    const { currentTeam } = usePage().props;
    const teamSlug = currentTeam?.slug;

    const [period, setPeriod] = useState(filters.period);
    const [from, setFrom] = useState(filters.from ?? '');
    const [to, setTo] = useState(filters.to ?? '');

    const statCards = buildStatCards(currencySymbol, stats, rangeLabel);

    function apply(patch: Partial<FinanceFilters>) {
        const next = { ...filters, ...patch };

        router.get(
            finance.url(teamSlug, {
                query: {
                    period: next.period,
                    from: next.from || undefined,
                    to: next.to || undefined,
                },
            }),
            {},
            { preserveState: true, preserveScroll: true, replace: true },
        );
    }

    return (
        <>
            <Head title="Finance summary" />

            <div className="flex w-full flex-col space-y-6 p-4 md:p-6 lg:p-8">
                <Heading
                    variant="small"
                    title="Finance summary"
                    description="Collections and current financial position."
                />

                <FinancialReportSwitcher active="finance" />

                <div className="flex flex-wrap items-end gap-2">
                    <div className="space-y-2">
                        <Label htmlFor="finance-period">Period</Label>
                        <SelectNative
                            id="finance-period"
                            value={period}
                            onChange={(event) => {
                                setPeriod(event.target.value);
                                apply({
                                    period: event.target.value,
                                    from: null,
                                    to: null,
                                });
                            }}
                            className="w-44"
                            data-test="finance-period"
                        >
                            {periodOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </SelectNative>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="finance-from">From</Label>
                        <Input
                            id="finance-from"
                            type="date"
                            value={from}
                            onChange={(event) => setFrom(event.target.value)}
                            className="w-40"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="finance-to">To</Label>
                        <Input
                            id="finance-to"
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
                            apply({ from: from || null, to: to || null })
                        }
                    >
                        Apply
                    </Button>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    {statCards.map((card) => (
                        <Card key={card.title}>
                            <CardHeader className="pb-2">
                                <CardDescription>{card.title}</CardDescription>
                                <CardTitle
                                    className={`text-2xl ${TONE_CLASSES[card.tone]}`}
                                >
                                    {card.value}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-xs text-muted-foreground">
                                    {card.description}
                                </p>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <div className="grid gap-4 lg:grid-cols-3">
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <CardTitle>Revenue overview</CardTitle>
                            <CardDescription>
                                Payment components collected over time.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <LineChart revenue={revenue} />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Amount by payment method</CardTitle>
                            <CardDescription>
                                Payment amounts for the selected period.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <BarChart data={paymentByMethod} />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}

FinanceReport.layout = (props: LayoutProps) => ({
    breadcrumbs: [
        {
            title: 'Finance summary',
            href: finance(props.currentTeam?.slug).url,
        },
    ],
});
