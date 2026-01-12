import api from '../../../shared/api/axios';
import { API } from '../../../shared/api/endpoints';

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

const DUMMY_CATEGORIES = [
    { id: 1, categoryName: "Web Development" },
    { id: 2, categoryName: "Mobile Development" },
    { id: 3, categoryName: "Data Science" },
    { id: 4, categoryName: "Design" },
    { id: 5, categoryName: "Business" },
];

export const categoryApi = {
    /**
     * List all categories
     */
    list: async () => {
        if (IS_DEV) {
            return DUMMY_CATEGORIES;
        }

        try {
            const response = await api.get(API.CATEGORY.LIST);
            return response.data;
        } catch (error) {
            handleApiError(error, 'List categories');
        }
    },

    /**
     * Get category by ID
     */
    getById: async (id: number | string) => {
        if (IS_DEV) {
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
        if (IS_DEV) {
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
        if (IS_DEV) {
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
        if (IS_DEV) {
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
