# Project Restructuring Plan: Domain-Driven Architecture (COMPLETED)

## Overview
Reorganize the project from a layer-based structure to a domain-driven structure where each domain (user, course, category, etc.) contains its own components, hooks, API calls, and types.

## New Structure

```
src/
├── domains/
│   ├── auth/
│   │   ├── api/
│   │   │   └── authApi.ts
│   │   ├── components/
│   │   │   ├── LoginForm.tsx
│   │   │   ├── RegisterForm.tsx
│   │   │   └── PasswordResetForm.tsx
│   │   ├── hooks/
│   │   │   └── useAuth.ts
│   │   ├── pages/
│   │   │   ├── Login.tsx
│   │   │   ├── Register.tsx
│   │   │   ├── ForgetPassword.tsx
│   │   │   └── ResetPassword.tsx
│   │   ├── store/
│   │   │   └── authSlice.ts
│   │   └── types/
│   │       └── auth.types.ts
│   │
│   ├── user/
│   │   ├── api/
│   │   │   └── userApi.ts
│   │   ├── components/
│   │   │   ├── UserProfile.tsx
│   │   │   └── UserAvatar.tsx
│   │   ├── hooks/
│   │   │   └── useUser.ts
│   │   ├── pages/
│   │   │   └── Profile.tsx
│   │   └── types/
│   │       └── user.types.ts
│   │
│   ├── course/
│   │   ├── api/
│   │   │   ├── courseApi.ts
│   │   │   ├── courseVideoApi.ts
│   │   │   └── courseDocumentApi.ts
│   │   ├── components/
│   │   │   ├── CourseCard.tsx
│   │   │   ├── CourseForm.tsx
│   │   │   ├── VideoUploadModal.tsx
│   │   │   └── FileUpload.tsx
│   │   ├── hooks/
│   │   │   ├── useCourse.ts
│   │   │   └── useCourseVideos.ts
│   │   ├── pages/
│   │   │   ├── Courses.tsx
│   │   │   ├── CourseDetails.tsx
│   │   │   ├── CreateCourse.tsx
│   │   │   ├── CourseVideos.tsx
│   │   │   ├── CourseDocuments.tsx
│   │   │   └── MyCourses.tsx
│   │   └── types/
│   │       └── course.types.ts
│   │
│   ├── category/
│   │   ├── api/
│   │   │   └── categoryApi.ts
│   │   ├── components/
│   │   │   └── CategoryCard.tsx
│   │   ├── hooks/
│   │   │   └── useCategory.ts
│   │   ├── pages/
│   │   │   └── Categories.tsx
│   │   └── types/
│   │       └── category.types.ts
│   │
│   ├── certificate/
│   │   ├── api/
│   │   │   └── certificateApi.ts
│   │   ├── components/
│   │   │   └── CertificateCard.tsx
│   │   ├── hooks/
│   │   │   └── useCertificate.ts
│   │   ├── pages/
│   │   │   └── Certificates.tsx
│   │   └── types/
│   │       └── certificate.types.ts
│   │
│   ├── role/
│   │   ├── api/
│   │   │   ├── roleApi.ts
│   │   │   ├── permissionApi.ts
│   │   │   └── userRoleApi.ts
│   │   ├── components/
│   │   │   └── RoleManager.tsx
│   │   ├── hooks/
│   │   │   └── useRole.ts
│   │   ├── pages/
│   │   │   └── RolesManagement.tsx
│   │   └── types/
│   │       └── role.types.ts
│   │
│   ├── enrollment/
│   │   ├── api/
│   │   │   └── userCourseApi.ts
│   │   ├── hooks/
│   │   │   └── useEnrollment.ts
│   │   └── types/
│   │       └── enrollment.types.ts
│   │
│   ├── report/
│   │   ├── api/
│   │   │   └── reportsApi.ts
│   │   ├── hooks/
│   │   │   └── useReports.ts
│   │   └── types/
│   │       └── report.types.ts
│   │
│   └── dashboard/
│       ├── components/
│       │   └── StatsCard.tsx
│       ├── hooks/
│       │   └── useDashboard.ts
│       └── pages/
│           └── Dashboard.tsx
│
├── shared/
│   ├── api/
│   │   ├── axios.ts
│   │   └── endpoints/
│   │       └── index.ts
│   ├── components/
│   │   ├── common/
│   │   │   ├── LoadingSpinner.tsx
│   │   │   ├── PageLoader.tsx
│   │   │   └── index.ts
│   │   ├── layout/
│   │   │   ├── Header.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── Wrapper.tsx
│   │   └── ui/
│   │       └── Button.tsx
│   ├── hooks/
│   │   └── usePageTitle.ts
│   ├── types/
│   │   └── common.types.ts
│   └── utils/
│       └── helpers.ts
│
├── config/
│   ├── app.config.ts
│   └── index.js
│
├── routes/
│   ├── AppRoutes.tsx
│   ├── ProtectedRoutes.tsx
│   ├── PublicRoutes.tsx
│   ├── RoleBasedRoutes.tsx
│   ├── path.ts
│   └── routes.tsx
│
├── store/
│   └── index.ts
│
├── assets/
│
├── App.tsx
├── App.css
├── main.tsx
└── index.css
```

## Migration Steps

### Phase 1: Create New Domain Structure
1. Create `src/domains/` directory
2. Create subdirectories for each domain
3. Create `src/shared/` directory for common code

### Phase 2: Move API Files
- `certificateApi.ts` → `domains/certificate/api/`
- `courseApi.ts` → `domains/course/api/`
- `permissionApi.ts` → `domains/role/api/`
- `reportsApi.ts` → `domains/report/api/`
- `roleApi.ts` → `domains/role/api/`
- `userCourseApi.ts` → `domains/enrollment/api/`
- `userRoleApi.ts` → `domains/role/api/`
- `axios.ts` → `shared/api/`
- `endpoints/` → `shared/api/endpoints/`

### Phase 3: Move Types
- `auth.types.ts` → `domains/auth/types/`
- `certificate.types.ts` → `domains/certificate/types/`
- `course.types.ts` → `domains/course/types/`
- `enrollment.types.ts` → `domains/enrollment/types/`
- `role.types.ts` → `domains/role/types/`
- `user.types.ts` → `domains/user/types/`

### Phase 4: Move Features/Pages
- `features/auth/` → `domains/auth/`
- `features/dashboard/pages/Dashboard.tsx` → `domains/dashboard/pages/`
- `features/dashboard/pages/Profile.tsx` → `domains/user/pages/`
- `features/dashboard/pages/Courses.tsx` → `domains/course/pages/`
- `features/dashboard/pages/CourseDetails.tsx` → `domains/course/pages/`
- `features/dashboard/pages/CreateCourse.tsx` → `domains/course/pages/`
- `features/dashboard/pages/CourseForm.tsx` → `domains/course/components/`
- `features/dashboard/pages/CourseVideos.tsx` → `domains/course/pages/`
- `features/dashboard/pages/CourseDocuments.tsx` → `domains/course/pages/`
- `features/dashboard/pages/MyCourses.tsx` → `domains/course/pages/`
- `features/dashboard/pages/Categories.tsx` → `domains/category/pages/`
- `features/dashboard/pages/Certificates.tsx` → `domains/certificate/pages/`
- `features/dashboard/pages/RolesManagement.tsx` → `domains/role/pages/`

### Phase 5: Move Components
- `components/FileUpload.tsx` → `domains/course/components/`
- `components/VideoUploadModal.tsx` → `domains/course/components/`
- `components/Wrapper.tsx` → `shared/components/layout/`
- `components/common/` → `shared/components/common/`
- `components/layout/` → `shared/components/layout/`

### Phase 6: Move Hooks
- `hooks/usePageTitle.ts` → `shared/hooks/`
- Create domain-specific hooks as needed

### Phase 7: Update Imports
- Update all import paths throughout the application
- Update route configurations
- Update store imports

### Phase 8: Cleanup
- Remove old `src/api/` directory
- Remove old `src/types/` directory
- Remove old `src/features/` directory
- Remove old `src/components/` directory (except what's moved to shared)
- Remove old `src/hooks/` directory

## Benefits

1. **Better Organization**: Related code is grouped together
2. **Easier Navigation**: Find all course-related code in one place
3. **Scalability**: Easy to add new domains
4. **Maintainability**: Changes to a domain are isolated
5. **Team Collaboration**: Different teams can work on different domains
6. **Code Reusability**: Shared code is clearly separated
7. **Testing**: Easier to test domain-specific logic

## Notes

- Keep `routes/`, `store/`, `config/`, and `assets/` at the root level as they are cross-cutting concerns
- `shared/` contains truly reusable code across all domains
- Each domain is self-contained with its own API, components, hooks, and types
- This structure follows Domain-Driven Design (DDD) principles
