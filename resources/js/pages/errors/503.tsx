import { Head, Link } from '@inertiajs/react';
import { Construction } from 'lucide-react';
import { home } from '@/routes';
import { Button } from '@/components/ui/button';

export default function ServiceUnavailable() {
    return (
        <>
            <Head title="Service Unavailable" />

            <div className="flex min-h-svh items-center justify-center bg-background p-6">
                <div className="w-full max-w-md text-center">
                    <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-muted">
                        <Construction className="size-10 text-muted-foreground" />
                    </div>

                    <h1 className="mb-2 text-2xl font-semibold">Service Unavailable</h1>

                    <p className="mb-8 text-muted-foreground">
                        We're currently undergoing maintenance. Please check back soon.
                    </p>

                    <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
                        <Link href={home()}>
                            <Button>Go to Dashboard</Button>
                        </Link>
                    </div>
                </div>
            </div>
        </>
    );
}
