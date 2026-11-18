import { Check } from 'lucide-react';
import { useMemo, useState } from 'react';
import LabResultFields, {
    calculateProgressPercentage,
    flattenTests,
} from '@/components/lab-result-fields';
import type { LabResultForm } from '@/types';

export type LabPatientInfo = {
    patientId: string;
    patientName: string | null;
    birthDate: string | null;
    age: string | null;
    gender: string | null;
    doctorName: string | null;
    createdAt: string | null;
};

export type LabResultEntryLayoutValues = {
    lines: Record<string, string>;
    testResults: Record<string, Record<string, string>>;
    inventoryConsumption: Record<string, { lab_inventory_id: number; quantity: number }[]>;
};

export default function LabResultEntryLayout({
    form,
    values,
    onChange,
    onSaveStep,
    onSubmitResults,
    selected,
    formError,
}: {
    form: LabResultForm;
    values: LabResultEntryLayoutValues;
    onChange: (next: LabResultEntryLayoutValues) => void;
    onSaveStep?: (stepIndex: number, stepName: string) => void;
    onSubmitResults?: () => void;
    selected: LabPatientInfo;
    formError: string | null;
}) {
    const flatTests = useMemo(() => flattenTests(form), [form]);
    const progressPercentage = useMemo(
        () => calculateProgressPercentage(flatTests, values),
        [flatTests, values],
    );
    const [activeTestIndex, setActiveTestIndex] = useState(0);

    // SVG circle for progress ring
    const radius = 40;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (progressPercentage / 100) * circumference;

    function formatDate(isoString: string | null): string {
        if (!isoString) {
            return '—';
        }
        const date = new Date(isoString);
        return date.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        });
    }

    function formatTime(isoString: string | null): string {
        if (!isoString) {
            return '';
        }
        const date = new Date(isoString);
        return date.toLocaleTimeString('en-GB', {
            hour: '2-digit',
            minute: '2-digit',
        });
    }

    return (
        <div className="grid gap-6 lg:grid-cols-[280px_1fr_260px]">
            {/* Left sidebar — Patient info */}
            <div className="rounded-lg border p-4 space-y-3">
                <h4 className="font-semibold text-foreground">Patient info</h4>

                <div className="space-y-1 text-sm">
                    <div className="text-muted-foreground">Hospital No</div>
                    <div className="font-medium">{selected.patientId}</div>
                </div>

                <div className="space-y-1 text-sm">
                    <div className="text-muted-foreground">Fullname</div>
                    <div className="font-medium">{selected.patientName ?? '—'}</div>
                </div>

                <div className="space-y-1 text-sm">
                    <div className="text-muted-foreground">DOB</div>
                    <div className="font-medium">{formatDate(selected.birthDate)}</div>
                </div>

                <div className="space-y-1 text-sm">
                    <div className="text-muted-foreground">Age</div>
                    <div className="font-medium">{selected.age ?? '—'}</div>
                </div>

                <div className="space-y-1 text-sm">
                    <div className="text-muted-foreground">Gender</div>
                    <div className="font-medium">{selected.gender ?? '—'}</div>
                </div>

                <div className="space-y-1 text-sm">
                    <div className="text-muted-foreground">Requested by</div>
                    <div className="font-medium">{selected.doctorName ?? '—'}</div>
                </div>

                <div className="space-y-1 text-sm">
                    <div className="text-muted-foreground">Date requested</div>
                    <div className="font-medium">
                        {formatDate(selected.createdAt)}
                        {formatTime(selected.createdAt)
                            ? ` ${formatTime(selected.createdAt)}`
                            : ''}
                    </div>
                </div>

                <div className="space-y-1 text-sm">
                    <div className="text-muted-foreground">Test Category</div>
                    <div className="font-medium">
                        {form.steps.map((s) => s.name).join(', ') || '—'}
                    </div>
                </div>
            </div>

            {/* Center — Test entry */}
            <div className="space-y-4">
                <LabResultFields
                    form={form}
                    values={values}
                    onChange={onChange}
                    onSaveStep={onSaveStep}
                    onSubmitResults={onSubmitResults}
                    defaultTestIndex={activeTestIndex}
                    onTestIndexChange={setActiveTestIndex}
                />
                {formError ? (
                    <p className="text-sm text-red-600">{formError}</p>
                ) : null}
            </div>

            {/* Right sidebar — Progress + Test panel */}
            <div className="rounded-lg border p-4 space-y-4">
                {/* Progress circle */}
                <div className="flex flex-col items-center">
                    <div className="relative">
                        <svg width="120" height="120" viewBox="0 0 120 120">
                            <circle
                                cx="60"
                                cy="60"
                                r={radius}
                                fill="none"
                                stroke="var(--primary)"
                                strokeOpacity="0.2"
                                strokeWidth="10"
                            />
                            <circle
                                cx="60"
                                cy="60"
                                r={radius}
                                fill="none"
                                stroke="var(--primary)"
                                strokeWidth="10"
                                strokeLinecap="round"
                                strokeDasharray={circumference}
                                strokeDashoffset={strokeDashoffset}
                                transform="rotate(-90 60 60)"
                                style={{ transition: 'stroke-dashoffset 0.5s ease' }}
                            />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-2xl font-bold">{progressPercentage}%</span>
                            <span className="text-xs text-muted-foreground">done</span>
                        </div>
                    </div>
                </div>

                {/* Test panel list */}
                <div>
                    <div className="mb-2 text-sm font-medium text-muted-foreground">
                        Tests: {flatTests.length}
                    </div>
                    <div className="space-y-1">
                        {flatTests.map((test, index) => {
                            const isCompleted =
                                test.kind === 'simple'
                                    ? Boolean(values.lines[String(test.id)]?.trim())
                                    : (test.rows ?? []).length > 0 &&
                                      (test.rows ?? []).every((row) =>
                                          Boolean(
                                              (values.testResults[String(test.id)] ?? {})[
                                                  String(row.price_list_id)
                                              ]?.trim(),
                                          ),
                                      );
                            const isActive = index === activeTestIndex;

                            return (
                                <button
                                    key={test.id}
                                    type="button"
                                    onClick={() => setActiveTestIndex(index)}
                                    className={`w-full rounded-md px-3 py-2 text-left text-sm leading-tight transition-colors ${
                                        isActive
                                            ? 'bg-primary text-primary-foreground font-medium'
                                            : isCompleted
                                                ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                                                : 'bg-muted text-muted-foreground hover:bg-muted/80'
                                    }`}
                                >
                                    <div className="flex items-center gap-2">
                                        <span className="flex-shrink-0">
                                            {isCompleted ? (
                                                <Check size={14} />
                                            ) : (
                                                <span className="inline-block h-3.5 w-3.5 rounded-full border border-current" />
                                            )}
                                        </span>
                                        <span className="truncate">{test.name}</span>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
