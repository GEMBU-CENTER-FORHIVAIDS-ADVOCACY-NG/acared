import { Head, Link, usePage } from '@inertiajs/react';
import { useEffect } from 'react';
import { Printer } from 'lucide-react';
import type { Team } from '@/types';
import { Button } from '@/components/ui/button';

type InventoryItem = {
    id: number;
    sku: string;
    name: string;
    drugForm: string | null;
    quantity: number;
    minQty: number;
    status: string;
    expiresAt: string | null;
};

type LayoutProps = {
    currentTeam?: Team | null;
};

export default function PrintStockTaking({
    teamName,
    items,
    count,
    printedAt,
}: {
    teamName: string;
    items: InventoryItem[];
    count: number;
    printedAt: string;
}) {
    const { currentTeam } = usePage<LayoutProps>().props;
    const teamSlug = currentTeam?.slug ?? '';

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                window.history.back();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const handlePrint = () => {
        window.print();
    };

    return (
        <>
            <Head title="Physical Stock Taking — Print" />

            {/* Toolbar */}
            <div className="no-print fixed left-0 right-0 top-0 z-[100000] flex items-center justify-between border-b border-border bg-background px-6 py-3 shadow-sm">
                <div className="flex items-center gap-3">
                    <Button variant="outline" size="sm" asChild>
                        <Link href={`/${teamSlug}/inventory/stock`}>
                            ← Back to inventory
                        </Link>
                    </Button>
                    <span className="text-xs text-muted-foreground">
                        Press{' '}
                        <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 text-[11px]">
                            Esc
                        </kbd>{' '}
                        to go back
                    </span>
                </div>
                <Button size="sm" onClick={handlePrint}>
                    <Printer className="mr-2 size-4" />
                    Print sheet
                </Button>
            </div>

            {/* Print Content */}
            <div className="mx-auto max-w-7xl p-8 pt-20" id="stock-taking-print-div">
                {/* Header */}
                <div className="mb-6 border-b border-foreground pb-4">
                    <h1 className="text-2xl font-bold">Physical Stock Taking Sheet</h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        {teamName}
                    </p>
                    <div className="mt-2 flex gap-4 text-xs text-muted-foreground">
                        <span>Printed: {printedAt}</span>
                        <span>Total items: {count}</span>
                    </div>
                </div>

                {/* Instructions */}
                <div className="mb-4 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 no-print">
                    <p className="font-medium">Instructions</p>
                    <ul className="mt-1 list-inside list-disc text-xs space-y-1">
                        <li>Count the physical stock for each item and write the counted quantity in the "Counted" column.</li>
                        <li>The "Difference" column will show the variance between system and counted quantities.</li>
                        <li>Add any notes in the "Notes" column for discrepancies.</li>
                        <li>Print this sheet before starting the physical count.</li>
                    </ul>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-sm" style={{ borderCollapse: 'collapse' }}>
                        <thead>
                            <tr className="border-b-2 border-foreground">
                                <th className="whitespace-nowrap bg-muted px-3 py-2 text-left font-semibold">
                                    #
                                </th>
                                <th className="whitespace-nowrap bg-muted px-3 py-2 text-left font-semibold">
                                    SKU
                                </th>
                                <th className="whitespace-nowrap bg-muted px-3 py-2 text-left font-semibold">
                                    Product
                                </th>
                                <th className="whitespace-nowrap bg-muted px-3 py-2 text-left font-semibold">
                                    Form
                                </th>
                                <th className="whitespace-nowrap bg-muted px-3 py-2 text-right font-semibold">
                                    System Qty
                                </th>
                                <th className="whitespace-nowrap bg-muted px-3 py-2 text-right font-semibold">
                                    Counted Qty
                                </th>
                                <th className="whitespace-nowrap bg-muted px-3 py-2 text-right font-semibold">
                                    Difference
                                </th>
                                <th className="whitespace-nowrap bg-muted px-3 py-2 text-left font-semibold">
                                    Status
                                </th>
                                <th className="whitespace-nowrap bg-muted px-3 py-2 text-left font-semibold">
                                    Expiry
                                </th>
                                <th className="whitespace-nowrap bg-muted px-3 py-2 text-left font-semibold">
                                    Notes
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((item, index) => (
                                <tr
                                    key={item.id}
                                    className="border-b border-foreground/20"
                                >
                                        <td className="px-3 py-2">
                                            {index + 1}
                                        </td>
                                        <td className="px-3 py-2 font-mono text-xs">
                                            {item.sku}
                                        </td>
                                        <td className="px-3 py-2 font-medium">
                                            {item.name}
                                        </td>
                                        <td className="px-3 py-2">
                                            {item.drugForm ?? '—'}
                                        </td>
                                        <td className="px-3 py-2 text-right tabular-nums">
                                            {item.quantity.toLocaleString()}
                                        </td>
                                        <td className="px-3 py-2 text-right tabular-nums">
                                            <span className="text-muted-foreground">
                                                (count here)
                                            </span>
                                        </td>
                                        <td className="px-3 py-2 text-right tabular-nums">
                                            <span className="text-muted-foreground">
                                                —
                                            </span>
                                        </td>
                                        <td className="px-3 py-2 capitalize">
                                            {item.status}
                                        </td>
                                        <td className="px-3 py-2">
                                            {item.expiresAt ?? '—'}
                                        </td>
                                        <td className="px-3 py-2">
                                            <span className="text-muted-foreground">
                                                —
                                            </span>
                                        </td>
                                    </tr>
                            ))}
                        </tbody>
                        <tfoot>
                            <tr className="border-t-2 border-foreground bg-muted">
                                <td colSpan={4} className="px-3 py-2 text-right font-semibold">
                                    Totals
                                </td>
                                <td className="px-3 py-2 text-right tabular-nums font-semibold">
                                    {items.reduce((sum, item) => sum + item.quantity, 0).toLocaleString()}
                                </td>
                                <td className="px-3 py-2 text-right tabular-nums font-semibold">
                                    —
                                </td>
                                <td className="px-3 py-2 text-right tabular-nums font-semibold">
                                    —
                                </td>
                                <td colSpan={3}></td>
                            </tr>
                        </tfoot>
                    </table>
                </div>

                {/* Signature section */}
                <div className="mt-12 grid grid-cols-2 gap-8">
                    <div>
                        <p className="text-sm font-medium">Prepared by:</p>
                        <div className="mt-8 border-t border-foreground/40 pt-2 text-xs text-muted-foreground">
                            Name &amp; Signature
                        </div>
                    </div>
                    <div>
                        <p className="text-sm font-medium">Verified by:</p>
                        <div className="mt-8 border-t border-foreground/40 pt-2 text-xs text-muted-foreground">
                            Name &amp; Signature
                        </div>
                    </div>
                </div>

            </div>

            {/* Print styles */}
            <style>{`
                @media print {
                    .no-print {
                        display: none !important;
                    }
                    body {
                        background: white !important;
                    }
                    #stock-taking-print-div {
                        padding: 0 !important;
                        margin: 0 !important;
                        max-width: none !important;
                    }
                    table {
                        font-size: 10px !important;
                    }
                    th, td {
                        padding: 4px 6px !important;
                    }
                }
            `}</style>
        </>
    );
}
