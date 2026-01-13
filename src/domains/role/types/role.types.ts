export interface Module {
    id: number;
    code: string;
    name: string;
    isActive: boolean;
}

export interface Permission {
    id: number;
    code: string;
    name: string;
    isActive: boolean;
}

export interface Role {
    id: number;
    code: string;
    name: string;
    isActive: boolean;
}

export interface RoleModule {
    id: number;
    roleId: number;
    roleName: string;
    moduleId: number;
    moduleName: string;
    moduleCode: string;
}

export interface CreateRoleRequest {
    code: string;
    name: string;
}

export interface UpdateRoleRequest {
    name: string;
}

export interface CreateModuleRequest {
    code: string;
    name: string;
}

export interface AssignPermissionRequest {
    roleId: number;
    moduleId: number;
    permissionIds: number[];
}

export interface AssignRoleRequest {
    userId: number;
    roleId: number;
}

export interface PaginatedRoleResponse {
    items: Role[];
    totalCount: number;
    pageNumber: number;
    pageSize: number;
    totalPages: number;
}

export interface UserWithRoles {
    id: number;
    userName: string;
    email: string;
    firstName?: string;
    lastName?: string;
    roles: Role[];
    isActive?: boolean;
}
