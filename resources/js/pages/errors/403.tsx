import { Head, Link } from '@inertiajs/react';
import { ShieldAlert } from 'lucide-react';
import { home } from '@/routes';
import { Button } from '@/components/ui/button';

export default function Forbidden() {
    return (
        <>
            <Head title="Forbidden" />

            <div className="flex min-h-svh items-center justify-center bg-background p-6">
                <div className="w-full max-w-md text-center">
                    <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-muted">
                        <ShieldAlert className="size-10 text-muted-foreground" />
                    </div>

                    <h1 className="mb-2 text-2xl font-semibold">Access Denied</h1>

                    <p className="mb-8 text-muted-foreground">
                        Sorry, you don't have permission to access this page. Please contact your
                        administrator if you believe this is an error.
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
