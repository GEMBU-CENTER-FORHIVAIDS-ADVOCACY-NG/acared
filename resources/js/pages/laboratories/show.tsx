import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import LabResultFields, {
    buildResultPayload,
    emptyResultValues,
} from '@/components/lab-result-fields';
import LabResultInfolist from '@/components/lab-result-infolist';
import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import type { LabResultForm, LaboratoryShow, Team } from '@/types';

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
    const [processing, setProcessing] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);

    function baseUrl(path = '') {
        return `/${teamSlug}/laboratories${path}`;
    }

    function saveResults() {
        setProcessing(true);
        setFormError(null);

        router.patch(
            baseUrl(`/${laboratory.id}/results`),
            buildResultPayload(values),
            {
                preserveScroll: true,
                onSuccess: () => setEditing(false),
                onError: (errors) =>
                    setFormError(
                        Object.values(errors)[0] ?? 'Unable to update results.',
                    ),
                onFinish: () => setProcessing(false),
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
                            <Link href={baseUrl(`/${laboratory.id}/print`)}>
                                Print result
                            </Link>
                        </Button>
                        <Button asChild variant="secondary">
                            <Link href={baseUrl('/history')}>History</Link>
                        </Button>
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

                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
                    {[
                        ['Hospital No.', laboratory.patientId],
                        ['Patient', laboratory.patientName ?? '—'],
                        ['Doctor', laboratory.doctorName ?? '—'],
                        [
                            'Created',
                            laboratory.createdAt
                                ? new Date(
                                      laboratory.createdAt,
                                  ).toLocaleString()
                                : '—',
                        ],
                        ['Lab No.', String(laboratory.id)],
                    ].map(([label, value]) => (
                        <Card key={label}>
                            <CardHeader className="pb-2">
                                <CardDescription>{label}</CardDescription>
                                <CardTitle className="text-base">
                                    {value}
                                </CardTitle>
                            </CardHeader>
                        </Card>
                    ))}
                </div>

                {/* Results card */}
                <div>
                    <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle>Results</CardTitle>
                            <Badge variant="secondary" className="capitalize">
                                {laboratory.status}
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {editing ? (
                            <>
                                <LabResultFields
                                    form={resultForm}
                                    values={values}
                                    onChange={setValues}
                                    onSubmitResults={saveResults}
                                    onSaveStep={(stepIndex) => {
                                        const step = resultForm.steps[stepIndex];
                                        if (!step) return;

                                        const stepLines = {};
                                        const stepTestResults = {};
                                        const stepInventoryConsumption = {};

                                        for (const test of step.tests) {
                                            if (test.kind === 'simple') {
                                                const val = values.lines[String(test.id)];
                                                if (val) stepLines[String(test.id)] = val;
                                            } else if (test.kind === 'parameters') {
                                                const testResultMap = values.testResults[String(test.id)] || {};
                                                const rows = Object.entries(testResultMap)
                                                    .filter(([, r]) => r)
                                                    .map(([pid, r]) => ({ price_list_id: Number(pid), result: r }));
                                                if (rows.length > 0) stepTestResults[String(test.id)] = rows;
                                            }

                                            const consumptionRows = values.inventoryConsumption[String(test.id)] || [];
                                            const filtered = consumptionRows.filter((row) => row.lab_inventory_id > 0 && row.quantity > 0);
                                            if (filtered.length > 0) {
                                                stepInventoryConsumption[String(test.id)] = filtered;
                                            }
                                        }

                                        setProcessing(true);
                                        setFormError(null);
                                        router.patch(
                                            baseUrl(`/${laboratory.id}/results`),
                                            { lines: stepLines, testResults: stepTestResults, inventoryConsumption: stepInventoryConsumption },
                                            {
                                                preserveScroll: true,
                                                onError: (errors) =>
                                                    setFormError(
                                                        Object.values(errors)[0] ?? 'Unable to save step results.',
                                                    ),
                                                onFinish: () => setProcessing(false),
                                            },
                                        );
                                    }}
                                    readOnly={false}
                                />
                                {formError ? (
                                    <p className="text-sm text-red-600">
                                        {formError}
                                    </p>
                                ) : null}
                            </>
                        ) : (
                            <LabResultInfolist form={resultForm} />
                        )}
                    </CardContent>
                </Card>
                </div>

            </div>
        </>
    );
}
