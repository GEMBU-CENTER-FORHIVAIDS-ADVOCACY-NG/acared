import { Head, Link, usePage } from '@inertiajs/react';
import { useEffect } from 'react';
import LabResultPrintDiv from '@/components/lab-result-print-div';
import type { LabResultForm, LaboratoryShow, Team } from '@/types';
import { Button } from '@/components/ui/button';

type LayoutProps = {
    currentTeam?: Team | null;
};

export default function LaboratoryPrint({
    laboratory,
    resultForm,
}: {
    laboratory: LaboratoryShow;
    resultForm: LabResultForm;
}) {
    const { currentTeam } = usePage<LayoutProps>().props;
    const teamSlug = currentTeam?.slug ?? '';

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                window.history.back();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const handlePrint = () => {
        // Add the printing class to body
        document.body.classList.add('printing-lab-result');

        // Clone the print div and append it directly to body so it prints at full width
        const printDiv = document.getElementById('lab-result-print-div');
        if (printDiv) {
            const clone = printDiv.cloneNode(true);
            clone.id = 'lab-result-print-div';
            clone.style.position = 'absolute';
            clone.style.top = '0';
            clone.style.left = '0';
            clone.style.width = '100%';
            clone.style.maxWidth = 'none';
            clone.style.boxSizing = 'border-box';
            clone.style.backgroundColor = 'white';
            document.body.appendChild(clone);
        }

        // Print after a short delay to let the DOM update
        setTimeout(() => {
            window.print();

            // Cleanup after print
            setTimeout(() => {
                document.body.classList.remove('printing-lab-result');
                const clones = document.body.querySelectorAll('#lab-result-print-div');
                // Remove the cloned div (the last one, which is outside the wrapper)
                if (clones.length > 1) {
                    clones[clones.length - 1].remove();
                }
            }, 500);
        }, 100);
    };

    return (
        <>
            <Head title={`Lab #${laboratory.id} — Print`} />

            {/* Print Content */}
            <LabResultPrintDiv
                laboratory={laboratory}
                resultForm={resultForm}
                facilityName={laboratory.facilityName ?? 'Facility'}
                facilityAddress={laboratory.facilityAddress}
            />

            {/* Toolbar - positioned above the print div */}
            <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                zIndex: 100000,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 24px',
                borderBottom: '1px solid #e5e7eb',
                backgroundColor: 'white',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            }} className="no-print">
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Button
                        variant="outline"
                        size="sm"
                        asChild
                    >
                        <Link href={`/${teamSlug}/laboratories/${laboratory.id}`}>
                            ← Back to laboratory
                        </Link>
                    </Button>
                    <span style={{ fontSize: '13px', color: '#666' }}>
                        Press <kbd style={{
                            padding: '2px 6px',
                            border: '1px solid #ddd',
                            borderRadius: '4px',
                            backgroundColor: '#f3f4f6',
                            fontSize: '11px',
                        }}>Esc</kbd> to go back
                    </span>
                </div>
                <Button size="sm" onClick={handlePrint}>
                    Print result
                </Button>
            </div>
        </>
    );
}
