import { AppContent } from '@/components/app-content';
import { AppShell } from '@/components/app-shell';
import { AppSidebar } from '@/components/app-sidebar';
import { AppSidebarHeader } from '@/components/app-sidebar-header';
import type { AppLayoutProps } from '@/types';

export default function AppSidebarLayout({
    children,
    breadcrumbs = [],
    headerActions,
}: AppLayoutProps) {
    return (
        <AppShell variant="sidebar">
            <AppSidebar />
            <AppContent variant="sidebar" className="min-w-0 flex-1 overflow-x-clip">
                <div className="flex-1">
                    <AppSidebarHeader breadcrumbs={breadcrumbs} headerActions={headerActions} />
                    {children}
                </div>
                <footer className="mt-4 pb-4 text-center text-xs text-muted-foreground">
                    Powered by{' '}
                    <a
                        href="https://aldids.ng"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-foreground underline underline-offset-4 hover:text-foreground/80"
                    >
                        Aldidscared
                    </a>
                    {' '}with support from{' '}
                    <a
                        href="https://smb.ng"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-foreground underline underline-offset-4 hover:text-foreground/80"
                    >
                        SmartBizness
                    </a>
                </footer>
            </AppContent>
        </AppShell>
    );
}
