import { Head, Link, router, usePage } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { discharge, index, view } from '@/routes/consultant/ward-rounds';

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
    patientWallet: number;
};
type Ward = {
    id: number;
    name: string;
    description: string | null;
    beds: Bed[];
};
export default function WardRoundShow({
    ward,
}: {
    ward: Ward;
}) {
    const team = usePage().props.currentTeam?.slug ?? '';
    const [searchQuery, setSearchQuery] = useState('');
    const [dischargeModalOpen, setDischargeModalOpen] = useState(false);
    const [dischargingBed, setDischargingBed] = useState<Bed | null>(null);
    const [walletError, setWalletError] = useState<string | null>(null);

    // Filter beds by hospital number or patient name
    const filteredBeds = useMemo(() => {
        const query = searchQuery.trim().toLowerCase();
        if (!query) {
            return ward.beds;
        }
        return ward.beds.filter((bed) => {
            if (!bed.admissionId) return false;
            const patientId = (bed.patientId ?? '').toLowerCase();
            const patientName = (bed.patientName ?? '').toLowerCase();
            return patientId.includes(query) || patientName.includes(query);
        });
    }, [ward.beds, searchQuery]);

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

                <div>
                    <div>
                        <form
                            className="relative mb-4 flex max-w-sm gap-2"
                            onSubmit={(e) => {
                                e.preventDefault();
                                const firstMatch = filteredBeds.find((b) => b.admissionId);
                                if (firstMatch) {
                                    router.get(view.url({ current_team: team, admission: firstMatch.admissionId }));
                                }
                            }}
                        >
                            <Input
                                placeholder="Search by hospital no or patient name…"
                                value={searchQuery}
                                onChange={(event) => setSearchQuery(event.target.value)}
                            />
                            <Button type="submit" size="sm" disabled={!searchQuery.trim()}>
                                Search
                            </Button>
                        </form>
                        {searchQuery && (
                            <p className="mb-2 text-xs text-muted-foreground">
                                {filteredBeds.length} result{filteredBeds.length !== 1 ? 's' : ''} found
                            </p>
                        )}
                        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                            {filteredBeds.map((bed) => (
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
                                                <p>Doctor: {bed.doctorName ?? '—'}</p>
                                                <p>
                                                    Admitted:{' '}
                                                    {bed.admittedAt
                                                        ? new Date(
                                                              bed.admittedAt,
                                                          ).toLocaleDateString()
                                                        : '—'}
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
                                                    onClick={() => {
                                                        setDischargingBed(bed);
                                                        setWalletError(null);
                                                        setDischargeModalOpen(true);
                                                    }}
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
                    </div>
                </div>
            </div>

            <Dialog
                open={dischargeModalOpen}
                onOpenChange={(open) => {
                    setDischargeModalOpen(open);
                    if (!open) {
                        setWalletError(null);
                        setDischargingBed(null);
                    }
                }}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Confirm discharge</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to discharge{' '}
                            <strong>{dischargingBed?.patientName ?? dischargingBed?.patientId}</strong>?
                        </DialogDescription>
                    </DialogHeader>
                    {walletError && (
                        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600 dark:border-red-800 dark:bg-red-950 dark:text-red-400">
                            {walletError}
                        </div>
                    )}
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setDischargeModalOpen(false);
                                setWalletError(null);
                                setDischargingBed(null);
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            disabled={!dischargingBed}
                            onClick={() => {
                                if (!dischargingBed) return;
                                if (dischargingBed.patientWallet < 0) {
                                    setWalletError(
                                        `Cannot discharge: patient has an outstanding balance of ₦${Math.abs(dischargingBed.patientWallet).toLocaleString('en-NG', { minimumFractionDigits: 2 })}.`,
                                    );
                                    return;
                                }
                                router.patch(
                                    discharge.url({
                                        current_team: team,
                                        admission: dischargingBed.admissionId!,
                                    }),
                                    {},
                                    {
                                        preserveScroll: true,
                                        onSuccess: () => {
                                            setDischargeModalOpen(false);
                                            setDischargingBed(null);
                                        },
                                        onError: (errors) => {
                                            if (errors.message) {
                                                setWalletError(errors.message);
                                            }
                                        },
                                    },
                                );
                            }}
                        >
                            Discharge
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
