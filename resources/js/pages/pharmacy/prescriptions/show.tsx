import { Head, Link, router, usePage } from '@inertiajs/react';
import { ArrowLeft, Pill, RotateCcw, Trash2 } from 'lucide-react';
import { useCallback, useState } from 'react';
import { Breadcrumbs } from '@/components/breadcrumbs';
import ConfirmDialog from '@/components/confirm-dialog';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import type { Team } from '@/types';
import {
    destroy as destroyRoute,
    dispense as dispenseRoute,
    edit as editRoute,
    index as prescriptionsIndex,
    refund as refundRoute,
    show as showRoute,
} from '@/routes/pharmacy/prescriptions';

type LineItem = {
    id: number;
    priceListId: number;
    name: string | null;
    unitPrice: number;
    unitCost: number;
    frequency: number | null;
    duration: number | null;
    dosage: number | null;
    quantity: number;
    totalPrice: number;
};

type Prescription = {
    id: number;
    patientSlug: string;
    patientName: string | null;
    doctorName: string | null;
    total: number;
    status: string;
    linesCount: number;
    createdAt: string | null;
    lines: LineItem[];
    billings: { id: number; total: number; status: string }[];
    canEdit: boolean;
    canRefund: boolean;
    canDispense: boolean;
    canDelete: boolean;
};

export default function PrescriptionShow({
    currencySymbol,
    prescription,
    isAdmitted,
    hospitalName,
}: {
    currencySymbol: string;
    prescription: Prescription;
    isAdmitted: boolean;
    hospitalName: string;
}) {
    const { currentTeam } = usePage<{ currentTeam?: Team | null }>().props;
    const teamSlug = currentTeam?.slug ?? '';
    const [deleting, setDeleting] = useState(false);
    const [refundOpen, setRefundOpen] = useState(false);
    const [refundSelection, setRefundSelection] = useState<
        Record<number, boolean>
    >(Object.fromEntries(prescription.lines.map((line) => [line.id, true])));
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const printPrescription = useCallback(() => {
        const printWindow = window.open('', '_blank', 'width=800,height=600');
        if (!printWindow) return;

        const date = prescription.createdAt
            ? new Date(prescription.createdAt).toLocaleDateString()
            : '—';

        const rows = prescription.lines
            .map(
                (line) => `
                <tr>
                    <td style="padding:6px 8px;border:1px solid #000;">${line.name ?? 'Drug'}</td>
                    <td style="padding:6px 8px;border:1px solid #000;">${line.frequency ?? '—'}</td>
                    <td style="padding:6px 8px;border:1px solid #000;">${line.duration ?? '—'}</td>
                    <td style="padding:6px 8px;border:1px solid #000;">${line.dosage ?? '—'}</td>
                    <td style="padding:6px 8px;border:1px solid #000;">${line.quantity.toLocaleString()}</td>
                </tr>`,
            )
            .join('');

        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Prescription</title>
                <style>
                    @page { size: A5 landscape; margin: 10mm; }
                    body { font-family: Arial, sans-serif; font-size: 12px; line-height: 1.5; margin: 0; padding: 10mm; }
                    h2 { margin: 0; font-size: 18px; text-align: center; }
                    h3 { margin: 0 0 10px; font-size: 14px; }
                    p { margin: 4px 0 0; font-size: 14px; text-align: center; }
                    table { width: 100%; border-collapse: collapse; margin-top: 10px; }
                    th { background: #f0f0f0; font-weight: bold; padding: 6px 8px; border: 1px solid #000; text-align: left; }
                    td { padding: 6px 8px; border: 1px solid #000; }
                    tr { page-break-inside: avoid; }
                    .info-table { width: 100%; margin-bottom: 20px; }
                    .info-table td { border: none; padding: 4px 0; }
                    .label { width: 150px; font-weight: bold; }
                </style>
            </head>
            <body>
                <h2>${hospitalName}</h2>
                <p>Prescription</p>
                <table class="info-table">
                    <tr><td class="label">Hospital No:</td><td>${prescription.patientSlug}</td></tr>
                    <tr><td class="label">Patient Name:</td><td>${prescription.patientName ?? '—'}</td></tr>
                    <tr><td class="label">Date:</td><td>${date}</td></tr>
                    <tr><td class="label">Doctor:</td><td>${prescription.doctorName ?? '—'}</td></tr>
                </table>
                <h3>Prescribed Drugs</h3>
                <table>
                    <thead>
                        <tr>
                            <th>Drug</th>
                            <th>Frequency</th>
                            <th>Duration</th>
                            <th>Dosage</th>
                            <th>Qty</th>
                        </tr>
                    </thead>
                    <tbody>${rows}</tbody>
                </table>
            </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.focus();

        printWindow.print();

        setTimeout(() => {
            printWindow.close();
        }, 1000);
    }, [prescription, hospitalName]);

    const refundTotal = prescription.lines
        .filter((line) => refundSelection[line.id])
        .reduce((sum, line) => sum + line.quantity * line.unitPrice, 0);

    function submitRefund() {
        setProcessing(true);
        setError(null);
        router.post(
            refundRoute.url({
                current_team: teamSlug,
                prescription: prescription.id,
            }),
            {
                lines: prescription.lines.map((line) => ({
                    line_id: line.id,
                    refund: Boolean(refundSelection[line.id]),
                })),
            },
            {
                preserveScroll: true,
                onSuccess: () => setRefundOpen(false),
                onError: (errors) =>
                    setError(Object.values(errors)[0] ?? 'Refund failed.'),
                onFinish: () => setProcessing(false),
            },
        );
    }

    function deletePrescription() {
        setProcessing(true);
        router.delete(
            destroyRoute.url({
                current_team: teamSlug,
                prescription: prescription.id,
            }),
            {
                preserveScroll: true,
                onSuccess: () => setDeleting(false),
                onError: (errors) =>
                    setError(Object.values(errors)[0] ?? 'Delete failed.'),
                onFinish: () => setProcessing(false),
            },
        );
    }

    return (
        <>
            <Head title={`Prescription ${prescription.patientSlug}`} />
            <div className="flex w-full flex-col space-y-6 p-4 md:p-6 lg:p-8">
                <div className="space-y-3">
                    <div className="no-print">
                        <Breadcrumbs
                            breadcrumbs={[
                                {
                                    title: 'Pharmacy',
                                    href: prescriptionsIndex(teamSlug),
                                },
                                {
                                    title: 'Prescriptions',
                                    href: prescriptionsIndex(teamSlug),
                                },
                                {
                                    title: prescription.patientSlug,
                                    href: showRoute.url({
                                        current_team: teamSlug,
                                        prescription: prescription.id,
                                    }),
                                },
                            ]}
                        />
                    </div>
                    <div className="flex flex-wrap items-start justify-between gap-4">
                        <Heading
                            title={`Prescription — ${prescription.patientSlug}`}
                            description={`${prescription.patientName ?? 'Patient'} · ${prescription.doctorName ?? 'Unknown prescriber'}`}
                        />
                        <div className="no-print flex flex-wrap gap-2">
                            <Button variant="outline" asChild>
                                <Link href={prescriptionsIndex(teamSlug)}>
                                    <ArrowLeft className="mr-2 size-4" />
                                    Back
                                </Link>
                            </Button>
                            <Button
                                variant="outline"
                                onClick={printPrescription}
                            >
                                Print prescription
                            </Button>
                            {prescription.canEdit ? (
                                <Button asChild>
                                    <Link
                                        href={editRoute.url({
                                            current_team: teamSlug,
                                            prescription: prescription.id,
                                        })}
                                    >
                                        Edit
                                    </Link>
                                </Button>
                            ) : null}
                            {prescription.canDispense ? (
                                <Button
                                    onClick={() => {
                                        setProcessing(true);
                                        setError(null);
                                        router.post(
                                            dispenseRoute.url({
                                                current_team: teamSlug,
                                                prescription: prescription.id,
                                            }),
                                            {},
                                            {
                                                preserveScroll: true,
                                                onError: (errors) =>
                                                    setError(Object.values(errors)[0] ?? 'Dispense failed.'),
                                                onFinish: () => setProcessing(false),
                                            },
                                        );
                                    }}
                                    disabled={processing}
                                >
                                    <Pill className="mr-2 size-4" />
                                    {processing ? 'Processing…' : 'Dispense'}
                                </Button>
                            ) : null}
                            {prescription.canRefund ? (
                                <Button
                                    variant="secondary"
                                    onClick={() => {
                                        setError(null);
                                        setRefundOpen(true);
                                    }}
                                >
                                    <RotateCcw className="mr-2 size-4" />
                                    Refund
                                </Button>
                            ) : null}
                            {prescription.canDelete ? (
                                <Button
                                    variant="destructive"
                                    onClick={() => {
                                        setError(null);
                                        setDeleting(true);
                                    }}
                                >
                                    <Trash2 className="mr-2 size-4" />
                                    Delete
                                </Button>
                            ) : null}
                        </div>
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-4">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardDescription>Status</CardDescription>
                        </CardHeader>
                        <CardContent className="text-lg font-semibold capitalize">
                            {prescription.status}
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardDescription>Items</CardDescription>
                        </CardHeader>
                        <CardContent className="text-lg font-semibold">
                            {prescription.lines.length}
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardDescription>Total</CardDescription>
                        </CardHeader>
                        <CardContent className="text-lg font-semibold">
                            {currencySymbol}{' '}
                            {prescription.total.toLocaleString()}
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardDescription>Created</CardDescription>
                        </CardHeader>
                        <CardContent className="text-lg font-semibold">
                            {prescription.createdAt
                                ? new Date(
                                      prescription.createdAt,
                                  ).toLocaleDateString()
                                : '—'}
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0">
                        <div>
                            <CardTitle>Prescribed drugs</CardTitle>
                            <CardDescription>
                                Dosage schedule and pricing for each line item.
                            </CardDescription>
                        </div>
                        <Badge variant={isAdmitted ? 'default' : 'secondary'}>
                            {isAdmitted ? 'On Admission' : 'OPD'}
                        </Badge>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Drug</TableHead>
                                        <TableHead>Frequency</TableHead>
                                        <TableHead>Duration</TableHead>
                                        <TableHead>Dosage</TableHead>
                                        <TableHead>Qty</TableHead>
                                        <TableHead>Unit price</TableHead>
                                        <TableHead className="text-right">
                                            Line total
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {prescription.lines.length === 0 ? (
                                        <TableRow>
                                            <TableCell
                                                colSpan={7}
                                                className="py-8 text-center text-muted-foreground"
                                            >
                                                No drugs on this prescription.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        prescription.lines.map((line) => (
                                            <TableRow key={line.id}>
                                                <TableCell className="font-medium">
                                                    {line.name ?? 'Drug'}
                                                </TableCell>
                                                <TableCell>
                                                    {line.frequency ?? '—'}
                                                </TableCell>
                                                <TableCell>
                                                    {line.duration ?? '—'}
                                                </TableCell>
                                                <TableCell>
                                                    {line.dosage ?? '—'}
                                                </TableCell>
                                                <TableCell>
                                                    {line.quantity.toLocaleString()}
                                                </TableCell>
                                                <TableCell>
                                                    {currencySymbol}{' '}
                                                    {line.unitPrice.toLocaleString()}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    {currencySymbol}{' '}
                                                    {line.totalPrice.toLocaleString()}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>

                {prescription.billings.length > 0 ? (
                    <Card>
                        <CardHeader>
                            <CardTitle>Billing</CardTitle>
                            <CardDescription>
                                Charges linked to this prescription.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Reference</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">
                                            Total
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {prescription.billings.map((billing) => (
                                        <TableRow key={billing.id}>
                                            <TableCell>
                                                BIL-
                                                {String(billing.id).padStart(
                                                    5,
                                                    '0',
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="secondary" className="capitalize">
                                                    {billing.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {currencySymbol}{' '}
                                                {billing.total.toLocaleString()}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                ) : null}

                {error ? <p className="text-sm text-red-600">{error}</p> : null}
            </div>

            <Sheet open={refundOpen} onOpenChange={setRefundOpen}>
                <SheetContent className="w-full overflow-y-auto sm:max-w-2xl">
                    <SheetHeader>
                        <SheetTitle>Refund prescription</SheetTitle>
                        <SheetDescription>
                            Select the drugs to return to stock. A refunded
                            prescription and negative billing will be recorded.
                        </SheetDescription>
                    </SheetHeader>
                    <div className="mt-6 space-y-4 px-4 pb-4">
                        {prescription.lines.map((line) => (
                            <label
                                key={line.id}
                                className="flex items-center justify-between gap-3 rounded-lg border p-3"
                            >
                                <span className="flex items-center gap-3">
                                    <input
                                        type="checkbox"
                                        checked={Boolean(
                                            refundSelection[line.id],
                                        )}
                                        onChange={(event) =>
                                            setRefundSelection({
                                                ...refundSelection,
                                                [line.id]: event.target.checked,
                                            })
                                        }
                                    />
                                    <span className="text-sm font-medium">
                                        {line.name ?? 'Drug'} · Qty{' '}
                                        {line.quantity.toLocaleString()} ·{' '}
                                        {currencySymbol}{' '}
                                        {line.unitPrice.toLocaleString()}
                                    </span>
                                </span>
                                <span className="text-sm text-muted-foreground">
                                    {currencySymbol}{' '}
                                    {(
                                        line.quantity * line.unitPrice
                                    ).toLocaleString()}
                                </span>
                            </label>
                        ))}
                        <div className="rounded-lg border bg-muted/40 p-3">
                            <Label className="text-sm text-muted-foreground">
                                Refund total
                            </Label>
                            <p className="text-lg font-semibold">
                                {currencySymbol} {refundTotal.toLocaleString()}
                            </p>
                        </div>
                        {error ? (
                            <p className="text-sm text-red-600">{error}</p>
                        ) : null}
                    </div>
                    <SheetFooter className="mt-6">
                        <Button
                            variant="secondary"
                            onClick={() => setRefundOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            disabled={processing || refundTotal <= 0}
                            onClick={submitRefund}
                        >
                            {processing ? 'Processing…' : 'Refund'}
                        </Button>
                    </SheetFooter>
                </SheetContent>
            </Sheet>

            <ConfirmDialog
                open={deleting}
                onOpenChange={setDeleting}
                title="Delete prescription?"
                description="Lines and billing attached to this prescription will also be removed."
                confirmLabel="Delete"
                processing={processing}
                onConfirm={deletePrescription}
            />

        </>
    );
}
