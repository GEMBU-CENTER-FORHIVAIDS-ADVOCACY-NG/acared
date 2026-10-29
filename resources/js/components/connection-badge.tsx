import { useCallback, useEffect, useState } from 'react';

type Quality = 'full' | 'medium' | 'low' | 'offline';

const PING_INTERVAL = 5000;
const THRESHOLDS = { full: 200, medium: 600 };
const OFFLINE_THRESHOLD = 3;

const qualityColors: Record<Quality, { bar: string; label: string }> = {
    full: { bar: 'fill-green-500', label: 'text-green-600 dark:text-green-400' },
    medium: { bar: 'fill-yellow-500', label: 'text-yellow-600 dark:text-yellow-400' },
    low: { bar: 'fill-red-500', label: 'text-red-600 dark:text-red-400' },
    offline: { bar: 'fill-gray-400 dark:fill-gray-600', label: 'text-gray-500 dark:text-gray-400' },
};

const qualityLabels: Record<Quality, string> = {
    full: 'Full',
    medium: 'Medium',
    low: 'Low',
    offline: 'Offline',
};

function getQualityFromLatency(latency: number): Quality {
    if (latency < THRESHOLDS.full) return 'full';
    if (latency < THRESHOLDS.medium) return 'medium';
    return 'low';
}

function SignalBarsIcon({ quality }: { quality: Quality }) {
    const activeClass = qualityColors[quality].bar;
    const inactiveClass = 'fill-gray-300 dark:fill-gray-600';

    const bar1Active = quality !== 'offline';
    const bar2Active = ['medium', 'full'].includes(quality);
    const bar3Active = quality === 'full';

    return (
        <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <rect x="2" y="15" width="4" height="7" rx="1" className={bar1Active ? activeClass : inactiveClass} />
            <rect x="10" y="10" width="4" height="12" rx="1" className={bar2Active ? activeClass : inactiveClass} />
            <rect x="18" y="4" width="4" height="18" rx="1" className={bar3Active ? activeClass : inactiveClass} />
        </svg>
    );
}

function OfflineOverlay() {
    return (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/55 backdrop-blur-sm">
            <div className="mx-4 max-w-sm rounded-xl bg-white p-8 text-center shadow-2xl dark:bg-gray-900 animate-in fade-in zoom-in-95 duration-250">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-500/15 dark:text-red-400">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8">
                        <path d="M12 20h.01" />
                        <path d="M8.5 16.429a5 5 0 0 1 7 0" />
                        <path d="M5 12.859a10 10 0 0 1 5.17-2.69" />
                        <path d="M19 12.859a10 10 0 0 0-2.007-1.523" />
                        <path d="M2 8.82a15 15 0 0 1 4.177-2.643" />
                        <path d="M22 8.82a15 15 0 0 0-11.288-3.764" />
                        <path d="m2 2 20 20" />
                    </svg>
                </div>
                <h2 className="mb-2 text-xl font-semibold text-gray-900 dark:text-gray-50">Connection Lost</h2>
                <p className="mb-5 text-sm leading-6 text-gray-500 dark:text-gray-400">
                    Your internet connection has been interrupted. We will reconnect automatically as soon as the network is available.
                </p>
                <div className="inline-flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                    <svg className="h-3.5 w-3.5 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Reconnecting&hellip;</span>
                </div>
            </div>
        </div>
    );
}

export function ConnectionBadge() {
    const [quality, setQuality] = useState<Quality>('full');
    const [isOffline, setIsOffline] = useState(false);
    const [consecutiveFailures, setConsecutiveFailures] = useState(0);
    const pingUrl = '/_connection-badge/ping';

    const ping = useCallback(async () => {
        if (!navigator.onLine) {
            setConsecutiveFailures((prev) => {
                const next = prev + 1;
                if (next >= OFFLINE_THRESHOLD) {
                    setQuality('offline');
                    setIsOffline(true);
                }
                return next;
            });
            return;
        }

        const start = performance.now();
        try {
            const res = await fetch(`${pingUrl}?_=${Date.now()}`, {
                method: 'GET',
                cache: 'no-store',
                credentials: 'same-origin',
                headers: {
                    Accept: 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-Inertia': 'false',
                },
            });

            if (!res.ok) {
                setConsecutiveFailures((prev) => {
                    const next = prev + 1;
                    if (next >= OFFLINE_THRESHOLD) {
                        setQuality('offline');
                        setIsOffline(true);
                    }
                    return next;
                });
                return;
            }

            const latency = Math.round(performance.now() - start);
            setConsecutiveFailures(0);
            setQuality(getQualityFromLatency(latency));
            setIsOffline(false);
        } catch {
            setConsecutiveFailures((prev) => {
                const next = prev + 1;
                if (next >= OFFLINE_THRESHOLD) {
                    setQuality('offline');
                    setIsOffline(true);
                }
                return next;
            });
        }
    }, [pingUrl]);

    useEffect(() => {
        if (!navigator.onLine) {
            setQuality('offline');
            setIsOffline(true);
        }

        const handleOnline = () => ping();
        const handleOffline = () => {
            setConsecutiveFailures((prev) => {
                const next = prev + 1;
                if (next >= OFFLINE_THRESHOLD) {
                    setQuality('offline');
                    setIsOffline(true);
                }
                return next;
            });
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        ping();
        const timer = setInterval(() => ping(), PING_INTERVAL);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
            clearInterval(timer);
        };
    }, [ping]);

    return (
        <>
            <div className="inline-flex items-center">
                <button
                    type="button"
                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-xs font-medium ${quality === 'offline' ? 'animate-pulse' : ''}`}
                    aria-label={`Connection: ${qualityLabels[quality]}`}
                >
                    <SignalBarsIcon quality={quality} />
                    <span className={qualityColors[quality].label}>{qualityLabels[quality]}</span>
                </button>
            </div>

            {isOffline && <OfflineOverlay />}
        </>
    );
}
