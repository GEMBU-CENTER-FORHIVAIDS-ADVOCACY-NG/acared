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
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { destroy, index, store, update } from '@/routes/finance/wallet-history';
import { destroy as bulkDestroy } from '@/routes/finance/wallet-history/bulk';

type Patient = { slug: string; fullName: string; wallet: number };
type Method = { id: number; name: string };
type History = {
    id: number;
    patientId: string;
    patientName: string | null;
    patientWallet: number;
    userName: string | null;
    methodName: string | null;
    billableType: string;
    teamName: string | null;
    teamAddress: string | null;
    lines: {
        name: string | null;
        quantity: number;
        unitPrice: number;
        subtotal: number;
    }[];
    credit: number;
    debit: number;
    balance: number;
    createdAt: string | null;
};
type Paginator = {
    data: History[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
};
type Filters = {
    q: string;
    from: string | null;
    to: string | null;
    perPage: number;
    page?: number;
};
type Form = {
    patient_id: string;
    method_id: string;
    credit: string;
    debit: string;
};
const emptyForm: Form = {
    patient_id: '',
    method_id: '',
    credit: '',
    debit: '',
};

export default function WalletHistoryIndex({
    histories,
    patients,
    methods,
    filters,
}: {
    histories: Paginator;
    patients: Patient[];
    methods: Method[];
    filters: Filters;
}) {
    const team = usePage().props.currentTeam?.slug ?? '';
    const [search, setSearch] = useState(filters.q);
    const [form, setForm] = useState<Form>(emptyForm);
    const [editing, setEditing] = useState<History | null>(null);
    const [deleting, setDeleting] = useState<History | null>(null);
    const [selected, setSelected] = useState<number[]>([]);
    const [open, setOpen] = useState(false);
    const [viewing, setViewing] = useState<History | null>(null);
    const visit = (patch: Partial<Filters>) =>
        router.get(
            index.url(team, { query: { ...filters, ...patch } }),
            {},
            { preserveState: true, preserveScroll: true, replace: true },
        );
    const selectedMethod = methods.find(
        (method) => String(method.id) === form.method_id,
    );
    const isWalletMethod = selectedMethod?.name === 'Wallet';
    const patientBalance =
        patients.find((patient) => patient.slug === form.patient_id)?.wallet ??
        0;
    const startCreate = () => {
        setEditing(null);
        setForm(emptyForm);
        setOpen(true);
    };
    const startEdit = (history: History) => {
        setEditing(history);
        setForm({
            patient_id: history.patientId,
            method_id: String(
                methods.find((method) => method.name === history.methodName)
                    ?.id ?? '',
            ),
            credit: history.credit > 0 ? String(history.credit) : '',
            debit: history.debit > 0 ? String(history.debit) : '',
        });
        setOpen(true);
    };
    const submit = (event: React.FormEvent) => {
        event.preventDefault();
        const payload = {
            ...form,
            credit: isWalletMethod ? '0' : form.credit || '0',
            debit: isWalletMethod ? form.debit : '0',
        };
        const options = {
            preserveScroll: true,
            onSuccess: () => setOpen(false),
        };
        editing
            ? router.patch(
                  update.url({
                      current_team: team,
                      wallet_history: editing.id,
                  }),
                  payload,
                  options,
              )
            : router.post(store.url(team), payload, options);
    };
    const remove = () => {
        if (deleting)
            router.delete(
                destroy.url({
                    current_team: team,
                    wallet_history: deleting.id,
                }),
                {
                    preserveScroll: true,
                    onFinish: () => setDeleting(null),
                },
            );
    };
    const removeSelected = () =>
        router.delete(bulkDestroy.url(team), {
            data: { ids: selected },
            preserveScroll: true,
            onSuccess: () => setSelected([]),
        });
    const printReceipt = () => {
        const cleanup = () =>
            document.body.classList.remove('printing-wallet-history');
        document.body.classList.add('printing-wallet-history');
        window.addEventListener('afterprint', cleanup, { once: true });
        window.print();
    };
    return (
        <>
            <Head title="Wallet history" />
            <div className="flex w-full flex-col space-y-6 p-4 md:p-6 lg:p-8">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <Heading
                        variant="small"
                        title="Wallet history"
                        description="Review deposits, withdrawals, payment methods, and patient balances."
                    />
                    <Button onClick={startCreate}>
                        New wallet transaction
                    </Button>
                </div>
                <div className="flex flex-wrap items-end gap-2">
                    <form
                        className="flex items-end gap-2"
                        onSubmit={(event) => {
                            event.preventDefault();
                            visit({ q: search, page: 1 });
                        }}
                    >
                        <div className="space-y-1">
                            <Label htmlFor="wallet-search">
                                Patient or user
                            </Label>
                            <Input
                                id="wallet-search"
                                value={search}
                                onChange={(event) =>
                                    setSearch(event.target.value)
                                }
                                placeholder="Search transactions"
                                className="w-56"
                            />
                        </div>
                        <Button type="submit" variant="secondary">
                            Search
                        </Button>
                    </form>
                    <div className="space-y-1">
                        <Label htmlFor="wallet-from">From</Label>
                        <Input
                            id="wallet-from"
                            type="date"
                            value={filters.from ?? ''}
                            onChange={(event) =>
                                visit({
                                    from: event.target.value || null,
                                    page: 1,
                                })
                            }
                        />
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="wallet-to">To</Label>
                        <Input
                            id="wallet-to"
                            type="date"
                            value={filters.to ?? ''}
                            onChange={(event) =>
                                visit({
                                    to: event.target.value || null,
                                    page: 1,
                                })
                            }
                        />
                    </div>
                    {selected.length > 0 && (
                        <Button variant="destructive" onClick={removeSelected}>
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
                                            histories.data.length > 0 &&
                                            histories.data.every((row) =>
                                                selected.includes(row.id),
                                            )
                                        }
                                        onChange={(event) =>
                                            setSelected(
                                                event.target.checked
                                                    ? histories.data.map(
                                                          (row) => row.id,
                                                      )
                                                    : [],
                                            )
                                        }
                                    />
                                </TableHead>
                                <TableHead>Hospital no.</TableHead>
                                <TableHead>Patient</TableHead>
                                <TableHead>User</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Method</TableHead>
                                <TableHead>Credit</TableHead>
                                <TableHead>Debit</TableHead>
                                <TableHead>Balance change</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead className="text-right">
                                    Actions
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {histories.data.length ? (
                                histories.data.map((row) => (
                                    <TableRow key={row.id}>
                                        <TableCell>
                                            <input
                                                aria-label={`Select transaction ${row.id}`}
                                                type="checkbox"
                                                checked={selected.includes(
                                                    row.id,
                                                )}
                                                onChange={(event) =>
                                                    setSelected(
                                                        event.target.checked
                                                            ? [
                                                                  ...selected,
                                                                  row.id,
                                                              ]
                                                            : selected.filter(
                                                                  (id) =>
                                                                      id !==
                                                                      row.id,
                                                              ),
                                                    )
                                                }
                                            />
                                        </TableCell>
                                        <TableCell>{row.patientId}</TableCell>
                                        <TableCell>
                                            {row.patientName ?? '—'}
                                        </TableCell>
                                        <TableCell>
                                            {row.userName ?? '—'}
                                        </TableCell>
                                        <TableCell>
                                            {row.billableType}
                                        </TableCell>
                                        <TableCell>
                                            {row.methodName ?? '—'}
                                        </TableCell>
                                        <TableCell>
                                            ₦{row.credit.toLocaleString()}
                                        </TableCell>
                                        <TableCell>
                                            ₦{row.debit.toLocaleString()}
                                        </TableCell>
                                        <TableCell
                                            className={
                                                row.balance < 0
                                                    ? 'font-semibold text-destructive'
                                                    : 'font-semibold text-emerald-600'
                                            }
                                        >
                                            ₦
                                            {Math.abs(
                                                row.balance,
                                            ).toLocaleString()}
                                        </TableCell>
                                        <TableCell>
                                            {row.createdAt
                                                ? new Date(
                                                      row.createdAt,
                                                  ).toLocaleString()
                                                : '—'}
                                        </TableCell>
                                        <TableCell className="space-x-1 text-right">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => setViewing(row)}
                                            >
                                                View
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => startEdit(row)}
                                            >
                                                Edit
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => setDeleting(row)}
                                            >
                                                Delete
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell
                                        colSpan={11}
                                        className="py-10 text-center text-muted-foreground"
                                    >
                                        No wallet transactions found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
                <Pagination
                    meta={{
                        currentPage: histories.current_page,
                        lastPage: histories.last_page,
                        perPage: histories.per_page,
                        total: histories.total,
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
                        className="w-full max-w-lg space-y-4 rounded-lg bg-background p-6 shadow-xl"
                    >
                        <div>
                            <h2 className="text-lg font-semibold">
                                {editing
                                    ? 'Edit wallet transaction'
                                    : 'New wallet transaction'}
                            </h2>
                            <p className="text-sm text-muted-foreground">
                                Wallet method records a withdrawal; other
                                methods deposit credit.
                            </p>
                        </div>
                        <div className="space-y-1">
                            <Label>Patient</Label>
                            <Select
                                value={form.patient_id}
                                onValueChange={(patient_id) =>
                                    setForm({ ...form, patient_id })
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select patient" />
                                </SelectTrigger>
                                <SelectContent>
                                    {patients.map((patient) => (
                                        <SelectItem
                                            key={patient.slug}
                                            value={patient.slug}
                                        >
                                            {patient.slug} — {patient.fullName}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        {form.patient_id && (
                            <p className="text-sm text-muted-foreground">
                                Current wallet: ₦
                                {patientBalance.toLocaleString()}
                            </p>
                        )}
                        <div className="space-y-1">
                            <Label>Method</Label>
                            <Select
                                value={form.method_id}
                                onValueChange={(method_id) =>
                                    setForm({
                                        ...form,
                                        method_id,
                                        credit: '',
                                        debit: '',
                                    })
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select method" />
                                </SelectTrigger>
                                <SelectContent>
                                    {methods.map((method) => (
                                        <SelectItem
                                            key={method.id}
                                            value={String(method.id)}
                                        >
                                            {method.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        {isWalletMethod ? (
                            <div className="space-y-1">
                                <Label>Withdrawal amount</Label>
                                <Input
                                    type="number"
                                    min="0.01"
                                    step="1"
                                    required
                                    value={form.debit}
                                    onChange={(event) =>
                                        setForm({
                                            ...form,
                                            debit: event.target.value,
                                        })
                                    }
                                />
                            </div>
                        ) : (
                            <div className="space-y-1">
                                <Label>Deposit amount</Label>
                                <Input
                                    type="number"
                                    min="0.01"
                                    step="1"
                                    required
                                    value={form.credit}
                                    onChange={(event) =>
                                        setForm({
                                            ...form,
                                            credit: event.target.value,
                                        })
                                    }
                                />
                            </div>
                        )}
                        <div className="flex justify-end gap-2">
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={() => setOpen(false)}
                            >
                                Cancel
                            </Button>
                            <Button type="submit">Save transaction</Button>
                        </div>
                    </form>
                </div>
            )}
            {viewing && (
                <div
                    className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4"
                    role="dialog"
                    aria-modal="true"
                >
                    <div className="wallet-history-receipt w-full max-w-md space-y-3 rounded-lg bg-background p-6 shadow-xl">
                        <div className="no-print flex items-center justify-between">
                            <h2 className="text-lg font-semibold">
                                Wallet transaction
                            </h2>
                            <Button
                                variant="ghost"
                                onClick={() => setViewing(null)}
                            >
                                Close
                            </Button>
                        </div>
                        <header className="text-center">
                            <h2 className="font-bold">
                                {viewing.teamName ?? 'Facility'}
                            </h2>
                            {viewing.teamAddress && (
                                <p className="text-xs">{viewing.teamAddress}</p>
                            )}
                            <p className="mt-2 font-semibold">
                                WALLET HISTORY RECEIPT
                            </p>
                        </header>
                        <div className="space-y-1 border-y py-2 text-sm">
                            <p>
                                <strong>Patient:</strong> {viewing.patientId} —{' '}
                                {viewing.patientName}
                            </p>
                            <p>
                                <strong>Date:</strong>{' '}
                                {viewing.createdAt
                                    ? new Date(
                                          viewing.createdAt,
                                      ).toLocaleString()
                                    : '—'}
                            </p>
                            <p>
                                <strong>Method:</strong>{' '}
                                {viewing.methodName ?? '—'}
                            </p>
                        </div>
                        {viewing.lines.length > 0 && (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b text-left">
                                            <th className="py-1">Item</th>
                                            <th className="py-1">Qty</th>
                                            <th className="py-1 text-right">
                                                Subtotal
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {viewing.lines.map(
                                            (line, lineIndex) => (
                                                <tr
                                                    key={lineIndex}
                                                    className="border-b"
                                                >
                                                    <td className="py-1">
                                                        {line.name ?? '—'}
                                                    </td>
                                                    <td className="py-1">
                                                        {line.quantity}
                                                    </td>
                                                    <td className="py-1 text-right">
                                                        ₦
                                                        {line.subtotal.toLocaleString()}
                                                    </td>
                                                </tr>
                                            ),
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}
                        <div className="space-y-1 border-b pb-2 text-sm">
                            {viewing.credit > 0 && (
                                <p className="flex justify-between">
                                    <span>Credit</span>
                                    <strong>
                                        ₦{viewing.credit.toLocaleString()}
                                    </strong>
                                </p>
                            )}
                            {viewing.debit > 0 && (
                                <p className="flex justify-between">
                                    <span>Debit</span>
                                    <strong>
                                        ₦{viewing.debit.toLocaleString()}
                                    </strong>
                                </p>
                            )}
                            <p className="flex justify-between">
                                <span>Balance after transaction</span>
                                <strong>
                                    ₦{viewing.balance.toLocaleString()}
                                </strong>
                            </p>
                        </div>
                        <p className="text-sm">
                            <strong>Recorded by:</strong>{' '}
                            {viewing.userName ?? '—'}
                        </p>
                        <div className="no-print flex justify-end">
                            <Button onClick={printReceipt}>
                                Print receipt
                            </Button>
                        </div>
                        <p className="text-center text-xs">** THANK YOU **</p>
                    </div>
                </div>
            )}
            <ConfirmDialog
                open={deleting !== null}
                onOpenChange={(open) => {
                    if (!open) setDeleting(null);
                }}
                destructive
                title="Delete wallet transaction?"
                description="The transaction record will be removed from the history."
                confirmLabel="Delete"
                onConfirm={remove}
            />
        </>
    );
}
