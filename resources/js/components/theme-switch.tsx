import { Monitor, Moon, Sun } from 'lucide-react';
import { useAppearance } from '@/hooks/use-appearance';
import { cn } from '@/lib/utils';

export default function ThemeSwitch() {
    const { appearance, updateAppearance } = useAppearance();

    const nextAppearance = () => {
        if (appearance === 'light') return 'dark';
        if (appearance === 'dark') return 'system';
        return 'light';
    };

    const icon = () => {
        if (appearance === 'light') return Sun;
        if (appearance === 'dark') return Moon;
        return Monitor;
    };

    const Icon = icon();

    return (
        <button
            type="button"
            onClick={() => updateAppearance(nextAppearance())}
            className={cn(
                'inline-flex h-9 w-9 items-center justify-center rounded-md transition-colors',
                'hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
            )}
            title={`Change theme (current: ${appearance})`}
        >
            <Icon className="h-5 w-5" />
        </button>
    );
}
