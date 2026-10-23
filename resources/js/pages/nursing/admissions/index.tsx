import { Head, router, usePage } from '@inertiajs/react';
import Heading from '@/components/heading';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SelectNative } from '@/components/ui/select-native';
import { index } from '@/routes/nursing/admissions';

const PERIODS = [
    ['today', 'Today'],
    ['yesterday', 'Yesterday'],
    ['this_week', 'This week'],
    ['last_week', 'Last week'],
    ['this_month', 'This month'],
    ['last_month', 'Last month'],
    ['this_year', 'This year'],
    ['last_year', 'Last year'],
] as const;

export default function AdmissionsOverview({
    filters,
    counts,
}: {
    filters: { dateFilter: string };
    counts: {
        total: number;
        discharged: number;
        admitted: number;
        pending: number;
    };
}) {
    const team = usePage().props.currentTeam?.slug ?? '';
    const periodLabel =
        PERIODS.find(([key]) => key === filters.dateFilter)?.[1] ?? 'Today';
    const cards = [
        {
            title: 'Awaiting admission',
            value: counts.pending,
            description: `Pending admission ${periodLabel.toLowerCase()}`,
            tone: 'text-rose-600',
        },
        {
            title: 'Admitted patients',
            value: counts.admitted,
            description: `Admitted ${periodLabel.toLowerCase()}`,
            tone: 'text-emerald-600',
        },
        {
            title: 'Total requests',
            value: counts.total,
            description: `Total ${periodLabel.toLowerCase()}`,
            tone: 'text-indigo-600',
        },
        {
            title: 'Discharged patients',
            value: counts.discharged,
            description: `Discharged ${periodLabel.toLowerCase()}`,
            tone: 'text-sky-600',
        },
    ];

    return (
        <>
            <Head title="Admission overview" />
            <div className="flex w-full flex-col space-y-6 p-4 md:p-6 lg:p-8">
                <Heading
                    variant="small"
                    title="Admission overview"
                    description="Admission requests, admitted patients, and discharges."
                />
                <SelectNative
                    aria-label="Date range"
                    value={filters.dateFilter}
                    onChange={(event) =>
                        router.get(
                            index.url(team, {
                                query: { date_filter: event.target.value },
                            }),
                            {},
                            { preserveScroll: true, replace: true },
                        )
                    }
                    className="w-48"
                >
                    {PERIODS.map(([value, label]) => (
                        <option key={value} value={value}>
                            {label}
                        </option>
                    ))}
                </SelectNative>
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    {cards.map((card) => (
                        <Card key={card.title}>
                            <CardHeader className="pb-2">
                                <CardTitle className={`text-2xl ${card.tone}`}>
                                    {card.value.toLocaleString()}
                                </CardTitle>
                                <p className="text-sm text-muted-foreground">
                                    {card.title}
                                </p>
                            </CardHeader>
                            <CardContent>
                                <p className="text-xs text-muted-foreground">
                                    {card.description}
                                </p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </>
    );
}
