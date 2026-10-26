import { Link, usePage } from '@inertiajs/react';
import { index as stockReportsIndex } from '@/routes/reports/stock';

export type StockReportKey =
    | 'dashboard'
    | 'purchased'
    | 'used'
    | 'dispensed'
    | 'damaged'
    | 'donated'
    | 'other'
    | 'returned'
    | 'transferred'
    | 'correction';

type SidebarItem = {
    key: StockReportKey;
    title: string;
    getUrl: (team: string) => string;
};

const SIDEBAR_ITEMS: SidebarItem[] = [
    {
        key: 'dashboard',
        title: 'Stock overview',
        getUrl: (team) =>
            stockReportsIndex.url({ current_team: team }),
    },
    {
        key: 'purchased',
        title: 'Purchased stock',
        getUrl: (team) =>
            stockReportsIndex.url({ current_team: team, report: 'purchased' }),
    },
    {
        key: 'used',
        title: 'Used stock',
        getUrl: (team) =>
            stockReportsIndex.url({ current_team: team, report: 'used' }),
    },
    {
        key: 'dispensed',
        title: 'Dispensed stock',
        getUrl: (team) =>
            stockReportsIndex.url({ current_team: team, report: 'dispensed' }),
    },
    {
        key: 'damaged',
        title: 'Damaged stock',
        getUrl: (team) =>
            stockReportsIndex.url({ current_team: team, report: 'damaged' }),
    },
    {
        key: 'donated',
        title: 'Donated stock',
        getUrl: (team) =>
            stockReportsIndex.url({ current_team: team, report: 'donated' }),
    },
    {
        key: 'other',
        title: 'Other stock',
        getUrl: (team) =>
            stockReportsIndex.url({ current_team: team, report: 'other' }),
    },
    {
        key: 'returned',
        title: 'Returned stock',
        getUrl: (team) =>
            stockReportsIndex.url({ current_team: team, report: 'returned' }),
    },
    {
        key: 'transferred',
        title: 'Transferred stock',
        getUrl: (team) =>
            stockReportsIndex.url({ current_team: team, report: 'transferred' }),
    },
    {
        key: 'correction',
        title: 'Stock count adjustments',
        getUrl: (team) =>
            stockReportsIndex.url({ current_team: team, report: 'correction' }),
    },
];

export function StockReportLayout({
    children,
    active,
}: {
    children: React.ReactNode;
    active: StockReportKey;
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
