import { Head, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import ConfirmDialog from '@/components/confirm-dialog';
import Heading from '@/components/heading';
import Pagination from '@/components/pagination';
import { Button } from '@/components/ui/button';
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

type PatientOption = { slug: string; fullName: string };
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
    patients,
    filters,
    summary,
}: {
    coupons: Paginator;
    patients: PatientOption[];
    filters: Filters;
    summary: { pending: number; approved: number; rejected: number; totalUsed: number; totalDiscounts: number };
}) {
    const { currentTeam } = usePage().props;
    const [search, setSearch] = useState(filters.q);
    const [statusFilter, setStatusFilter] = useState(filters.status);
    const [form, setForm] = useState<Form>(emptyForm);
    const [editing, setEditing] = useState<Coupon | null>(null);
    const [selected, setSelected] = useState<number[]>([]);
    const [open, setOpen] = useState(false);
    const [deleting, setDeleting] = useState<Coupon | null>(null);
    const [approving, setApproving] = useState<Coupon | null>(null);
    const [rejecting, setRejecting] = useState<Coupon | null>(null);
    const team = currentTeam?.slug;
    const visit = (patch: Partial<Filters>) =>
        router.get(
            couponsIndex.url(team ?? '', { query: { ...filters, ...patch } }),
            {},
            { preserveState: true, preserveScroll: true, replace: true },
        );
    const handleApprove = (coupon: Coupon) => {
        setApproving(coupon);
        router.patch(
            couponsApprove.url({ current_team: team ?? '', coupon: coupon.id }),
            {},
            { preserveScroll: true, onFinish: () => setApproving(null) },
        );
    };
    const handleReject = (coupon: Coupon) => {
        setRejecting(coupon);
        router.patch(
            couponsReject.url({ current_team: team ?? '', coupon: coupon.id }),
            {},
            { preserveScroll: true, onFinish: () => setRejecting(null) },
        );
    };
    const openCreate = () => {
        setEditing(null);
        setForm({
            ...emptyForm,
            code: Math.random().toString(36).slice(2, 10).toUpperCase(),
        });
        setOpen(true);
    };
    const openEdit = (coupon: Coupon) => {
        setEditing(coupon);
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
        setOpen(true);
    };
    const submit = (event: React.FormEvent) => {
        event.preventDefault();
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
        };
        editing
            ? router.patch(
                  couponsUpdate.url({
                      current_team: team ?? '',
                      coupon: editing.id,
                  }),
                  payload,
                  options,
              )
            : router.post(couponsStore.url(team ?? ''), payload, options);
    };
    const remove = () => {
        if (deleting)
            router.delete(
                couponsDestroy.url({
                    current_team: team ?? '',
                    coupon: deleting.id,
                }),
                {
                    preserveScroll: true,
                    onFinish: () => setDeleting(null),
                },
            );
    };
    const bulkRemove = () =>
        router.delete(couponsBulkDestroy.url(team ?? ''), {
            data: { ids: selected },
            preserveScroll: true,
            onSuccess: () => setSelected([]),
        });
    return (
        <>
            <Head title="Coupons" />
            <div className="flex w-full flex-col space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <Heading
                        variant="small"
                        title="Coupons"
                        description="Manage patient discounts and usage limits."
                    />
                    <Button onClick={openCreate}>New coupon</Button>
                </div>
                <div className="grid gap-3 sm:grid-cols-5">
                    <SummaryCard label="Pending" value={summary.pending} variant="yellow" />
                    <SummaryCard label="Approved" value={summary.approved} variant="green" />
                    <SummaryCard label="Rejected" value={summary.rejected} variant="red" />
                    <SummaryCard label="Total Used" value={summary.totalUsed} variant="blue" />
                    <SummaryCard
                        label="Total Discounts"
                        value={summary.totalDiscounts}
                        variant="purple"
                        prefix="₦"
                    />
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <form
                        className="flex gap-2"
                        onSubmit={(e) => {
                            e.preventDefault();
                            visit({ q: search, status: statusFilter, page: 1 });
                        }}
                    >
                        <Input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search code or patient"
                            className="w-72"
                        />
                        <Select
                            value={statusFilter}
                            onValueChange={(v) => setStatusFilter(v)}
                        >
                            <SelectTrigger className="w-40">
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All statuses</SelectItem>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="approved">Approved</SelectItem>
                                <SelectItem value="rejected">Rejected</SelectItem>
                            </SelectContent>
                        </Select>
                        <Button type="submit" variant="secondary">
                            Search
                        </Button>
                    </form>
                    {selected.length > 0 && (
                        <Button variant="destructive" onClick={bulkRemove}>
                            Delete selected ({selected.length})
                        </Button>
                    )}
                </div>
                <div className="rounded-lg border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>
                                    <input
                                        aria-label="Select all"
                                        type="checkbox"
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
                                                                  (id) =>
                                                                      id !==
                                                                      c.id,
                                                              ),
                                                    )
                                                }
                                            />
                                        </TableCell>
                                        <TableCell>
                                            {c.patientName ?? c.patientId}
                                        </TableCell>
                                        <TableCell className="font-medium">
                                            {c.code}
                                        </TableCell>
                                        <TableCell>
                                            {c.fundType === 'mercy_fund'
                                                ? 'Mercy Fund'
                                                : c.fundType === 'infant_formula'
                                                    ? 'Infant Formula'
                                                    : '-'}
                                        </TableCell>
                                        <TableCell>
                                            {c.type === 'percentage'
                                                ? `${c.value}%`
                                                : `₦${c.value.toLocaleString()}`}
                                        </TableCell>
                                        <TableCell>
                                            {c.usedCount} / {c.maxUses ?? '∞'}
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
                                            <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                                                c.status === 'approved'
                                                    ? 'bg-green-100 text-green-700'
                                                    : c.status === 'rejected'
                                                        ? 'bg-red-100 text-red-700'
                                                        : 'bg-yellow-100 text-yellow-700'
                                            }`}>
                                                {c.status === 'approved' ? 'Approved' : c.status === 'rejected' ? 'Rejected' : 'Pending'}
                                            </span>
                                        </TableCell>
                                        <TableCell className="space-x-1 text-right">
                                            {c.status === 'pending' && (
                                                <>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleApprove(c)}
                                                    >
                                                        Approve
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleReject(c)}
                                                    >
                                                        Reject
                                                    </Button>
                                                </>
                                            )}
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => openEdit(c)}
                                            >
                                                Edit
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => setDeleting(c)}
                                            >
                                                Delete
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell
                                        colSpan={12}
                                        className="py-10 text-center text-muted-foreground"
                                    >
                                        No coupons found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                        <TableFooter>
                            <TableRow>
                                <TableCell colSpan={5} className="font-medium">
                                    Total
                                </TableCell>
                                <TableCell className="font-medium">
                                    ₦{coupons.data.reduce((sum, c) => sum + c.usedAmount, 0).toLocaleString()}
                                </TableCell>
                                <TableCell className="font-medium">
                                    ₦{coupons.data.reduce((sum, c) => sum + c.balance, 0).toLocaleString()}
                                </TableCell>
                                <TableCell colSpan={4}></TableCell>
                            </TableRow>
                        </TableFooter>
                    </Table>
                </div>
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
                >
                    <form
                        onSubmit={submit}
                        className="max-h-[90vh] w-full max-w-xl space-y-4 overflow-y-auto rounded-lg bg-background p-6 shadow-xl"
                    >
                        <div>
                            <h2 className="text-lg font-semibold">
                                {editing ? 'Edit coupon' : 'New coupon'}
                            </h2>
                            <p className="text-sm text-muted-foreground">
                                Configure eligibility, discount, and usage.
                            </p>
                        </div>
                        <div className="grid gap-3 sm:grid-cols-2">
                            <div className="space-y-1">
                                <Label>Patient</Label>
                                <Select
                                    value={form.patient_id}
                                    onValueChange={(v) =>
                                        setForm({ ...form, patient_id: v })
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select patient" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {patients.map((p) => (
                                            <SelectItem
                                                key={p.slug}
                                                value={p.slug}
                                            >
                                                {p.slug} — {p.fullName}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-1">
                                <Label>Code</Label>
                                <Input
                                    required
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
                                <Label>Discount type</Label>
                                <Select
                                    value={form.type}
                                    onValueChange={(v) =>
                                        setForm({
                                            ...form,
                                            type: v as Form['type'],
                                        })
                                    }
                                >
                                    <SelectTrigger>
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
                                value={form.max_uses}
                                onChange={(max_uses) =>
                                    setForm({ ...form, max_uses })
                                }
                                type="number"
                                min="1"
                            />
                            <Field
                                label="Minimum bill amount"
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
                                value={form.expires_at}
                                onChange={(expires_at) =>
                                    setForm({ ...form, expires_at })
                                }
                                type="datetime-local"
                            />
                            <div className="space-y-1">
                                <Label>Fund type</Label>
                                <Select
                                    value={form.fund_type}
                                    onValueChange={(v) =>
                                        setForm({
                                            ...form,
                                            fund_type: v as Form['fund_type'],
                                        })
                                    }
                                >
                                    <SelectTrigger>
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
                            <label className="flex items-center gap-2 text-sm">
                                <input
                                    type="checkbox"
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
                                onClick={() => setOpen(false)}
                            >
                                Cancel
                            </Button>
                            <Button type="submit">Save coupon</Button>
                        </div>
                    </form>
                </div>
            )}
            <ConfirmDialog
                open={deleting !== null}
                onOpenChange={(open) => {
                    if (!open) setDeleting(null);
                }}
                destructive
                title={`Delete ${deleting?.code ?? 'coupon'}?`}
                description="The coupon will no longer be available."
                confirmLabel="Delete"
                onConfirm={remove}
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
    return (
        <div className="space-y-1">
            <Label>{label}</Label>
            <Input
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
        yellow: 'border-yellow-200 bg-yellow-50',
        green: 'border-green-200 bg-green-50',
        red: 'border-red-200 bg-red-50',
        blue: 'border-blue-200 bg-blue-50',
        purple: 'border-purple-200 bg-purple-50',
    };

    return (
        <div className={`rounded-lg border p-4 ${colors[variant]}`}>
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="mt-1 text-2xl font-semibold">
                {prefix ?? ''}{value.toLocaleString()}
            </p>
        </div>
    );
}
