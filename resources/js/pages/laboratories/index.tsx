import { Head, Link, router, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import LabResultFields, {
    buildResultPayload,
    emptyResultValues,
} from '@/components/lab-result-fields';
import Heading from '@/components/heading';
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
    const [lines, setLines] = useState<CreateLine[]>([
        { price_list_id: '', unitPrice: '', unitCost: '', quantity: '1' },
    ]);

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
                    <CardHeader>
                        <CardTitle>Laboratory result form</CardTitle>
                        <CardDescription>
                            Select a paid request to enter pending test results.
                        </CardDescription>
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
                                />
                                {formError ? (
                                    <p className="text-sm text-red-600">
                                        {formError}
                                    </p>
                                ) : null}
                                {resultForm.hasPending ? (
                                    <Button
                                        disabled={processing}
                                        onClick={submitResults}
                                    >
                                        {processing
                                            ? 'Submitting…'
                                            : 'Submit results'}
                                    </Button>
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
                <SheetContent className="overflow-y-auto sm:max-w-xl">
                    <SheetHeader>
                        <SheetTitle>New laboratory request</SheetTitle>
                        <SheetDescription>
                            Add tests for a patient and raise a billing.
                        </SheetDescription>
                    </SheetHeader>

                    <div className="mt-6 space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="create-patient">Patient</Label>
                            <SelectNative
                                id="create-patient"
                                value={patientId}
                                disabled={Boolean(
                                    createOptions.selectedPatientId,
                                )}
                                onChange={(event) =>
                                    setPatientId(event.target.value)
                                }
                            >
                                <option value="">Select patient…</option>
                                {createOptions.patients.map((patient) => (
                                    <option
                                        key={patient.slug}
                                        value={patient.slug}
                                    >
                                        {patient.label}
                                    </option>
                                ))}
                            </SelectNative>
                        </div>

                        {patientId
                            ? lines.map((line, index) => (
                                  <div
                                      key={index}
                                      className="grid gap-3 rounded-lg border p-3"
                                  >
                                      <div className="space-y-2">
                                          <Label>Test</Label>
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
                                      </div>
                                      <div className="grid grid-cols-2 gap-3">
                                          <div className="space-y-2">
                                              <Label>
                                                  Price ({currencySymbol})
                                              </Label>
                                              <Input
                                                  value={line.unitPrice}
                                                  readOnly
                                              />
                                          </div>
                                          <div className="space-y-2">
                                              <Label>Qty</Label>
                                              <Input
                                                  type="number"
                                                  min="1"
                                                  value={line.quantity}
                                                  onChange={(event) =>
                                                      setLines((current) =>
                                                          current.map(
                                                              (
                                                                  row,
                                                                  rowIndex,
                                                              ) =>
                                                                  rowIndex ===
                                                                  index
                                                                      ? {
                                                                            ...row,
                                                                            quantity:
                                                                                event
                                                                                    .target
                                                                                    .value,
                                                                        }
                                                                      : row,
                                                          ),
                                                      )
                                                  }
                                              />
                                          </div>
                                      </div>
                                  </div>
                              ))
                            : null}

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
