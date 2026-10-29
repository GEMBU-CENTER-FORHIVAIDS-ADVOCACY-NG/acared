import { Head, Link, router, usePage } from '@inertiajs/react';
import { Banknote, Coins, CreditCard, UserMinus } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import BillingController from '@/actions/App/Http/Controllers/BillingController';
import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { history, index } from '@/routes/billings';
import type {
    BillingCountStats,
    BillingDateFilterOption,
    BillingFormFilters,
    BillingPatientOption,
    CouponOption,
    FinanceBillingOption,
    NewBillingOptions,
    PaymentMethodOption,
    Team,
} from '@/types';

type LayoutProps = {
    currentTeam?: Team | null;
};

type PaymentRow = {
    method_id: string;
    amount: string;
    discount_percentage: string;
    discount_amount: string;
    coupon_id: string;
    coupon_discount_amount: string;
    wallet_debit: string;
    wallet_patient_id: string;
};

type NewPatientRow = {
    art: string;
    slugOther: string;
    category_id: string;
    firstName: string;
    middleName: string;
    lastName: string;
    gender: string;
    birthDate: string;
    email: string;
    phone: string;
    mobile: string;
    country_id: string;
    state_id: string;
    lga_id: string;
    address: string;
    kinFullName: string;
    kinPhone: string;
    kinEmail: string;
    relation: string;
};

type NewLineRow = {
    price_list_id: string;
    unitPrice: string;
};

const SPECIAL_METHODS = ['Discount', 'Wallet', 'Mercy Fund', 'Infant Formula'];

function emptyPayment(methodId: string, amount: string): PaymentRow {
    return {
        method_id: methodId,
        amount,
        discount_percentage: '0',
        discount_amount: amount,
        coupon_id: '',
        coupon_discount_amount: amount,
        wallet_debit: amount,
        wallet_patient_id: '',
    };
}

function emptyPatient(): NewPatientRow {
    return {
        art: '',
        slugOther: '',
        category_id: '',
        firstName: '',
        middleName: '',
        lastName: '',
        gender: 'Male',
        birthDate: '',
        email: '',
        phone: '',
        mobile: '',
        country_id: '',
        state_id: '',
        lga_id: '',
        address: '',
        kinFullName: '',
        kinPhone: '',
        kinEmail: '',
        relation: '',
    };
}

export default function BillingIndex({
    currencySymbol,
    methods,
    billings,
    selectedBillingId,
    suggestedMethodId,
    coupons,
    filters,
    dateFilterOptions,
    stats,
    newBillingOptions,
}: {
    currencySymbol: string;
    methods: PaymentMethodOption[];
    billings: FinanceBillingOption[];
    selectedBillingId: number | null;
    suggestedMethodId: number | null;
    coupons: CouponOption[];
    filters: BillingFormFilters;
    dateFilterOptions: BillingDateFilterOption[];
    stats: BillingCountStats;
    newBillingOptions: NewBillingOptions;
}) {
    const { currentTeam } = usePage().props;
    const teamSlug = currentTeam?.slug;

    const [billingId, setBillingId] = useState(
        selectedBillingId ? String(selectedBillingId) : '',
    );
    const [payments, setPayments] = useState<PaymentRow[]>([]);
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [paymentMethodErrors, setPaymentMethodErrors] = useState<number[]>([]);

    // Wallet patient search state per payment row
    const [walletPatientSearchQueries, setWalletPatientSearchQueries] = useState<Record<number, string>>({});
    const [walletPatientSearchResults, setWalletPatientSearchResults] = useState<Record<number, BillingPatientOption[]>>({});
    const [walletPatientSearchOpen, setWalletPatientSearchOpen] = useState<Record<number, boolean>>({});
    const [walletPatientSearchLoading, setWalletPatientSearchLoading] = useState<Record<number, boolean>>({});
    const walletPatientSearchInputRefs = useRef<Record<number, HTMLInputElement | null>>({});
    const walletPatientSearchContainerRefs = useRef<Record<number, HTMLDivElement | null>>({});
    const walletDebounceTimerRefs = useRef<Record<number, ReturnType<typeof setTimeout> | null>>({});

    const [newOpen, setNewOpen] = useState(false);
    const [itemsOpen, setItemsOpen] = useState(false);
    const [existingPatientId, setExistingPatientId] = useState('');
    const [patient, setPatient] = useState<NewPatientRow>(emptyPatient());
    const [lines, setLines] = useState<NewLineRow[]>([
        { price_list_id: '', unitPrice: '' },
    ]);
    const [newProcessing, setNewProcessing] = useState(false);
    const [newError, setNewError] = useState<string | null>(null);

    // Server-side patient search state
    const [patientSearchQuery, setPatientSearchQuery] = useState('');
    const [patientSearchResults, setPatientSearchResults] = useState<BillingPatientOption[]>([]);
    const [patientSearchOpen, setPatientSearchOpen] = useState(false);
    const [patientSearchLoading, setPatientSearchLoading] = useState(false);
    const patientSearchInputRef = useRef<HTMLInputElement>(null);
    const patientSearchContainerRef = useRef<HTMLDivElement>(null);
    const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const selected = useMemo(
        () =>
            billings.find((billing) => String(billing.id) === billingId) ??
            null,
        [billings, billingId],
    );

    const methodsById = useMemo(
        () => new Map(methods.map((method) => [method.id, method.name])),
        [methods],
    );

    const newTotal = useMemo(
        () =>
            lines.reduce((sum, line) => sum + (Number(line.unitPrice) || 0), 0),
        [lines],
    );

    // Debounced search for patients using fetch to avoid Inertia JSON response error
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
            const url = BillingController.searchPatients.url(teamSlug, { query: { q: query } });
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
    }, [teamSlug]);

    // Close dropdown on outside click
    useEffect(() => {
        if (!patientSearchOpen) {
            return;
        }

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

    // Cleanup debounce timer
    useEffect(() => {
        return () => {
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current);
            }
        };
    }, []);

    // Debounced search for wallet patients using fetch to avoid Inertia JSON response error
    const searchWalletPatients = useCallback((rowIndex: number, query: string) => {
        if (walletDebounceTimerRefs.current[rowIndex]) {
            clearTimeout(walletDebounceTimerRefs.current[rowIndex]);
        }

        if (!query.trim()) {
            setWalletPatientSearchResults((prev) => {
                const next = { ...prev };
                delete next[rowIndex];
                return next;
            });
            return;
        }

        setWalletPatientSearchLoading((prev) => ({ ...prev, [rowIndex]: true }));
        walletDebounceTimerRefs.current[rowIndex] = setTimeout(() => {
            const url = BillingController.searchPatients.url(teamSlug, { query: { q: query } });
            fetch(url, {
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                },
            })
                .then((res) => res.json())
                .then((results) => {
                    setWalletPatientSearchResults((prev) => ({
                        ...prev,
                        [rowIndex]: results,
                    }));
                    setWalletPatientSearchLoading((prev) => ({
                        ...prev,
                        [rowIndex]: false,
                    }));
                })
                .catch(() => {
                    setWalletPatientSearchLoading((prev) => ({
                        ...prev,
                        [rowIndex]: false,
                    }));
                });
        }, 300);
    }, [teamSlug]);

    // Close wallet patient dropdown on outside click
    useEffect(() => {
        const openRows = Object.entries(walletPatientSearchOpen).filter(([, open]) => open);
        if (openRows.length === 0) {
            return;
        }

        const handleClick = (event: MouseEvent) => {
            openRows.forEach(([rowIndexStr]) => {
                const rowIndex = Number(rowIndexStr);
                if (
                    walletPatientSearchContainerRefs.current[rowIndex] &&
                    !walletPatientSearchContainerRefs.current[rowIndex]?.contains(event.target as Node)
                ) {
                    setWalletPatientSearchOpen((prev) => ({
                        ...prev,
                        [rowIndex]: false,
                    }));
                }
            });
        };

        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, [walletPatientSearchOpen]);

    // Cleanup wallet debounce timers
    useEffect(() => {
        return () => {
            Object.values(walletDebounceTimerRefs.current).forEach((timer) => {
                if (timer) {
                    clearTimeout(timer);
                }
            });
        };
    }, []);

    // Get label for selected wallet patient
    const getWalletPatientLabel = useCallback((rowIndex: number, patientSlug: string) => {
        if (!patientSlug) return '';
        const results = walletPatientSearchResults[rowIndex] ?? [];
        const found = results.find((p) => p.slug === patientSlug);
        return found?.label ?? patientSlug;
    }, [walletPatientSearchResults]);

    const selectedPatientLabel = useMemo(() => {
        if (!existingPatientId) {
            return '';
        }
        const found = patientSearchResults.find((p) => p.slug === existingPatientId);
        return found?.label ?? existingPatientId;
    }, [existingPatientId, patientSearchResults]);

    const stateLgas = useMemo(
        () =>
            newBillingOptions.lgas.filter(
                (lga) => String(lga.stateId) === patient.state_id,
            ),
        [newBillingOptions.lgas, patient.state_id],
    );

    function methodName(row: PaymentRow): string {
        return methodsById.get(Number(row.method_id)) ?? '';
    }

    function chooseBilling(value: string) {
        setBillingId(value);
        setError(null);
        setPaymentMethodErrors([]);

        const billing = billings.find((item) => String(item.id) === value);

        if (!billing) {
            setPayments([]);

            return;
        }

        const methodId = suggestedMethodId ? String(suggestedMethodId) : '';
        setPayments([emptyPayment(methodId, String(billing.total))]);
    }

    function updatePayment(index: number, patch: Partial<PaymentRow>) {
        setPayments((current) =>
            current.map((row, rowIndex) =>
                rowIndex === index ? { ...row, ...patch } : row,
            ),
        );
    }

    function addPayment() {
        const methodId = suggestedMethodId ? String(suggestedMethodId) : '';
        const amount = selected ? String(selected.total) : '';
        setPayments((current) => [...current, emptyPayment(methodId, amount)]);
    }

    function removePayment(index: number) {
        setPayments((current) =>
            current.filter((_, rowIndex) => rowIndex !== index),
        );
    }

    function submit() {
        if (!selected) {
            setError('Select a bill to pay.');

            return;
        }

        setProcessing(true);
        setError(null);
        setPaymentMethodErrors([]);

        const payload = {
            billing_id: selected.id,
            payments: payments.map((row) => ({
                method_id: row.method_id,
                amount: row.amount === '' ? 0 : row.amount,
                discount_percentage:
                    row.discount_percentage === ''
                        ? 0
                        : row.discount_percentage,
                discount_amount:
                    row.discount_amount === '' ? 0 : row.discount_amount,
                coupon_id: row.coupon_id === '' ? null : row.coupon_id,
                coupon_discount_amount:
                    row.coupon_discount_amount === ''
                        ? 0
                        : row.coupon_discount_amount,
                wallet_debit: row.wallet_debit === '' ? 0 : row.wallet_debit,
                wallet_patient_id: row.wallet_patient_id === '' ? null : row.wallet_patient_id,
            })),
        };

        router.post(BillingController.store.url(teamSlug), payload, {
            preserveScroll: true,
            onError: (errors: Record<string, string>) => {
                const methodErrorKeys = Object.keys(errors).filter(
                    (key) => key.includes('method_id'),
                );

                if (methodErrorKeys.length > 0) {
                    const errorRows = methodErrorKeys
                        .map((key) => {
                            const match = key.match(/payments\.(\d+)\.method_id/);
                            return match ? Number(match[1]) : -1;
                        })
                        .filter((row) => row >= 0);

                    if (errorRows.length > 0) {
                        setPaymentMethodErrors([...new Set(errorRows)]);
                    }
                }

                const nonMethodErrors = Object.fromEntries(
                    Object.entries(errors).filter(
                        ([key]) => !key.includes('method_id'),
                    ),
                );

                if (Object.keys(nonMethodErrors).length > 0) {
                    setError(
                        Object.values(nonMethodErrors)[0]
                        ?? 'Something went wrong.',
                    );
                } else if (methodErrorKeys.length > 0) {
                    setError(null);
                } else {
                    setError(Object.values(errors)[0] ?? 'Something went wrong.');
                }
            },
            onFinish: () => setProcessing(false),
        });
    }

    function openNewBilling() {
        setPatient(emptyPatient());
        setExistingPatientId('');
        setPatientSearchQuery('');
        setPatientSearchResults([]);
        setPatientSearchOpen(false);
        setLines([{ price_list_id: '', unitPrice: '' }]);
        setNewError(null);
        setNewOpen(true);
    }

    function updateLine(index: number, patch: Partial<NewLineRow>) {
        setLines((current) =>
            current.map((row, rowIndex) =>
                rowIndex === index ? { ...row, ...patch } : row,
            ),
        );
    }

    function choosePriceList(index: number, value: string) {
        const priceList = newBillingOptions.priceLists.find(
            (item) => String(item.id) === value,
        );

        updateLine(index, {
            price_list_id: value,
            unitPrice: priceList ? String(priceList.price) : '',
        });
    }

    function submitNewBilling() {
        if (!existingPatientId && !patient.firstName) {
            setNewError('Choose a patient or fill in their details.');

            return;
        }

        const linePayload = lines
            .filter((line) => line.price_list_id !== '')
            .map((line) => ({
                price_list_id: Number(line.price_list_id),
                unitPrice: Number(line.unitPrice) || 0,
            }));

        if (linePayload.length === 0) {
            setNewError('Add at least one billing line.');

            return;
        }

        setNewProcessing(true);
        setNewError(null);

        const payload = {
            existing_patient_id: existingPatientId || null,
            billings: [{ lines: linePayload, total: newTotal }],
            ...(existingPatientId ? {} : patient),
        };

        router.post(BillingController.newBilling.url(teamSlug), payload, {
            preserveScroll: true,
            onError: (errors: Record<string, string>) =>
                setNewError(
                    Object.values(errors)[0] ?? 'Something went wrong.',
                ),
            onSuccess: () => setNewOpen(false),
            onFinish: () => setNewProcessing(false),
        });
    }

    const statCards = [
        {
            label: 'Total Billed',
            value: stats.total_billed,
            count: stats.total_billed_count,
            icon: Banknote,
        },
        {
            label: 'Collected',
            value: stats.collected,
            count: stats.collected_count,
            icon: Coins,
        },
        {
            label: 'Awaiting Payment',
            value: stats.awaiting_payment,
            count: stats.awaiting_payment_count,
            icon: CreditCard,
        },
        {
            label: 'Wallet Debts',
            value: stats.wallet_debts,
            count: stats.wallet_debts_count,
            icon: UserMinus,
        },
    ];

    return (
        <>
            <Head title="Billings" />

            <div className="flex w-full flex-col space-y-6 p-4 md:p-6 lg:p-8">
                <div className="space-y-3">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                        <Heading
                            variant="small"
                            title="Billings"
                            description="Collect payment against billed invoices."
                        />
                        <div className="flex items-center gap-2">
                            <Button
                                type="button"
                                data-test="new-billing"
                                onClick={openNewBilling}
                            >
                                New Billing
                            </Button>
                            <Button asChild variant="secondary">
                                <Link href={history(teamSlug).url}>History</Link>
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="flex flex-wrap items-end gap-2">
                    <div className="space-y-2">
                        <Label htmlFor="date-filter">Period</Label>
                        <SelectNative
                            id="date-filter"
                            value={filters.date_filter}
                            data-test="billing-date-filter"
                            onChange={(event) =>
                                router.get(
                                    index.url(teamSlug, {
                                        query: {
                                            date_filter: event.target.value,
                                        },
                                    }),
                                    {},
                                    {
                                        preserveState: true,
                                        preserveScroll: true,
                                        replace: true,
                                    },
                                )
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

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {statCards.map((card) => {
                        const Icon = card.icon;
                        return (
                            <Card key={card.label} data-test="billing-stat">
                                <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium text-muted-foreground">
                                        {card.label}
                                    </CardTitle>
                                    <Icon className="size-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-semibold tabular-nums">
                                        {currencySymbol} {card.value.toLocaleString()}
                                    </div>
                                    <p className="mt-1 text-xs text-muted-foreground">
                                        {card.count} bill{card.count !== 1 ? 's' : ''}
                                    </p>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0">
                        <CardTitle>Payment form</CardTitle>
                        {selected ? (
                            <Badge
                                variant={selected.isAdmitted ? 'default' : 'secondary'}
                                data-test="patient-admission-badge"
                            >
                                {selected.isAdmitted ? 'On Admission' : 'OPD'}
                            </Badge>
                        ) : null}
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="billing-select">Billing from</Label>
                            <SelectNative
                                id="billing-select"
                                value={billingId}
                                onChange={(event) =>
                                    chooseBilling(event.target.value)
                                }
                                data-test="billing-select"
                            >
                                <option value="">Select a bill...</option>
                                {billings.map((billing) => (
                                    <option key={billing.id} value={billing.id}>
                                        {billing.patientId}{' '}
                                        {billing.patientName ?? ''}
                                    </option>
                                ))}
                            </SelectNative>
                        </div>

                        {selected ? (
                            <div className="space-y-3">
                                <div className="flex flex-wrap items-center justify-between gap-2 rounded-md border bg-muted/30 px-3 py-2">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-muted-foreground">Patient:</span>
                                        <span className="text-sm font-medium">
                                            {selected.patientId} {selected.patientName ?? ''}
                                        </span>
                                    </div>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => setItemsOpen(true)}
                                        data-test="view-payment-items"
                                    >
                                        View items ({selected.lines.length})
                                    </Button>
                                </div>

                                <div className="grid gap-2 sm:grid-cols-2">
                                    <p className="text-sm">
                                        <span className="text-muted-foreground">
                                            Payment for:{' '}
                                        </span>
                                        {selected.billableType ?? '—'}
                                    </p>
                                    <p className="text-sm">
                                        <span className="text-muted-foreground">
                                            Amount to pay:{' '}
                                        </span>
                                        {currencySymbol}{' '}
                                        {selected.total.toLocaleString()}
                                    </p>
                                    <p className="text-sm">
                                        <span className="text-muted-foreground">
                                            Category:{' '}
                                        </span>
                                        {selected.categoryName ?? '—'}
                                    </p>
                                    <p className="text-sm">
                                        <span className="text-muted-foreground">
                                            Discount:{' '}
                                        </span>
                                        {selected.discountPercentage}%
                                    </p>
                                </div>
                            </div>
                        ) : null}

                        {selected ? (
                            <div className="space-y-4">
                                {payments.map((row, index) => {
                                    const name = methodName(row);

                                    return (
                                        <div
                                            key={index}
                                            className="space-y-3 rounded-lg border p-4"
                                        >
                                            <div className="grid gap-3 sm:grid-cols-2">
                                                <div className="space-y-2">
                                                    <Label>
                                                        Payment method
                                                    </Label>
                                                    <SelectNative
                                                        value={row.method_id}
                                                        onChange={(event) => {
                                                            updatePayment(
                                                                index,
                                                                {
                                                                    method_id:
                                                                        event
                                                                            .target
                                                                            .value,
                                                                },
                                                            );

                                                            setPaymentMethodErrors(
                                                                (current) =>
                                                                    current.filter(
                                                                        (i) =>
                                                                            i !==
                                                                            index,
                                                                    ),
                                                            );
                                                        }}
                                                        data-test="payment-method"
                                                        className={
                                                            paymentMethodErrors.includes(
                                                                index,
                                                            )
                                                                ? 'border-destructive'
                                                                : ''
                                                        }
                                                    >
                                                        <option value="">
                                                            Select method...
                                                        </option>
                                                        {methods.map(
                                                            (method) => (
                                                                <option
                                                                    key={
                                                                        method.id
                                                                    }
                                                                    value={
                                                                        method.id
                                                                    }
                                                                >
                                                                    {
                                                                        method.name
                                                                    }
                                                                </option>
                                                            ),
                                                        )}
                                                    </SelectNative>
                                                    {paymentMethodErrors.includes(
                                                        index,
                                                    ) ? (
                                                        <p className="text-xs text-destructive">
                                                            Please select a
                                                            payment method.
                                                        </p>
                                                    ) : null}
                                                </div>

                                                {!SPECIAL_METHODS.includes(
                                                    name,
                                                ) ? (
                                                    <div className="space-y-2">
                                                        <Label>Amount</Label>
                                                        <Input
                                                            type="number"
                                                            value={row.amount}
                                                            onChange={(event) =>
                                                                updatePayment(
                                                                    index,
                                                                    {
                                                                        amount: event
                                                                            .target
                                                                            .value,
                                                                    },
                                                                )
                                                            }
                                                            data-test="payment-amount"
                                                        />
                                                    </div>
                                                ) : null}

                                                {name === 'Discount' ? (
                                                    <>
                                                        <div className="space-y-2">
                                                            <Label>
                                                                Discount (%)
                                                            </Label>
                                                            <Input
                                                                type="number"
                                                                readOnly
                                                                value={
                                                                    selected.discountPercentage
                                                                }
                                                            />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <Label>
                                                                Discount amount
                                                            </Label>
                                                            <Input
                                                                type="number"
                                                                value={
                                                                    row.discount_amount
                                                                }
                                                                onChange={(
                                                                    event,
                                                                ) =>
                                                                    updatePayment(
                                                                        index,
                                                                        {
                                                                            discount_amount:
                                                                                event
                                                                                    .target
                                                                                    .value,
                                                                        },
                                                                    )
                                                                }
                                                                data-test="payment-discount"
                                                            />
                                                        </div>
                                                    </>
                                                ) : null}

                                                {name === 'Wallet' ? (
                                                    <div className="space-y-3">
                                                        <div className="space-y-2">
                                                            <Label>
                                                                Wallet debit
                                                            </Label>
                                                            <Input
                                                                type="number"
                                                                value={
                                                                    row.wallet_debit
                                                                }
                                                                onChange={(event) =>
                                                                    updatePayment(
                                                                        index,
                                                                        {
                                                                            wallet_debit:
                                                                                event
                                                                                    .target
                                                                                    .value,
                                                                        },
                                                                    )
                                                                }
                                                                data-test="payment-wallet"
                                                            />
                                                        </div>
                                                        <div className="space-y-2" ref={(el) => {
                                                            walletPatientSearchContainerRefs.current[index] = el;
                                                        }}>
                                                            <Label>
                                                                Credit to patient
                                                                <span className="text-muted-foreground ml-1">
                                                                    (default: {selected?.patientId})
                                                                </span>
                                                            </Label>
                                                            <div className="relative">
                                                                <Input
                                                                    data-test="wallet-patient"
                                                                    ref={(el) => {
                                                                        walletPatientSearchInputRefs.current[index] = el;
                                                                    }}
                                                                    placeholder="Search patient to credit wallet..."
                                                                    value={row.wallet_patient_id ? getWalletPatientLabel(index, row.wallet_patient_id) : (walletPatientSearchQueries[index] ?? '')}
                                                                    onClick={() => {
                                                                        if (!row.wallet_patient_id) {
                                                                            setWalletPatientSearchOpen((prev) => ({
                                                                                ...prev,
                                                                                [index]: true,
                                                                            }));
                                                                        }
                                                                    }}
                                                                    onChange={(event) => {
                                                                        const value = event.target.value;
                                                                        updatePayment(index, { wallet_patient_id: '' });
                                                                        setWalletPatientSearchQueries((prev) => ({
                                                                            ...prev,
                                                                            [index]: value,
                                                                        }));
                                                                        searchWalletPatients(index, value);
                                                                        setWalletPatientSearchOpen((prev) => ({
                                                                            ...prev,
                                                                            [index]: true,
                                                                        }));
                                                                    }}
                                                                />
                                                                {walletPatientSearchOpen[index] && !row.wallet_patient_id && (
                                                                    <div className="absolute left-0 right-0 z-50 mt-1 max-h-60 overflow-auto rounded-md border bg-white shadow-lg">
                                                                        {walletPatientSearchLoading[index] && (
                                                                            <div className="px-3 py-2 text-xs text-muted-foreground">
                                                                                Searching…
                                                                            </div>
                                                                        )}
                                                                        {!walletPatientSearchLoading[index] &&
                                                                         (walletPatientSearchResults[index] ?? []).length === 0 &&
                                                                         walletPatientSearchQueries[index]?.trim() && (
                                                                            <div className="px-3 py-2 text-xs text-muted-foreground">
                                                                                No patients found.
                                                                            </div>
                                                                        )}
                                                                        {(walletPatientSearchResults[index] ?? []).map((patient) => (
                                                                            <button
                                                                                key={patient.slug}
                                                                                type="button"
                                                                                className="w-full px-3 py-2 text-left text-sm hover:bg-accent"
                                                                                onClick={() => {
                                                                                    updatePayment(index, {
                                                                                        wallet_patient_id: patient.slug,
                                                                                    });
                                                                                    setWalletPatientSearchQueries((prev) => {
                                                                                        const next = { ...prev };
                                                                                        delete next[index];
                                                                                        return next;
                                                                                    });
                                                                                    setWalletPatientSearchOpen((prev) => ({
                                                                                        ...prev,
                                                                                        [index]: false,
                                                                                    }));
                                                                                }}
                                                                            >
                                                                                {patient.label}
                                                                            </button>
                                                                        ))}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ) : null}

                                                {name === 'Mercy Fund' ||
                                                name === 'Infant Formula' ? (
                                                    <>
                                                        <div className="space-y-2">
                                                            <Label>
                                                                Coupon
                                                            </Label>
                                                            <SelectNative
                                                                value={
                                                                    row.coupon_id
                                                                }
                                                                onChange={(event) => {
                                                                    const selectedCoupon = coupons.find(
                                                                        (c) => String(c.id) === event.target.value && c.patientId === selected?.patientId,
                                                                    );

                                                                    updatePayment(
                                                                        index,
                                                                        {
                                                                            coupon_id:
                                                                                event
                                                                                    .target
                                                                                    .value,
                                                                            coupon_discount_amount:
                                                                                selectedCoupon
                                                                                    ? String(selectedCoupon.value)
                                                                                    : row.coupon_discount_amount,
                                                                        },
                                                                    );
                                                                }}
                                                            >
                                                                <option value="">
                                                                    Select
                                                                    coupon...
                                                                </option>
                                                                {coupons
                                                                    .filter(
                                                                        (c) =>
                                                                            c.patientId ===
                                                                            selected?.patientId &&
                                                                            (name ===
                                                                            'Mercy Fund'
                                                                                ? c.fundType ===
                                                                                  'mercy_fund'
                                                                                : c.fundType ===
                                                                                  'infant_formula'),
                                                                    )
                                                                    .map(
                                                                        (
                                                                            coupon,
                                                                        ) => (
                                                                            <option
                                                                                key={
                                                                                    coupon.id
                                                                                }
                                                                                value={
                                                                                    coupon.id
                                                                                }
                                                                            >
                                                                                {coupon.code} - {coupon.type === 'percentage' ? `${coupon.value}%` : `${currencySymbol} ${coupon.value}`} (Balance: {currencySymbol} {coupon.balance})
                                                                            </option>
                                                                        ),
                                                                    )}
                                                            </SelectNative>
                                                        </div>
                                                        <div className="space-y-2">
                                                            <Label>
                                                                Amount
                                                            </Label>
                                                            <Input
                                                                type="number"
                                                                value={
                                                                    row.coupon_discount_amount
                                                                }
                                                                onChange={(
                                                                    event,
                                                                ) =>
                                                                    updatePayment(
                                                                        index,
                                                                        {
                                                                            coupon_discount_amount:
                                                                                event
                                                                                    .target
                                                                                    .value,
                                                                        },
                                                                    )
                                                                }
                                                            />
                                                        </div>
                                                    </>
                                                ) : null}
                                            </div>

                                            {payments.length > 1 ? (
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() =>
                                                        removePayment(index)
                                                    }
                                                >
                                                    Remove payment
                                                </Button>
                                            ) : null}
                                        </div>
                                    );
                                })}

                                <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={addPayment}
                                >
                                    Add payment
                                </Button>
                            </div>
                        ) : null}

                        {error ? (
                            <p className="text-sm text-destructive">{error}</p>
                        ) : null}

                        <div className="flex items-center gap-2">
                            <Button
                                type="button"
                                onClick={submit}
                                disabled={processing || !selected}
                                data-test="submit-payment"
                            >
                                {processing ? 'Saving...' : 'Record payment'}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Sheet open={itemsOpen} onOpenChange={setItemsOpen}>
                <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
                    <SheetHeader>
                        <SheetTitle>Requested items</SheetTitle>
                        <SheetDescription>
                            {selected
                                ? `${selected.patientId} ${selected.patientName ?? ''} - ${selected.billableType ?? 'Billing'}`
                                : 'Items requested for this payment.'}
                        </SheetDescription>
                    </SheetHeader>

                    {selected ? (
                        <div className="space-y-4 px-4 pb-6">
                            <div className="rounded-lg border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Item</TableHead>
                                            <TableHead>Quantity</TableHead>
                                            <TableHead>Price</TableHead>
                                            <TableHead>Subtotal</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {selected.lines.length > 0 ? (
                                            selected.lines.map((line) => (
                                                <TableRow key={line.id}>
                                                    <TableCell>
                                                        {line.name ?? '-'}
                                                    </TableCell>
                                                    <TableCell>
                                                        {line.quantity ?? 1}
                                                    </TableCell>
                                                    <TableCell>
                                                        {line.unitPrice.toLocaleString()}
                                                    </TableCell>
                                                    <TableCell>
                                                        {line.totalPrice.toLocaleString()}
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell
                                                    colSpan={4}
                                                    className="text-center text-muted-foreground"
                                                >
                                                    No items requested.
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>

                            <div className="flex items-center justify-between rounded-lg border bg-muted/30 px-3 py-2 text-sm">
                                <span className="text-muted-foreground">
                                    Total
                                </span>
                                <span className="font-semibold">
                                    {currencySymbol}{' '}
                                    {selected.total.toLocaleString()}
                                </span>
                            </div>
                        </div>
                    ) : null}
                </SheetContent>
            </Sheet>

            <Sheet open={newOpen} onOpenChange={setNewOpen}>
                <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
                    <SheetHeader>
                        <SheetTitle>New Billing</SheetTitle>
                        <SheetDescription>
                            Raise invoices for a patient and add billing lines.
                        </SheetDescription>
                    </SheetHeader>

                    <div className="space-y-4 px-4 pb-6">
                        <div className="space-y-2" ref={patientSearchContainerRef}>
                            <Label htmlFor="existing-patient">
                                Existing patient
                            </Label>
                            <div className="relative">
                                <Input
                                    id="existing-patient"
                                    data-test="new-billing-patient"
                                    ref={patientSearchInputRef}
                                    placeholder="Search patient by name, code, or phone…"
                                    value={existingPatientId ? selectedPatientLabel : patientSearchQuery}
                                    readOnly={!!existingPatientId}
                                    onClick={() => {
                                        if (!existingPatientId) {
                                            setPatientSearchOpen(true);
                                        }
                                    }}
                                    onChange={(event) => {
                                        const value = event.target.value;
                                        setExistingPatientId('');
                                        setPatientSearchQuery(value);
                                        searchPatients(value);
                                        setPatientSearchOpen(true);
                                    }}
                                />
                                {patientSearchOpen && !existingPatientId && (
                                    <div className="absolute left-0 right-0 z-50 mt-1 max-h-60 overflow-auto rounded-md border bg-white shadow-lg">
                                        {patientSearchLoading && (
                                            <div className="px-3 py-2 text-xs text-muted-foreground">
                                                Searching…
                                            </div>
                                        )}
                                        {!patientSearchLoading && patientSearchResults.length === 0 && patientSearchQuery.trim() && (
                                            <div className="px-3 py-2 text-xs text-muted-foreground">
                                                No patients found
                                            </div>
                                        )}
                                        <button
                                            type="button"
                                            className="w-full px-3 py-2 text-left text-sm hover:bg-accent"
                                            onClick={() => {
                                                setExistingPatientId('');
                                                setPatientSearchQuery('');
                                                setPatientSearchResults([]);
                                                setPatientSearchOpen(false);
                                            }}
                                        >
                                            <span className="text-muted-foreground">Create a new patient…</span>
                                        </button>
                                        {patientSearchResults.map((option) => (
                                            <button
                                                key={option.slug}
                                                type="button"
                                                className="w-full px-3 py-2 text-left text-sm hover:bg-accent"
                                                onClick={() => {
                                                    setExistingPatientId(option.slug);
                                                    setPatientSearchQuery('');
                                                    setPatientSearchResults([]);
                                                    setPatientSearchOpen(false);
                                                }}
                                            >
                                                {option.label}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {!existingPatientId ? (
                            <div className="grid gap-3 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label>First name</Label>
                                    <Input
                                        value={patient.firstName}
                                        data-test="new-billing-first-name"
                                        onChange={(event) =>
                                            setPatient({
                                                ...patient,
                                                firstName: event.target.value,
                                            })
                                        }
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Last name</Label>
                                    <Input
                                        value={patient.lastName}
                                        onChange={(event) =>
                                            setPatient({
                                                ...patient,
                                                lastName: event.target.value,
                                            })
                                        }
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Gender</Label>
                                    <SelectNative
                                        value={patient.gender}
                                        onChange={(event) =>
                                            setPatient({
                                                ...patient,
                                                gender: event.target.value,
                                            })
                                        }
                                    >
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                    </SelectNative>
                                </div>
                                <div className="space-y-2">
                                    <Label>Birth date</Label>
                                    <Input
                                        type="date"
                                        value={patient.birthDate}
                                        onChange={(event) =>
                                            setPatient({
                                                ...patient,
                                                birthDate: event.target.value,
                                            })
                                        }
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Category</Label>
                                    <SelectNative
                                        value={patient.category_id}
                                        onChange={(event) =>
                                            setPatient({
                                                ...patient,
                                                category_id: event.target.value,
                                            })
                                        }
                                    >
                                        <option value="">Select…</option>
                                        {newBillingOptions.categories.map(
                                            (category) => (
                                                <option
                                                    key={category.id}
                                                    value={category.id}
                                                >
                                                    {category.name}
                                                </option>
                                            ),
                                        )}
                                    </SelectNative>
                                </div>
                                <div className="space-y-2">
                                    <Label>Phone</Label>
                                    <Input
                                        value={patient.phone}
                                        onChange={(event) =>
                                            setPatient({
                                                ...patient,
                                                phone: event.target.value,
                                            })
                                        }
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Country</Label>
                                    <SelectNative
                                        value={patient.country_id}
                                        onChange={(event) =>
                                            setPatient({
                                                ...patient,
                                                country_id: event.target.value,
                                            })
                                        }
                                    >
                                        <option value="">Select…</option>
                                        {newBillingOptions.countries.map(
                                            (country) => (
                                                <option
                                                    key={country.id}
                                                    value={country.id}
                                                >
                                                    {country.name}
                                                </option>
                                            ),
                                        )}
                                    </SelectNative>
                                </div>
                                <div className="space-y-2">
                                    <Label>State</Label>
                                    <SelectNative
                                        value={patient.state_id}
                                        onChange={(event) =>
                                            setPatient({
                                                ...patient,
                                                state_id: event.target.value,
                                                lga_id: '',
                                            })
                                        }
                                    >
                                        <option value="">Select…</option>
                                        {newBillingOptions.states.map(
                                            (state) => (
                                                <option
                                                    key={state.id}
                                                    value={state.id}
                                                >
                                                    {state.name}
                                                </option>
                                            ),
                                        )}
                                    </SelectNative>
                                </div>
                                <div className="space-y-2">
                                    <Label>LGA</Label>
                                    <SelectNative
                                        value={patient.lga_id}
                                        onChange={(event) =>
                                            setPatient({
                                                ...patient,
                                                lga_id: event.target.value,
                                            })
                                        }
                                    >
                                        <option value="">Select…</option>
                                        {stateLgas.map((lga) => (
                                            <option key={lga.id} value={lga.id}>
                                                {lga.name}
                                            </option>
                                        ))}
                                    </SelectNative>
                                </div>
                                <div className="space-y-2 sm:col-span-2">
                                    <Label>Address</Label>
                                    <Input
                                        value={patient.address}
                                        onChange={(event) =>
                                            setPatient({
                                                ...patient,
                                                address: event.target.value,
                                            })
                                        }
                                    />
                                </div>
                            </div>
                        ) : null}

                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <Label>Billing lines</Label>
                                <Button
                                    type="button"
                                    variant="secondary"
                                    size="sm"
                                    onClick={() =>
                                        setLines([
                                            ...lines,
                                            {
                                                price_list_id: '',
                                                unitPrice: '',
                                            },
                                        ])
                                    }
                                >
                                    Add line
                                </Button>
                            </div>

                            {lines.map((line, index) => (
                                <div
                                    key={index}
                                    className="grid gap-2 sm:grid-cols-[1fr_120px_auto]"
                                >
                                    <SelectNative
                                        value={line.price_list_id}
                                        onChange={(event) =>
                                            choosePriceList(
                                                index,
                                                event.target.value,
                                            )
                                        }
                                    >
                                        <option value="">Select item…</option>
                                        {newBillingOptions.priceLists.map(
                                            (priceList) => (
                                                <option
                                                    key={priceList.id}
                                                    value={priceList.id}
                                                >
                                                    {priceList.name}
                                                </option>
                                            ),
                                        )}
                                    </SelectNative>
                                    <Input
                                        type="number"
                                        value={line.unitPrice}
                                        onChange={(event) =>
                                            updateLine(index, {
                                                unitPrice: event.target.value,
                                            })
                                        }
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        disabled={lines.length === 1}
                                        onClick={() =>
                                            setLines((current) =>
                                                current.filter(
                                                    (_, rowIndex) =>
                                                        rowIndex !== index,
                                                ),
                                            )
                                        }
                                    >
                                        Remove
                                    </Button>
                                </div>
                            ))}

                            <div className="flex items-center justify-between border-t pt-2 text-sm">
                                <span className="text-muted-foreground">
                                    Total
                                </span>
                                <span className="font-semibold">
                                    {currencySymbol} {newTotal.toLocaleString()}
                                </span>
                            </div>
                        </div>

                        {newError ? (
                            <p className="text-sm text-destructive">
                                {newError}
                            </p>
                        ) : null}

                        <div className="flex items-center gap-2">
                            <Button
                                type="button"
                                onClick={submitNewBilling}
                                disabled={newProcessing}
                                data-test="submit-new-billing"
                            >
                                {newProcessing ? 'Saving...' : 'Create billing'}
                            </Button>
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => setNewOpen(false)}
                            >
                                Cancel
                            </Button>
                        </div>
                    </div>
                </SheetContent>
            </Sheet>
        </>
    );
}

BillingIndex.layout = (props: LayoutProps) => ({
    breadcrumbs: [
        {
            title: 'Billings',
            href: index(props.currentTeam?.slug),
        },
    ],
});
