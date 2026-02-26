import api from '../../../shared/api/axios';
import { API } from '../../../shared/api/endpoints';
import { IS_OFFLINE_MODE } from '../../../shared/config';
import {
    Group,
    GroupListRequest,
    PaginatedGroupResponse,
    CreateGroupRequest,
    UpdateGroupRequest,
    BulkUpdateCoursesRequest
} from '../types/group.types';

const DUMMY_GROUPS: Group[] = [
    { id: 1, groupName: 'Computer Science Batch A', createdAt: new Date().toISOString() },
    { id: 2, groupName: 'Data Science Bootcamp', createdAt: new Date().toISOString() }
];

export const groupApi = {
    list: async (params?: GroupListRequest): Promise<PaginatedGroupResponse> => {
        if (IS_OFFLINE_MODE) {
            await new Promise(resolve => setTimeout(resolve, 500));
            return {
                items: DUMMY_GROUPS,
                totalCount: DUMMY_GROUPS.length,
                pageNumber: params?.pageNumber || 1,
                pageSize: params?.pageSize || 10,
                totalPages: 1
            };
        }
        const response = await api.get(API.GROUPS.LIST, { params });
        return response.data;
    },

    getById: async (id: number): Promise<Group> => {
        if (IS_OFFLINE_MODE) {
            await new Promise(resolve => setTimeout(resolve, 500));
            return DUMMY_GROUPS.find(g => g.id === id) || DUMMY_GROUPS[0];
        }
        const response = await api.get(API.GROUPS.GET_BY_ID(id));
        return response.data;
    },

    create: async (data: CreateGroupRequest): Promise<any> => {
        if (IS_OFFLINE_MODE) {
            await new Promise(resolve => setTimeout(resolve, 800));
            return { success: true, message: 'Group created successfully' };
        }
        const response = await api.post(API.GROUPS.CREATE, data);
        return response.data;
    },

    update: async (id: number, data: UpdateGroupRequest): Promise<any> => {
        if (IS_OFFLINE_MODE) {
            await new Promise(resolve => setTimeout(resolve, 800));
            return { success: true, message: 'Group updated successfully' };
        }
        const response = await api.put(API.GROUPS.UPDATE(id), data);
        return response.data;
    },

    delete: async (id: number): Promise<void> => {
        if (IS_OFFLINE_MODE) {
            await new Promise(resolve => setTimeout(resolve, 500));
            return;
        }
        await api.delete(API.GROUPS.DELETE(id));
    },

    getGroupCourses: async (groupId: number, params?: any): Promise<any> => {
        if (IS_OFFLINE_MODE) {
            await new Promise(resolve => setTimeout(resolve, 500));
            return {
                items: [
                    { courseId: 1, isEnable: true, courseName: 'Introduction to React' },
                    { courseId: 2, isEnable: false, courseName: 'Advanced TypeScript' }
                ],
                totalCount: 2,
                pageNumber: 1,
                pageSize: 10,
                totalPages: 1
            };
        }
        const response = await api.get(API.GROUPS.GROUP_COURSES(groupId), { params });
        return response.data;
    },

    bulkUpdateCourses: async (data: BulkUpdateCoursesRequest): Promise<any> => {
        if (IS_OFFLINE_MODE) {
            await new Promise(resolve => setTimeout(resolve, 800));
            return { success: true, message: 'Courses updated successfully' };
        }
        const response = await api.put(API.GROUPS.BULK_UPDATE_COURSES, data);
        return response.data;
    }
};
