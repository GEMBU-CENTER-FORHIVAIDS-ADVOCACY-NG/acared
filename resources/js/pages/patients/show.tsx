import { Head, Link, usePage } from '@inertiajs/react';
import ConfirmDialog from '@/components/confirm-dialog';
import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    patientConfirmLabels,
    usePatientActions,
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
    const { teamSlug, confirm, setConfirm, processing, runConfirm } =
        usePatientActions(patient.id);

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
                            <Link href={edit([teamSlug, patient.id])}>
                                Edit
                            </Link>
                        </Button>
                        {patient.deletedAt ? (
                            <>
                                <Button
                                    variant="outline"
                                    onClick={() => setConfirm('restore')}
                                >
                                    Restore
                                </Button>
                                <Button
                                    variant="destructive"
                                    onClick={() => setConfirm('force-delete')}
                                >
                                    Force delete
                                </Button>
                            </>
                        ) : (
                            <Button
                                variant="destructive"
                                onClick={() => setConfirm('delete')}
                            >
                                Delete
                            </Button>
                        )}
                        <Button variant="secondary" asChild>
                            <Link href={index(teamSlug)}>Back to patients</Link>
                        </Button>
                    </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Identification</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <Row label="Hospital No" value={patient.slug} />
                            <Row label="ART No" value={patient.art} />
                            <Row label="NHIS/Other" value={patient.slugOther} />
                            <Row
                                label="Category"
                                value={patient.category?.name}
                            />
                            <Row label="Wallet" value={patient.wallet} />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Personal details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <Row label="Full name" value={patient.fullName} />
                            <Row label="Gender" value={patient.gender} />
                            <Row
                                label="Date of birth"
                                value={patient.birthDate}
                            />
                            <Row label="Age" value={patient.age} />
                            <Row label="Email address" value={patient.email} />
                            <Row label="Phone" value={patient.phone} />
                            <Row label="Mobile" value={patient.mobile} />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Location</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <Row
                                label="Country"
                                value={patient.country?.name}
                            />
                            <Row label="State" value={patient.state?.name} />
                            <Row label="LGA" value={patient.lga?.name} />
                            <Row label="Address" value={patient.address} />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Next of kin</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <Row
                                label="Full name"
                                value={patient.kinFullName}
                            />
                            <Row label="Phone" value={patient.kinPhone} />
                            <Row label="Email" value={patient.kinEmail} />
                            <Row label="Relation" value={patient.relation} />
                        </CardContent>
                    </Card>
                </div>
            </div>

            <ConfirmDialog
                open={confirm !== null}
                onOpenChange={(open) => {
                    if (!open) {
                        setConfirm(null);
                    }
                }}
                processing={processing}
                destructive={confirm !== 'restore'}
                {...patientConfirmLabels(confirm ?? 'delete')}
                onConfirm={runConfirm}
            />
        </>
    );
}

PatientShow.layout = (props: LayoutProps) => ({
    breadcrumbs: [
        {
            title: 'Patients',
            href: props.currentTeam
                ? index(props.currentTeam.slug)
                : '/patients',
        },
        {
            title: props.patient?.fullName ?? 'Patient',
            href:
                props.currentTeam && props.patient
                    ? show([props.currentTeam.slug, props.patient.id])
                    : '/patients',
        },
    ],
});
