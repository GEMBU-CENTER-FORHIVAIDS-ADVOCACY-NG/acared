import { Form, Head, Link, usePage } from '@inertiajs/react';
import { useState } from 'react';
import PatientController from '@/actions/App/Http/Controllers/PatientController';
import ConfirmDialog from '@/components/confirm-dialog';
import Heading from '@/components/heading';
import PatientFormFields from '@/components/patient-form-fields';
import { Button } from '@/components/ui/button';
import {
    patientConfirmLabels,
    usePatientActions,
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
    const { teamSlug, confirm, setConfirm, processing, runConfirm } =
        usePatientActions(patient.id);

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
                    <div className="flex flex-wrap items-center gap-2">
                        <Button variant="outline" asChild>
                            <Link href={show([teamSlug, patient.id])}>
                                View
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

PatientEdit.layout = (props: LayoutProps) => ({
    breadcrumbs: [
        {
            title: 'Patients',
            href: props.currentTeam
                ? index(props.currentTeam.slug)
                : '/patients',
        },
        {
            title: 'Edit',
            href:
                props.currentTeam && props.patient
                    ? edit([props.currentTeam.slug, props.patient.id])
                    : '/patients',
        },
    ],
});
