export interface Course {
    id: number;
    title: string;
    description: string;
    instructor: string;
    difficulty: string;
    durationHours: number;
    price: number;
    rating: number;
    isActive: boolean;
    categoryId?: number;
    thumbnailUrl?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface CourseVideo {
    id: number;
    courseId: number;
    title: string;
    description?: string;
    videoUrl: string;
    duration?: number;
    order?: number;
    thumbnailUrl?: string;
    isActive?: boolean;
    createdAt?: string;
}

export interface EnrolledUser {
    id: number;
    userId: number;
    courseId: number;
    enrolledAt: string;
    progress?: number;
    status?: 'active' | 'completed' | 'dropped';
    user: {
        id: number;
        username: string;
        email: string;
        firstName?: string;
        lastName?: string;
        avatarUrl?: string;
    };
}

export interface CourseListRequest {
    searchTerm?: string;
    pageNumber?: number;
    pageSize?: number;
    categoryId?: number;
    difficulty?: string;
    status?: string;
    sortBy?: string;
}

export interface PaginatedCourseResponse {
    items: Course[];
    totalCount: number;
    pageNumber: number;
    pageSize: number;
    totalPages: number;
}
