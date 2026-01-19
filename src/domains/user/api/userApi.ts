import api from '../../../shared/api/axios';
import { API } from '../../../shared/api/endpoints';

import { User, UserListRequest, PaginatedUserResponse } from '../types/user.types';
import { IS_OFFLINE_MODE } from '../../../shared/config';

// Dummy Data
const DUMMY_USERS: User[] = [
    { id: 1, userName: 'admin', firstName: 'Admin', lastName: 'User', email: 'admin@example.com', roles: ['Admin'], isActive: true },
    { id: 2, userName: 'instructor', firstName: 'John', lastName: 'Doe', email: 'john@example.com', roles: ['Instructor'], isActive: true },
    { id: 3, userName: 'student', firstName: 'Jane', lastName: 'Smith', email: 'jane@example.com', roles: ['Student'], isActive: true }
];

/**
 * User API Service
 * Handles user listing and management
 */
export const userApi = {
    /**
     * List users with pagination and search
     */
    list: async (params?: UserListRequest): Promise<PaginatedUserResponse> => {

        if (IS_OFFLINE_MODE) {
            await new Promise(resolve => setTimeout(resolve, 300));

            let filtered = [...DUMMY_USERS];
            if (params?.searchTerm) {
                const term = params.searchTerm.toLowerCase();
                filtered = filtered.filter(u =>
                    u.userName.toLowerCase().includes(term) ||
                    u.email.toLowerCase().includes(term) ||
                    u.firstName.toLowerCase().includes(term) ||
                    u.lastName.toLowerCase().includes(term)
                );
            }

            const pageNumber = params?.pageNumber || 1;
            const pageSize = params?.pageSize || 10;
            const totalCount = filtered.length;
            const totalPages = Math.ceil(totalCount / pageSize);
            const items = filtered.slice((pageNumber - 1) * pageSize, pageNumber * pageSize);

            return { items, totalCount, pageNumber, pageSize, totalPages };
        }


        try {
            const response = await api.get(API.USER.LIST, {
                params: {
                    SearchTerm: params?.searchTerm || '',
                    PageNumber: params?.pageNumber || 1,
                    PageSize: params?.pageSize || 10
                }
            });
console.log("User API Response:", response);
            const result = response.data;

            // Handle if API returns items directly or wrapped in a paged object
            if (result && Array.isArray(result.items)) {
                return result as PaginatedUserResponse;
            }

            // Fallback for simple array response
            if (Array.isArray(result)) {
                return {
                    items: result,
                    totalCount: result.length,
                    pageNumber: 1,
                    pageSize: result.length,
                    totalPages: 1
                };
            }

            return {
                items: [],
                totalCount: 0,
                pageNumber: 1,
                pageSize: 10,
                totalPages: 0
            };
        } catch (error: any) {
            throw new Error(error.response?.data?.message || 'Failed to fetch users');
        }
    }
};

export default userApi;
