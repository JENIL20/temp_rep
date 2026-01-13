import api from '../../../shared/api/axios';
import { API } from '../../../shared/api/endpoints';
import { IS_OFFLINE_MODE } from '../../../shared/config';
import { SubscribeRequest, EnrolledCourse, SubscriptionStatus, EnrollmentListRequest, PaginatedEnrollmentResponse } from '../types/enrollment.types';

// ... (rest of imports/error handling)

/**
 * API Error Handler
 * Provides consistent error handling across all API calls
 */
const handleApiError = (error: any, context: string): never => {
    console.error(`[UserCourseAPI Error - ${context}]:`, error);

    if (error.response) {
        // Server responded with error status
        const message = error.response.data?.message || error.response.statusText || 'Server error occurred';
        throw new Error(`${context}: ${message}`);
    } else if (error.request) {
        // Request was made but no response received
        throw new Error(`${context}: No response from server. Please check your connection.`);
    } else {
        // Something else happened
        throw new Error(`${context}: ${error.message || 'Unknown error occurred'}`);
    }
};

/**
 * Validates subscription request data
 */
const validateSubscribeRequest = (data: SubscribeRequest): void => {
    if (!data) {
        throw new Error('Subscribe request data is required');
    }
    if (!data.userId || typeof data.userId !== 'number' || data.userId <= 0) {
        throw new Error('Valid userId is required');
    }
    if (!data.courseId || typeof data.courseId !== 'number' || data.courseId <= 0) {
        throw new Error('Valid courseId is required');
    }
};

/**
 * Validates course ID parameter
 */
const validateCourseId = (courseId: number): void => {
    if (!courseId || typeof courseId !== 'number' || courseId <= 0) {
        throw new Error('Valid courseId is required');
    }
};



const DUMMY_ENROLLED_COURSES: EnrolledCourse[] = [
    {
        id: 1,
        userId: 1,
        courseId: 101,
        enrolledAt: '2025-01-01T10:00:00Z',
        progress: 10,
        status: 'Active',
        course: {
            id: 101,
            title: 'React Masterclass',
            description: 'Learn React from scratch',
            instructor: 'John Doe',
            difficulty: 'Intermediate',
            durationHours: 20,
            price: 49.99,
            rating: 4.5
        }
    },
    {
        id: 2,
        userId: 1,
        courseId: 102,
        enrolledAt: '2024-12-15T10:00:00Z',
        completedAt: '2025-01-10T15:30:00Z',
        progress: 100,
        status: 'Completed',
        course: {
            id: 102,
            title: 'Advanced Python',
            description: 'Master Python features',
            instructor: 'Jane Smith',
            difficulty: 'Advanced',
            durationHours: 30,
            price: 59.99,
            rating: 4.8
        }
    },
    {
        id: 3,
        userId: 1,
        courseId: 103,
        enrolledAt: '2025-01-05T09:00:00Z',
        progress: 45,
        status: 'Active',
        course: {
            id: 103,
            title: 'UI/UX Design Fundamentals',
            description: 'Create beautiful user interfaces',
            instructor: 'Mike Johnson',
            difficulty: 'Beginner',
            durationHours: 15,
            price: 39.99,
            rating: 4.7
        }
    },
    {
        id: 4,
        userId: 1,
        courseId: 104,
        enrolledAt: '2024-11-20T10:00:00Z',
        progress: 100,
        status: 'Completed',
        course: {
            id: 104,
            title: 'Docker & Kubernetes',
            description: 'Containerization mastery',
            instructor: 'Sarah Lee',
            difficulty: 'Advanced',
            durationHours: 40,
            price: 89.99,
            rating: 4.9
        }
    },
    {
        id: 5,
        userId: 1,
        courseId: 105,
        enrolledAt: '2025-01-10T12:00:00Z',
        progress: 5,
        status: 'Active',
        course: {
            id: 105,
            title: 'Machine Learning Basics',
            description: 'Intro to AI and ML',
            instructor: 'David Kim',
            difficulty: 'Intermediate',
            durationHours: 25,
            price: 69.99,
            rating: 4.6
        }
    }
];

// Helper to simulate DB persistence in memory (resets on reload)
let mockEnrollments: EnrolledCourse[] = [...DUMMY_ENROLLED_COURSES];

export const userCourseApi = {
    /**
     * Subscribe to a course
     */
    subscribe: async (data: SubscribeRequest) => {
        if (IS_OFFLINE_MODE) {
            await new Promise(resolve => setTimeout(resolve, 500)); // Simulate latency

            // Check if already subscribed
            const exists = mockEnrollments.find(e => e.courseId === data.courseId && e.userId === data.userId);
            if (exists) {
                return { message: 'Already subscribed', ...data };
            }

            // Create new enrollment
            const newEnrollment: EnrolledCourse = {
                id: Math.floor(Math.random() * 10000),
                userId: data.userId,
                courseId: data.courseId,
                enrolledAt: new Date().toISOString(),
                progress: 0,
                status: 'Active',
                course: {
                    id: data.courseId,
                    title: 'New Course', // In real app, would fetch course details
                    description: 'Description',
                    instructor: 'Instructor',
                    difficulty: 'Beginner',
                    durationHours: 10,
                    price: 0,
                    rating: 0
                }
            };

            mockEnrollments.push(newEnrollment);
            return { message: 'Subscribed successfully (mock)', ...data };
        }

        try {
            validateSubscribeRequest(data);
            const response = await api.post(API.USER_COURSE.SUBSCRIBE, data);
            return response.data;
        } catch (error) {
            throw handleApiError(error, 'Subscribe to course');
        }
    },

    /**
     * Unsubscribe from a course
     */
    unsubscribe: async (data: SubscribeRequest) => {
        if (IS_OFFLINE_MODE) {
            await new Promise(resolve => setTimeout(resolve, 500));
            mockEnrollments = mockEnrollments.filter(e => !(e.courseId === data.courseId && e.userId === data.userId));
            return { message: 'Unsubscribed successfully (mock)', ...data };
        }

        try {
            validateSubscribeRequest(data);
            const response = await api.post(API.USER_COURSE.UNSUBSCRIBE, data);
            return response.data;
        } catch (error) {
            throw handleApiError(error, 'Unsubscribe from course');
        }
    },

    /**
     * Get user's enrolled courses with pagination
     */
    getMyCourses: async (params?: EnrollmentListRequest): Promise<PaginatedEnrollmentResponse> => {
        if (IS_OFFLINE_MODE) {
            // Simulate API latency
            await new Promise(resolve => setTimeout(resolve, 300));

            let filtered = [...mockEnrollments];

            // Filter by Status
            if (params?.status && params.status !== 'all') {
                filtered = filtered.filter(c => c.status.toLowerCase() === params.status?.toLowerCase());
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
            const response = await api.get(API.USER_COURSE.MY_COURSES, { params });
            const result = response.data;

            // Handle legacy array response if backend not updated
            if (Array.isArray(result)) {
                return {
                    items: result,
                    totalCount: result.length,
                    pageNumber: 1,
                    pageSize: result.length,
                    totalPages: 1
                };
            }

            return result;
        } catch (error) {
            throw handleApiError(error, 'Get my courses');
        }
    },

    /**
     * Get subscribed courses list
     * @returns Promise with array of subscribed courses
     * @throws Error if API call fails
     */
    getSubscribedList: async (): Promise<EnrolledCourse[]> => {
        if (IS_OFFLINE_MODE) {
            return mockEnrollments;
        }

        try {
            const response = await api.get(API.USER_COURSE.SUBSCRIBED_LIST);
            const result = response.data;

            if (!result) {
                console.warn('[UserCourseAPI] No subscribed courses data returned, returning empty array');
                return [];
            }

            // Ensure we always return an array
            return Array.isArray(result) ? result : [];
        } catch (error) {
            throw handleApiError(error, 'Get subscribed courses');
        }
    },

    /**
     * Check if user is subscribed to a course
     */
    checkSubscription: async (courseId: number): Promise<SubscriptionStatus> => {
        if (IS_OFFLINE_MODE) {
            // Check against mock memory
            const isSubscribed = mockEnrollments.some(e => e.courseId === courseId);
            return { isSubscribed };
        }

        try {
            validateCourseId(courseId);
            const response = await api.get(API.USER_COURSE.CHECK_SUBSCRIPTION(courseId));
            return response.data;
        } catch (error) {
            throw handleApiError(error, 'Check subscription status');
        }
    },
};
