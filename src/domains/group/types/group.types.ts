export interface Group {
    id: number;
    groupName: string;
    tenantId?: number;
    createdAt?: string;
}

export interface GroupListRequest {
    searchTerm?: string;
    tenantId?: number;
    pageNumber?: number;
    pageSize?: number;
}

export interface PaginatedGroupResponse {
    items: Group[];
    totalCount: number;
    pageNumber: number;
    pageSize: number;
    totalPages: number;
}

export interface CreateGroupRequest {
    groupName: string;
    tenantId?: number;
}

export interface UpdateGroupRequest {
    id: number;
    groupName: string;
}

export interface GroupCourse {
    courseId: number;
    isEnable: boolean;
    courseName?: string;
}

export interface GroupCourseUpdateItem {
    courseId: number;
    isEnable: boolean;
}

export interface BulkUpdateCoursesRequest {
    groupId: number;
    courses: GroupCourseUpdateItem[];
}
