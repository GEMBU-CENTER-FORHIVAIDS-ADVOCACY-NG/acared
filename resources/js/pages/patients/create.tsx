import { Form, Head, Link, usePage } from '@inertiajs/react';
import { useState } from 'react';
import PatientController from '@/actions/App/Http/Controllers/PatientController';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import PatientFormFields from '@/components/patient-form-fields';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SelectNative } from '@/components/ui/select-native';
import { index } from '@/routes/patients';
import type {
    PatientBillingLine,
    PatientFormOptions,
    PriceListItem,
    Team,
} from '@/types';

export default function PatientCreate({
    options,
    nextHospitalNo,
    priceLists,
}: {
    options: PatientFormOptions;
    nextHospitalNo: string;
    priceLists: PriceListItem[];
}) {
    const { currentTeam } = usePage().props;
    const teamSlug = currentTeam?.slug;

    const [gender, setGender] = useState('');
    const [stateId, setStateId] = useState('');
    const [lines, setLines] = useState<PatientBillingLine[]>([
        { price_list_id: '', unitPrice: '' },
    ]);

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
                        <Link
                            href={index(teamSlug)}
                            aria-label="Back to patients"
                        >
                            Back to patients
                        </Link>
                    </Button>
                </div>

                <Form
                    {...PatientController.store.form(teamSlug)}
                    className="space-y-6"
                    data-test="patient-form"
                    transform={(data) => {
                        const linePayload = lines
                            .filter((line) => line.price_list_id !== '')
                            .map((line) => ({
                                price_list_id: Number(line.price_list_id),
                                unitPrice: Number(line.unitPrice) || 0,
                            }));

                        if (linePayload.length === 0) {
                            return data;
                        }

                        return {
                            ...data,
                            billings: [
                                {
                                    lines: linePayload,
                                    total: linePayload.reduce(
                                        (sum, line) => sum + line.unitPrice,
                                        0,
                                    ),
                                },
                            ],
                        };
                    }}
                >
                    {({ processing, errors }) => {
                        const total = lines.reduce(
                            (sum, line) =>
                                sum + (parseFloat(line.unitPrice) || 0),
                            0,
                        );

                        return (
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

                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <h3
                                            id="billing-lines"
                                            className="text-sm font-medium"
                                        >
                                            Billing lines
                                        </h3>
                                        <Button
                                            type="button"
                                            variant="secondary"
                                            size="sm"
                                            disabled={processing}
                                            onClick={() =>
                                                setLines([
                                                    ...lines,
                                                    {
                                                        price_list_id: '',
                                                        unitPrice: '',
                                                    },
                                                ])
                                            }
                                        >
                                            Add line
                                        </Button>
                                    </div>
                                    <InputError message={errors.billings} />
                                    <InputError
                                        message={errors['billings.0.lines']}
                                    />

                                    {lines.map((line, index) => (
                                        <div key={index} className="space-y-1">
                                            <div className="grid gap-2 sm:grid-cols-[1fr_120px_auto]">
                                                <SelectNative
                                                    id={`billing-item-${index}`}
                                                    aria-label={`Billing item ${index + 1}`}
                                                    disabled={processing}
                                                    value={line.price_list_id}
                                                    onChange={(event) => {
                                                        const newLines = [
                                                            ...lines,
                                                        ];
                                                        newLines[index] = {
                                                            ...newLines[index],
                                                            price_list_id:
                                                                event.target
                                                                    .value,
                                                        };
                                                        const priceList =
                                                            priceLists.find(
                                                                (pl) =>
                                                                    pl.id.toString() ===
                                                                    event.target
                                                                        .value,
                                                            );
                                                        if (priceList) {
                                                            newLines[
                                                                index
                                                            ].unitPrice =
                                                                priceList.price.toString();
                                                        }
                                                        setLines(newLines);
                                                    }}
                                                >
                                                    <option value="">
                                                        Select item…
                                                    </option>
                                                    {priceLists.map(
                                                        (priceList) => (
                                                            <option
                                                                key={
                                                                    priceList.id
                                                                }
                                                                value={
                                                                    priceList.id
                                                                }
                                                            >
                                                                {priceList.name}
                                                            </option>
                                                        ),
                                                    )}
                                                </SelectNative>
                                                <Input
                                                    id={`billing-unit-price-${index}`}
                                                    aria-label={`Unit price for billing item ${index + 1}`}
                                                    type="number"
                                                    min={0}
                                                    step="0.01"
                                                    disabled={processing}
                                                    value={line.unitPrice}
                                                    onChange={(event) => {
                                                        const newLines = [
                                                            ...lines,
                                                        ];
                                                        newLines[index] = {
                                                            ...newLines[index],
                                                            unitPrice:
                                                                event.target
                                                                    .value,
                                                        };
                                                        setLines(newLines);
                                                    }}
                                                />
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    aria-label={`Remove billing item ${index + 1}`}
                                                    disabled={
                                                        processing ||
                                                        lines.length === 1
                                                    }
                                                    onClick={() =>
                                                        setLines((current) =>
                                                            current.filter(
                                                                (_, rowIndex) =>
                                                                    rowIndex !==
                                                                    index,
                                                            ),
                                                        )
                                                    }
                                                >
                                                    Remove
                                                </Button>
                                            </div>
                                            <InputError
                                                message={
                                                    errors[
                                                        `billings.0.lines.${index}.price_list_id`
                                                    ]
                                                }
                                            />
                                            <InputError
                                                message={
                                                    errors[
                                                        `billings.0.lines.${index}.unitPrice`
                                                    ]
                                                }
                                            />
                                        </div>
                                    ))}

                                    <div className="flex items-center justify-between border-t pt-2 text-sm">
                                        <span className="text-muted-foreground">
                                            Total
                                        </span>
                                        <span className="font-semibold">
                                            ₦ {total.toLocaleString()}
                                        </span>
                                    </div>
                                </div>

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
                        );
                    }}
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
