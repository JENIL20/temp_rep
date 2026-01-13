/**
 * Application Configuration
 * Centralized configuration for API modes and environment settings
 */

/**
 * Determines if the application should use offline/mock mode
 * When true, all APIs will return dummy/mock data
 * When false, APIs will make real HTTP requests to the backend
 */
export const IS_OFFLINE_MODE = import.meta.env.VITE_OFFLINE_MODE === 'true';

/**
 * Legacy support: Check if running in development mode
 * This is kept for backward compatibility
 */
export const IS_DEV = import.meta.env.MODE === 'development';

/**
 * API Base URL
 */
export const API_BASE_URL = import.meta.env.VITE_API_URL || '';

/**
 * Configuration object for easy access
 */
export const config = {
    isOfflineMode: IS_OFFLINE_MODE,
    isDevelopment: IS_DEV,
    apiBaseUrl: API_BASE_URL,
} as const;

export default config;
