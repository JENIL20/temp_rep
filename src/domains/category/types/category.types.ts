export interface Category {
    id: number | string;
    categoryName: string;
    createdAt?: string; // Optional metadata
    updatedAt?: string;
}

export interface CategoryListRequest {
    pageNumber: number;
    pageSize: number;
    searchTerm?: string;
}

export interface PaginatedCategoryResponse {
    items: Category[];
    totalCount: number;
    pageNumber: number;
    pageSize: number;
    totalPages: number;
}
