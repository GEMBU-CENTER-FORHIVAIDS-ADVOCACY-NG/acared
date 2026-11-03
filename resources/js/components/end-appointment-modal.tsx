import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

type Props = {
    open: boolean;
    onEndAppointment: () => void;
    onContinue: () => void;
};

export function EndAppointmentModal({
    open,
    onEndAppointment,
    onContinue,
}: Props) {
    return (
        <Dialog
            open={open}
            onOpenChange={() => {
                // Prevent closing via overlay click or escape key
            }}
        >
            <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => e.preventDefault()} onInteractOutside={(e) => e.preventDefault()}>
                <DialogHeader>
                    <DialogTitle>Prescription submitted</DialogTitle>
                    <DialogDescription>
                        Would you like to end this appointment now?
                    </DialogDescription>
                </DialogHeader>

                <div className="flex gap-2">
                    <Button
                        className="flex-1"
                        variant="secondary"
                        onClick={onContinue}
                    >
                        Continue
                    </Button>
                    <Button
                        className="flex-1"
                        onClick={onEndAppointment}
                    >
                        End appointment
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
