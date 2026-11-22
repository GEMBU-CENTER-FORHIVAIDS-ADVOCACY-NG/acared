import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import PatientController from '@/actions/App/Http/Controllers/PatientController';
import AlertError from '@/components/alert-error';
import ConfirmDialog from '@/components/confirm-dialog';
import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    patientConfirmLabels,
    type ConfirmAction,
} from '@/hooks/use-patient-actions';
import { edit, index, show } from '@/routes/patients';
import type { PatientDetail, Team } from '@/types';

type LayoutProps = {
    currentTeam?: Team | null;
    patient?: PatientDetail;
};

function Row({
    label,
    value,
}: {
    label: string;
    value: string | number | null | undefined;
}) {
    return (
        <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:gap-4">
            <dt className="w-40 shrink-0 text-sm text-muted-foreground">
                {label}
            </dt>
            <dd className="text-sm">
                {value === null || value === undefined || value === ''
                    ? '—'
                    : value}
            </dd>
        </div>
    );
}

export default function PatientShow({ patient }: { patient: PatientDetail }) {
    const { currentTeam } = usePage<{ currentTeam?: Team | null }>().props;
    const teamSlug = currentTeam?.slug ?? '';
    const [confirm, setConfirm] = useState<ConfirmAction | null>(null);
    const [processing, setProcessing] = useState(false);
    const [actionError, setActionError] = useState<string | null>(null);

    function openConfirm(action: ConfirmAction) {
        setActionError(null);
        setConfirm(action);
    }

    function runConfirm() {
        if (!confirm) {
            return;
        }

        setProcessing(true);
        setActionError(null);

        const options = {
            preserveScroll: true,
            onSuccess: () => setConfirm(null),
            onError: (errors: Record<string, string>) =>
                setActionError(
                    Object.values(errors)[0] ?? 'Unable to complete action.',
                ),
            onFinish: () => setProcessing(false),
        };

        if (confirm === 'restore') {
            router.patch(
                PatientController.restore.url([teamSlug, patient.id]),
                {},
                options,
            );
            return;
        }

        const url =
            confirm === 'delete'
                ? PatientController.destroy.url([teamSlug, patient.id])
                : PatientController.forceDelete.url([teamSlug, patient.id]);

        router.delete(url, options);
    }

    return (
        <>
            <Head title={patient.fullName} />

            <div className="flex w-full flex-col space-y-6 p-4 md:p-6 lg:p-8">
                <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                        <Heading
                            variant="small"
                            title={patient.fullName}
                            description={`Hospital No ${patient.slug}`}
                        />
                        {patient.deletedAt ? (
                            <Badge variant="destructive">Trashed</Badge>
                        ) : null}
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        <Button variant="outline" asChild>
                            <Link
                                href={edit([teamSlug, patient.id])}
                                aria-label={`Edit ${patient.fullName}`}
                            >
                                Edit
                            </Link>
                        </Button>
                        {patient.deletedAt ? (
                            <>
                                <Button
                                    variant="outline"
                                    disabled={processing}
                                    onClick={() => openConfirm('restore')}
                                >
                                    {processing ? 'Working...' : 'Restore'}
                                </Button>
                                <Button
                                    variant="destructive"
                                    disabled={processing}
                                    onClick={() => openConfirm('force-delete')}
                                >
                                    {processing ? 'Working...' : 'Force delete'}
                                </Button>
                            </>
                        ) : (
                            <Button
                                variant="destructive"
                                disabled={processing}
                                onClick={() => openConfirm('delete')}
                            >
                                {processing ? 'Working...' : 'Delete'}
                            </Button>
                        )}
                        <Button variant="secondary" asChild>
                            <Link
                                href={index(teamSlug)}
                                aria-label="Back to patients"
                            >
                                Back to patients
                            </Link>
                        </Button>
                    </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Identification</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <dl className="space-y-3">
                                <Row label="Hospital No" value={patient.slug} />
                                <Row label="ART No" value={patient.art} />
                                <Row
                                    label="NHIS/Other"
                                    value={patient.slugOther}
                                />
                                <Row
                                    label="Category"
                                    value={patient.category?.name}
                                />
                                <Row label="Wallet" value={patient.wallet} />
                            </dl>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Personal details</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <dl className="space-y-3">
                                <Row
                                    label="Full name"
                                    value={patient.fullName}
                                />
                                <Row label="Gender" value={patient.gender} />
                                <Row
                                    label="Date of birth"
                                    value={patient.birthDate}
                                />
                                <Row label="Age" value={patient.age} />
                                <Row
                                    label="Email address"
                                    value={patient.email}
                                />
                                <Row label="Phone" value={patient.phone} />
                                <Row label="Mobile" value={patient.mobile} />
                            </dl>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Location</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <dl className="space-y-3">
                                <Row
                                    label="Country"
                                    value={patient.country?.name}
                                />
                                <Row
                                    label="State"
                                    value={patient.state?.name}
                                />
                                <Row label="LGA" value={patient.lga?.name} />
                                <Row label="Address" value={patient.address} />
                            </dl>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Next of kin</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <dl className="space-y-3">
                                <Row
                                    label="Full name"
                                    value={patient.kinFullName}
                                />
                                <Row label="Phone" value={patient.kinPhone} />
                                <Row label="Email" value={patient.kinEmail} />
                                <Row
                                    label="Relation"
                                    value={patient.relation}
                                />
                            </dl>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {actionError ? (
                <AlertError errors={[actionError]} title="Action failed" />
            ) : null}
            <ConfirmDialog
                open={confirm !== null}
                onOpenChange={(open) => {
                    if (!open && !processing) {
                        setConfirm(null);
                    }
                }}
                processing={processing}
                destructive={confirm !== 'restore'}
                {...patientConfirmLabels(confirm ?? 'delete')}
                confirmLabel={
                    processing
                        ? 'Working...'
                        : patientConfirmLabels(confirm ?? 'delete').confirmLabel
                }
                onConfirm={runConfirm}
            />
        </>
    );
}

PatientShow.layout = (props: LayoutProps) => ({
    breadcrumbs: [
        {
            title: 'Patients',
            href: index(props.currentTeam?.slug),
        },
        {
            title: props.patient?.fullName ?? 'Patient',
            href:
                props.currentTeam && props.patient
                    ? show([props.currentTeam.slug, props.patient.id])
                    : index(props.currentTeam?.slug),
        },
    ],
});
