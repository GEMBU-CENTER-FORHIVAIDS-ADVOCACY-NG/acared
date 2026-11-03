import { Head, Link, router, usePage } from '@inertiajs/react';
import { useCallback, useEffect, useRef, useState } from 'react';
import LaboratoryController from '@/actions/App/Http/Controllers/LaboratoryController';
import LabResultFields, {
    buildResultPayload,
    emptyResultValues,
} from '@/components/lab-result-fields';
import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SelectNative } from '@/components/ui/select-native';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import type {
    LabCreateOptions,
    LabDateFilterOption,
    LabPaidOption,
    LabResultForm,
    LabSelected,
    LaboratoryStats,
    LaboratoryTopTest,
    Team,
} from '@/types';

type LayoutProps = {
    currentTeam?: Team | null;
};

type CreateLine = {
    price_list_id: string;
    unitPrice: string;
    unitCost: string;
    quantity: string;
};

export default function LaboratoryIndex({
    currencySymbol,
    filters,
    dateFilterOptions,
    stats,
    paidOptions,
    selected,
    resultForm,
    createOptions,
}: {
    currencySymbol: string;
    filters: {
        date_filter: string;
        date_filter_label: string;
        laboratory_id: number | null;
    };
    dateFilterOptions: LabDateFilterOption[];
    stats: LaboratoryStats;
    paidOptions: LabPaidOption[];
    selected: LabSelected | null;
    resultForm: LabResultForm | null;
    createOptions: LabCreateOptions;
}) {
    const { currentTeam } = usePage<LayoutProps>().props;
    const teamSlug = currentTeam?.slug ?? '';

    const [processing, setProcessing] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);
    const [resultValues, setResultValues] = useState(emptyResultValues());
    const [createOpen, setCreateOpen] = useState(
        Boolean(createOptions.selectedPatientId),
    );
    const [patientId, setPatientId] = useState(
        createOptions.selectedPatientId ?? '',
    );
    const [selectedPatientLabel, setSelectedPatientLabel] = useState('');
    const [lines, setLines] = useState<CreateLine[]>([
        { price_list_id: '', unitPrice: '', unitCost: '', quantity: '1' },
    ]);

    // Server-side patient search state
    const [patientSearchQuery, setPatientSearchQuery] = useState('');
    const [patientSearchResults, setPatientSearchResults] = useState<
        { slug: string; label: string }[]
    >([]);
    const [patientSearchOpen, setPatientSearchOpen] = useState(false);
    const [patientSearchLoading, setPatientSearchLoading] = useState(false);
    const patientSearchInputRef = useRef<HTMLInputElement>(null);
    const patientSearchContainerRef = useRef<HTMLDivElement>(null);
    const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Debounced search for patients using fetch to avoid Inertia JSON response error
    const searchPatients = useCallback((query: string) => {
        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
        }

        if (!query.trim()) {
            setPatientSearchResults([]);
            return;
        }

        setPatientSearchLoading(true);
        debounceTimerRef.current = setTimeout(() => {
            const url = LaboratoryController.searchPatients.url(teamSlug, { query: { q: query } });
            fetch(url, {
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                },
            })
                .then((res) => res.json())
                .then((results) => {
                    setPatientSearchResults(results);
                    setPatientSearchLoading(false);
                })
                .catch(() => {
                    setPatientSearchLoading(false);
                });
        }, 300);
    }, [teamSlug]);

    // Close dropdown on outside click
    useEffect(() => {
        if (!patientSearchOpen) {
            return;
        }

        const handleClick = (event: MouseEvent) => {
            if (
                patientSearchContainerRef.current &&
                !patientSearchContainerRef.current.contains(event.target as Node)
            ) {
                setPatientSearchOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, [patientSearchOpen]);

    // Cleanup debounce timer
    useEffect(() => {
        return () => {
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current);
            }
        };
    }, []);

    const displayPatientLabel = patientId ? selectedPatientLabel : '';

    useEffect(() => {
        setResultValues(emptyResultValues());
    }, [selected?.id]);

    useEffect(() => {
        if (createOptions.selectedPatientId) {
            setPatientId(createOptions.selectedPatientId);
            setCreateOpen(true);
        }
    }, [createOptions.selectedPatientId]);

    function baseUrl(path = '') {
        return `/${teamSlug}/laboratories${path}`;
    }

    function applyDateFilter(dateFilter: string) {
        router.get(
            baseUrl(),
            {
                date_filter: dateFilter,
                laboratory_id: filters.laboratory_id || undefined,
            },
            { preserveState: true, preserveScroll: true, replace: true },
        );
    }

    function selectLaboratory(id: string) {
        router.get(
            baseUrl(),
            {
                date_filter: filters.date_filter,
                laboratory_id: id || undefined,
            },
            { preserveState: true, preserveScroll: true, replace: true },
        );
    }

    function submitResults() {
        if (!selected) {
            return;
        }

        setProcessing(true);
        setFormError(null);

        router.post(
            baseUrl(`/${selected.id}/results`),
            buildResultPayload(resultValues),
            {
                preserveScroll: true,
                onError: (errors) =>
                    setFormError(
                        Object.values(errors)[0] ?? 'Unable to submit results.',
                    ),
                onFinish: () => setProcessing(false),
            },
        );
    }

    function saveStepResults(stepIndex: number, _stepName: string) {
        if (!selected || !resultForm) {
            return;
        }

        setProcessing(true);
        setFormError(null);

        const step = resultForm.steps[stepIndex];
        if (!step) {
            setProcessing(false);
            return;
        }

        // Build payload for the current step only
        const stepLines: Record<string, string> = {};
        const stepTestResults: Record<string, { price_list_id: number; result: string }[]> = {};
        const stepInventoryConsumption: Record<string, { lab_inventory_id: number; quantity: number }[]> = {};

        for (const test of step.tests) {
            if (test.kind === 'simple') {
                const value = resultValues.lines[String(test.id)];
                if (value) {
                    stepLines[String(test.id)] = value;
                }
            } else if (test.kind === 'parameters') {
                const testResultMap = resultValues.testResults[String(test.id)] ?? {};
                const rows = Object.entries(testResultMap)
                    .filter(([, result]) => result)
                    .map(([priceListId, result]) => ({
                        price_list_id: Number(priceListId),
                        result,
                    }));
                if (rows.length > 0) {
                    stepTestResults[String(test.id)] = rows;
                }
            }

            // Collect inventory consumption keyed by test (price_list_id)
            const consumptionRows = resultValues.inventoryConsumption[String(test.id)] ?? [];
            const filtered = consumptionRows.filter((row) => row.lab_inventory_id > 0 && row.quantity > 0);
            if (filtered.length > 0) {
                stepInventoryConsumption[String(test.id)] = filtered;
            }
        }

        router.patch(
            baseUrl(`/${selected.id}/results`),
            { lines: stepLines, testResults: stepTestResults, inventoryConsumption: stepInventoryConsumption },
            {
                preserveScroll: true,
                onSuccess: () => {
                    // After saving, the saved tests will no longer appear as pending
                    // The page will reload with updated resultForm from the server
                },
                onError: (errors) =>
                    setFormError(
                        Object.values(errors)[0] ?? 'Unable to save step results.',
                    ),
                onFinish: () => setProcessing(false),
            },
        );
    }

    function createTotal() {
        return lines.reduce(
            (sum, line) =>
                sum + Number(line.quantity || 1) * Number(line.unitPrice || 0),
            0,
        );
    }

    function submitCreate() {
        setProcessing(true);
        setFormError(null);

        router.post(
            baseUrl(),
            {
                patient_id: patientId,
                lines: lines.map((line) => ({
                    price_list_id: Number(line.price_list_id),
                    unitPrice: Number(line.unitPrice || 0),
                    unitCost: Number(line.unitCost || 0),
                    quantity: Number(line.quantity || 1),
                })),
                total: createTotal(),
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setCreateOpen(false);
                    setPatientId('');
                    setLines([
                        {
                            price_list_id: '',
                            unitPrice: '',
                            unitCost: '',
                            quantity: '1',
                        },
                    ]);
                },
                onError: (errors) =>
                    setFormError(
                        Object.values(errors)[0] ?? 'Unable to create request.',
                    ),
                onFinish: () => setProcessing(false),
            },
        );
    }

    const statCards = [
        {
            title: 'Awaiting payment',
            value: stats.pending,
            description: `Request yet to be paid — ${filters.date_filter_label}`,
            tone: 'text-red-600',
        },
        {
            title: 'Pending request',
            value: stats.paid,
            description: `Paid, yet to be attended — ${filters.date_filter_label}`,
            tone: 'text-amber-600',
        },
        {
            title: 'Completed request',
            value: stats.submitted,
            description: `Completed request — ${filters.date_filter_label}`,
            tone: 'text-emerald-600',
        },
        {
            title: 'Total request',
            value: stats.total,
            description: `Total request — ${filters.date_filter_label}`,
            tone: 'text-indigo-600',
        },
    ];

    return (
        <>
            <Head title="Laboratory" />

            <div className="flex w-full flex-col space-y-6 p-4 md:p-6 lg:p-8">
                <div className="flex flex-wrap items-center justify-between gap-2">
                    <Heading
                        title="Lab requests"
                        description="Enter results for paid requests and raise new laboratory orders."
                    />
                    <div className="flex flex-wrap gap-2">
                        <Button asChild variant="secondary">
                            <Link href={baseUrl('/history')}>History</Link>
                        </Button>
                        <Button onClick={() => setCreateOpen(true)}>
                            New laboratory request
                        </Button>
                    </div>
                </div>

                <div className="flex flex-wrap items-end gap-3">
                    <div className="space-y-2">
                        <Label htmlFor="lab-date-filter">Date range</Label>
                        <SelectNative
                            id="lab-date-filter"
                            value={filters.date_filter}
                            onChange={(event) =>
                                applyDateFilter(event.target.value)
                            }
                        >
                            {dateFilterOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </SelectNative>
                    </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    {statCards.map((card) => (
                        <Card key={card.title}>
                            <CardHeader className="pb-2">
                                <CardDescription>{card.title}</CardDescription>
                                <CardTitle className={`text-2xl ${card.tone}`}>
                                    {card.value.toLocaleString()}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground">
                                    {card.description}
                                </p>
                            </CardContent>
                        </Card>
                    ))}
                </div>



                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0">
                        <div>
                            <CardTitle>Laboratory result form</CardTitle>
                            <CardDescription>
                                Select a paid request to enter pending test results.
                            </CardDescription>
                        </div>
                        {selected ? (
                            <Badge
                                variant={selected.isAdmitted ? 'default' : 'secondary'}
                            >
                                {selected.isAdmitted ? 'On Admission' : 'OPD'}
                            </Badge>
                        ) : null}
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-3">
                            <div className="space-y-2 md:col-span-1">
                                <Label htmlFor="paid-lab">Patient</Label>
                                <SelectNative
                                    id="paid-lab"
                                    value={
                                        filters.laboratory_id
                                            ? String(filters.laboratory_id)
                                            : ''
                                    }
                                    onChange={(event) =>
                                        selectLaboratory(event.target.value)
                                    }
                                >
                                    <option value="">
                                        Select paid request…
                                    </option>
                                    {paidOptions.map((option) => (
                                        <option
                                            key={option.id}
                                            value={option.id}
                                        >
                                            {option.label}
                                        </option>
                                    ))}
                                </SelectNative>
                            </div>
                            {selected ? (
                                <>
                                    <div className="space-y-2">
                                        <Label>Gender</Label>
                                        <Input
                                            value={selected.gender ?? ''}
                                            disabled
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Age</Label>
                                        <Input
                                            value={selected.age ?? ''}
                                            disabled
                                        />
                                    </div>
                                </>
                            ) : null}
                        </div>

                        {resultForm ? (
                            <div className="space-y-4">
                                <LabResultFields
                                    form={resultForm}
                                    values={resultValues}
                                    onChange={setResultValues}
                                    onSaveStep={saveStepResults}
                                    onSubmitResults={submitResults}
                                />
                                {formError ? (
                                    <p className="text-sm text-red-600">
                                        {formError}
                                    </p>
                                ) : null}
                            </div>
                        ) : (
                            <p className="text-sm text-muted-foreground">
                                Choose a paid laboratory request to begin.
                            </p>
                        )}
                    </CardContent>
                </Card>
            </div>

            <Sheet open={createOpen} onOpenChange={setCreateOpen}>
                <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
                    <SheetHeader>
                        <SheetTitle>New laboratory request</SheetTitle>
                        <SheetDescription>
                            Add tests for a patient and raise a billing.
                        </SheetDescription>
                    </SheetHeader>

                    <div className="mt-6 space-y-4 px-4 pb-4">
                        <div className="space-y-2" ref={patientSearchContainerRef}>
                            <Label htmlFor="create-patient">
                                Patient
                            </Label>
                            <div className="relative">
                                <Input
                                    id="create-patient"
                                    ref={patientSearchInputRef}
                                    placeholder="Search patient by name, code, or phone…"
                                    value={displayPatientLabel || patientSearchQuery}
                                    readOnly={!!patientId && Boolean(createOptions.selectedPatientId)}
                                    onClick={() => {
                                        if (!patientId || !createOptions.selectedPatientId) {
                                            setPatientSearchOpen(true);
                                        }
                                    }}
                                    onChange={(event) => {
                                        const value = event.target.value;
                                        setPatientId('');
                                        setSelectedPatientLabel('');
                                        setPatientSearchQuery(value);
                                        searchPatients(value);
                                        setPatientSearchOpen(true);
                                    }}
                                />
                                {patientSearchOpen && !patientId && (
                                    <div className="absolute left-0 right-0 z-50 mt-1 max-h-60 overflow-auto rounded-md border bg-white shadow-lg">
                                        {patientSearchLoading && (
                                            <div className="px-3 py-2 text-xs text-muted-foreground">
                                                Searching…
                                            </div>
                                        )}
                                        {!patientSearchLoading && patientSearchResults.length === 0 && patientSearchQuery.trim() && (
                                            <div className="px-3 py-2 text-xs text-muted-foreground">
                                                No patients found
                                            </div>
                                        )}
                                        {patientSearchResults.map((option) => (
                                            <button
                                                key={option.slug}
                                                type="button"
                                                className="w-full px-3 py-2 text-left text-sm hover:bg-accent"
                                                onClick={() => {
                                                    setPatientId(option.slug);
                                                    setSelectedPatientLabel(option.label);
                                                    setPatientSearchQuery('');
                                                    setPatientSearchResults([]);
                                                    setPatientSearchOpen(false);
                                                }}
                                            >
                                                {option.label}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {patientId && lines.length > 0 ? (
                            <div className="rounded-lg border">
                                <table className="w-full text-sm">
                                    <thead className="bg-muted/50">
                                        <tr>
                                            <th className="px-4 py-2 text-left font-medium" style={{ width: '70%' }}>
                                                Test
                                            </th>
                                            <th className="px-4 py-2 text-left font-medium" style={{ width: '25%' }}>
                                                Price ({currencySymbol})
                                            </th>
                                            <th className="px-4 py-2 text-center font-medium" style={{ width: '5%' }}></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {lines.map((line, index) => (
                                            <tr key={index}>
                                                <td className="px-4 py-2">
                                                    <SelectNative
                                                        value={line.price_list_id}
                                                        onChange={(event) => {
                                                            const test =
                                                                createOptions.tests.find(
                                                                    (item) =>
                                                                        String(
                                                                            item.id,
                                                                        ) ===
                                                                        event.target
                                                                            .value,
                                                                );
                                                            setLines((current) =>
                                                                current.map(
                                                                    (row, rowIndex) =>
                                                                        rowIndex === index
                                                                            ? {
                                                                                  ...row,
                                                                                  price_list_id:
                                                                                      event
                                                                                          .target
                                                                                          .value,
                                                                                  unitPrice:
                                                                                      test
                                                                                          ? String(
                                                                                                  test.price,
                                                                                              )
                                                                                          : '',
                                                                                  unitCost:
                                                                                      test
                                                                                          ? String(
                                                                                                  test.cost,
                                                                                              )
                                                                                          : '',
                                                                              }
                                                                            : row,
                                                                ),
                                                            );
                                                        }}
                                                    >
                                                        <option value="">
                                                            Select test…
                                                        </option>
                                                        {createOptions.tests.map(
                                                            (test) => (
                                                                <option
                                                                    key={test.id}
                                                                    value={test.id}
                                                                >
                                                                    {test.name}
                                                                </option>
                                                            ),
                                                        )}
                                                    </SelectNative>
                                                </td>
                                                <td className="px-4 py-2">
                                                    <Input
                                                        value={line.unitPrice}
                                                        readOnly
                                                    />
                                                </td>
                                                <td className="px-4 py-2 text-center">
                                                    <button
                                                        type="button"
                                                        className="text-muted-foreground hover:text-red-600"
                                                        onClick={() =>
                                                            setLines((current) =>
                                                                current.filter(
                                                                    (_, i) => i !== index,
                                                                ),
                                                            )
                                                        }
                                                    >
                                                        ×
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : null}

                        {patientId ? (
                            <div className="flex items-center justify-between">
                                <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={() =>
                                        setLines((current) => [
                                            ...current,
                                            {
                                                price_list_id: '',
                                                unitPrice: '',
                                                unitCost: '',
                                                quantity: '1',
                                            },
                                        ])
                                    }
                                >
                                    Add test
                                </Button>
                                <p className="text-sm font-medium">
                                    Total: {currencySymbol}{' '}
                                    {createTotal().toLocaleString()}
                                </p>
                            </div>
                        ) : null}

                        {formError ? (
                            <p className="text-sm text-red-600">{formError}</p>
                        ) : null}
                    </div>

                    <SheetFooter className="mt-6">
                        <Button
                            variant="secondary"
                            onClick={() => setCreateOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            disabled={processing || !patientId}
                            onClick={submitCreate}
                        >
                            {processing ? 'Saving…' : 'Create request'}
                        </Button>
                    </SheetFooter>
                </SheetContent>
            </Sheet>
        </>
    );
}
