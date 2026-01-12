import api from '../../../shared/api/axios';
import { API } from '../../../shared/api/endpoints';
import { UserListRequest, PaginatedUserResponse } from '../types/user.types';

/**
 * User API Service
 * Handles user listing and management
 */
export const userApi = {
    /**
     * List users with pagination and search
     */
    list: async (params?: UserListRequest): Promise<PaginatedUserResponse> => {
        try {
            const response = await api.get(API.USER.LIST, {
                params: {
                    SearchTerm: params?.searchTerm || '',
                    PageNumber: params?.pageNumber || 1,
                    PageSize: params?.pageSize || 10
                }
            });

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
