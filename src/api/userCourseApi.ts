import api from './axios';
import { API } from './endpoints';
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

export const userCourseApi = {
    /**
     * Subscribe to a course
     * @param data - Subscription request containing userId and courseId
     * @returns Promise with subscription response
     * @throws Error if validation fails or API call fails
     */
    subscribe: async (data: SubscribeRequest) => {
        try {
            validateSubscribeRequest(data);
            const result = await api.post(API.USER_COURSE.SUBSCRIBE, data);

            if (!result) {
                throw new Error('No data returned from subscribe request');
            }

            return result;
        } catch (error) {
            handleApiError(error, 'Subscribe to course');
        }
    },

    /**
     * Unsubscribe from a course
     * @param data - Subscription request containing userId and courseId
     * @returns Promise with unsubscription response
     * @throws Error if validation fails or API call fails
     */
    unsubscribe: async (data: SubscribeRequest) => {
        try {
            validateSubscribeRequest(data);
            const result = await api.post(API.USER_COURSE.UNSUBSCRIBE, data);

            if (!result) {
                throw new Error('No data returned from unsubscribe request');
            }

            return result;
        } catch (error) {
            handleApiError(error, 'Unsubscribe from course');
        }
    },

    /**
     * Get user's enrolled courses
     * @returns Promise with array of enrolled courses
     * @throws Error if API call fails
     */
    getMyCourses: async (): Promise<EnrolledCourse[]> => {
        try {
            const result = await api.get(API.USER_COURSE.MY_COURSES);

            if (!result) {
                console.warn('[UserCourseAPI] No courses data returned, returning empty array');
                return [];
            }

            // Ensure we always return an array
            return Array.isArray(result) ? result : [];
        } catch (error) {
            handleApiError(error, 'Get my courses');
        }
    },

    /**
     * Get subscribed courses list
     * @returns Promise with array of subscribed courses
     * @throws Error if API call fails
     */
    getSubscribedList: async (): Promise<EnrolledCourse[]> => {
        try {
            const result = await api.get(API.USER_COURSE.SUBSCRIBED_LIST);

            if (!result) {
                console.warn('[UserCourseAPI] No subscribed courses data returned, returning empty array');
                return [];
            }

            // Ensure we always return an array
            return Array.isArray(result) ? result : [];
        } catch (error) {
            handleApiError(error, 'Get subscribed courses');
        }
    },

    /**
     * Check if user is subscribed to a course
     * @param courseId - The ID of the course to check
     * @returns Promise with subscription status
     * @throws Error if validation fails or API call fails
     */
    checkSubscription: async (courseId: number): Promise<SubscriptionStatus> => {
        try {
            validateCourseId(courseId);
            const result = await api.get(API.USER_COURSE.CHECK_SUBSCRIPTION(courseId));

            if (!result) {
                throw new Error('No subscription status data returned');
            }

            return result as SubscriptionStatus;
        } catch (error) {
            handleApiError(error, 'Check subscription status');
        }
    },
};
