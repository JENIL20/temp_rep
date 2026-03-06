import { lazy, LazyExoticComponent, ComponentType } from "react";
import { paths } from "./path";

// ---------- Lazy-loaded Components ----------
const Login = lazy(() => import("../domains/auth/pages/Login"));
const Register = lazy(() => import("../domains/auth/pages/Register"));
const ForgotPassword = lazy(() => import("../domains/auth/pages/ForgetPassword"));
const ResetPassword = lazy(() => import("../domains/auth/pages/ResetPassword"));

const Dashboard = lazy(() => import("../domains/dashboard/pages/Dashboard"));
const Courses = lazy(() => import("../domains/course/pages/Courses"));
const CreateCourse = lazy(() => import("../domains/course/pages/CreateCourse"));
const CourseDetails = lazy(() => import("../domains/course/pages/CourseDetails"));
const CourseVideos = lazy(() => import("../domains/course/pages/CourseVideos"));
const AddCourseVideo = lazy(() => import("../domains/course/pages/AddCourseVideo"));
const CourseDocuments = lazy(() => import("../domains/course/pages/CourseDocuments"));
const Categories = lazy(() => import("../domains/category/pages/Categories"));
const MyCourses = lazy(() => import("../domains/course/pages/MyCourses"));
const Certificates = lazy(() => import("../domains/certificate/pages/Certificates"));

const RolesManagement = lazy(() => import("../domains/role/pages/RolesManagement"));
const RolePermissionPage = lazy(() => import("../domains/role/pages/RolePermissionPage"));
const AssignRoles = lazy(() => import("../domains/role/pages/AssignRoles"));
const AssignRoleModules = lazy(() => import("../domains/role/pages/AssignRoleModules"));
const UserPermissionPage = lazy(() => import("../domains/role/pages/UserPermissionPage"));

const Profile = lazy(() => import("../domains/user/pages/Profile"));
const UserList = lazy(() => import("../domains/user/pages/UserList"));
const Organizations = lazy(() => import("../domains/organization/pages/Organizations"));
const Groups = lazy(() => import("../domains/group/pages/Groups"));
const Unauthorized = lazy(() => import("../shared/components/common/Unauthorized"));

// ---------- Route Config Type ----------
export interface RouteConfig {
  path: string;
  name: string;
  element: LazyExoticComponent<ComponentType<any>>;
  /**
   * Module code the user must have access to.
   * Maps to the keys in UserPermissions (UPPER_SNAKE, case-insensitive).
   * Omit for public-within-auth routes (dashboard, profile, etc.)
   */
  requiredModule?: string;
  /**
   * The specific action required (view | create | update | delete).
   * Defaults to 'view' check (canView) when omitted.
   */
  requiredPermission?: string;
  /** @deprecated use requiredModule + requiredPermission instead */
  permissions?: string[];
}

// ---------- Auth Routes (no login required) ----------
export const AuthRoutes: RouteConfig[] = [
  { path: paths.auth.login, name: "Login", element: Login },
  { path: paths.auth.register, name: "Register", element: Register },
  { path: paths.auth.forgot_password, name: "Forgot Password", element: ForgotPassword },
  { path: paths.auth.reset_password, name: "Reset Password", element: ResetPassword },
];

// ---------- Protected Routes (login required) ----------
export const ProtectedRoutes: RouteConfig[] = [
  // ── Always accessible (any logged-in user) ──────────────────────────────
  {
    path: paths.web.dashboard,
    name: "Dashboard",
    element: Dashboard,
  },
  {
    path: paths.web.profile,
    name: "Profile",
    element: Profile,
  },
  {
    path: paths.web.unauthorized,
    name: "Unauthorized",
    element: Unauthorized,
  },

  // ── Courses (MODULE: COURSES) ────────────────────────────────────────────
  {
    path: paths.web.courses,
    name: "Courses",
    element: Courses,
    requiredModule: "COURSES",
    requiredPermission: "view",
  },
  {
    path: paths.web.courseDetails,
    name: "Course Details",
    element: CourseDetails,
    requiredModule: "COURSES",
    requiredPermission: "view",
  },
  {
    path: paths.web.courseCreate,
    name: "Create Course",
    element: CreateCourse,
    requiredModule: "COURSES",
    requiredPermission: "create",
  },
  {
    path: paths.web.courseEdit,
    name: "Edit Course",
    element: CreateCourse,
    requiredModule: "COURSES",
    requiredPermission: "update",
  },
  {
    path: paths.web.courseVideos,
    name: "Course Videos",
    element: CourseVideos,
    requiredModule: "COURSES",
    requiredPermission: "view",
  },
  {
    path: paths.web.courseAddVideo,
    name: "Add Course Video",
    element: AddCourseVideo,
    requiredModule: "COURSES",
    requiredPermission: "create",
  },
  {
    path: paths.web.courseEditVideo,
    name: "Edit Course Video",
    element: AddCourseVideo,
    requiredModule: "COURSES",
    requiredPermission: "update",
  },
  {
    path: paths.web.courseDocuments,
    name: "Course Documents",
    element: CourseDocuments,
    requiredModule: "COURSES",
    requiredPermission: "view",
  },
  {
    path: paths.web.myCourses,
    name: "My Courses",
    element: MyCourses,
    requiredModule: "COURSES",
    requiredPermission: "view",
  },

  // ── Categories (MODULE: CATEGORIES) ─────────────────────────────────────
  {
    path: paths.web.categories,
    name: "Categories",
    element: Categories,
    requiredModule: "CATEGORIES",
    requiredPermission: "view",
  },

  // ── Certificates (MODULE: CERTIFICATES) ─────────────────────────────────
  {
    path: paths.web.certificates,
    name: "Certificates",
    element: Certificates,
    requiredModule: "CERTIFICATES",
    requiredPermission: "view",
  },

  // ── Roles & Permissions (MODULE: ROLES) ──────────────────────────────────
  {
    path: paths.web.rolesManagement,
    name: "Roles Management",
    element: RolesManagement,
    requiredModule: "ROLES",
    requiredPermission: "view",
  },
  {
    path: paths.web.rolePermissions,
    name: "Role Permissions",
    element: RolePermissionPage,
    requiredModule: "ROLES",
    requiredPermission: "update",
  },
  {
    path: paths.web.roleModulesAssign,
    name: "Assign Role Modules",
    element: AssignRoleModules,
    requiredModule: "ROLES",
    requiredPermission: "update",
  },
  {
    path: paths.web.assignRoles,
    name: "Assign Roles",
    element: AssignRoles,
    requiredModule: "ROLES",
    requiredPermission: "update",
  },

  // ── Users (MODULE: USERS) ────────────────────────────────────────────────
  {
    path: paths.web.usersManagement,
    name: "Users Management",
    element: UserList,
    requiredModule: "USERS",
    requiredPermission: "view",
  },
  {
    path: paths.web.userPermissions,
    name: "User Permissions",
    element: UserPermissionPage,
    requiredModule: "USERS",
    requiredPermission: "update",
  },

  // ── Organizations (MODULE: ORGANIZATIONS) ────────────────────────────────
  {
    path: paths.web.organizations,
    name: "Organizations",
    element: Organizations,
    requiredModule: "ORGANIZATIONS",
    requiredPermission: "view",
  },

  // ── Groups (MODULE: GROUPS) ──────────────────────────────────────────────
  {
    path: paths.web.groups,
    name: "Groups",
    element: Groups,
    requiredModule: "GROUPS",
    requiredPermission: "view",
  },
];
