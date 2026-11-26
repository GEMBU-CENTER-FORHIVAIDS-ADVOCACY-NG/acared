import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SelectNative } from '@/components/ui/select-native';
import { cn } from '@/lib/utils';

export type PaginationMeta = {
    currentPage: number;
    lastPage: number;
    perPage: number;
    total: number;
};

type PaginationProps = {
    meta: PaginationMeta;
    perPageOptions?: number[];
    onPageChange: (page: number) => void;
    onPerPageChange: (perPage: number) => void;
    className?: string;
};

export default function Pagination({
    meta,
    perPageOptions = [10, 25, 50, 100],
    onPageChange,
    onPerPageChange,
    className,
}: PaginationProps) {
    const from =
        meta.total === 0 ? 0 : (meta.currentPage - 1) * meta.perPage + 1;
    const to = Math.min(meta.currentPage * meta.perPage, meta.total);

    return (
        <div
            className={cn(
                'flex w-full flex-col items-center justify-between gap-3 sm:flex-row sm:flex-wrap',
                className,
            )}
        >
            <div className="flex min-w-0 flex-wrap items-center gap-2 text-sm text-muted-foreground">
                <span className="whitespace-nowrap">
                    Showing {from} to {to} of {meta.total.toLocaleString()}
                </span>
                <SelectNative
                    aria-label="Rows per page"
                    searchable={false}
                    className="h-8 min-h-8 w-32 shrink-0 text-sm [&>span]:whitespace-nowrap"
                    value={String(meta.perPage)}
                    onChange={(event) =>
                        onPerPageChange(Number(event.target.value))
                    }
                >
                    {perPageOptions.map((option) => (
                        <option key={option} value={option}>
                            {option} / page
                        </option>
                    ))}
                </SelectNative>
            </div>

            <div className="flex shrink-0 items-center gap-2">
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={meta.currentPage <= 1}
                    onClick={() => onPageChange(meta.currentPage - 1)}
                >
                    <ChevronLeft className="size-4" />
                    Previous
                </Button>
                <span className="text-sm text-muted-foreground tabular-nums">
                    Page {meta.currentPage} of {meta.lastPage}
                </span>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={meta.currentPage >= meta.lastPage}
                    onClick={() => onPageChange(meta.currentPage + 1)}
                >
                    Next
                    <ChevronRight className="size-4" />
                </Button>
            </div>
        </div>
    );
}
