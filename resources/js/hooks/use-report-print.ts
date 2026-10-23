import { useCallback, useRef } from 'react';

/**
 * Hook that provides a print function for report pages.
 * It adds the `printing-report` class to the body, triggers `window.print()`,
 * then removes the class so the page returns to normal.
 * The `printRef` must be attached to the container element that wraps the
 * report title and table – only that container will be visible when printing.
 */
export function useReportPrint() {
    const printRef = useRef<HTMLDivElement>(null);

    const handlePrint = useCallback(() => {
        document.body.classList.add('printing-report');
        window.print();
        document.body.classList.remove('printing-report');
    }, []);

    return { printRef, handlePrint };
}
