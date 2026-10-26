import { Head, router, usePage } from '@inertiajs/react';
import { Eye, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ConfirmDialog from '@/components/confirm-dialog';
import Heading from '@/components/heading';
import Pagination from '@/components/pagination';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SelectNative } from '@/components/ui/select-native';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import WalletHistory from '@/routes/finance/wallet-history';
import { destroy as bulkDestroy } from '@/routes/finance/wallet-history/bulk';

type PatientOption = { slug: string; label: string; wallet: number };
type Method = { id: number; name: string };
type Coupon = {
    id: number;
    code: string;
    type: string;
    value: number;
    balance: number;
    fundType: string;
    patientId: string;
};
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

const SPECIAL_METHODS = ['Discount', 'Wallet', 'Mercy Fund', 'Infant Formula'];

type Form = {
    patient_id: string;
    method_id: string;
    credit: string;
    debit: string;
    discount_amount: string;
    coupon_id: string;
    coupon_discount_amount: string;
    wallet_patient_id: string;
};

function emptyForm(): Form {
    return {
        patient_id: '',
        method_id: '',
        credit: '',
        debit: '',
        discount_amount: '',
        coupon_id: '',
        coupon_discount_amount: '',
        wallet_patient_id: '',
    };
}

export default function WalletHistoryIndex({
    histories,
    methods,
    coupons,
    filters,
}: {
    histories: Paginator;
    methods: Method[];
    coupons: Coupon[];
    filters: Filters;
}) {
    const { currentTeam } = usePage().props;
    const team = currentTeam?.slug ?? '';
    const [search, setSearch] = useState(filters.q);
    const [form, setForm] = useState<Form>(emptyForm());
    const [editing, setEditing] = useState<History | null>(null);
    const [deleting, setDeleting] = useState<History | null>(null);
    const [selected, setSelected] = useState<number[]>([]);
    const [open, setOpen] = useState(false);
    const [viewing, setViewing] = useState<History | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Server-side patient search state
    const [patientSearchQuery, setPatientSearchQuery] = useState('');
    const [patientSearchResults, setPatientSearchResults] = useState<PatientOption[]>([]);
    const [patientSearchOpen, setPatientSearchOpen] = useState(false);
    const [patientSearchLoading, setPatientSearchLoading] = useState(false);
    const patientSearchInputRef = useRef<HTMLInputElement>(null);
    const patientSearchContainerRef = useRef<HTMLDivElement>(null);
    const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Wallet patient search state
    const [walletPatientSearchQuery, setWalletPatientSearchQuery] = useState('');
    const [walletPatientSearchResults, setWalletPatientSearchResults] = useState<PatientOption[]>([]);
    const [walletPatientSearchOpen, setWalletPatientSearchOpen] = useState(false);
    const [walletPatientSearchLoading, setWalletPatientSearchLoading] = useState(false);
    const walletPatientSearchInputRef = useRef<HTMLInputElement>(null);
    const walletPatientSearchContainerRef = useRef<HTMLDivElement>(null);
    const walletDebounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const visit = (patch: Partial<Filters>) =>
        router.get(
            WalletHistory.index.url(team, { query: { ...filters, ...patch } }),
            {},
            { preserveState: true, preserveScroll: true, replace: true },
        );

    const selectedMethod = methods.find(
        (method) => String(method.id) === form.method_id,
    );
    const methodName = selectedMethod?.name ?? '';
    const isWalletMethod = methodName === 'Wallet';
    const isSpecialMethod = SPECIAL_METHODS.includes(methodName);

    // Patient balance from search results
    const patientBalance = useMemo(() => {
        if (!form.patient_id) return 0;
        const found = patientSearchResults.find((p) => p.slug === form.patient_id);
        return found?.wallet ?? 0;
    }, [form.patient_id, patientSearchResults]);

    // Wallet patient balance
    const walletPatientBalance = useMemo(() => {
        if (!form.wallet_patient_id) return 0;
        const found = walletPatientSearchResults.find((p) => p.slug === form.wallet_patient_id);
        return found?.wallet ?? 0;
    }, [form.wallet_patient_id, walletPatientSearchResults]);

    // Get label for selected patient
    const getPatientLabel = useCallback((slug: string) => {
        if (!slug) return '';
        const found = patientSearchResults.find((p) => p.slug === slug);
        return found?.label ?? slug;
    }, [patientSearchResults]);

    // Get label for selected wallet patient
    const getWalletPatientLabel = useCallback((slug: string) => {
        if (!slug) return '';
        const found = walletPatientSearchResults.find((p) => p.slug === slug);
        return found?.label ?? slug;
    }, [walletPatientSearchResults]);

    // Debounced search for patients
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
            const url = WalletHistory.patients.search.url(team, { query: { q: query } });
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
    }, [team]);

    // Debounced search for wallet patients
    const searchWalletPatients = useCallback((query: string) => {
        if (walletDebounceTimerRef.current) {
            clearTimeout(walletDebounceTimerRef.current);
        }

        if (!query.trim()) {
            setWalletPatientSearchResults([]);
            return;
        }

        setWalletPatientSearchLoading(true);
        walletDebounceTimerRef.current = setTimeout(() => {
            const url = WalletHistory.patients.search.url(team, { query: { q: query } });
            fetch(url, {
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                },
            })
                .then((res) => res.json())
                .then((results) => {
                    setWalletPatientSearchResults(results);
                    setWalletPatientSearchLoading(false);
                })
                .catch(() => {
                    setWalletPatientSearchLoading(false);
                });
        }, 300);
    }, [team]);

    // Close patient dropdown on outside click
    useEffect(() => {
        if (!patientSearchOpen) return;

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

    // Close wallet patient dropdown on outside click
    useEffect(() => {
        if (!walletPatientSearchOpen) return;

        const handleClick = (event: MouseEvent) => {
            if (
                walletPatientSearchContainerRef.current &&
                !walletPatientSearchContainerRef.current.contains(event.target as Node)
            ) {
                setWalletPatientSearchOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, [walletPatientSearchOpen]);

    // Cleanup debounce timers
    useEffect(() => {
        return () => {
            if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
            if (walletDebounceTimerRef.current) clearTimeout(walletDebounceTimerRef.current);
        };
    }, []);

    const startCreate = () => {
        setEditing(null);
        setForm(emptyForm());
        setPatientSearchQuery('');
        setPatientSearchResults([]);
        setWalletPatientSearchQuery('');
        setWalletPatientSearchResults([]);
        setError(null);
        setOpen(true);
    };

    const startEdit = (history: History) => {
        setEditing(history);
        setForm({
            patient_id: history.patientId,
            method_id: String(
                methods.find((method) => method.name === history.methodName)?.id ?? '',
            ),
            credit: history.credit > 0 ? String(history.credit) : '',
            debit: history.debit > 0 ? String(history.debit) : '',
            discount_amount: '',
            coupon_id: '',
            coupon_discount_amount: '',
            wallet_patient_id: '',
        });
        setPatientSearchQuery('');
        setPatientSearchResults([]);
        setWalletPatientSearchQuery('');
        setWalletPatientSearchResults([]);
        setError(null);
        setOpen(true);
    };

    const submit = (event: React.FormEvent) => {
        event.preventDefault();
        setError(null);

        const payload = {
            patient_id: form.patient_id,
            method_id: form.method_id,
            credit: isWalletMethod ? '0' : (form.credit || '0'),
            debit: isWalletMethod ? form.debit : '0',
            discount_amount: form.discount_amount || '0',
            coupon_id: form.coupon_id || null,
            coupon_discount_amount: form.coupon_discount_amount || '0',
            wallet_patient_id: form.wallet_patient_id || null,
        };

        const options = {
            preserveScroll: true,
            onSuccess: () => setOpen(false),
            onError: (errors: Record<string, string>) => {
                setError(Object.values(errors)[0] ?? 'Something went wrong.');
            },
        };

        if (editing) {
            router.patch(
                WalletHistory.update.url({
                    current_team: team,
                    wallet_history: editing.id,
                }),
                payload,
                options,
            );
        } else {
            router.post(WalletHistory.store.url(team), payload, options);
        }
    };

    const remove = () => {
        if (deleting)
            router.delete(
                WalletHistory.destroy.url({
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
                        className="flex flex-1 items-end gap-2"
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
                                className="max-w-sm"
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
                <Card>
                    <CardContent className="p-0">
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
                                            <TableCell className="text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                        >
                                                            <MoreHorizontal className="size-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem
                                                            onClick={() =>
                                                                setViewing(row)
                                                            }
                                                        >
                                                            <Eye className="mr-2 h-4 w-4" />
                                                            View
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            onClick={() =>
                                                                startEdit(row)
                                                            }
                                                        >
                                                            <Pencil className="mr-2 h-4 w-4" />
                                                            Edit
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            variant="destructive"
                                                            onClick={() =>
                                                                setDeleting(row)
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
                                            No wallet transactions found.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
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

            {/* Slide-over Sheet for new/edit wallet transaction */}
            <Sheet open={open} onOpenChange={(isOpen) => {
                if (!isOpen) setOpen(false);
            }}>
                <SheetContent className="overflow-y-auto sm:max-w-lg">
                    <SheetHeader>
                        <SheetTitle>
                            {editing
                                ? 'Edit wallet transaction'
                                : 'New wallet transaction'}
                        </SheetTitle>
                        <SheetDescription>
                            Wallet method records a withdrawal; other methods
                            deposit credit.
                        </SheetDescription>
                    </SheetHeader>
                    <form onSubmit={submit} className="mt-4 space-y-4">
                        {/* Patient search */}
                        <div className="space-y-1" ref={(el) => {
                            patientSearchContainerRef.current = el;
                        }}>
                            <Label>Patient</Label>
                            <div className="relative">
                                <Input
                                    ref={(el) => {
                                        patientSearchInputRef.current = el;
                                    }}
                                    placeholder="Search patient..."
                                    value={form.patient_id ? getPatientLabel(form.patient_id) : (patientSearchQuery ?? '')}
                                    onClick={() => {
                                        if (!form.patient_id) {
                                            setPatientSearchOpen(true);
                                        }
                                    }}
                                    onChange={(event) => {
                                        const value = event.target.value;
                                        setForm({ ...form, patient_id: '' });
                                        setPatientSearchQuery(value);
                                        searchPatients(value);
                                        setPatientSearchOpen(true);
                                    }}
                                />
                                {patientSearchOpen && !form.patient_id && (
                                    <div className="absolute left-0 right-0 z-50 mt-1 max-h-60 overflow-auto rounded-md border bg-white shadow-lg">
                                        {patientSearchLoading && (
                                            <div className="px-3 py-2 text-xs text-muted-foreground">
                                                Searching…
                                            </div>
                                        )}
                                        {!patientSearchLoading &&
                                         patientSearchResults.length === 0 &&
                                         patientSearchQuery?.trim() && (
                                            <div className="px-3 py-2 text-xs text-muted-foreground">
                                                No patients found.
                                            </div>
                                        )}
                                        {patientSearchResults.map((patient) => (
                                            <button
                                                key={patient.slug}
                                                type="button"
                                                className="w-full px-3 py-2 text-left text-sm hover:bg-accent"
                                                onClick={() => {
                                                    setForm({ ...form, patient_id: patient.slug });
                                                    setPatientSearchQuery('');
                                                    setPatientSearchOpen(false);
                                                }}
                                            >
                                                {patient.label}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {form.patient_id && (
                            <p className="text-sm text-muted-foreground">
                                Current wallet: ₦
                                {patientBalance.toLocaleString()}
                            </p>
                        )}

                        {/* Method selection */}
                        <div className="space-y-1">
                            <Label>Method</Label>
                            <SelectNative
                                value={form.method_id}
                                onChange={(event) =>
                                    setForm({
                                        ...emptyForm(),
                                        patient_id: form.patient_id,
                                        method_id: event.target.value,
                                    })
                                }
                            >
                                <option value="">Select method</option>
                                {methods.map((method) => (
                                    <option
                                        key={method.id}
                                        value={String(method.id)}
                                    >
                                        {method.name}
                                    </option>
                                ))}
                            </SelectNative>
                        </div>

                        {/* Amount input for non-special methods */}
                        {!isSpecialMethod && form.method_id && (
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

                        {/* Wallet method - debit */}
                        {isWalletMethod && (
                            <div className="space-y-3">
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
                                {/* Wallet patient selection (optional - who to debit from) */}
                                <div className="space-y-1" ref={(el) => {
                                    walletPatientSearchContainerRef.current = el;
                                }}>
                                    <Label>
                                        Debit from patient
                                        <span className="text-muted-foreground ml-1">
                                            (default: {form.patient_id})
                                        </span>
                                    </Label>
                                    <div className="relative">
                                        <Input
                                            ref={(el) => {
                                                walletPatientSearchInputRef.current = el;
                                            }}
                                            placeholder="Search patient to debit..."
                                            value={form.wallet_patient_id ? getWalletPatientLabel(form.wallet_patient_id) : (walletPatientSearchQuery ?? '')}
                                            onClick={() => {
                                                if (!form.wallet_patient_id) {
                                                    setWalletPatientSearchOpen(true);
                                                }
                                            }}
                                            onChange={(event) => {
                                                const value = event.target.value;
                                                setForm({ ...form, wallet_patient_id: '' });
                                                setWalletPatientSearchQuery(value);
                                                searchWalletPatients(value);
                                                setWalletPatientSearchOpen(true);
                                            }}
                                        />
                                        {walletPatientSearchOpen && !form.wallet_patient_id && (
                                            <div className="absolute left-0 right-0 z-50 mt-1 max-h-60 overflow-auto rounded-md border bg-white shadow-lg">
                                                {walletPatientSearchLoading && (
                                                    <div className="px-3 py-2 text-xs text-muted-foreground">
                                                        Searching…
                                                    </div>
                                                )}
                                                {!walletPatientSearchLoading &&
                                                 walletPatientSearchResults.length === 0 &&
                                                 walletPatientSearchQuery?.trim() && (
                                                    <div className="px-3 py-2 text-xs text-muted-foreground">
                                                        No patients found.
                                                    </div>
                                                )}
                                                {walletPatientSearchResults.map((patient) => (
                                                    <button
                                                        key={patient.slug}
                                                        type="button"
                                                        className="w-full px-3 py-2 text-left text-sm hover:bg-accent"
                                                        onClick={() => {
                                                            setForm({ ...form, wallet_patient_id: patient.slug });
                                                            setWalletPatientSearchQuery('');
                                                            setWalletPatientSearchOpen(false);
                                                        }}
                                                    >
                                                        {patient.label}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    {form.wallet_patient_id && (
                                        <p className="text-sm text-muted-foreground">
                                            Wallet balance: ₦
                                            {walletPatientBalance.toLocaleString()}
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Discount method */}
                        {methodName === 'Discount' && (
                            <div className="space-y-1">
                                <Label>Discount amount</Label>
                                <Input
                                    type="number"
                                    min="0.01"
                                    step="1"
                                    value={form.discount_amount}
                                    onChange={(event) =>
                                        setForm({
                                            ...form,
                                            discount_amount: event.target.value,
                                            credit: event.target.value,
                                        })
                                    }
                                />
                            </div>
                        )}

                        {/* Mercy Fund / Infant Formula */}
                        {(methodName === 'Mercy Fund' || methodName === 'Infant Formula') && (
                            <div className="space-y-3">
                                <div className="space-y-1">
                                    <Label>Coupon</Label>
                                    <SelectNative
                                        value={form.coupon_id}
                                        onChange={(event) => {
                                            const selectedCoupon = coupons.find(
                                                (c) => String(c.id) === event.target.value && c.patientId === form.patient_id,
                                            );
                                            setForm({
                                                ...form,
                                                coupon_id: event.target.value,
                                                coupon_discount_amount: selectedCoupon
                                                    ? String(selectedCoupon.value)
                                                    : form.coupon_discount_amount,
                                            });
                                        }}
                                    >
                                        <option value="">Select coupon...</option>
                                        {coupons
                                            .filter(
                                                (c) =>
                                                    c.patientId === form.patient_id &&
                                                    (methodName === 'Mercy Fund'
                                                        ? c.fundType === 'mercy_fund'
                                                        : c.fundType === 'infant_formula'),
                                            )
                                            .map((coupon) => (
                                                <option
                                                    key={coupon.id}
                                                    value={String(coupon.id)}
                                                >
                                                    {coupon.code} - {coupon.type === 'percentage' ? `${coupon.value}%` : `₦ ${coupon.value}`} (Balance: ₦ {coupon.balance})
                                                </option>
                                            ))}
                                    </SelectNative>
                                </div>
                                <div className="space-y-1">
                                    <Label>Amount</Label>
                                    <Input
                                        type="number"
                                        min="0.01"
                                        step="1"
                                        value={form.coupon_discount_amount}
                                        onChange={(event) =>
                                            setForm({
                                                ...form,
                                                coupon_discount_amount: event.target.value,
                                                credit: event.target.value,
                                            })
                                        }
                                    />
                                </div>
                            </div>
                        )}

                        {error && (
                            <p className="text-sm text-destructive">{error}</p>
                        )}

                        <div className="flex justify-end gap-2 pt-4">
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={() => setOpen(false)}
                            >
                                Cancel
                            </Button>
                            <Button type="submit">
                                {editing ? 'Update' : 'Save'} transaction
                            </Button>
                        </div>
                    </form>
                </SheetContent>
            </Sheet>

            {/* View receipt modal */}
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
                onOpenChange={(isOpen) => {
                    if (!isOpen) setDeleting(null);
                }}
                title="Delete wallet transaction?"
                description="The transaction record will be removed from the history."
                confirmLabel="Delete"
                onConfirm={remove}
            />
        </>
    );
}
