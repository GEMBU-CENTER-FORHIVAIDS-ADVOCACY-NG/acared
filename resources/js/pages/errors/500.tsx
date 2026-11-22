import { Head, Link, router, usePage } from '@inertiajs/react';
import { ServerCrash } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { dashboard, login } from '@/routes';
import { index as teamsIndex } from '@/routes/teams';
import type { Auth, Team } from '@/types';

export default function ServerError() {
    const { auth, currentTeam } = usePage<{
        auth?: Auth;
        currentTeam?: Team | null;
    }>().props;
    const [reloading, setReloading] = useState(false);

    const destination = auth?.user
        ? currentTeam
            ? dashboard(currentTeam.slug)
            : teamsIndex()
        : login();
    const destinationLabel = auth?.user
        ? currentTeam
            ? 'Go to Dashboard'
            : 'Go to Teams'
        : 'Log in';

    const refresh = () =>
        router.reload({
            onStart: () => setReloading(true),
            onFinish: () => setReloading(false),
        });

    return (
        <>
            <Head title="Server Error" />

            <div className="flex min-h-svh items-center justify-center bg-background p-6">
                <div className="w-full max-w-md text-center">
                    <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-muted">
                        <ServerCrash className="size-10 text-muted-foreground" />
                    </div>

                    <h1 className="mb-2 text-2xl font-semibold">
                        Server Error
                    </h1>

                    <p className="mb-8 text-muted-foreground">
                        Something went wrong on our end. Please try again later
                        or contact support if the problem persists.
                    </p>

                    <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
                        <Button asChild>
                            <Link href={destination}>{destinationLabel}</Link>
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            disabled={reloading}
                            onClick={refresh}
                        >
                            {reloading ? 'Refreshing...' : 'Try again'}
                        </Button>
                    </div>
                </div>
            </div>
        </>
    );
}
