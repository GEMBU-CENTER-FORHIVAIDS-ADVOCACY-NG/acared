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
    requestedWardId: number;
    requestedWardName: string | null;
    notes: string | null;
};
type WardWithBeds = {
    id: number;
    name: string;
    beds: { id: number; name: string }[];
};
export default function WardRoundShow({
    ward,
    pendingAdmissions,
    allWards,
}: {
    ward: Ward;
    pendingAdmissions: Pending[];
    allWards: WardWithBeds[];
}) {
    const team = usePage().props.currentTeam?.slug ?? '';
    const [selectedWardId, setSelectedWardId] = useState('');
    const [bedId, setBedId] = useState('');
    const [admissionId, setAdmissionId] = useState('');
    const [notes, setNotes] = useState('');

    // When a patient is selected, default to the requested ward
    const selectedAdmission = pendingAdmissions.find(
        (a) => String(a.id) === admissionId,
    );
    const defaultWardId = selectedAdmission?.requestedWardId ?? '';

    // When ward changes, reset bed selection
    const currentWardId = selectedWardId || String(defaultWardId);
    const selectedWardData = allWards.find(
        (w) => String(w.id) === currentWardId,
    );
    const bedsAvailable = selectedWardData?.beds ?? [];

    const canAdmit =
        pendingAdmissions.some(
            (admission) => String(admission.id) === admissionId,
        ) && !!currentWardId && bedsAvailable.some((bed) => String(bed.id) === bedId);

    // Reset bed when ward changes
    const handleWardChange = (value: string) => {
        setSelectedWardId(value);
        setBedId('');
    };

    // Reset ward, bed, and notes when admission changes
    const handleAdmissionChange = (value: string) => {
        setAdmissionId(value);
        const admission = pendingAdmissions.find((a) => String(a.id) === value);
        setSelectedWardId(String(admission?.requestedWardId ?? ''));
        setBedId('');
        setNotes(admission?.notes ?? '');
    };
    const submitAdmission = () => {
        if (!canAdmit) return;
        router.post(
            admit.url({ current_team: team, ward: ward.id }),
            {
                admission_id: admissionId,
                ward_id: currentWardId,
                bed_id: bedId,
                notes,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setAdmissionId('');
                    setSelectedWardId('');
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
                {pendingAdmissions.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Admit a waiting patient</CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-1">
                                <Label>Patient admission request</Label>
                                <Select
                                    value={admissionId}
                                    onValueChange={handleAdmissionChange}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select patient" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {pendingAdmissions.map((admission) => (
                                            <SelectItem
                                                key={admission.id}
                                                value={String(admission.id)}
                                            >
                                                {admission.patientId} — {admission.patientName}
                                                {admission.requestedWardName ? (
                                                    <span className="text-muted-foreground"> (Requested: {admission.requestedWardName})</span>
                                                ) : null}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-1">
                                <Label>Ward</Label>
                                <Select
                                    value={currentWardId}
                                    onValueChange={handleWardChange}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select ward" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {allWards.map((w) => (
                                            <SelectItem
                                                key={w.id}
                                                value={String(w.id)}
                                            >
                                                {w.name}
                                                {w.beds.length > 0 ? (
                                                    <span className="text-muted-foreground"> ({w.beds.length} bed{w.beds.length !== 1 ? 's' : ''} available)</span>
                                                ) : (
                                                    <span className="text-muted-foreground"> (No beds available)</span>
                                                )}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-1">
                                <Label>Available bed</Label>
                                <Select
                                    value={bedId}
                                    onValueChange={setBedId}
                                    disabled={!currentWardId}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder={currentWardId ? "Select bed" : "Select a ward first"} />
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
