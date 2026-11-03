import { Head, Link, usePage } from '@inertiajs/react';
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
import { history, index } from '@/routes/billings';
import type { BillingReceipt, Team } from '@/types';

type LayoutProps = {
    currentTeam?: Team | null;
};

function paymentTotal(payment: BillingReceipt['payments'][number]): number {
    return (
        payment.amount +
        payment.discountAmount +
        payment.wallet +
        payment.mercyFund +
        payment.infantFormula
    );
}

export default function BillingShow({
    currencySymbol,
    billing,
}: {
    currencySymbol: string;
    billing: BillingReceipt;
}) {
    const { currentTeam } = usePage().props;
    const teamSlug = currentTeam?.slug;

    function print() {
        const cleanup = () =>
            document.body.classList.remove('printing-billing-receipt');
        document.body.classList.add('printing-billing-receipt');
        window.addEventListener('afterprint', cleanup, { once: true });
        window.print();
    }

    return (
        <>
            <Head title={`Receipt #${billing.id}`} />

            <div className="flex w-full flex-col space-y-6 p-4 md:p-6 lg:p-8">
                <div className="no-print flex flex-wrap items-center justify-between gap-2">
                    <Heading
                        variant="small"
                        title={`Receipt #${billing.id}`}
                        description="Printable payment receipt."
                    />
                    <div className="flex items-center gap-2">
                        <Button type="button" onClick={print}>
                            Print receipt
                        </Button>
                        <Button asChild variant="secondary">
                            <Link href={index(teamSlug)}>Back</Link>
                        </Button>
                    </div>
                </div>

                <div className="billing-receipt mx-auto w-full max-w-md rounded-lg border p-6 font-mono text-xs">
                    <div className="text-center">
                        <p className="text-sm font-bold">
                            {currentTeam?.name ?? 'Facility'}
                        </p>
                        {currentTeam?.email && (
                            <p className="mt-1 text-[11px]">{currentTeam.email}</p>
                        )}
                        {currentTeam?.address && (
                            <p className="text-[11px]">{currentTeam.address}</p>
                        )}
                    </div>
                    <div className="my-3 border-t border-dashed" />

                    <div className="flex justify-between">
                        <span className="font-bold">Patient</span>
                        <span>
                            {billing.patientId} {billing.patientName}
                        </span>
                    </div>
                    <div className="flex justify-between">
                        <span className="font-bold">Date</span>
                        <span>
                            {billing.createdAt
                                ? new Date(billing.createdAt).toLocaleString()
                                : '—'}
                        </span>
                    </div>
                    <div className="flex justify-between">
                        <span className="font-bold">Status</span>
                        <span className="uppercase">{billing.status}</span>
                    </div>

                    <div className="my-3 border-t border-dashed" />

                    <p className="text-center font-bold">
                        {billing.billableType ?? 'BILLING'} PAYMENT RECEIPT
                    </p>

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
                            {billing.lines.map((line) => (
                                <TableRow key={line.id}>
                                    <TableCell>{line.name ?? '—'}</TableCell>
                                    <TableCell className="text-right">
                                        {line.quantity ?? 1}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {currencySymbol}
                                        {line.totalPrice.toLocaleString()}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>

                    <div className="my-3 border-t border-dashed" />

                    {billing.payments.map((payment) => (
                        <div key={payment.id} className="flex justify-between">
                            <span className="rounded border px-2">
                                {payment.method ?? '—'}
                            </span>
                            <span>
                                {currencySymbol}
                                {paymentTotal(payment).toLocaleString()}
                            </span>
                        </div>
                    ))}

                    <div className="my-3 border-t-2 border-double" />

                    <div className="flex justify-between font-bold">
                        <span>Total</span>
                        <span>
                            {currencySymbol}
                            {billing.total.toLocaleString()}
                        </span>
                    </div>
                    <div className="flex justify-between">
                        <span className="font-bold">Recorded By</span>
                        <span>{billing.recordedBy ?? '—'}</span>
                    </div>

                    <div className="my-3 border-t border-dashed" />
                    {(currentTeam?.mobile || currentTeam?.phone) && (
                        <p className="text-center text-[11px]">
                            {currentTeam?.mobile ?? currentTeam?.phone}
                        </p>
                    )}
                    <p className="text-center">** THANK YOU **</p>
                </div>
            </div>
        </>
    );
}

BillingShow.layout = (props: LayoutProps) => ({
    breadcrumbs: [
        {
            title: 'Billings',
            href: index(props.currentTeam?.slug),
        },
        {
            title: 'History',
            href: history(props.currentTeam?.slug).url,
        },
    ],
});
