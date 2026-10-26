import { router, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { priceList, wallet } from '@/routes/reports';
import { index as couponUsagesIndex } from '@/routes/reports/coupon-usages';
import { index as discountsIndex } from '@/routes/reports/discounts';
import { index as financialReportsIndex } from '@/routes/reports/financial';
import { index as salesIndex } from '@/routes/reports/sales';

export type FinancialReportKey =
    | 'finance'
    | 'sales'
    | 'coupon-usages'
    | 'discounts'
    | 'wallet'
    | 'price-list';

type SwitcherItem = {
    key: FinancialReportKey;
    label: string;
    getUrl: (team: string) => string;
};

const ITEMS: SwitcherItem[] = [
    {
        key: 'finance',
        label: 'Finance summary',
        getUrl: (team) => financialReportsIndex.url({ current_team: team }),
    },
    {
        key: 'sales',
        label: 'Sales',
        getUrl: (team) =>
            salesIndex.url({ current_team: team, dimension: 'item' }),
    },
    {
        key: 'coupon-usages',
        label: 'Coupon usages',
        getUrl: (team) => couponUsagesIndex.url({ current_team: team }),
    },
    {
        key: 'discounts',
        label: 'Discounts',
        getUrl: (team) => discountsIndex.url({ current_team: team }),
    },
    {
        key: 'wallet',
        label: 'Wallet',
        getUrl: (team) => wallet.url({ current_team: team }),
    },
    {
        key: 'price-list',
        label: 'Price list',
        getUrl: (team) => priceList.url({ current_team: team }),
    },
];

export function FinancialReportSwitcher({
    active,
}: {
    active: FinancialReportKey;
}) {
    const team = usePage().props.currentTeam?.slug ?? '';

    return (
        <div className="flex flex-wrap gap-2">
            {ITEMS.map((item) => (
                <Button
                    key={item.key}
                    size="sm"
                    variant={item.key === active ? 'default' : 'outline'}
                    onClick={() => {
                        if (item.key !== active) {
                            router.get(
                                item.getUrl(team),
                                {},
                                { preserveState: false },
                            );
                        }
                    }}
                >
                    {item.label}
                </Button>
            ))}
        </div>
    );
}
