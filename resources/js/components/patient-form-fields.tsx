import InputError from '@/components/input-error';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SelectNative } from '@/components/ui/select-native';
import { Textarea } from '@/components/ui/textarea';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import type { PatientFormOptions } from '@/types';

export type PatientFormValues = {
    slug?: string;
    art?: string | null;
    slugOther?: string | null;
    category_id: string;
    firstName: string;
    middleName?: string | null;
    lastName: string;
    gender?: string;
    birthDate?: string | null;
    email?: string | null;
    phone?: string | null;
    mobile?: string | null;
    country_id: string;
    state_id: string;
    lga_id: string;
    address: string;
    kinFullName?: string | null;
    kinPhone?: string | null;
    kinEmail?: string | null;
    relation?: string | null;
};

type PatientFormFieldsProps = {
    values: PatientFormValues;
    options: PatientFormOptions;
    errors: Record<string, string | undefined>;
    onStateChange: (stateId: string) => void;
    onGenderChange: (gender: string) => void;
};

export default function PatientFormFields({
    values,
    options,
    errors,
    onStateChange,
    onGenderChange,
}: PatientFormFieldsProps) {
    const lgas = options.lgas.filter(
        (lga) => lga.stateId === Number(values.state_id),
    );

    return (
        <>
            <div className="space-y-4 rounded-lg border p-4">
                <h2 className="text-sm font-medium">Identification</h2>

                <div className="grid gap-4 sm:grid-cols-3">
                    <div className="grid gap-2">
                        <Label htmlFor="slug">Hospital No</Label>
                        <Input
                            id="slug"
                            name="slug"
                            defaultValue={values.slug ?? ''}
                            readOnly
                            required
                            data-test="patient-slug"
                        />
                        <InputError message={errors.slug} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="art">ART No</Label>
                        <Input
                            id="art"
                            name="art"
                            defaultValue={values.art ?? ''}
                        />
                        <InputError message={errors.art} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="slugOther">NHIS/Other</Label>
                        <Input
                            id="slugOther"
                            name="slugOther"
                            defaultValue={values.slugOther ?? ''}
                        />
                        <InputError message={errors.slugOther} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="category_id">Category</Label>
                        <SelectNative
                            id="category_id"
                            name="category_id"
                            defaultValue={values.category_id}
                            required
                            data-test="patient-category"
                        >
                            <option value="" disabled>
                                Select a category
                            </option>
                            {options.categories.map((category) => (
                                <option key={category.id} value={category.id}>
                                    {category.name}
                                </option>
                            ))}
                        </SelectNative>
                        <InputError message={errors.category_id} />
                    </div>
                </div>
            </div>

            <div className="space-y-4 rounded-lg border p-4">
                <h2 className="text-sm font-medium">Personal details</h2>

                <div className="grid gap-4 sm:grid-cols-3">
                    <div className="grid gap-2">
                        <Label htmlFor="firstName">First name</Label>
                        <Input
                            id="firstName"
                            name="firstName"
                            defaultValue={values.firstName}
                            required
                            autoComplete="off"
                            data-test="patient-first-name"
                        />
                        <InputError message={errors.firstName} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="middleName">Middle name</Label>
                        <Input
                            id="middleName"
                            name="middleName"
                            defaultValue={values.middleName ?? ''}
                        />
                        <InputError message={errors.middleName} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="lastName">Last name</Label>
                        <Input
                            id="lastName"
                            name="lastName"
                            defaultValue={values.lastName}
                            required
                            data-test="patient-last-name"
                        />
                        <InputError message={errors.lastName} />
                    </div>

                    <div className="grid gap-2">
                        <Label>Gender</Label>
                        <input
                            type="hidden"
                            name="gender"
                            value={values.gender ?? ''}
                        />
                        <ToggleGroup
                            type="single"
                            variant="outline"
                            value={values.gender ?? ''}
                            onValueChange={(value) =>
                                onGenderChange(value || '')
                            }
                            data-test="patient-gender"
                        >
                            <ToggleGroupItem value="Male">Male</ToggleGroupItem>
                            <ToggleGroupItem value="Female">
                                Female
                            </ToggleGroupItem>
                        </ToggleGroup>
                        <InputError message={errors.gender} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="birthDate">Date of birth</Label>
                        <Input
                            id="birthDate"
                            name="birthDate"
                            type="date"
                            defaultValue={values.birthDate ?? ''}
                            required
                            data-test="patient-birth-date"
                        />
                        <InputError message={errors.birthDate} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="email">Email address</Label>
                        <Input
                            id="email"
                            name="email"
                            type="email"
                            defaultValue={values.email ?? ''}
                        />
                        <InputError message={errors.email} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="phone">Phone</Label>
                        <Input
                            id="phone"
                            name="phone"
                            type="tel"
                            defaultValue={values.phone ?? ''}
                            required
                            data-test="patient-phone"
                        />
                        <InputError message={errors.phone} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="mobile">Mobile</Label>
                        <Input
                            id="mobile"
                            name="mobile"
                            type="tel"
                            defaultValue={values.mobile ?? ''}
                        />
                        <InputError message={errors.mobile} />
                    </div>
                </div>
            </div>

            <div className="space-y-4 rounded-lg border p-4">
                <h2 className="text-sm font-medium">Location</h2>

                <div className="grid gap-4 sm:grid-cols-3">
                    <div className="grid gap-2">
                        <Label htmlFor="country_id">Country</Label>
                        <SelectNative
                            id="country_id"
                            name="country_id"
                            defaultValue={values.country_id}
                            required
                        >
                            <option value="" disabled>
                                Select a country
                            </option>
                            {options.countries.map((country) => (
                                <option key={country.id} value={country.id}>
                                    {country.name}
                                </option>
                            ))}
                        </SelectNative>
                        <InputError message={errors.country_id} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="state_id">State</Label>
                        <SelectNative
                            id="state_id"
                            name="state_id"
                            value={values.state_id}
                            onChange={(event) =>
                                onStateChange(event.target.value)
                            }
                            required
                            data-test="patient-state"
                        >
                            <option value="" disabled>
                                Select a state
                            </option>
                            {options.states.map((state) => (
                                <option key={state.id} value={state.id}>
                                    {state.name}
                                </option>
                            ))}
                        </SelectNative>
                        <InputError message={errors.state_id} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="lga_id">LGA</Label>
                        <SelectNative
                            id="lga_id"
                            name="lga_id"
                            defaultValue={values.lga_id}
                            required
                            data-test="patient-lga"
                        >
                            <option value="" disabled>
                                Select an LGA
                            </option>
                            {lgas.map((lga) => (
                                <option key={lga.id} value={lga.id}>
                                    {lga.name}
                                </option>
                            ))}
                        </SelectNative>
                        <InputError message={errors.lga_id} />
                    </div>

                    <div className="grid gap-2 sm:col-span-3">
                        <Label htmlFor="address">Address</Label>
                        <Textarea
                            id="address"
                            name="address"
                            defaultValue={values.address}
                            required
                            rows={2}
                            data-test="patient-address"
                        />
                        <InputError message={errors.address} />
                    </div>
                </div>
            </div>

            <div className="space-y-4 rounded-lg border p-4">
                <h2 className="text-sm font-medium">Next of kin</h2>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="grid gap-2">
                        <Label htmlFor="kinFullName">Full name</Label>
                        <Input
                            id="kinFullName"
                            name="kinFullName"
                            defaultValue={values.kinFullName ?? ''}
                        />
                        <InputError message={errors.kinFullName} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="kinPhone">Phone</Label>
                        <Input
                            id="kinPhone"
                            name="kinPhone"
                            type="tel"
                            defaultValue={values.kinPhone ?? ''}
                        />
                        <InputError message={errors.kinPhone} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="kinEmail">Email</Label>
                        <Input
                            id="kinEmail"
                            name="kinEmail"
                            type="email"
                            defaultValue={values.kinEmail ?? ''}
                        />
                        <InputError message={errors.kinEmail} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="relation">Relation</Label>
                        <Input
                            id="relation"
                            name="relation"
                            defaultValue={values.relation ?? ''}
                        />
                        <InputError message={errors.relation} />
                    </div>
                </div>
            </div>
        </>
    );
}
