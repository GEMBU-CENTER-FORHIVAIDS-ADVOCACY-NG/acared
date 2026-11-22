import { AlertCircleIcon } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function AlertError({
    errors,
    title,
}: {
    errors: string[];
    title?: string;
}) {
    const uniqueErrors = Array.from(new Set(errors));

    if (uniqueErrors.length === 0) {
        return null;
    }

    return (
        <Alert
            variant="destructive"
            className="border-destructive/30 bg-destructive/10 text-destructive *:data-[slot=alert-description]:text-destructive/90"
        >
            <AlertCircleIcon />
            <AlertTitle>{title || 'Something went wrong.'}</AlertTitle>
            <AlertDescription>
                <ul className="list-inside list-disc text-sm">
                    {uniqueErrors.map((error, index) => (
                        <li key={index}>{error}</li>
                    ))}
                </ul>
            </AlertDescription>
        </Alert>
    );
}
