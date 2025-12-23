# API Implementation Plan

## Overview
This document outlines the remaining API endpoints that need frontend implementation based on the `api.json` file.

## ✅ Already Implemented

### Auth
- Login (`/api/Auth/login`)
- Register (`/api/Auth/register`)
- Forgot Password (`/api/Auth/forgot-password`)
- Reset Password (`/api/Auth/reset-password`)

### Category
- List Categories (`/api/Category/list`)
- Get Category by ID (`/api/Category/{id}`)
- Create Category (`/api/Category/create`)
- Update Category (`/api/Category/update/{id}`)
- Delete Category (`/api/Category/delete/{id}`)

### Course
- List Courses (`/api/Course/list`)
- Get Course by ID (`/api/Course/{id}`)
- Create Course (`/api/Course/create`)
- Get Courses by Category (`/api/Course/categoryId`)
- Upload Video (`/api/Course/{courseId}/upload-video`)
- Get Course Videos (`/api/Course/{courseId}/videos`)
- Upload Document (`/api/Course/{courseId}/upload-doc`)
- Get Course Documents (`/api/Course/{courseId}/documents`)

### CourseVideo
- List Videos by Course (`/api/CourseVideo/list/{courseId}`)
- Get Video by ID (`/api/CourseVideo/{id}`)
- Create Video (`/api/CourseVideo/create`)
- Update Video (`/api/CourseVideo/update/{id}`)
- Delete Video (`/api/CourseVideo/delete/{id}`)

## ❌ Missing Implementation

### 1. Certificates Module
**Priority: HIGH**

#### API Endpoints:
- `POST /api/Certificates/generate` - Generate certificate
- `GET /api/Certificates/{id}/download` - Download certificate
- `GET /api/Certificates/validate/{code}` - Validate certificate
- `POST /api/Certificates/{id}/revoke` - Revoke certificate
- `GET /api/Certificates/Certificate/{userId}` - Get user certificates
- `GET /api/Certificates/list` - List all certificates

#### Frontend Components Needed:
1. **CertificatesPage.tsx** - Main certificates listing page
2. **CertificateCard.tsx** - Individual certificate display
3. **CertificateValidation.tsx** - Certificate validation page
4. **GenerateCertificate.tsx** - Certificate generation form

#### API Service:
- `src/api/certificateApi.ts`

### 2. UserCourse Module (Enrollment/Subscription)
**Priority: HIGH**

#### API Endpoints:
- `POST /api/UserCourse/subscribe` - Subscribe to course
- `POST /api/UserCourse/unsubscribe` - Unsubscribe from course
- `GET /api/UserCourse/my-courses` - Get user's enrolled courses
- `GET /api/UserCourse/Subscribed-List` - Get subscribed courses list
- `GET /api/UserCourse/check/{courseId}` - Check if user is subscribed

#### Frontend Components Needed:
1. **MyCourses.tsx** - User's enrolled courses page
2. **CourseEnrollment.tsx** - Enrollment component
3. Update **CourseDetails.tsx** - Add subscribe/unsubscribe button

#### API Service:
- `src/api/userCourseApi.ts`

### 3. Role & Permission Management
**Priority: MEDIUM**

#### API Endpoints:

**Role:**
- `POST /api/Role/create` - Create role
- `PUT /api/Role/update/{id}` - Update role
- `GET /api/Role/list` - List all roles
- `GET /api/Role/RolePermissionlist` - Get role permissions
- `GET /api/Role/{id}` - Get role by ID
- `DELETE /api/Role/delete/{id}` - Delete role

**Permission:**
- `GET /api/Permission/list` - List all permissions
- `GET /api/Permission/{id}` - Get permission by ID
- `POST /api/Permission/create` - Create permission
- `PUT /api/Permission/update/{id}` - Update permission
- `DELETE /api/Permission/delete/{id}` - Delete permission

**UserRole:**
- `POST /api/UserRole/assign` - Assign role to user
- `DELETE /api/UserRole/remove` - Remove role from user
- `GET /api/UserRole/{userId}` - Get user roles

#### Frontend Components Needed:
1. **RolesPage.tsx** - Roles management page
2. **RoleForm.tsx** - Create/Edit role form
3. **PermissionsPage.tsx** - Permissions management page
4. **UserRoleManagement.tsx** - Assign/remove roles from users

#### API Services:
- `src/api/roleApi.ts`
- `src/api/permissionApi.ts`
- `src/api/userRoleApi.ts`

### 4. Reports Module
**Priority: MEDIUM**

#### API Endpoints:
- `GET /api/reports/course/{userId}/{courseId}` - Get course report for user

#### Frontend Components Needed:
1. **CourseReports.tsx** - Course progress reports
2. **UserProgressReport.tsx** - Individual user progress

#### API Service:
- `src/api/reportsApi.ts`

### 5. Crypto/File Management
**Priority: LOW**

#### API Endpoints:
- `POST /api/Crypto/upload-file` - Upload encrypted file
- `GET /api/Crypto/download/{fileName}` - Download encrypted file
- `GET /api/Crypto/stream/{fileName}` - Stream encrypted file

#### Frontend Components Needed:
1. **FileUpload.tsx** - Secure file upload component
2. **FileManager.tsx** - File management interface

#### API Service:
- `src/api/cryptoApi.ts`

## Implementation Order

### Phase 1: Core User Features (Week 1)
1. UserCourse API & Components (Enrollment system)
2. Certificates API & Components

### Phase 2: Admin Features (Week 2)
3. Role & Permission Management
4. Reports Module

### Phase 3: Additional Features (Week 3)
5. Crypto/File Management

## Technical Requirements

### TypeScript Types
All API request/response types should be defined in:
- `src/types/certificate.types.ts`
- `src/types/enrollment.types.ts`
- `src/types/role.types.ts`
- `src/types/permission.types.ts`
- `src/types/report.types.ts`

### State Management
Use existing Redux store structure:
- Add slices for each new module
- Follow existing patterns in `src/store/`

### Routing
Add routes in `src/routes/`:
- `/certificates` - Certificates page
- `/my-courses` - User's enrolled courses
- `/admin/roles` - Role management
- `/admin/permissions` - Permission management
- `/reports` - Reports dashboard

### UI/UX Guidelines
- Follow existing design system (Navy blue & Gold theme)
- Use consistent card layouts
- Implement loading states
- Add error handling
- Include sample data fallbacks
