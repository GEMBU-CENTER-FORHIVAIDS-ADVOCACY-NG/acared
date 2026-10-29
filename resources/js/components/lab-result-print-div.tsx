import type {
    LabResultForm,
    LabResultParameterRow,
    LabResultTest,
    LaboratoryShow,
} from '@/types';

interface LabResultPrintDivProps {
    laboratory: LaboratoryShow;
    resultForm: LabResultForm;
    facilityName: string;
    facilityAddress: string;
}

function ParameterResultTable({ rows }: { rows: LabResultParameterRow[] }) {
    if (rows.length === 0) {
        return <p style={{ fontSize: '12px', color: '#666', margin: 0 }}>No parameters.</p>;
    }

    const hasUom = rows.some((row) => row.result_type !== 'select' && row.result_type !== 'radio');

    return (
        <table style={{ width: '100%', fontSize: '12px', borderCollapse: 'collapse' }}>
            <thead>
                <tr style={{ borderBottom: '2px solid #333', backgroundColor: '#f3f4f6' }}>
                    <th style={{ padding: '8px 10px', textAlign: 'left', fontWeight: '700', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Parameter
                    </th>
                    <th style={{ padding: '8px 10px', textAlign: 'left', fontWeight: '700', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Range
                    </th>
                    <th style={{ padding: '8px 10px', textAlign: 'left', fontWeight: '700', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Result
                    </th>
                    {hasUom ? (
                        <th style={{ padding: '8px 10px', textAlign: 'left', fontWeight: '700', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            Unit
                        </th>
                    ) : null}
                </tr>
            </thead>
            <tbody>
                {rows.map((row) => {
                    const hideUom = row.result_type === 'select' || row.result_type === 'radio';
                    return (
                        <tr key={row.price_list_id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                            <td style={{ padding: '6px 10px', fontWeight: '500' }}>{row.name}</td>
                            <td style={{ padding: '6px 10px', color: '#666' }}>
                                {row.range ?? '—'}
                            </td>
                            <td style={{ padding: '6px 10px', fontWeight: '700', fontSize: '13px' }}>
                                {row.result ?? '—'}
                            </td>
                            {hasUom ? (
                                <td style={{ padding: '6px 10px', color: '#666' }}>
                                    {!hideUom ? (row.uom ?? '—') : null}
                                </td>
                            ) : null}
                        </tr>
                    );
                })}
            </tbody>
        </table>
    );
}

function SimpleResultDisplay({ test }: { test: LabResultTest }) {
    const hideUom = test.result_type === 'select' || test.result_type === 'radio';
    return (
        <div className="lab-print-simple-test" style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            padding: '10px 12px',
            borderRadius: '4px',
            backgroundColor: '#f9fafb',
            border: '1px solid #e5e7eb',
            gap: '12px',
        }}>
            <span style={{ fontSize: '12px', color: '#374151', flex: 1, lineHeight: '1.4', wordBreak: 'break-word' }}>{test.name}</span>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', flexShrink: 0 }}>
                <span style={{ fontSize: '14px', fontWeight: '700' }}>{test.result ?? '—'}</span>
                {!hideUom && test.unit ? (
                    <span style={{ fontSize: '11px', color: '#6b7280' }}>{test.unit}</span>
                ) : null}
            </div>
        </div>
    );
}

function TestGroup({ test }: { test: LabResultTest }) {
    if (test.kind === 'parameters') {
        return (
            <div className="lab-print-test-group" style={{
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                marginBottom: '12px',
                overflow: 'hidden',
            }}>
                <div style={{
                    padding: '10px 14px',
                    borderBottom: '1px solid #e5e7eb',
                    backgroundColor: '#f3f4f6',
                    fontWeight: '700',
                    fontSize: '13px',
                }}>
                    {test.name}
                </div>
                <ParameterResultTable rows={test.rows ?? []} />
            </div>
        );
    }

    return <SimpleResultDisplay test={test} />;
}

function StepSection({ step }: { step: { name: string; tests: LabResultTest[] } }) {
    const simpleTests = step.tests.filter((t) => t.kind === 'simple');
    const paramTests = step.tests.filter((t) => t.kind === 'parameters');

    return (
        <div className="lab-print-step-section" style={{
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            marginBottom: '16px',
            overflow: 'hidden',
            pageBreakInside: 'avoid',
        }}>
            <div style={{
                padding: '12px 16px',
                borderBottom: '2px solid #d1d5db',
                backgroundColor: '#f3f4f6',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '700', color: '#111827' }}>{step.name}</h3>
                    <span style={{
                        backgroundColor: '#d1d5db',
                        padding: '2px 10px',
                        borderRadius: '10px',
                        fontSize: '11px',
                        fontWeight: '600',
                        color: '#374151',
                    }}>
                        {step.tests.length} test{step.tests.length !== 1 ? 's' : ''}
                    </span>
                </div>
            </div>
            <div style={{ padding: '16px' }}>
                {simpleTests.length > 0 ? (
                    <div className="lab-print-simple-grid" style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(2, 1fr)',
                        gap: '8px',
                        marginBottom: paramTests.length > 0 ? '16px' : '0',
                    }}>
                        {simpleTests.map((test) => (
                            <SimpleResultDisplay key={test.id} test={test} />
                        ))}
                    </div>
                ) : null}
                {paramTests.map((test) => (
                    <TestGroup key={test.id} test={test} />
                ))}
            </div>
        </div>
    );
}

export default function LabResultPrintDiv({
    laboratory,
    resultForm,
    facilityName,
    facilityAddress,
}: LabResultPrintDivProps) {
    return (
        <div className="lab-result-print-wrapper" style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            zIndex: 99999,
            backgroundColor: 'white',
            overflow: 'auto',
            padding: '60px 24px 24px',
            boxSizing: 'border-box',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        }}>
            <div id="lab-result-print-div" style={{
                width: '100%',
                maxWidth: '210mm',
                margin: '0 auto',
            }}>
                {/* Header */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '24px',
                    paddingBottom: '20px',
                    borderBottom: '3px double #333',
                }}>
                    {/* Left side - Facility info */}
                    <div>
                        <h1 style={{ fontSize: '24px', fontWeight: '800', margin: '0 0 6px 0', color: '#111827', letterSpacing: '-0.5px' }}>
                            {facilityName}
                        </h1>
                        <p style={{ fontSize: '13px', margin: 0, color: '#6b7280', whiteSpace: 'pre-line', lineHeight: '1.5' }}>
                            {facilityAddress}
                        </p>
                    </div>

                    {/* Right side - Patient & Doctor info */}
                    <div style={{ textAlign: 'right', minWidth: '240px' }}>
                        <div style={{ fontSize: '16px', fontWeight: '800', marginBottom: '10px', color: '#111827', letterSpacing: '1px', textTransform: 'uppercase' }}>
                            TEST RESULT
                        </div>
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'auto 1fr',
                            justifyContent: 'end',
                            gap: '3px 12px',
                            fontSize: '12px',
                            lineHeight: '1.6',
                        }}>
                            <span style={{ color: '#6b7280' }}>Lab No.:</span>
                            <span style={{ fontWeight: '600' }}>{laboratory.id}</span>

                            <span style={{ color: '#6b7280' }}>Date:</span>
                            <span style={{ fontWeight: '600' }}>
                                {laboratory.createdAt
                                    ? new Date(laboratory.createdAt).toLocaleDateString()
                                    : '—'}
                            </span>

                            <span style={{ color: '#6b7280' }}>Patient:</span>
                            <span style={{ fontWeight: '600' }}>{laboratory.patientName ?? '—'}</span>

                            <span style={{ color: '#6b7280' }}>Hospital No.:</span>
                            <span style={{ fontWeight: '600' }}>{laboratory.patientId}</span>

                            <span style={{ color: '#6b7280' }}>Requested By:</span>
                            <span style={{ fontWeight: '600' }}>{laboratory.doctorName ?? '—'}</span>

                            <span style={{ color: '#6b7280' }}>Status:</span>
                            <span style={{ fontWeight: '600', textTransform: 'capitalize' }}>{laboratory.status}</span>
                        </div>
                    </div>
                </div>

                {/* Results */}
                {resultForm.steps.length === 0 ? (
                    <p style={{ textAlign: 'center', color: '#6b7280', padding: '40px 20px', fontSize: '14px' }}>
                        No test results found.
                    </p>
                ) : (
                    resultForm.steps.map((step) => (
                        <StepSection key={step.name} step={step} />
                    ))
                )}

                {/* Footer */}
                <div style={{
                    marginTop: '32px',
                    paddingTop: '16px',
                    borderTop: '1px solid #d1d5db',
                    fontSize: '11px',
                    color: '#9ca3af',
                    textAlign: 'center',
                }}>
                    <p style={{ margin: 0 }}>This is a computer-generated report.</p>
                </div>
            </div>
        </div>
    );
}

LabResultPrintDiv.displayName = 'LabResultPrintDiv';
