// Map of moduleCode (e.g. 'COURSES') → array of permissionCodes (e.g. ['view','create','update'])
export type UserPermissions = Record<string, string[]>;

export interface LoginRequest {
    email?: string;
    password?: string;
}

export interface RegisterRequest {
    userName?: string;
    firstName?: string;
    lastName?: string;
    mobile?: string;
    email?: string;
    password?: string;
}

export interface ForgotPasswordRequest {
    email?: string;
}

export interface ResetPasswordRequest {
    token?: string;
    newPassword?: string;
    confirmPassword?: string;
}

export interface User {
    id: number;
    userName: string;
    firstName: string;
    lastName: string;
    email: string;
    mobile?: string;
    roles: string[]; // Assuming backend returns roles as string array or similar
    tenantId?: number; // Added tenantId
}

export interface AuthResponse {
    token: string;
    user: User;
    expiration?: string;
    tenantId?: number; // Added tenantId at top level just in case
    permissions?: UserPermissions; // Populated after fetching user permissions post-login
}

export interface SubscribeRequest {
    courseId: number;
}
