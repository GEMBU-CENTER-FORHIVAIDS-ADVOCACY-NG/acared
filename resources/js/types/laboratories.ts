export type LabDateFilterOption = {
    value: string;
    label: string;
};

export type LaboratoryStats = {
    pending: number;
    paid: number;
    submitted: number;
    total: number;
};

export type LaboratoryTopTest = {
    name: string;
    requests: number;
    value: number;
};

export type LabPaidOption = {
    id: number;
    label: string;
    patientId: string;
    gender: string | null;
    age: string | null;
};

export type LabSelected = {
    id: number;
    patientId: string;
    patientName: string | null;
    gender: string | null;
    age: string | null;
    isAdmitted: boolean;
};

export type LabInventoryConsumption = {
    lab_inventory_id: number;
    quantity: number;
};

export type LabResultParameterRow = {
    price_list_id: number;
    name: string;
    range: string | null;
    uom: string | null;
    result_type: string;
    options: string[];
    result: string | null;
};

export type LabResultTest = {
    id: number;
    name: string;
    kind: 'parameters' | 'simple';
    rows?: LabResultParameterRow[];
    result_type?: string;
    options?: string[];
    unit?: string | null;
    result?: string | null;
};

export type LabResultStep = {
    name: string;
    tests: LabResultTest[];
};

export type LabResultForm = {
    steps: LabResultStep[];
    hasPending: boolean;
    inventoryItems: { id: number; sku: string; name: string; quantity: number }[];
};

export type LabCreateOptions = {
    patients: { id: string; name: string }[];
    tests: { id: number; name: string; price: number; cost: number }[];
    selectedPatientId?: string;
};

export type LaboratoryListItem = {
    id: number;
    patientId: string;
    patientName: string | null;
    doctorName: string | null;
    status: string;
    total: number;
    createdAt: string | null;
};

export type LaboratoryFilters = {
    q: string;
    patientId?: string;
    sort: string;
    direction: 'asc' | 'desc';
    perPage: number;
    from: string | null;
    to: string | null;
    status: string;
    page?: number;
};

export type LaboratoryPaginator = {
    data: LaboratoryListItem[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
};

export type LaboratoryShow = {
    id: number;
    patientId: string;
    patientName: string | null;
    gender: string | null;
    age: string | null;
    doctorName: string | null;
    status: string;
    total: number;
    createdAt: string | null;
    facilityName: string | null;
    facilityAddress: string | null;
};

export type LabInventoryListItem = {
    id: number;
    sku: string;
    priceListId: number;
    priceListName: string | null;
    drugFormId: number;
    drugFormName: string | null;
    minQty: number;
    quantity: number;
    price: number;
    cost: number;
    value: number;
    profit: number;
    status: string;
    expiresAt: string | null;
    createdAt: string | null;
    updatedAt: string | null;
    isLow: boolean;
};

export type LabInventoryFilters = {
    q: string;
    sort: string;
    direction: 'asc' | 'desc';
    perPage: number;
    page?: number;
};

export type LabInventoryPaginator = {
    data: LabInventoryListItem[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
};

export type LabIntakeListItem = {
    id: number;
    name: string;
    categoryName: string | null;
    subcategoryName: string | null;
    parameterName: string | null;
    isCategory: boolean;
    isInventory: boolean;
    price: number;
    ranges: string | null;
    uom: string | null;
    description: string | null;
    resultType: string | null;
    options: { label: string }[] | string[] | null;
    categoryId: number | null;
    subcategoryId: number | null;
    parameters: {
        id: number;
        name: string;
        ranges: string | null;
        uom: string | null;
        resultType: string | null;
        options: { label: string }[] | string[] | null;
    }[];
    inventory: {
        sku: string;
        minQty: number;
        drugFormId: number;
        expiresAt: string | null;
    } | null;
    createdAt: string | null;
    updatedAt: string | null;
};

export type LabIntakeFilters = {
    q: string;
    categoryId: string;
    subcategoryId: string;
    sort: string;
    direction: 'asc' | 'desc';
    perPage: number;
    page?: number;
};

export type LabIntakePaginator = {
    data: LabIntakeListItem[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
};

export type LabReportFilters = {
    q: string;
    from: string | null;
    to: string | null;
    perPage: number;
    page?: number;
};

