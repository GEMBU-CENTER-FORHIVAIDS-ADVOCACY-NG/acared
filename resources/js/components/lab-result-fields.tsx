import { ChevronLeft, ChevronRight, Check, Plus, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SelectNative } from '@/components/ui/select-native';
import type {
    LabInventoryConsumption,
    LabResultForm,
    LabResultParameterRow,
    LabResultTest,
} from '@/types';

type Props = {
    form: LabResultForm;
    values: {
        lines: Record<string, string>;
        testResults: Record<string, Record<string, string>>;
        inventoryConsumption: Record<string, LabInventoryConsumption[]>;
    };
    onChange: (next: Props['values']) => void;
    onSaveStep?: (stepIndex: number, stepName: string) => void;
    onSubmitResults?: () => void;
    onTestIndexChange?: (index: number) => void;
    defaultTestIndex?: number;
    readOnly?: boolean;
};

export type FlatTest = {
    id: number;
    name: string;
    kind: 'parameters' | 'simple';
    rows?: LabResultParameterRow[];
    result_type?: string;
    options?: string[];
    unit?: string | null;
    result?: string | null;
    category: string;
};

function ResultInput({
    id,
    label,
    resultType,
    options,
    unit,
    value,
    readOnly,
    onChange,
}: {
    id: string;
    label: string;
    resultType: string;
    options: string[];
    unit?: string | null;
    value: string;
    readOnly?: boolean;
    onChange: (value: string) => void;
}) {
    if (resultType === 'radio') {
        const radioOptions =
            options.length > 0 ? options : ['Positive', 'Negative', 'Pending'];

        return (
            <div className="space-y-2">
                <Label>{label}</Label>
                <div className="flex flex-wrap gap-3">
                    {radioOptions.map((option) => (
                        <label
                            key={option}
                            className="flex items-center gap-2 text-sm"
                        >
                            <input
                                type="radio"
                                name={id}
                                value={option}
                                checked={value === option}
                                disabled={readOnly}
                                onChange={() => onChange(option)}
                            />
                            {option}
                        </label>
                    ))}
                </div>
            </div>
        );
    }

    if (resultType === 'select') {
        return (
            <div className="space-y-2">
                <Label htmlFor={id}>{label}</Label>
                <SelectNative
                    id={id}
                    value={value}
                    disabled={readOnly}
                    onChange={(event) => onChange(event.target.value)}
                >
                    <option value="">Select…</option>
                    {options.map((option) => (
                        <option key={option} value={option}>
                            {option}
                        </option>
                    ))}
                </SelectNative>
            </div>
        );
    }

    return (
        <div className="space-y-2">
            <Label htmlFor={id}>{label}</Label>
            <div className="flex items-center gap-2">
                <Input
                    id={id}
                    type={resultType === 'number' ? 'number' : 'text'}
                    value={value}
                    disabled={readOnly}
                    onChange={(event) => onChange(event.target.value)}
                />
                {unit ? (
                    <span className="text-sm text-muted-foreground">
                        {unit}
                    </span>
                ) : null}
            </div>
        </div>
    );
}

function ParameterTable({
    test,
    rows,
    values,
    readOnly,
    onChange,
}: {
    test: LabResultTest;
    rows: LabResultParameterRow[];
    values: Record<string, string>;
    readOnly?: boolean;
    onChange: (priceListId: number, value: string) => void;
}) {
    return (
        <div className="space-y-3 rounded-lg border p-4">
            <h4 className="font-medium">{test.name}</h4>
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b text-left text-muted-foreground">
                            <th className="py-2 pr-3 font-medium">Parameter</th>
                            <th className="py-2 pr-3 font-medium">Range</th>
                            <th className="py-2 pr-3 font-medium">UOM</th>
                            <th className="py-2 font-medium">Result</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((row) => (
                            <tr
                                key={row.price_list_id}
                                className="border-b last:border-0"
                            >
                                <td className="py-2 pr-3">{row.name}</td>
                                <td className="py-2 pr-3">
                                    {row.range ?? '—'}
                                </td>
                                <td className="py-2 pr-3">{row.uom ?? '—'}</td>
                                <td className="py-2">
                                    <ResultInput
                                        id={`param-${test.id}-${row.price_list_id}`}
                                        label=""
                                        resultType={row.result_type}
                                        options={row.options}
                                        value={
                                            values[String(row.price_list_id)] ??
                                            row.result ??
                                            ''
                                        }
                                        readOnly={readOnly}
                                        onChange={(value) =>
                                            onChange(row.price_list_id, value)
                                        }
                                    />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function InventoryConsumptionRepeater({
    testId,
    testName,
    inventoryItems,
    rows,
    readOnly,
    onChange,
}: {
    testId: number;
    testName: string;
    inventoryItems: { id: number; sku: string; name: string; quantity: number }[];
    rows: LabInventoryConsumption[];
    readOnly?: boolean;
    onChange: (rows: LabInventoryConsumption[]) => void;
}) {
    function handleAdd() {
        onChange([...rows, { lab_inventory_id: 0, quantity: 1 }]);
    }

    function handleRemove(index: number) {
        const next = rows.filter((_, i) => i !== index);
        onChange(next);
    }

    function handleItemChange(index: number, inventoryId: number) {
        const next = rows.map((row, i) =>
            i === index ? { ...row, lab_inventory_id: inventoryId } : row,
        );
        onChange(next);
    }

    function handleQtyChange(index: number, quantity: number) {
        const next = rows.map((row, i) =>
            i === index ? { ...row, quantity } : row,
        );
        onChange(next);
    }

    return (
        <div className="space-y-3 rounded-lg border p-4">
            <h4 className="font-medium">Inventory used for {testName}</h4>
            <div className="overflow-visible">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b text-left text-muted-foreground">
                            <th className="w-[70%] py-2 pr-3 font-medium">Item</th>
                            <th className="w-[10%] py-2 pr-3 font-medium">Available</th>
                            <th className="w-[20%] py-2 pr-3 font-medium">Qty Used</th>
                            <th className="py-2 font-medium">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((row, index) => {
                            const selectedItem = inventoryItems.find(
                                (item) => item.id === row.lab_inventory_id,
                            );

                            return (
                                <tr
                                    key={index}
                                    className="border-b last:border-0"
                                >
                                    <td className="w-[70%] py-2 pr-3">
                                        <SelectNative
                                            value={row.lab_inventory_id}
                                            disabled={readOnly}
                                            onChange={(e) =>
                                                handleItemChange(
                                                    index,
                                                    Number(e.target.value),
                                                )
                                            }
                                            className="w-full"
                                        >
                                            <option value={0}>
                                                Select item…
                                            </option>
                                            {inventoryItems.map((item) => (
                                                <option
                                                    key={item.id}
                                                    value={item.id}
                                                >
                                                    {item.name}
                                                </option>
                                            ))}
                                        </SelectNative>
                                    </td>
                                    <td className="w-[10%] py-2 pr-3 text-muted-foreground">
                                        {selectedItem
                                            ? selectedItem.quantity
                                            : '—'}
                                    </td>
                                    <td className="w-[20%] py-2 pr-3">
                                        <Input
                                            type="number"
                                            min={1}
                                            step={1}
                                            value={row.quantity}
                                            disabled={readOnly}
                                            onChange={(e) =>
                                                handleQtyChange(
                                                    index,
                                                    Math.max(
                                                        1,
                                                        parseInt(
                                                            e.target.value ||
                                                                '1',
                                                            10,
                                                        ),
                                                    ),
                                                )
                                            }
                                        />
                                    </td>
                                    <td className="py-2">
                                        {!readOnly ? (
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    handleRemove(index)
                                                }
                                                className="inline-flex items-center justify-center rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                                            >
                                                <X className="h-4 w-4" />
                                            </button>
                                        ) : null}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
            {!readOnly ? (
                <button
                    type="button"
                    onClick={handleAdd}
                    className="inline-flex items-center gap-2 rounded-lg border border-dashed px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted"
                >
                    <Plus className="h-4 w-4" />
                    Add item
                </button>
            ) : null}
        </div>
    );
}

function StepNavigation({
    steps,
    currentStep,
    onStepClick,
}: {
    steps: { name: string }[];
    currentStep: number;
    onStepClick: (index: number) => void;
}) {
    return (
        <div className="mb-6">
            {/* Desktop horizontal stepper */}
            <div className="hidden items-center gap-0 md:flex">
                {steps.map((step, index) => {
                    const isCompleted = index < currentStep;
                    const isCurrent = index === currentStep;

                    return (
                        <div key={step.name} className="flex items-center">
                            <button
                                type="button"
                                onClick={() => onStepClick(index)}
                                className={`group flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                                    isCurrent
                                        ? 'bg-primary text-primary-foreground'
                                        : isCompleted
                                          ? 'text-primary hover:bg-primary/10'
                                          : 'text-muted-foreground hover:bg-muted'
                                }`}
                            >
                                <span
                                    className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold ${
                                        isCompleted
                                            ? 'bg-primary text-primary-foreground'
                                            : isCurrent
                                              ? 'bg-primary-foreground text-primary'
                                              : 'border border-muted-foreground/40 text-muted-foreground'
                                    }`}
                                >
                                    {isCompleted ? (
                                        <Check className="h-3.5 w-3.5" />
                                    ) : (
                                        index + 1
                                    )}
                                </span>
                                <span className="max-w-[120px] truncate">
                                    {step.name}
                                </span>
                            </button>
                            {index < steps.length - 1 ? (
                                <div className="mx-1 h-px w-8 bg-muted-foreground/30" />
                            ) : null}
                        </div>
                    );
                })}
            </div>

            {/* Mobile vertical stepper */}
            <div className="md:hidden">
                <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="font-medium text-muted-foreground">
                        Step {currentStep + 1} of {steps.length}
                    </span>
                    <span className="font-semibold">{steps[currentStep]?.name}</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                    <div
                        className="h-full rounded-full bg-primary transition-all duration-300"
                        style={{
                            width: `${((currentStep + 1) / steps.length) * 100}%`,
                        }}
                    />
                </div>
                <div className="mt-3 grid gap-2">
                    {steps.map((step, index) => {
                        const isCompleted = index < currentStep;
                        const isCurrent = index === currentStep;

                        return (
                            <button
                                key={step.name}
                                type="button"
                                onClick={() => onStepClick(index)}
                                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                                    isCurrent
                                        ? 'bg-primary/10 text-primary'
                                        : isCompleted
                                          ? 'text-primary hover:bg-primary/10'
                                          : 'text-muted-foreground hover:bg-muted'
                                }`}
                            >
                                <span
                                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                                        isCompleted
                                            ? 'bg-primary text-primary-foreground'
                                            : isCurrent
                                              ? 'bg-primary text-primary-foreground'
                                              : 'border border-muted-foreground/40 text-muted-foreground'
                                    }`}
                                >
                                    {isCompleted ? (
                                        <Check className="h-3.5 w-3.5" />
                                    ) : (
                                        index + 1
                                    )}
                                </span>
                                <span className="truncate">{step.name}</span>
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

function StepFooter({
    currentStep,
    totalSteps,
    onPrevious,
    onNext,
    onSaveStep,
    onSubmitResults,
    readOnly,
    isLastStep,
    allPreviousCompleted,
}: {
    currentStep: number;
    totalSteps: number;
    onPrevious: () => void;
    onNext: () => void;
    onSaveStep?: () => void;
    onSubmitResults?: () => void;
    readOnly: boolean;
    isLastStep: boolean;
    allPreviousCompleted: boolean;
}) {
    if (readOnly) {
        return null;
    }

    function handleSaveAndNext() {
        onSaveStep?.();
        if (!isLastStep) {
            onNext();
        }
    }

    function handleSaveAndSubmit() {
        onSaveStep?.();
        onSubmitResults?.();
    }

    return (
        <div className="mt-6 flex items-center justify-between pt-4 border-t">
            <button
                type="button"
                onClick={onPrevious}
                disabled={currentStep === 0}
                className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted"
            >
                <ChevronLeft className="h-4 w-4" />
                Previous
            </button>
            <span className="text-sm text-muted-foreground">
                {currentStep + 1} of {totalSteps}
            </span>
            {isLastStep && allPreviousCompleted && onSubmitResults ? (
                <button
                    type="button"
                    onClick={handleSaveAndSubmit}
                    className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                >
                    <Check className="h-4 w-4" />
                    Save & Submit
                </button>
            ) : (
                <button
                    type="button"
                    onClick={handleSaveAndNext}
                    className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                >
                    Save & Next
                    <ChevronRight className="h-4 w-4" />
                </button>
            )}
        </div>
    );
}

function isTestCompleted(test: FlatTest, values: Props['values']): boolean {
    if (test.kind === 'simple') {
        const value = values.lines[String(test.id)];
        return Boolean(value && value.trim() !== '');
    }

    if (test.kind === 'parameters') {
        const testResultMap = values.testResults[String(test.id)] ?? {};
        const rows = test.rows ?? [];
        return rows.every((row) => {
            const val = testResultMap[String(row.price_list_id)];
            return Boolean(val && val.trim() !== '');
        });
    }

    return false;
}

export function flattenTests(form: LabResultForm): FlatTest[] {
    const flat: FlatTest[] = [];

    for (const step of form.steps) {
        for (const test of step.tests) {
            flat.push({
                ...test,
                category: step.name,
            });
        }
    }

    return flat;
}

export function calculateProgressPercentage(
    flatTests: FlatTest[],
    values: Props['values'],
): number {
    if (flatTests.length === 0) {
        return 0;
    }

    const completed = flatTests.filter((test) => isTestCompleted(test, values)).length;
    return Math.round((completed / flatTests.length) * 100);
}

export default function LabResultFields({
    form,
    values,
    onChange,
    onSaveStep,
    onSubmitResults,
    onTestIndexChange,
    defaultTestIndex = 0,
    readOnly = false,
}: Props) {
    if (!form.hasPending || form.steps.length === 0) {
        return (
            <p className="text-sm text-muted-foreground">
                No test results found.
            </p>
        );
    }

    const [currentTestIndex, setCurrentTestIndex] = useState(defaultTestIndex);
    const flatTests = useMemo(() => flattenTests(form), [form]);
    const currentTest = flatTests[currentTestIndex];

    useEffect(() => {
        setCurrentTestIndex(defaultTestIndex);
    }, [defaultTestIndex]);

    function setInternalTestIndex(index: number) {
        setCurrentTestIndex(index);
    }

    if (!currentTest) {
        return (
            <p className="text-sm text-muted-foreground">
                No test results found.
            </p>
        );
    }

    function handlePrevious() {
        if (currentTestIndex > 0) {
            const newIndex = currentTestIndex - 1;
            setInternalTestIndex(newIndex);
            onTestIndexChange?.(newIndex);
        }
    }

    function handleNext() {
        if (currentTestIndex < flatTests.length - 1) {
            const newIndex = currentTestIndex + 1;
            setInternalTestIndex(newIndex);
            onTestIndexChange?.(newIndex);
        }
    }

    function handleTestClick(index: number) {
        setInternalTestIndex(index);
        onTestIndexChange?.(index);
    }

    function handleSaveCurrentTest() {
        onSaveStep?.(currentTestIndex, currentTest.name);
    }

    return (
        <div className="space-y-0">
            {/* Test navigation header */}
            <div className="mb-4 flex items-center">
                <div className="flex items-center gap-2 text-sm">
                    <span className="font-medium text-muted-foreground">
                        Test {currentTestIndex + 1} of {flatTests.length}
                    </span>
                    <span className="text-muted-foreground">—</span>
                    <span className="font-semibold">{currentTest.category}</span>
                </div>
            </div>

            {/* Current test content */}
            <section className="space-y-4">

                {currentTest.kind === 'parameters' ? (
                    <div>
                        <ParameterTable
                            test={currentTest}
                            rows={currentTest.rows ?? []}
                            values={
                                values.testResults[String(currentTest.id)] ?? {}
                            }
                            readOnly={readOnly}
                            onChange={(priceListId, value) => {
                                const key = String(currentTest.id);
                                onChange({
                                    ...values,
                                    testResults: {
                                        ...values.testResults,
                                        [key]: {
                                            ...values.testResults[key],
                                            [String(priceListId)]: value,
                                        },
                                    },
                                });
                            }}
                        />
                        <InventoryConsumptionRepeater
                            testId={currentTest.id}
                            testName={currentTest.name}
                            inventoryItems={form.inventoryItems ?? []}
                            rows={
                                values.inventoryConsumption[
                                    String(currentTest.id)
                                ] ?? []
                            }
                            readOnly={readOnly}
                            onChange={(rows) => {
                                onChange({
                                    ...values,
                                    inventoryConsumption: {
                                        ...values.inventoryConsumption,
                                        [String(currentTest.id)]: rows,
                                    },
                                });
                            }}
                        />
                    </div>
                ) : (
                    <div className="space-y-3">
                        <ResultInput
                            id={`line-${currentTest.id}`}
                            label={currentTest.name}
                            resultType={currentTest.result_type ?? 'text'}
                            options={currentTest.options ?? []}
                            unit={currentTest.unit}
                            value={
                                values.lines[String(currentTest.id)] ??
                                currentTest.result ??
                                ''
                            }
                            readOnly={readOnly}
                            onChange={(value) =>
                                onChange({
                                    ...values,
                                    lines: {
                                        ...values.lines,
                                        [String(currentTest.id)]: value,
                                    },
                                })
                            }
                        />
                        <InventoryConsumptionRepeater
                            testId={currentTest.id}
                            testName={currentTest.name}
                            inventoryItems={form.inventoryItems ?? []}
                            rows={
                                values.inventoryConsumption[
                                    String(currentTest.id)
                                ] ?? []
                            }
                            readOnly={readOnly}
                            onChange={(rows) => {
                                onChange({
                                    ...values,
                                    inventoryConsumption: {
                                        ...values.inventoryConsumption,
                                        [String(currentTest.id)]: rows,
                                    },
                                });
                            }}
                        />
                    </div>
                )}
            </section>

            {/* Navigation footer */}
            <StepFooter
                currentStep={currentTestIndex}
                totalSteps={flatTests.length}
                onPrevious={handlePrevious}
                onNext={handleNext}
                onSaveStep={handleSaveCurrentTest}
                onSubmitResults={onSubmitResults}
                readOnly={readOnly}
                isLastStep={currentTestIndex === flatTests.length - 1}
                allPreviousCompleted={
                    currentTestIndex === 0 ||
                    flatTests.slice(0, currentTestIndex).every((test) => isTestCompleted(test, values))
                }
            />

            {/* Expose flat tests and progress for parent component */}
            <div className="hidden">
                {/* Parent can access via ref if needed */}
            </div>
        </div>
    );
}

export function emptyResultValues(): Props['values'] {
    return { lines: {}, testResults: {}, inventoryConsumption: {} };
}

export function buildResultPayload(values: Props['values']) {
    const testResults: Record<
        string,
        { price_list_id: number; result: string }[]
    > = {};

    for (const [parentId, rows] of Object.entries(values.testResults)) {
        testResults[parentId] = Object.entries(rows).map(
            ([priceListId, result]) => ({
                price_list_id: Number(priceListId),
                result,
            }),
        );
    }

    // Keep inventory consumption keyed by test (price_list_id), filtering out invalid entries
    const inventoryConsumption: Record<string, { lab_inventory_id: number; quantity: number }[]> = {};
    for (const [testId, rows] of Object.entries(values.inventoryConsumption)) {
        const filtered = rows.filter((row) => row.lab_inventory_id > 0 && row.quantity > 0);
        if (filtered.length > 0) {
            inventoryConsumption[testId] = filtered;
        }
    }

    return {
        lines: values.lines,
        testResults,
        inventoryConsumption,
    };
}
