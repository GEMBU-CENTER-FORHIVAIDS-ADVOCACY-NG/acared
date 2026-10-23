import { cn } from '@/lib/utils';

export type TabItem = {
    key: string;
    label: string;
    count?: number | null;
    badge?: 'default' | 'warning';
};

type TabsBarProps = {
    items: TabItem[];
    value: string;
    onChange: (key: string) => void;
    className?: string;
};

export default function TabsBar({
    items,
    value,
    onChange,
    className,
}: TabsBarProps) {
    return (
        <div
            role="tablist"
            className={cn(
                'flex items-center gap-1 overflow-x-auto rounded-lg bg-muted p-1',
                className,
            )}
        >
            {items.map((item) => {
                const isActive = item.key === value;

                return (
                    <button
                        key={item.key}
                        role="tab"
                        type="button"
                        aria-selected={isActive}
                        data-active={isActive || undefined}
                        data-test={`tab-${item.key}`}
                        onClick={() => onChange(item.key)}
                        className={cn(
                            'inline-flex shrink-0 items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium whitespace-nowrap transition-colors',
                            'focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none',
                            isActive
                                ? 'bg-background text-foreground shadow-xs'
                                : 'text-muted-foreground hover:text-foreground',
                        )}
                    >
                        {item.label}
                        {item.count !== null && item.count !== undefined ? (
                            <span
                                className={cn(
                                    'rounded-full px-1.5 py-0.5 text-xs font-medium tabular-nums',
                                    item.badge === 'warning'
                                        ? 'bg-warning/15 text-warning-foreground dark:bg-warning/20'
                                        : 'bg-muted-foreground/10 text-muted-foreground',
                                    isActive && 'bg-primary/10 text-primary',
                                )}
                            >
                                {item.count.toLocaleString()}
                            </span>
                        ) : null}
                    </button>
                );
            })}
        </div>
    );
}
