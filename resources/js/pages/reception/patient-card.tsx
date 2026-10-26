import { Head, router, usePage } from '@inertiajs/react';
import QRCode from 'qrcode';
import { ArrowLeft, Printer } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { index } from '@/routes/reception';
import type { Team } from '@/types';

type LayoutProps = {
    currentTeam?: Team | null;
};

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

export default function PatientCard({
    team,
    patient,
}: PatientCardProps) {
    const page = usePage<LayoutProps>();
    const teamSlug = page.props.currentTeam?.slug ?? '';

    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        if (canvasRef.current && patient.hospitalNo) {
            QRCode.toCanvas(
                canvasRef.current,
                patient.hospitalNo,
                { width: 180, margin: 2 },
                (error) => {
                    if (error) {
                        console.error('QR Code error:', error);
                    }
                },
            );
        }
    }, [patient.hospitalNo]);

    function handlePrint() {
        const card = document.getElementById('patient-card');
        const canvas = document.getElementById('patient-card-print-wrapper');

        if (!card || !canvas) return;

        // Get the QR code canvas content
        const qrCanvas = canvas.querySelector('canvas');
        const qrDataUrl = qrCanvas ? qrCanvas.toDataURL() : '';

        // Create a new window with only the card content
        const printWindow = window.open('', '_blank', 'width=400,height=400');

        if (printWindow) {
            printWindow.document.write(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Patient Card</title>
                    <style>
                        @page {
                            size: 4in 4in;
                            margin: 0;
                        }
                        * {
                            margin: 0;
                            padding: 0;
                            box-sizing: border-box;
                        }
                        body {
                            margin: 0;
                            padding: 0;
                            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                        }
                        #patient-card {
                            width: 4in;
                            height: 4in;
                            border: 2px solid #000;
                            padding: 16px;
                            display: flex;
                            flex-direction: column;
                        }
                        .border-b {
                            border-bottom: 1px solid #e5e7eb;
                            padding-bottom: 16px;
                            margin-bottom: 16px;
                        }
                        .text-2xl {
                            font-size: 1.5rem;
                            font-weight: bold;
                        }
                        .mt-1 {
                            margin-top: 4px;
                        }
                        .text-sm {
                            font-size: 0.875rem;
                        }
                        .text-muted-foreground {
                            color: #6b7280;
                        }
                        .mt-2 {
                            margin-top: 8px;
                        }
                        .flex {
                            display: flex;
                        }
                        .flex-wrap {
                            flex-wrap: wrap;
                        }
                        .gap-4 {
                            gap: 16px;
                        }
                        .flex-1 {
                            flex: 1;
                        }
                        .flex-shrink-0 {
                            flex-shrink: 0;
                        }
                        .gap-8 {
                            gap: 32px;
                        }
                        .items-start {
                            align-items: flex-start;
                        }
                        .space-y-4 > * + * {
                            margin-top: 16px;
                        }
                        .text-xs {
                            font-size: 0.75rem;
                        }
                        .font-medium {
                            font-weight: 500;
                        }
                        .uppercase {
                            text-transform: uppercase;
                        }
                        .tracking-wider {
                            letter-spacing: 0.05em;
                        }
                        .text-lg {
                            font-size: 1.125rem;
                        }
                        .font-semibold {
                            font-weight: 600;
                        }
                        .mt-8 {
                            margin-top: 32px;
                        }
                        .border-t {
                            border-top: 1px solid #e5e7eb;
                        }
                        .pt-4 {
                            padding-top: 16px;
                        }
                        .rounded-lg {
                            border-radius: 0.5rem;
                        }
                        .border {
                            border: 1px solid #e5e7eb;
                        }
                        .bg-white {
                            background-color: white;
                        }
                        .p-2 {
                            padding: 8px;
                        }
                        img {
                            max-width: 100%;
                            height: auto;
                        }
                    </style>
                </head>
                <body>
                    ${card.innerHTML}
                    ${qrDataUrl ? `<script>
                        window.onload = function() {
                            const container = document.querySelector('.flex-shrink-0 .rounded-lg');
                            const img = document.createElement('img');
                            img.src = '${qrDataUrl}';
                            img.style.width = '180px';
                            img.style.height = '180px';
                            container.innerHTML = '';
                            container.appendChild(img);
                        };
                    </script>` : ''}
                </body>
                </html>
            `);
            printWindow.document.close();

            // Wait for content to load, then print
            setTimeout(() => {
                printWindow.print();
                printWindow.close();
            }, 250);
        }
    }

    function handleBack() {
        router.get(index.url(teamSlug));
    }

    return (
        <>
            <Head title="Patient Card" />

            <div className="min-h-screen bg-muted/30 p-8">
                <div className="mx-auto max-w-2xl space-y-6">
                    {/* Actions */}
                    <div className="no-print space-y-4">
                        <div className="flex items-center justify-between">
                            <button
                                onClick={handleBack}
                                className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
                            >
                                <ArrowLeft className="h-4 w-4" />
                                Back to Reception
                            </button>
                            <button
                                onClick={handlePrint}
                                className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90"
                            >
                                <Printer className="h-4 w-4" />
                                Print Card
                            </button>
                        </div>
                    </div>

                    {/* Patient Card - Wrapper for print */}
                    <div id="patient-card-print-wrapper">
                        <div
                            id="patient-card"
                            className="rounded-lg border bg-card p-6 shadow-sm"
                            style={{ width: '4in', height: '4in' }}
                        >
                            {/* Team Header */}
                            <div className="border-b pb-6 mb-6">
                                <h1 className="text-2xl font-bold text-foreground">
                                    {team.name}
                                </h1>
                                {team.address && (
                                    <p className="mt-1 text-sm text-muted-foreground">
                                        {team.address}
                                    </p>
                                )}
                                <div className="mt-2 flex flex-wrap gap-4 text-sm text-muted-foreground">
                                    {team.email && <span>Email: {team.email}</span>}
                                    {team.phone && <span>Phone: {team.phone}</span>}
                                </div>
                            </div>

                            {/* Patient Details */}
                            <div className="flex items-start gap-8">
                                <div className="space-y-4 flex-1">
                                    <div>
                                        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                            Hospital No
                                        </p>
                                        <p className="mt-1 text-lg font-semibold text-foreground">
                                            {patient.hospitalNo}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                            Patient Name
                                        </p>
                                        <p className="mt-1 text-lg font-semibold text-foreground">
                                            {patient.fullName ?? '—'}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                            Gender
                                        </p>
                                        <p className="mt-1 text-lg font-semibold text-foreground">
                                            {patient.gender ?? '—'}
                                        </p>
                                    </div>
                                </div>

                                {/* QR Code */}
                                <div className="flex-shrink-0">
                                    <div className="rounded-lg border bg-white p-2">
                                        <canvas ref={canvasRef} />
                                    </div>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="mt-8 border-t pt-4">
                                <p className="text-xs text-muted-foreground">
                                    This card is issued by {team.name}. Scan the QR
                                    code to verify the hospital number.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </>
    );
}
