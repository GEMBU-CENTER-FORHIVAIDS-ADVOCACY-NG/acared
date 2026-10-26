import { Link, usePage } from '@inertiajs/react';
import AppLogoIcon from '@/components/app-logo-icon';
import ThemeSwitch from '@/components/theme-switch';
import { home } from '@/routes';
import { getDailyQuote } from '@/lib/quotes';
import type { AuthLayoutProps } from '@/types';

export default function AuthSplitLayout({
    children,
    title,
    description,
}: AuthLayoutProps) {
    const { name } = usePage().props;
    const quote = getDailyQuote();

    return (
        <div className="relative grid h-dvh flex-col items-center justify-center px-8 sm:px-0 lg:max-w-none lg:grid-cols-2 lg:px-0">
            <div className="absolute right-4 top-4 z-50">
                <ThemeSwitch />
            </div>
            <div
                className="relative hidden h-full flex-col bg-muted p-10 text-white lg:flex dark:border-r"
                style={{
                    backgroundImage: "url('/background1.jpg')",
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                }}
            >
                <div className="absolute inset-0 bg-black/50" />
                <Link
                    href={home()}
                    className="relative z-20 flex items-center text-lg font-medium"
                >
                    <AppLogoIcon className="mr-2 size-8" />
                    {name}
                </Link>
                <div className="relative z-20 mt-auto flex flex-col justify-end p-10">
                    <blockquote className="space-y-4">
                        <p className="text-lg font-medium leading-relaxed italic">
                            "{quote.text}"
                        </p>
                        <footer className="text-sm text-white/70">
                            — {quote.author}
                        </footer>
                    </blockquote>
                </div>
            </div>
            <div className="w-full lg:p-8">
                <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
                    <Link
                        href={home()}
                        className="relative z-20 flex items-center justify-center lg:hidden"
                    >
                        <AppLogoIcon className="h-10 sm:h-12" />
                    </Link>
                    <div className="flex flex-col items-start gap-2 text-left sm:items-center sm:text-center">
                        <h1 className="text-xl font-medium">{title}</h1>
                        <p className="text-sm text-balance text-muted-foreground">
                            {description}
                        </p>
                    </div>
                    {children}

                    <footer className="text-center text-xs text-muted-foreground">
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
                </div>
            </div>
        </div>
    );
}
