export interface User {
    id: number;
    userName: string;
    firstName: string;
    lastName: string;
    email: string;
    mobile?: string;
    roles?: string[];
    isActive?: boolean;
    createdAt?: string;
}

export interface UserListRequest {
    searchTerm?: string;
    pageNumber?: number;
    pageSize?: number;
}

export interface PaginatedUserResponse {
    items: User[];
    totalCount: number;
    pageNumber: number;
    pageSize: number;
    totalPages: number;
}
