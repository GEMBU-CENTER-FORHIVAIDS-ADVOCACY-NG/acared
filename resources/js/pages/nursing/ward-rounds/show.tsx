import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { admit, discharge, index, view } from '@/routes/nursing/ward-rounds';

type Bed = {
    id: number;
    name: string;
    status: string;
    admissionId: number | null;
    patientId: string | null;
    patientRecordId: number | null;
    patientName: string | null;
    doctorName: string | null;
    admissionStatus: string | null;
    admittedAt: string | null;
};
type Ward = {
    id: number;
    name: string;
    description: string | null;
    beds: Bed[];
};
type Pending = {
    id: number;
    patientId: string;
    patientName: string | null;
    notes: string | null;
};
export default function WardRoundShow({
    ward,
    pendingAdmissions,
}: {
    ward: Ward;
    pendingAdmissions: Pending[];
}) {
    const team = usePage().props.currentTeam?.slug ?? '';
    const [bedId, setBedId] = useState('');
    const [admissionId, setAdmissionId] = useState('');
    const [notes, setNotes] = useState('');
    const bedsAvailable = ward.beds.filter((bed) => bed.status !== 'occupied');
    const canAdmit =
        pendingAdmissions.some(
            (admission) => String(admission.id) === admissionId,
        ) && bedsAvailable.some((bed) => String(bed.id) === bedId);
    const submitAdmission = () => {
        if (!canAdmit) return;
        router.post(
            admit.url({ current_team: team, ward: ward.id }),
            { admission_id: admissionId, bed_id: bedId, notes },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setAdmissionId('');
                    setBedId('');
                    setNotes('');
                },
            },
        );
    };
    return (
        <>
            <Head title={`${ward.name} ward rounds`} />
            <div className="flex w-full flex-col space-y-6 p-4 md:p-6 lg:p-8">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <Heading
                        variant="small"
                        title={ward.name}
                        description={
                            ward.description ??
                            'Ward bed assignments and clinical rounds.'
                        }
                    />
                    <Button variant="outline" asChild>
                        <Link href={index.url(team)}>All wards</Link>
                    </Button>
                </div>
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {ward.beds.map((bed) => (
                        <Card key={bed.id}>
                            <CardHeader>
                                <CardTitle className="flex items-center justify-between">
                                    <span>{bed.name}</span>
                                    <span className="text-sm text-muted-foreground capitalize">
                                        {bed.status}
                                    </span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2 text-sm">
                                {bed.admissionId ? (
                                    <>
                                        <p className="font-medium">
                                            {bed.patientName ?? bed.patientId}
                                        </p>
                                        <p>Hospital No: {bed.patientId}</p>
                                        <p>Doctor: {bed.doctorName ?? 'â€”'}</p>
                                        <p>
                                            Admitted:{' '}
                                            {bed.admittedAt
                                                ? new Date(
                                                      bed.admittedAt,
                                                  ).toLocaleDateString()
                                                : 'â€”'}
                                        </p>
                                        <Button size="sm" asChild>
                                            <Link
                                                href={view.url({
                                                    current_team: team,
                                                    admission: bed.admissionId,
                                                })}
                                            >
                                                Ward round
                                            </Link>
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="destructive"
                                            onClick={() =>
                                                router.patch(
                                                    discharge.url({
                                                        current_team: team,
                                                        admission:
                                                            bed.admissionId!,
                                                    }),
                                                    {},
                                                    { preserveScroll: true },
                                                )
                                            }
                                        >
                                            Discharge
                                        </Button>
                                    </>
                                ) : (
                                    <p className="text-muted-foreground">
                                        Bed available
                                    </p>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>
                {pendingAdmissions.length > 0 && bedsAvailable.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Admit a waiting patient</CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-1">
                                <Label>Patient admission request</Label>
                                <Select
                                    value={admissionId}
                                    onValueChange={setAdmissionId}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select patient" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {pendingAdmissions.map((admission) => (
                                            <SelectItem
                                                key={admission.id}
                                                value={String(admission.id)}
                                            >
                                                {admission.patientId} â€”{' '}
                                                {admission.patientName}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-1">
                                <Label>Available bed</Label>
                                <Select value={bedId} onValueChange={setBedId}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select bed" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {bedsAvailable.map((bed) => (
                                            <SelectItem
                                                key={bed.id}
                                                value={String(bed.id)}
                                            >
                                                {bed.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-1 md:col-span-2">
                                <Label>Admission notes</Label>
                                <Textarea
                                    value={notes}
                                    onChange={(event) =>
                                        setNotes(event.target.value)
                                    }
                                />
                            </div>
                            <Button
                                className="md:col-span-2 md:justify-self-start"
                                disabled={!canAdmit}
                                onClick={submitAdmission}
                            >
                                Admit patient
                            </Button>
                        </CardContent>
                    </Card>
                )}
            </div>
        </>
    );
}
