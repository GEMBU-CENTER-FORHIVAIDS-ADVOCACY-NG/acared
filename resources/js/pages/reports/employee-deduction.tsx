import { Head, router, usePage } from '@inertiajs/react';
import { useRef, useState } from 'react';
import AlertError from '@/components/alert-error';
import { FinancialReportLayout } from '@/components/financial-report-layout';
import Heading from '@/components/heading';
import Pagination from '@/components/pagination';
import { useReportPrint } from '@/hooks/use-report-print';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SelectNative } from '@/components/ui/select-native';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { previewEmployeeDeduction } from '@/actions/App/Http/Controllers/OperationalReportController';
import { employeeDeduction } from '@/routes/reports';
import {
    exportMethod as exportReport,
    importMethod as importEmployeeDeductions,
} from '@/routes/reports/employee-deduction';

type PatientDeduction = {
    id: number;
    patientId: string;
    name: string;
    category: string | null;
    wallet: number;
    createdAt: string | null;
    updatedAt: string | null;
};
type Filters = {
    q: string;
    perPage: number;
    page?: number;
};
type Paginator = {
    data: PatientDeduction[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
};

type ImportMapping = {
    hospital_no: string;
    name: string;
    amount: string;
};

const MAPPABLE_FIELDS: Array<{ key: keyof ImportMapping; label: string; required?: boolean }> = [
    { key: 'hospital_no', label: 'Hospital No.', required: true },
    { key: 'name', label: 'Name' },
    { key: 'amount', label: 'Amount', required: true },
];

const EMPTY_MAPPING: ImportMapping = { hospital_no: '', name: '', amount: '' };

function guessMapping(headers: string[]): ImportMapping {
    const normalize = (value: string) =>
        value.toLowerCase().replace(/[^a-z0-9]/g, '');
    const find = (predicates: Array<(key: string) => boolean>) =>
        headers.find((header) => predicates.some((p) => p(normalize(header)))) ?? '';

    return {
        hospital_no: find([
            (k) => k.includes('hospital') && (k.includes('no') || k.includes('number') || k.includes('id')),
            (k) => k === 'slug' || k === 'patientid' || k === 'patientno',
        ]),
        name: find([(k) => k.includes('name') || k === 'patient' || k === 'employee']),
        amount: find([(k) => k.includes('amount') || k.includes('deduction')]),
    };
}

export default function EmployeeDeductionReport({
    patients,
    summary,
    filters,
    currencySymbol,
}: {
    patients: Paginator;
    summary: { patients: number; walletBalance: number; walletTotal: number };
    filters: Filters;
    currencySymbol: string;
}) {
    const team = usePage().props.currentTeam?.slug ?? '';
    const { printRef, handlePrint } = useReportPrint();
    const [search, setSearch] = useState(filters.q);
    const [isVisiting, setIsVisiting] = useState(false);
    const [isPrinting, setIsPrinting] = useState(false);
    const [isImporting, setIsImporting] = useState(false);
    const [isPreviewing, setIsPreviewing] = useState(false);
    const [importError, setImportError] = useState<string | null>(null);
    const [mappingOpen, setMappingOpen] = useState(false);
    const [importFile, setImportFile] = useState<File | null>(null);
    const [importHeaders, setImportHeaders] = useState<string[]>([]);
    const [importPreview, setImportPreview] = useState<Array<Record<string, string>>>([]);
    const [importMapping, setImportMapping] = useState<ImportMapping>(EMPTY_MAPPING);
    const importInput = useRef<HTMLInputElement>(null);
    const visit = (patch: Partial<Filters>) => {
        const next = { ...filters, ...patch };
        setIsVisiting(true);
        router.get(
            employeeDeduction.url({ current_team: team }),
            {
                q: next.q || undefined,
                perPage: next.perPage,
                page: next.page || undefined,
            },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
                onFinish: () => setIsVisiting(false),
            },
        );
    };
    const printReport = () => {
        setIsPrinting(true);
        const finishPrint = () => {
            setIsPrinting(false);
            window.removeEventListener('afterprint', finishPrint);
        };
        window.addEventListener('afterprint', finishPrint);
        handlePrint();
    };
    const resetImport = () => {
        setMappingOpen(false);
        setImportFile(null);
        setImportHeaders([]);
        setImportPreview([]);
        setImportMapping(EMPTY_MAPPING);
        setImportError(null);
        if (importInput.current) {
            importInput.current.value = '';
        }
    };
    const previewImport = async (file: File | undefined) => {
        if (!file) {
            return;
        }

        setImportError(null);
        setIsPreviewing(true);
        const payload = new FormData();
        payload.append('file', file);

        try {
            const response = await fetch(previewEmployeeDeduction.url(team), {
                method: 'POST',
                body: payload,
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-XSRF-TOKEN': decodeURIComponent(
                        document.cookie
                            .split('; ')
                            .find((c) => c.startsWith('XSRF-TOKEN='))
                            ?.split('=')[1] ?? '',
                    ),
                },
            });

            const data = await response.json();
            if (!response.ok) {
                setImportError(data.message ?? 'Unable to preview file.');
                return;
            }

            const headers: string[] = Array.isArray(data.headers) ? data.headers : [];
            setImportFile(file);
            setImportHeaders(headers);
            setImportPreview(Array.isArray(data.preview) ? data.preview : []);
            setImportMapping(guessMapping(headers));
            setMappingOpen(true);
        } catch {
            setImportError('Unable to preview file.');
        } finally {
            setIsPreviewing(false);
            if (importInput.current) {
                importInput.current.value = '';
            }
        }
    };
    const importDeductions = () => {
        if (!importFile) {
            setImportError('Please select a file.');
            return;
        }
        if (!importMapping.hospital_no || !importMapping.amount) {
            setImportError('Map Hospital No. and Amount before importing.');
            return;
        }

        setImportError(null);
        setIsImporting(true);
        const payload = new FormData();
        payload.append('file', importFile);
        payload.append('mapping[hospital_no]', importMapping.hospital_no);
        payload.append('mapping[name]', importMapping.name);
        payload.append('mapping[amount]', importMapping.amount);

        router.post(importEmployeeDeductions.url(team), payload, {
            forceFormData: true,
            preserveScroll: true,
            onError: (errors) =>
                setImportError(errors.file ?? 'Import failed.'),
            onSuccess: () => resetImport(),
            onFinish: () => setIsImporting(false),
        });
    };

    return (
        <>
            <Head title="Employee deduction report" />
            <FinancialReportLayout active="employee-deduction">
                <div className="flex w-full flex-col space-y-6">
                    <div className="no-print flex flex-wrap items-center justify-between gap-3">
                        <Heading
                            variant="small"
                            title="Employee deduction report"
                            description="Wallet deductions for all employees with negative balances."
                        />
                        <div className="flex flex-wrap justify-end gap-2">
                            <Button
                                variant="outline"
                                onClick={printReport}
                                disabled={isPrinting}
                            >
                                {isPrinting ? 'Printing…' : 'Print'}
                            </Button>
                            <Button variant="outline" asChild>
                                <a
                                    href={exportReport.url(team, {
                                        query: {
                                            q: filters.q || undefined,
                                            perPage: filters.perPage,
                                        },
                                    })}
                                >
                                    Export CSV
                                </a>
                            </Button>
                            <input
                                ref={importInput}
                                type="file"
                                accept=".csv,.txt,.xlsx,.xls"
                                className="hidden"
                                aria-label="Import employee deduction CSV or Excel"
                                disabled={isImporting || isPreviewing}
                                onChange={(event) =>
                                    previewImport(event.target.files?.[0])
                                }
                            />
                            <Button
                                variant="outline"
                                onClick={() => importInput.current?.click()}
                                disabled={isImporting || isPreviewing}
                            >
                                {isPreviewing
                                    ? 'Reading file…'
                                    : isImporting
                                      ? 'Importing…'
                                      : 'Import CSV/Excel'}
                            </Button>
                            {importError && (
                                <p
                                    className="w-full text-xs text-destructive"
                                    role="alert"
                                >
                                    {importError}
                                </p>
                            )}
                        </div>
                    </div>
                    <div className="no-print grid gap-3 sm:grid-cols-3">
                        <StatCard
                            title="Employees with deductions"
                            value={summary.patients.toLocaleString()}
                        />
                        <StatCard
                            title="Net deduction balance"
                            value={`${currencySymbol} ${summary.walletBalance.toLocaleString()}`}
                        />
                        <StatCard
                            title="Total deduction amount"
                            value={`${currencySymbol} ${summary.walletTotal.toLocaleString()}`}
                        />
                    </div>
                    <div className="no-print flex flex-wrap items-end gap-2">
                        <form
                            className="flex items-end gap-2"
                            onSubmit={(event) => {
                                event.preventDefault();
                                visit({ q: search, page: 1 });
                            }}
                        >
                            <div className="space-y-1">
                                <Label htmlFor="employee-deduction-search">
                                    Search
                                </Label>
                                <Input
                                    id="employee-deduction-search"
                                    value={search}
                                    onChange={(event) =>
                                        setSearch(event.target.value)
                                    }
                                    placeholder="Search employees"
                                />
                            </div>
                            <Button type="submit" disabled={isVisiting}>
                                {isVisiting ? 'Searching…' : 'Search'}
                            </Button>
                        </form>
                    </div>
                    <div ref={printRef} className="report-print-container">
                        <h2 className="mb-3 text-lg font-semibold">
                            Employee Deduction Report
                        </h2>
                        <div className="rounded-lg border bg-card">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Hospital No.</TableHead>
                                        <TableHead>Employee</TableHead>
                                        <TableHead>Category</TableHead>
                                        <TableHead>Deduction</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {patients.data.length ? (
                                        patients.data.map((patient) => (
                                            <TableRow key={patient.id}>
                                                <TableCell>
                                                    {patient.patientId}
                                                </TableCell>
                                                <TableCell className="font-medium">
                                                    {patient.name}
                                                </TableCell>
                                                <TableCell>
                                                    {patient.category ?? '-'}
                                                </TableCell>
                                                <TableCell className="font-semibold text-destructive">
                                                    {currencySymbol}{' '}
                                                    {Math.abs(
                                                        patient.wallet,
                                                    ).toLocaleString()}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell
                                                colSpan={4}
                                                className="py-10 text-center text-muted-foreground"
                                            >
                                                No employee deductions found.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                                <tfoot className="border-t bg-muted/50 font-semibold">
                                    <TableRow className="hover:bg-muted/50">
                                        <TableCell colSpan={3}>
                                            Total Deduction
                                        </TableCell>
                                        <TableCell>
                                            {currencySymbol}{' '}
                                            {summary.walletTotal.toLocaleString()}
                                        </TableCell>
                                    </TableRow>
                                </tfoot>
                            </Table>
                        </div>
                    </div>
                    <div
                        className={`no-print ${isVisiting ? 'pointer-events-none opacity-60' : ''}`}
                        aria-busy={isVisiting}
                    >
                        <Pagination
                            meta={{
                                currentPage: patients.current_page,
                                lastPage: patients.last_page,
                                perPage: patients.per_page,
                                total: patients.total,
                            }}
                            onPageChange={(page) => visit({ page })}
                            onPerPageChange={(perPage) =>
                                visit({ perPage, page: 1 })
                            }
                        />
                    </div>
                    <Dialog
                        open={mappingOpen}
                        onOpenChange={(open) => {
                            if (!open) resetImport();
                            else setMappingOpen(true);
                        }}
                    >
                        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-5xl">
                            <DialogHeader>
                                <DialogTitle>Map import columns</DialogTitle>
                                <DialogDescription>
                                    Match your file columns to employee deduction
                                    fields. Hospital No. and Amount are required.
                                    This import pays off employee wallet balance
                                    using Cheque as the payment method.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                                {MAPPABLE_FIELDS.map(({ key, label, required }) => (
                                    <div
                                        key={key}
                                        className="grid items-center gap-2 sm:grid-cols-[180px_1fr]"
                                    >
                                        <Label htmlFor={`map-${key}`}>
                                            {label}
                                            {required ? ' *' : ''}
                                        </Label>
                                        <SelectNative
                                            id={`map-${key}`}
                                            value={importMapping[key]}
                                            onChange={(event) =>
                                                setImportMapping((current) => ({
                                                    ...current,
                                                    [key]: event.target.value,
                                                }))
                                            }
                                        >
                                            <option value="">— Skip —</option>
                                            {importHeaders.map((header) => (
                                                <option key={`${key}-${header}`} value={header}>
                                                    {header}
                                                </option>
                                            ))}
                                        </SelectNative>
                                    </div>
                                ))}
                                {importPreview.length > 0 && (
                                    <div className="overflow-auto rounded-md border">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    {importHeaders.map((header) => (
                                                        <TableHead key={header}>
                                                            {header || '(blank)'}
                                                        </TableHead>
                                                    ))}
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {importPreview.map((row, index) => (
                                                    <TableRow key={index}>
                                                        {importHeaders.map((header) => (
                                                            <TableCell key={`${index}-${header}`}>
                                                                {row[header] ?? ''}
                                                            </TableCell>
                                                        ))}
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                )}
                                {importError ? (
                                    <AlertError
                                        errors={[importError]}
                                        title="Unable to import deductions"
                                    />
                                ) : null}
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={resetImport} disabled={isImporting}>
                                    Cancel
                                </Button>
                                <Button onClick={importDeductions} disabled={isImporting}>
                                    {isImporting ? 'Importing…' : 'Import'}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </FinancialReportLayout>
        </>
    );
}

function StatCard({ title, value }: { title: string; value: string }) {
    return (
        <Card>
            <CardHeader className="pb-2">
                <CardDescription>{title}</CardDescription>
                <CardTitle className="text-2xl">{value}</CardTitle>
            </CardHeader>
        </Card>
    );
}
