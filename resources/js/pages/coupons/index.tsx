import { Head, router, usePage } from '@inertiajs/react';
import { Check, MoreHorizontal, Pencil, Trash2, X } from 'lucide-react';
import { useCallback, useEffect, useId, useRef, useState } from 'react';
import CouponController from '@/actions/App/Http/Controllers/CouponController';
import AlertError from '@/components/alert-error';
import ConfirmDialog from '@/components/confirm-dialog';
import Heading from '@/components/heading';
import Pagination from '@/components/pagination';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableFooter,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    index as couponsIndex,
    store as couponsStore,
    update as couponsUpdate,
    destroy as couponsDestroy,
    approve as couponsApprove,
    reject as couponsReject,
} from '@/routes/coupons';
import { destroy as couponsBulkDestroy } from '@/routes/coupons/bulk';

type PatientOption = { slug: string; label: string };
type Coupon = {
    id: number;
    patientId: string;
    patientName: string | null;
    code: string;
    type: 'fixed' | 'percentage';
    value: number;
    maxUses: number | null;
    usedCount: number;
    minBillingAmount: number;
    maxDiscountAmount: number | null;
    expiresAt: string | null;
    isActive: boolean;
    fundType: 'mercy_fund' | 'infant_formula' | null;
    status: 'pending' | 'approved' | 'rejected';
    approvedBy: string | null;
    approvedAt: string | null;
    usedAmount: number;
    balance: number;
};
type Paginator = {
    data: Coupon[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
};
type Filters = { q: string; status: string; perPage: number; page?: number };
type Form = {
    patient_id: string;
    code: string;
    type: 'fixed' | 'percentage';
    value: string;
    max_uses: string;
    used_count: string;
    min_billing_amount: string;
    max_discount_amount: string;
    expires_at: string;
    is_active: boolean;
    fund_type: 'mercy_fund' | 'infant_formula' | '';
};
const emptyForm: Form = {
    patient_id: '',
    code: '',
    type: 'fixed',
    value: '',
    max_uses: '',
    used_count: '0',
    min_billing_amount: '0',
    max_discount_amount: '',
    expires_at: '',
    is_active: true,
    fund_type: '',
};

export default function CouponsIndex({
    coupons,
    filters,
    summary,
}: {
    coupons: Paginator;
    filters: Filters;
    summary: {
        pending: number;
        approved: number;
        rejected: number;
        totalUsed: number;
        totalDiscounts: number;
    };
}) {
    const { currentTeam } = usePage().props;
    const team = currentTeam?.slug;
    const formDialogLabelId = useId();
    const [search, setSearch] = useState(filters.q);
    const [statusFilter, setStatusFilter] = useState(filters.status);
    const [form, setForm] = useState<Form>(emptyForm);
    const [editing, setEditing] = useState<Coupon | null>(null);
    const [selected, setSelected] = useState<number[]>([]);
    const [open, setOpen] = useState(false);
    const [deleting, setDeleting] = useState<Coupon | null>(null);
    const [approving, setApproving] = useState<Coupon | null>(null);
    const [rejecting, setRejecting] = useState<Coupon | null>(null);
    const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Server-side patient search state
    const [patientSearchQuery, setPatientSearchQuery] = useState('');
    const [patientSearchResults, setPatientSearchResults] = useState<
        PatientOption[]
    >([]);
    const [patientSearchOpen, setPatientSearchOpen] = useState(false);
    const [patientSearchLoading, setPatientSearchLoading] = useState(false);
    const [patientSearchError, setPatientSearchError] = useState<string | null>(
        null,
    );
    const patientSearchInputRef = useRef<HTMLInputElement>(null);
    const patientSearchContainerRef = useRef<HTMLDivElement>(null);
    const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const patientSearchAbortRef = useRef<AbortController | null>(null);

    // Debounced search for patients using fetch to avoid Inertia JSON response error
    const searchPatients = useCallback(
        (query: string) => {
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current);
            }

            patientSearchAbortRef.current?.abort();

            if (!query.trim()) {
                setPatientSearchResults([]);
                setPatientSearchError(null);
                setPatientSearchLoading(false);
                return;
            }

            setPatientSearchError(null);
            setPatientSearchLoading(true);
            debounceTimerRef.current = setTimeout(async () => {
                const controller = new AbortController();
                patientSearchAbortRef.current = controller;

                try {
                    const url = CouponController.searchPatients.url(
                        team ?? '',
                        { query: { q: query } },
                    );
                    const response = await fetch(url, {
                        headers: {
                            'X-Requested-With': 'XMLHttpRequest',
                        },
                        signal: controller.signal,
                    });

                    if (!response.ok) {
                        throw new Error('Patient search failed.');
                    }

                    setPatientSearchResults(
                        (await response.json()) as PatientOption[],
                    );
                } catch (searchError) {
                    if (
                        searchError instanceof DOMException &&
                        searchError.name === 'AbortError'
                    ) {
                        return;
                    }

                    setPatientSearchResults([]);
                    setPatientSearchError('Unable to search patients.');
                } finally {
                    if (patientSearchAbortRef.current === controller) {
                        setPatientSearchLoading(false);
                    }
                }
            }, 300);
        },
        [team],
    );

    // Close dropdown on outside click
    useEffect(() => {
        if (!patientSearchOpen) {
            return;
        }

        const handleClick = (event: MouseEvent) => {
            if (
                patientSearchContainerRef.current &&
                !patientSearchContainerRef.current.contains(
                    event.target as Node,
                )
            ) {
                setPatientSearchOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, [patientSearchOpen]);

    // Cleanup debounce timer and in-flight patient searches
    useEffect(() => {
        return () => {
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current);
            }
            patientSearchAbortRef.current?.abort();
        };
    }, []);
    const visit = (patch: Partial<Filters>) =>
        router.get(
            couponsIndex.url(team ?? '', { query: { ...filters, ...patch } }),
            {},
            { preserveState: true, preserveScroll: true, replace: true },
        );
    const handleApprove = (coupon: Coupon) => {
        setError(null);
        setApproving(coupon);
    };
    const handleReject = (coupon: Coupon) => {
        setError(null);
        setRejecting(coupon);
    };
    const openCreate = () => {
        setEditing(null);
        setForm({
            ...emptyForm,
            code: Math.random().toString(36).slice(2, 10).toUpperCase(),
        });
        setError(null);
        setPatientSearchQuery('');
        setPatientSearchResults([]);
        setPatientSearchError(null);
        setOpen(true);
    };
    const openEdit = (coupon: Coupon) => {
        setEditing(coupon);
        setError(null);
        setForm({
            patient_id: coupon.patientId,
            code: coupon.code,
            type: coupon.type,
            value: String(coupon.value),
            max_uses: coupon.maxUses === null ? '' : String(coupon.maxUses),
            used_count: String(coupon.usedCount),
            min_billing_amount: String(coupon.minBillingAmount),
            max_discount_amount:
                coupon.maxDiscountAmount === null
                    ? ''
                    : String(coupon.maxDiscountAmount),
            expires_at: coupon.expiresAt?.slice(0, 16) ?? '',
            is_active: coupon.isActive,
            fund_type: coupon.fundType ?? '',
        });
        setPatientSearchQuery('');
        setPatientSearchResults([
            {
                slug: coupon.patientId,
                label: coupon.patientName ?? coupon.patientId,
            },
        ]);
        setPatientSearchError(null);
        setOpen(true);
    };
    const submit = (event: React.FormEvent) => {
        event.preventDefault();
        setProcessing(true);
        setError(null);

        const payload = {
            ...form,
            max_uses: form.max_uses || null,
            max_discount_amount: form.max_discount_amount || null,
            expires_at: form.expires_at || null,
            fund_type: form.fund_type || null,
        };
        const options = {
            preserveScroll: true,
            onSuccess: () => setOpen(false),
            onError: (errors: Record<string, string>) =>
                setError(Object.values(errors)[0] ?? 'Unable to save coupon.'),
            onFinish: () => setProcessing(false),
        };

        if (editing) {
            router.patch(
                couponsUpdate.url({
                    current_team: team ?? '',
                    coupon: editing.id,
                }),
                payload,
                options,
            );
        } else {
            router.post(couponsStore.url(team ?? ''), payload, options);
        }
    };
    const approveCoupon = () => {
        if (!approving) {
            return;
        }

        setProcessing(true);
        setError(null);
        router.patch(
            couponsApprove.url({
                current_team: team ?? '',
                coupon: approving.id,
            }),
            {},
            {
                preserveScroll: true,
                onSuccess: () => setApproving(null),
                onError: (errors: Record<string, string>) =>
                    setError(
                        Object.values(errors)[0] ?? 'Unable to approve coupon.',
                    ),
                onFinish: () => setProcessing(false),
            },
        );
    };
    const rejectCoupon = () => {
        if (!rejecting) {
            return;
        }

        setProcessing(true);
        setError(null);
        router.patch(
            couponsReject.url({
                current_team: team ?? '',
                coupon: rejecting.id,
            }),
            {},
            {
                preserveScroll: true,
                onSuccess: () => setRejecting(null),
                onError: (errors: Record<string, string>) =>
                    setError(
                        Object.values(errors)[0] ?? 'Unable to reject coupon.',
                    ),
                onFinish: () => setProcessing(false),
            },
        );
    };
    const remove = () => {
        if (!deleting) {
            return;
        }

        setProcessing(true);
        setError(null);
        router.delete(
            couponsDestroy.url({
                current_team: team ?? '',
                coupon: deleting.id,
            }),
            {
                preserveScroll: true,
                onSuccess: () => setDeleting(null),
                onError: (errors: Record<string, string>) =>
                    setError(
                        Object.values(errors)[0] ?? 'Unable to delete coupon.',
                    ),
                onFinish: () => setProcessing(false),
            },
        );
    };
    const bulkRemove = () => {
        setProcessing(true);
        setError(null);
        router.delete(couponsBulkDestroy.url(team ?? ''), {
            data: { ids: selected },
            preserveScroll: true,
            onSuccess: () => {
                setSelected([]);
                setBulkDeleteOpen(false);
            },
            onError: (errors: Record<string, string>) =>
                setError(
                    Object.values(errors)[0] ?? 'Unable to delete coupons.',
                ),
            onFinish: () => setProcessing(false),
        });
    };
    const selectPatient = (option: PatientOption) => {
        setForm((current) => ({ ...current, patient_id: option.slug }));
        setPatientSearchQuery('');
        setPatientSearchResults([]);
        setPatientSearchOpen(false);
    };
    return (
        <>
            <Head title="Coupons" />
            <div className="flex w-full flex-col space-y-6">
                {error ? (
                    <AlertError errors={[error]} title="Request failed" />
                ) : null}
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <Heading
                        variant="small"
                        title="Coupons"
                        description="Manage patient discounts and usage limits."
                    />
                    <Button onClick={openCreate} disabled={processing}>
                        New coupon
                    </Button>
                </div>
                <div className="grid gap-3 sm:grid-cols-5">
                    <SummaryCard
                        label="Pending"
                        value={summary.pending}
                        variant="yellow"
                    />
                    <SummaryCard
                        label="Approved"
                        value={summary.approved}
                        variant="green"
                    />
                    <SummaryCard
                        label="Rejected"
                        value={summary.rejected}
                        variant="red"
                    />
                    <SummaryCard
                        label="Total Used"
                        value={summary.totalUsed}
                        variant="blue"
                    />
                    <SummaryCard
                        label="Total Discounts"
                        value={summary.totalDiscounts}
                        variant="purple"
                        prefix="₦"
                    />
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <form
                        className="flex flex-1 items-center gap-2"
                        onSubmit={(e) => {
                            e.preventDefault();
                            visit({ q: search, status: statusFilter, page: 1 });
                        }}
                    >
                        <Input
                            aria-label="Search coupons"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search code or patient"
                            className="min-w-0 flex-1 sm:max-w-sm"
                            disabled={processing}
                        />
                        <Select
                            value={statusFilter}
                            onValueChange={(v) => setStatusFilter(v)}
                        >
                            <SelectTrigger
                                aria-label="Filter by status"
                                className="w-40"
                            >
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">
                                    All statuses
                                </SelectItem>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="approved">
                                    Approved
                                </SelectItem>
                                <SelectItem value="rejected">
                                    Rejected
                                </SelectItem>
                            </SelectContent>
                        </Select>
                        <Button type="submit" disabled={processing}>
                            Apply
                        </Button>
                    </form>
                    {selected.length > 0 && (
                        <Button
                            variant="destructive"
                            disabled={processing}
                            onClick={() => {
                                setError(null);
                                setBulkDeleteOpen(true);
                            }}
                        >
                            Delete selected ({selected.length})
                        </Button>
                    )}
                </div>
                <Card>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>
                                            <input
                                                aria-label="Select all coupons on this page"
                                                type="checkbox"
                                                disabled={processing}
                                                checked={
                                                    coupons.data.length > 0 &&
                                                    coupons.data.every((c) =>
                                                        selected.includes(c.id),
                                                    )
                                                }
                                                onChange={(e) =>
                                                    setSelected(
                                                        e.target.checked
                                                            ? coupons.data.map(
                                                                  (c) => c.id,
                                                              )
                                                            : [],
                                                    )
                                                }
                                            />
                                        </TableHead>
                                        <TableHead>Patient</TableHead>
                                        <TableHead>Code</TableHead>
                                        <TableHead>Fund</TableHead>
                                        <TableHead>Discount</TableHead>
                                        <TableHead>Uses</TableHead>
                                        <TableHead>Used</TableHead>
                                        <TableHead>Balance</TableHead>
                                        <TableHead>Expires</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">
                                            Actions
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {coupons.data.length ? (
                                        coupons.data.map((c) => (
                                            <TableRow key={c.id}>
                                                <TableCell>
                                                    <input
                                                        aria-label={`Select ${c.code}`}
                                                        type="checkbox"
                                                        disabled={processing}
                                                        checked={selected.includes(
                                                            c.id,
                                                        )}
                                                        onChange={(e) =>
                                                            setSelected(
                                                                e.target.checked
                                                                    ? [
                                                                          ...selected,
                                                                          c.id,
                                                                      ]
                                                                    : selected.filter(
                                                                          (
                                                                              id,
                                                                          ) =>
                                                                              id !==
                                                                              c.id,
                                                                      ),
                                                            )
                                                        }
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    {c.patientName ??
                                                        c.patientId}
                                                </TableCell>
                                                <TableCell className="font-medium">
                                                    {c.code}
                                                </TableCell>
                                                <TableCell>
                                                    {c.fundType === 'mercy_fund'
                                                        ? 'Mercy Fund'
                                                        : c.fundType ===
                                                            'infant_formula'
                                                          ? 'Infant Formula'
                                                          : '-'}
                                                </TableCell>
                                                <TableCell>
                                                    {c.type === 'percentage'
                                                        ? `${c.value}%`
                                                        : `₦${c.value.toLocaleString()}`}
                                                </TableCell>
                                                <TableCell>
                                                    {c.usedCount} /{' '}
                                                    {c.maxUses ?? '∞'}
                                                </TableCell>
                                                <TableCell>
                                                    {c.type === 'fixed'
                                                        ? `₦${c.usedAmount.toLocaleString()}`
                                                        : '-'}
                                                </TableCell>
                                                <TableCell>
                                                    {c.type === 'fixed'
                                                        ? `₦${c.balance.toLocaleString()}`
                                                        : '-'}
                                                </TableCell>
                                                <TableCell>
                                                    {c.expiresAt
                                                        ? new Date(
                                                              c.expiresAt,
                                                          ).toLocaleDateString()
                                                        : 'Never'}
                                                </TableCell>
                                                <TableCell>
                                                    <span
                                                        className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                                                            c.status ===
                                                            'approved'
                                                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300'
                                                                : c.status ===
                                                                    'rejected'
                                                                  ? 'bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300'
                                                                  : 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300'
                                                        }`}
                                                    >
                                                        {c.status === 'approved'
                                                            ? 'Approved'
                                                            : c.status ===
                                                                'rejected'
                                                              ? 'Rejected'
                                                              : 'Pending'}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger
                                                            asChild
                                                        >
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                aria-label={`Actions for coupon ${c.code}`}
                                                                disabled={
                                                                    processing
                                                                }
                                                            >
                                                                <MoreHorizontal className="size-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            {c.status ===
                                                                'pending' && (
                                                                <>
                                                                    <DropdownMenuItem
                                                                        onClick={() =>
                                                                            handleApprove(
                                                                                c,
                                                                            )
                                                                        }
                                                                    >
                                                                        <Check className="mr-2 h-4 w-4" />
                                                                        Approve
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuItem
                                                                        onClick={() =>
                                                                            handleReject(
                                                                                c,
                                                                            )
                                                                        }
                                                                    >
                                                                        <X className="mr-2 h-4 w-4" />
                                                                        Reject
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuSeparator />
                                                                </>
                                                            )}
                                                            <DropdownMenuItem
                                                                onClick={() =>
                                                                    openEdit(c)
                                                                }
                                                            >
                                                                <Pencil className="mr-2 h-4 w-4" />
                                                                Edit
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem
                                                                onClick={() =>
                                                                    setDeleting(
                                                                        c,
                                                                    )
                                                                }
                                                            >
                                                                <Trash2 className="mr-2 h-4 w-4" />
                                                                Delete
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell
                                                colSpan={11}
                                                className="py-10 text-center text-muted-foreground"
                                            >
                                                No coupons found.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                                <TableFooter>
                                    <TableRow>
                                        <TableCell
                                            colSpan={5}
                                            className="font-medium"
                                        >
                                            Total
                                        </TableCell>
                                        <TableCell className="font-medium">
                                            ₦
                                            {coupons.data
                                                .reduce(
                                                    (sum, c) =>
                                                        sum + c.usedAmount,
                                                    0,
                                                )
                                                .toLocaleString()}
                                        </TableCell>
                                        <TableCell className="font-medium">
                                            ₦
                                            {coupons.data
                                                .reduce(
                                                    (sum, c) => sum + c.balance,
                                                    0,
                                                )
                                                .toLocaleString()}
                                        </TableCell>
                                        <TableCell colSpan={4}></TableCell>
                                    </TableRow>
                                </TableFooter>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
                <Pagination
                    meta={{
                        currentPage: coupons.current_page,
                        lastPage: coupons.last_page,
                        perPage: coupons.per_page,
                        total: coupons.total,
                    }}
                    onPageChange={(page) => visit({ page })}
                    onPerPageChange={(perPage) => visit({ perPage, page: 1 })}
                />
            </div>
            {open && (
                <div
                    className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby={formDialogLabelId}
                >
                    <form
                        onSubmit={submit}
                        className="max-h-[90vh] w-full max-w-xl space-y-4 overflow-y-auto rounded-lg bg-background p-6 shadow-xl"
                    >
                        <div>
                            <h2
                                id={formDialogLabelId}
                                className="text-lg font-semibold"
                            >
                                {editing ? 'Edit coupon' : 'New coupon'}
                            </h2>
                            <p className="text-sm text-muted-foreground">
                                Configure eligibility, discount, and usage.
                            </p>
                        </div>
                        <div className="grid gap-3 sm:grid-cols-2">
                            <div
                                className="space-y-1"
                                ref={patientSearchContainerRef}
                            >
                                <Label htmlFor="coupon-patient-search">
                                    Patient
                                </Label>
                                <div className="relative">
                                    <Input
                                        id="coupon-patient-search"
                                        ref={patientSearchInputRef}
                                        role="combobox"
                                        aria-expanded={patientSearchOpen}
                                        aria-controls="coupon-patient-options"
                                        aria-autocomplete="list"
                                        autoComplete="off"
                                        placeholder="Search patient by name, code, or phone…"
                                        value={
                                            form.patient_id
                                                ? (patientSearchResults.find(
                                                      (p) =>
                                                          p.slug ===
                                                          form.patient_id,
                                                  )?.label ?? form.patient_id)
                                                : patientSearchQuery
                                        }
                                        readOnly={!!form.patient_id}
                                        disabled={processing}
                                        onClick={() => {
                                            if (!form.patient_id) {
                                                setPatientSearchOpen(true);
                                            }
                                        }}
                                        onKeyDown={(event) => {
                                            if (event.key === 'Escape') {
                                                setPatientSearchOpen(false);
                                            } else if (
                                                event.key === 'ArrowDown' &&
                                                patientSearchResults.length > 0
                                            ) {
                                                event.preventDefault();
                                                document
                                                    .getElementById(
                                                        'coupon-patient-option-0',
                                                    )
                                                    ?.focus();
                                            } else if (
                                                event.key === 'Enter' &&
                                                patientSearchResults.length ===
                                                    1
                                            ) {
                                                event.preventDefault();
                                                selectPatient(
                                                    patientSearchResults[0],
                                                );
                                            }
                                        }}
                                        onChange={(event) => {
                                            const value = event.target.value;
                                            setForm({
                                                ...form,
                                                patient_id: '',
                                            });
                                            setPatientSearchQuery(value);
                                            searchPatients(value);
                                            setPatientSearchOpen(true);
                                        }}
                                    />
                                    {patientSearchOpen && !form.patient_id && (
                                        <div
                                            id="coupon-patient-options"
                                            role="listbox"
                                            className="absolute right-0 left-0 z-50 mt-1 max-h-60 overflow-auto rounded-md border bg-popover shadow-lg"
                                        >
                                            {patientSearchLoading && (
                                                <div className="px-3 py-2 text-xs text-muted-foreground">
                                                    Searching…
                                                </div>
                                            )}
                                            {patientSearchError ? (
                                                <p
                                                    className="px-3 py-2 text-xs text-destructive"
                                                    role="alert"
                                                >
                                                    {patientSearchError}
                                                </p>
                                            ) : null}
                                            {!patientSearchLoading &&
                                                !patientSearchError &&
                                                patientSearchResults.length ===
                                                    0 &&
                                                patientSearchQuery.trim() && (
                                                    <div className="px-3 py-2 text-xs text-muted-foreground">
                                                        No patients found
                                                    </div>
                                                )}
                                            {patientSearchResults.map(
                                                (option, optionIndex) => (
                                                    <button
                                                        id={`coupon-patient-option-${optionIndex}`}
                                                        key={option.slug}
                                                        type="button"
                                                        role="option"
                                                        aria-selected={
                                                            form.patient_id ===
                                                            option.slug
                                                        }
                                                        className="w-full px-3 py-2 text-left text-sm outline-none hover:bg-accent focus-visible:bg-accent"
                                                        onClick={() =>
                                                            selectPatient(
                                                                option,
                                                            )
                                                        }
                                                    >
                                                        {option.label}
                                                    </button>
                                                ),
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="coupon-code">Code</Label>
                                <Input
                                    id="coupon-code"
                                    required
                                    disabled={processing}
                                    value={form.code}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            code: e.target.value.toUpperCase(),
                                        })
                                    }
                                />
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="coupon-discount-type">
                                    Discount type
                                </Label>
                                <Select
                                    value={form.type}
                                    onValueChange={(v) =>
                                        setForm({
                                            ...form,
                                            type: v as Form['type'],
                                        })
                                    }
                                >
                                    <SelectTrigger
                                        id="coupon-discount-type"
                                        aria-label="Discount type"
                                        disabled={processing}
                                    >
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="fixed">
                                            Fixed amount
                                        </SelectItem>
                                        <SelectItem value="percentage">
                                            Percentage
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <Field
                                label="Value"
                                disabled={processing}
                                value={form.value}
                                onChange={(value) =>
                                    setForm({ ...form, value })
                                }
                                type="number"
                                min="0.01"
                                step="0.01"
                                required
                            />
                            <Field
                                label="Maximum uses (blank = unlimited)"
                                disabled={processing}
                                value={form.max_uses}
                                onChange={(max_uses) =>
                                    setForm({ ...form, max_uses })
                                }
                                type="number"
                                min="1"
                            />
                            <Field
                                label="Minimum bill amount"
                                disabled={processing}
                                value={form.min_billing_amount}
                                onChange={(min_billing_amount) =>
                                    setForm({ ...form, min_billing_amount })
                                }
                                type="number"
                                min="0"
                                step="0.01"
                                required
                            />
                            {form.type === 'percentage' && (
                                <Field
                                    label="Maximum discount cap"
                                    disabled={processing}
                                    value={form.max_discount_amount}
                                    onChange={(max_discount_amount) =>
                                        setForm({
                                            ...form,
                                            max_discount_amount,
                                        })
                                    }
                                    type="number"
                                    min="0"
                                    step="0.01"
                                />
                            )}
                            <Field
                                label="Expires at"
                                disabled={processing}
                                value={form.expires_at}
                                onChange={(expires_at) =>
                                    setForm({ ...form, expires_at })
                                }
                                type="datetime-local"
                            />
                            <div className="space-y-1">
                                <Label htmlFor="coupon-fund-type">
                                    Fund type
                                </Label>
                                <Select
                                    value={form.fund_type}
                                    onValueChange={(v) =>
                                        setForm({
                                            ...form,
                                            fund_type: v as Form['fund_type'],
                                        })
                                    }
                                >
                                    <SelectTrigger
                                        id="coupon-fund-type"
                                        aria-label="Fund type"
                                        disabled={processing}
                                    >
                                        <SelectValue placeholder="Select fund type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="mercy_fund">
                                            Mercy Fund
                                        </SelectItem>
                                        <SelectItem value="infant_formula">
                                            Infant Formula
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <label
                                htmlFor="coupon-is-active"
                                className="flex items-center gap-2 text-sm"
                            >
                                <input
                                    id="coupon-is-active"
                                    type="checkbox"
                                    disabled={processing}
                                    checked={form.is_active}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            is_active: e.target.checked,
                                        })
                                    }
                                />
                                Active
                            </label>
                        </div>
                        <div className="flex justify-end gap-2">
                            <Button
                                type="button"
                                variant="secondary"
                                disabled={processing}
                                onClick={() => setOpen(false)}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={processing}>
                                {processing ? 'Saving...' : 'Save coupon'}
                            </Button>
                        </div>
                    </form>
                </div>
            )}
            <ConfirmDialog
                open={deleting !== null}
                onOpenChange={(open) => {
                    if (!open && !processing) setDeleting(null);
                }}
                title={`Delete ${deleting?.code ?? 'coupon'}?`}
                description={error ?? 'The coupon will no longer be available.'}
                confirmLabel="Delete"
                destructive
                processing={processing}
                onConfirm={remove}
            />
            <ConfirmDialog
                open={approving !== null}
                onOpenChange={(open) => {
                    if (!open && !processing) setApproving(null);
                }}
                title={`Approve ${approving?.code ?? 'coupon'}?`}
                description={
                    error ?? 'This coupon will become available to patients.'
                }
                confirmLabel="Approve"
                processing={processing}
                onConfirm={approveCoupon}
            />
            <ConfirmDialog
                open={rejecting !== null}
                onOpenChange={(open) => {
                    if (!open && !processing) setRejecting(null);
                }}
                title={`Reject ${rejecting?.code ?? 'coupon'}?`}
                description={
                    error ??
                    'This coupon will no longer be available for approval.'
                }
                confirmLabel="Reject"
                destructive
                processing={processing}
                onConfirm={rejectCoupon}
            />
            <ConfirmDialog
                open={bulkDeleteOpen}
                onOpenChange={(open) => {
                    if (!open && !processing) setBulkDeleteOpen(false);
                }}
                title={`Delete ${selected.length} coupon${selected.length === 1 ? '' : 's'}?`}
                description={
                    error ?? 'The selected coupons will no longer be available.'
                }
                confirmLabel="Delete"
                destructive
                processing={processing}
                onConfirm={bulkRemove}
            />
        </>
    );
}

function Field({
    label,
    value,
    onChange,
    ...props
}: { label: string; value: string; onChange: (value: string) => void } & Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    'value' | 'onChange'
>) {
    const id = useId();

    return (
        <div className="space-y-1">
            <Label htmlFor={id}>{label}</Label>
            <Input
                id={id}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                {...props}
            />
        </div>
    );
}

function SummaryCard({
    label,
    value,
    variant,
    prefix,
}: {
    label: string;
    value: number;
    variant: 'yellow' | 'green' | 'red' | 'blue' | 'purple';
    prefix?: string;
}) {
    const colors = {
        yellow: 'border-amber-200 bg-amber-50 dark:border-amber-500/30 dark:bg-amber-500/10',
        green: 'border-emerald-200 bg-emerald-50 dark:border-emerald-500/30 dark:bg-emerald-500/10',
        red: 'border-rose-200 bg-rose-50 dark:border-rose-500/30 dark:bg-rose-500/10',
        blue: 'border-sky-200 bg-sky-50 dark:border-sky-500/30 dark:bg-sky-500/10',
        purple: 'border-violet-200 bg-violet-50 dark:border-violet-500/30 dark:bg-violet-500/10',
    };

    return (
        <div className={`rounded-lg border p-4 ${colors[variant]}`}>
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="mt-1 text-2xl font-semibold">
                {prefix ?? ''}
                {value.toLocaleString()}
            </p>
        </div>
    );
}
