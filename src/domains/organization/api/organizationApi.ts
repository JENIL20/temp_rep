import api from '../../../shared/api/axios';
import { API } from '../../../shared/api/endpoints';
import { IS_OFFLINE_MODE } from '../../../shared/config';
import {
    Organization,
    OrganizationListRequest,
    PaginatedOrganizationResponse,
} from '../types/organization.types';

const DUMMY_ORGANIZATIONS: Organization[] = [
    { id: 1, orgName: 'Alpha Academy', orgCode: 'ALPHA', email: 'admin@alpha.edu', isActive: true, createdAt: new Date().toISOString() },
    { id: 2, orgName: 'Beta Tech Solutions', orgCode: 'BETA', email: 'hello@beta.tech', isActive: true, createdAt: new Date().toISOString() }
];

export const organizationApi = {
    list: async (params?: OrganizationListRequest): Promise<PaginatedOrganizationResponse> => {
        if (IS_OFFLINE_MODE) {
            await new Promise(resolve => setTimeout(resolve, 500));
            return {
                items: DUMMY_ORGANIZATIONS,
                totalCount: DUMMY_ORGANIZATIONS.length,
                pageNumber: params?.pageNumber || 1,
                pageSize: params?.pageSize || 10,
                totalPages: 1
            };
        }
        const response = await api.get(API.ORGANIZATION.LIST, { params });
        return response.data;
    },

    getById: async (id: number): Promise<Organization> => {
        if (IS_OFFLINE_MODE) {
            await new Promise(resolve => setTimeout(resolve, 500));
            return DUMMY_ORGANIZATIONS.find(org => org.id === id) || DUMMY_ORGANIZATIONS[0];
        }
        const response = await api.get(API.ORGANIZATION.GET_BY_ID(id));
        return response.data;
    },

    create: async (formData: FormData): Promise<any> => {
        if (IS_OFFLINE_MODE) {
            await new Promise(resolve => setTimeout(resolve, 800));
            return { success: true, message: 'Organization created successfully' };
        }
        const response = await api.post(API.ORGANIZATION.CREATE, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    },

    update: async (id: number, formData: FormData): Promise<any> => {
        if (IS_OFFLINE_MODE) {
            await new Promise(resolve => setTimeout(resolve, 800));
            return { success: true, message: 'Organization updated successfully' };
        }
        const response = await api.put(API.ORGANIZATION.UPDATE(id), formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    },

    delete: async (id: number): Promise<void> => {
        if (IS_OFFLINE_MODE) {
            await new Promise(resolve => setTimeout(resolve, 500));
            return;
        }
        await api.delete(API.ORGANIZATION.DELETE(id));
    }
};
