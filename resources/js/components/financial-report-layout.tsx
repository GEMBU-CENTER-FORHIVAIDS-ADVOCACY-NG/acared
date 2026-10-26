import { Link, usePage } from '@inertiajs/react';
import { employeeDeduction, finance, priceList, wallet } from '@/routes/reports';
import { index as categorySalesSummaryIndex } from '@/routes/reports/category-sales-summary';
import { index as couponUsagesIndex } from '@/routes/reports/coupon-usages';
import { index as discountsIndex } from '@/routes/reports/discounts';
import { index as paymentMethodSalesSummaryIndex } from '@/routes/reports/payment-method-sales-summary';
import { index as salesIndex } from '@/routes/reports/sales';

export type FinancialReportKey =
    | 'finance'
    | 'sales:item'
    | 'sales:category'
    | 'sales:patient'
    | 'sales:method'
    | 'sales:category-summary'
    | 'sales:payment-method-summary'
    | 'coupon-usages'
    | 'discounts'
    | 'wallet'
    | 'employee-deduction'
    | 'price-list';

type SidebarItem = {
    key: FinancialReportKey;
    title: string;
    getUrl: (team: string) => string;
};

const SIDEBAR_ITEMS: SidebarItem[] = [
    {
        key: 'finance',
        title: 'Finance summary',
        getUrl: (team) => finance.url({ current_team: team }),
    },
    {
        key: 'sales:item',
        title: 'Sales by item',
        getUrl: (team) =>
            salesIndex.url({ current_team: team, dimension: 'item' }),
    },
    {
        key: 'sales:category',
        title: 'Sales by category',
        getUrl: (team) =>
            salesIndex.url({ current_team: team, dimension: 'category' }),
    },
    {
        key: 'sales:patient',
        title: 'Sales by patient',
        getUrl: (team) =>
            salesIndex.url({ current_team: team, dimension: 'patient' }),
    },
    {
        key: 'sales:method',
        title: 'Sales by payment method',
        getUrl: (team) =>
            salesIndex.url({ current_team: team, dimension: 'method' }),
    },
    {
        key: 'sales:category-summary',
        title: 'Sales by category summary',
        getUrl: (team) =>
            categorySalesSummaryIndex.url({ current_team: team }),
    },
    {
        key: 'sales:payment-method-summary',
        title: 'Sales by payment method summary',
        getUrl: (team) =>
            paymentMethodSalesSummaryIndex.url({ current_team: team }),
    },
    {
        key: 'coupon-usages',
        title: 'Coupon usage report',
        getUrl: (team) => couponUsagesIndex.url({ current_team: team }),
    },
    {
        key: 'discounts',
        title: 'Discount report',
        getUrl: (team) => discountsIndex.url({ current_team: team }),
    },
    {
        key: 'wallet',
        title: 'Wallet report',
        getUrl: (team) => wallet.url({ current_team: team }),
    },
    {
        key: 'employee-deduction',
        title: 'Employee deduction',
        getUrl: (team) => employeeDeduction.url({ current_team: team }),
    },
    {
        key: 'price-list',
        title: 'Price list report',
        getUrl: (team) => priceList.url({ current_team: team }),
    },
];

export function FinancialReportLayout({
    children,
    active,
}: {
    children: React.ReactNode;
    active: FinancialReportKey | `sales:${string}`;
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
