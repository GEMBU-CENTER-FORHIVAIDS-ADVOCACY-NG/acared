import { ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
    Card,
    CardContent,
    CardHeader,
} from '@/components/ui/card';
import type {
    LabResultForm,
    LabResultParameterRow,
    LabResultTest,
} from '@/types';

type Props = {
    form: LabResultForm;
};

function ParameterResultTable({ rows }: { rows: LabResultParameterRow[] }) {
    if (rows.length === 0) {
        return <p className="text-sm text-muted-foreground">No parameters.</p>;
    }

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-sm">
                <thead>
                    <tr className="border-b">
                        <th className="px-3 py-2 text-left font-medium text-muted-foreground">
                            Parameter
                        </th>
                        <th className="px-3 py-2 text-left font-medium text-muted-foreground">
                            Range
                        </th>
                        <th className="px-3 py-2 text-left font-medium text-muted-foreground">
                            UOM
                        </th>
                        <th className="px-3 py-2 text-left font-bold text-foreground">
                            Result
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {rows.map((row) => (
                        <tr key={row.price_list_id} className="border-b last:border-0">
                            <td className="px-3 py-2">{row.name}</td>
                            <td className="px-3 py-2 text-muted-foreground">
                                {row.range ?? '—'}
                            </td>
                            <td className="px-3 py-2 text-muted-foreground">
                                {row.uom ?? '—'}
                            </td>
                            <td className="px-3 py-2 font-bold">
                                {row.result ?? '—'}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

function SimpleResultDisplay({ test }: { test: LabResultTest }) {
    return (
        <div className="flex items-center justify-between gap-4 rounded-lg px-3 py-2 bg-muted/50">
            <span className="text-sm text-muted-foreground">{test.name}</span>
            <div className="flex items-center gap-2">
                <span className="text-sm font-bold">{test.result ?? '—'}</span>
                {test.unit ? (
                    <span className="text-xs text-muted-foreground">{test.unit}</span>
                ) : null}
            </div>
        </div>
    );
}

function TestGroup({ test }: { test: LabResultTest }) {
    if (test.kind === 'parameters') {
        return (
            <div className="rounded-lg border">
                <div className="px-3 py-2 border-b bg-muted/30 font-medium text-sm">
                    {test.name}
                </div>
                <ParameterResultTable rows={test.rows ?? []} />
            </div>
        );
    }

    return <SimpleResultDisplay test={test} />;
}

function StepSection({ step }: { step: { name: string; tests: LabResultTest[] } }) {
    const [isOpen, setIsOpen] = useState(true);

    const simpleTests = step.tests.filter((t) => t.kind === 'simple');
    const paramTests = step.tests.filter((t) => t.kind === 'parameters');

    return (
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
            <Card>
                <CollapsibleTrigger asChild>
                    <CardHeader className="flex cursor-pointer items-center justify-between py-3">
                        <div className="flex items-center gap-2">
                            <ChevronDown
                                className={`h-4 w-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                            />
                            <h3 className="text-base font-semibold">{step.name}</h3>
                            <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                                {step.tests.length} test
                                {step.tests.length !== 1 ? 's' : ''}
                            </span>
                        </div>
                    </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                    <CardContent className="space-y-3 pt-0">
                        {simpleTests.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                                {simpleTests.map((test) => (
                                    <SimpleResultDisplay key={test.id} test={test} />
                                ))}
                            </div>
                        ) : null}
                        {paramTests.map((test) => (
                            <TestGroup key={test.id} test={test} />
                        ))}
                    </CardContent>
                </CollapsibleContent>
            </Card>
        </Collapsible>
    );
}

export default function LabResultInfolist({ form }: Props) {
    if (form.steps.length === 0) {
        return (
            <p className="py-6 text-center text-sm text-muted-foreground">
                No test results found.
            </p>
        );
    }

    return (
        <div className="space-y-4">
            {form.steps.map((step) => (
                <StepSection key={step.name} step={step} />
            ))}
        </div>
    );
}
