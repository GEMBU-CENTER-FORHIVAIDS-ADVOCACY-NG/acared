import { router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import PatientController from '@/actions/App/Http/Controllers/PatientController';

export type ConfirmAction = 'delete' | 'force-delete' | 'restore';

const labels: Record<
    ConfirmAction,
    { title: string; description: string; confirmLabel: string }
> = {
    delete: {
        title: 'Delete patient?',
        description: 'This patient will be moved to the trash.',
        confirmLabel: 'Delete',
    },
    'force-delete': {
        title: 'Permanently delete patient?',
        description:
            'This patient will be permanently removed. This cannot be undone.',
        confirmLabel: 'Force delete',
    },
    restore: {
        title: 'Restore patient?',
        description: 'This patient will be restored from the trash.',
        confirmLabel: 'Restore',
    },
};

export function patientConfirmLabels(action: ConfirmAction) {
    return labels[action];
}

export function usePatientActions(patientId: number) {
    const { currentTeam } = usePage().props;
    const teamSlug = currentTeam?.slug ?? '';

    const [confirm, setConfirm] = useState<ConfirmAction | null>(null);
    const [processing, setProcessing] = useState(false);

    function runConfirm() {
        if (!confirm) {
            return;
        }

        setProcessing(true);

        const visitOptions = {
            preserveScroll: true,
            onFinish: () => {
                setProcessing(false);
                setConfirm(null);
            },
        };

        if (confirm === 'delete') {
            router.delete(
                PatientController.destroy.url([teamSlug, patientId]),
                visitOptions,
            );
        } else if (confirm === 'force-delete') {
            router.delete(
                PatientController.forceDelete.url([teamSlug, patientId]),
                visitOptions,
            );
        } else {
            router.patch(
                PatientController.restore.url([teamSlug, patientId]),
                {},
                visitOptions,
            );
        }
    }

    return {
        teamSlug,
        confirm,
        setConfirm,
        processing,
        runConfirm,
    };
}
