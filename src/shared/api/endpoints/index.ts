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

  // User Permissions & RBAC endpoints
  USER_PERMISSIONS: {
    // Modules
    MODULES_ALL: '/api/modules/list',
    MODULES: '/api/user-permissions/modules',
    MODULE_BY_ID: (id: number | string) => `/api/user-permissions/modules/${id}`,
    ASSIGN_MODULE_PERMISSIONS: '/api/user-permissions/modules/assign-permissions',

    // Permissions
    PERMISSIONS: '/api/permissions/list',

    // Roles
    ROLES: '/api/Roles/list',
    ROLE_CREATE: '/api/Roles/create',
    ROLE_UPDATE: (id: number | string) => `/api/Roles/update/${id}`,
    ROLE_DELETE: (id: number | string) => `/api/Roles/delete/${id}`,
    ROLE_BY_ID: (id: number | string) => `/api/user-permissions/roles/${id}`,

    // Role Modules (Mapping)
    ROLE_MODULES_ALL: '/api/RoleModules/list',
    ROLE_MODULES: '/api/RoleModules/list',
    ROLE_MODULES_BY_ROLE: (roleId: number | string) => `/api/RoleModules/role/${roleId}`,
    ROLE_MODULE_BY_ID: (id: number | string) => `/api/RoleModules/${id}`,
    ROLE_MODULE_CREATE: '/api/RoleModules/create',
    ROLE_MODULE_DELETE: (id: number | string) => `/api/RoleModules/delete/${id}`,

// Module listing
    MODULE_PERMISSIONS_LIST: '/api/role-module-permissions/list',
    MODULE_PERMISSIONS_LIST_BY_ID: (id: number | string) => `/api/role-module-permissions/${id}`,


    // Role Module Permissions
    ROLE_MODULE_PERMISSIONS_LIST: '/api/role-module-permissions/list',
    ROLE_MODULE_PERMISSIONS_BY_ID: (id: number | string) => `/api/role-module-permissions/${id}`,
    ROLE_MODULE_PERMISSIONS_BY_ROLE_MODULE: (roleId: number | string, moduleId: number | string) =>
      `/api/user-permissions/role-module/${roleId}/${moduleId}/permissions`,

    // User Permissions Assignments
    ASSIGN_ROLE: '/api/user-permissions/assign-role',
    ASSIGN_PERMISSIONS: '/api/user-permissions/assign-permissions',
    USER_PERMISSIONS: (userId: number | string) => `/api/user-permissions/user/${userId}`,
    USER_ROLES: (userId: number | string) => `/api/user-permissions/user/${userId}/roles`,
    USER_ROLES_LIST: '/api/user-permissions/user-roles/list',
    CHECK_PERMISSION: (userId: number | string, moduleCode: string, permissionCode: string) =>
      `/api/user-permissions/user/${userId}/check/${moduleCode}/${permissionCode}`,
    REMOVE_USER_ROLE: (userId: number | string, roleId: number | string) =>
      `/api/user-permissions/user/${userId}/role/${roleId}`,
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
    CREATE: (id: number | string) => `/api/Course/${id}/upload-video`,
    UPDATE: (id: number | string) => `/api/CourseVideo/update/${id}`,
    DELETE: (id: number | string) => `/api/CourseVideo/delete/${id}`,
  },

  // Crypto/File endpoints
  CRYPTO: {
    UPLOAD_FILE: '/api/Crypto/upload-file',
    DOWNLOAD: (fileName: string) => `/api/Crypto/download/${fileName}`,
    STREAM: (fileName: string) => `/api/Crypto/stream/${fileName}`,
  },

  // Reports endpoints
  REPORTS: {
    COURSE_REPORT: (userId: number | string, courseId: number | string) => `/api/reports/course/${userId}/${courseId}`,
  },

  // User endpoints
  USER: {
    LIST: '/api/User/userlist',
    GET_BY_ID: (id: number | string) => `/api/User/${id}`,
  },

  // User Course endpoints
  USER_COURSE: {
    SUBSCRIBE: '/api/UserCourse/subscribe',
    UNSUBSCRIBE: '/api/UserCourse/unsubscribe',
    MY_COURSES: '/api/UserCourse/my-courses',
    SUBSCRIBED_LIST: '/api/UserCourse/Subscribed-List',
    CHECK_SUBSCRIPTION: (courseId: number | string) => `/api/UserCourse/check/${courseId}`,
  },

  // Organization (Tenant) endpoints
  ORGANIZATION: {
    LIST: '/api/Organization',
    GET_BY_ID: (id: number | string) => `/api/Organization/${id}`,
    CREATE: '/api/Organization',
    UPDATE: (id: number | string) => `/api/Organization/${id}`,
    DELETE: (id: number | string) => `/api/Organization/${id}`,
    REGISTER: '/api/Organization/register',
    LOGIN: '/api/Organization/login',
    PROFILE: '/api/Organization/profile',
  },

  // Groups endpoints
  GROUPS: {
    LIST: '/api/Groups/list',
    GET_BY_ID: (id: number | string) => `/api/Groups/${id}`,
    CREATE: '/api/Groups/create',
    UPDATE: (id: number | string) => `/api/Groups/update/${id}`,
    DELETE: (id: number | string) => `/api/Groups/Delete/${id}`,
    GROUP_COURSES: (groupId: number | string) => `/api/Groups/group-courses/${groupId}`,
    BULK_UPDATE_COURSES: '/api/Groups/bulk-update-courses',
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
