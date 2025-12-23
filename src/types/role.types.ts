// Role and Permission Types

export interface Permission {
    id: number;
    permissionName: string;
    createdAt: string;
    updatedAt?: string;
}

export interface CreatePermissionRequest {
    permissionName: string;
}

export interface Role {
    id: number;
    roleName: string;
    createdAt: string;
    updatedAt?: string;
    permissions?: Permission[];
}

export interface CreateRoleRequest {
    roleName: string;
    permissionIds?: number[];
}

export interface RolePermission {
    roleId: number;
    roleName: string;
    permissions: Permission[];
}

export interface UserRole {
    userId: number;
    roleId: number;
    role: Role;
    assignedAt: string;
}
