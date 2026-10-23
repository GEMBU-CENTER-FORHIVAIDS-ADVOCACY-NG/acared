import { Head, Link, usePage } from '@inertiajs/react';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { finance, priceList, wallet } from '@/routes/reports';
import { index as clinicalIndex } from '@/routes/reports/clinical';
import { index as couponUsagesIndex } from '@/routes/reports/coupon-usages';
import { index as salesIndex } from '@/routes/reports/sales';

type Report = {
    key: string;
    title: string;
    description: string;
};

type ReportGroup = {
    key: string;
    title: string;
    description: string;
    reports: Report[];
};

const reportUrls: Record<
    string,
    ((currentTeam: string) => string) | undefined
> = {
    finance: (team) => finance.url({ current_team: team }),
    'sales:item': (team) =>
        salesIndex.url({ current_team: team, dimension: 'item' }),
    'sales:department': (team) =>
        salesIndex.url({ current_team: team, dimension: 'department' }),
    'sales:patient': (team) =>
        salesIndex.url({ current_team: team, dimension: 'patient' }),
    'sales:method': (team) =>
        salesIndex.url({ current_team: team, dimension: 'method' }),
    'coupon-usages': (team) => couponUsagesIndex.url({ current_team: team }),
    wallet: (team) => wallet.url({ current_team: team }),
    'price-list': (team) => priceList.url({ current_team: team }),
    'clinical:complaints': (team) =>
        clinicalIndex.url({ current_team: team, report: 'complaints' }),
    'clinical:diagnoses': (team) =>
        clinicalIndex.url({ current_team: team, report: 'diagnoses' }),
    'clinical:examinations': (team) =>
        clinicalIndex.url({ current_team: team, report: 'examinations' }),
};

export default function ReportCatalog({ groups }: { groups: ReportGroup[] }) {
    const team = usePage().props.currentTeam?.slug ?? '';

    return (
        <>
            <Head title="Reports" />
            <div className="flex w-full flex-col space-y-6 p-4 md:p-6 lg:p-8">
                <Heading
                    variant="small"
                    title="Reports"
                    description="Review financial and clinical reports for this team."
                />
                {groups.map((group) => (
                    <section key={group.key} className="space-y-4">
                        <div>
                            <h3 className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">
                                {group.title}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                                {group.description}
                            </p>
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                            {group.reports.map((report) => {
                                const href = reportUrls[report.key]?.(team);

                                return (
                                    <Card key={report.key}>
                                        <CardHeader>
                                            <CardTitle>
                                                {report.title}
                                            </CardTitle>
                                            <CardDescription>
                                                {report.description}
                                            </CardDescription>
                                        </CardHeader>
                                        {href && (
                                            <CardContent>
                                                <Button
                                                    variant="outline"
                                                    asChild
                                                >
                                                    <Link href={href}>
                                                        Open report
                                                    </Link>
                                                </Button>
                                            </CardContent>
                                        )}
                                    </Card>
                                );
                            })}
                        </div>
                    </section>
                ))}
            </div>
        </>
    );
}
