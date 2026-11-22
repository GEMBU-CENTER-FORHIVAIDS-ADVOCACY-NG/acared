import { Head, Link, router, usePage } from '@inertiajs/react';
import { useEffect } from 'react';
import LabResultPrintDiv from '@/components/lab-result-print-div';
import type { LabResultForm, LaboratoryShow, Team } from '@/types';
import { Button } from '@/components/ui/button';
import { show as laboratoryShow } from '@/routes/laboratories';

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
    const showUrl = laboratoryShow.url({
        current_team: teamSlug,
        laboratory: laboratory.id,
    });

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                router.visit(showUrl);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [showUrl]);

    function handlePrint() {
        window.print();
    }

    return (
        <>
            <Head title={`Lab #${laboratory.id} — Print`} />

            <style>{`
                @media print {
                    @page {
                        size: A4 portrait;
                        margin: 12mm;
                    }

                    body {
                        background: #fff !important;
                    }

                    .no-print {
                        display: none !important;
                    }

                    .lab-result-print-wrapper {
                        position: static !important;
                        width: auto !important;
                        height: auto !important;
                        overflow: visible !important;
                        padding: 0 !important;
                        background: #fff !important;
                    }

                    .lab-result-print-wrapper #lab-result-print-div {
                        width: 100% !important;
                        max-width: none !important;
                    }
                }
            `}</style>

            {/* Print Content */}
            <LabResultPrintDiv
                laboratory={laboratory}
                resultForm={resultForm}
                facilityName={laboratory.facilityName ?? 'Facility'}
                facilityAddress={laboratory.facilityAddress ?? ''}
            />

            <div className="no-print fixed top-0 right-0 left-0 z-[100000] flex flex-wrap items-center justify-between gap-3 border-b border-border bg-background px-6 py-3 text-foreground shadow-sm">
                <div className="flex items-center gap-3">
                    <Button variant="outline" size="sm" asChild>
                        <Link href={showUrl}>← Back to laboratory</Link>
                    </Button>
                    <span className="text-xs text-muted-foreground">
                        Press{' '}
                        <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 text-[11px]">
                            Esc
                        </kbd>{' '}
                        to go back
                    </span>
                </div>
                <Button size="sm" onClick={handlePrint}>
                    Print result
                </Button>
            </div>
        </>
    );
}
