export type CategoryListItem = {
    id: number;
    name: string;
    discountPercentage: number;
    description: string | null;
    patientsCount: number;
    createdAt: string | null;
    updatedAt: string | null;
};

export type CategoryFilters = {
    q: string;
    sort: string;
    direction: 'asc' | 'desc';
    perPage: number;
    page?: number;
};

export type CategoryPaginator = {
    data: CategoryListItem[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
};

export type CategoryFormValues = {
    name: string;
    discount_percentage: string;
    description: string;
};
