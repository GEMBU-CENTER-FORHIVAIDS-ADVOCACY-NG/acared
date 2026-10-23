import { ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SelectNative } from '@/components/ui/select-native';
import type {
    LabResultForm,
    LabResultParameterRow,
    LabResultTest,
} from '@/types';

type Props = {
    form: LabResultForm;
    values: {
        lines: Record<string, string>;
        testResults: Record<string, Record<string, string>>;
    };
    onChange: (next: Props['values']) => void;
    readOnly?: boolean;
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
    readOnly,
}: {
    currentStep: number;
    totalSteps: number;
    onPrevious: () => void;
    onNext: () => void;
    readOnly: boolean;
}) {
    if (readOnly) {
        return null;
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
            <button
                type="button"
                onClick={onNext}
                disabled={currentStep === totalSteps - 1}
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90"
            >
                Next
                <ChevronRight className="h-4 w-4" />
            </button>
        </div>
    );
}

export default function LabResultFields({
    form,
    values,
    onChange,
    readOnly = false,
}: Props) {
    if (!form.hasPending || form.steps.length === 0) {
        return (
            <p className="text-sm text-muted-foreground">
                No test results found.
            </p>
        );
    }

    const [currentStep, setCurrentStep] = useState(0);

    const totalSteps = form.steps.length;
    const step = form.steps[currentStep];

    function handlePrevious() {
        if (currentStep > 0) {
            setCurrentStep((prev) => prev - 1);
        }
    }

    function handleNext() {
        if (currentStep < totalSteps - 1) {
            setCurrentStep((prev) => prev + 1);
        }
    }

    function handleStepClick(index: number) {
        setCurrentStep(index);
    }

    return (
        <div className="space-y-0">
            <StepNavigation
                steps={form.steps}
                currentStep={currentStep}
                onStepClick={handleStepClick}
            />

            <section className="space-y-4">
                <h3 className="text-lg font-semibold">{step.name}</h3>
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {step.tests.map((test) =>
                        test.kind === 'parameters' ? (
                            <div
                                key={test.id}
                                className="md:col-span-2 xl:col-span-3"
                            >
                                <ParameterTable
                                    test={test}
                                    rows={test.rows ?? []}
                                    values={
                                        values.testResults[String(test.id)] ?? {}
                                    }
                                    readOnly={readOnly}
                                    onChange={(priceListId, value) => {
                                        const key = String(test.id);
                                        onChange({
                                            ...values,
                                            testResults: {
                                                ...values.testResults,
                                                [key]: {
                                                    ...values.testResults[key],
                                                    [String(priceListId)]:
                                                        value,
                                                },
                                            },
                                        });
                                    }}
                                />
                            </div>
                        ) : (
                            <ResultInput
                                key={test.id}
                                id={`line-${test.id}`}
                                label={test.name}
                                resultType={test.result_type ?? 'text'}
                                options={test.options ?? []}
                                unit={test.unit}
                                value={
                                    values.lines[String(test.id)] ??
                                    test.result ??
                                    ''
                                }
                                readOnly={readOnly}
                                onChange={(value) =>
                                    onChange({
                                        ...values,
                                        lines: {
                                            ...values.lines,
                                            [String(test.id)]: value,
                                        },
                                    })
                                }
                            />
                        ),
                    )}
                </div>
            </section>

            <StepFooter
                currentStep={currentStep}
                totalSteps={totalSteps}
                onPrevious={handlePrevious}
                onNext={handleNext}
                readOnly={readOnly}
            />
        </div>
    );
}

export function emptyResultValues(): Props['values'] {
    return { lines: {}, testResults: {} };
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

    return {
        lines: values.lines,
        testResults,
    };
}
