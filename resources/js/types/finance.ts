export type BillingListItem = {
    id: number;
    patientId: string;
    patientName: string | null;
    cashierName: string | null;
    billableType: string | null;
    total: number;
    status: string;
    createdAt: string | null;
};

export type BillingFilters = {
    q: string;
    sort: string;
    direction: 'asc' | 'desc';
    perPage: number;
    from: string | null;
    to: string | null;
    page?: number;
};

export type BillingPaginator = {
    data: BillingListItem[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
};

export type BillingSummary = {
    total: number;
    count: number;
};

export type BillingLine = {
    id: number;
    name: string | null;
    quantity: number | null;
    unitPrice: number;
    totalPrice: number;
};

export type FinanceBillingOption = {
    id: number;
    patientId: string;
    patientName: string | null;
    billableType: string | null;
    categoryName: string | null;
    discountPercentage: number;
    total: number;
    isAdmitted: boolean;
    lines: BillingLine[];
};

export type PaymentMethodOption = {
    id: number;
    name: string;
};

export type CouponOption = {
    id: number;
    code: string;
    patientId: string;
    type: string;
    value: number;
    fundType: string | null;
};

export type BillingCountStats = {
    total_billed: number;
    total_billed_count: string;
    collected: number;
    collected_count: string;
    awaiting_payment: number;
    awaiting_payment_count: string;
    wallet_debts: number;
    wallet_debts_count: string;
};

export type BillingDateFilterOption = {
    value: string;
    label: string;
};

export type BillingFormFilters = {
    date_filter: string;
    date_filter_label: string;
};

export type BillingPatientOption = {
    slug: string;
    label: string;
    firstName: string;
    middleName: string | null;
    lastName: string;
    gender: string | null;
    birthDate: string | null;
    email: string | null;
    phone: string | null;
    mobile: string | null;
    category_id: string;
    country_id: string;
    state_id: string;
    lga_id: string;
    address: string | null;
    kinFullName: string | null;
    kinPhone: string | null;
    kinEmail: string | null;
    relation: string | null;
    art: string | null;
    slugOther: string | null;
};

export type BillingPriceListOption = {
    id: number;
    name: string;
    price: number;
};

export type PatientLocationOption = {
    id: number;
    name: string;
};

export type PatientLgaOption = {
    id: number;
    stateId: number;
    name: string;
};

export type NewBillingOptions = {
    categories: { id: number; name: string }[];
    countries: PatientLocationOption[];
    states: PatientLocationOption[];
    lgas: PatientLgaOption[];
    priceLists: BillingPriceListOption[];
    services: BillingPriceListOption[];
};

export type BillingPaymentLine = {
    id: number;
    method: string | null;
    amount: number;
    discountAmount: number;
    wallet: number;
    mercyFund: number;
    infantFormula: number;
};

export type BillingReceipt = {
    id: number;
    patientId: string;
    patientName: string | null;
    billableType: string | null;
    total: number;
    status: string;
    createdAt: string | null;
    recordedBy: string | null;
    lines: BillingLine[];
    payments: BillingPaymentLine[];
};

export type FinanceStats = {
    payments_in_period: number;
    payments_count: number;
    average_payment: number;
    discounts_in_period: number;
    wallet_used_in_period: number;
    mercy_fund_in_period: number;
    infant_formula_in_period: number;
    billed_in_period: number;
    bills_count: number;
    collection_rate: number | null;
    outstanding_balance: number;
    open_bills: number;
    wallet_balance: number;
};

export type FinanceRevenueDataset = {
    key: string;
    label: string;
    color: string;
    data: number[];
};

export type FinanceRevenue = {
    labels: string[];
    datasets: FinanceRevenueDataset[];
};

export type FinancePaymentByMethod = {
    labels: string[];
    data: number[];
    colors: string[];
};

export type FinanceFilters = {
    period: string;
    from: string | null;
    to: string | null;
};

export type FinancePeriodOption = {
    value: string;
    label: string;
};
