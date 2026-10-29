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
        return <p style={{ fontSize: '12px', color: '#666' }}>No parameters.</p>;
    }

    const hasUom = rows.some((row) => row.result_type !== 'select' && row.result_type !== 'radio');

    return (
        <table style={{ width: '100%', fontSize: '12px', borderCollapse: 'collapse' }}>
            <thead>
                <tr style={{ borderBottom: '1px solid #ddd' }}>
                    <th style={{ padding: '6px 8px', textAlign: 'left', fontWeight: '600', color: '#666' }}>
                        Parameter
                    </th>
                    <th style={{ padding: '6px 8px', textAlign: 'left', fontWeight: '600', color: '#666' }}>
                        Range
                    </th>
                    <th style={{ padding: '6px 8px', textAlign: 'left', fontWeight: '700' }}>
                        Result
                    </th>
                    {hasUom ? (
                        <th style={{ padding: '6px 8px', textAlign: 'left', fontWeight: '600', color: '#666' }}>
                            UOM
                        </th>
                    ) : null}
                </tr>
            </thead>
            <tbody>
                {rows.map((row) => {
                    const hideUom = row.result_type === 'select' || row.result_type === 'radio';
                    return (
                        <tr key={row.price_list_id} style={{ borderBottom: '1px solid #eee' }}>
                            <td style={{ padding: '6px 8px' }}>{row.name}</td>
                            <td style={{ padding: '6px 8px', color: '#666' }}>
                                {row.range ?? '—'}
                            </td>
                            <td style={{ padding: '6px 8px', fontWeight: '700' }}>
                                {row.result ?? '—'}
                            </td>
                            {hasUom ? (
                                <td style={{ padding: '6px 8px', color: '#666' }}>
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
        <div className="lab-print-simple-test lab-print-flex" style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '8px 12px',
            borderRadius: '6px',
            backgroundColor: '#f9fafb',
            marginBottom: '8px',
        }}>
            <span style={{ fontSize: '13px', color: '#666', flex: '0 0 60%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{test.name}</span>
            <div className="lab-print-flex" style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
                <span style={{ fontSize: '13px', fontWeight: '700' }}>{test.result ?? '—'}</span>
                {!hideUom && test.unit ? (
                    <span style={{ fontSize: '11px', color: '#999' }}>{test.unit}</span>
                ) : null}
            </div>
        </div>
    );
}

function TestGroup({ test }: { test: LabResultTest }) {
    if (test.kind === 'parameters') {
        return (
            <div className="lab-print-test-group" style={{
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                marginBottom: '12px',
                overflow: 'hidden',
            }}>
                <div style={{
                    padding: '8px 12px',
                    borderBottom: '1px solid #e5e7eb',
                    backgroundColor: '#f9fafb',
                    fontWeight: '600',
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
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            marginBottom: '16px',
            overflow: 'hidden',
            pageBreakInside: 'avoid',
        }}>
            <div style={{
                padding: '12px 16px',
                borderBottom: '1px solid #e5e7eb',
                backgroundColor: '#f9fafb',
            }}>
                <div className="lab-print-flex" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <h3 style={{ margin: 0, fontSize: '14px', fontWeight: '600' }}>{step.name}</h3>
                    <span style={{
                        backgroundColor: '#e5e7eb',
                        padding: '2px 8px',
                        borderRadius: '12px',
                        fontSize: '11px',
                        color: '#666',
                    }}>
                        {step.tests.length} test{step.tests.length !== 1 ? 's' : ''}
                    </span>
                </div>
            </div>
            <div style={{ padding: '16px' }}>
                {simpleTests.length > 0 ? (
                    <div className="lab-print-simple-grid" style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(4, 1fr)',
                        gap: '8px',
                        marginBottom: '12px',
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
        <div id="lab-result-print-div" style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            zIndex: 99999,
            backgroundColor: 'white',
            overflow: 'auto',
            padding: '0',
            boxSizing: 'border-box',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        }}>
            {/* Invoice-style header */}
            <div className="lab-print-flex" style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: '24px',
                paddingBottom: '20px',
                borderBottom: '2px solid #333',
            }}>
                {/* Left side - Facility info */}
                <div>
                    <h1 style={{ fontSize: '22px', fontWeight: '700', margin: '0 0 4px 0', color: '#1a1a1a' }}>
                        {facilityName}
                    </h1>
                    <p style={{ fontSize: '12px', margin: '0 0 2px 0', color: '#666' }}>
                        {facilityAddress}
                    </p>
                </div>

                {/* Right side - Patient & Doctor info */}
                <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: '#1a1a1a' }}>
                        TEST RESULT
                    </div>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: '4px 16px',
                        fontSize: '12px',
                        textAlign: 'right',
                    }}>
                        <div style={{ color: '#666' }}>Lab No.:</div>
                        <div style={{ fontWeight: '600' }}>{laboratory.id}</div>

                        <div style={{ color: '#666' }}>Date:</div>
                        <div style={{ fontWeight: '600' }}>
                            {laboratory.createdAt
                                ? new Date(laboratory.createdAt).toLocaleDateString()
                                : '—'}
                        </div>

                        <div style={{ color: '#666' }}>Patient:</div>
                        <div style={{ fontWeight: '600' }}>{laboratory.patientName ?? '—'}</div>

                        <div style={{ color: '#666' }}>Hospital No.:</div>
                        <div style={{ fontWeight: '600' }}>{laboratory.patientId}</div>

                        <div style={{ color: '#666' }}>Requested By:</div>
                        <div style={{ fontWeight: '600' }}>{laboratory.doctorName ?? '—'}</div>

                        <div style={{ color: '#666' }}>Status:</div>
                        <div style={{ fontWeight: '600', textTransform: 'capitalize' }}>{laboratory.status}</div>
                    </div>
                </div>
            </div>

            {/* Results card - matching on-screen structure */}
            <div style={{
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                overflow: 'hidden',
            }}>
                {/* Card header with title */}
                <div style={{
                    padding: '16px 24px',
                }}>
                    <h2 style={{ fontSize: '18px', fontWeight: '700', margin: 0 }}>
                        Results
                    </h2>
                </div>

                {/* Card content */}
                <div style={{ padding: '16px 24px 24px' }}>
                    {resultForm.steps.length === 0 ? (
                        <p style={{ textAlign: 'center', color: '#666', padding: '20px' }}>
                            No test results found.
                        </p>
                    ) : (
                        <div className="lab-print-flex" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {resultForm.steps.map((step) => (
                                <StepSection key={step.name} step={step} />
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Footer */}
            <div style={{
                marginTop: '40px',
                paddingTop: '20px',
                borderTop: '1px solid #e5e7eb',
                fontSize: '11px',
                color: '#999',
                textAlign: 'center',
            }}>
                <p>This is a computer-generated report.</p>
            </div>
        </div>
    );
}
