import { Link, usePage } from '@inertiajs/react';
import { index as clinicalReportsIndex } from '@/routes/reports/clinical';
import { index as laboratoryTestsIndex } from '@/routes/reports/laboratory-tests';

export type ClinicalReportKey =
    | 'dashboard'
    | 'complaints'
    | 'diagnoses'
    | 'examinations'
    | 'laboratory-tests';

type SidebarItem = {
    key: ClinicalReportKey;
    title: string;
    getUrl: (team: string) => string;
};

const SIDEBAR_ITEMS: SidebarItem[] = [
    {
        key: 'dashboard',
        title: 'Clinical overview',
        getUrl: (team) =>
            clinicalReportsIndex.url({ current_team: team }),
    },
    {
        key: 'complaints',
        title: 'Complaints report',
        getUrl: (team) =>
            clinicalReportsIndex.url({ current_team: team, report: 'complaints' }),
    },
    {
        key: 'diagnoses',
        title: 'Diagnoses report',
        getUrl: (team) =>
            clinicalReportsIndex.url({ current_team: team, report: 'diagnoses' }),
    },
    {
        key: 'examinations',
        title: 'Examinations report',
        getUrl: (team) =>
            clinicalReportsIndex.url({ current_team: team, report: 'examinations' }),
    },
    {
        key: 'laboratory-tests',
        title: 'Laboratory tests report',
        getUrl: (team) =>
            laboratoryTestsIndex.url({ current_team: team }),
    },
];

export function ClinicalReportLayout({
    children,
    active,
}: {
    children: React.ReactNode;
    active: ClinicalReportKey;
}) {
    const team = usePage().props.currentTeam?.slug ?? '';

    return (
        <div className="flex w-full min-h-[calc(100vh-8rem)]">
                <aside className="w-64 flex-shrink-0 border-r bg-muted/30 p-4">
                    <nav className="space-y-1">
                        {SIDEBAR_ITEMS.map((item) => {
                            const href = item.getUrl(team);
                            const isActive = item.key === active;

                            return (
                                <Link
                                    key={item.key}
                                    href={href}
                                    className={`block rounded-lg px-3 py-2 text-sm transition-colors ${
                                        isActive
                                            ? 'bg-muted font-medium text-foreground'
                                            : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                                    }`}
                                >
                                    {item.title}
                                </Link>
                            );
                        })}
                    </nav>
                </aside>

            {/* Main Content */}
            <main className="flex-1 p-4 md:p-6 lg:p-8">{children}</main>
        </div>
    );
}
