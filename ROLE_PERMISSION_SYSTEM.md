# Role and User Permission Management System

This document describes the newly implemented role and user permission management pages.

## Overview

The system implements a comprehensive role-based access control (RBAC) model with two dedicated pages:

1. **Role Permission Page** - Configure module permissions for a specific role
2. **User Permission Page** - Assign roles to a specific user

## Architecture

### Data Model

The permission system follows this hierarchy:
```
User → Roles → Modules → Permissions
```

- **Users** can have multiple **Roles**
- **Roles** can have permissions on multiple **Modules**
- Each **Module** has multiple **Permissions** (Read, Write, Create, Update, Delete)

### Type Definitions

Located in `src/domains/role/types/role.types.ts`:

```typescript
interface Module {
    id: number;
    code: string;
    name: string;
    isActive: boolean;
}

interface Permission {
    id: number;
    code: string;
    name: string;
    isActive: boolean;
}

interface Role {
    id: number;
    code: string;
    name: string;
    isActive: boolean;
}

interface ModulePermission {
    moduleId: number;
    moduleName: string;
    moduleCode: string;
    permissions: Permission[];
    assignedPermissionIds: number[];
}

interface RolePermissionDetail {
    roleId: number;
    roleName: string;
    roleCode: string;
    modulePermissions: ModulePermission[];
}
```

## Pages

### 1. Role Permission Page

**Route:** `/admin/roles/:roleId/permissions`

**Purpose:** Configure which permissions a role has for each module.

**Features:**
- Displays role name and code at the top
- Tab-based navigation for different modules
- Visual permission toggles with checkmarks
- Bulk save functionality for all changes
- Offline mode support with mock data

**UI Components:**
- **Header**: Shows role name, code, and back navigation
- **Module Tabs**: Horizontal tabs to switch between modules
- **Permission Grid**: 3-column grid of permission cards
- **Permission Cards**: 
  - Shows permission name and code
  - Visual indicator (green for assigned, gray for not assigned)
  - Click to toggle assignment
- **Footer**: Shows summary and save button

**Usage:**
```typescript
// Navigate to role permissions
navigate(`/admin/roles/${roleId}/permissions`);
```

### 2. User Permission Page

**Route:** `/admin/users/:userId/permissions`

**Purpose:** Assign roles to a specific user.

**Features:**
- Displays user name and email at the top
- Paginated list of all available roles
- Visual role assignment toggles
- Auto-save on toggle (changes saved immediately)
- Offline mode support with mock data

**UI Components:**
- **Header**: Shows user name, email, and back navigation
- **Info Banner**: Helpful tip about auto-save functionality
- **Roles List**: Paginated list of all roles
- **Role Cards**:
  - Shows role name, code, and status
  - Visual indicator (green for assigned, gray for not assigned)
  - Click to toggle assignment
- **Pagination**: Full pagination controls with page size selector
- **Footer**: Summary and done button

**Usage:**
```typescript
// Navigate to user permissions
navigate(`/admin/users/${userId}/permissions`);
```

## API Services

### Role Permission API

Located in `src/domains/role/api/rolePermissionApi.ts`:

```typescript
// Get all permissions for a role organized by module
rolePermissionApi.getRolePermissions(roleId: number): Promise<RolePermissionDetail>

// Update permissions for a role on a specific module
rolePermissionApi.updateModulePermissions(
    roleId: number, 
    moduleId: number, 
    permissionIds: number[]
): Promise<void>
```

### User Role API

Located in `src/domains/role/api/userRoleApi.ts`:

```typescript
// Assign a role to a user
userRoleApi.assign(data: AssignRoleRequest): Promise<void>

// Remove a role from a user
userRoleApi.remove(userId: number, roleId: number): Promise<void>

// Get all roles assigned to a user
userRoleApi.getUserRoles(userId: number): Promise<Role[]>

// List all users
userRoleApi.listUsers(params?: UserListRequest): Promise<PaginatedUserResponse>
```

## Routes Configuration

### Path Definitions

In `src/routes/path.ts`:
```typescript
paths.web.rolePermissions = "/admin/roles/:roleId/permissions"
paths.web.userPermissions = "/admin/users/:userId/permissions"
```

### Route Registration

In `src/routes/routes.tsx`:
```typescript
{
    path: paths.web.rolePermissions,
    name: "Role Permissions",
    element: RolePermissionPage,
    permissions: [],
}
{
    path: paths.web.userPermissions,
    name: "User Permissions",
    element: UserPermissionPage,
    permissions: [],
}
```

## Offline Mode

Both pages support offline mode through the `IS_OFFLINE_MODE` configuration. When enabled:

- Mock data is returned for all API calls
- Simulated delays (300ms) for realistic UX
- Console logging for debugging
- No actual API requests are made

### Mock Data

**Role Permissions:**
- 3 modules: Course Management, User Management, Reporting
- 5 permissions: Read, Write, Create, Update, Delete
- Pre-assigned permissions for demonstration

**User Roles:**
- 2 default roles: Administrator, Student
- Can be toggled on/off

## Integration Examples

### From Roles Management Page

```typescript
// Add a button to navigate to role permissions
<button onClick={() => navigate(`/admin/roles/${role.id}/permissions`)}>
    Manage Permissions
</button>
```

### From User List Page

```typescript
// Add a button to navigate to user permissions
<button onClick={() => navigate(`/admin/users/${user.id}/permissions`)}>
    Assign Roles
</button>
```

## Design Features

### Visual Design
- **Modern UI**: Gradient backgrounds, rounded corners, shadows
- **Color Coding**: 
  - Primary Navy for active states
  - Emerald Green for assigned/success states
  - Slate Gray for inactive states
- **Animations**: Smooth transitions, hover effects, scale transforms
- **Icons**: Lucide React icons for visual clarity

### UX Features
- **Loading States**: Spinner with icon while fetching data
- **Error Handling**: Toast notifications for errors
- **Success Feedback**: Toast notifications for successful operations
- **Visual Feedback**: Immediate UI updates on toggle
- **Responsive Design**: Works on mobile, tablet, and desktop

## Testing

### Manual Testing Checklist

**Role Permission Page:**
- [ ] Page loads with role information
- [ ] All modules are displayed in tabs
- [ ] Switching tabs shows correct permissions
- [ ] Toggling permissions updates UI immediately
- [ ] Save button saves all changes
- [ ] Success toast appears after save
- [ ] Back button navigates to roles page

**User Permission Page:**
- [ ] Page loads with user information
- [ ] All roles are displayed
- [ ] Pagination works correctly
- [ ] Toggling roles updates UI immediately
- [ ] Auto-save toast appears after toggle
- [ ] Page size selector works
- [ ] Back button navigates to previous page

## Future Enhancements

1. **Search & Filter**: Add search for permissions/roles
2. **Bulk Actions**: Select multiple permissions at once
3. **Permission Templates**: Save common permission sets
4. **Audit Log**: Track who changed what and when
5. **Permission Dependencies**: Some permissions require others
6. **Custom Permissions**: Allow creating custom permissions
7. **Role Hierarchy**: Parent-child role relationships
8. **Permission Inheritance**: Inherit permissions from parent roles

## Troubleshooting

### Common Issues

**Issue:** Pages show loading spinner indefinitely
- **Solution:** Check if API endpoints are configured correctly
- **Solution:** Enable offline mode for testing

**Issue:** Changes don't persist after save
- **Solution:** Check API response for errors
- **Solution:** Verify API endpoints are correct

**Issue:** Lint errors in IDE
- **Solution:** Run `npm install` to ensure all dependencies are installed
- **Solution:** Restart TypeScript server in IDE

## Files Created

1. `src/domains/role/api/rolePermissionApi.ts` - API service for role permissions
2. `src/domains/role/pages/RolePermissionPage.tsx` - Role permission management page
3. `src/domains/role/pages/UserPermissionPage.tsx` - User permission management page
4. `src/domains/role/types/role.types.ts` - Updated with new types
5. `src/routes/path.ts` - Updated with new paths
6. `src/routes/routes.tsx` - Updated with new routes

## Files Modified

1. `src/domains/role/types/role.types.ts` - Added ModulePermission and RolePermissionDetail types
2. `src/domains/role/api/permissionApi.ts` - Fixed merge conflicts
3. `src/domains/role/api/moduleApi.ts` - Fixed merge conflicts
4. `src/domains/role/api/userRoleApi.ts` - Fixed merge conflicts
5. `src/routes/path.ts` - Added new route paths
6. `src/routes/routes.tsx` - Added new route configurations
