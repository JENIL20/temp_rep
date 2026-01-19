import api from '../../../shared/api/axios';
import { API } from '../../../shared/api/endpoints';
import { IS_OFFLINE_MODE } from '../../../shared/config';

/**
 * Handle API errors
 */
const handleApiError = (error: any, context: string): never => {
    console.error(`[CategoryAPI Error - ${context}]:`, error);
    if (error.response) {
        throw new Error(error.response.data?.message || 'Server error occurred');
    }
    throw new Error(error.message || 'Unknown error occurred');
};


// Development Mode Flag
const IS_DEV = !(import.meta.env.MODE === 'development');


import { Category, CategoryListRequest, PaginatedCategoryResponse } from '../types/category.types';

// ... imports remain ...

const DUMMY_CATEGORIES: Category[] = [
    { id: 1, categoryName: "Web Development" },
    { id: 2, categoryName: "Mobile Development" },
    { id: 3, categoryName: "Data Science" },
    { id: 4, categoryName: "Design" },
    { id: 5, categoryName: "Business" },
    { id: 6, categoryName: "Marketing" },
    { id: 7, categoryName: "Photography" },
    { id: 8, categoryName: "Music" },
    { id: 9, categoryName: "Health & Fitness" },
    { id: 10, categoryName: "Lifestyle" },
    { id: 11, categoryName: "IT & Software" },
    { id: 12, categoryName: "Personal Development" },
];

export const categoryApi = {
    /**
     * List categories with pagination
     */
    list: async (params?: CategoryListRequest): Promise<PaginatedCategoryResponse> => {
        if (IS_OFFLINE_MODE) {
            // Simulate API latency
            await new Promise(resolve => setTimeout(resolve, 300));

            let filtered = [...DUMMY_CATEGORIES];

            // Search Filter
            if (params?.searchTerm) {
                const lowerTerm = params.searchTerm.toLowerCase();
                filtered = filtered.filter(c =>
                    c.categoryName.toLowerCase().includes(lowerTerm)
                );
            }

            // Pagination
            const pageNumber = params?.pageNumber || 1;
            const pageSize = params?.pageSize || 10;
            const totalCount = filtered.length;
            const totalPages = Math.ceil(totalCount / pageSize);

            const start = (pageNumber - 1) * pageSize;
            const end = start + pageSize;
            const items = filtered.slice(start, end);

            return {
                items,
                totalCount,
                pageNumber,
                pageSize,
                totalPages
            };
        }

        try {
            // Pass query params to API
            const response = await api.get(API.CATEGORY.LIST, { params });
            // Handle possible non-paginated legacy response by wrapping it
            if (Array.isArray(response.data)) {
                return {
                    items: response.data,
                    totalCount: response.data.length,
                    pageNumber: 1,
                    pageSize: response.data.length,
                    totalPages: 1
                };
            }
            return response.data;
        } catch (error) {
            handleApiError(error, 'List categories');
            throw error;
        }
    },

    /**
     * Get category by ID
     */
    getById: async (id: number | string) => {
        if (IS_OFFLINE_MODE) {
            const category = DUMMY_CATEGORIES.find(c => c.id === Number(id));
            if (!category) throw new Error('Category not found');
            return category;
        }

        try {
            const response = await api.get(API.CATEGORY.GET_BY_ID(id));
            return response.data;
        } catch (error) {
            handleApiError(error, 'Get category');
        }
    },

    /**
     * Create new category
     */
    create: async (data: any) => {
        if (IS_OFFLINE_MODE) {
            return {
                ...data,
                id: Math.floor(Math.random() * 1000) + 10
            };
        }

        try {
            const response = await api.post(API.CATEGORY.CREATE, data);
            return response.data;
        } catch (error) {
            handleApiError(error, 'Create category');
        }
    },

    /**
     * Update category
     */
    update: async (id: number | string, data: any) => {
        if (IS_OFFLINE_MODE) {
            return {
                ...data,
                id: id
            };
        }

        try {
            const response = await api.put(API.CATEGORY.UPDATE(id), data);
            return response.data;
        } catch (error) {
            handleApiError(error, 'Update category');
        }
    },

    /**
     * Delete category
     */
    delete: async (id: number | string) => {
        if (IS_OFFLINE_MODE) {
            console.log(`Mock deleted category ${id}`);
            return true;
        }

        try {
            const response = await api.delete(API.CATEGORY.DELETE(id));
            return response.data;
        } catch (error) {
            handleApiError(error, 'Delete category');
        }
    }
};
