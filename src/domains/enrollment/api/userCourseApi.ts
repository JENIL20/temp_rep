import api from '../../../shared/api/axios';
import { API } from '../../../shared/api/endpoints';
import { SubscribeRequest, EnrolledCourse, SubscriptionStatus } from '../types/enrollment.types';

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

// Development Mode Flag
const IS_DEV = import.meta.env.MODE === 'development';

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
    }
];

export const userCourseApi = {
    /**
     * Subscribe to a course
     * @param data - Subscription request containing userId and courseId
     * @returns Promise with subscription response
     * @throws Error if validation fails or API call fails
     */
    subscribe: async (data: SubscribeRequest) => {
        if (IS_DEV) {
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
     * @param data - Subscription request containing userId and courseId
     * @returns Promise with unsubscription response
     * @throws Error if validation fails or API call fails
     */
    unsubscribe: async (data: SubscribeRequest) => {
        if (IS_DEV) {
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
     * Get user's enrolled courses
     * @returns Promise with array of enrolled courses
     * @throws Error if API call fails
     */
    getMyCourses: async (): Promise<EnrolledCourse[]> => {
        if (IS_DEV) {
            return DUMMY_ENROLLED_COURSES;
        }

        try {
            const response = await api.get(API.USER_COURSE.MY_COURSES);
            const result = response.data;

            if (!result) {
                console.warn('[UserCourseAPI] No courses data returned, returning empty array');
                return [];
            }

            // Ensure we always return an array
            return Array.isArray(result) ? result : [];
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
        if (IS_DEV) {
            return DUMMY_ENROLLED_COURSES;
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
     * @param courseId - The ID of the course to check
     * @returns Promise with subscription status
     * @throws Error if validation fails or API call fails
     */
    checkSubscription: async (courseId: number): Promise<SubscriptionStatus> => {
        if (IS_DEV) {
            return { isSubscribed: true }; // Mocking as subscribed for testing
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
