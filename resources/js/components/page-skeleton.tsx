import { Skeleton } from '@/components/ui/skeleton';

export default function PageSkeleton() {
    return (
        <div className="flex w-full flex-col space-y-6 p-4 md:p-6 lg:p-8">
            {/* Page header */}
            <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <Skeleton className="h-7 w-48" />
                    <Skeleton className="mt-2 h-4 w-72" />
                </div>
                <div className="flex items-end gap-2">
                    <Skeleton className="h-9 w-32" />
                    <Skeleton className="h-9 w-32" />
                    <Skeleton className="h-9 w-24" />
                </div>
            </div>

            {/* KPI cards grid */}
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                    <div
                        key={i}
                        className="rounded-lg border bg-card p-4 space-y-3"
                    >
                        <div className="flex items-start justify-between">
                            <div>
                                <Skeleton className="h-3 w-24" />
                                <Skeleton className="mt-2 h-6 w-20" />
                            </div>
                            <Skeleton className="size-4 rounded-full" />
                        </div>
                        <div className="flex items-end justify-between gap-3">
                            <Skeleton className="h-3 w-32" />
                            <Skeleton className="h-9 w-30" />
                        </div>
                    </div>
                ))}
            </div>

            {/* Two-column section */}
            <div className="grid gap-4 lg:grid-cols-2">
                {Array.from({ length: 2 }).map((_, i) => (
                    <div
                        key={i}
                        className="rounded-lg border bg-card p-5 space-y-3"
                    >
                        <Skeleton className="h-5 w-36" />
                        <Skeleton className="h-4 w-56" />
                        <div className="space-y-3 pt-2">
                            {Array.from({ length: 4 }).map((_, j) => (
                                <div key={j} className="space-y-1.5">
                                    <div className="flex items-center justify-between">
                                        <Skeleton className="h-3 w-20" />
                                        <Skeleton className="h-3 w-10" />
                                    </div>
                                    <Skeleton className="h-2 w-full" />
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* Table section */}
            <div className="rounded-lg border bg-card p-5 space-y-3">
                <Skeleton className="h-5 w-44" />
                <Skeleton className="h-4 w-64" />
                <div className="space-y-2 pt-2">
                    <Skeleton className="h-10 w-full" />
                    {Array.from({ length: 5 }).map((_, i) => (
                        <Skeleton key={i} className="h-10 w-full" />
                    ))}
                </div>
            </div>
        </div>
    );
}
