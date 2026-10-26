import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import LabResultFields, {
    buildResultPayload,
    emptyResultValues,
} from '@/components/lab-result-fields';
import LabResultInfolist from '@/components/lab-result-infolist';
import Heading from '@/components/heading';
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

    function printResult() {
        const cleanup = () =>
            document.body.classList.remove('printing-lab-result');
        document.body.classList.add('printing-lab-result');
        window.addEventListener('afterprint', cleanup, { once: true });
        window.print();
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
                        <Button type="button" onClick={printResult}>
                            Print result
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

                {/* Print-only wrapper for invoice header and results card */}
                <div className="hidden lab-result-print-wrapper">
                    <div className="lab-result-print-header">
                        <h1 style={{ fontSize: '18px', fontWeight: 'bold', margin: '0 0 4px 0' }}>
                            {currentTeam?.name ?? 'Facility'}
                        </h1>
                        <p style={{ fontSize: '12px', margin: '0 0 12px 0', color: '#666' }}>
                            {laboratory.facilityAddress ?? ''}
                        </p>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '13px', marginBottom: '12px' }}>
                            <div>
                                <span style={{ color: '#666' }}>Lab No.:</span>{' '}
                                <strong>{laboratory.id}</strong>
                            </div>
                            <div>
                                <span style={{ color: '#666' }}>Date:</span>{' '}
                                <strong>
                                    {laboratory.createdAt
                                        ? new Date(laboratory.createdAt).toLocaleString()
                                        : '—'}
                                </strong>
                            </div>
                            <div>
                                <span style={{ color: '#666' }}>Patient:</span>{' '}
                                <strong>{laboratory.patientName ?? '—'}</strong>
                            </div>
                            <div>
                                <span style={{ color: '#666' }}>Hospital No.:</span>{' '}
                                <strong>{laboratory.patientId}</strong>
                            </div>
                            <div>
                                <span style={{ color: '#666' }}>Doctor:</span>{' '}
                                <strong>{laboratory.doctorName ?? '—'}</strong>
                            </div>
                        </div>
                        <hr style={{ border: 'none', borderTop: '2px solid #000', margin: '12px 0' }} />
                    </div>

                    <Card className="lab-result-print">
                    <CardHeader>
                        <CardTitle>Results</CardTitle>
                        <CardDescription>
                            Status:{' '}
                            <span className="capitalize">
                                {laboratory.status}
                            </span>
                            {' · '}
                            Total: {currencySymbol}{' '}
                            {laboratory.total.toLocaleString()}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {editing ? (
                            <>
                                <LabResultFields
                                    form={resultForm}
                                    values={values}
                                    onChange={setValues}
                                    readOnly={false}
                                />
                                {formError ? (
                                    <p className="text-sm text-red-600">
                                        {formError}
                                    </p>
                                ) : null}
                                <Button
                                    disabled={processing}
                                    onClick={saveResults}
                                >
                                    {processing ? 'Saving…' : 'Save results'}
                                </Button>
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
