import { Head } from '@inertiajs/react';
import QRCode from 'qrcode';
import { Printer } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

type PatientCardProps = {
    team: {
        name: string;
        address: string | null;
        email: string | null;
        phone: string | null;
    };
    patient: {
        hospitalNo: string;
        fullName: string | null;
        gender: string | null;
    };
};

export default function PatientCard({ team, patient }: PatientCardProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [qrError, setQrError] = useState(false);

    useEffect(() => {
        if (!canvasRef.current || !patient.hospitalNo) {
            return;
        }

        setQrError(false);
        QRCode.toCanvas(
            canvasRef.current,
            patient.hospitalNo,
            { width: 180, margin: 2 },
            (error: Error | null) => {
                if (error) {
                    console.error('QR Code error:', error);
                    setQrError(true);
                }
            },
        );
    }, [patient.hospitalNo]);

    function handlePrint() {
        window.print();
    }

    return (
        <>
            <Head title="Patient Card" />

            <style>{`
                @media print {
                    @page {
                        size: 4in 4in;
                        margin: 0;
                    }

                    body {
                        margin: 0;
                        padding: 0;
                        background: #fff !important;
                    }

                    .no-print {
                        display: none !important;
                    }

                    #patient-card-print-wrapper {
                        margin: 0 !important;
                        padding: 0 !important;
                        max-width: none !important;
                    }

                    #patient-card {
                        width: 4in !important;
                        height: 4in !important;
                        border: 2px solid #000 !important;
                        box-shadow: none !important;
                        background: #fff !important;
                        color: #000 !important;
                        print-color-adjust: exact;
                        -webkit-print-color-adjust: exact;
                    }
                }
            `}</style>

            <div className="min-h-screen bg-muted/30 p-8">
                <div className="mx-auto max-w-2xl space-y-6">
                    {/* Actions */}
                    <div className="no-print flex justify-center">
                        <button
                            type="button"
                            onClick={handlePrint}
                            aria-label="Print patient card"
                            className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground outline-none hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-ring"
                        >
                            <Printer className="h-4 w-4" />
                            Print Card
                        </button>
                    </div>

                    {/* Patient Card - Wrapper for print */}
                    <div id="patient-card-print-wrapper">
                        <div
                            id="patient-card"
                            className="rounded-lg border bg-card p-6 shadow-sm"
                            style={{ width: '4in', height: '4in' }}
                        >
                            {/* Team Header */}
                            <div className="mb-6 border-b pb-6">
                                <h1 className="text-2xl font-bold text-foreground">
                                    {team.name}
                                </h1>
                                {team.address && (
                                    <p className="mt-1 text-sm text-muted-foreground">
                                        {team.address}
                                    </p>
                                )}
                                <div className="mt-2 flex flex-wrap gap-4 text-sm text-muted-foreground">
                                    {team.email && (
                                        <span>Email: {team.email}</span>
                                    )}
                                    {team.phone && (
                                        <span>Phone: {team.phone}</span>
                                    )}
                                </div>
                            </div>

                            {/* Patient Details */}
                            <div className="flex items-start gap-8">
                                <div className="flex-1 space-y-4">
                                    <div>
                                        <p className="text-xs font-medium tracking-wider text-muted-foreground uppercase">
                                            Hospital No
                                        </p>
                                        <p className="mt-1 text-lg font-semibold text-foreground">
                                            {patient.hospitalNo}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-medium tracking-wider text-muted-foreground uppercase">
                                            Patient Name
                                        </p>
                                        <p className="mt-1 text-lg font-semibold text-foreground">
                                            {patient.fullName ?? '—'}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-medium tracking-wider text-muted-foreground uppercase">
                                            Gender
                                        </p>
                                        <p className="mt-1 text-lg font-semibold text-foreground">
                                            {patient.gender ?? '—'}
                                        </p>
                                    </div>
                                </div>

                                {/* QR Code */}
                                <div className="shrink-0">
                                    <div className="rounded-lg border p-2">
                                        <canvas
                                            ref={canvasRef}
                                            aria-label={`QR code for ${patient.hospitalNo}`}
                                            className={
                                                qrError ? 'hidden' : undefined
                                            }
                                        />
                                        {qrError ? (
                                            <div
                                                role="status"
                                                className="flex h-[180px] w-[180px] flex-col items-center justify-center gap-2 rounded-md bg-muted p-3 text-center"
                                            >
                                                <span className="text-xs font-medium text-muted-foreground">
                                                    QR unavailable — use
                                                    hospital number
                                                </span>
                                                <span className="font-mono text-sm font-semibold text-foreground">
                                                    {patient.hospitalNo}
                                                </span>
                                            </div>
                                        ) : null}
                                    </div>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="mt-8 border-t pt-4">
                                <p className="text-xs text-muted-foreground">
                                    This card is issued by {team.name}. Scan the
                                    QR code to verify the hospital number.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
