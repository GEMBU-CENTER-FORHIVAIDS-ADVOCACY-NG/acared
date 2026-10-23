import { Head, Link, usePage } from '@inertiajs/react';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { index } from '@/routes/reports/stock';
export default function StockReportCatalog({
    reports,
}: {
    reports: Record<string, string>;
}) {
    const team = usePage().props.currentTeam?.slug ?? '';
    return (
        <>
            <Head title="Stock reports" />
            <div className="flex w-full flex-col space-y-6 p-4 md:p-6 lg:p-8">
                <Heading
                    variant="small"
                    title="Stock reports"
                    description="Review stock movements by report type."
                />
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {Object.entries(reports).map(([key, title]) => (
                        <Card key={key}>
                            <CardHeader>
                                <CardTitle>{title}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Button variant="outline" asChild>
                                    <Link
                                        href={index.url({
                                            current_team: team,
                                            report: key,
                                        })}
                                    >
                                        Open report
                                    </Link>
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </>
    );
}
