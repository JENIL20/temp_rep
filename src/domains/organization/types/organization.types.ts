export interface Organization {
    id: number;
    orgName: string;
    orgCode: string;
    website?: string;
    logo?: string;
    isActive: boolean;
    firstName?: string;
    lastName?: string;
    email: string;
    mobile?: string;
    createdAt?: string;
}

export interface OrganizationListRequest {
    searchTerm?: string;
    isActive?: boolean;
    pageNumber?: number;
    pageSize?: number;
}

export interface PaginatedOrganizationResponse {
    items: Organization[];
    totalCount: number;
    pageNumber: number;
    pageSize: number;
    totalPages: number;
}

export interface CreateOrganizationRequest {
    OrgName: string;
    OrgCode: string;
    Website?: string;
    Logo?: File; // For multipart form
    FirstName: string;
    LastName: string;
    Email: string;
    Password?: string;
    Mobile?: string;
}

export interface UpdateOrganizationRequest extends CreateOrganizationRequest {
    id: number;
    IsActive?: boolean;
    ConfirmPassword?: string;
}
