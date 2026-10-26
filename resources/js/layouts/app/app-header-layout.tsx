import { AppContent } from '@/components/app-content';
import { AppHeader } from '@/components/app-header';
import { AppShell } from '@/components/app-shell';
import type { AppLayoutProps } from '@/types';

export default function AppHeaderLayout({
    children,
    breadcrumbs,
}: AppLayoutProps) {
    return (
        <AppShell variant="header">
            <AppHeader breadcrumbs={breadcrumbs} />
            <AppContent variant="header" className="flex-1">
                <div className="flex-1">
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
