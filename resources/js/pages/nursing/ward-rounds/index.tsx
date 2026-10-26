import { Head, Link, router, usePage } from '@inertiajs/react';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SelectNative } from '@/components/ui/select-native';
import { index, show } from '@/routes/nursing/ward-rounds';

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

type Bed = {
    id: number;
    name: string;
    status: string;
    admissionId: number | null;
    patientId: string | null;
    patientRecordId: number | null;
    patientName: string | null;
    doctorName: string | null;
    admissionStatus: string | null;
    admittedAt: string | null;
};
type Ward = {
    id: number;
    name: string;
    description: string | null;
    bedsCount: number;
    occupiedBedsCount: number;
    patientsCount: number;
    status: string;
    beds: Bed[];
};
export default function WardRoundsIndex({
    filters,
    counts,
    wards,
}: {
    filters: { dateFilter: string };
    counts: {
        total: number;
        discharged: number;
        admitted: number;
        pending: number;
    };
    wards: Ward[];
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
            <Head title="Ward rounds" />
            <div className="flex w-full flex-col space-y-6 p-4 md:p-6 lg:p-8">
                <Heading
                    variant="small"
                    title="Ward rounds"
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
                {wards.length ? (
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                        {wards.map((ward) => (
                            <Card key={ward.id}>
                                <CardHeader>
                                    <CardTitle className="flex items-center justify-between gap-2">
                                        <span>{ward.name}</span>
                                        <span
                                            className={`rounded-full px-2 py-1 text-xs ${ward.status === 'Occupied' ? 'bg-destructive/10 text-destructive' : ward.status === 'Partially occupied' ? 'bg-amber-500/10 text-amber-700' : 'bg-emerald-500/10 text-emerald-700'}`}
                                        >
                                            {ward.status}
                                        </span>
                                    </CardTitle>
                                    <p className="text-sm text-muted-foreground">
                                        {ward.description ?? 'No description'}
                                    </p>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="flex justify-between text-sm">
                                        <span>Beds occupied</span>
                                        <span className="font-medium">
                                            {ward.occupiedBedsCount} /{' '}
                                            {ward.bedsCount}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span>Active patients</span>
                                        <span className="font-medium">
                                            {ward.patientsCount}
                                        </span>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {ward.beds.slice(0, 8).map((bed) => (
                                            <span
                                                key={bed.id}
                                                title={
                                                    bed.patientName ??
                                                    bed.status
                                                }
                                                className={`rounded border px-2 py-1 text-xs ${bed.status === 'occupied' ? 'border-destructive/40 bg-destructive/5' : ''}`}
                                            >
                                                {bed.name}
                                            </span>
                                        ))}
                                        {ward.beds.length > 8 && (
                                            <span className="px-2 py-1 text-xs text-muted-foreground">
                                                +{ward.beds.length - 8} more
                                            </span>
                                        )}
                                    </div>
                                    <Button variant="outline" asChild>
                                        <Link
                                            href={show.url({
                                                current_team: team,
                                                ward: ward.id,
                                            })}
                                        >
                                            Open ward
                                        </Link>
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <p className="rounded-lg border py-10 text-center text-muted-foreground">
                        No wards have been set up yet.
                    </p>
                )}
            </div>
        </>
    );
}
