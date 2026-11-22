import { Form, Head, Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import PatientController from '@/actions/App/Http/Controllers/PatientController';
import AlertError from '@/components/alert-error';
import ConfirmDialog from '@/components/confirm-dialog';
import Heading from '@/components/heading';
import PatientFormFields from '@/components/patient-form-fields';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    patientConfirmLabels,
    type ConfirmAction,
} from '@/hooks/use-patient-actions';
import { edit, index, show } from '@/routes/patients';
import type { PatientDetail, PatientFormOptions, Team } from '@/types';

type LayoutProps = {
    currentTeam?: Team | null;
    patient?: PatientDetail;
};

export default function PatientEdit({
    patient,
    options,
}: {
    patient: PatientDetail;
    options: PatientFormOptions;
}) {
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

    const [gender, setGender] = useState(patient.gender ?? '');
    const [stateId, setStateId] = useState(
        patient.state ? String(patient.state.id) : '',
    );

    return (
        <>
            <Head title={`Edit ${patient.fullName}`} />

            <div className="flex w-full flex-col space-y-6 p-4 md:p-6 lg:p-8">
                <div className="flex flex-wrap items-center justify-between gap-2">
                    <Heading
                        variant="small"
                        title={`Edit ${patient.fullName}`}
                        description={`Hospital No ${patient.slug}`}
                    />
                    {patient.deletedAt ? (
                        <Badge variant="destructive">Trashed</Badge>
                    ) : null}
                    <div className="flex flex-wrap items-center gap-2">
                        <Button variant="outline" asChild>
                            <Link
                                href={show([teamSlug, patient.id])}
                                aria-label={`View ${patient.fullName}`}
                            >
                                View
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

                <Form
                    {...PatientController.update.form([teamSlug, patient.id])}
                    className="space-y-6"
                >
                    {({ processing: saving, errors }) => (
                        <>
                            <PatientFormFields
                                errors={errors}
                                options={options}
                                onGenderChange={setGender}
                                onStateChange={setStateId}
                                values={{
                                    slug: patient.slug,
                                    art: patient.art,
                                    slugOther: patient.slugOther,
                                    category_id: patient.category
                                        ? String(patient.category.id)
                                        : '',
                                    firstName: patient.firstName,
                                    middleName: patient.middleName,
                                    lastName: patient.lastName,
                                    gender,
                                    birthDate: patient.birthDate,
                                    email: patient.email,
                                    phone: patient.phone,
                                    mobile: patient.mobile,
                                    country_id: patient.country
                                        ? String(patient.country.id)
                                        : '',
                                    state_id: stateId,
                                    lga_id: patient.lga
                                        ? String(patient.lga.id)
                                        : '',
                                    address: patient.address ?? '',
                                    kinFullName: patient.kinFullName,
                                    kinPhone: patient.kinPhone,
                                    kinEmail: patient.kinEmail,
                                    relation: patient.relation,
                                }}
                            />

                            <div className="flex items-center gap-4">
                                <Button
                                    type="submit"
                                    disabled={saving}
                                    data-test="submit-patient"
                                >
                                    {saving ? 'Saving...' : 'Save changes'}
                                </Button>
                            </div>
                        </>
                    )}
                </Form>
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

PatientEdit.layout = (props: LayoutProps) => ({
    breadcrumbs: [
        {
            title: 'Patients',
            href: index(props.currentTeam?.slug),
        },
        {
            title: 'Edit',
            href:
                props.currentTeam && props.patient
                    ? edit([props.currentTeam.slug, props.patient.id])
                    : index(props.currentTeam?.slug),
        },
    ],
});
