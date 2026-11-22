import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import ConfirmDialog from '@/components/confirm-dialog';
import { Checkbox } from '@/components/ui/checkbox';
import {
    cancel as cancelLaboratoryRoute,
    history as laboratoryHistory,
    print as printLaboratory,
} from '@/routes/laboratories';
import { update as updateLabResult } from '@/routes/laboratories/results';
import LabResultEntryLayout from '@/components/lab-result-entry-layout';
import {
    buildResultPayload,
    emptyResultValues,
    flattenTests,
} from '@/components/lab-result-fields';
import LabResultInfolist from '@/components/lab-result-infolist';
import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import type {
    LabInventoryConsumption,
    LabResultForm,
    LaboratoryShow,
    Team,
} from '@/types';

type LayoutProps = {
    currentTeam?: Team | null;
};

export default function LaboratoryShow({
    currencySymbol,
    laboratory,
    resultForm,
    canEdit,
}: {
    currencySymbol: string;
    laboratory: LaboratoryShow;
    resultForm: LabResultForm;
    canEdit: boolean;
}) {
    const { currentTeam } = usePage<LayoutProps>().props;
    const teamSlug = currentTeam?.slug ?? '';
    const [editing, setEditing] = useState(false);
    const [values, setValues] = useState(emptyResultValues());
    const [saveProcessing, setSaveProcessing] = useState(false);
    const [stepProcessing, setStepProcessing] = useState(false);
    const [cancelProcessing, setCancelProcessing] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);
    const [cancelError, setCancelError] = useState<string | null>(null);
    const [showCancelDialog, setShowCancelDialog] = useState(false);
    const [showCancelConfirm, setShowCancelConfirm] = useState(false);
    const [refundLineIds, setRefundLineIds] = useState<Set<number>>(new Set());

    function saveResults() {
        if (saveProcessing || stepProcessing) {
            return;
        }

        setSaveProcessing(true);
        setFormError(null);

        router.patch(
            updateLabResult.url({
                current_team: teamSlug,
                laboratory: laboratory.id,
            }),
            buildResultPayload(values),
            {
                preserveScroll: true,
                onSuccess: () => setEditing(false),
                onError: (errors) =>
                    setFormError(
                        Object.values(errors)[0] ?? 'Unable to update results.',
                    ),
                onFinish: () => setSaveProcessing(false),
            },
        );
    }

    function openCancelDialog() {
        // Pre-select all pending (not completed) lines
        const pendingIds = new Set(
            laboratory.lines
                .filter((line) => !line.completed)
                .map((line) => line.id),
        );
        setRefundLineIds(pendingIds);
        setCancelError(null);
        setShowCancelDialog(true);
    }

    function cancelLaboratory() {
        if (cancelProcessing || refundLineIds.size === 0) {
            return;
        }

        setCancelProcessing(true);
        setCancelError(null);

        router.post(
            cancelLaboratoryRoute.url({
                current_team: teamSlug,
                laboratory: laboratory.id,
            }),
            { refund_line_ids: Array.from(refundLineIds) },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setShowCancelConfirm(false);
                    setShowCancelDialog(false);
                    setRefundLineIds(new Set());
                },
                onError: (errors) =>
                    setCancelError(
                        Object.values(errors)[0] ?? 'Unable to cancel request.',
                    ),
                onFinish: () => setCancelProcessing(false),
            },
        );
    }

    return (
        <>
            <Head title={`Lab #${laboratory.id}`} />

            <div className="flex w-full flex-col space-y-6 p-4 md:p-6 lg:p-8">
                <div className="no-print flex flex-wrap items-center justify-between gap-2">
                    <Heading
                        title={`${laboratory.facilityName ?? 'Facility'} laboratory test result`}
                        description={laboratory.facilityAddress ?? undefined}
                    />
                    <div className="flex flex-wrap gap-2">
                        <Button type="button" asChild>
                            <Link
                                href={printLaboratory.url({
                                    current_team: teamSlug,
                                    laboratory: laboratory.id,
                                })}
                            >
                                Print result
                            </Link>
                        </Button>
                        <Button asChild variant="secondary">
                            <Link href={laboratoryHistory.url(teamSlug)}>
                                History
                            </Link>
                        </Button>
                        {laboratory.status === 'submitted' ? (
                            <Button
                                variant="destructive"
                                size="sm"
                                onClick={openCancelDialog}
                            >
                                Cancel request
                            </Button>
                        ) : null}
                        {canEdit ? (
                            <Button
                                variant={editing ? 'secondary' : 'default'}
                                onClick={() => {
                                    setEditing((current) => !current);
                                    setValues(emptyResultValues());
                                }}
                            >
                                {editing ? 'Cancel edit' : 'Edit results'}
                            </Button>
                        ) : null}
                    </div>
                </div>

                {/* Results card */}
                <div>
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle>Results</CardTitle>
                                <Badge
                                    variant="secondary"
                                    className="capitalize"
                                >
                                    {laboratory.status}
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {editing ? (
                                <LabResultEntryLayout
                                    form={resultForm}
                                    values={values}
                                    onChange={setValues}
                                    onSubmitResults={saveResults}
                                    onSaveStep={(testIndex) => {
                                        const flatTests =
                                            flattenTests(resultForm);
                                        const test = flatTests[testIndex];
                                        if (
                                            !test ||
                                            saveProcessing ||
                                            stepProcessing
                                        ) {
                                            return;
                                        }

                                        const stepLines: Record<
                                            string,
                                            string
                                        > = {};
                                        const stepTestResults: Record<
                                            string,
                                            {
                                                price_list_id: number;
                                                result: string;
                                            }[]
                                        > = {};
                                        const stepInventoryConsumption: Record<
                                            string,
                                            LabInventoryConsumption[]
                                        > = {};

                                        if (test.kind === 'simple') {
                                            const val =
                                                values.lines[String(test.id)];
                                            if (val)
                                                stepLines[String(test.id)] =
                                                    val;
                                        } else if (test.kind === 'parameters') {
                                            const testResultMap =
                                                values.testResults[
                                                    String(test.id)
                                                ] || {};
                                            const rows = Object.entries(
                                                testResultMap,
                                            )
                                                .filter(([, r]) => r)
                                                .map(([pid, r]) => ({
                                                    price_list_id: Number(pid),
                                                    result: r,
                                                }));
                                            if (rows.length > 0)
                                                stepTestResults[
                                                    String(test.id)
                                                ] = rows;
                                        }

                                        const consumptionRows =
                                            values.inventoryConsumption[
                                                String(test.id)
                                            ] || [];
                                        const filtered = consumptionRows.filter(
                                            (row) =>
                                                row.lab_inventory_id > 0 &&
                                                row.quantity > 0,
                                        );
                                        if (filtered.length > 0) {
                                            stepInventoryConsumption[
                                                String(test.id)
                                            ] = filtered;
                                        }

                                        setStepProcessing(true);
                                        setFormError(null);
                                        router.patch(
                                            updateLabResult.url({
                                                current_team: teamSlug,
                                                laboratory: laboratory.id,
                                            }),
                                            {
                                                lines: stepLines,
                                                testResults: stepTestResults,
                                                inventoryConsumption:
                                                    stepInventoryConsumption,
                                            },
                                            {
                                                preserveScroll: true,
                                                onError: (errors) =>
                                                    setFormError(
                                                        Object.values(
                                                            errors,
                                                        )[0] ??
                                                            'Unable to save step results.',
                                                    ),
                                                onFinish: () =>
                                                    setStepProcessing(false),
                                            },
                                        );
                                    }}
                                    selected={{
                                        patientId: laboratory.patientId,
                                        patientName: laboratory.patientName,
                                        birthDate: laboratory.birthDate,
                                        age: laboratory.age,
                                        gender: laboratory.gender,
                                        doctorName: laboratory.doctorName,
                                        createdAt: laboratory.createdAt,
                                    }}
                                    formError={formError}
                                />
                            ) : (
                                <LabResultInfolist form={resultForm} />
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>

            <Dialog
                open={showCancelDialog}
                onOpenChange={(open) => {
                    if (cancelProcessing) {
                        return;
                    }
                    setShowCancelDialog(open);
                    if (!open) {
                        setRefundLineIds(new Set());
                        setCancelError(null);
                    }
                }}
            >
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Cancel laboratory request?</DialogTitle>
                        <DialogDescription>
                            Select the tests to refund. Completed tests cannot
                            be refunded.
                        </DialogDescription>
                    </DialogHeader>

                    {laboratory.lines ? (
                        <div className="space-y-2">
                            {laboratory.lines.map((line) => (
                                <div
                                    key={line.id}
                                    className={`flex items-center justify-between rounded-lg border p-3 ${
                                        line.completed ? 'opacity-50' : ''
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <Checkbox
                                            id={`refund-line-${line.id}`}
                                            checked={refundLineIds.has(line.id)}
                                            disabled={line.completed}
                                            onCheckedChange={(checked) => {
                                                const next = new Set(
                                                    refundLineIds,
                                                );
                                                if (checked) {
                                                    next.add(line.id);
                                                } else {
                                                    next.delete(line.id);
                                                }
                                                setRefundLineIds(next);
                                            }}
                                        />
                                        <label
                                            htmlFor={`refund-line-${line.id}`}
                                            className="cursor-pointer text-sm leading-none font-medium"
                                        >
                                            {line.name}
                                            {line.quantity > 1
                                                ? ` (×${line.quantity})`
                                                : ''}
                                        </label>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm">
                                        {line.completed ? (
                                            <span className="text-muted-foreground">
                                                Completed
                                            </span>
                                        ) : (
                                            <span className="text-muted-foreground">
                                                {currencySymbol}
                                                {(
                                                    line.unitPrice *
                                                    line.quantity
                                                ).toLocaleString()}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : null}

                    {refundLineIds.size > 0 && laboratory.lines ? (
                        <div className="flex justify-end text-sm font-medium">
                            Refund total: {currencySymbol}
                            {laboratory.lines
                                .filter((line) => refundLineIds.has(line.id))
                                .reduce(
                                    (sum, line) =>
                                        sum + line.unitPrice * line.quantity,
                                    0,
                                )
                                .toLocaleString()}
                        </div>
                    ) : null}

                    <DialogFooter>
                        <Button
                            variant="secondary"
                            onClick={() => {
                                setShowCancelDialog(false);
                                setRefundLineIds(new Set());
                                setCancelError(null);
                            }}
                        >
                            Keep request
                        </Button>
                        <Button
                            variant="destructive"
                            disabled={refundLineIds.size === 0}
                            onClick={() => {
                                setShowCancelDialog(false);
                                setShowCancelConfirm(true);
                            }}
                        >
                            Review cancellation
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <ConfirmDialog
                open={showCancelConfirm}
                onOpenChange={(open) => {
                    if (cancelProcessing) {
                        return;
                    }
                    setShowCancelConfirm(open);
                    if (!open) {
                        setCancelError(null);
                    }
                }}
                title="Cancel laboratory request?"
                description={
                    cancelError ??
                    `This will cancel the request and refund ${refundLineIds.size} selected test${refundLineIds.size === 1 ? '' : 's'}.`
                }
                confirmLabel={
                    cancelProcessing ? 'Cancelling…' : 'Cancel & refund'
                }
                destructive
                processing={cancelProcessing}
                onConfirm={cancelLaboratory}
            />
        </>
    );
}
