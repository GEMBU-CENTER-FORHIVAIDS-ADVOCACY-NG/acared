import { useCallback, useRef } from 'react';

/**
 * Hook that provides a print function for report pages.
 * It clones the report content (title + table) into a dedicated print div,
 * triggers `window.print()`, then cleans up.
 * The `printRef` must be attached to the container element that wraps the
 * report title and table – only that container will be printed.
 */
export function useReportPrint() {
    const printRef = useRef<HTMLDivElement>(null);
    const printDivRef = useRef<HTMLDivElement>(null);

    const handlePrint = useCallback(() => {
        if (!printRef.current) return;

        // Remove any existing print div
        const existing = document.getElementById('report-print-div');
        if (existing) {
            existing.remove();
        }

        // Create a full-page print div
        const printDiv = document.createElement('div');
        printDiv.id = 'report-print-div';
        printDiv.innerHTML = printRef.current.innerHTML;
        document.body.appendChild(printDiv);
        printDivRef.current = printDiv;

        // Show the print div and hide the main content
        document.body.classList.add('printing-report');

        // Print after a brief delay to allow styles to apply
        requestAnimationFrame(() => {
            window.print();
        });

        // Cleanup after print dialog closes
        const cleanup = () => {
            document.body.classList.remove('printing-report');
            if (printDivRef.current) {
                printDivRef.current.remove();
                printDivRef.current = null;
            }
            window.removeEventListener('afterprint', cleanup);
            setTimeout(() => {
                document.removeEventListener('keyup', cleanup);
            }, 100);
        };

        window.addEventListener('afterprint', cleanup);
        document.addEventListener('keyup', (e) => {
            if (e.key === 'Escape') {
                cleanup();
            }
        });
    }, []);

    return { printRef, handlePrint };
}
