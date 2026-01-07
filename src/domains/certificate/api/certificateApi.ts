import api from '../../../shared/api/axios';
import { API } from '../../../shared/api/endpoints';
import { CreateCertificateRequest, Certificate, CertificateValidation } from '../types/certificate.types';

/**
 * API Error Handler
 * Provides consistent error handling across all API calls
 */
const handleApiError = (error: any, context: string): never => {
    console.error(`[CertificateAPI Error - ${context}]:`, error);

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
 * Validates certificate creation request
 */
const validateCertificateRequest = (data: CreateCertificateRequest): void => {
    if (!data) {
        throw new Error('Certificate request data is required');
    }
    if (!data.userId || typeof data.userId !== 'number' || data.userId <= 0) {
        throw new Error('Valid userId is required');
    }
    if (!data.courseId || typeof data.courseId !== 'number' || data.courseId <= 0) {
        throw new Error('Valid courseId is required');
    }
};

/**
 * Validates ID parameter
 */
const validateId = (id: number, fieldName: string = 'ID'): void => {
    if (!id || typeof id !== 'number' || id <= 0) {
        throw new Error(`Valid ${fieldName} is required`);
    }
};

/**
 * Validates certificate code
 */
const validateCode = (code: string): void => {
    if (!code || typeof code !== 'string' || code.trim().length === 0) {
        throw new Error('Valid certificate code is required');
    }
};

export const certificateApi = {
    /**
     * Generate a certificate for a user's course completion
     * @param data - Certificate creation request
     * @returns Promise with generated certificate
     * @throws Error if validation fails or API call fails
     */
    generate: async (data: CreateCertificateRequest): Promise<Certificate> => {
        try {
            validateCertificateRequest(data);
            const result = await api.post(API.CERTIFICATE.GENERATE, data);

            if (!result) {
                throw new Error('No certificate data returned');
            }

            return result as Certificate;
        } catch (error) {
            handleApiError(error, 'Generate certificate');
        }
    },

    /**
     * Download certificate as a file
     * @param id - Certificate ID
     * @returns Promise with certificate blob
     * @throws Error if validation fails or API call fails
     */
    download: async (id: number): Promise<Blob> => {
        try {
            validateId(id, 'Certificate ID');
            const result = await api.get(API.CERTIFICATE.DOWNLOAD(id), {
                responseType: 'blob',
            });

            if (!result) {
                throw new Error('No certificate file data returned');
            }

            // Validate that we received a blob
            if (!(result instanceof Blob)) {
                throw new Error('Invalid certificate file format received');
            }

            return result as Blob;
        } catch (error) {
            handleApiError(error, 'Download certificate');
        }
    },

    /**
     * Validate a certificate by its unique code
     * @param code - Certificate validation code
     * @returns Promise with certificate validation result
     * @throws Error if validation fails or API call fails
     */
    validate: async (code: string): Promise<CertificateValidation> => {
        try {
            validateCode(code);
            const result = await api.get(API.CERTIFICATE.VALIDATE(code.trim()));

            if (!result) {
                throw new Error('No validation data returned');
            }

            return result as CertificateValidation;
        } catch (error) {
            handleApiError(error, 'Validate certificate');
        }
    },

    /**
     * Revoke a certificate (admin only)
     * @param id - Certificate ID to revoke
     * @returns Promise with revocation response
     * @throws Error if validation fails or API call fails
     */
    revoke: async (id: number) => {
        try {
            validateId(id, 'Certificate ID');
            const result = await api.post(API.CERTIFICATE.REVOKE(id));

            if (!result) {
                throw new Error('No revocation response returned');
            }

            return result;
        } catch (error) {
            handleApiError(error, 'Revoke certificate');
        }
    },

    /**
     * Get all certificates for a specific user
     * @param userId - User ID
     * @returns Promise with array of user's certificates
     * @throws Error if validation fails or API call fails
     */
    getUserCertificates: async (userId: number): Promise<Certificate[]> => {
        try {
            validateId(userId, 'User ID');
            const result = await api.get(API.CERTIFICATE.GET_USER_CERTIFICATES(userId));

            if (!result) {
                console.warn('[CertificateAPI] No certificates data returned, returning empty array');
                return [];
            }

            // Ensure we always return an array
            return Array.isArray(result) ? result : [];
        } catch (error) {
            handleApiError(error, 'Get user certificates');
        }
    },

    /**
     * List all certificates (admin only)
     * @returns Promise with array of all certificates
     * @throws Error if API call fails
     */
    list: async (): Promise<Certificate[]> => {
        try {
            const result = await api.get(API.CERTIFICATE.LIST);

            if (!result) {
                console.warn('[CertificateAPI] No certificates data returned, returning empty array');
                return [];
            }

            // Ensure we always return an array
            return Array.isArray(result) ? result : [];
        } catch (error) {
            handleApiError(error, 'List all certificates');
        }
    },
};
