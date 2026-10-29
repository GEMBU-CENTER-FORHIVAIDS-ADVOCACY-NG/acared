import { Link, usePage } from '@inertiajs/react';
import {
    Banknote,
    Beaker,
    BookOpen,
    ChartBar,
    ClipboardList,
    FlaskConical,
    Heart,
    History,
    LayoutGrid,
    MessageSquare,
    Package,
    Pill,
    ReceiptText,
    ScrollText,
    Stethoscope,
    SwatchBook,
    Users,
    Wallet,
    Baby,
} from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { TeamSwitcher } from '@/components/team-switcher';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { usePermissions } from '@/hooks/use-permissions';
import { dashboard } from '@/routes';
import {
    index as billingsIndex,
    history as billingsHistory,
} from '@/routes/billings';
import { index as categoriesIndex } from '@/routes/categories';
import {
    index as consultationsIndex,
    history as consultationsHistory,
} from '@/routes/consultations';
import { index as patientsIndex } from '@/routes/patients';
import { index as receptionIndex } from '@/routes/reception';
import { index as laboratoriesIndex } from '@/routes/laboratories';
import { index as labIntakeIndex } from '@/routes/lab-intake';
import { index as labInventoriesIndex } from '@/routes/lab-inventories';
import { index as priceListsIndex } from '@/routes/price-lists';
import { index as pharmacyDrugFormsIndex } from '@/routes/pharmacy/drug-forms';
import { index as pharmacyInventoriesIndex } from '@/routes/pharmacy/inventories';
import { index as pharmacyPrescriptionsIndex } from '@/routes/pharmacy/prescriptions';
import { index as inventoryVendorsIndex } from '@/routes/vendors';
import { index as inventoryStockIndex } from '@/routes/inventory/stock';
import { index as purchaseOrdersIndex } from '@/routes/purchase-orders';
import { index as wardsIndex } from '@/routes/nursing/wards';
import { index as walletHistoryIndex } from '@/routes/finance/wallet-history';
import { index as nursingRecordsIndex, history as nursingRecordsHistory } from '@/routes/nursing/records';
import { laboratory as laboratoryReport } from '@/routes/reports';
import { index as financialReportsIndex } from '@/routes/reports/financial';
import { index as clinicalReportsIndex } from '@/routes/reports/clinical';
import { index as stockReportsIndex } from '@/routes/reports/stock';
import { index as activityLogsIndex } from '@/routes/reports/activity-logs';
import { index as wardRoundsIndex } from '@/routes/nursing/ward-rounds';
import { index as chatIndex } from '@/routes/chat';
import type { NavItem } from '@/types';

export function AppSidebar() {
    const page = usePage();
    const can = usePermissions();
    const dashboardUrl = page.props.currentTeam
        ? dashboard(page.props.currentTeam.slug)
        : '/';

    const mainNavItems: NavItem[] = [
        {
            title: 'Dashboard',
            href: dashboardUrl,
            icon: LayoutGrid,
        },
    ];

    const receptionNavItems: NavItem[] = [
        {
            title: 'Reception',
            href: page.props.currentTeam
                ? receptionIndex(page.props.currentTeam.slug)
                : '/reception',
            icon: Stethoscope,
        },
        {
            title: 'Patients',
            href: page.props.currentTeam
                ? patientsIndex(page.props.currentTeam.slug)
                : '/patients',
            icon: Users,
        },
        {
            title: 'Categories',
            href: page.props.currentTeam
                ? categoriesIndex(page.props.currentTeam.slug)
                : '/categories',
            icon: SwatchBook,
        },
    ];

    const consultationNavItems: NavItem[] = [
        {
            title: 'Consultations',
            href: page.props.currentTeam
                ? consultationsIndex(page.props.currentTeam.slug)
                : '/consultations',
            icon: Stethoscope,
        },
        {
            title: 'Appointment History',
            href: page.props.currentTeam
                ? consultationsHistory(page.props.currentTeam.slug)
                : '/consultations/history',
            icon: ClipboardList,
        },
    ];

    const laboratoryNavItems: NavItem[] = [
        {
            title: 'Lab requests',
            href: page.props.currentTeam
                ? laboratoriesIndex(page.props.currentTeam.slug)
                : '/laboratories',
            icon: Beaker,
        },
        {
            title: 'Lab inventory',
            href: page.props.currentTeam
                ? labInventoriesIndex(page.props.currentTeam.slug)
                : '/lab-inventories',
            icon: Package,
        },
        {
            title: 'Lab intake',
            href: page.props.currentTeam
                ? labIntakeIndex(page.props.currentTeam.slug)
                : '/lab-intake',
            icon: FlaskConical,
        },
        {
            title: 'Lab investigation',
            href: page.props.currentTeam
                ? laboratoryReport(page.props.currentTeam.slug)
                : '/reports/laboratory',
            icon: ChartBar,
        },
    ];

    const financeNavItems: NavItem[] = [
        {
            title: 'Billings',
            href: page.props.currentTeam
                ? billingsIndex(page.props.currentTeam.slug)
                : '/billings',
            icon: Banknote,
        },
        {
            title: 'Billing history',
            href: page.props.currentTeam
                ? billingsHistory(page.props.currentTeam.slug)
                : '/billings/history',
            icon: ReceiptText,
        },
        {
            title: 'Wallet history',
            href: page.props.currentTeam
                ? walletHistoryIndex(page.props.currentTeam.slug)
                : '/finance/wallet-history',
            icon: Wallet,
        },
    ];

    const pharmacyNavItems: NavItem[] = [
        {
            title: 'Prescriptions',
            href: page.props.currentTeam
                ? pharmacyPrescriptionsIndex(page.props.currentTeam.slug)
                : '/pharmacy/prescriptions',
            icon: ClipboardList,
        },
        {
            title: 'Medication inventory',
            href: page.props.currentTeam
                ? pharmacyInventoriesIndex(page.props.currentTeam.slug)
                : '/pharmacy/inventories',
            icon: Pill,
        },
        {
            title: 'Drug forms',
            href: page.props.currentTeam
                ? pharmacyDrugFormsIndex(page.props.currentTeam.slug)
                : '/pharmacy/drug-forms',
            icon: Package,
        },
    ];

    const nursingNavItems: NavItem[] = [
        {
            title: 'Maternity',
            href: page.props.currentTeam
                ? nursingRecordsIndex.url(page.props.currentTeam.slug)
                : '/nursing/records',
            icon: Baby,
        },
        {
            title: 'ANC History',
            href: page.props.currentTeam
                ? nursingRecordsHistory.url(page.props.currentTeam.slug)
                : '/nursing/records/history',
            icon: History,
        },
        {
            title: 'Wards and beds',
            href: page.props.currentTeam
                ? wardsIndex.url(page.props.currentTeam.slug)
                : '/nursing/wards',
            icon: Heart,
        },
        {
            title: 'Ward rounds',
            href: page.props.currentTeam
                ? wardRoundsIndex.url(page.props.currentTeam.slug)
                : '/nursing/ward-rounds',
            icon: ClipboardList,
        },
    ];

    const inventoryNavItems: NavItem[] = [
        {
            title: 'Stock',
            href: page.props.currentTeam
                ? inventoryStockIndex.url(page.props.currentTeam.slug)
                : '/inventory/stock',
            icon: Package,
        },
        {
            title: 'Purchase Orders',
            href: page.props.currentTeam
                ? purchaseOrdersIndex.url(page.props.currentTeam.slug)
                : '/purchase-orders',
            icon: ReceiptText,
        },
        {
            title: 'Vendors',
            href: page.props.currentTeam
                ? inventoryVendorsIndex.url(page.props.currentTeam.slug)
                : '/vendors',
            icon: Users,
        },
    ];

    const footerNavItems: NavItem[] = [
        {
            title: 'Financial reports',
            href: page.props.currentTeam
                ? financialReportsIndex.url({
                      current_team: page.props.currentTeam.slug,
                  })
                : '/reports/financial',
            icon: Banknote,
        },
        {
            title: 'Clinical reports',
            href: page.props.currentTeam
                ? clinicalReportsIndex.url({
                      current_team: page.props.currentTeam.slug,
                  })
                : '/reports/clinical',
            icon: Stethoscope,
        },
        {
            title: 'Stock reports',
            href: page.props.currentTeam
                ? stockReportsIndex.url({
                      current_team: page.props.currentTeam.slug,
                  })
                : '/reports/stock',
            icon: Package,
        },
        {
            title: 'Activity logs',
            href: page.props.currentTeam
                ? activityLogsIndex.url({
                      current_team: page.props.currentTeam.slug,
                  })
                : '/reports/activity-logs',
            icon: ScrollText,
        },
        {
            title: 'Documentation',
            href: '/docs/api',
            icon: BookOpen,
            external: true,
        },
    ];

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboardUrl} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <TeamSwitcher />
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
                {can.canViewPage('reception') && <NavMain items={receptionNavItems} label="Reception" />}
                {can.canViewPage('consultations') && <NavMain items={consultationNavItems} label="Consultation" />}
                {can.canViewPage('laboratories') && <NavMain items={laboratoryNavItems} label="Laboratory" />}
                {can.canViewPage('pharmacy') && <NavMain items={pharmacyNavItems} label="Pharmacy" />}
                {can.canViewPage('nursing') && <NavMain items={nursingNavItems} label="Nursing" />}
                {can.canViewPage('inventory') && <NavMain items={inventoryNavItems} label="Inventory" />}
                {can.canViewPage('finance') && <NavMain items={financeNavItems} label="Finance" />}
                <NavMain
                    items={[{
                        title: 'Chat',
                        href: page.props.currentTeam
                            ? chatIndex(page.props.currentTeam.slug)
                            : '/chat',
                        icon: MessageSquare,
                    }]}
                    label="Chat"
                />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
