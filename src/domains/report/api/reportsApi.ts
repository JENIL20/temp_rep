import api from '../../../shared/api/axios';
import { API } from '../../../shared/api/endpoints';
import { IS_OFFLINE_MODE } from '../../../shared/config';

export interface CourseReport {
    userId: number;
    courseId: number;
    courseName: string;
    userName: string;
    enrolledAt: string;
    completedAt?: string;
    progress: number;
    totalVideos: number;
    completedVideos: number;
    totalDuration: number;
    watchedDuration: number;
    quizScores?: number[];
    averageScore?: number;
    lastAccessedAt: string;
    status: 'active' | 'completed' | 'dropped';
}

/**
 * API Error Handler
 */
const handleApiError = (error: any, context: string): never => {
    console.error(`[ReportsAPI Error - ${context}]:`, error);
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

export const reportsApi = {
    /**
     * Get course report for a specific user
     * @param userId - User ID
     * @param courseId - Course ID
     * @returns Promise with course report
     * @throws Error if validation fails or API call fails
     */
    getCourseReport: async (userId: number, courseId: number): Promise<CourseReport> => {
        if (IS_OFFLINE_MODE) {
            await new Promise(resolve => setTimeout(resolve, 500));
            return {
                userId,
                courseId,
                courseName: 'Mock Course Report',
                userName: 'Mock User',
                enrolledAt: new Date(Date.now() - 86400000).toISOString(),
                progress: 75,
                totalVideos: 10,
                completedVideos: 7,
                totalDuration: 500,
                watchedDuration: 350,
                lastAccessedAt: new Date().toISOString(),
                status: 'active'
            } as CourseReport;
        }

        try {
            validateId(userId, 'userId');
            validateId(courseId, 'courseId');
            const result = await api.get(API.REPORTS.COURSE_REPORT(userId, courseId));
            if (!result) throw new Error('Report not found');
            return result.data as CourseReport;
        } catch (error) {
            handleApiError(error, 'Get course report');
        }
    },
};
