import { Head, Link, usePage } from '@inertiajs/react';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { index, show } from '@/routes/nursing/ward-rounds';

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
    bedsCount: number;
    occupiedBedsCount: number;
    patientsCount: number;
    status: string;
    beds: Bed[];
};
export default function WardRoundsIndex({ wards }: { wards: Ward[] }) {
    const team = usePage().props.currentTeam?.slug ?? '';
    return (
        <>
            <Head title="Ward rounds" />
            <div className="flex w-full flex-col space-y-6 p-4 md:p-6 lg:p-8">
                <Heading
                    variant="small"
                    title="Ward rounds"
                    description="Review bed occupancy and patients across inpatient wards."
                />
                {wards.length ? (
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                        {wards.map((ward) => (
                            <Card key={ward.id}>
                                <CardHeader>
                                    <CardTitle className="flex items-center justify-between gap-2">
                                        <span>{ward.name}</span>
                                        <span
                                            className={`rounded-full px-2 py-1 text-xs ${ward.status === 'Occupied' ? 'bg-destructive/10 text-destructive' : ward.status === 'Partially occupied' ? 'bg-amber-500/10 text-amber-700' : 'bg-emerald-500/10 text-emerald-700'}`}
                                        >
                                            {ward.status}
                                        </span>
                                    </CardTitle>
                                    <p className="text-sm text-muted-foreground">
                                        {ward.description ?? 'No description'}
                                    </p>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="flex justify-between text-sm">
                                        <span>Beds occupied</span>
                                        <span className="font-medium">
                                            {ward.occupiedBedsCount} /{' '}
                                            {ward.bedsCount}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span>Active patients</span>
                                        <span className="font-medium">
                                            {ward.patientsCount}
                                        </span>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {ward.beds.slice(0, 8).map((bed) => (
                                            <span
                                                key={bed.id}
                                                title={
                                                    bed.patientName ??
                                                    bed.status
                                                }
                                                className={`rounded border px-2 py-1 text-xs ${bed.status === 'occupied' ? 'border-destructive/40 bg-destructive/5' : ''}`}
                                            >
                                                {bed.name}
                                            </span>
                                        ))}
                                        {ward.beds.length > 8 && (
                                            <span className="px-2 py-1 text-xs text-muted-foreground">
                                                +{ward.beds.length - 8} more
                                            </span>
                                        )}
                                    </div>
                                    <Button variant="outline" asChild>
                                        <Link
                                            href={show.url({
                                                current_team: team,
                                                ward: ward.id,
                                            })}
                                        >
                                            Open ward
                                        </Link>
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <p className="rounded-lg border py-10 text-center text-muted-foreground">
                        No wards have been set up yet.
                    </p>
                )}
            </div>
        </>
    );
}
