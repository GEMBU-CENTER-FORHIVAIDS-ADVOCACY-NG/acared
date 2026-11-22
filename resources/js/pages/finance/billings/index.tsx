import { Head, Link, router, setLayoutProps, usePage } from '@inertiajs/react';
import {
    Banknote,
    Calculator,
    Coins,
    CreditCard,
    Plus,
    UserMinus,
    X,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import BillingController from '@/actions/App/Http/Controllers/BillingController';
import AlertError from '@/components/alert-error';
import FloatingCalculator from '@/components/floating-calculator';
import InputError from '@/components/input-error';
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
    maritalStatus: string;
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

type ServiceLineRow = {
    price_list_id: string;
    unitPrice: string;
};

const SPECIAL_METHODS = ['Discount', 'Wallet', 'Mercy Fund', 'Infant Formula'];

function calcCompute(a: number, b: number, op: string): number {
    switch (op) {
        case '+':
            return a + b;
        case '-':
            return a - b;
        case '×':
            return a * b;
        case '÷':
            return b !== 0 ? a / b : 0;
        default:
            return b;
    }
}

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
        maritalStatus: '',
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
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
    const [paymentMethodErrors, setPaymentMethodErrors] = useState<number[]>(
        [],
    );

    // Wallet patient search state per payment row
    const [walletPatientSearchQueries, setWalletPatientSearchQueries] =
        useState<Record<number, string>>({});
    const [walletPatientSearchResults, setWalletPatientSearchResults] =
        useState<Record<number, BillingPatientOption[]>>({});
    const [walletPatientSearchOpen, setWalletPatientSearchOpen] = useState<
        Record<number, boolean>
    >({});
    const [walletPatientSearchLoading, setWalletPatientSearchLoading] =
        useState<Record<number, boolean>>({});
    const walletPatientSearchInputRefs = useRef<
        Record<number, HTMLInputElement | null>
    >({});
    const walletPatientSearchContainerRefs = useRef<
        Record<number, HTMLDivElement | null>
    >({});
    const walletDebounceTimerRefs = useRef<
        Record<number, ReturnType<typeof setTimeout> | null>
    >({});

    const [newOpen, setNewOpen] = useState(false);
    const [calculatorOpen, setCalculatorOpen] = useState(false);
    const calculatorRef = useRef<HTMLDivElement>(null);

    // Inline calculator state
    const [calcDisplay, setCalcDisplay] = useState('0');
    const [calcPreviousValue, setCalcPreviousValue] = useState<string | null>(
        null,
    );
    const [calcOperation, setCalcOperation] = useState<string | null>(null);
    const [calcWaitingForOperand, setCalcWaitingForOperand] = useState(false);

    const calcHandleNumber = (num: string) => {
        if (calcWaitingForOperand) {
            setCalcDisplay(num);
            setCalcWaitingForOperand(false);
        } else {
            setCalcDisplay(calcDisplay === '0' ? num : calcDisplay + num);
        }
    };

    const calcHandleDecimal = () => {
        if (calcWaitingForOperand) {
            setCalcDisplay('0.');
            setCalcWaitingForOperand(false);
            return;
        }
        if (!calcDisplay.includes('.')) {
            setCalcDisplay(calcDisplay + '.');
        }
    };

    const calcHandleOperation = (nextOp: string) => {
        const currentValue = parseFloat(calcDisplay);
        if (
            calcPreviousValue !== null &&
            calcOperation &&
            !calcWaitingForOperand
        ) {
            const result = calcCompute(
                parseFloat(calcPreviousValue),
                currentValue,
                calcOperation,
            );
            const resultStr = parseFloat(result.toFixed(10)).toString();
            setCalcDisplay(resultStr);
            setCalcPreviousValue(resultStr);
        } else {
            setCalcPreviousValue(currentValue.toString());
        }
        setCalcOperation(nextOp);
        setCalcWaitingForOperand(true);
    };

    const calcHandleEquals = () => {
        if (calcPreviousValue === null || calcOperation === null) return;
        const currentValue = parseFloat(calcDisplay);
        const result = calcCompute(
            parseFloat(calcPreviousValue),
            currentValue,
            calcOperation,
        );
        const resultStr = parseFloat(result.toFixed(10)).toString();
        setCalcDisplay(resultStr);
        setCalcPreviousValue(null);
        setCalcOperation(null);
        setCalcWaitingForOperand(true);
    };

    const calcHandleClear = () => {
        setCalcDisplay('0');
        setCalcPreviousValue(null);
        setCalcOperation(null);
        setCalcWaitingForOperand(false);
    };

    const calcHandlePercent = () => {
        const currentValue = parseFloat(calcDisplay);
        setCalcDisplay((currentValue / 100).toString());
    };

    const calcHandleToggleSign = () => {
        const currentValue = parseFloat(calcDisplay);
        setCalcDisplay((currentValue * -1).toString());
    };

    // Keyboard input for calculator: only while the inline calculator has focus
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!calculatorRef.current?.contains(document.activeElement)) {
                return;
            }

            // Ignore if user is typing in an input, textarea, or select
            const target = e.target;
            if (
                target instanceof HTMLInputElement ||
                target instanceof HTMLTextAreaElement ||
                target instanceof HTMLSelectElement
            ) {
                return;
            }

            const key = e.key;

            if (key >= '0' && key <= '9') {
                e.preventDefault();
                calcHandleNumber(key);
            } else if (key === '.') {
                e.preventDefault();
                calcHandleDecimal();
            } else if (key === '+') {
                e.preventDefault();
                calcHandleOperation('+');
            } else if (key === '-') {
                e.preventDefault();
                calcHandleOperation('-');
            } else if (key === '*') {
                e.preventDefault();
                calcHandleOperation('×');
            } else if (key === '/') {
                e.preventDefault();
                calcHandleOperation('÷');
            } else if (key === 'Enter' || key === '=') {
                e.preventDefault();
                calcHandleEquals();
            } else if (key === 'Escape') {
                e.preventDefault();
                calcHandleClear();
            } else if (key === 'Backspace') {
                e.preventDefault();
                setCalcDisplay((prev) => {
                    if (
                        prev.length <= 1 ||
                        (prev.length === 2 && prev.startsWith('-'))
                    ) {
                        return '0';
                    }
                    return prev.slice(0, -1);
                });
            } else if (key === '%') {
                e.preventDefault();
                calcHandlePercent();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [calcDisplay, calcPreviousValue, calcOperation, calcWaitingForOperand]);

    const [existingPatientId, setExistingPatientId] = useState('');
    const [selectedPatientLabel, setSelectedPatientLabel] = useState('');
    const [patient, setPatient] = useState<NewPatientRow>(emptyPatient());
    const [lines, setLines] = useState<NewLineRow[]>([
        { price_list_id: '', unitPrice: '' },
    ]);
    const [newProcessing, setNewProcessing] = useState(false);
    const [newError, setNewError] = useState<string | null>(null);
    const [newFieldErrors, setNewFieldErrors] = useState<
        Record<string, string>
    >({});

    // Service billing modal state
    const [serviceOpen, setServiceOpen] = useState(false);
    const [serviceExistingPatientId, setServiceExistingPatientId] =
        useState('');
    const [serviceSelectedPatientLabel, setServiceSelectedPatientLabel] =
        useState('');
    const [serviceLines, setServiceLines] = useState<ServiceLineRow[]>([
        { price_list_id: '', unitPrice: '' },
    ]);
    const [serviceProcessing, setServiceProcessing] = useState(false);
    const [serviceError, setServiceError] = useState<string | null>(null);
    const [serviceFieldErrors, setServiceFieldErrors] = useState<
        Record<string, string>
    >({});
    const [servicePatientSearchQuery, setServicePatientSearchQuery] =
        useState('');
    const [servicePatientSearchResults, setServicePatientSearchResults] =
        useState<BillingPatientOption[]>([]);
    const [servicePatientSearchOpen, setServicePatientSearchOpen] =
        useState(false);
    const [servicePatientSearchLoading, setServicePatientSearchLoading] =
        useState(false);
    const servicePatientSearchInputRef = useRef<HTMLInputElement>(null);
    const servicePatientSearchContainerRef = useRef<HTMLDivElement>(null);
    const serviceDebounceTimerRef = useRef<ReturnType<
        typeof setTimeout
    > | null>(null);

    // Server-side patient search state
    const [patientSearchQuery, setPatientSearchQuery] = useState('');
    const [patientSearchResults, setPatientSearchResults] = useState<
        BillingPatientOption[]
    >([]);
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

    const serviceTotal = useMemo(
        () =>
            serviceLines.reduce(
                (sum, line) => sum + (Number(line.unitPrice) || 0),
                0,
            ),
        [serviceLines],
    );

    // Debounced search for patients using fetch to avoid Inertia JSON response error
    const searchPatients = useCallback(
        (query: string, isService = false) => {
            const timerRef = isService
                ? serviceDebounceTimerRef
                : debounceTimerRef;
            const setResults = isService
                ? setServicePatientSearchResults
                : setPatientSearchResults;
            const setLoading = isService
                ? setServicePatientSearchLoading
                : setPatientSearchLoading;

            if (timerRef.current) {
                clearTimeout(timerRef.current);
            }

            if (!query.trim()) {
                setResults([]);
                return;
            }

            setLoading(true);
            timerRef.current = setTimeout(() => {
                const url = BillingController.searchPatients.url(teamSlug, {
                    query: { q: query },
                });
                fetch(url, {
                    headers: {
                        'X-Requested-With': 'XMLHttpRequest',
                    },
                })
                    .then((res) => res.json())
                    .then((results) => {
                        setResults(results);
                        setLoading(false);
                    })
                    .catch(() => {
                        setLoading(false);
                    });
            }, 300);
        },
        [teamSlug],
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

    // Close service patient dropdown on outside click
    useEffect(() => {
        if (!servicePatientSearchOpen) {
            return;
        }

        const handleClick = (event: MouseEvent) => {
            if (
                servicePatientSearchContainerRef.current &&
                !servicePatientSearchContainerRef.current.contains(
                    event.target as Node,
                )
            ) {
                setServicePatientSearchOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, [servicePatientSearchOpen]);

    // Cleanup debounce timer
    useEffect(() => {
        return () => {
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current);
            }
            if (serviceDebounceTimerRef.current) {
                clearTimeout(serviceDebounceTimerRef.current);
            }
        };
    }, []);

    // Debounced search for wallet patients using fetch to avoid Inertia JSON response error
    const searchWalletPatients = useCallback(
        (rowIndex: number, query: string) => {
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

            setWalletPatientSearchLoading((prev) => ({
                ...prev,
                [rowIndex]: true,
            }));
            walletDebounceTimerRefs.current[rowIndex] = setTimeout(() => {
                const url = BillingController.searchPatients.url(teamSlug, {
                    query: { q: query },
                });
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
        },
        [teamSlug],
    );

    // Close wallet patient dropdown on outside click
    useEffect(() => {
        const openRows = Object.entries(walletPatientSearchOpen).filter(
            ([, open]) => open,
        );
        if (openRows.length === 0) {
            return;
        }

        const handleClick = (event: MouseEvent) => {
            openRows.forEach(([rowIndexStr]) => {
                const rowIndex = Number(rowIndexStr);
                if (
                    walletPatientSearchContainerRefs.current[rowIndex] &&
                    !walletPatientSearchContainerRefs.current[
                        rowIndex
                    ]?.contains(event.target as Node)
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
    const getWalletPatientLabel = useCallback(
        (rowIndex: number, patientSlug: string) => {
            if (!patientSlug) return '';
            const results = walletPatientSearchResults[rowIndex] ?? [];
            const found = results.find((p) => p.slug === patientSlug);
            return found?.label ?? patientSlug;
        },
        [walletPatientSearchResults],
    );

    const displayPatientLabel = existingPatientId ? selectedPatientLabel : '';

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
        setFieldErrors({});
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
        setFieldErrors({});
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
                wallet_patient_id:
                    row.wallet_patient_id === '' ? null : row.wallet_patient_id,
            })),
        };

        router.post(BillingController.store.url(teamSlug), payload, {
            preserveScroll: true,
            onError: (errors: Record<string, string>) => {
                setFieldErrors(errors);
                const methodErrorKeys = Object.keys(errors).filter((key) =>
                    key.includes('method_id'),
                );

                if (methodErrorKeys.length > 0) {
                    const errorRows = methodErrorKeys
                        .map((key) => {
                            const match = key.match(
                                /payments\.(\d+)\.method_id/,
                            );
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
                        Object.values(nonMethodErrors)[0] ??
                            'Something went wrong.',
                    );
                } else if (methodErrorKeys.length > 0) {
                    setError(null);
                } else {
                    setError(
                        Object.values(errors)[0] ?? 'Something went wrong.',
                    );
                }
            },
            onFinish: () => setProcessing(false),
        });
    }

    function openNewBilling() {
        setServiceExistingPatientId('');
        setServicePatientSearchQuery('');
        setServicePatientSearchResults([]);
        setServicePatientSearchOpen(false);
        setServiceLines([{ price_list_id: '', unitPrice: '' }]);
        setServiceError(null);
        setServiceFieldErrors({});
        setServiceOpen(true);
    }

    function openPatientRegistration() {
        setPatient(emptyPatient());
        setExistingPatientId('');
        setPatientSearchQuery('');
        setPatientSearchResults([]);
        setPatientSearchOpen(false);
        setLines([{ price_list_id: '', unitPrice: '' }]);
        setNewError(null);
        setNewFieldErrors({});
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

    function updateServiceLine(index: number, patch: Partial<ServiceLineRow>) {
        setServiceLines((current) =>
            current.map((row, rowIndex) =>
                rowIndex === index ? { ...row, ...patch } : row,
            ),
        );
    }

    function chooseService(index: number, value: string) {
        const service = newBillingOptions.services.find(
            (item) => String(item.id) === value,
        );

        updateServiceLine(index, {
            price_list_id: value,
            unitPrice: service ? String(service.price) : '',
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
        setNewFieldErrors({});

        const payload = {
            source: 'patient_registration',
            existing_patient_id: existingPatientId || null,
            billings: [{ lines: linePayload, total: newTotal }],
            ...(existingPatientId ? {} : patient),
        };

        router.post(BillingController.newBilling.url(teamSlug), payload, {
            preserveScroll: true,
            onError: (errors: Record<string, string>) => {
                setNewFieldErrors(errors);
                setNewError(
                    Object.values(errors)[0] ?? 'Something went wrong.',
                );
            },
            onSuccess: () => setNewOpen(false),
            onFinish: () => setNewProcessing(false),
        });
    }

    function submitServiceBilling() {
        if (!serviceExistingPatientId) {
            setServiceError('Please select an existing patient.');

            return;
        }

        const linePayload = serviceLines
            .filter((line) => line.price_list_id !== '')
            .map((line) => ({
                price_list_id: Number(line.price_list_id),
                unitPrice: Number(line.unitPrice) || 0,
            }));

        if (linePayload.length === 0) {
            setServiceError('Add at least one service.');

            return;
        }

        setServiceProcessing(true);
        setServiceError(null);
        setServiceFieldErrors({});

        const payload = {
            source: 'new_billing',
            existing_patient_id: serviceExistingPatientId,
            billings: [{ lines: linePayload, total: serviceTotal }],
        };

        router.post(BillingController.newBilling.url(teamSlug), payload, {
            preserveScroll: true,
            onError: (errors: Record<string, string>) => {
                setServiceFieldErrors(errors);
                setServiceError(
                    Object.values(errors)[0] ?? 'Something went wrong.',
                );
            },
            onSuccess: () => setServiceOpen(false),
            onFinish: () => setServiceProcessing(false),
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

    setLayoutProps({
        headerActions: (
            <div className="flex items-center gap-3">
                <div className="min-w-[180px] space-y-0">
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
                <div className="h-6 w-px bg-border" />
                <Button
                    type="button"
                    data-test="new-billing"
                    onClick={openNewBilling}
                >
                    New Billing
                </Button>
                <Button
                    type="button"
                    variant="outline"
                    onClick={openPatientRegistration}
                >
                    Patient Registration
                </Button>
                <Button asChild variant="secondary">
                    <Link href={history(teamSlug).url}>History</Link>
                </Button>
            </div>
        ),
    });

    return (
        <>
            <Head title="Billings" />

            <div className="flex w-full flex-col space-y-6 p-4 md:p-6 lg:p-8">
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
                                        {currencySymbol}{' '}
                                        {card.value.toLocaleString()}
                                    </div>
                                    <p className="mt-1 text-xs text-muted-foreground">
                                        {card.count} bill
                                        {card.count !== 1 ? 's' : ''}
                                    </p>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>

                <Card>
                    {/* Billing selector - full width */}
                    <div className="border-b px-6 py-4">
                        <div className="max-w-md space-y-2">
                            <div className="flex items-center gap-3">
                                <div className="flex-1">
                                    <Label htmlFor="billing-select">
                                        Billing from
                                    </Label>
                                    <SelectNative
                                        id="billing-select"
                                        value={billingId}
                                        onChange={(event) =>
                                            chooseBilling(event.target.value)
                                        }
                                        data-test="billing-select"
                                    >
                                        <option value="">
                                            Select a bill...
                                        </option>
                                        {billings.map((billing) => (
                                            <option
                                                key={billing.id}
                                                value={billing.id}
                                            >
                                                {billing.patientId}{' '}
                                                {billing.patientName ?? ''}
                                            </option>
                                        ))}
                                    </SelectNative>
                                    <InputError
                                        message={fieldErrors.billing_id}
                                    />
                                </div>
                                {selected && (
                                    <div className="flex items-center gap-3">
                                        <div className="flex-shrink-0">
                                            <Label className="text-xs text-muted-foreground">
                                                Category
                                            </Label>
                                            <p className="text-sm font-medium">
                                                {selected.categoryName ?? '—'}
                                            </p>
                                        </div>
                                        <Badge
                                            variant={
                                                selected.isAdmitted
                                                    ? 'default'
                                                    : 'secondary'
                                            }
                                            data-test="patient-admission-badge"
                                        >
                                            {selected.isAdmitted
                                                ? 'On Admission'
                                                : 'OPD'}
                                        </Badge>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Three-column layout */}
                    {selected ? (
                        <div className="grid grid-cols-1 gap-0 lg:grid-cols-12">
                            {/* LEFT SIDEBAR - Calculator inline (col-span-2) */}
                            <div className="border-r p-6 lg:col-span-2">
                                <div className="space-y-4">
                                    <div>
                                        <h4 className="mb-3 text-sm font-semibold text-muted-foreground">
                                            Calculator
                                        </h4>
                                        <div ref={calculatorRef}>
                                            {/* Display */}
                                            <div className="mb-2 rounded-md bg-muted p-2 text-right">
                                                <div className="min-h-[1.25rem] text-[10px] text-muted-foreground">
                                                    {calcPreviousValue !==
                                                        null && calcOperation
                                                        ? `${calcPreviousValue} ${calcOperation}`
                                                        : ''}
                                                </div>
                                                <div className="truncate text-lg font-semibold tabular-nums">
                                                    {calcDisplay}
                                                </div>
                                            </div>

                                            {/* Button Grid */}
                                            <div className="grid grid-cols-4 gap-1.5">
                                                <button
                                                    type="button"
                                                    aria-label="Clear calculator"
                                                    onClick={calcHandleClear}
                                                    className="flex aspect-square items-center justify-center rounded-md text-xs font-medium font-semibold text-destructive transition-colors hover:bg-muted focus:ring-2 focus:ring-primary focus:ring-offset-1 focus:outline-none"
                                                >
                                                    C
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={
                                                        calcHandleToggleSign
                                                    }
                                                    className="flex aspect-square items-center justify-center rounded-md text-xs font-medium text-muted-foreground transition-colors hover:bg-muted focus:ring-2 focus:ring-primary focus:ring-offset-1 focus:outline-none"
                                                >
                                                    ±
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={calcHandlePercent}
                                                    className="flex aspect-square items-center justify-center rounded-md text-xs font-medium text-muted-foreground transition-colors hover:bg-muted focus:ring-2 focus:ring-primary focus:ring-offset-1 focus:outline-none"
                                                >
                                                    %
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        calcHandleOperation('÷')
                                                    }
                                                    className="flex aspect-square items-center justify-center rounded-md bg-primary/10 text-xs font-medium text-primary transition-colors hover:bg-muted hover:bg-primary/20 focus:ring-2 focus:ring-primary focus:ring-offset-1 focus:outline-none"
                                                >
                                                    ÷
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        calcHandleNumber('7')
                                                    }
                                                    className="flex aspect-square items-center justify-center rounded-md text-xs font-medium transition-colors hover:bg-muted focus:ring-2 focus:ring-primary focus:ring-offset-1 focus:outline-none"
                                                >
                                                    7
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        calcHandleNumber('8')
                                                    }
                                                    className="flex aspect-square items-center justify-center rounded-md text-xs font-medium transition-colors hover:bg-muted focus:ring-2 focus:ring-primary focus:ring-offset-1 focus:outline-none"
                                                >
                                                    8
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        calcHandleNumber('9')
                                                    }
                                                    className="flex aspect-square items-center justify-center rounded-md text-xs font-medium transition-colors hover:bg-muted focus:ring-2 focus:ring-primary focus:ring-offset-1 focus:outline-none"
                                                >
                                                    9
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        calcHandleOperation('×')
                                                    }
                                                    className="flex aspect-square items-center justify-center rounded-md bg-primary/10 text-xs font-medium text-primary transition-colors hover:bg-muted hover:bg-primary/20 focus:ring-2 focus:ring-primary focus:ring-offset-1 focus:outline-none"
                                                >
                                                    ×
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        calcHandleNumber('4')
                                                    }
                                                    className="flex aspect-square items-center justify-center rounded-md text-xs font-medium transition-colors hover:bg-muted focus:ring-2 focus:ring-primary focus:ring-offset-1 focus:outline-none"
                                                >
                                                    4
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        calcHandleNumber('5')
                                                    }
                                                    className="flex aspect-square items-center justify-center rounded-md text-xs font-medium transition-colors hover:bg-muted focus:ring-2 focus:ring-primary focus:ring-offset-1 focus:outline-none"
                                                >
                                                    5
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        calcHandleNumber('6')
                                                    }
                                                    className="flex aspect-square items-center justify-center rounded-md text-xs font-medium transition-colors hover:bg-muted focus:ring-2 focus:ring-primary focus:ring-offset-1 focus:outline-none"
                                                >
                                                    6
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        calcHandleOperation('-')
                                                    }
                                                    className="flex aspect-square items-center justify-center rounded-md bg-primary/10 text-xs font-medium text-primary transition-colors hover:bg-muted hover:bg-primary/20 focus:ring-2 focus:ring-primary focus:ring-offset-1 focus:outline-none"
                                                >
                                                    -
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        calcHandleNumber('1')
                                                    }
                                                    className="flex aspect-square items-center justify-center rounded-md text-xs font-medium transition-colors hover:bg-muted focus:ring-2 focus:ring-primary focus:ring-offset-1 focus:outline-none"
                                                >
                                                    1
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        calcHandleNumber('2')
                                                    }
                                                    className="flex aspect-square items-center justify-center rounded-md text-xs font-medium transition-colors hover:bg-muted focus:ring-2 focus:ring-primary focus:ring-offset-1 focus:outline-none"
                                                >
                                                    2
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        calcHandleNumber('3')
                                                    }
                                                    className="flex aspect-square items-center justify-center rounded-md text-xs font-medium transition-colors hover:bg-muted focus:ring-2 focus:ring-primary focus:ring-offset-1 focus:outline-none"
                                                >
                                                    3
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        calcHandleOperation('+')
                                                    }
                                                    className="flex aspect-square items-center justify-center rounded-md bg-primary/10 text-xs font-medium text-primary transition-colors hover:bg-muted hover:bg-primary/20 focus:ring-2 focus:ring-primary focus:ring-offset-1 focus:outline-none"
                                                >
                                                    +
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        calcHandleNumber('0')
                                                    }
                                                    className="flex aspect-square items-center justify-center rounded-md text-xs font-medium transition-colors hover:bg-muted focus:ring-2 focus:ring-primary focus:ring-offset-1 focus:outline-none"
                                                >
                                                    0
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={calcHandleDecimal}
                                                    className="flex aspect-square items-center justify-center rounded-md text-xs font-medium transition-colors hover:bg-muted focus:ring-2 focus:ring-primary focus:ring-offset-1 focus:outline-none"
                                                >
                                                    .
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={calcHandleEquals}
                                                    className="flex aspect-square items-center justify-center rounded-md bg-primary text-xs font-medium text-primary-foreground transition-colors hover:bg-muted hover:bg-primary/90 focus:ring-2 focus:ring-primary focus:ring-offset-1 focus:outline-none"
                                                >
                                                    =
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* CENTER PANEL - Payment Methods as Tabs (col-span-5) */}
                            <div className="p-6 lg:col-span-5">
                                <div className="space-y-4">
                                    {/* Billable type header */}
                                    <div className="rounded-md border bg-muted/30 px-4 py-3">
                                        <p className="text-sm font-semibold">
                                            {selected.billableType ?? 'Billing'}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            Ordered by:{' '}
                                            {selected.requestedBy ?? '—'}
                                        </p>
                                    </div>

                                    {/* Payment methods table */}
                                    <div className="space-y-2">
                                        <div className="overflow-visible rounded-lg border">
                                            <Table overflow="overflow-visible">
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead className="w-[65%] text-sm">
                                                            Payment Method
                                                        </TableHead>
                                                        <TableHead className="w-[35%] text-sm">
                                                            Amount
                                                        </TableHead>
                                                        <TableHead className="w-10"></TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {payments.length > 0 ? (
                                                        payments.map(
                                                            (row, index) => {
                                                                const name =
                                                                    methodName(
                                                                        row,
                                                                    );
                                                                const rowElement =
                                                                    (
                                                                        <TableRow
                                                                            key={
                                                                                index
                                                                            }
                                                                        >
                                                                            <TableCell className="py-3">
                                                                                <div className="space-y-2">
                                                                                    <Label
                                                                                        htmlFor={`payment-method-${index}`}
                                                                                        className="sr-only"
                                                                                    >
                                                                                        Payment
                                                                                        method{' '}
                                                                                        {index +
                                                                                            1}
                                                                                    </Label>
                                                                                    <SelectNative
                                                                                        id={`payment-method-${index}`}
                                                                                        value={
                                                                                            row.method_id
                                                                                        }
                                                                                        className={`w-full ${paymentMethodErrors.includes(index) ? 'border-destructive' : ''}`}
                                                                                        onChange={(
                                                                                            event,
                                                                                        ) => {
                                                                                            const newMethodId =
                                                                                                event
                                                                                                    .target
                                                                                                    .value;

                                                                                            updatePayment(
                                                                                                index,
                                                                                                {
                                                                                                    method_id:
                                                                                                        newMethodId,
                                                                                                },
                                                                                            );

                                                                                            const newMethodName =
                                                                                                methodsById.get(
                                                                                                    Number(
                                                                                                        newMethodId,
                                                                                                    ),
                                                                                                ) ??
                                                                                                '';

                                                                                            if (
                                                                                                newMethodName ===
                                                                                                    'Discount' &&
                                                                                                selected?.discountPercentage >
                                                                                                    0
                                                                                            ) {
                                                                                                const pct =
                                                                                                    selected.discountPercentage;
                                                                                                const amt =
                                                                                                    (selected.total *
                                                                                                        pct) /
                                                                                                    100;
                                                                                                updatePayment(
                                                                                                    index,
                                                                                                    {
                                                                                                        discount_percentage:
                                                                                                            String(
                                                                                                                pct,
                                                                                                            ),
                                                                                                        discount_amount:
                                                                                                            String(
                                                                                                                amt,
                                                                                                            ),
                                                                                                    },
                                                                                                );
                                                                                            }

                                                                                            setPaymentMethodErrors(
                                                                                                (
                                                                                                    current,
                                                                                                ) =>
                                                                                                    current.filter(
                                                                                                        (
                                                                                                            i,
                                                                                                        ) =>
                                                                                                            i !==
                                                                                                            index,
                                                                                                    ),
                                                                                            );
                                                                                        }}
                                                                                        data-test="payment-method"
                                                                                    >
                                                                                        <option value="">
                                                                                            Select
                                                                                            method...
                                                                                        </option>
                                                                                        {methods.map(
                                                                                            (
                                                                                                method,
                                                                                            ) => (
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
                                                                                        <InputError
                                                                                            className="text-xs"
                                                                                            message={
                                                                                                fieldErrors[
                                                                                                    `payments.${index}.method_id`
                                                                                                ] ??
                                                                                                'Please select a payment method.'
                                                                                            }
                                                                                        />
                                                                                    ) : null}

                                                                                    {name ===
                                                                                        'Discount' && (
                                                                                        <div className="space-y-2">
                                                                                            <div className="flex items-center justify-between">
                                                                                                <Label>
                                                                                                    Discount
                                                                                                    amount
                                                                                                </Label>
                                                                                                {selected?.discountPercentage >
                                                                                                    0 &&
                                                                                                    row.discount_percentage !==
                                                                                                        '0' && (
                                                                                                        <Badge
                                                                                                            variant="secondary"
                                                                                                            className="text-xs"
                                                                                                        >
                                                                                                            {
                                                                                                                row.discount_percentage
                                                                                                            }
                                                                                                            %{' '}
                                                                                                            {selected.categoryName ??
                                                                                                                'category'}{' '}
                                                                                                            discount
                                                                                                        </Badge>
                                                                                                    )}
                                                                                            </div>
                                                                                            <Input
                                                                                                type="number"
                                                                                                className="w-full"
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
                                                                                    )}

                                                                                    {name ===
                                                                                        'Wallet' && (
                                                                                        <div className="space-y-2">
                                                                                            <div
                                                                                                ref={(
                                                                                                    el,
                                                                                                ) => {
                                                                                                    walletPatientSearchContainerRefs.current[
                                                                                                        index
                                                                                                    ] =
                                                                                                        el;
                                                                                                }}
                                                                                            >
                                                                                                <Label>
                                                                                                    Credit
                                                                                                    to
                                                                                                    patient
                                                                                                    <span className="ml-1 text-muted-foreground">
                                                                                                        (default:{' '}
                                                                                                        {
                                                                                                            selected?.patientId
                                                                                                        }
                                                                                                        )
                                                                                                    </span>
                                                                                                </Label>
                                                                                                <div className="relative">
                                                                                                    <Input
                                                                                                        data-test="wallet-patient"
                                                                                                        className="w-full"
                                                                                                        ref={(
                                                                                                            el,
                                                                                                        ) => {
                                                                                                            walletPatientSearchInputRefs.current[
                                                                                                                index
                                                                                                            ] =
                                                                                                                el;
                                                                                                        }}
                                                                                                        placeholder="Search patient by name, code, or phone…"
                                                                                                        value={
                                                                                                            row.wallet_patient_id
                                                                                                                ? getWalletPatientLabel(
                                                                                                                      index,
                                                                                                                      row.wallet_patient_id,
                                                                                                                  )
                                                                                                                : (walletPatientSearchQueries[
                                                                                                                      index
                                                                                                                  ] ??
                                                                                                                  '')
                                                                                                        }
                                                                                                        readOnly={
                                                                                                            !!row.wallet_patient_id
                                                                                                        }
                                                                                                        onClick={() => {
                                                                                                            if (
                                                                                                                !row.wallet_patient_id
                                                                                                            ) {
                                                                                                                setWalletPatientSearchOpen(
                                                                                                                    (
                                                                                                                        prev,
                                                                                                                    ) => ({
                                                                                                                        ...prev,
                                                                                                                        [index]: true,
                                                                                                                    }),
                                                                                                                );
                                                                                                            }
                                                                                                        }}
                                                                                                        onChange={(
                                                                                                            event,
                                                                                                        ) => {
                                                                                                            const value =
                                                                                                                event
                                                                                                                    .target
                                                                                                                    .value;
                                                                                                            updatePayment(
                                                                                                                index,
                                                                                                                {
                                                                                                                    wallet_patient_id:
                                                                                                                        '',
                                                                                                                },
                                                                                                            );
                                                                                                            setWalletPatientSearchQueries(
                                                                                                                (
                                                                                                                    prev,
                                                                                                                ) => ({
                                                                                                                    ...prev,
                                                                                                                    [index]:
                                                                                                                        value,
                                                                                                                }),
                                                                                                            );
                                                                                                            searchWalletPatients(
                                                                                                                index,
                                                                                                                value,
                                                                                                            );
                                                                                                            setWalletPatientSearchOpen(
                                                                                                                (
                                                                                                                    prev,
                                                                                                                ) => ({
                                                                                                                    ...prev,
                                                                                                                    [index]: true,
                                                                                                                }),
                                                                                                            );
                                                                                                        }}
                                                                                                    />
                                                                                                    {walletPatientSearchOpen[
                                                                                                        index
                                                                                                    ] &&
                                                                                                        !row.wallet_patient_id && (
                                                                                                            <div className="absolute right-0 left-0 z-50 mt-1 max-h-60 overflow-auto rounded-md border bg-popover shadow-lg">
                                                                                                                <div className="flex flex-col">
                                                                                                                    {walletPatientSearchLoading[
                                                                                                                        index
                                                                                                                    ] && (
                                                                                                                        <div className="px-3 py-2 text-xs text-muted-foreground">
                                                                                                                            Searching…
                                                                                                                        </div>
                                                                                                                    )}
                                                                                                                    {!walletPatientSearchLoading[
                                                                                                                        index
                                                                                                                    ] &&
                                                                                                                        (
                                                                                                                            walletPatientSearchResults[
                                                                                                                                index
                                                                                                                            ] ??
                                                                                                                            []
                                                                                                                        )
                                                                                                                            .length ===
                                                                                                                            0 &&
                                                                                                                        walletPatientSearchQueries[
                                                                                                                            index
                                                                                                                        ]?.trim() && (
                                                                                                                            <div className="px-3 py-2 text-xs text-muted-foreground">
                                                                                                                                No
                                                                                                                                patients
                                                                                                                                found
                                                                                                                            </div>
                                                                                                                        )}
                                                                                                                    {(
                                                                                                                        walletPatientSearchResults[
                                                                                                                            index
                                                                                                                        ] ??
                                                                                                                        []
                                                                                                                    ).map(
                                                                                                                        (
                                                                                                                            patient,
                                                                                                                        ) => (
                                                                                                                            <button
                                                                                                                                key={
                                                                                                                                    patient.slug
                                                                                                                                }
                                                                                                                                type="button"
                                                                                                                                className="w-full px-3 py-2 text-left text-sm hover:bg-accent"
                                                                                                                                onClick={() => {
                                                                                                                                    updatePayment(
                                                                                                                                        index,
                                                                                                                                        {
                                                                                                                                            wallet_patient_id:
                                                                                                                                                patient.slug,
                                                                                                                                        },
                                                                                                                                    );
                                                                                                                                    setWalletPatientSearchQueries(
                                                                                                                                        (
                                                                                                                                            prev,
                                                                                                                                        ) => {
                                                                                                                                            const next =
                                                                                                                                                {
                                                                                                                                                    ...prev,
                                                                                                                                                };
                                                                                                                                            delete next[
                                                                                                                                                index
                                                                                                                                            ];
                                                                                                                                            return next;
                                                                                                                                        },
                                                                                                                                    );
                                                                                                                                    setWalletPatientSearchOpen(
                                                                                                                                        (
                                                                                                                                            prev,
                                                                                                                                        ) => ({
                                                                                                                                            ...prev,
                                                                                                                                            [index]: false,
                                                                                                                                        }),
                                                                                                                                    );
                                                                                                                                }}
                                                                                                                            >
                                                                                                                                {
                                                                                                                                    patient.label
                                                                                                                                }
                                                                                                                            </button>
                                                                                                                        ),
                                                                                                                    )}
                                                                                                                </div>
                                                                                                            </div>
                                                                                                        )}
                                                                                                </div>
                                                                                            </div>
                                                                                        </div>
                                                                                    )}
                                                                                </div>
                                                                            </TableCell>
                                                                            <TableCell className="py-3">
                                                                                {!SPECIAL_METHODS.includes(
                                                                                    name,
                                                                                ) ? (
                                                                                    <div className="space-y-1">
                                                                                        <Label
                                                                                            htmlFor={`payment-amount-${index}`}
                                                                                            className="sr-only"
                                                                                        >
                                                                                            Amount{' '}
                                                                                            {index +
                                                                                                1}
                                                                                        </Label>
                                                                                        <Input
                                                                                            id={`payment-amount-${index}`}
                                                                                            type="number"
                                                                                            className="w-full"
                                                                                            value={
                                                                                                row.amount
                                                                                            }
                                                                                            onChange={(
                                                                                                event,
                                                                                            ) =>
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
                                                                                        <InputError
                                                                                            className="text-xs"
                                                                                            message={
                                                                                                fieldErrors[
                                                                                                    `payments.${index}.amount`
                                                                                                ]
                                                                                            }
                                                                                        />
                                                                                    </div>
                                                                                ) : name ===
                                                                                  'Discount' ? (
                                                                                    <div className="space-y-1">
                                                                                        <Input
                                                                                            type="number"
                                                                                            className="w-full"
                                                                                            readOnly
                                                                                            value={
                                                                                                row.discount_amount
                                                                                                    ? (
                                                                                                          selected.total -
                                                                                                          parseFloat(
                                                                                                              row.discount_amount,
                                                                                                          )
                                                                                                      ).toFixed(
                                                                                                          2,
                                                                                                      )
                                                                                                    : selected.total
                                                                                            }
                                                                                        />
                                                                                        {row.discount_amount &&
                                                                                            parseFloat(
                                                                                                row.discount_amount,
                                                                                            ) >
                                                                                                0 && (
                                                                                                <p className="truncate text-xs text-muted-foreground">
                                                                                                    Remaining
                                                                                                    after{' '}
                                                                                                    {
                                                                                                        row.discount_percentage
                                                                                                    }
                                                                                                    %
                                                                                                    discount
                                                                                                </p>
                                                                                            )}
                                                                                    </div>
                                                                                ) : name ===
                                                                                  'Wallet' ? (
                                                                                    <Input
                                                                                        type="number"
                                                                                        className="w-full"
                                                                                        value={
                                                                                            row.wallet_debit
                                                                                        }
                                                                                        onChange={(
                                                                                            event,
                                                                                        ) =>
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
                                                                                ) : name ===
                                                                                      'Mercy Fund' ||
                                                                                  name ===
                                                                                      'Infant Formula' ? (
                                                                                    <Input
                                                                                        type="number"
                                                                                        className="w-full"
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
                                                                                ) : null}
                                                                            </TableCell>
                                                                            <TableCell>
                                                                                {payments.length >
                                                                                    1 && (
                                                                                    <Button
                                                                                        type="button"
                                                                                        variant="ghost"
                                                                                        size="sm"
                                                                                        className="size-8 p-0 hover:bg-destructive/10 hover:text-destructive"
                                                                                        aria-label={`Remove payment method ${index + 1}`}
                                                                                        onClick={() =>
                                                                                            removePayment(
                                                                                                index,
                                                                                            )
                                                                                        }
                                                                                    >
                                                                                        <X className="size-4" />
                                                                                    </Button>
                                                                                )}
                                                                            </TableCell>
                                                                        </TableRow>
                                                                    );

                                                                if (
                                                                    name ===
                                                                        'Mercy Fund' ||
                                                                    name ===
                                                                        'Infant Formula'
                                                                ) {
                                                                    return (
                                                                        <>
                                                                            {
                                                                                rowElement
                                                                            }
                                                                            <TableRow
                                                                                key={`coupon-${index}`}
                                                                            >
                                                                                <TableCell className="py-2">
                                                                                    <SelectNative
                                                                                        className="w-full"
                                                                                        value={
                                                                                            row.coupon_id
                                                                                        }
                                                                                        onChange={(
                                                                                            event,
                                                                                        ) => {
                                                                                            const selectedCoupon =
                                                                                                coupons.find(
                                                                                                    (
                                                                                                        c,
                                                                                                    ) =>
                                                                                                        String(
                                                                                                            c.id,
                                                                                                        ) ===
                                                                                                            event
                                                                                                                .target
                                                                                                                .value &&
                                                                                                        c.patientId ===
                                                                                                            selected?.patientId,
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
                                                                                                            ? String(
                                                                                                                  selectedCoupon.value,
                                                                                                              )
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
                                                                                                (
                                                                                                    c,
                                                                                                ) =>
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
                                                                                                        {
                                                                                                            coupon.code
                                                                                                        }{' '}
                                                                                                        -{' '}
                                                                                                        {coupon.type ===
                                                                                                        'percentage'
                                                                                                            ? `${coupon.value}%`
                                                                                                            : `${currencySymbol} ${coupon.value}`}{' '}
                                                                                                        (Balance:{' '}
                                                                                                        {
                                                                                                            currencySymbol
                                                                                                        }{' '}
                                                                                                        {
                                                                                                            coupon.balance
                                                                                                        }
                                                                                                        )
                                                                                                    </option>
                                                                                                ),
                                                                                            )}
                                                                                    </SelectNative>
                                                                                </TableCell>
                                                                                <TableCell
                                                                                    colSpan={
                                                                                        2
                                                                                    }
                                                                                ></TableCell>
                                                                            </TableRow>
                                                                        </>
                                                                    );
                                                                }

                                                                return rowElement;
                                                            },
                                                        )
                                                    ) : (
                                                        <TableRow>
                                                            <TableCell
                                                                colSpan={3}
                                                                className="text-center text-sm text-muted-foreground"
                                                            >
                                                                No payment
                                                                methods added.
                                                            </TableCell>
                                                        </TableRow>
                                                    )}
                                                </TableBody>
                                            </Table>
                                        </div>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            className="w-full"
                                            onClick={addPayment}
                                        >
                                            <Plus className="mr-1 size-3" />
                                            Add Payment Method
                                        </Button>
                                    </div>

                                    {error ? (
                                        <AlertError
                                            errors={[error]}
                                            title="Unable to record payment"
                                        />
                                    ) : null}

                                    <div className="flex items-center gap-2">
                                        <Button
                                            type="button"
                                            onClick={submit}
                                            disabled={processing}
                                            data-test="submit-payment"
                                        >
                                            {processing
                                                ? 'Saving...'
                                                : 'Record payment'}
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            {/* RIGHT SIDEBAR - Summary (col-span-5) */}
                            <div className="p-6 lg:col-span-5">
                                <div className="space-y-6">
                                    {/* Timer-like summary card */}
                                    <div className="rounded-lg border p-4 text-center">
                                        <div className="mx-auto mb-3 flex h-24 w-24 items-center justify-center rounded-full border-4 border-orange-500 dark:border-orange-400">
                                            <div className="text-center">
                                                <p className="text-xs text-muted-foreground">
                                                    Amount Due
                                                </p>
                                                <p className="text-lg font-bold text-orange-600 dark:text-orange-400">
                                                    {currencySymbol}
                                                    {selected.total.toLocaleString()}
                                                </p>
                                            </div>
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            Discount:{' '}
                                            {selected.discountPercentage}%
                                        </p>
                                    </div>

                                    {/* Line items panel */}
                                    <div className="space-y-2">
                                        <p className="text-sm font-semibold text-muted-foreground">
                                            Line Items Requested (
                                            {selected.lines.length})
                                        </p>
                                        <div className="max-h-60 overflow-y-auto rounded-lg border">
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead className="text-xs">
                                                            Item
                                                        </TableHead>
                                                        <TableHead className="text-xs">
                                                            Qty
                                                        </TableHead>
                                                        <TableHead className="text-xs">
                                                            Price
                                                        </TableHead>
                                                        <TableHead className="text-xs">
                                                            Subtotal
                                                        </TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {selected.lines.length >
                                                    0 ? (
                                                        selected.lines.map(
                                                            (line) => (
                                                                <TableRow
                                                                    key={
                                                                        line.id
                                                                    }
                                                                >
                                                                    <TableCell className="text-xs">
                                                                        {line.name ??
                                                                            '-'}
                                                                    </TableCell>
                                                                    <TableCell className="text-xs">
                                                                        {line.quantity ??
                                                                            1}
                                                                    </TableCell>
                                                                    <TableCell className="text-xs">
                                                                        {line.unitPrice.toLocaleString()}
                                                                    </TableCell>
                                                                    <TableCell className="text-xs">
                                                                        {line.totalPrice.toLocaleString()}
                                                                    </TableCell>
                                                                </TableRow>
                                                            ),
                                                        )
                                                    ) : (
                                                        <TableRow>
                                                            <TableCell
                                                                colSpan={4}
                                                                className="text-center text-xs text-muted-foreground"
                                                            >
                                                                No items
                                                                requested.
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
                                </div>
                            </div>
                        </div>
                    ) : null}
                </Card>
            </div>

            <Sheet open={newOpen} onOpenChange={setNewOpen}>
                <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
                    <SheetHeader>
                        <SheetTitle>Patient Registration</SheetTitle>
                        <SheetDescription>
                            Register a new patient and add billing lines.
                        </SheetDescription>
                    </SheetHeader>

                    <div className="space-y-4 px-4 pb-6">
                        <div
                            className="space-y-2"
                            ref={patientSearchContainerRef}
                        >
                            <Label htmlFor="existing-patient">
                                Existing patient
                            </Label>
                            <div className="relative">
                                <Input
                                    id="existing-patient"
                                    data-test="new-billing-patient"
                                    ref={patientSearchInputRef}
                                    placeholder="Search patient by name, code, or phone…"
                                    value={
                                        displayPatientLabel ||
                                        patientSearchQuery
                                    }
                                    readOnly={!!existingPatientId}
                                    aria-invalid={
                                        !!newFieldErrors.existing_patient_id
                                    }
                                    onClick={() => {
                                        if (!existingPatientId) {
                                            setPatientSearchOpen(true);
                                        }
                                    }}
                                    onChange={(event) => {
                                        const value = event.target.value;
                                        setExistingPatientId('');
                                        setSelectedPatientLabel('');
                                        setPatientSearchQuery(value);
                                        searchPatients(value);
                                        setPatientSearchOpen(true);
                                    }}
                                />
                                <InputError
                                    message={newFieldErrors.existing_patient_id}
                                />
                                {patientSearchOpen && !existingPatientId && (
                                    <div className="absolute right-0 left-0 z-50 mt-1 max-h-60 overflow-auto rounded-md border bg-popover shadow-lg">
                                        {patientSearchLoading && (
                                            <div className="px-3 py-2 text-xs text-muted-foreground">
                                                Searching…
                                            </div>
                                        )}
                                        {!patientSearchLoading &&
                                            patientSearchResults.length === 0 &&
                                            patientSearchQuery.trim() && (
                                                <div className="px-3 py-2 text-xs text-muted-foreground">
                                                    No patients found
                                                </div>
                                            )}
                                        <button
                                            type="button"
                                            className="w-full px-3 py-2 text-left text-sm hover:bg-accent"
                                            onClick={() => {
                                                setExistingPatientId('');
                                                setSelectedPatientLabel('');
                                                setPatientSearchQuery('');
                                                setPatientSearchResults([]);
                                                setPatientSearchOpen(false);
                                            }}
                                        >
                                            <span className="text-muted-foreground">
                                                Create a new patient…
                                            </span>
                                        </button>
                                        {patientSearchResults.map((option) => (
                                            <button
                                                key={option.slug}
                                                type="button"
                                                className="w-full px-3 py-2 text-left text-sm hover:bg-accent"
                                                onClick={() => {
                                                    setExistingPatientId(
                                                        option.slug,
                                                    );
                                                    setSelectedPatientLabel(
                                                        option.label,
                                                    );
                                                    setPatient({
                                                        art: option.art ?? '',
                                                        slugOther:
                                                            option.slugOther ??
                                                            '',
                                                        category_id:
                                                            option.category_id ??
                                                            '',
                                                        firstName:
                                                            option.firstName ??
                                                            '',
                                                        middleName:
                                                            option.middleName ??
                                                            '',
                                                        lastName:
                                                            option.lastName ??
                                                            '',
                                                        gender:
                                                            option.gender ??
                                                            'Male',
                                                        birthDate:
                                                            option.birthDate ??
                                                            '',
                                                        email:
                                                            option.email ?? '',
                                                        maritalStatus:
                                                            option.maritalStatus ??
                                                            '',
                                                        phone:
                                                            option.phone ?? '',
                                                        mobile:
                                                            option.mobile ?? '',
                                                        country_id:
                                                            option.country_id ??
                                                            '',
                                                        state_id:
                                                            option.state_id ??
                                                            '',
                                                        lga_id:
                                                            option.lga_id ?? '',
                                                        address:
                                                            option.address ??
                                                            '',
                                                        kinFullName:
                                                            option.kinFullName ??
                                                            '',
                                                        kinPhone:
                                                            option.kinPhone ??
                                                            '',
                                                        kinEmail:
                                                            option.kinEmail ??
                                                            '',
                                                        relation:
                                                            option.relation ??
                                                            '',
                                                    });
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

                        <div className="grid gap-3 sm:grid-cols-3">
                            <div className="space-y-2">
                                <Label>Hospital number</Label>
                                <Input
                                    value={
                                        existingPatientId ||
                                        newBillingOptions.nextHospitalNumber
                                    }
                                    readOnly
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Art No</Label>
                                <Input
                                    value={patient.art}
                                    onChange={(event) =>
                                        setPatient({
                                            ...patient,
                                            art: event.target.value,
                                        })
                                    }
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>NHIS / Other</Label>
                                <Input
                                    value={patient.slugOther}
                                    onChange={(event) =>
                                        setPatient({
                                            ...patient,
                                            slugOther: event.target.value,
                                        })
                                    }
                                />
                            </div>
                        </div>

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
                                <div className="flex items-center gap-2">
                                    <Input
                                        type="date"
                                        value={patient.birthDate}
                                        onChange={(event) =>
                                            setPatient({
                                                ...patient,
                                                birthDate: event.target.value,
                                            })
                                        }
                                        className="flex-1"
                                    />
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="icon"
                                        onClick={() => setCalculatorOpen(true)}
                                        className="shrink-0"
                                        aria-label="Open calculator"
                                    >
                                        <Calculator className="size-4" />
                                    </Button>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Marital status</Label>
                                <SelectNative
                                    value={patient.maritalStatus}
                                    onChange={(event) =>
                                        setPatient({
                                            ...patient,
                                            maritalStatus: event.target.value,
                                        })
                                    }
                                >
                                    <option value="">Select…</option>
                                    <option value="Single">Single</option>
                                    <option value="Married">Married</option>
                                    <option value="Divorced">Divorced</option>
                                    <option value="Widowed">Widowed</option>
                                    <option value="Separated">Separated</option>
                                </SelectNative>
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
                                    {newBillingOptions.states.map((state) => (
                                        <option key={state.id} value={state.id}>
                                            {state.name}
                                        </option>
                                    ))}
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

                        <div className="space-y-4">
                            <Label>Next of Kin</Label>
                            <div className="grid gap-3 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label>Full name</Label>
                                    <Input
                                        value={patient.kinFullName}
                                        onChange={(event) =>
                                            setPatient({
                                                ...patient,
                                                kinFullName: event.target.value,
                                            })
                                        }
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Phone</Label>
                                    <Input
                                        value={patient.kinPhone}
                                        onChange={(event) =>
                                            setPatient({
                                                ...patient,
                                                kinPhone: event.target.value,
                                            })
                                        }
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Email</Label>
                                    <Input
                                        type="email"
                                        value={patient.kinEmail}
                                        onChange={(event) =>
                                            setPatient({
                                                ...patient,
                                                kinEmail: event.target.value,
                                            })
                                        }
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Relation</Label>
                                    <SelectNative
                                        value={patient.relation}
                                        onChange={(event) =>
                                            setPatient({
                                                ...patient,
                                                relation: event.target.value,
                                            })
                                        }
                                    >
                                        <option value="">
                                            Select relation…
                                        </option>
                                        <option value="Father">Father</option>
                                        <option value="Mother">Mother</option>
                                        <option value="Spouse">Spouse</option>
                                        <option value="Husband">Husband</option>
                                        <option value="Wife">Wife</option>
                                        <option value="Sibling">Sibling</option>
                                        <option value="Brother">Brother</option>
                                        <option value="Sister">Sister</option>
                                        <option value="Son">Son</option>
                                        <option value="Daughter">
                                            Daughter
                                        </option>
                                        <option value="Grandparent">
                                            Grandparent
                                        </option>
                                        <option value="Grandchild">
                                            Grandchild
                                        </option>
                                        <option value="Friend">Friend</option>
                                        <option value="Colleague">
                                            Colleague
                                        </option>
                                        <option value="Other">Other</option>
                                    </SelectNative>
                                </div>
                            </div>
                        </div>

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
                            <AlertError
                                errors={[newError]}
                                title="Unable to register patient and bill"
                            />
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

                    <FloatingCalculator
                        modal={true}
                        showToggle={false}
                        isOpen={calculatorOpen}
                        onOpenChange={setCalculatorOpen}
                    />
                </SheetContent>
            </Sheet>

            {/* Service Billing Modal - Treatment-like UI */}
            <Sheet open={serviceOpen} onOpenChange={setServiceOpen}>
                <SheetContent className="w-full overflow-y-auto sm:max-w-2xl">
                    <SheetHeader>
                        <SheetTitle>New Billing</SheetTitle>
                        <SheetDescription>
                            Raise invoices for a patient and add services.
                        </SheetDescription>
                    </SheetHeader>

                    <div className="space-y-4 px-4 pb-6">
                        {/* Patient Search */}
                        <div
                            className="space-y-2"
                            ref={servicePatientSearchContainerRef}
                        >
                            <Label htmlFor="service-existing-patient">
                                Existing patient
                            </Label>
                            <div className="relative">
                                <Input
                                    id="service-existing-patient"
                                    data-test="new-billing-patient"
                                    ref={servicePatientSearchInputRef}
                                    placeholder="Search patient by name, code, or phone…"
                                    value={
                                        serviceExistingPatientId
                                            ? serviceSelectedPatientLabel
                                            : servicePatientSearchQuery
                                    }
                                    readOnly={!!serviceExistingPatientId}
                                    aria-invalid={
                                        !!serviceFieldErrors.existing_patient_id
                                    }
                                    onClick={() => {
                                        if (!serviceExistingPatientId) {
                                            setServicePatientSearchOpen(true);
                                        }
                                    }}
                                    onChange={(event) => {
                                        const value = event.target.value;
                                        setServiceExistingPatientId('');
                                        setServiceSelectedPatientLabel('');
                                        setServicePatientSearchQuery(value);
                                        searchPatients(value, true);
                                        setServicePatientSearchOpen(true);
                                    }}
                                />
                                <InputError
                                    message={
                                        serviceFieldErrors.existing_patient_id
                                    }
                                />
                                {servicePatientSearchOpen &&
                                    !serviceExistingPatientId && (
                                        <div className="absolute right-0 left-0 z-50 mt-1 max-h-60 overflow-auto rounded-md border bg-popover shadow-lg">
                                            {servicePatientSearchLoading && (
                                                <div className="px-3 py-2 text-xs text-muted-foreground">
                                                    Searching…
                                                </div>
                                            )}
                                            {!servicePatientSearchLoading &&
                                                servicePatientSearchResults.length ===
                                                    0 &&
                                                servicePatientSearchQuery.trim() && (
                                                    <div className="px-3 py-2 text-xs text-muted-foreground">
                                                        No patients found
                                                    </div>
                                                )}
                                            {servicePatientSearchResults.map(
                                                (option) => (
                                                    <button
                                                        key={option.slug}
                                                        type="button"
                                                        className="w-full px-3 py-2 text-left text-sm hover:bg-accent"
                                                        onClick={() => {
                                                            setServiceExistingPatientId(
                                                                option.slug,
                                                            );
                                                            setServiceSelectedPatientLabel(
                                                                option.label,
                                                            );
                                                            setServicePatientSearchQuery(
                                                                '',
                                                            );
                                                            setServicePatientSearchResults(
                                                                [],
                                                            );
                                                            setServicePatientSearchOpen(
                                                                false,
                                                            );
                                                        }}
                                                    >
                                                        {option.label}
                                                    </button>
                                                ),
                                            )}
                                        </div>
                                    )}
                            </div>
                        </div>

                        {/* Services Table - Treatment-like UI */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <Label>Services</Label>
                                <Button
                                    type="button"
                                    size="sm"
                                    variant="secondary"
                                    onClick={() =>
                                        setServiceLines([
                                            ...serviceLines,
                                            {
                                                price_list_id: '',
                                                unitPrice: '',
                                            },
                                        ])
                                    }
                                >
                                    <Plus className="mr-1 h-4 w-4" />
                                    Add service
                                </Button>
                            </div>

                            {serviceLines.length > 0 ? (
                                <div className="rounded-lg border">
                                    <table className="w-full text-sm">
                                        <thead className="bg-muted/50">
                                            <tr>
                                                <th
                                                    className="px-4 py-2 text-left font-medium"
                                                    style={{ width: '70%' }}
                                                >
                                                    Service
                                                </th>
                                                <th
                                                    className="px-4 py-2 text-left font-medium"
                                                    style={{ width: '25%' }}
                                                >
                                                    Price
                                                </th>
                                                <th
                                                    className="px-4 py-2 text-center font-medium"
                                                    style={{ width: '5%' }}
                                                ></th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y">
                                            {serviceLines.map((line, index) => (
                                                <tr key={index}>
                                                    <td className="px-4 py-2">
                                                        <SelectNative
                                                            value={
                                                                line.price_list_id
                                                            }
                                                            placeholder="Select service…"
                                                            onChange={(event) =>
                                                                chooseService(
                                                                    index,
                                                                    event.target
                                                                        .value,
                                                                )
                                                            }
                                                        >
                                                            <option value="">
                                                                Select service…
                                                            </option>
                                                            {newBillingOptions.services.map(
                                                                (service) => (
                                                                    <option
                                                                        key={
                                                                            service.id
                                                                        }
                                                                        value={String(
                                                                            service.id,
                                                                        )}
                                                                    >
                                                                        {
                                                                            service.name
                                                                        }
                                                                    </option>
                                                                ),
                                                            )}
                                                        </SelectNative>
                                                    </td>
                                                    <td className="px-4 py-2">
                                                        <Input
                                                            value={
                                                                line.unitPrice
                                                            }
                                                            readOnly
                                                        />
                                                    </td>
                                                    <td className="px-4 py-2 text-center">
                                                        {serviceLines.length >
                                                        1 ? (
                                                            <button
                                                                type="button"
                                                                className="text-muted-foreground hover:text-destructive"
                                                                aria-label={`Remove service ${index + 1}`}
                                                                onClick={() =>
                                                                    setServiceLines(
                                                                        (
                                                                            current,
                                                                        ) =>
                                                                            current.filter(
                                                                                (
                                                                                    _,
                                                                                    i,
                                                                                ) =>
                                                                                    i !==
                                                                                    index,
                                                                            ),
                                                                    )
                                                                }
                                                            >
                                                                <X className="h-4 w-4" />
                                                            </button>
                                                        ) : null}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : null}

                            <div className="flex items-center justify-between rounded-md border px-3 py-2">
                                <span className="text-sm text-muted-foreground">
                                    Total
                                </span>
                                <span className="text-sm font-semibold tabular-nums">
                                    {currencySymbol}{' '}
                                    {serviceTotal.toLocaleString()}
                                </span>
                            </div>
                        </div>

                        {serviceError ? (
                            <AlertError
                                errors={[serviceError]}
                                title="Unable to create billing"
                            />
                        ) : null}

                        <div className="flex items-center gap-2">
                            <Button
                                type="button"
                                onClick={submitServiceBilling}
                                disabled={serviceProcessing}
                                data-test="submit-new-billing"
                            >
                                {serviceProcessing
                                    ? 'Saving...'
                                    : 'Create billing'}
                            </Button>
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => setServiceOpen(false)}
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
            href: index(props.currentTeam?.slug ?? '').url,
        },
    ],
});
