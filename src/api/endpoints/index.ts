/**
 * API Endpoints Constants
 * Centralized location for all API endpoint URLs
 * Usage: import { API } from '../endpoints';
 *        api.post(API.AUTH.LOGIN, data);
 */

export const API = {
  // Authentication endpoints
  AUTH: {
    LOGIN: '/api/Auth/login',
    REGISTER: '/api/Auth/register',
    FORGOT_PASSWORD: '/api/Auth/forgot-password',
    RESET_PASSWORD: '/api/Auth/reset-password',
  },

  // Category endpoints
  CATEGORY: {
    LIST: '/api/Category/list',
    GET_BY_ID: (id: number | string) => `/api/Category/${id}`,
    CREATE: '/api/Category/create',
    UPDATE: (id: number | string) => `/api/Category/update/${id}`,
    DELETE: (id: number | string) => `/api/Category/delete/${id}`,
  },

  // Certificate endpoints
  CERTIFICATE: {
    GENERATE: '/api/Certificates/generate',
    DOWNLOAD: (id: number | string) => `/api/Certificates/${id}/download`,
    VALIDATE: (code: string) => `/api/Certificates/validate/${code}`,
    REVOKE: (id: number | string) => `/api/Certificates/${id}/revoke`,
    GET_USER_CERTIFICATES: (userId: number | string) => `/api/Certificates/Certificate/${userId}`,
    LIST: '/api/Certificates/list',
  },

  // Course endpoints
  COURSE: {
    LIST: '/api/Course/list',
    GET_BY_ID: (id: number | string) => `/api/Course/${id}`,
    CREATE: '/api/Course/create',
    UPDATE: (id: number | string) => `/api/Course/update/${id}`,
    GET_BY_CATEGORY: (categoryId: number | string) => `/api/Course/category/${categoryId}`,
    UPLOAD_VIDEO: (courseId: number | string) => `/api/Course/${courseId}/upload-video`,
    GET_VIDEOS: (courseId: number | string) => `/api/Course/${courseId}/videos`,
    UPLOAD_DOCUMENT: (courseId: number | string) => `/api/Course/${courseId}/upload-doc`,
    GET_DOCUMENTS: (courseId: number | string) => `/api/Course/${courseId}/documents`,
    DELETE_DOCUMENT: (docId: number | string) => `/api/Course/document/${docId}`,
    GET_ENROLLMENTS: (courseId: number | string) => `/api/Course/${courseId}/enrollments`,
  },

  // Course Video endpoints
  COURSE_VIDEO: {
    LIST_BY_COURSE: (courseId: number | string) => `/api/CourseVideo/list/${courseId}`,
    GET_BY_ID: (id: number | string) => `/api/CourseVideo/${id}`,
    CREATE: '/api/CourseVideo/create',
    UPDATE: (id: number | string) => `/api/CourseVideo/update/${id}`,
    DELETE: (id: number | string) => `/api/CourseVideo/delete/${id}`,
  },

  // Crypto/File endpoints
  CRYPTO: {
    UPLOAD_FILE: '/api/Crypto/upload-file',
    DOWNLOAD: (fileName: string) => `/api/Crypto/download/${fileName}`,
    STREAM: (fileName: string) => `/api/Crypto/stream/${fileName}`,
  },

  // Permission endpoints
  PERMISSION: {
    LIST: '/api/Permission/list',
    GET_BY_ID: (id: number | string) => `/api/Permission/${id}`,
    CREATE: '/api/Permission/create',
    UPDATE: (id: number | string) => `/api/Permission/update/${id}`,
    DELETE: (id: number | string) => `/api/Permission/delete/${id}`,
  },

  // Reports endpoints
  REPORTS: {
    COURSE_REPORT: (userId: number | string, courseId: number | string) => `/api/reports/course/${userId}/${courseId}`,
  },

  // Role endpoints
  ROLE: {
    LIST: '/api/Role/list',
    GET_BY_ID: (id: number | string) => `/api/Role/${id}`,
    CREATE: '/api/Role/create',
    UPDATE: (id: number | string) => `/api/Role/update/${id}`,
    DELETE: (id: number | string) => `/api/Role/delete/${id}`,
    ROLE_PERMISSION_LIST: '/api/Role/RolePermissionlist',
  },

  // User endpoints
  USER: {
    LIST: '/api/User/UserList',
  },

  // User Course endpoints
  USER_COURSE: {
    SUBSCRIBE: '/api/UserCourse/subscribe',
    UNSUBSCRIBE: '/api/UserCourse/unsubscribe',
    MY_COURSES: '/api/UserCourse/my-courses',
    SUBSCRIBED_LIST: '/api/UserCourse/Subscribed-List',
    CHECK_SUBSCRIPTION: (courseId: number | string) => `/api/UserCourse/check/${courseId}`,
  },

  // User Role endpoints
  USER_ROLE: {
    ASSIGN: '/api/UserRole/assign',
    REMOVE: '/api/UserRole/remove',
    GET_USER_ROLES: (userId: number | string) => `/api/UserRole/${userId}`,
  },
} as const;

// Legacy export for backward compatibility
export const apiEndPoints = {
  AUTH: {
    LOGIN: API.AUTH.LOGIN,
    FORGOT: API.AUTH.FORGOT_PASSWORD,
    RESET_PASSWORD: API.AUTH.RESET_PASSWORD,
    REGISTER: API.AUTH.REGISTER,
    REFRESH: '/api/token/refresh/',
    LOGOUT: '/api/logout/',
  },
};

export default API;
