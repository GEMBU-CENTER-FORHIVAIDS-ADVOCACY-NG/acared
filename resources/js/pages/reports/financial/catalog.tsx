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
import { index as couponUsagesIndex } from '@/routes/reports/coupon-usages';
import { index as discountsIndex } from '@/routes/reports/discounts';
import { index as salesIndex } from '@/routes/reports/sales';

type Report = {
    key: string;
    title: string;
    description: string;
};

const reportUrls: Record<string, (team: string) => string> = {
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
    discounts: (team) => discountsIndex.url({ current_team: team }),
    wallet: (team) => wallet.url({ current_team: team }),
    'price-list': (team) => priceList.url({ current_team: team }),
};

export default function FinancialReportCatalog({
    reports,
}: {
    reports: Report[];
}) {
    const team = usePage().props.currentTeam?.slug ?? '';

    return (
        <>
            <Head title="Financial reports" />
            <div className="flex w-full flex-col space-y-6 p-4 md:p-6 lg:p-8">
                <Heading
                    variant="small"
                    title="Financial reports"
                    description="Review revenue, sales and finance operations by report type."
                />
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {reports.map((report) => {
                        const href = reportUrls[report.key]?.(team);

                        return (
                            <Card key={report.key}>
                                <CardHeader>
                                    <CardTitle>{report.title}</CardTitle>
                                    <CardDescription>
                                        {report.description}
                                    </CardDescription>
                                </CardHeader>
                                {href && (
                                    <CardContent>
                                        <Button variant="outline" asChild>
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
            </div>
        </>
    );
}
