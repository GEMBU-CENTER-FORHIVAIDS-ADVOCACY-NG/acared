import { Form, Head, Link, usePage } from '@inertiajs/react';
import { useState } from 'react';
import PatientController from '@/actions/App/Http/Controllers/PatientController';
import Heading from '@/components/heading';
import PatientFormFields from '@/components/patient-form-fields';
import { Button } from '@/components/ui/button';
import { index } from '@/routes/patients';
import type { PatientFormOptions, Team } from '@/types';

export default function PatientCreate({
    options,
    nextHospitalNo,
}: {
    options: PatientFormOptions;
    nextHospitalNo: string;
}) {
    const { currentTeam } = usePage().props;
    const teamSlug = currentTeam?.slug;

    const [gender, setGender] = useState('');
    const [stateId, setStateId] = useState('');

    return (
        <>
            <Head title="Register patient" />

            <div className="flex w-full flex-col space-y-6 p-4 md:p-6 lg:p-8">
                <div className="flex items-center justify-between">
                    <Heading
                        variant="small"
                        title="Register patient"
                        description="Add a new patient to this team."
                    />
                    <Button variant="outline" asChild>
                        <Link href={index(teamSlug)}>Back to patients</Link>
                    </Button>
                </div>

                <Form
                    {...PatientController.store.form(teamSlug)}
                    className="space-y-6"
                >
                    {({ processing, errors }) => (
                        <>
                            <PatientFormFields
                                errors={errors}
                                options={options}
                                onGenderChange={setGender}
                                onStateChange={setStateId}
                                values={{
                                    slug: nextHospitalNo,
                                    category_id: '',
                                    firstName: '',
                                    middleName: '',
                                    lastName: '',
                                    gender,
                                    birthDate: '',
                                    email: '',
                                    phone: '',
                                    mobile: '',
                                    country_id: '',
                                    state_id: stateId,
                                    lga_id: '',
                                    address: '',
                                    kinFullName: '',
                                    kinPhone: '',
                                    kinEmail: '',
                                    relation: '',
                                }}
                            />

                            <div className="flex items-center gap-4">
                                <Button
                                    type="submit"
                                    disabled={processing}
                                    data-test="submit-patient"
                                >
                                    {processing
                                        ? 'Saving...'
                                        : 'Register patient'}
                                </Button>
                            </div>
                        </>
                    )}
                </Form>
            </div>
        </>
    );
}

PatientCreate.layout = (props: { currentTeam?: Team | null }) => ({
    breadcrumbs: [
        {
            title: 'Patients',
            href: index(props.currentTeam?.slug),
        },
    ],
});
