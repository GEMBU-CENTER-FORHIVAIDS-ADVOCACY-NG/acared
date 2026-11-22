import { Head, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { FinancialReportLayout } from '@/components/financial-report-layout';
import Heading from '@/components/heading';
import Pagination from '@/components/pagination';
import { useReportPrint } from '@/hooks/use-report-print';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { priceList } from '@/routes/reports';
import { exportMethod as exportReport } from '@/routes/reports/price-list';

type Item = {
    id: number;
    name: string;
    category: string | null;
    subcategory: string | null;
    price: number;
    uom: string | null;
    isCategory: boolean;
    isInventory: boolean;
};
type Filters = { q: string; perPage: number; page?: number };
type Paginator = {
    data: Item[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
};

export default function PriceListReport({
    items,
    filters,
    currencySymbol,
}: {
    items: Paginator;
    filters: Filters;
    currencySymbol: string;
}) {
    const team = usePage().props.currentTeam?.slug ?? '';
    const { printRef, handlePrint } = useReportPrint();
    const [search, setSearch] = useState(filters.q);
    const [isVisiting, setIsVisiting] = useState(false);
    const [isPrinting, setIsPrinting] = useState(false);
    const visit = (patch: Partial<Filters>) => {
        const next = { ...filters, ...patch };
        setIsVisiting(true);
        router.get(
            priceList.url({ current_team: team }),
            {
                q: next.q || undefined,
                perPage: next.perPage,
                page: next.page || undefined,
            },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
                onFinish: () => setIsVisiting(false),
            },
        );
    };
    const printReport = () => {
        setIsPrinting(true);
        const finishPrint = () => {
            setIsPrinting(false);
            window.removeEventListener('afterprint', finishPrint);
        };
        window.addEventListener('afterprint', finishPrint);
        handlePrint();
    };

    return (
        <>
            <Head title="Price list report" />
            <FinancialReportLayout active="price-list">
                <div className="flex w-full flex-col space-y-6">
                    <div className="no-print flex flex-wrap items-center justify-between gap-3">
                        <Heading
                            variant="small"
                            title="Price list report"
                            description="Printable and exportable catalog of categories, services, and products."
                        />
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                onClick={printReport}
                                disabled={isPrinting}
                            >
                                {isPrinting ? 'Printing…' : 'Print'}
                            </Button>
                            <Button variant="outline" asChild>
                                <a
                                    href={exportReport.url(team, {
                                        query: filters,
                                    })}
                                >
                                    Export CSV
                                </a>
                            </Button>
                        </div>
                    </div>
                    <div className="no-print flex flex-wrap items-end gap-2">
                        <form
                            className="flex items-end gap-2"
                            onSubmit={(event) => {
                                event.preventDefault();
                                visit({ q: search, page: 1 });
                            }}
                        >
                            <div className="space-y-1">
                                <Label htmlFor="price-list-search">
                                    Catalog item
                                </Label>
                                <Input
                                    id="price-list-search"
                                    value={search}
                                    onChange={(event) =>
                                        setSearch(event.target.value)
                                    }
                                    placeholder="Search price list"
                                />
                            </div>
                            <Button type="submit" disabled={isVisiting}>
                                {isVisiting ? 'Searching…' : 'Search'}
                            </Button>
                        </form>
                    </div>
                    <div ref={printRef} className="report-print-container">
                        <h2 className="mb-3 text-lg font-semibold">
                            Price List Report
                        </h2>
                        <div className="overflow-x-auto rounded-lg border bg-card">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Category</TableHead>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Price</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {items.data.length ? (
                                        items.data.map((item) => (
                                            <TableRow key={item.id}>
                                                <TableCell>
                                                    {item.category ?? '—'}
                                                </TableCell>
                                                <TableCell className="font-medium">
                                                    {item.name}
                                                </TableCell>
                                                <TableCell>
                                                    {item.isCategory
                                                        ? '—'
                                                        : `${currencySymbol} ${item.price.toLocaleString()}`}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell
                                                colSpan={3}
                                                className="py-10 text-center text-muted-foreground"
                                            >
                                                No price list items found.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                    <div
                        className={`no-print ${isVisiting ? 'pointer-events-none opacity-60' : ''}`}
                        aria-busy={isVisiting}
                    >
                        <Pagination
                            meta={{
                                currentPage: items.current_page,
                                lastPage: items.last_page,
                                perPage: items.per_page,
                                total: items.total,
                            }}
                            onPageChange={(page) => visit({ page })}
                            onPerPageChange={(perPage) =>
                                visit({ perPage, page: 1 })
                            }
                        />
                    </div>
                </div>
            </FinancialReportLayout>
        </>
    );
}
