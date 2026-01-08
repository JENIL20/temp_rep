import api from '../../../shared/api/axios';
import { API } from '../../../shared/api/endpoints';
import { Course, EnrolledUser } from '../types/course.types';

// Dummy Data
const generateDummyCourses = (): Course[] => {
    return Array.from({ length: 25 }, (_, i) => ({
        id: i + 1,
        title: `Course ${i + 1}: ${['React', 'Node.js', 'Python', 'Design', 'Marketing'][i % 5]} Masterclass`,
        description: `This is a comprehensive course about ${['React', 'Node.js', 'Python', 'Design', 'Marketing'][i % 5]}. Learn from experts.`,
        instructor: ['John Doe', 'Jane Smith', 'Mike Johnson', 'Sarah Wilson', 'David Brown'][i % 5],
        difficulty: ['Beginner', 'Intermediate', 'Advanced'][i % 3],
        durationHours: 10 + (i * 2),
        price: 49.99 + (i * 10),
        rating: 3.5 + (i % 15) / 10,
        isActive: i % 5 !== 0, // Every 5th course is inactive
        categoryId: (i % 5) + 1,
        thumbnailUrl: `https://source.unsplash.com/random/800x600?sig=${i}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    }));
};

const DUMMY_COURSES: Course[] = generateDummyCourses();

const DUMMY_VIDEOS: CourseVideoResponse[] = [
    {
        id: 1,
        courseId: 1,
        title: 'Introduction to React Native',
        description: 'Getting started with the environment setup and "Hello World".',
        videoUrl: 'https://www.youtube.com/watch?v=ysz5S6PUM-U',
        duration: 1200,
        orderIndex: 1,
        thumbnailUrl: 'https://img.youtube.com/vi/ysz5S6PUM-U/maxresdefault.jpg',
        isPreview: true,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z'
    },
    {
        id: 2,
        courseId: 1,
        title: 'Components and Props',
        description: 'Understanding functional components, props, and basic styling.',
        videoUrl: 'https://www.youtube.com/watch?v=LXb3EKWsInQ',
        duration: 1500,
        orderIndex: 2,
        thumbnailUrl: 'https://img.youtube.com/vi/LXb3EKWsInQ/maxresdefault.jpg',
        isPreview: false,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z'
    },
    {
        id: 3,
        courseId: 1,
        title: 'State Management with Hooks',
        description: 'Using useState and useEffect hooks effectively.',
        videoUrl: 'https://www.youtube.com/watch?v=9bZkp7q19f0',
        duration: 1800,
        orderIndex: 3,
        thumbnailUrl: 'https://img.youtube.com/vi/9bZkp7q19f0/maxresdefault.jpg',
        isPreview: false,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z'
    }
];

const DUMMY_DOCUMENTS = [
    {
        id: 1,
        courseId: 1,
        fileName: 'Course_Syllabus.pdf',
        fileUrl: '/documents/syllabus.pdf',
        fileSize: 2048576,
        uploadedAt: '2024-01-15T10:00:00Z',
        uploadedBy: 'John Doe',
    },
    {
        id: 2,
        courseId: 1,
        fileName: 'Cheatsheet.pdf',
        fileUrl: '/documents/cheatsheet.pdf',
        fileSize: 1024000,
        uploadedAt: '2024-01-16T10:00:00Z',
        uploadedBy: 'John Doe',
    },
    {
        id: 3,
        courseId: 1,
        fileName: 'Project_Assets.zip',
        fileUrl: '/documents/assets.zip',
        fileSize: 5242880,
        uploadedAt: '2024-01-17T10:00:00Z',
        uploadedBy: 'John Doe',
    }
];

const DUMMY_ENROLLMENTS: EnrolledUser[] = [
    {
        id: 1,
        userId: 101,
        courseId: 1,
        enrolledAt: '2024-01-10T00:00:00Z',
        progress: 45,
        status: 'active',
        user: {
            id: 101,
            username: 'student1',
            email: 'student1@example.com',
            firstName: 'Alice',
            lastName: 'Johnson',
            avatarUrl: 'https://i.pravatar.cc/150?u=student1'
        }
    },
    {
        id: 2,
        userId: 102,
        courseId: 1,
        enrolledAt: '2024-01-12T00:00:00Z',
        progress: 100,
        status: 'completed',
        user: {
            id: 102,
            username: 'student2',
            email: 'student2@example.com',
            firstName: 'Bob',
            lastName: 'Smith',
            avatarUrl: 'https://i.pravatar.cc/150?u=student2'
        }
    },
    {
        id: 3,
        userId: 103,
        courseId: 1,
        enrolledAt: '2024-01-15T00:00:00Z',
        progress: 10,
        status: 'active',
        user: {
            id: 103,
            username: 'student3',
            email: 'student3@example.com',
            firstName: 'Charlie',
            lastName: 'Brown',
            avatarUrl: 'https://i.pravatar.cc/150?u=student3'
        }
    }
];

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
const handleApiError = (error: any, context: string): Error => {
    console.error(`[CourseAPI Error - ${context}]:`, error);
    let message = 'Unknown error occurred';
    if (error.response) {
        message = error.response.data?.message || error.response.statusText || 'Server error occurred';
    } else if (error.request) {
        message = 'No response from server. Please check your connection.';
    } else {
        message = error.message || 'Unknown error occurred';
    }
    return new Error(`${context}: ${message}`);
};

/**
 * Validates ID
 */
const validateId = (id: number, name: string = 'ID'): void => {
    if (!id || typeof id !== 'number' || id <= 0) {
        throw new Error(`Valid ${name} is required`);
    }
};

// Development Mode Flag
const IS_DEV = import.meta.env.MODE === 'development';

// Course Video API endpoints
export const courseVideoApi = {
    // Get all videos for a course
    listByCourse: async (courseId: number): Promise<CourseVideoResponse[]> => {
        if (IS_DEV) {
            console.log("DEV MODE: Returning dummy videos");
            await new Promise(resolve => setTimeout(resolve, 500)); // Simulate delay
            return DUMMY_VIDEOS.filter(v => v.courseId === Number(courseId));
        }

        try {
            validateId(courseId, 'courseId');
            const response = await api.get(API.COURSE_VIDEO.LIST_BY_COURSE(courseId));
            const result = response.data;
            console.log("COURSE VIDEOS ", result);
            return Array.isArray(result) ? result : [];
        } catch (error) {
            throw handleApiError(error, 'List videos by course');
        }
    },

    // Get a specific video by ID
    getById: async (id: number): Promise<CourseVideoResponse> => {
        if (IS_DEV) {
            const video = DUMMY_VIDEOS.find(v => v.id === Number(id));
            if (!video) throw new Error('Video not found');
            return video;
        }

        try {
            validateId(id);
            const response = await api.get(API.COURSE_VIDEO.GET_BY_ID(id));
            if (!response.data) throw new Error('Video not found');
            return response.data;
        } catch (error) {
            // Fallback to dummy data even in production if API fails (optional, but requested behavior implies strong fallback preference)
            // But strictly following user "dev in background", specific logic for dev mode is best.
            // If api fails in prod, we usually throw.
            throw handleApiError(error, 'Get video by ID');
        }
    },

    // Create a new video
    create: async (data: CourseVideoRequest): Promise<CourseVideoResponse> => {
        if (IS_DEV) {
            const newVideo: CourseVideoResponse = {
                ...data,
                id: Math.floor(Math.random() * 1000) + 100,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            return newVideo;
        }

        try {
            if (!data.title) throw new Error('Video title is required');
            if (!data.videoUrl) throw new Error('Video URL is required');
            validateId(data.courseId, 'courseId');

            const response = await api.post(API.COURSE_VIDEO.CREATE(data.courseId), data);
            return response.data;
        } catch (error) {
            throw handleApiError(error, 'Create video');
        }
    },

    // Update an existing video
    update: async (id: number, data: CourseVideoRequest): Promise<CourseVideoResponse> => {
        if (IS_DEV) {
            return {
                ...data,
                id: id,
                updatedAt: new Date().toISOString()
            };
        }

        try {
            validateId(id);
            const response = await api.put(API.COURSE_VIDEO.UPDATE(id), data);
            return response.data;
        } catch (error) {
            throw handleApiError(error, 'Update video');
        }
    },

    // Delete a video
    delete: async (id: number): Promise<void> => {
        if (IS_DEV) {
            console.log(`Mock deleted video ${id}`);
            return;
        }

        try {
            validateId(id);
            await api.delete(API.COURSE_VIDEO.DELETE(id));
        } catch (error) {
            throw handleApiError(error, 'Delete video');
        }
    },
};

// Course API endpoints
export const courseApi = {
    // List all courses
    list: async () => {
        if (IS_DEV) {
            console.log("DEV MODE: Returning dummy courses");
            return DUMMY_COURSES;
        }

        try {
            const response = await api.get(API.COURSE.LIST);
            const result = response.data;
            return Array.isArray(result) ? result : [];
        } catch (error) {
            throw handleApiError(error, 'List courses');
        }
    },

    // Get course by ID
    getById: async (id: number) => {
        if (IS_DEV) {
            const course = DUMMY_COURSES.find(c => c.id === Number(id));
            if (!course) throw new Error('Course not found');
            return course;
        }

        try {
            validateId(id);
            const response = await api.get(API.COURSE.GET_BY_ID(id));
            if (!response.data) throw new Error('Course not found');
            return response.data;
        } catch (error) {
            throw handleApiError(error, 'Get course by ID');
        }
    },

    // Create a new course
    create: async (data: any) => {
        if (IS_DEV) {
            return {
                ...data,
                id: Math.floor(Math.random() * 1000) + 100,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
        }

        try {
            if (!data.title) throw new Error('Course title is required');
            const response = await api.post(API.COURSE.CREATE, data);
            return response.data;
        } catch (error) {
            throw handleApiError(error, 'Create course');
        }
    },

    // Update a course
    update: async (id: number, data: any) => {
        if (IS_DEV) {
            return {
                ...data,
                id: id,
                updatedAt: new Date().toISOString()
            };
        }

        try {
            validateId(id);
            const response = await api.put(API.COURSE.UPDATE(id), data);
            return response.data;
        } catch (error) {
            throw handleApiError(error, 'Update course');
        }
    },

    // Get courses by category
    getByCategory: async (categoryId: number) => {
        if (IS_DEV) {
            return DUMMY_COURSES.filter(c => c.categoryId === Number(categoryId));
        }

        try {
            validateId(categoryId, 'categoryId');
            const response = await api.get(API.COURSE.GET_BY_CATEGORY(categoryId));
            const result = response.data;
            return Array.isArray(result) ? result : [];
        } catch (error) {
            throw handleApiError(error, 'Get courses by category');
        }
    },

    // Upload video file
    uploadVideo: async (courseId: number, file: File, onProgress?: (progress: number) => void) => {
        if (IS_DEV) {
            if (onProgress) onProgress(100);
            return {
                url: URL.createObjectURL(file),
                filename: file.name,
                id: Math.floor(Math.random() * 1000)
            };
        }

        try {
            validateId(courseId, 'courseId');
            if (!file) throw new Error('File is required');

            const formData = new FormData();
            formData.append('file', file);
            const response = await api.post(API.COURSE.UPLOAD_VIDEO(courseId), formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                onUploadProgress: (progressEvent: any) => {
                    if (onProgress && progressEvent.total) {
                        const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                        onProgress(progress);
                    }
                }
            });
            return response.data;
        } catch (error) {
            throw handleApiError(error, 'Upload video');
        }
    },

    // Get videos for a course
    getVideos: async (courseId: number) => {
        if (IS_DEV) {
            return DUMMY_VIDEOS.filter(v => v.courseId === Number(courseId));
        }

        try {
            validateId(courseId, 'courseId');
            const response = await api.get(API.COURSE.GET_VIDEOS(courseId));
            const result = response.data;
            return Array.isArray(result) ? result : [];
        } catch (error) {
            throw handleApiError(error, 'Get videos for course');
        }
    },

    // Upload document
    uploadDocument: async (courseId: number, file: File, onProgress?: (progress: number) => void) => {
        if (IS_DEV) {
            if (onProgress) onProgress(100);
            return {
                id: Math.floor(Math.random() * 1000),
                courseId: courseId,
                fileName: file.name,
                fileUrl: URL.createObjectURL(file),
                fileSize: file.size,
                uploadedAt: new Date().toISOString(),
                uploadedBy: 'Dev User'
            };
        }

        try {
            validateId(courseId, 'courseId');
            if (!file) throw new Error('File is required');

            const formData = new FormData();
            formData.append('file', file);
            const response = await api.post(API.COURSE.UPLOAD_DOCUMENT(courseId), formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                onUploadProgress: (progressEvent: any) => {
                    if (onProgress && progressEvent.total) {
                        const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                        onProgress(progress);
                    }
                }
            });
            return response.data;
        } catch (error) {
            throw handleApiError(error, 'Upload document');
        }
    },

    // Get documents for a course
    getDocuments: async (courseId: number) => {
        if (IS_DEV) {
            return DUMMY_DOCUMENTS.filter(d => d.courseId === Number(courseId));
        }

        try {
            validateId(courseId, 'courseId');
            const response = await api.get(API.COURSE.GET_DOCUMENTS(courseId));
            const result = response.data;
            return Array.isArray(result) ? result : [];
        } catch (error) {
            throw handleApiError(error, 'Get documents for course');
        }
    },

    // Delete document
    deleteDocument: async (docId: number) => {
        if (IS_DEV) {
            console.log(`Mock deleted document ${docId}`);
            return;
        }

        try {
            validateId(docId, 'docId');
            await api.delete(API.COURSE.DELETE_DOCUMENT(docId));
        } catch (error) {
            throw handleApiError(error, 'Delete document');
        }
    },

    // Get enrollments for a course
    getEnrollments: async (courseId: number) => {
        if (IS_DEV) {
            return DUMMY_ENROLLMENTS.filter(e => e.courseId === Number(courseId));
        }

        try {
            validateId(courseId, 'courseId');
            const response = await api.get(API.COURSE.GET_ENROLLMENTS(courseId));
            const result = response.data;
            return Array.isArray(result) ? result : [];
        } catch (error) {
            throw handleApiError(error, 'Get enrollments for course');
        }
    },

    // Get categories
    getCategories: async () => {
        return [
            { id: 1, categoryName: "Web Development" },
            { id: 2, categoryName: "Mobile Development" },
            { id: 3, categoryName: "Data Science" },
            { id: 4, categoryName: "Design" },
            { id: 5, categoryName: "Business" },
        ];
    },
};

export default { courseApi, courseVideoApi };
