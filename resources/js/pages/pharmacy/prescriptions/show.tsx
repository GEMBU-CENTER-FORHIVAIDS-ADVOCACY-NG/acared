import { Head, Link, router, usePage } from '@inertiajs/react';
import { ArrowLeft, Pill, PillBottle, RotateCcw, Trash2 } from 'lucide-react';
import { useState } from 'react';
import AlertError from '@/components/alert-error';
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
    dispenseNewLines as dispenseNewLinesRoute,
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
    comment: string | null;
    quantity: number;
    totalPrice: number;
    paid: boolean;
    dispenseStatus: string;
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
    canDispenseNewLines: boolean;
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
    const [showRefundConfirm, setShowRefundConfirm] = useState(false);
    const [refundSelection, setRefundSelection] = useState<
        Record<number, boolean>
    >(Object.fromEntries(prescription.lines.map((line) => [line.id, true])));
    const [refundQuantities, setRefundQuantities] = useState<
        Record<number, number>
    >(
        Object.fromEntries(
            prescription.lines.map((line) => [line.id, line.quantity]),
        ),
    );
    const [refundProcessing, setRefundProcessing] = useState(false);
    const [deleteProcessing, setDeleteProcessing] = useState(false);
    const [dispenseProcessing, setDispenseProcessing] = useState(false);
    const [dispenseNewLinesProcessing, setDispenseNewLinesProcessing] =
        useState(false);
    const [error, setError] = useState<string | null>(null);

    const anyProcessing =
        refundProcessing ||
        deleteProcessing ||
        dispenseProcessing ||
        dispenseNewLinesProcessing;

    function printPrescription() {
        window.print();
    }

    const prescriptionDate = prescription.createdAt
        ? new Date(prescription.createdAt).toLocaleDateString()
        : '—';

    const refundTotal = prescription.lines
        .filter((line) => refundSelection[line.id])
        .reduce(
            (sum, line) =>
                sum +
                (refundQuantities[line.id] ?? line.quantity) * line.unitPrice,
            0,
        );

    function submitRefund() {
        if (refundProcessing || refundTotal <= 0) {
            return;
        }

        setRefundProcessing(true);
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
                    quantity: refundSelection[line.id]
                        ? refundQuantities[line.id]
                        : undefined,
                })),
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setShowRefundConfirm(false);
                    setRefundOpen(false);
                },
                onError: (errors) =>
                    setError(Object.values(errors)[0] ?? 'Refund failed.'),
                onFinish: () => setRefundProcessing(false),
            },
        );
    }

    function deletePrescription() {
        if (deleteProcessing) {
            return;
        }

        setDeleteProcessing(true);
        setError(null);
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
                onFinish: () => setDeleteProcessing(false),
            },
        );
    }

    function dispense() {
        if (dispenseProcessing || anyProcessing) {
            return;
        }

        setDispenseProcessing(true);
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
                onFinish: () => setDispenseProcessing(false),
            },
        );
    }

    function dispenseNewLines() {
        if (dispenseNewLinesProcessing || anyProcessing) {
            return;
        }

        setDispenseNewLinesProcessing(true);
        setError(null);
        router.post(
            dispenseNewLinesRoute.url({
                current_team: teamSlug,
                prescription: prescription.id,
            }),
            {},
            {
                preserveScroll: true,
                onError: (errors) =>
                    setError(
                        Object.values(errors)[0] ??
                            'Dispense new lines failed.',
                    ),
                onFinish: () => setDispenseNewLinesProcessing(false),
            },
        );
    }

    return (
        <>
            <Head title={`Prescription ${prescription.patientSlug}`} />

            <style>{`
                @media print {
                    @page {
                        size: A5 landscape;
                        margin: 10mm;
                    }

                    body {
                        background: #fff !important;
                    }

                    .no-print {
                        display: none !important;
                    }

                    .prescription-print-root {
                        display: block !important;
                        font-family: Arial, sans-serif;
                        font-size: 12px;
                        line-height: 1.5;
                        color: #000;
                    }

                    .prescription-print-root table {
                        width: 100%;
                        border-collapse: collapse;
                        margin-top: 10px;
                    }

                    .prescription-print-root th,
                    .prescription-print-root td {
                        padding: 6px 8px;
                        border: 1px solid #000;
                        text-align: left;
                    }

                    .prescription-print-root .info-table {
                        margin-bottom: 20px;
                    }

                    .prescription-print-root .info-table td {
                        border: none;
                        padding: 4px 0;
                    }
                }
            `}</style>

            <div className="no-print flex w-full flex-col space-y-6 p-4 md:p-6 lg:p-8">
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
                                    onClick={dispense}
                                    disabled={anyProcessing}
                                >
                                    <Pill className="mr-2 size-4" />
                                    {dispenseProcessing
                                        ? 'Dispensing…'
                                        : 'Dispense'}
                                </Button>
                            ) : null}
                            {prescription.canDispenseNewLines ? (
                                <Button
                                    variant="outline"
                                    onClick={dispenseNewLines}
                                    disabled={anyProcessing}
                                >
                                    <PillBottle className="mr-2 size-4" />
                                    {dispenseNewLinesProcessing
                                        ? 'Dispensing…'
                                        : 'Dispense new lines'}
                                </Button>
                            ) : null}
                            {prescription.canRefund ? (
                                <Button
                                    variant="secondary"
                                    disabled={anyProcessing}
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
                                    disabled={anyProcessing}
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
                                        <TableHead>Comment</TableHead>
                                        <TableHead>Qty</TableHead>
                                        <TableHead>Unit price</TableHead>
                                        <TableHead className="text-right">
                                            Line total
                                        </TableHead>
                                        <TableHead>Billing</TableHead>
                                        <TableHead>Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {prescription.lines.length === 0 ? (
                                        <TableRow>
                                            <TableCell
                                                colSpan={10}
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
                                                    {line.duration != null &&
                                                    String(line.duration) !== ''
                                                        ? Number(
                                                              line.duration,
                                                          ).toLocaleString()
                                                        : '—'}
                                                </TableCell>
                                                <TableCell>
                                                    {line.dosage != null &&
                                                    String(line.dosage) !== ''
                                                        ? Number(
                                                              line.dosage,
                                                          ).toLocaleString()
                                                        : '—'}
                                                </TableCell>
                                                <TableCell>
                                                    {line.comment ?? '—'}
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
                                                <TableCell>
                                                    <Badge
                                                        variant={
                                                            line.paid
                                                                ? 'default'
                                                                : 'secondary'
                                                        }
                                                    >
                                                        {line.paid
                                                            ? 'Paid'
                                                            : 'Unpaid'}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge
                                                        variant={
                                                            line.dispenseStatus ===
                                                            'dispensed'
                                                                ? 'default'
                                                                : 'destructive'
                                                        }
                                                    >
                                                        {line.dispenseStatus ===
                                                        'dispensed'
                                                            ? 'Dispensed'
                                                            : 'Pending'}
                                                    </Badge>
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
                                                <Badge
                                                    variant="secondary"
                                                    className="capitalize"
                                                >
                                                    {billing.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {currencySymbol}{' '}
                                                {billing.total.toLocaleString()}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    <TableRow className="font-semibold">
                                        <TableCell colSpan={2}>Total</TableCell>
                                        <TableCell className="text-right">
                                            {currencySymbol}{' '}
                                            {prescription.billings
                                                .reduce(
                                                    (sum, billing) =>
                                                        sum + billing.total,
                                                    0,
                                                )
                                                .toLocaleString()}
                                        </TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                ) : null}

                <AlertError errors={error ? [error] : []} />
            </div>

            <div
                className="prescription-print-root"
                style={{ display: 'none' }}
            >
                <h2
                    style={{ margin: 0, fontSize: '18px', textAlign: 'center' }}
                >
                    {hospitalName}
                </h2>
                <p style={{ margin: '4px 0 0', textAlign: 'center' }}>
                    Prescription
                </p>
                <table className="info-table">
                    <tbody>
                        <tr>
                            <td style={{ width: '150px', fontWeight: 'bold' }}>
                                Hospital No:
                            </td>
                            <td>{prescription.patientSlug}</td>
                        </tr>
                        <tr>
                            <td style={{ fontWeight: 'bold' }}>
                                Patient Name:
                            </td>
                            <td>{prescription.patientName ?? '—'}</td>
                        </tr>
                        <tr>
                            <td style={{ fontWeight: 'bold' }}>Date:</td>
                            <td>{prescriptionDate}</td>
                        </tr>
                        <tr>
                            <td style={{ fontWeight: 'bold' }}>Doctor:</td>
                            <td>{prescription.doctorName ?? '—'}</td>
                        </tr>
                    </tbody>
                </table>
                <h3 style={{ margin: '0 0 10px', fontSize: '14px' }}>
                    Prescribed Drugs
                </h3>
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
                    <tbody>
                        {prescription.lines.map((line) => (
                            <tr key={line.id}>
                                <td>{line.name ?? 'Drug'}</td>
                                <td>{line.frequency ?? '—'}</td>
                                <td>{line.duration ?? '—'}</td>
                                <td>{line.dosage ?? '—'}</td>
                                <td>{line.quantity.toLocaleString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <Sheet
                open={refundOpen}
                onOpenChange={(open) => {
                    if (refundProcessing) {
                        return;
                    }
                    setRefundOpen(open);
                    if (!open) {
                        setError(null);
                    }
                }}
            >
                <SheetContent className="w-full overflow-y-auto sm:max-w-2xl">
                    <SheetHeader>
                        <SheetTitle>Refund prescription</SheetTitle>
                        <SheetDescription>
                            Select the drugs to return to stock. A refunded
                            prescription and negative billing will be recorded.
                        </SheetDescription>
                    </SheetHeader>
                    <div className="mt-6 space-y-4 px-4 pb-4">
                        {prescription.lines.map((line) => {
                            const isSelected = Boolean(
                                refundSelection[line.id],
                            );
                            const refundQty =
                                refundQuantities[line.id] ?? line.quantity;
                            const lineTotal = refundQty * line.unitPrice;

                            return (
                                <div
                                    key={line.id}
                                    className="flex items-center justify-between gap-3 rounded-lg border p-3"
                                >
                                    <label className="flex min-w-0 flex-1 items-center gap-3">
                                        <input
                                            type="checkbox"
                                            checked={isSelected}
                                            onChange={(event) =>
                                                setRefundSelection({
                                                    ...refundSelection,
                                                    [line.id]:
                                                        event.target.checked,
                                                })
                                            }
                                        />
                                        <span className="text-sm font-medium">
                                            {line.name ?? 'Drug'} ·{' '}
                                            {currencySymbol}{' '}
                                            {line.unitPrice.toLocaleString()}
                                        </span>
                                    </label>
                                    <div className="flex items-center gap-2">
                                        <input
                                            id={`refund-qty-${line.id}`}
                                            aria-label={`Refund quantity for ${line.name ?? `line ${line.id}`}`}
                                            type="number"
                                            min="0.001"
                                            step="any"
                                            className="w-20 rounded-md border bg-background px-2 py-1 text-sm shadow-sm focus:border-ring focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                                            value={refundQty}
                                            disabled={!isSelected}
                                            onChange={(event) =>
                                                setRefundQuantities({
                                                    ...refundQuantities,
                                                    [line.id]:
                                                        parseFloat(
                                                            event.target.value,
                                                        ) || 0,
                                                })
                                            }
                                        />
                                        <span className="text-sm whitespace-nowrap text-muted-foreground">
                                            {currencySymbol}{' '}
                                            {lineTotal.toLocaleString()}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                        <div className="rounded-lg border bg-muted/40 p-3">
                            <Label className="text-sm text-muted-foreground">
                                Refund total
                            </Label>
                            <p className="text-lg font-semibold">
                                {currencySymbol} {refundTotal.toLocaleString()}
                            </p>
                        </div>
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
                            disabled={refundTotal <= 0}
                            onClick={() => {
                                setError(null);
                                setRefundOpen(false);
                                setShowRefundConfirm(true);
                            }}
                        >
                            Review refund
                        </Button>
                    </SheetFooter>
                </SheetContent>
            </Sheet>

            <ConfirmDialog
                open={showRefundConfirm}
                onOpenChange={(open) => {
                    if (refundProcessing) {
                        return;
                    }
                    setShowRefundConfirm(open);
                    if (!open) {
                        setError(null);
                    }
                }}
                title="Refund prescription?"
                description={
                    error ??
                    `This will refund ${currencySymbol} ${refundTotal.toLocaleString()} and return the selected drugs to stock.`
                }
                confirmLabel={refundProcessing ? 'Refunding…' : 'Refund'}
                destructive
                processing={refundProcessing}
                onConfirm={submitRefund}
            />

            <ConfirmDialog
                open={deleting}
                onOpenChange={(open) => {
                    if (deleteProcessing) {
                        return;
                    }
                    setDeleting(open);
                    if (!open) {
                        setError(null);
                    }
                }}
                title="Delete prescription?"
                description={
                    error ??
                    'Lines and billing attached to this prescription will also be removed.'
                }
                confirmLabel={deleteProcessing ? 'Deleting…' : 'Delete'}
                destructive
                processing={deleteProcessing}
                onConfirm={deletePrescription}
            />
        </>
    );
}
