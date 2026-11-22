export type PatientCategoryRef = {
    id: number;
    name: string;
};

export type PatientLocationRef = {
    id: number;
    name: string;
};

export type PatientListItem = {
    id: number;
    slug: string;
    art: string | null;
    slugOther: string | null;
    fullName: string;
    gender: string | null;
    birthDate: string | null;
    email: string | null;
    phone: string | null;
    createdAt: string | null;
    deletedAt: string | null;
    category: PatientCategoryRef | null;
};

export type PatientDetail = {
    id: number;
    slug: string;
    art: string | null;
    slugOther: string | null;
    firstName: string;
    middleName: string | null;
    lastName: string;
    fullName: string;
    gender: string | null;
    birthDate: string | null;
    age: string | null;
    email: string | null;
    phone: string | null;
    mobile: string | null;
    address: string | null;
    kinFullName: string | null;
    kinPhone: string | null;
    kinEmail: string | null;
    relation: string | null;
    wallet: string | number | null;
    category: PatientCategoryRef | null;
    country: PatientLocationRef | null;
    state: PatientLocationRef | null;
    lga: PatientLocationRef | null;
    createdAt: string | null;
    updatedAt: string | null;
    deletedAt: string | null;
};

export type PatientTab = {
    key: string;
    label: string;
    count: number;
    badge: 'default' | 'warning';
};

export type PatientStats = {
    total: number;
    newLast30Days: number;
    revisiting: number;
};

export type PatientFilters = {
    tab: string;
    q: string;
    trashed: string;
    sort: string;
    direction: 'asc' | 'desc';
    perPage: number;
    page?: number;
};

export type PriceListItem = {
    id: number;
    name: string;
    price: number;
};

export type PatientBillingLine = {
    price_list_id: string;
    unitPrice: string;
};

export type PatientFormOptions = {
    categories: PatientCategoryRef[];
    countries: PatientLocationRef[];
    states: PatientLocationRef[];
    lgas: {
        id: number;
        stateId: number;
        name: string;
    }[];
};

export type PatientPaginator = {
    data: PatientListItem[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
};
