import api from './axios';
import { API } from './endpoints';

export interface CourseVideoRequest {
    courseId: number;
    title: string;
    description?: string;
    videoUrl: string;
    duration?: number;
    orderIndex: number;
    thumbnailUrl?: string;
    isPreview: boolean;
}

export interface CourseVideoResponse extends CourseVideoRequest {
    id: number;
    createdAt?: string;
    updatedAt?: string;
}

/**
 * API Error Handler
 */
const handleApiError = (error: any, context: string): never => {
    console.error(`[CourseAPI Error - ${context}]:`, error);
    if (error.response) {
        const message = error.response.data?.message || error.response.statusText || 'Server error occurred';
        throw new Error(`${context}: ${message}`);
    } else if (error.request) {
        throw new Error(`${context}: No response from server. Please check your connection.`);
    } else {
        throw new Error(`${context}: ${error.message || 'Unknown error occurred'}`);
    }
};

/**
 * Validates ID
 */
const validateId = (id: number, name: string = 'ID'): void => {
    if (!id || typeof id !== 'number' || id <= 0) {
        throw new Error(`Valid ${name} is required`);
    }
};

// Course Video API endpoints
export const courseVideoApi = {
    // Get all videos for a course
    listByCourse: async (courseId: number): Promise<CourseVideoResponse[]> => {
        try {
            validateId(courseId, 'courseId');
            // console.log("Fetching videos for courseId =", courseId);
            const result = await api.get(API.COURSE_VIDEO.LIST_BY_COURSE(7))?.then((item) => item?.data);
            console.log("COURSE VIDEOS ", result);
            return Array.isArray(result) ? result : [];
        } catch (error) {
            handleApiError(error, 'List videos by course');
        }
    },

    // Get a specific video by ID
    getById: async (id: number): Promise<CourseVideoResponse> => {
        try {
            validateId(id);
            const result = await api.get(API.COURSE_VIDEO.GET_BY_ID(id));
            if (!result) throw new Error('Video not found');
            return result as CourseVideoResponse;
        } catch (error) {
            handleApiError(error, 'Get video by ID');
        }
    },

    // Create a new video
    create: async (data: CourseVideoRequest): Promise<CourseVideoResponse> => {
        try {
            if (!data.title) throw new Error('Video title is required');
            if (!data.videoUrl) throw new Error('Video URL is required');
            validateId(data.courseId, 'courseId');

            const result = await api.post(API.COURSE_VIDEO.CREATE, data);
            return result as CourseVideoResponse;
        } catch (error) {
            handleApiError(error, 'Create video');
        }
    },

    // Update an existing video
    update: async (id: number, data: CourseVideoRequest): Promise<CourseVideoResponse> => {
        try {
            validateId(id);
            const result = await api.put(API.COURSE_VIDEO.UPDATE(id), data);
            return result as CourseVideoResponse;
        } catch (error) {
            handleApiError(error, 'Update video');
        }
    },

    // Delete a video
    delete: async (id: number): Promise<void> => {
        try {
            validateId(id);
            await api.delete(API.COURSE_VIDEO.DELETE(id));
        } catch (error) {
            handleApiError(error, 'Delete video');
        }
    },
};

// Course API endpoints
export const courseApi = {
    // List all courses
    list: async () => {
        try {
            const result = await api.get(API.COURSE.LIST);
            return Array.isArray(result) ? result : [];
        } catch (error) {
            handleApiError(error, 'List courses');
        }
    },

    // Get course by ID
    getById: async (id: number) => {
        try {
            validateId(id);
            const result = await api.get(API.COURSE.GET_BY_ID(id));
            if (!result) throw new Error('Course not found');
            return result;
        } catch (error) {
            handleApiError(error, 'Get course by ID');
        }
    },

    // Create a new course
    create: async (data: any) => {
        try {
            if (!data.title) throw new Error('Course title is required');
            const result = await api.post(API.COURSE.CREATE, data);
            return result;
        } catch (error) {
            handleApiError(error, 'Create course');
        }
    },

    // Update a course
    update: async (id: number, data: any) => {
        try {
            validateId(id);
            const result = await api.put(API.COURSE.UPDATE(id), data);
            return result;
        } catch (error) {
            handleApiError(error, 'Update course');
        }
    },

    // Get courses by category
    getByCategory: async (categoryId: number) => {
        try {
            validateId(categoryId, 'categoryId');
            const result = await api.get(API.COURSE.GET_BY_CATEGORY(categoryId));
            return Array.isArray(result) ? result : [];
        } catch (error) {
            handleApiError(error, 'Get courses by category');
        }
    },

    // Upload video file
    uploadVideo: async (courseId: number, file: File) => {
        try {
            validateId(courseId, 'courseId');
            if (!file) throw new Error('File is required');

            const formData = new FormData();
            formData.append('file', file);
            const result = await api.post(API.COURSE.UPLOAD_VIDEO(courseId), formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return result;
        } catch (error) {
            handleApiError(error, 'Upload video');
        }
    },

    // Get videos for a course
    getVideos: async (courseId: number) => {
        try {
            validateId(courseId, 'courseId');
            const result = await api.get(API.COURSE.GET_VIDEOS(courseId));
            return Array.isArray(result) ? result : [];
        } catch (error) {
            handleApiError(error, 'Get videos for course');
        }
    },

    // Upload document
    uploadDocument: async (courseId: number, file: File) => {
        try {
            validateId(courseId, 'courseId');
            if (!file) throw new Error('File is required');

            const formData = new FormData();
            formData.append('file', file);
            const result = await api.post(API.COURSE.UPLOAD_DOCUMENT(courseId), formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return result;
        } catch (error) {
            handleApiError(error, 'Upload document');
        }
    },

    // Get documents for a course
    getDocuments: async (courseId: number) => {
        try {
            validateId(courseId, 'courseId');
            const result = await api.get(API.COURSE.GET_DOCUMENTS(courseId));
            return Array.isArray(result) ? result : [];
        } catch (error) {
            handleApiError(error, 'Get documents for course');
        }
    },

    // Delete document
    deleteDocument: async (docId: number) => {
        try {
            validateId(docId, 'docId');
            await api.delete(API.COURSE.DELETE_DOCUMENT(docId));
        } catch (error) {
            handleApiError(error, 'Delete document');
        }
    },

    // Get enrollments for a course
    getEnrollments: async (courseId: number) => {
        try {
            validateId(courseId, 'courseId');
            const result = await api.get(API.COURSE.GET_ENROLLMENTS(courseId));
            return Array.isArray(result) ? result : [];
        } catch (error) {
            handleApiError(error, 'Get enrollments for course');
        }
    },
};

export default { courseApi, courseVideoApi };
