import { Head, Link, usePage } from '@inertiajs/react';
import { useEffect } from 'react';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { index } from '@/routes/finance/wallet-history';
import type { Team } from '@/types';

type LayoutProps = {
    currentTeam?: Team | null;
};

type History = {
    id: number;
    patientId: string;
    patientName: string | null;
    patientWallet: number;
    userName: string | null;
    methodName: string | null;
    billableType: string;
    teamName: string | null;
    teamAddress: string | null;
    lines: {
        name: string | null;
        quantity: number;
        unitPrice: number;
        subtotal: number;
    }[];
    credit: number;
    debit: number;
    balance: number;
    createdAt: string | null;
};

export default function WalletHistoryShow({ history }: { history: History }) {
    const { currentTeam } = usePage().props;
    const teamSlug = currentTeam?.slug;

    useEffect(() => {
        const cleanup = () =>
            document.body.classList.remove('printing-wallet-history');
        const handleVisibilityChange = () => {
            if (document.hidden) {
                cleanup();
            }
        };

        window.addEventListener('afterprint', cleanup);
        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            cleanup();
            window.removeEventListener('afterprint', cleanup);
            document.removeEventListener(
                'visibilitychange',
                handleVisibilityChange,
            );
        };
    }, []);

    function print() {
        document.body.classList.add('printing-wallet-history');
        window.print();
    }

    return (
        <>
            <Head title={`Wallet receipt #${history.id}`} />

            <div className="flex w-full flex-col space-y-6 p-4 md:p-6 lg:p-8">
                <div className="no-print flex flex-wrap items-center justify-between gap-2">
                    <Heading
                        variant="small"
                        title={`Wallet receipt #${history.id}`}
                        description="Printable wallet transaction receipt."
                    />
                    <div className="flex items-center gap-2">
                        <Button type="button" onClick={print}>
                            Print receipt
                        </Button>
                        <Button asChild variant="secondary">
                            <Link href={index(teamSlug).url}>Back</Link>
                        </Button>
                    </div>
                </div>

                <div className="wallet-history-receipt mx-auto w-full max-w-md rounded-lg border p-6 font-mono text-xs">
                    <div className="text-center">
                        <p className="text-sm font-bold">
                            {history.teamName ??
                                currentTeam?.name ??
                                'Facility'}
                        </p>
                        {history.teamAddress && (
                            <p className="mt-1 text-[11px]">
                                {history.teamAddress}
                            </p>
                        )}
                        {(currentTeam?.mobile || currentTeam?.phone) && (
                            <p className="text-[11px]">
                                {currentTeam?.mobile ?? currentTeam?.phone}
                            </p>
                        )}
                    </div>
                    <div className="my-3 border-t border-dashed" />

                    <div className="flex justify-between">
                        <span className="font-bold">Patient</span>
                        <span>
                            {history.patientId} {history.patientName ?? ''}
                        </span>
                    </div>
                    <div className="flex justify-between">
                        <span className="font-bold">Date</span>
                        <span>
                            {history.createdAt
                                ? new Date(history.createdAt).toLocaleString()
                                : '—'}
                        </span>
                    </div>
                    <div className="flex justify-between">
                        <span className="font-bold">Method</span>
                        <span>{history.methodName ?? '—'}</span>
                    </div>

                    <div className="my-3 border-t border-dashed" />

                    <p className="text-center font-bold">
                        WALLET TRANSACTION RECEIPT
                    </p>

                    {history.lines.length > 0 && (
                        <Table className="mt-2">
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Item</TableHead>
                                    <TableHead className="text-right">
                                        Qty
                                    </TableHead>
                                    <TableHead className="text-right">
                                        Subtotal
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {history.lines.map((line, lineIndex) => (
                                    <TableRow key={lineIndex}>
                                        <TableCell>
                                            {line.name ?? '—'}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {line.quantity}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            ₦{line.subtotal.toLocaleString()}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}

                    <div className="my-3 border-t border-dashed" />

                    {history.debit > 0 && (
                        <div className="flex justify-between">
                            <span>Debit</span>
                            <strong>₦{history.debit.toLocaleString()}</strong>
                        </div>
                    )}

                    <div className="my-3 border-t-2 border-double" />

                    <div className="flex justify-between">
                        <span className="font-bold">
                            Balance after transaction
                        </span>
                        <strong
                            className={
                                history.patientWallet < 0
                                    ? 'text-destructive'
                                    : 'text-emerald-700 dark:text-emerald-400'
                            }
                        >
                            ₦{history.patientWallet.toLocaleString()}
                        </strong>
                    </div>

                    <div className="flex justify-between">
                        <span className="font-bold">Recorded By</span>
                        <span>{history.userName ?? '—'}</span>
                    </div>

                    <div className="my-3 border-t border-dashed" />
                    <p className="text-center">** THANK YOU **</p>
                </div>
            </div>
        </>
    );
}

WalletHistoryShow.layout = (props: LayoutProps) => ({
    breadcrumbs: [
        {
            title: 'Wallet history',
            href: index(props.currentTeam?.slug ?? '').url,
        },
    ],
});
